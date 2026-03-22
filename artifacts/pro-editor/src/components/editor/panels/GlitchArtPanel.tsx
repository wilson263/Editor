import { useEditorStore } from "@/lib/editorStore";
import { useState } from "react";
import { Zap } from "lucide-react";

type GlitchEffect = "rgb-shift" | "scanlines" | "pixel-sort" | "datamosh" | "vhs" | "corruption";

export default function GlitchArtPanel() {
  const { sourceImage, setSourceImage } = useEditorStore();
  const [effect, setEffect] = useState<GlitchEffect>("rgb-shift");
  const [intensity, setIntensity] = useState(30);
  const [seed, setSeed] = useState(42);
  const [isProcessing, setIsProcessing] = useState(false);

  async function applyGlitch() {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 50));

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) { setIsProcessing(false); return; }

    const W = canvas.width, H = canvas.height;
    const imageData = ctx.getImageData(0, 0, W, H);
    const data = imageData.data;
    const result = new Uint8ClampedArray(data);
    const rng = (n: number) => ((Math.sin(n * seed * 9301 + 49297) * 233280) % 1 + 1) % 1;

    if (effect === "rgb-shift") {
      const shift = Math.round(intensity * 0.5);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const idx = (y * W + x) * 4;
          const rx = Math.max(0, Math.min(W - 1, x + shift));
          const bx = Math.max(0, Math.min(W - 1, x - shift));
          result[idx] = data[(y * W + rx) * 4];
          result[idx + 1] = data[idx + 1];
          result[idx + 2] = data[(y * W + bx) * 4 + 2];
          result[idx + 3] = 255;
        }
      }
    } else if (effect === "scanlines") {
      for (let y = 0; y < H; y++) {
        const darken = y % 2 === 0 ? 1 - intensity / 200 : 1;
        for (let x = 0; x < W; x++) {
          const idx = (y * W + x) * 4;
          result[idx] = Math.round(data[idx] * darken);
          result[idx + 1] = Math.round(data[idx + 1] * darken);
          result[idx + 2] = Math.round(data[idx + 2] * darken);
          result[idx + 3] = data[idx + 3];
        }
      }
    } else if (effect === "pixel-sort") {
      const threshold = 255 - intensity * 2;
      for (let y = 0; y < H; y++) {
        const rowPixels: { r: number; g: number; b: number; lum: number }[] = [];
        for (let x = 0; x < W; x++) {
          const idx = (y * W + x) * 4;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2];
          rowPixels.push({ r, g, b, lum: 0.299 * r + 0.587 * g + 0.114 * b });
        }
        let start = -1;
        for (let x = 0; x <= W; x++) {
          const lum = x < W ? rowPixels[x].lum : -1;
          if (start === -1 && lum >= threshold) {
            start = x;
          } else if (start >= 0 && (lum < threshold || x === W)) {
            const segment = rowPixels.slice(start, x).sort((a, b) => a.lum - b.lum);
            segment.forEach((p, i) => {
              const idx = (y * W + start + i) * 4;
              result[idx] = p.r; result[idx + 1] = p.g; result[idx + 2] = p.b;
            });
            start = -1;
          }
        }
      }
    } else if (effect === "datamosh") {
      const sliceCount = Math.round(intensity * 0.5);
      for (let i = 0; i < sliceCount; i++) {
        const sliceY = Math.round(rng(i) * H);
        const sliceH = Math.round(rng(i * 2) * 20 + 5);
        const offsetX = Math.round((rng(i * 3) - 0.5) * intensity * 2);
        for (let y = sliceY; y < Math.min(H, sliceY + sliceH); y++) {
          for (let x = 0; x < W; x++) {
            const srcX = Math.max(0, Math.min(W - 1, x + offsetX));
            const dst = (y * W + x) * 4;
            const src = (y * W + srcX) * 4;
            result[dst] = data[src];
            result[dst + 1] = data[src + 1];
            result[dst + 2] = data[src + 2];
          }
        }
      }
    } else if (effect === "vhs") {
      for (let y = 0; y < H; y++) {
        const drift = Math.round(Math.sin(y * 0.05 + seed) * intensity * 0.3);
        const noise = (rng(y + seed) - 0.5) * intensity * 0.5;
        for (let x = 0; x < W; x++) {
          const srcX = Math.max(0, Math.min(W - 1, x + drift));
          const dst = (y * W + x) * 4;
          const src = (y * W + srcX) * 4;
          result[dst] = Math.max(0, Math.min(255, data[src] + noise));
          result[dst + 1] = Math.max(0, Math.min(255, data[src + 1]));
          result[dst + 2] = Math.max(0, Math.min(255, data[src + 2] + noise * 0.5));
          result[dst + 3] = data[src + 3];
        }
        if (y % 3 === 0) {
          for (let x = 0; x < W; x++) {
            const idx = (y * W + x) * 4;
            const dim = 0.8;
            result[idx] = Math.round(result[idx] * dim);
            result[idx + 1] = Math.round(result[idx + 1] * dim);
            result[idx + 2] = Math.round(result[idx + 2] * dim);
          }
        }
      }
    } else if (effect === "corruption") {
      const blockSize = Math.max(2, Math.round(intensity * 0.5));
      for (let by = 0; by < H; by += blockSize) {
        for (let bx = 0; bx < W; bx += blockSize) {
          if (rng(by * 1000 + bx) < intensity / 200) {
            const srcX = Math.round(rng(by * 1000 + bx + 1) * W);
            const srcY = Math.round(rng(by * 1000 + bx + 2) * H);
            for (let dy = 0; dy < blockSize && by + dy < H; dy++) {
              for (let dx = 0; dx < blockSize && bx + dx < W; dx++) {
                const dst = ((by + dy) * W + (bx + dx)) * 4;
                const src = ((Math.min(H - 1, srcY + dy)) * W + Math.min(W - 1, srcX + dx)) * 4;
                result[dst] = data[src];
                result[dst + 1] = data[src + 1];
                result[dst + 2] = data[src + 2];
              }
            }
          }
        }
      }
    }

    ctx.putImageData(new ImageData(result, W, H), 0, 0);
    setSourceImage(canvas.toDataURL("image/png"));
    setIsProcessing(false);
  }

  const EFFECTS: { id: GlitchEffect; label: string; desc: string; icon: string }[] = [
    { id: "rgb-shift", label: "RGB Shift", desc: "Chromatic aberration split", icon: "🔴🟢🔵" },
    { id: "scanlines", label: "Scanlines", desc: "CRT monitor effect", icon: "≡" },
    { id: "pixel-sort", label: "Pixel Sort", desc: "Luminance-based pixel sorting", icon: "↕" },
    { id: "datamosh", label: "Datamosh", desc: "Random row slice offsets", icon: "▓" },
    { id: "vhs", label: "VHS", desc: "Old tape distortion & noise", icon: "📼" },
    { id: "corruption", label: "Corruption", desc: "Random block replacement", icon: "░" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(215_20%_18%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <Zap size={13} className="text-pink-400" />
          <span className="text-xs font-bold text-white">Glitch Art</span>
          <span className="text-[8px] text-pink-500 bg-pink-900/30 px-1.5 py-0.5 rounded font-bold">CREATIVE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {!sourceImage && (
          <div className="px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-700/30 text-[10px] text-amber-400">
            Upload an image to apply glitch effects
          </div>
        )}

        <div>
          <div className="panel-section-header">EFFECT TYPE</div>
          <div className="flex flex-col gap-1 mt-2">
            {EFFECTS.map((fx) => (
              <button key={fx.id} onClick={() => setEffect(fx.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                  effect === fx.id
                    ? "bg-pink-900/30 border border-pink-700/40 text-white"
                    : "bg-[hsl(220_15%_12%)] border border-transparent text-gray-400 hover:text-white hover:bg-[hsl(220_15%_16%)]"
                }`}>
                <span className="text-base w-8 text-center shrink-0">{fx.icon}</span>
                <div>
                  <div className="text-[11px] font-semibold">{fx.label}</div>
                  <div className="text-[9px] text-gray-600">{fx.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="panel-section-header">PARAMETERS</div>
          <div className="adj-row">
            <div className="adj-row-header">
              <span className="adj-label">Intensity</span>
              <span className="adj-value">{intensity}</span>
            </div>
            <div className="relative">
              <div className="absolute inset-0 h-[3px] top-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                style={{ background: `linear-gradient(to right, hsl(330 80% 50% / 0.7) 0%, hsl(330 80% 50% / 0.7) ${intensity}%, hsl(220 15% 22%) ${intensity}%)` }} />
              <input type="range" min={1} max={100} value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="relative w-full" style={{ background: "transparent" }} />
            </div>
          </div>
          <div className="adj-row">
            <div className="adj-row-header">
              <span className="adj-label">Seed / Variation</span>
              <span className="adj-value">{seed}</span>
            </div>
            <div className="relative">
              <div className="absolute inset-0 h-[3px] top-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                style={{ background: `linear-gradient(to right, hsl(330 80% 50% / 0.7) 0%, hsl(330 80% 50% / 0.7) ${seed}%, hsl(220 15% 22%) ${seed}%)` }} />
              <input type="range" min={1} max={100} value={seed}
                onChange={(e) => setSeed(Number(e.target.value))}
                className="relative w-full" style={{ background: "transparent" }} />
            </div>
          </div>
        </div>

        <div className="text-[9px] text-gray-600 text-center bg-[hsl(220_15%_12%)] rounded-lg px-2 py-2">
          ⚠ Permanently modifies canvas. Use History (Ctrl+Z) to undo.
        </div>

        <div className="flex gap-2">
          <button onClick={() => setSeed(Math.round(Math.random() * 100))}
            className="flex-1 py-2 text-xs bg-[hsl(220_15%_16%)] text-gray-400 hover:text-white rounded-lg transition-all">
            Randomize Seed
          </button>
          <button onClick={applyGlitch} disabled={!sourceImage || isProcessing}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-bold transition-all ${
              sourceImage && !isProcessing
                ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:from-pink-500 hover:to-rose-500"
                : "bg-[hsl(220_15%_14%)] text-gray-600 cursor-not-allowed"
            }`}>
            {isProcessing
              ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <><Zap size={13} /> Apply</>}
          </button>
        </div>
      </div>
    </div>
  );
}
