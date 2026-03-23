import { useRef, useEffect, useState, useCallback } from 'react';
import { useEditorStore } from '@/lib/editorStore';
import { buildCanvasFilter, applyPixelAdjustments, applyVignette } from '@/lib/imageUtils';
import {
  createLiquifyMesh, applyLiquifyStroke, applyLiquifyMesh, resetMesh,
  type LiquifyMesh
} from '@/lib/liquify';
import {
  stampBrush,
  stampEraser,
  stampDodge,
  stampBurn,
  stampBlur,
  stampSharpen,
  stampSmudge,
  stampSponge,
  stampHeal,
  stampClone,
  stampHighlightRecovery,
  simulatePressureFromSpeed,
  interpolateStampPositions,
  createStrokeState,
  initSmudgeState,
  type StrokeState,
  type SmudgeState,
  type DodgeBurnRange,
} from '@/lib/brushEngine';
import { ZoomIn, ZoomOut, Maximize2, Pipette, Target } from 'lucide-react';

// ─── Tool configuration ────────────────────────────────────────────────────────

const PAINT_TOOLS = new Set([
  'brush', 'eraser', 'dodge', 'burn', 'smudge',
  'blur-tool', 'sharpen-tool', 'heal', 'clone', 'sponge',
]);

// ─── Component ────────────────────────────────────────────────────────────────

