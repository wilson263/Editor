import { useEditorStore } from "@/lib/editorStore";
import { useState } from "react";
import { Layers, Zap, RotateCcw } from "lucide-react";

export default function FrequencySeparationPanel() {
  const { sourceImage, setSourceImage } = useEditorStore();
  const [radius, setRadius] = useState(3);
  const [mode, setMode] = useState<"gaussian" | "median">("gaussian");
  const [isProcessing, setIsProcessing] = useState(false);
  const [colorSmoothing, setColorSmoothing] = useState(40);
  const [textureBoost, setTextureBoost] = useState(20);

  async function applyFrequencySeparation() {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 50));

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) { setIsProcessing(false); return; }

    const W = canvas.width, H = canvas.height;
    const original = ctx.getImageData(0, 0, W, H);
    const data = original.data;

    // Create low-frequency layer (blurred - color info)
    const lowFreq = new Uint8ClampedArray(data);
    const r = Math.max(1, radius);

    // Gaussian blur on low-freq (box blur approximation)
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

    // Apply color smoothing to low-freq layer
    const colorBlend = colorSmoothing / 100;

    // High-frequency layer = original - blurred + 128 (neutral gray offset)
    const result = new Uint8ClampedArray(data);
    for (let i = 0; i < data.length; i += 4) {
      // Low freq: blend of blurred and original color
      const lr = Math.round(blurred[i] * colorBlend + data[i] * (1 - colorBlend));
      const lg = Math.round(blurred[i + 1] * colorBlend + data[i + 1] * (1 - colorBlend));
      const lb = Math.round(blurred[i + 2] * colorBlend + data[i + 2] * (1 - colorBlend));

      // High freq: detail extracted and boosted
      const boost = 1 + textureBoost / 100;
      const hr = Math.round((data[i] - blurred[i]) * boost + 128);
      const hg = Math.round((data[i + 1] - blurred[i + 1]) * boost + 128);
      const hb = Math.round((data[i + 2] - blurred[i + 2]) * boost + 128);

      // Recombine: add high-freq texture back to low-freq color
      result[i] = Math.max(0, Math.min(255, lr + (hr - 128)));
      result[i + 1] = Math.max(0, Math.min(255, lg + (hg - 128)));
      result[i + 2] = Math.max(0, Math.min(255, lb + (hb - 128)));
    }

    ctx.putImageData(new ImageData(result, W, H), 0, 0);
    setSourceImage(canvas.toDataURL("image/png"));
    setIsProcessing(false);
  }

  async function applySkinSmoothing() {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 50));

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) { setIsProcessing(false); return; }

    const W = canvas.width, H = canvas.height;
    const imageData = ctx.getImageData(0, 0, W, H);
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);
    const r = 4;

    for (let y = r; y < H - r; y++) {
      for (let x = r; x < W - r; x++) {
        const idx = (y * W + x) * 4;
        const pr = data[idx], pg = data[idx + 1], pb = data[idx + 2];

        // Detect skin-like pixels (simplified)
        const isSkin = pr > 95 && pg > 40 && pb > 20 && pr > pg && pr > pb
          && Math.abs(pr - pg) > 15 && pr > 80;

        if (isSkin) {
          let sr = 0, sg = 0, sb = 0, count = 0;
          for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
              const nidx = ((y + dy) * W + (x + dx)) * 4;
              sr += data[nidx]; sg += data[nidx + 1]; sb += data[nidx + 2];
              count++;
            }
          }
          const blend = 0.6;
          output[idx] = Math.round(blend * (sr / count) + (1 - blend) * pr);
          output[idx + 1] = Math.round(blend * (sg / count) + (1 - blend) * pg);
          output[idx + 2] = Math.round(blend * (sb / count) + (1 - blend) * pb);
        }
      }
    }

    ctx.putImageData(new ImageData(output, W, H), 0, 0);
    setSourceImage(canvas.toDataURL("image/png"));
    setIsProcessing(false);
  }

  function Slider({ label, value, min = 0, max = 100, onChange }: any) {
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
          <Layers size={13} className="text-violet-400" />
          <span className="text-xs font-bold text-white">Frequency Separation</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {!sourceImage && (
          <div className="px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-700/30 text-[10px] text-amber-400">
            Upload an image to use frequency separation
          </div>
        )}

        <div className="text-[10px] text-gray-500 leading-relaxed bg-[hsl(220_15%_12%)] rounded-lg p-3">
          Frequency separation splits an image into low-frequency (color/tone) and high-frequency (texture/detail) layers, enabling precise retouching without affecting texture.
        </div>

        <div>
          <div className="panel-section-header">SEPARATION SETTINGS</div>
          <Slider label="Blur Radius" value={radius} min={1} max={20} onChange={setRadius} />
          <Slider label="Color Smoothing" value={colorSmoothing} min={0} max={100} onChange={setColorSmoothing} />
          <Slider label="Texture Boost" value={textureBoost} min={0} max={100} onChange={setTextureBoost} />
        </div>

        <div>
          <div className="panel-section-header">BLUR MODE</div>
          <div className="grid grid-cols-2 gap-1">
            {["gaussian", "median"].map((m) => (
              <button key={m} onClick={() => setMode(m as any)}
                className={`py-1.5 text-[10px] capitalize rounded-lg transition-all ${
                  mode === m ? "bg-violet-600 text-white" : "bg-[hsl(220_15%_14%)] text-gray-500 hover:text-white"
                }`}>{m}</button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={applyFrequencySeparation} disabled={!sourceImage || isProcessing}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              sourceImage && !isProcessing
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500"
                : "bg-[hsl(220_15%_14%)] text-gray-600 cursor-not-allowed"
            }`}>
            {isProcessing
              ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing…</>
              : <><Zap size={14} /> Apply Frequency Separation</>}
          </button>

          <button onClick={applySkinSmoothing} disabled={!sourceImage || isProcessing}
            className={`w-full py-2 rounded-xl text-xs transition-all ${
              sourceImage && !isProcessing
                ? "bg-[hsl(220_15%_16%)] text-gray-300 hover:text-white hover:bg-[hsl(220_15%_20%)]"
                : "bg-[hsl(220_15%_12%)] text-gray-600 cursor-not-allowed"
            }`}>
            Apply Skin Smoothing Only
          </button>
        </div>

        <div>
          <div className="panel-section-header">PRO RETOUCHING WORKFLOW</div>
          {[
            { step: "1", text: "Apply Frequency Separation to split texture from color" },
            { step: "2", text: "Use Healing Brush on color layer to even out skin tones" },
            { step: "3", text: "Use Clone Stamp on texture layer to blend skin texture" },
            { step: "4", text: "Combine layers for a natural, realistic result" },
          ].map(item => (
            <div key={item.step} className="flex items-start gap-2.5 text-[10px] text-gray-500 mb-2">
              <div className="w-4 h-4 rounded-full bg-violet-900/50 border border-violet-700/40 flex items-center justify-center text-[8px] text-violet-400 font-bold shrink-0 mt-0.5">{item.step}</div>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
