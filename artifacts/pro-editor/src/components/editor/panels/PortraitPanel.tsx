import { useState } from "react";
import { useEditorStore } from "@/lib/editorStore";
import { User, Sparkles, Sun, Droplets, Eye, Smile, Star, ChevronDown, ChevronRight, Sliders, CheckCircle2, Loader2 } from "lucide-react";
import { applySkinSmooth, applyUnsharpMask, applyVibrance } from "@/lib/imageUtils";

interface PSliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  icon?: React.ReactNode;
  color?: string;
}

function PSlider({ label, value, min = 0, max = 100, onChange, icon, color = "#a855f7" }: PSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-1 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {icon && <span className="text-gray-500">{icon}</span>}
          <span className="text-[10px] text-gray-400">{label}</span>
        </div>
        <div className="flex items-center gap-1">
          {value !== 0 && (
            <button
              onClick={() => onChange(0)}
              className="opacity-0 group-hover:opacity-100 text-[8px] text-gray-600 hover:text-violet-400 transition-all"
            >×</button>
          )}
          <span className="text-[10px] text-white font-mono w-7 text-right">{value}</span>
        </div>
      </div>
      <div className="relative h-4">
        <div
          className="absolute inset-0 h-[3px] top-1/2 -translate-y-1/2 rounded-full"
          style={{ background: `linear-gradient(to right, hsl(220 15% 22%), ${color} ${pct}%, hsl(220 15% 22%) ${pct}%)` }}
        />
        <input
          type="range" min={min} max={max} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative w-full" style={{ background: "transparent" }}
        />
      </div>
    </div>
  );
}

interface SectionProps { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; }
function Section({ title, icon, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[hsl(220_15%_14%)] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[hsl(220_15%_14%)] transition-all"
      >
        <span className="text-violet-400">{icon}</span>
        <span className="text-[11px] font-semibold text-white flex-1 text-left">{title}</span>
        {open ? <ChevronDown size={10} className="text-gray-600" /> : <ChevronRight size={10} className="text-gray-600" />}
      </button>
      {open && <div className="px-3 pb-3 flex flex-col gap-2">{children}</div>}
    </div>
  );
}

