import { useRef, useEffect, useState, useCallback } from "react";
import { useEditorStore } from "@/lib/editorStore";
import { buildFilterCSS, buildCanvasFilter, generateId } from "@/lib/imageUtils";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";

export default function PhotoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPainting, setIsPainting] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const {
    sourceImage, adjustments, selectedFilter, zoom, setZoom,
    activeTool, layers, brushSize, brushColor, brushOpacity, crop,
    addLayer
  } = useEditorStore();

  // Draw main image + layers onto canvas
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply filters
    ctx.filter = buildCanvasFilter(adjustments, selectedFilter);

    if (sourceImage) {
      const img = new Image();
      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.filter = buildCanvasFilter(adjustments, selectedFilter);
        ctx.drawImage(img, 0, 0);

        // Draw visible layers on top
        ctx.filter = "none";
        layers.filter((l) => l.visible).forEach((layer) => {
          if (layer.type === "image" && layer.data) {
            const lImg = new Image();
            lImg.onload = () => {
              ctx.globalAlpha = layer.opacity / 100;
              ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;
              ctx.drawImage(lImg, 0, 0, canvas.width, canvas.height);
              ctx.globalAlpha = 1;
              ctx.globalCompositeOperation = "source-over";
            };
            lImg.src = layer.data;
          }

          if (layer.type === "text" && layer.textStyle) {
            const ts = layer.textStyle;
            ctx.globalAlpha = layer.opacity / 100;
            ctx.font = `${ts.bold ? "bold " : ""}${ts.italic ? "italic " : ""}${ts.fontSize}px ${ts.fontFamily}`;
            ctx.fillStyle = ts.color;
            ctx.textAlign = ts.align;
            const x = (canvas.width * ts.x) / 100;
            const y = (canvas.height * ts.y) / 100;
            ctx.fillText(layer.text || "", x, y);
            ctx.globalAlpha = 1;
          }
        });
      };
      img.src = sourceImage;
    }
  }, [sourceImage, adjustments, selectedFilter, layers]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  function getCanvasPos(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (activeTool !== "brush" && activeTool !== "eraser") return;
    setIsPainting(true);
    const pos = getCanvasPos(e);
    lastPos.current = pos;
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isPainting) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getCanvasPos(e);
    const last = lastPos.current || pos;

    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (activeTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = brushColor;
      ctx.globalAlpha = brushOpacity / 100;
    }

    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    lastPos.current = pos;
  }

  function handleMouseUp() {
    setIsPainting(false);
    lastPos.current = null;
  }

  const displayScale = zoom / 100;

  return (
    <div ref={containerRef} className="flex-1 canvas-bg overflow-auto relative flex items-center justify-center min-h-0">
      {/* Canvas wrapper */}
      <div
        className="relative"
        style={{
          transform: `scale(${displayScale})`,
          transformOrigin: "center center",
          transition: "transform 0.15s ease",
        }}
      >
        {sourceImage ? (
          <div className="relative shadow-2xl">
            <canvas
              id="main-canvas"
              ref={canvasRef}
              className="max-w-full max-h-full"
              style={{ cursor: activeTool === "brush" || activeTool === "eraser" ? "crosshair" : "default" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            {/* Vignette overlay */}
            {adjustments.vignette !== 0 && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 ${Math.abs(adjustments.vignette) * 2}px ${Math.abs(adjustments.vignette)}px ${
                    adjustments.vignette > 0 ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.5)"
                  }`,
                }}
              />
            )}

            {/* Text layers overlay */}
            {layers.filter((l) => l.visible && l.type === "text").map((layer) => (
              layer.textStyle && (
                <div
                  key={layer.id}
                  className="absolute cursor-move select-none"
                  style={{
                    left: `${layer.textStyle.x}%`,
                    top: `${layer.textStyle.y}%`,
                    transform: "translate(-50%, -50%)",
                    fontFamily: layer.textStyle.fontFamily,
                    fontSize: layer.textStyle.fontSize,
                    color: layer.textStyle.color,
                    fontWeight: layer.textStyle.bold ? "bold" : "normal",
                    fontStyle: layer.textStyle.italic ? "italic" : "normal",
                    textDecoration: layer.textStyle.underline ? "underline" : "none",
                    textAlign: layer.textStyle.align,
                    opacity: layer.opacity / 100,
                  }}
                >
                  {layer.text}
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-[800px] h-[500px] border-2 border-dashed border-[hsl(215_20%_22%)] rounded-xl bg-[hsl(220_13%_11%)]">
            <div className="text-5xl mb-4">🖼️</div>
            <h3 className="text-white font-semibold text-lg mb-2">Start editing</h3>
            <p className="text-gray-500 text-sm text-center max-w-xs">
              Upload a photo or video using the buttons above, or drag & drop here to start editing
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
              <span>Supports JPEG, PNG, WebP, TIFF, RAW</span>
              <span>•</span>
              <span>Up to 8K resolution</span>
            </div>

            {/* Feature badges */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-sm">
              {[
                "Crop & Transform", "Color Grading", "Filters", "AI Remove BG",
                "Text & Stickers", "Layers", "HSL Curves", "8K Export"
              ].map((feat) => (
                <span
                  key={feat}
                  className="px-2 py-0.5 bg-violet-900/30 border border-violet-800/30 rounded text-[10px] text-violet-400"
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom zoom controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-[hsl(220_13%_13%)] border border-[hsl(215_20%_20%)] rounded-lg px-2 py-1 shadow-lg">
        <button onClick={() => setZoom(zoom - 10)} className="p-1 text-gray-400 hover:text-white transition-all">
          <ZoomOut size={14} />
        </button>
        <button
          onClick={() => setZoom(100)}
          className="px-2 text-xs text-gray-300 hover:text-white font-mono transition-all min-w-[40px] text-center"
        >
          {zoom}%
        </button>
        <button onClick={() => setZoom(zoom + 10)} className="p-1 text-gray-400 hover:text-white transition-all">
          <ZoomIn size={14} />
        </button>
        <div className="w-px h-4 bg-[hsl(215_20%_20%)] mx-1" />
        <button onClick={() => setZoom(100)} className="p-1 text-gray-400 hover:text-white transition-all" title="Fit">
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Resolution indicator */}
      {sourceImage && (
        <div className="absolute top-3 left-3 px-2 py-0.5 bg-[hsl(220_13%_13%)/80] border border-[hsl(215_20%_20%)] rounded text-[10px] text-gray-400 font-mono">
          Canvas · 100%
        </div>
      )}
    </div>
  );
}
