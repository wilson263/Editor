import { useRef, useEffect, useState, useCallback } from 'react';
import { useEditorStore } from '@/lib/editorStore';
import { buildCanvasFilter, applyPixelAdjustments, applyVignette } from '@/lib/imageUtils';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export default function PhotoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [dragOver, setDragOver] = useState(false);
  const [compareSlider, setCompareSlider] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const renderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    sourceImage, adjustments, selectedFilter, zoom, setZoom,
    activeTool, layers, brushSize, brushColor, brushOpacity, brushHardness,
    showGrid, showRulers, showBeforeAfter, filterOpacity, setSourceImage,
    addLayer, curvePoints, panOffset,
  } = useEditorStore();

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceImage) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.onload = async () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      setCanvasSize({ w: img.naturalWidth, h: img.naturalHeight });

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = buildCanvasFilter(adjustments, selectedFilter);
      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none';

      if (renderTimer.current) clearTimeout(renderTimer.current);
      renderTimer.current = setTimeout(async () => {
        await applyPixelAdjustments(canvas, adjustments, curvePoints);
        if (adjustments.vignette !== 0) {
          applyVignette(ctx, canvas.width, canvas.height, adjustments.vignette);
        }
        for (const layer of layers.filter((l) => l.visible)) {
          if (layer.type === 'image' && layer.data) {
            const lImg = new Image();
            lImg.onload = () => {
              ctx.globalAlpha = layer.opacity / 100;
              ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;
              ctx.drawImage(lImg, 0, 0, canvas.width, canvas.height);
              ctx.globalAlpha = 1;
              ctx.globalCompositeOperation = 'source-over';
            };
            lImg.src = layer.data;
          }
          if (layer.type === 'text' && layer.textStyle && layer.text) {
            const ts = layer.textStyle;
            ctx.globalAlpha = layer.opacity / 100;
            const weight = ts.bold ? 'bold ' : '';
            const style = ts.italic ? 'italic ' : '';
            ctx.font = style + weight + ts.fontSize + 'px "' + ts.fontFamily + '"';
            ctx.fillStyle = ts.color;
            ctx.textAlign = ts.align;
            const x = (canvas.width * ts.x) / 100;
            const y = (canvas.height * ts.y) / 100;
            if (ts.shadow) { ctx.shadowColor = ts.shadowColor; ctx.shadowBlur = ts.shadowBlur; }
            ctx.fillText(layer.text, x, y);
            if (ts.stroke) { ctx.strokeStyle = ts.strokeColor; ctx.lineWidth = ts.strokeWidth; ctx.strokeText(layer.text, x, y); }
            ctx.shadowBlur = 0; ctx.globalAlpha = 1;
          }
        }
      }, 80);
    };
    img.src = sourceImage;
  }, [sourceImage, adjustments, selectedFilter, layers, filterOpacity, showBeforeAfter, curvePoints]);

  useEffect(() => { redraw(); }, [redraw]);

  function getCanvasPos(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const paintTools = ['brush', 'eraser', 'dodge', 'burn', 'smudge', 'blur-tool', 'sharpen-tool'];
    if (!paintTools.includes(activeTool)) return;
    setIsPainting(true);
    lastPos.current = getCanvasPos(e);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isPainting) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getCanvasPos(e);
    const last = lastPos.current || pos;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else if (activeTool === 'dodge') {
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = 'rgba(255,255,200,' + ((brushOpacity / 100) * 0.3) + ')';
    } else if (activeTool === 'burn') {
      ctx.globalCompositeOperation = 'multiply';
      ctx.strokeStyle = 'rgba(0,0,0,' + ((brushOpacity / 100) * 0.3) + ')';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
      ctx.globalAlpha = brushOpacity / 100;
    }
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    lastPos.current = pos;
  }

  function handleMouseUp() { setIsPainting(false); lastPos.current = null; }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setSourceImage(ev.target?.result as string); };
    reader.readAsDataURL(file);
  }

  function handleWheel(e: React.WheelEvent) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -10 : 10;
      setZoom(Math.max(5, Math.min(3200, zoom + delta)));
    }
  }

  const getCursor = () => {
    switch (activeTool) {
      case 'brush': case 'eraser': case 'dodge': case 'burn': case 'clone':
      case 'heal': case 'smudge': case 'blur-tool': case 'sharpen-tool': return 'crosshair';
      case 'hand': return 'grab';
      case 'eyedropper': return 'cell';
      case 'lasso': case 'crop': return 'crosshair';
      default: return 'default';
    }
  };

  const displayScale = zoom / 100;

  return (
    <div
      ref={containerRef}
      className="flex-1 canvas-bg overflow-auto relative flex items-center justify-center min-h-0"
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onWheel={handleWheel}
    >
      {dragOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-violet-900/20 border-2 border-violet-500 border-dashed">
          <div className="text-violet-300 text-xl font-bold">Drop image here</div>
        </div>
      )}

      {showRulers && (
        <>
          <div className="ruler-corner" />
          <div className="ruler-h">
            <svg width="100%" height="20" className="overflow-visible">
              {Array.from({ length: 100 }, (_, i) => (
                <g key={i}>
                  {i % 10 === 0 && (
                    <>
                      <line x1={i * 20} y1="0" x2={i * 20} y2="14" stroke="hsl(220 15% 30%)" strokeWidth="1" />
                      <text x={i * 20 + 2} y="12" fontSize="7" fill="hsl(220 15% 40%)">{i * 20}</text>
                    </>
                  )}
                  {i % 10 !== 0 && (
                    <line x1={i * 20} y1="0" x2={i * 20} y2="7" stroke="hsl(220 15% 20%)" strokeWidth="0.5" />
                  )}
                </g>
              ))}
            </svg>
          </div>
          <div className="ruler-v">
            <svg width="20" height="100%" className="overflow-visible">
              {Array.from({ length: 100 }, (_, i) => (
                <g key={i}>
                  {i % 10 === 0 && (
                    <line x1="0" y1={i * 20} x2="14" y2={i * 20} stroke="hsl(220 15% 30%)" strokeWidth="1" />
                  )}
                  {i % 10 !== 0 && (
                    <line x1="0" y1={i * 20} x2="7" y2={i * 20} stroke="hsl(220 15% 20%)" strokeWidth="0.5" />
                  )}
                </g>
              ))}
            </svg>
          </div>
        </>
      )}

      <div
        className="relative"
        style={{
          transform: 'scale(' + displayScale + ')',
          transformOrigin: 'center center',
          transition: isPainting ? 'none' : 'transform 0.1s ease',
        }}
      >
        {sourceImage ? (
          <div className="relative shadow-2xl">
            {showBeforeAfter ? (
              <div
                className="relative overflow-hidden"
                style={{ cursor: isDraggingSlider ? 'col-resize' : 'default' }}
                onMouseMove={(e) => {
                  if (!isDraggingSlider) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                  setCompareSlider(pct);
                }}
                onMouseUp={() => setIsDraggingSlider(false)}
                onMouseLeave={() => setIsDraggingSlider(false)}
              >
                <canvas
                  id="main-canvas"
                  ref={canvasRef}
                  className="max-w-full block"
                  style={{ borderRadius: 4, cursor: getCursor(), maxHeight: '70vh' }}
                />
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ width: compareSlider + '%' }}
                >
                  <img
                    src={sourceImage}
                    className="absolute top-0 left-0 h-full max-w-none"
                    style={{ width: (canvasRef.current?.getBoundingClientRect().width || 0) + 'px', objectFit: 'cover', objectPosition: 'left' }}
                    alt="Before"
                  />
                </div>
                <div
                  className="absolute top-0 bottom-0 z-10 flex items-center"
                  style={{ left: compareSlider + '%', transform: 'translateX(-50%)', cursor: 'col-resize' }}
                  onMouseDown={() => setIsDraggingSlider(true)}
                >
                  <div className="w-0.5 h-full bg-white/80" />
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center gap-0.5">
                    <div className="w-0.5 h-4 bg-gray-400 rounded-full" />
                    <div className="w-0.5 h-4 bg-gray-400 rounded-full" />
                  </div>
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-black/70 rounded text-[8px] text-white font-bold whitespace-nowrap">Before</div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-violet-600/80 rounded text-[8px] text-white font-bold whitespace-nowrap">After</div>
                </div>
              </div>
            ) : (
              <>
                <canvas
                  id="main-canvas"
                  ref={canvasRef}
                  className="max-w-full max-h-full block"
                  style={{
                    cursor: getCursor(),
                    borderRadius: 4,
                    maxHeight: '80vh',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)',
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
                {showGrid && (
                  <div
                    className="absolute inset-0 pointer-events-none rounded-sm"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                      backgroundSize: '50px 50px',
                    }}
                  />
                )}
                {layers.filter((l) => l.visible && l.type === 'text').map((layer) =>
                  layer.textStyle ? (
                    <div
                      key={layer.id}
                      className="absolute cursor-move select-none"
                      style={{
                        left: layer.textStyle.x + '%',
                        top: layer.textStyle.y + '%',
                        transform: 'translate(-50%, -50%)',
                        fontFamily: layer.textStyle.fontFamily,
                        fontSize: layer.textStyle.fontSize,
                        color: layer.textStyle.color,
                        fontWeight: layer.textStyle.bold ? 'bold' : 'normal',
                        fontStyle: layer.textStyle.italic ? 'italic' : 'normal',
                        textDecoration: layer.textStyle.underline ? 'underline' : 'none',
                        letterSpacing: (layer.textStyle.letterSpacing || 0) + 'px',
                        lineHeight: layer.textStyle.lineHeight || 1.4,
                        textAlign: layer.textStyle.align,
                        opacity: layer.opacity / 100,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {layer.text}
                    </div>
                  ) : null
                )}
              </>
            )}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center w-[820px] h-[540px] border-2 border-dashed border-[hsl(220_15%_18%)] rounded-2xl bg-[hsl(222_18%_9%)] gap-4 transition-all"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-900/50 to-fuchsia-900/50 border border-violet-700/30 flex items-center justify-center">
              <span className="text-4xl">🖼️</span>
            </div>
            <div className="text-center">
              <h3 className="text-white font-bold text-lg mb-1">Start editing</h3>
              <p className="text-gray-500 text-sm max-w-xs">Upload a photo or drag & drop an image anywhere</p>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center max-w-sm">
              {['Tone Curves','HSL Color Mix','Split Toning','Clarity & Dehaze','Real Pixel Processing','Film Grain','Text Layers','Before/After','40+ Filters','8K Export'].map((feat) => (
                <span key={feat} className="px-2 py-0.5 bg-violet-900/20 border border-violet-800/20 rounded text-[10px] text-violet-400">{feat}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-[hsl(222_18%_10%)] border border-[hsl(220_15%_18%)] rounded-lg px-2 py-1 shadow-xl backdrop-blur-sm">
        <button onClick={() => setZoom(Math.max(10, zoom - 10))} className="p-1 text-gray-500 hover:text-white transition-all"><ZoomOut size={13} /></button>
        <button onClick={() => setZoom(100)} className="px-2 text-[11px] text-gray-300 hover:text-white font-mono transition-all min-w-[42px] text-center">{zoom}%</button>
        <button onClick={() => setZoom(Math.min(2000, zoom + 10))} className="p-1 text-gray-500 hover:text-white transition-all"><ZoomIn size={13} /></button>
        <div className="w-px h-4 bg-[hsl(220_15%_18%)] mx-0.5" />
        <button onClick={() => setZoom(100)} className="p-1 text-gray-500 hover:text-white transition-all" title="Reset Zoom"><Maximize2 size={13} /></button>
      </div>

      {sourceImage && canvasSize.w > 0 && (
        <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 border border-white/5 rounded text-[9px] text-gray-500 font-mono backdrop-blur-sm">
          {canvasSize.w} × {canvasSize.h} · {zoom}%
        </div>
      )}
    </div>
  );
}
