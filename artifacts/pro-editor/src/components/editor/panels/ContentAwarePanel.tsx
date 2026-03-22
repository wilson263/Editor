import { useEditorStore } from "@/lib/editorStore";
import { useState, useRef } from "react";
import { Wand2, Eraser, RotateCcw, Zap } from "lucide-react";

export default function ContentAwarePanel() {
  const { sourceImage, setSourceImage } = useEditorStore();
  const [brushSize, setBrushSize] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<"fill" | "clone" | "patch">("fill");
  const [isPainting, setIsPainting] = useState(false);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  async function applyContentAwareFill() {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;
    setIsProcessing(true);

    await new Promise(r => setTimeout(r, 100));

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx || !maskCtx) { setIsProcessing(false); return; }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const data = imageData.data;
    const mData = maskData.data;
    const w = canvas.width, h = canvas.height;

    const scaleX = canvas.width / maskCanvas.width;
    const scaleY = canvas.height / maskCanvas.height;

    for (let y = 2; y < h - 2; y++) {
      for (let x = 2; x < w - 2; x++) {
        const mx = Math.min(maskCanvas.width - 1, Math.round(x / scaleX));
        const my = Math.min(maskCanvas.height - 1, Math.round(y / scaleY));
        const mIdx = (my * maskCanvas.width + mx) * 4;

        if (mData[mIdx + 3] > 50) {
          let sumR = 0, sumG = 0, sumB = 0, count = 0;
          const radius = 8;

          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const nx = x + dx, ny = y + dy;
              if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;

              const nmx = Math.min(maskCanvas.width - 1, Math.round(nx / scaleX));
              const nmy = Math.min(maskCanvas.height - 1, Math.round(ny / scaleY));
              const nmIdx = (nmy * maskCanvas.width + nmx) * 4;

              if (mData[nmIdx + 3] < 50) {
                const nIdx = (ny * w + nx) * 4;
                sumR += data[nIdx]; sumG += data[nIdx + 1]; sumB += data[nIdx + 2];
                count++;
              }
            }
          }

          if (count > 0) {
            const idx = (y * w + x) * 4;
            data[idx] = Math.round(sumR / count);
            data[idx + 1] = Math.round(sumG / count);
            data[idx + 2] = Math.round(sumB / count);
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

    setSourceImage(canvas.toDataURL("image/png"));
    setIsProcessing(false);
  }

  function clearMask() {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
  }

  function setupMaskCanvas(container: HTMLDivElement | null) {
    if (!container || maskCanvasRef.current) return;

    const mc = document.createElement("canvas");
    mc.width = 300;
    mc.height = 200;
    mc.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;cursor:crosshair;border-radius:6px;";

    mc.addEventListener("mousedown", (e) => {
      setIsPainting(true);
      const rect = mc.getBoundingClientRect();
      lastPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    });

    mc.addEventListener("mousemove", (e) => {
      if (!isPainting) return;
      const ctx = mc.getContext("2d");
      if (!ctx) return;
      const rect = mc.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const scaleX = mc.width / rect.width;
      const scaleY = mc.height / rect.height;

      ctx.beginPath();
      if (lastPos.current) {
        ctx.moveTo(lastPos.current.x * scaleX, lastPos.current.y * scaleY);
      }
      ctx.lineTo(x * scaleX, y * scaleY);
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(139, 92, 246, 0.8)";
      ctx.stroke();
      lastPos.current = { x, y };
    });

    mc.addEventListener("mouseup", () => setIsPainting(false));
    mc.addEventListener("mouseleave", () => setIsPainting(false));

    container.appendChild(mc);
    maskCanvasRef.current = mc;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(215_20%_18%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <Wand2 size={13} className="text-violet-400" />
          <span className="text-xs font-bold text-white">Content-Aware Fill</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {!sourceImage && (
          <div className="px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-700/30 text-[10px] text-amber-400">
            Upload an image to use content-aware tools
          </div>
        )}

        {/* Mode selector */}
        <div>
          <div className="panel-section-header">MODE</div>
          <div className="grid grid-cols-3 gap-1 mt-2">
            {[
              { id: "fill", label: "Fill" },
              { id: "clone", label: "Clone" },
              { id: "patch", label: "Patch" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as any)}
                className={`py-1.5 text-[11px] rounded-lg transition-all ${
                  mode === m.id
                    ? "bg-violet-600 text-white"
                    : "bg-[hsl(220_15%_14%)] text-gray-500 hover:text-white"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Brush Size</span>
            <span className="text-[10px] text-violet-400 font-mono">{brushSize}px</span>
          </div>
          <input type="range" min={5} max={100} value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full" />
        </div>

        {/* Paint area */}
        <div>
          <div className="panel-section-header">PAINT MASK ON CANVAS</div>
          <div className="text-[10px] text-gray-500 mb-2 leading-relaxed">
            Paint over the area to remove on the main canvas using the brush tool, then click Apply below. The AI will fill it with surrounding content.
          </div>
          <div className="text-[9px] text-gray-600 bg-[hsl(220_15%_12%)] rounded-lg px-2 py-1.5">
            Tip: Use the Brush tool (B) to paint in red on canvas, then Apply Fill
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={applyContentAwareFill}
            disabled={!sourceImage || isProcessing}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              sourceImage && !isProcessing
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500"
                : "bg-[hsl(220_15%_14%)] text-gray-600 cursor-not-allowed"
            }`}
          >
            {isProcessing ? (
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Filling…</>
            ) : (
              <><Wand2 size={14} /> Apply Content-Aware Fill</>
            )}
          </button>
        </div>

        {/* Smart Remove tips */}
        <div>
          <div className="panel-section-header">HOW TO REMOVE OBJECTS</div>
          <div className="flex flex-col gap-2">
            {[
              { step: "1", text: "Select the Brush tool (B)" },
              { step: "2", text: "Paint over the object you want to remove" },
              { step: "3", text: "Click 'Apply Content-Aware Fill'" },
              { step: "4", text: "The AI fills with surrounding pixels" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-2.5 text-[10px] text-gray-500">
                <div className="w-4 h-4 rounded-full bg-violet-900/50 border border-violet-700/40 flex items-center justify-center text-[8px] text-violet-400 font-bold shrink-0 mt-0.5">
                  {item.step}
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