export default function PhotoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [dragOver, setDragOver] = useState(false);
  const [compareSlider, setCompareSlider] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const renderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Crop state
  const [isCropDragging, setIsCropDragging] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropRect, setCropRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Eyedropper state
  const [eyedropperPreview, setEyedropperPreview] = useState<{ x: number; y: number; color: string } | null>(null);

  // Clone source state (alt-click to set, shown as crosshair overlay)
  const cloneSourceRef = useRef<{ x: number; y: number } | null>(null);
  const [cloneSourceDisplay, setCloneSourceDisplay] = useState<{ x: number; y: number } | null>(null);
  const [isSettingCloneSource, setIsSettingCloneSource] = useState(false);

  // Stroke engine state
  const strokeStateRef = useRef<StrokeState>(createStrokeState());
  const smudgeStateRef = useRef<SmudgeState>(initSmudgeState());
  const lastTimeRef = useRef<number>(performance.now());
  const seedRef = useRef<number>(0);

  // Liquify state
  const liquifyMeshRef = useRef<LiquifyMesh | null>(null);
  const liquifyBaseImageRef = useRef<ImageData | null>(null);
  const liquifyActiveToolRef = useRef<string>('push');
  const liquifyPressureRef = useRef<number>(50);
  const [isLiquifyActive, setIsLiquifyActive] = useState(false);
  const lastLiquifyPos = useRef<{ x: number; y: number } | null>(null);

  const {
    sourceImage, adjustments, selectedFilter, zoom, setZoom,
    activeTool, layers,
    brushSize, brushColor, brushOpacity, brushHardness,
    brushFlow, brushSpacing, brushAngle, brushRoundness,
    brushBlendMode, brushPressure,
    showGrid, showRulers, showBeforeAfter, filterOpacity, setSourceImage,
    curvePoints, setSampleColor, setBrushColor,
    setActivePanel, setActiveTool,
  } = useEditorStore();

  // Dodge/burn tonal range (default midtones) — can be extended via panel
  const dodgeBurnRange = useRef<DodgeBurnRange>('midtones');

  // ─── Canvas Redraw ───────────────────────────────────────────────────────────

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
            await new Promise<void>((resolve) => {
              lImg.onload = () => {
                ctx.globalAlpha = layer.opacity / 100;
                ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;
                ctx.drawImage(lImg, 0, 0, canvas.width, canvas.height);
                ctx.globalAlpha = 1;
                ctx.globalCompositeOperation = 'source-over';
                resolve();
              };
              lImg.onerror = () => resolve();
              lImg.src = layer.data!;
            });
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

  // ─── Liquify tool/pressure events from panel ──────────────────────────────────

  useEffect(() => {
    const handleLiquifyTool = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.tool) liquifyActiveToolRef.current = detail.tool;
    };
    const handleLiquifyPressure = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail?.pressure === 'number') liquifyPressureRef.current = detail.pressure;
    };
    window.addEventListener('liquify-tool', handleLiquifyTool);
    window.addEventListener('liquify-pressure', handleLiquifyPressure);
    return () => {
      window.removeEventListener('liquify-tool', handleLiquifyTool);
      window.removeEventListener('liquify-pressure', handleLiquifyPressure);
    };
  }, []);

  // ─── Liquify event listeners ─────────────────────────────────────────────────

  useEffect(() => {
    const handleLiquifyReset = () => {
      if (liquifyMeshRef.current) resetMesh(liquifyMeshRef.current);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d', { willReadFrequently: true });
      if (canvas && ctx && liquifyBaseImageRef.current) {
        ctx.putImageData(liquifyBaseImageRef.current, 0, 0);
      }
    };
    const handleLiquifyApply = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      setSourceImage(canvas.toDataURL('image/png'));
      liquifyMeshRef.current = null;
      liquifyBaseImageRef.current = null;
      setIsLiquifyActive(false);
    };
    const handleLiquifyCancel = () => {
      handleLiquifyReset();
      liquifyMeshRef.current = null;
      liquifyBaseImageRef.current = null;
      setIsLiquifyActive(false);
    };

    window.addEventListener('liquify-reset', handleLiquifyReset);
    window.addEventListener('liquify-apply', handleLiquifyApply);
    window.addEventListener('liquify-cancel', handleLiquifyCancel);
    return () => {
      window.removeEventListener('liquify-reset', handleLiquifyReset);
      window.removeEventListener('liquify-apply', handleLiquifyApply);
      window.removeEventListener('liquify-cancel', handleLiquifyCancel);
    };
  }, [setSourceImage]);

  useEffect(() => {
    if (activeTool === 'liquify') {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d', { willReadFrequently: true });
      if (canvas && ctx && !liquifyMeshRef.current) {
        liquifyBaseImageRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
        liquifyMeshRef.current = createLiquifyMesh(canvas.width, canvas.height, 32);
        setIsLiquifyActive(true);
      }
    }
  }, [activeTool]);

  // ─── Coordinate helpers ──────────────────────────────────────────────────────

  function getCanvasPos(e: React.MouseEvent<HTMLCanvasElement | HTMLDivElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function getDisplayPos(e: React.MouseEvent<HTMLCanvasElement | HTMLDivElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function samplePixelColor(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    const pos = getCanvasPos(e);
    const pixel = ctx.getImageData(Math.round(pos.x), Math.round(pos.y), 1, 1).data;
    const r = pixel[0], g = pixel[1], b = pixel[2];
    return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
  }

  // ─── Brush stamp dispatcher ───────────────────────────────────────────────────

  function applyBrushStamp(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    pressure: number
  ) {
    const size = brushPressure ? brushSize * pressure : brushSize;
    const hardness = brushHardness ?? 80;
    const opacity = brushOpacity;
    const flow = brushFlow ?? 100;
    const effectivePressure = brushPressure ? pressure : 1.0;
    const seed = seedRef.current++;

    // Map blend mode from store to canvas blend mode
    const blendModeMap: Record<string, GlobalCompositeOperation> = {
      normal: 'source-over',
      multiply: 'multiply',
      screen: 'screen',
      overlay: 'overlay',
      darken: 'darken',
      lighten: 'lighten',
      'color-dodge': 'color-dodge',
      'color-burn': 'color-burn',
      'hard-light': 'hard-light',
      'soft-light': 'soft-light',
      difference: 'difference',
      exclusion: 'exclusion',
      hue: 'hue',
      saturation: 'saturation',
      color: 'color',
      luminosity: 'luminosity',
    };
    const blendMode: GlobalCompositeOperation = blendModeMap[brushBlendMode] ?? 'source-over';

    switch (activeTool) {
      case 'brush':
        stampBrush(ctx, x, y, {
          size,
          hardness,
          opacity: opacity * (flow / 100),
          color: brushColor,
          blendMode,
          angle: brushAngle ?? 0,
          roundness: brushRoundness ?? 100,
        }, effectivePressure, seed);
        break;

      case 'eraser':
        stampEraser(ctx, x, y, size, hardness, opacity, pressure);
        break;

      case 'dodge':
        stampDodge(ctx, x, y, size, hardness, opacity, dodgeBurnRange.current, pressure);
        break;

      case 'burn':
        stampBurn(ctx, x, y, size, hardness, opacity, dodgeBurnRange.current, pressure);
        break;

      case 'blur-tool':
        stampBlur(ctx, x, y, size, hardness, opacity, pressure);
        break;

      case 'sharpen-tool':
        stampSharpen(ctx, x, y, size, hardness, opacity, pressure);
        break;

      case 'smudge': {
        const newState = stampSmudge(ctx, x, y, size, hardness, opacity, smudgeStateRef.current, pressure);
        smudgeStateRef.current = newState;
        break;
      }

      case 'sponge':
        stampSponge(ctx, x, y, size, hardness, opacity, false, pressure);
        break;

      case 'heal': {
        const src = cloneSourceRef.current;
        if (src) {
          stampHeal(ctx, x, y, src.x, src.y, size, hardness, opacity, pressure);
        }
        break;
      }

      case 'clone': {
        const src = cloneSourceRef.current;
        if (src) {
          stampClone(ctx, x, y, src.x, src.y, size, hardness, opacity, pressure);
        }
        break;
      }

      default:
        break;
    }
  }

  // ─── Mouse Down ──────────────────────────────────────────────────────────────

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    // Alt+click sets clone source
    if ((activeTool === 'clone' || activeTool === 'heal') && e.altKey) {
      const pos = getCanvasPos(e);
      cloneSourceRef.current = pos;
      const dpos = getDisplayPos(e);
      setCloneSourceDisplay(dpos);
      setIsSettingCloneSource(true);
      return;
    }

    if (activeTool === 'eyedropper') {
      const color = samplePixelColor(e);
      if (color) {
        setSampleColor(color);
        setBrushColor(color);
        setActivePanel('brush-panel');
        setEyedropperPreview(null);
      }
      return;
    }

    if (activeTool === 'crop') {
      const pos = getCanvasPos(e);
      setCropStart(pos);
      setCropRect(null);
      setIsCropDragging(true);
      return;
    }

    if (activeTool === 'liquify') {
      lastLiquifyPos.current = getCanvasPos(e);
      return;
    }

    if (activeTool === 'magic-wand') {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d', { willReadFrequently: true });
      if (!canvas || !ctx) return;
      const pos = getCanvasPos(e);
      const px = Math.round(pos.x), py = Math.round(pos.y);
      if (px < 0 || px >= canvas.width || py < 0 || py >= canvas.height) return;
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const idx = (py * canvas.width + px) * 4;
      const seedR = data[idx], seedG = data[idx + 1], seedB = data[idx + 2];
      const tolerance = 30;
      const visited = new Uint8Array(canvas.width * canvas.height);
      const stack = [px, py];
      while (stack.length > 0) {
        const cy2 = stack.pop()!;
        const cx2 = stack.pop()!;
        if (cx2 < 0 || cx2 >= canvas.width || cy2 < 0 || cy2 >= canvas.height) continue;
        const si = cy2 * canvas.width + cx2;
        if (visited[si]) continue;
        visited[si] = 1;
        const di = si * 4;
        const dr = Math.abs(data[di] - seedR);
        const dg = Math.abs(data[di + 1] - seedG);
        const db = Math.abs(data[di + 2] - seedB);
        if (dr + dg + db > tolerance * 3) continue;
        data[di] = Math.min(255, data[di] + 40);
        data[di + 2] = Math.min(255, data[di + 2] + 80);
        stack.push(cx2 + 1, cy2, cx2 - 1, cy2, cx2, cy2 + 1, cx2, cy2 - 1);
      }
      ctx.putImageData(imgData, 0, 0);
      return;
    }

    if (!PAINT_TOOLS.has(activeTool)) return;

    setIsPainting(true);

    const pos = getCanvasPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    // Reset stroke state for new stroke
    strokeStateRef.current = {
      ...createStrokeState(),
      lastX: pos.x,
      lastY: pos.y,
      lastTime: performance.now(),
    };
    smudgeStateRef.current = initSmudgeState();
    lastTimeRef.current = performance.now();

    // First stamp at click point
    applyBrushStamp(ctx, pos.x, pos.y, 1.0);
    strokeStateRef.current.lastX = pos.x;
    strokeStateRef.current.lastY = pos.y;
    strokeStateRef.current.isFirstPoint = false;
  }

  // ─── Mouse Move ───────────────────────────────────────────────────────────────

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (activeTool === 'eyedropper') {
      const color = samplePixelColor(e);
      const dpos = getDisplayPos(e);
      if (color) setEyedropperPreview({ x: dpos.x, y: dpos.y, color });
      return;
    }

    if (activeTool === 'crop' && isCropDragging && cropStart) {
      const pos = getCanvasPos(e);
      setCropRect({
        x: Math.min(cropStart.x, pos.x),
        y: Math.min(cropStart.y, pos.y),
        w: Math.abs(pos.x - cropStart.x),
        h: Math.abs(pos.y - cropStart.y),
      });
      return;
    }

    if (
      activeTool === 'liquify' &&
      lastLiquifyPos.current &&
      liquifyMeshRef.current &&
      liquifyBaseImageRef.current
    ) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d', { willReadFrequently: true });
      if (!canvas || !ctx) return;
      const pos = getCanvasPos(e);
      const last = lastLiquifyPos.current;
      const dx = pos.x - last.x;
      const dy = pos.y - last.y;

      applyLiquifyStroke(
        liquifyMeshRef.current,
        pos.x, pos.y, dx, dy,
        brushSize,
        liquifyPressureRef.current,
        liquifyActiveToolRef.current as any
      );

      const srcData = new ImageData(
        new Uint8ClampedArray(liquifyBaseImageRef.current.data),
        liquifyBaseImageRef.current.width,
        liquifyBaseImageRef.current.height
      );
      const dstData = ctx.createImageData(canvas.width, canvas.height);
      applyLiquifyMesh(srcData, dstData, liquifyMeshRef.current);
      ctx.putImageData(dstData, 0, 0);

      lastLiquifyPos.current = pos;
      return;
    }

    if (!isPainting) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    const pos = getCanvasPos(e);
    const state = strokeStateRef.current;
    const now = performance.now();
    const dt = Math.max(1, now - lastTimeRef.current);
    lastTimeRef.current = now;

    const dx = pos.x - state.lastX;
    const dy = pos.y - state.lastY;

    // Simulate pressure from mouse speed
    const pressure = simulatePressureFromSpeed(dx, dy, dt);

    // Spacing: professional brushes stamp at regular intervals along the path
    const spacingPct = brushSpacing ?? 25;
    const spacing = Math.max(1, brushSize * (spacingPct / 100));

    const { points, newRemainder } = interpolateStampPositions(
      state.lastX, state.lastY,
      pos.x, pos.y,
      spacing,
      state.remainder
    );

    for (const pt of points) {
      applyBrushStamp(ctx, pt.x, pt.y, pressure);
    }

    strokeStateRef.current = {
      ...state,
      lastX: pos.x,
      lastY: pos.y,
      lastTime: now,
      remainder: newRemainder,
      isFirstPoint: false,
    };
  }

  // ─── Mouse Up ────────────────────────────────────────────────────────────────

  function handleMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    if (isSettingCloneSource) {
      setIsSettingCloneSource(false);
      return;
    }
    if (activeTool === 'crop' && isCropDragging && cropRect && cropRect.w > 20 && cropRect.h > 20) {
      setIsCropDragging(false);
      applyCrop();
      return;
    }
    if (activeTool === 'liquify') {
      lastLiquifyPos.current = null;
      return;
    }
    setIsCropDragging(false);
    setIsPainting(false);
    smudgeStateRef.current = initSmudgeState();
  }

  // ─── Crop ────────────────────────────────────────────────────────────────────

  function applyCrop() {
    if (!cropRect) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const { x, y, w, h } = cropRect;
    const imageData = ctx.getImageData(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = Math.round(w);
    tmpCanvas.height = Math.round(h);
    const tmpCtx = tmpCanvas.getContext('2d');
    if (!tmpCtx) return;
    tmpCtx.putImageData(imageData, 0, 0);
    setSourceImage(tmpCanvas.toDataURL('image/png'));
    setCropRect(null);
  }

  // ─── Mouse Leave ─────────────────────────────────────────────────────────────

  function handleMouseLeave(e: React.MouseEvent<HTMLCanvasElement>) {
    setIsPainting(false);
    smudgeStateRef.current = initSmudgeState();
    setEyedropperPreview(null);
  }

  // ─── Drop / Wheel ─────────────────────────────────────────────────────────────

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

  // ─── Cursor ───────────────────────────────────────────────────────────────────

  const getCursor = () => {
    if ((activeTool === 'clone' || activeTool === 'heal') && !cloneSourceRef.current) {
      return 'cell'; // hint to alt-click
    }
    switch (activeTool) {
      case 'brush': case 'eraser': case 'dodge': case 'burn': case 'clone':
      case 'heal': case 'smudge': case 'blur-tool': case 'sharpen-tool':
      case 'sponge': return 'crosshair';
      case 'hand': return 'grab';
      case 'eyedropper': return 'none';
      case 'lasso': case 'crop': return 'crosshair';
      default: return 'default';
    }
  };

  const displayScale = zoom / 100;

  // ─── Render ───────────────────────────────────────────────────────────────────

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
                    style={{
                      width: (canvasRef.current?.getBoundingClientRect().width || 0) + 'px',
                      objectFit: 'cover',
                      objectPosition: 'left',
                    }}
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
                  onMouseLeave={handleMouseLeave}
                />

                {/* Clone / heal source indicator */}
                {(activeTool === 'clone' || activeTool === 'heal') && cloneSourceDisplay && (
                  <div
                    className="absolute pointer-events-none z-40"
                    style={{ left: cloneSourceDisplay.x, top: cloneSourceDisplay.y, transform: 'translate(-50%,-50%)' }}
                  >
                    <Target size={20} className="text-violet-400 drop-shadow-lg" />
                  </div>
                )}

                {/* Clone / heal tip overlay (when no source set) */}
                {(activeTool === 'clone' || activeTool === 'heal') && !cloneSourceRef.current && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/75 border border-violet-700/40 rounded-lg text-[11px] text-violet-300 shadow-xl pointer-events-none">
                    Alt+click to set clone source, then paint to copy
                  </div>
                )}

                {/* Crop overlay */}
                {activeTool === 'crop' && cropRect && (
                  <div
                    className="absolute border-2 border-violet-400 pointer-events-none"
                    style={{
                      left: `${(cropRect.x / (canvasRef.current?.width || 1)) * 100}%`,
                      top: `${(cropRect.y / (canvasRef.current?.height || 1)) * 100}%`,
                      width: `${(cropRect.w / (canvasRef.current?.width || 1)) * 100}%`,
                      height: `${(cropRect.h / (canvasRef.current?.height || 1)) * 100}%`,
                    }}
                  >
                    <div className="absolute inset-0">
                      <div className="absolute top-1/3 left-0 right-0 border-t border-white/20" />
                      <div className="absolute top-2/3 left-0 right-0 border-t border-white/20" />
                      <div className="absolute top-0 bottom-0 left-1/3 border-l border-white/20" />
                      <div className="absolute top-0 bottom-0 left-2/3 border-l border-white/20" />
                    </div>
                    {[
                      ['top-0 left-0', '-translate-x-1/2 -translate-y-1/2'],
                      ['top-0 right-0', 'translate-x-1/2 -translate-y-1/2'],
                      ['bottom-0 left-0', '-translate-x-1/2 translate-y-1/2'],
                      ['bottom-0 right-0', 'translate-x-1/2 translate-y-1/2'],
                    ].map(([pos, tr]) => (
                      <div key={pos} className={`absolute ${pos} w-3 h-3 bg-white rounded-full border-2 border-violet-500 transform ${tr}`} />
                    ))}
                    <div className="absolute inset-0 ring-[2000px] ring-black/50 ring-offset-0" />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black/80 rounded text-[10px] text-white whitespace-nowrap">
                      {Math.round(cropRect.w)} × {Math.round(cropRect.h)} · Release to crop
                    </div>
                  </div>
                )}

                {/* Eyedropper preview */}
                {activeTool === 'eyedropper' && eyedropperPreview && (
                  <div
                    className="absolute pointer-events-none z-50"
                    style={{ left: eyedropperPreview.x + 16, top: eyedropperPreview.y - 40 }}
                  >
                    <div className="flex items-center gap-2 bg-[hsl(222_18%_10%)] border border-[hsl(220_15%_22%)] rounded-lg px-2 py-1.5 shadow-xl">
                      <div className="w-5 h-5 rounded border border-[hsl(220_15%_25%)]" style={{ background: eyedropperPreview.color }} />
                      <span className="text-[11px] text-white font-mono">{eyedropperPreview.color.toUpperCase()}</span>
                      <Pipette size={10} className="text-gray-500" />
                    </div>
                  </div>
                )}

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
                        textShadow: layer.textStyle.shadow
                          ? `0 2px ${layer.textStyle.shadowBlur}px ${layer.textStyle.shadowColor}`
                          : undefined,
                        WebkitTextStroke: layer.textStyle.stroke
                          ? `${layer.textStyle.strokeWidth}px ${layer.textStyle.strokeColor}`
                          : undefined,
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
          <div className="flex flex-col items-center justify-center w-[820px] h-[540px] border-2 border-dashed border-[hsl(220_15%_18%)] rounded-2xl bg-[hsl(222_18%_9%)] gap-4 transition-all">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-900/50 to-fuchsia-900/50 border border-violet-700/30 flex items-center justify-center">
              <span className="text-4xl">🖼️</span>
            </div>
            <div className="text-center">
              <h3 className="text-white font-bold text-lg mb-1">Start editing</h3>
              <p className="text-gray-500 text-sm max-w-xs">Upload a photo or drag & drop an image anywhere</p>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center max-w-sm">
              {[
                'Tone Curves', 'HSL Mixing', 'Split Toning', 'Clarity & Dehaze',
                'Real Pixel Processing', 'Film Grain', 'Text Layers', 'Before/After',
                '48 Filters', '8K Export', 'Portrait AI', 'Collage Maker',
                'Sticker Library', 'Background Remover',
              ].map((feat) => (
                <span key={feat} className="px-2 py-0.5 bg-violet-900/20 border border-violet-800/20 rounded text-[10px] text-violet-400">
                  {feat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-[hsl(222_18%_10%)] border border-[hsl(220_15%_18%)] rounded-lg px-2 py-1 shadow-xl backdrop-blur-sm">
        <button onClick={() => setZoom(Math.max(10, zoom - 10))} className="p-1 text-gray-500 hover:text-white transition-all">
          <ZoomOut size={13} />
        </button>
        <button onClick={() => setZoom(100)} className="px-2 text-[11px] text-gray-300 hover:text-white font-mono transition-all min-w-[42px] text-center">
          {zoom}%
        </button>
        <button onClick={() => setZoom(Math.min(2000, zoom + 10))} className="p-1 text-gray-500 hover:text-white transition-all">
          <ZoomIn size={13} />
        </button>
        <div className="w-px h-4 bg-[hsl(220_15%_18%)] mx-0.5" />
        <button onClick={() => setZoom(100)} className="p-1 text-gray-500 hover:text-white transition-all" title="Reset Zoom">
          <Maximize2 size={13} />
        </button>
      </div>

      {/* Info overlay */}
      {sourceImage && canvasSize.w > 0 && (
        <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 border border-white/5 rounded text-[9px] text-gray-500 font-mono backdrop-blur-sm">
          {canvasSize.w} × {canvasSize.h} · {zoom}%
          {activeTool === 'crop' && cropRect && ` · Cropping ${Math.round(cropRect.w)}×${Math.round(cropRect.h)}`}
        </div>
      )}

      {/* Crop apply button */}
      {activeTool === 'crop' && cropRect && cropRect.w > 20 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
          <button
            onClick={applyCrop}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg shadow-xl transition-all"
          >
            Apply Crop
          </button>
          <button
            onClick={() => setCropRect(null)}
            className="px-4 py-2 bg-[hsl(222_18%_12%)] border border-[hsl(220_15%_20%)] text-gray-300 hover:text-white text-xs rounded-lg shadow-xl transition-all"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
