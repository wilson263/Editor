import { useEditorStore } from "@/lib/editorStore";
import { useState } from "react";
import { ZoomIn, Zap } from "lucide-react";

type SharpenMode = "unsharp-mask" | "high-pass" | "laplacian" | "detail-enhance";

export default function SmartSharpenPanel() {
  const { sourceImage, setSourceImage } = useEditorStore();
  const [mode, setMode] = useState<SharpenMode>("unsharp-mask");
  const [amount, setAmount] = useState(80);
  const [radius, setRadius] = useState(1);
  const [threshold, setThreshold] = useState(3);
  const [luminanceOnly, setLuminanceOnly] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  async function applySharpen() {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 50));

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) { setIsProcessing(false); return; }

    const W = canvas.width, H = canvas.height;
    const original = ctx.getImageData(0, 0, W, H);
    const data = original.data;
    const result = new Uint8ClampedArray(data);
    const r = Math.max(1, radius);

    if (mode === "unsharp-mask") {
      // Step 1: Gaussian blur
      const blurred = new Uint8ClampedArray(data);
      for (let y = r; y < H - r; y++) {
        for (let x = r; x < W - r; x++) {
          let sr = 0, sg = 0, sb = 0, count = 0;
          for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
              const idx = ((y + dy) * W + (x + dx)) * 4;
              sr += data[idx]; sg += data[idx + 1]; sb += data[idx + 2];
              count++;
            }
          }
          const idx = (y * W + x) * 4;
          blurred[idx] = Math.round(sr / count);
          blurred[idx + 1] = Math.round(sg / count);
          blurred[idx + 2] = Math.round(sb / count);
        }
      }
      // Step 2: Unsharp mask
      const amtFactor = amount / 100;
      for (let i = 0; i < data.length; i += 4) {
        if (luminanceOnly) {
          const origLum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const blurLum = 0.299 * blurred[i] + 0.587 * blurred[i + 1] + 0.114 * blurred[i + 2];
          const diff = origLum - blurLum;
          if (Math.abs(diff) > threshold) {
            const factor = amtFactor * diff;
            result[i] = Math.max(0, Math.min(255, data[i] + factor));
            result[i + 1] = Math.max(0, Math.min(255, data[i + 1] + factor));
            result[i + 2] = Math.max(0, Math.min(255, data[i + 2] + factor));
          }
        } else {
          for (let c = 0; c < 3; c++) {
            const diff = data[i + c] - blurred[i + c];
            if (Math.abs(diff) > threshold) {
              result[i + c] = Math.max(0, Math.min(255, data[i + c] + diff * amtFactor));
            }
          }
        }
      }
    } else if (mode === "laplacian") {
      const kernel = [0, -1, 0, -1, 4 + amount / 25, -1, 0, -1, 0];
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const idx = (y * W + x) * 4;
          for (let c = 0; c < 3; c++) {
            let sum = 0, ki = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                sum += data[((y + dy) * W + (x + dx)) * 4 + c] * kernel[ki++];
              }
            }
            result[idx + c] = Math.max(0, Math.min(255, sum));
          }
        }
      }
    } else if (mode === "high-pass") {
      const blurred = new Uint8ClampedArray(data);
      const bigR = r * 3;
      for (let y = bigR; y < H - bigR; y++) {
        for (let x = bigR; x < W - bigR; x++) {
          let sr = 0, sg = 0, sb = 0, count = 0;
          for (let dy = -bigR; dy <= bigR; dy++) {
            for (let dx = -bigR; dx <= bigR; dx++) {
              const idx = ((y + dy) * W + (x + dx)) * 4;
              sr += data[idx]; sg += data[idx + 1]; sb += data[idx + 2];
              count++;
            }
          }
          const idx = (y * W + x) * 4;
          blurred[idx] = Math.round(sr / count);
          blurred[idx + 1] = Math.round(sg / count);
          blurred[idx + 2] = Math.round(sb / count);
        }
      }
      const amtFactor = amount / 100;
      for (let i = 0; i < data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
          const hp = data[i + c] - blurred[i + c];
          result[i + c] = Math.max(0, Math.min(255, data[i + c] + hp * amtFactor));
        }
      }
    } else if (mode === "detail-enhance") {
      // Enhance micro-contrast
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const idx = (y * W + x) * 4;
          for (let c = 0; c < 3; c++) {
            const center = data[idx + c];
            const neighbors = [
              data[((y - 1) * W + x) * 4 + c],
              data[((y + 1) * W + x) * 4 + c],
              data[(y * W + x - 1) * 4 + c],
              data[(y * W + x + 1) * 4 + c],
            ];
            const avg = neighbors.reduce((a, b) => a + b, 0) / 4;
            const detail = (center - avg) * (amount / 50);
            result[idx + c] = Math.max(0, Math.min(255, center + detail));
          }
        }
      }
    }

    ctx.putImageData(new ImageData(result, W, H), 0, 0);
    setSourceImage(canvas.toDataURL("image/png"));
    setIsProcessing(false);
  }

  function S({ label, value, min = 0, max = 100, onChange }: any) {
    const pct = ((value - min) / (max - min)) * 100;
    return (
      <div className="adj-row group">
        <div className="adj-row-header">
          <span className="adj-label">{label}</span>
          <span className="adj-value">{value}</span>
        </div>
        <div className="relative">
          <div className="absolute inset-0 h-[3px] top-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{ background: `linear-gradient(to right, hsl(258 90% 66% / 0.7) 0%, hsl(258 90% 66% / 0.7) ${pct}%, hsl(220 15% 22%) ${pct}%)` }} />
          <input type="range" min={min} max={max} value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="relative w-full" style={{ background: "transparent" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(215_20%_18%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <ZoomIn size={13} className="text-violet-400" />
          <span className="text-xs font-bold text-white">Smart Sharpen</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {!sourceImage && (
          <div className="px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-700/30 text-[10px] text-amber-400">
            Upload an image to apply sharpening
          </div>
        )}

        <div>
          <div className="panel-section-header">SHARPEN MODE</div>
          <div className="flex flex-col gap-1 mt-2">
            {[
              { id: "unsharp-mask", label: "Unsharp Mask", desc: "Classic photographic sharpening" },
              { id: "high-pass", label: "High Pass", desc: "Frequency-based edge sharpening" },
              { id: "laplacian", label: "Laplacian", desc: "Edge detection sharpening" },
              { id: "detail-enhance", label: "Detail Enhance", desc: "Micro-contrast enhancement" },
            ].map((m) => (
              <button key={m.id} onClick={() => setMode(m.id as SharpenMode)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                  mode === m.id
                    ? "bg-violet-900/30 border border-violet-700/40 text-white"
                    : "bg-[hsl(220_15%_12%)] border border-transparent text-gray-400 hover:text-white"
                }`}>
                <div className={`w-2 h-2 rounded-full shrink-0 ${mode === m.id ? "bg-violet-400" : "bg-gray-700"}`} />
                <div>
                  <div className="text-[11px] font-semibold">{m.label}</div>
                  <div className="text-[9px] text-gray-600">{m.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="panel-section-header">SETTINGS</div>
          <S label="Amount" value={amount} min={0} max={200} onChange={setAmount} />
          <S label="Radius" value={radius} min={1} max={10} onChange={setRadius} />
          {mode === "unsharp-mask" && (
            <S label="Threshold" value={threshold} min={0} max={50} onChange={setThreshold} />
          )}
          {mode === "unsharp-mask" && (
            <label className="flex items-center gap-2 px-1 cursor-pointer">
              <div
                onClick={() => setLuminanceOnly(!luminanceOnly)}
                className={`w-8 h-4 rounded-full transition-all relative cursor-pointer ${luminanceOnly ? "bg-violet-600" : "bg-[hsl(220_15%_22%)]"}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${luminanceOnly ? "left-4" : "left-0.5"}`} />
              </div>
              <span className="text-[10px] text-gray-400">Luminance only (prevents color fringing)</span>
            </label>
          )}
        </div>

        <div className="text-[9px] text-gray-600 bg-[hsl(220_15%_12%)] rounded-lg px-2 py-2">
          ⚠ Permanently modifies canvas. Use History to undo.
        </div>

        <button onClick={applySharpen} disabled={!sourceImage || isProcessing}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            sourceImage && !isProcessing
              ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500"
              : "bg-[hsl(220_15%_14%)] text-gray-600 cursor-not-allowed"
          }`}>
          {isProcessing
            ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sharpening…</>
            : <><Zap size={14} /> Apply {mode === "unsharp-mask" ? "Unsharp Mask" : mode.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</>}
        </button>
      </div>
    </div>
  );
}
