import { useEditorStore } from "@/lib/editorStore";
import { useState, useRef } from "react";
import { Layers2, Upload, Zap } from "lucide-react";

type BlendMethod = "screen" | "multiply" | "overlay" | "add" | "lighten" | "darken";

export default function DoubleExposurePanel() {
  const { sourceImage, setSourceImage } = useEditorStore();
  const [secondImage, setSecondImage] = useState<string | null>(null);
  const [blendMode, setBlendMode] = useState<BlendMethod>("screen");
  const [opacity, setOpacity] = useState(70);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [scale, setScale] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function loadSecondImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setSecondImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function applyDoubleExposure() {
    if (!secondImage) return;
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 50));

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) { setIsProcessing(false); return; }

    const W = canvas.width, H = canvas.height;
    const base = ctx.getImageData(0, 0, W, H);
    const baseData = base.data;

    const img2 = new Image();
    await new Promise<void>(resolve => {
      img2.onload = () => resolve();
      img2.src = secondImage;
    });

    const offscreen = document.createElement("canvas");
    offscreen.width = W; offscreen.height = H;
    const oc = offscreen.getContext("2d")!;
    const scaledW = img2.naturalWidth * (scale / 100);
    const scaledH = img2.naturalHeight * (scale / 100);
    const dx = (W - scaledW) / 2 + (offsetX / 100) * W;
    const dy = (H - scaledH) / 2 + (offsetY / 100) * H;
    oc.drawImage(img2, dx, dy, scaledW, scaledH);

    const overlay = oc.getImageData(0, 0, W, H);
    const overlayData = overlay.data;
    const result = new Uint8ClampedArray(baseData);
    const alpha = opacity / 100;

    for (let i = 0; i < baseData.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const a = baseData[i + c] / 255;
        const b = overlayData[i + c] / 255;
        let blended: number;
        switch (blendMode) {
          case "screen": blended = 1 - (1 - a) * (1 - b); break;
          case "multiply": blended = a * b; break;
          case "overlay": blended = a < 0.5 ? 2 * a * b : 1 - 2 * (1 - a) * (1 - b); break;
          case "add": blended = Math.min(1, a + b); break;
          case "lighten": blended = Math.max(a, b); break;
          case "darken": blended = Math.min(a, b); break;
          default: blended = a;
        }
        result[i + c] = Math.round((blended * alpha + a * (1 - alpha)) * 255);
      }
    }

    ctx.putImageData(new ImageData(result, W, H), 0, 0);
    setSourceImage(canvas.toDataURL("image/png"));
    setIsProcessing(false);
  }

  function S({ label, value, min = -100, max = 100, onChange }: any) {
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
          <Layers2 size={13} className="text-orange-400" />
          <span className="text-xs font-bold text-white">Double Exposure</span>
          <span className="text-[8px] text-orange-500 bg-orange-900/30 px-1.5 py-0.5 rounded font-bold">ART</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {!sourceImage && (
          <div className="px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-700/30 text-[10px] text-amber-400">
            Upload a base image first
          </div>
        )}

        <div>
          <div className="panel-section-header">OVERLAY IMAGE</div>
          <input ref={fileRef} type="file" accept="image/*" onChange={loadSecondImage} className="hidden" />
          {secondImage ? (
            <div className="flex flex-col gap-2">
              <div className="w-full h-28 rounded-lg overflow-hidden border border-[hsl(220_15%_18%)] relative">
                <img src={secondImage} alt="overlay" className="w-full h-full object-cover" />
                <button
                  onClick={() => setSecondImage(null)}
                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center"
                >×</button>
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-300 transition-all text-center"
              >Replace image…</button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={!sourceImage}
              className={`w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed transition-all ${
                sourceImage
                  ? "border-[hsl(220_15%_20%)] text-gray-500 hover:border-violet-700/50 hover:text-gray-300 cursor-pointer"
                  : "border-[hsl(220_15%_15%)] text-gray-700 cursor-not-allowed"
              }`}
            >
              <Upload size={18} />
              <span className="text-xs">Upload overlay image</span>
            </button>
          )}
        </div>

        {secondImage && (
          <>
            <div>
              <div className="panel-section-header">BLEND MODE</div>
              <div className="grid grid-cols-3 gap-1 mt-1">
                {(["screen", "multiply", "overlay", "add", "lighten", "darken"] as BlendMethod[]).map((m) => (
                  <button key={m} onClick={() => setBlendMode(m)}
                    className={`py-1.5 text-[10px] capitalize rounded-lg transition-all ${
                      blendMode === m ? "bg-orange-600 text-white" : "bg-[hsl(220_15%_14%)] text-gray-500 hover:text-white"
                    }`}>{m}</button>
                ))}
              </div>
            </div>

            <div>
              <div className="panel-section-header">SETTINGS</div>
              <S label="Opacity" value={opacity} min={0} max={100} onChange={setOpacity} />
              <S label="Offset X" value={offsetX} min={-50} max={50} onChange={setOffsetX} />
              <S label="Offset Y" value={offsetY} min={-50} max={50} onChange={setOffsetY} />
              <S label="Scale" value={scale} min={10} max={300} onChange={setScale} />
            </div>

            <button onClick={applyDoubleExposure} disabled={isProcessing}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                !isProcessing
                  ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-500 hover:to-amber-500"
                  : "bg-[hsl(220_15%_14%)] text-gray-600 cursor-not-allowed"
              }`}>
              {isProcessing
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Blending…</>
                : <><Zap size={14} /> Apply Double Exposure</>}
            </button>
          </>
        )}

        <div>
          <div className="panel-section-header">TECHNIQUE GUIDE</div>
          <div className="text-[10px] text-gray-500 leading-relaxed">
            <p className="mb-2"><strong className="text-gray-400">Screen</strong> — Best for portraits over nature/sky. Lighter areas of overlay show through.</p>
            <p className="mb-2"><strong className="text-gray-400">Multiply</strong> — Darker creative blend. Good for texture overlays.</p>
            <p><strong className="text-gray-400">Overlay</strong> — High-contrast cinematic blend. Enhances both images.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
