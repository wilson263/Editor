import { useEditorStore } from "@/lib/editorStore";
import { useState } from "react";
import { Wind, Zap } from "lucide-react";

type BlurType = "linear" | "radial" | "zoom" | "spin";

export default function MotionBlurPanel() {
  const { sourceImage, setSourceImage } = useEditorStore();
  const [blurType, setBlurType] = useState<BlurType>("linear");
  const [amount, setAmount] = useState(15);
  const [angle, setAngle] = useState(0);
  const [centerX, setCenterX] = useState(50);
  const [centerY, setCenterY] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);

  async function applyMotionBlur() {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 50));

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) { setIsProcessing(false); return; }

    const W = canvas.width, H = canvas.height;
    const imageData = ctx.getImageData(0, 0, W, H);
    const data = imageData.data;
    const result = new Uint8ClampedArray(data.length);
    const samples = Math.max(3, Math.min(amount, 32));

    const rad = (angle * Math.PI) / 180;
    const cx = (centerX / 100) * W;
    const cy = (centerY / 100) * H;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let sr = 0, sg = 0, sb = 0, count = 0;

        for (let s = 0; s < samples; s++) {
          const t = (s / (samples - 1)) - 0.5;
          let sx: number, sy: number;

          if (blurType === "linear") {
            sx = x + Math.cos(rad) * t * amount;
            sy = y + Math.sin(rad) * t * amount;
          } else if (blurType === "radial") {
            const dx = x - cx, dy = y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const nx = dist > 0 ? dx / dist : 0;
            const ny = dist > 0 ? dy / dist : 0;
            sx = x + nx * t * amount;
            sy = y + ny * t * amount;
          } else if (blurType === "zoom") {
            const dx = x - cx, dy = y - cy;
            sx = x + dx * t * amount / 100;
            sy = y + dy * t * amount / 100;
          } else {
            const dx = x - cx, dy = y - cy;
            const a = Math.atan2(dy, dx);
            const dist = Math.sqrt(dx * dx + dy * dy);
            const da = t * amount / 500;
            sx = cx + Math.cos(a + da) * dist;
            sy = cy + Math.sin(a + da) * dist;
          }

          const nx = Math.max(0, Math.min(W - 1, Math.round(sx)));
          const ny = Math.max(0, Math.min(H - 1, Math.round(sy)));
          const idx = (ny * W + nx) * 4;
          sr += data[idx]; sg += data[idx + 1]; sb += data[idx + 2];
          count++;
        }

        const idx = (y * W + x) * 4;
        result[idx] = Math.round(sr / count);
        result[idx + 1] = Math.round(sg / count);
        result[idx + 2] = Math.round(sb / count);
        result[idx + 3] = data[idx + 3];
      }
      if (y % 100 === 0) await new Promise(r => setTimeout(r, 0));
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
          <span className="adj-value">{value}{label === "Angle" ? "°" : ""}</span>
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

  const BLUR_TYPES: { id: BlurType; label: string; desc: string; icon: string }[] = [
    { id: "linear", label: "Linear", desc: "Directional blur along angle", icon: "→" },
    { id: "radial", label: "Radial", desc: "Blur away from center point", icon: "✦" },
    { id: "zoom", label: "Zoom", desc: "Zoom/push effect from center", icon: "⊕" },
    { id: "spin", label: "Spin", desc: "Rotational spin blur", icon: "↻" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(215_20%_18%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <Wind size={13} className="text-violet-400" />
          <span className="text-xs font-bold text-white">Motion Blur</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {!sourceImage && (
          <div className="px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-700/30 text-[10px] text-amber-400">
            Upload an image to apply motion blur
          </div>
        )}

        <div>
          <div className="panel-section-header">BLUR TYPE</div>
          <div className="flex flex-col gap-1 mt-2">
            {BLUR_TYPES.map((bt) => (
              <button key={bt.id} onClick={() => setBlurType(bt.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                  blurType === bt.id
                    ? "bg-violet-900/30 border border-violet-700/40 text-white"
                    : "bg-[hsl(220_15%_12%)] border border-transparent text-gray-400 hover:text-white hover:bg-[hsl(220_15%_16%)]"
                }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold shrink-0 ${
                  blurType === bt.id ? "bg-violet-600" : "bg-[hsl(220_15%_18%)]"
                }`}>{bt.icon}</div>
                <div>
                  <div className="text-[11px] font-semibold">{bt.label}</div>
                  <div className="text-[9px] text-gray-600">{bt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="panel-section-header">SETTINGS</div>
          <S label="Amount" value={amount} min={1} max={80} onChange={setAmount} />
          {blurType === "linear" && (
            <S label="Angle" value={angle} min={0} max={360} onChange={setAngle} />
          )}
          {(blurType === "radial" || blurType === "zoom" || blurType === "spin") && (
            <>
              <S label="Center X" value={centerX} min={0} max={100} onChange={setCenterX} />
              <S label="Center Y" value={centerY} min={0} max={100} onChange={setCenterY} />
            </>
          )}
        </div>

        {/* Visual preview */}
        <div className="rounded-lg border border-[hsl(220_15%_18%)] bg-[hsl(222_18%_7%)] p-3 flex items-center justify-center">
          <div className="relative w-20 h-20 flex items-center justify-center">
            {blurType === "linear" && (
              <div className="flex flex-col gap-0.5 items-center" style={{ transform: `rotate(${angle}deg)` }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-0.5 bg-violet-500/70 rounded-full"
                    style={{ width: `${20 + Math.abs(i - 2) * 20}px`, opacity: 0.3 + (1 - Math.abs(i - 2) / 3) * 0.7 }} />
                ))}
              </div>
            )}
            {blurType === "radial" && (
              <>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="absolute h-0.5 bg-violet-500/60 rounded-full origin-left"
                    style={{ width: "36px", transform: `rotate(${i * 45}deg)`, left: "50%", top: "50%" }} />
                ))}
                <div className="w-2 h-2 rounded-full bg-violet-400 z-10" />
              </>
            )}
            {blurType === "zoom" && (
              <>
                {[8, 16, 24, 32, 40].map((s, i) => (
                  <div key={i} className="absolute rounded-full border border-violet-500/40"
                    style={{ width: s, height: s, opacity: 0.3 + i * 0.15 }} />
                ))}
                <div className="w-2 h-2 rounded-full bg-violet-400 z-10" />
              </>
            )}
            {blurType === "spin" && (
              <>
                <div className="w-16 h-16 rounded-full border-2 border-violet-500/30 border-t-violet-400" />
                <div className="absolute w-10 h-10 rounded-full border-2 border-violet-500/20 border-t-violet-400/60" />
                <div className="absolute w-2 h-2 rounded-full bg-violet-400" />
              </>
            )}
          </div>
        </div>

        <div className="text-[9px] text-gray-600 text-center">
          ⚠ This permanently modifies the canvas. Use History to undo.
        </div>

        <button onClick={applyMotionBlur} disabled={!sourceImage || isProcessing}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            sourceImage && !isProcessing
              ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500"
              : "bg-[hsl(220_15%_14%)] text-gray-600 cursor-not-allowed"
          }`}>
          {isProcessing
            ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Applying…</>
            : <><Zap size={14} /> Apply {blurType.charAt(0).toUpperCase() + blurType.slice(1)} Blur</>}
        </button>
      </div>
    </div>
  );
}
