import { useEditorStore } from "@/lib/editorStore";
import { useEffect, useRef, useState, useCallback } from "react";
import { ZoomIn, ZoomOut, Maximize2, Navigation } from "lucide-react";

export default function NavigatorPanel() {
  const { sourceImage, zoom, setZoom, panOffset, setPanOffset } = useEditorStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = useState(false);
  const [viewRect, setViewRect] = useState({ x: 0, y: 0, w: 100, h: 100 });

  const ZOOM_PRESETS = [25, 50, 75, 100, 150, 200, 400, 800];

  const drawNavigator = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceImage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const W = canvas.offsetWidth || 220;
      const H = 130;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);

      const scale = Math.min(W / img.naturalWidth, H / img.naturalHeight);
      const sw = img.naturalWidth * scale;
      const sh = img.naturalHeight * scale;
      const ox = (W - sw) / 2;
      const oy = (H - sh) / 2;

      ctx.fillStyle = "hsl(222 18% 7%)";
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, ox, oy, sw, sh);

      const viewW = sw / (zoom / 100);
      const viewH = sh / (zoom / 100);
      const viewX = ox + (panOffset.x / img.naturalWidth) * sw + (sw - viewW) / 2;
      const viewY = oy + (panOffset.y / img.naturalHeight) * sh + (sh - viewH) / 2;

      ctx.strokeStyle = "rgba(139, 92, 246, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(
        Math.max(ox, viewX),
        Math.max(oy, viewY),
        Math.min(viewW, sw),
        Math.min(viewH, sh)
      );

      ctx.fillStyle = "rgba(139, 92, 246, 0.1)";
      ctx.fillRect(
        Math.max(ox, viewX),
        Math.max(oy, viewY),
        Math.min(viewW, sw),
        Math.min(viewH, sh)
      );
    };
    img.src = sourceImage;
  }, [sourceImage, zoom, panOffset]);

  useEffect(() => {
    drawNavigator();
  }, [drawNavigator]);

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || !sourceImage) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setPanOffset({ x: (x - 0.5) * 200, y: (y - 0.5) * 200 });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(215_20%_18%)] shrink-0">
        <div className="flex items-center gap-2">
          <Navigation size={13} className="text-violet-400" />
          <span className="text-xs font-bold text-white">Navigator</span>
        </div>
      </div>

      <div className="p-3 flex flex-col gap-3 overflow-y-auto flex-1">
        {/* Minimap */}
        <div className="rounded-lg overflow-hidden border border-[hsl(220_15%_18%)] bg-[hsl(222_18%_7%)]">
          {sourceImage ? (
            <canvas
              ref={canvasRef}
              className="w-full cursor-crosshair"
              style={{ height: "130px", display: "block" }}
              onClick={handleCanvasClick}
            />
          ) : (
            <div className="w-full h-32 flex items-center justify-center text-gray-700 text-xs">
              No image loaded
            </div>
          )}
        </div>

        {/* Zoom control */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Zoom Level</span>
            <span className="text-[10px] text-violet-400 font-mono">{zoom}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={1600}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-gray-600">5%</span>
            <span className="text-[9px] text-gray-600">1600%</span>
          </div>
        </div>

        {/* Zoom presets */}
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Quick Zoom</div>
          <div className="grid grid-cols-4 gap-1">
            {ZOOM_PRESETS.map((z) => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={`py-1 text-[10px] rounded-md transition-all font-mono ${
                  zoom === z
                    ? "bg-violet-600 text-white"
                    : "bg-[hsl(220_15%_14%)] text-gray-500 hover:text-white hover:bg-[hsl(220_15%_18%)]"
                }`}
              >
                {z}%
              </button>
            ))}
          </div>
        </div>

        {/* Zoom controls */}
        <div className="flex gap-2">
          <button
            onClick={() => setZoom(Math.max(5, zoom - 25))}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[hsl(220_15%_14%)] text-gray-400 hover:text-white hover:bg-[hsl(220_15%_18%)] text-xs transition-all"
          >
            <ZoomOut size={12} /> Zoom Out
          </button>
          <button
            onClick={() => setZoom(100)}
            className="px-2 py-1.5 rounded-lg bg-[hsl(220_15%_14%)] text-gray-400 hover:text-white hover:bg-[hsl(220_15%_18%)] text-xs transition-all"
            title="Fit to 100%"
          >
            <Maximize2 size={12} />
          </button>
          <button
            onClick={() => setZoom(Math.min(3200, zoom + 25))}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[hsl(220_15%_14%)] text-gray-400 hover:text-white hover:bg-[hsl(220_15%_18%)] text-xs transition-all"
          >
            <ZoomIn size={12} /> Zoom In
          </button>
        </div>

        {/* Pan reset */}
        {(panOffset.x !== 0 || panOffset.y !== 0) && (
          <button
            onClick={() => setPanOffset({ x: 0, y: 0 })}
            className="w-full py-1.5 text-xs text-gray-500 hover:text-violet-400 transition-all text-center"
          >
            Reset Pan Position
          </button>
        )}
      </div>
    </div>
  );
}