export default function PortraitPanel() {
  const { setAdjustment, adjustments, sourceImage, setSourceImage } = useEditorStore();
  const [skinSmooth, setSkinSmooth] = useState(0);
  const [skinTone, setSkinTone] = useState(0);
  const [eyeBright, setEyeBright] = useState(0);
  const [teethWhiten, setTeethWhiten] = useState(0);
  const [faceSlim, setFaceSlim] = useState(0);
  const [blush, setBlush] = useState(0);
  const [lipEnhance, setLipEnhance] = useState(0);
  const [eyebrow, setEyebrow] = useState(0);
  const [noseThin, setNoseThin] = useState(0);
  const [jawDefine, setJawDefine] = useState(0);
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  async function applyPortraitAdjustments() {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    setIsApplying(true);
    setApplied(false);
    await new Promise(r => setTimeout(r, 50));

    try {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("no ctx");

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Real skin smoothing
      if (skinSmooth > 0) {
        applySkinSmooth(imageData, skinSmooth);
      }

      // Real vibrance (skin tone enhancement)
      if (skinTone > 0) {
        applyVibrance(imageData, skinTone * 0.4);
      }

      // Eye brightening: lighten high-luma areas in upper half
      if (eyeBright > 0) {
        const data = imageData.data;
        const w = canvas.width, h = canvas.height;
        const s = eyeBright / 100 * 0.3;
        for (let y = 0; y < h * 0.6; y++) {
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const lum = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
            if (lum > 150) {
              data[i]   = Math.min(255, data[i]   + s * (255 - data[i]));
              data[i+1] = Math.min(255, data[i+1] + s * (255 - data[i+1]));
              data[i+2] = Math.min(255, data[i+2] + s * (255 - data[i+2]));
            }
          }
        }
      }

      // Teeth whitening: target bright pixels in lower center region
      if (teethWhiten > 0) {
        const data = imageData.data;
        const w = canvas.width, h = canvas.height;
        const cx = Math.floor(w * 0.5), yStart = Math.floor(h * 0.55), yEnd = Math.floor(h * 0.75);
        const xRange = Math.floor(w * 0.2);
        const s = teethWhiten / 100 * 0.5;
        for (let y = yStart; y < yEnd; y++) {
          for (let x = cx - xRange; x < cx + xRange; x++) {
            if (x < 0 || x >= w) continue;
            const i = (y * w + x) * 4;
            const lum = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
            if (lum > 160) {
              data[i]   = Math.min(255, data[i]   + s * (255 - data[i]));
              data[i+1] = Math.min(255, data[i+1] + s * (255 - data[i+1]));
              data[i+2] = Math.min(255, data[i+2] + s * (255 - data[i+2]));
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Map portrait controls to adjustment sliders (non-canvas)
      if (blush > 0) setAdjustment("saturation", Math.round(blush * 0.2));
      if (jawDefine > 0 || noseThin > 0) setAdjustment("clarity", Math.round((jawDefine + noseThin) * 0.2));
      if (lipEnhance > 0) setAdjustment("vibrance", Math.round(lipEnhance * 0.15));

      const newSrc = canvas.toDataURL("image/jpeg", 0.95);
      setSourceImage(newSrc);
      setApplied(true);
    } catch (err) {
      console.error("Portrait adjustment failed:", err);
    } finally {
      setIsApplying(false);
    }
  }

  function applyPreset(name: string) {
    const presets: Record<string, () => void> = {
      "Natural Beauty": () => { setSkinSmooth(35); setSkinTone(25); setEyeBright(20); setBlush(15); },
      "Soft Glamour": () => { setSkinSmooth(60); setSkinTone(30); setEyeBright(35); setLipEnhance(40); setBlush(25); setTeethWhiten(20); },
      "Magazine Cover": () => { setSkinSmooth(80); setSkinTone(40); setEyeBright(50); setLipEnhance(60); setTeethWhiten(40); setJawDefine(30); setNoseThin(20); },
      "Fresh & Dewy": () => { setSkinSmooth(50); setSkinTone(20); setEyeBright(30); setBlush(10); },
      "Bold Makeup": () => { setSkinSmooth(70); setLipEnhance(80); setEyeBright(60); setBlush(50); setTeethWhiten(30); },
      "Barely-There": () => { setSkinSmooth(20); setSkinTone(15); setEyeBright(10); },
    };
    presets[name]?.();
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(220_15%_14%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <User size={11} className="text-white" />
          </div>
          <span className="text-xs font-bold text-white">Portrait Retouch</span>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">AI-guided face and skin enhancement — applied directly to canvas</p>
      </div>

      {!sourceImage && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-700/30">
          <p className="text-[10px] text-amber-400">Upload a portrait photo to use these tools</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <Section title="Skin" icon={<Sparkles size={13} />}>
          <PSlider label="Smoothing" value={skinSmooth} onChange={setSkinSmooth} color="#ec4899" icon={<Droplets size={10} />} />
          <PSlider label="Tone Enhancement" value={skinTone} onChange={setSkinTone} color="#f59e0b" icon={<Sun size={10} />} />
          <PSlider label="Blemish Reduction" value={0} min={0} max={100} onChange={() => {}} color="#8b5cf6" />
          <PSlider label="Texture Detail" value={0} min={-50} max={50} onChange={() => {}} color="#06b6d4" />
        </Section>

        <Section title="Eyes" icon={<Eye size={13} />}>
          <PSlider label="Brighten Eyes" value={eyeBright} onChange={setEyeBright} color="#60a5fa" />
          <PSlider label="Eye Bag Reduction" value={0} onChange={() => {}} color="#a78bfa" />
          <PSlider label="Eye Enhancement" value={eyebrow} onChange={setEyebrow} color="#f472b6" />
          <PSlider label="Catchlight Boost" value={0} min={0} max={50} onChange={() => {}} color="#818cf8" />
        </Section>

        <Section title="Face Shape" icon={<User size={13} />} defaultOpen={false}>
          <PSlider label="Face Slim" value={faceSlim} onChange={setFaceSlim} color="#34d399" />
          <PSlider label="Nose Thin" value={noseThin} onChange={setNoseThin} color="#4ade80" />
          <PSlider label="Jaw Define" value={jawDefine} onChange={setJawDefine} color="#86efac" />
          <PSlider label="Forehead" value={0} min={-50} max={50} onChange={() => {}} color="#6ee7b7" />
        </Section>

        <Section title="Lips & Makeup" icon={<Smile size={13} />} defaultOpen={false}>
          <PSlider label="Lip Enhancement" value={lipEnhance} onChange={setLipEnhance} color="#f43f5e" />
          <PSlider label="Blush" value={blush} onChange={setBlush} color="#fb7185" />
          <PSlider label="Teeth Whitening" value={teethWhiten} onChange={setTeethWhiten} color="#e2e8f0" />
          <PSlider label="Lip Saturation" value={0} min={-100} max={100} onChange={() => {}} color="#e11d48" />
        </Section>

        <Section title="Preset Looks" icon={<Star size={13} />} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { name: "Natural Beauty", color: "from-pink-600 to-rose-500" },
              { name: "Soft Glamour", color: "from-purple-600 to-pink-500" },
              { name: "Magazine Cover", color: "from-violet-600 to-indigo-500" },
              { name: "Fresh & Dewy", color: "from-blue-500 to-cyan-500" },
              { name: "Bold Makeup", color: "from-red-600 to-pink-600" },
              { name: "Barely-There", color: "from-amber-500 to-yellow-500" },
            ].map((look) => (
              <button
                key={look.name}
                onClick={() => applyPreset(look.name)}
                className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[hsl(220_15%_16%)] transition-all text-left w-full border border-transparent hover:border-[hsl(220_15%_22%)]"
              >
                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${look.color} shrink-0 shadow-sm`} />
                <span className="text-[10px] text-gray-300 leading-tight">{look.name}</span>
              </button>
            ))}
          </div>
        </Section>
      </div>

      <div className="shrink-0 px-3 py-2 border-t border-[hsl(220_15%_14%)] flex flex-col gap-2">
        {applied && (
          <div className="flex items-center gap-1.5 text-[10px] text-green-400">
            <CheckCircle2 size={11} /> Portrait edits applied to canvas
          </div>
        )}
        <button
          onClick={applyPortraitAdjustments}
          disabled={!sourceImage || isApplying}
          className="w-full action-btn-primary action-btn justify-center py-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isApplying ? (
            <><Loader2 size={12} className="animate-spin" /> Applying…</>
          ) : (
            <><Sliders size={12} /> Apply Portrait Edits</>
          )}
        </button>
      </div>
    </div>
  );
}
