import { useEditorStore } from "@/lib/editorStore";
import { useState } from "react";
import { Grid, Zap } from "lucide-react";

type PixelEffect = "mosaic" | "crystallize" | "halftone" | "pointillism" | "ascii-dots" | "bayer-dither";

export default function PixelatePanel() {
  const { sourceImage, setSourceImage } = useEditorStore();
  const [effect, setEffect] = useState<PixelEffect>("mosaic");
  const [size, setSize] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [colorMode, setColorMode] = useState<"color" | "mono">("color");

  async function applyEffect() {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 50));

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) { setIsProcessing(false); return; }

    const W = canvas.width, H = canvas.height;
    const imageData = ctx.getImageData(0, 0, W, H);
    const data = imageData.data;
    const s = Math.max(2, size);

    ctx.clearRect(0, 0, W, H);

    if (effect === "mosaic") {
      for (let y = 0; y < H; y += s) {
        for (let x = 0; x < W; x += s) {
          let r = 0, g = 0, b = 0, count = 0;
          for (let dy = 0; dy < s && y + dy < H; dy++) {
            for (let dx = 0; dx < s && x + dx < W; dx++) {
              const idx = ((y + dy) * W + (x + dx)) * 4;
              r += data[idx]; g += data[idx + 1]; b += data[idx + 2];
              count++;
            }
          }
          const ar = Math.round(r / count), ag = Math.round(g / count), ab = Math.round(b / count);
          if (colorMode === "mono") {
            const lum = Math.round(0.299 * ar + 0.587 * ag + 0.114 * ab);
            ctx.fillStyle = `rgb(${lum},${lum},${lum})`;
          } else {
            ctx.fillStyle = `rgb(${ar},${ag},${ab})`;
          }
          ctx.fillRect(x, y, s, s);
        }
      }
    } else if (effect === "crystallize") {
      const centers: { x: number; y: number; r: number; g: number; b: number }[] = [];
      for (let y = 0; y < H; y += s) {
        for (let x = 0; x < W; x += s) {
          centers.push({
            x: x + Math.random() * s,
            y: y + Math.random() * s,
            r: data[(Math.round(y + s / 2) * W + Math.round(x + s / 2)) * 4],
            g: data[(Math.round(y + s / 2) * W + Math.round(x + s / 2)) * 4 + 1],
            b: data[(Math.round(y + s / 2) * W + Math.round(x + s / 2)) * 4 + 2],
          });
        }
      }
      const result = new Uint8ClampedArray(data.length);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          let minDist = Infinity, nearest = centers[0];
          const approxX = Math.round(x / s), approxY = Math.round(y / s);
          const cols = Math.ceil(W / s);
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const ci = (approxY + dy) * cols + (approxX + dx);
              if (ci >= 0 && ci < centers.length) {
                const c = centers[ci];
                const dist = (x - c.x) * (x - c.x) + (y - c.y) * (y - c.y);
                if (dist < minDist) { minDist = dist; nearest = c; }
              }
            }
          }
          const idx = (y * W + x) * 4;
          result[idx] = nearest.r; result[idx + 1] = nearest.g; result[idx + 2] = nearest.b;
          result[idx + 3] = 255;
        }
      }
      ctx.putImageData(new ImageData(result, W, H), 0, 0);
    } else if (effect === "halftone") {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, W, H);
      for (let y = 0; y < H; y += s) {
        for (let x = 0; x < W; x += s) {
          const idx = (Math.min(H - 1, Math.round(y + s / 2)) * W + Math.min(W - 1, Math.round(x + s / 2))) * 4;
          const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          const radius = (1 - lum / 255) * (s / 2) * 0.9;
          if (colorMode === "color") {
            ctx.fillStyle = `rgb(${data[idx]},${data[idx + 1]},${data[idx + 2]})`;
          } else {
            ctx.fillStyle = "#000";
          }
          ctx.beginPath();
          ctx.arc(x + s / 2, y + s / 2, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (effect === "pointillism") {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, W, H);
      const points = Math.round((W * H) / (s * s));
      for (let i = 0; i < points; i++) {
        const px = Math.round(Math.random() * W);
        const py = Math.round(Math.random() * H);
        const idx = (py * W + px) * 4;
        const r = Math.min(s * 0.7, Math.max(0.5, s * 0.35));
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        if (colorMode === "color") {
          ctx.fillStyle = `rgba(${data[idx]},${data[idx + 1]},${data[idx + 2]},0.85)`;
        } else {
          const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          ctx.fillStyle = `rgba(${lum},${lum},${lum},0.85)`;
        }
        ctx.fill();
      }
    } else if (effect === "bayer-dither") {
      const bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
      const result = new Uint8ClampedArray(data.length);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const idx = (y * W + x) * 4;
          const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          const threshold = (bayer[y % 4][x % 4] / 16) * 255;
          const v = lum > threshold ? 255 : 0;
          if (colorMode === "color") {
            result[idx] = data[idx] > threshold ? 255 : 0;
            result[idx + 1] = data[idx + 1] > threshold ? 255 : 0;
            result[idx + 2] = data[idx + 2] > threshold ? 255 : 0;
          } else {
            result[idx] = result[idx + 1] = result[idx + 2] = v;
          }
          result[idx + 3] = 255;
        }
      }
      ctx.putImageData(new ImageData(result, W, H), 0, 0);
    } else if (effect === "ascii-dots") {
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, W, H);
      const chars = ["·", "·", "·", ":", ";", "+", "=", "x", "X", "#", "@"];
      ctx.font = `${s}px monospace`;
      ctx.textBaseline = "top";
      for (let y = 0; y < H; y += s) {
        for (let x = 0; x < W; x += s) {
          const idx = (Math.min(H - 1, y) * W + Math.min(W - 1, x)) * 4;
          const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          const char = chars[Math.floor((lum / 255) * (chars.length - 1))];
          if (colorMode === "color") {
            ctx.fillStyle = `rgb(${data[idx]},${data[idx + 1]},${data[idx + 2]})`;
          } else {
            ctx.fillStyle = `rgb(${Math.round(lum)},${Math.round(lum)},${Math.round(lum)})`;
          }
          ctx.fillText(char, x, y);
        }
      }
    }

    setSourceImage(canvas.toDataURL("image/png"));
    setIsProcessing(false);
  }

  const EFFECTS = [
    { id: "mosaic", label: "Mosaic", icon: "⬛", desc: "Classic pixel art look" },
    { id: "crystallize", label: "Crystallize", icon: "💎", desc: "Voronoi crystal facets" },
    { id: "halftone", label: "Halftone", icon: "⚫", desc: "Print dot screen pattern" },
    { id: "pointillism", label: "Pointillism", icon: "·", desc: "Impressionist dot painting" },
    { id: "bayer-dither", label: "Bayer Dither", icon: "▓", desc: "Ordered dithering pattern" },
    { id: "ascii-dots", label: "ASCII Art", icon: "#", desc: "Character-based rendering" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(215_20%_18%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <Grid size={13} className="text-violet-400" />
          <span className="text-xs font-bold text-white">Pixel & Art Effects</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {!sourceImage && (
          <div className="px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-700/30 text-[10px] text-amber-400">
            Upload an image first
          </div>
        )}

        <div>
          <div className="panel-section-header">EFFECT</div>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {EFFECTS.map((fx) => (
              <button key={fx.id} onClick={() => setEffect(fx.id as PixelEffect)}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-all text-left ${
                  effect === fx.id
                    ? "bg-violet-900/30 border border-violet-700/40 text-white"
                    : "bg-[hsl(220_15%_12%)] border border-transparent text-gray-400 hover:text-white"
                }`}>
                <span className="text-base w-6 text-center">{fx.icon}</span>
                <div>
                  <div className="text-[10px] font-semibold">{fx.label}</div>
                  <div className="text-[8px] text-gray-600 leading-tight">{fx.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="panel-section-header">PARAMETERS</div>
          <div className="adj-row">
            <div className="adj-row-header">
              <span className="adj-label">Pixel / Block Size</span>
              <span className="adj-value">{size}px</span>
            </div>
            <div className="relative">
              <div className="absolute inset-0 h-[3px] top-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                style={{ background: `linear-gradient(to right, hsl(258 90% 66% / 0.7) 0%, hsl(258 90% 66% / 0.7) ${((size - 2) / 48) * 100}%, hsl(220 15% 22%) ${((size - 2) / 48) * 100}%)` }} />
              <input type="range" min={2} max={50} value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="relative w-full" style={{ background: "transparent" }} />
            </div>
          </div>
        </div>

        <div>
          <div className="panel-section-header">COLOR MODE</div>
          <div className="grid grid-cols-2 gap-1">
            {["color", "mono"].map((m) => (
              <button key={m} onClick={() => setColorMode(m as any)}
                className={`py-1.5 text-[10px] capitalize rounded-lg transition-all ${
                  colorMode === m ? "bg-violet-600 text-white" : "bg-[hsl(220_15%_14%)] text-gray-500 hover:text-white"
                }`}>{m === "mono" ? "Monochrome" : "Full Color"}</button>
            ))}
          </div>
        </div>

        <div className="text-[9px] text-gray-600 bg-[hsl(220_15%_12%)] rounded-lg px-2 py-2 text-center">
          ⚠ Permanently modifies canvas. Use History to undo.
        </div>

        <button onClick={applyEffect} disabled={!sourceImage || isProcessing}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            sourceImage && !isProcessing
              ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500"
              : "bg-[hsl(220_15%_14%)] text-gray-600 cursor-not-allowed"
          }`}>
          {isProcessing
            ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing…</>
            : <><Zap size={14} /> Apply {EFFECTS.find(e => e.id === effect)?.label}</>}
        </button>
      </div>
    </div>
  );
}
