import { useEditorStore } from "@/lib/editorStore";
import { useState } from "react";
import { Layers, RotateCcw, Zap } from "lucide-react";

function NRSlider({ label, value, min = 0, max = 100, onChange }: { label: string; value: number; min?: number; max?: number; onChange: (v: number) => void }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="adj-row group">
      <div className="adj-row-header">
        <span className="adj-label">{label}</span>
        <div className="flex items-center gap-1">
          {value !== 0 && <button onClick={() => onChange(0)} className="opacity-0 group-hover:opacity-100 text-[8px] text-gray-600 hover:text-violet-400 transition-all">×</button>}
          <span className="adj-value cursor-ew-resize select-none"
            onMouseDown={(e) => {
              const startX = e.clientX, startVal = value, range = max - min;
              const mv = (me: MouseEvent) => onChange(Math.max(min, Math.min(max, startVal + Math.round(((me.clientX - startX) / 200) * range))));
              const up = () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); };
              window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up);
            }}>{value}</span>
        </div>
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

export default function NoiseReductionPanel() {
  const { adjustments, setAdjustment, sourceImage, setSourceImage } = useEditorStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [radius, setRadius] = useState(1);
  const [iterations, setIterations] = useState(1);
  const [preserveDetail, setPreserveDetail] = useState(70);

  async function applyNoiseReduction() {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    setIsProcessing(true);

    await new Promise(r => setTimeout(r, 50));

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) { setIsProcessing(false); return; }

    for (let iter = 0; iter < iterations; iter++) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const w = canvas.width, h = canvas.height;
      const output = new Uint8ClampedArray(data);
      const r = Math.max(1, radius);

      for (let y = r; y < h - r; y++) {
        for (let x = r; x < w - r; x++) {
          let sumR = 0, sumG = 0, sumB = 0, count = 0;
          const centerIdx = (y * w + x) * 4;
          const cr = data[centerIdx], cg = data[centerIdx + 1], cb = data[centerIdx + 2];

          for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
              const idx = ((y + dy) * w + (x + dx)) * 4;
              const nr = data[idx], ng = data[idx + 1], nb = data[idx + 2];
              const diff = Math.abs(nr - cr) + Math.abs(ng - cg) + Math.abs(nb - cb);
              if (diff < 80) {
                sumR += nr; sumG += ng; sumB += nb; count++;
              }
            }
          }

          if (count > 0) {
            const blend = preserveDetail / 100;
            output[centerIdx] = Math.round(blend * cr + (1 - blend) * sumR / count);
            output[centerIdx + 1] = Math.round(blend * cg + (1 - blend) * sumG / count);
            output[centerIdx + 2] = Math.round(blend * cb + (1 - blend) * sumB / count);
          }
        }
      }

      const newImageData = new ImageData(output, w, h);
      ctx.putImageData(newImageData, 0, 0);
      await new Promise(r => setTimeout(r, 10));
    }

    const newSrc = canvas.toDataURL("image/png");
    setSourceImage(newSrc);
    setIsProcessing(false);
  }

  async function applyMedianFilter() {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 50));

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) { setIsProcessing(false); return; }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = canvas.width, h = canvas.height;
    const output = new Uint8ClampedArray(data);
    const r = 1;

    for (let y = r; y < h - r; y++) {
      for (let x = r; x < w - r; x++) {
        const reds: number[] = [], greens: number[] = [], blues: number[] = [];
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            const idx = ((y + dy) * w + (x + dx)) * 4;
            reds.push(data[idx]);
            greens.push(data[idx + 1]);
            blues.push(data[idx + 2]);
          }
        }
        reds.sort((a, b) => a - b);
        greens.sort((a, b) => a - b);
        blues.sort((a, b) => a - b);
        const mid = Math.floor(reds.length / 2);
        const idx = (y * w + x) * 4;
        output[idx] = reds[mid];
        output[idx + 1] = greens[mid];
        output[idx + 2] = blues[mid];
      }
    }

    ctx.putImageData(new ImageData(output, w, h), 0, 0);
    setSourceImage(canvas.toDataURL("image/png"));
    setIsProcessing(false);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(215_20%_18%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <Layers size={13} className="text-violet-400" />
          <span className="text-xs font-bold text-white">Noise Reduction</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {!sourceImage && (
          <div className="px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-700/30 text-[10px] text-amber-400">
            Upload an image to use noise reduction
          </div>
        )}

        <div>
          <div className="panel-section-header">SLIDER CONTROLS</div>
          <div className="text-[10px] text-gray-600 mb-2">Adjust via the Detail panel → Noise Reduction</div>
          <NRSlider label="Noise Reduction" value={adjustments.noiseReduction} max={100}
            onChange={(v) => setAdjustment("noiseReduction", v)} />
          <NRSlider label="Detail" value={adjustments.noiseReductionDetail} max={100}
            onChange={(v) => setAdjustment("noiseReductionDetail", v)} />
          <NRSlider label="Color Noise" value={adjustments.colorNoiseReduction} max={100}
            onChange={(v) => setAdjustment("colorNoiseReduction", v)} />
          <NRSlider label="Color Detail" value={adjustments.colorNoiseDetail} max={100}
            onChange={(v) => setAdjustment("colorNoiseDetail", v)} />
        </div>

        <div className="h-px bg-[hsl(220_15%_16%)]" />

        <div>
          <div className="panel-section-header">PIXEL-LEVEL PROCESSING</div>
          <div className="text-[10px] text-gray-500 mb-3 leading-relaxed">
            Real pixel-averaging noise reduction. Permanently modifies canvas. Non-destructive version uses sliders above.
          </div>

          <NRSlider label="Blur Radius" value={radius} min={1} max={5} onChange={setRadius} />
          <NRSlider label="Passes" value={iterations} min={1} max={5} onChange={setIterations} />
          <NRSlider label="Preserve Detail" value={preserveDetail} min={0} max={100} onChange={setPreserveDetail} />

          <div className="flex flex-col gap-2 mt-3">
            <button
              onClick={applyNoiseReduction}
              disabled={!sourceImage || isProcessing}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                sourceImage && !isProcessing
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500"
                  : "bg-[hsl(220_15%_14%)] text-gray-600 cursor-not-allowed"
              }`}
            >
              {isProcessing ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing…</>
              ) : (
                <><Zap size={14} /> Apply Noise Reduction</>
              )}
            </button>

            <button
              onClick={applyMedianFilter}
              disabled={!sourceImage || isProcessing}
              className={`w-full py-2 rounded-xl text-xs transition-all ${
                sourceImage && !isProcessing
                  ? "bg-[hsl(220_15%_16%)] text-gray-300 hover:text-white hover:bg-[hsl(220_15%_20%)]"
                  : "bg-[hsl(220_15%_12%)] text-gray-600 cursor-not-allowed"
              }`}
            >
              Median Filter (Salt & Pepper)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
