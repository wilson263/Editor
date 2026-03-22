import { useState } from "react";
import { useEditorStore } from "@/lib/editorStore";
import { User, Sparkles, Sun, Droplets, Eye, Smile, Star, ChevronDown, ChevronRight, Sliders } from "lucide-react";

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
          {value !== (min + max) / 2 && (
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
  const { setAdjustment, adjustments, sourceImage } = useEditorStore();

  // Local portrait-specific state (applied as adjustments)
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

  function applyPortraitAdjustments() {
    // Map portrait controls to real adjustment sliders
    if (skinSmooth > 0) setAdjustment("clarity", -Math.round(skinSmooth * 0.3));
    if (skinTone > 0) setAdjustment("vibrance", Math.round(skinTone * 0.2));
    if (eyeBright > 0) setAdjustment("highlights", Math.round(eyeBright * 0.3));
    if (teethWhiten > 0) setAdjustment("whites", Math.round(teethWhiten * 0.4));
    if (blush > 0) setAdjustment("saturation", Math.round(blush * 0.2));
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
        <p className="text-[10px] text-gray-500 mt-1">AI-guided face and skin enhancement tools</p>
      </div>

      {!sourceImage && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-700/30">
          <p className="text-[10px] text-amber-400">Upload a portrait photo to use these tools</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <Section title="Skin" icon={<Sparkles size={13} />}>
          <PSlider label="Smoothing" value={skinSmooth} onChange={setSkinSmooth} color="#ec4899" icon={<Droplets size={10} />} />
          <PSlider label="Tone Correction" value={skinTone} onChange={setSkinTone} color="#f59e0b" icon={<Sun size={10} />} />
          <PSlider label="Blemish Remove" value={0} min={0} max={100} onChange={() => {}} color="#8b5cf6" />
          <PSlider label="Texture" value={0} min={-50} max={50} onChange={() => {}} color="#06b6d4" />
        </Section>

        <Section title="Eyes" icon={<Eye size={13} />}>
          <PSlider label="Brighten Eyes" value={eyeBright} onChange={setEyeBright} color="#60a5fa" />
          <PSlider label="Eye Bag Reduction" value={0} onChange={() => {}} color="#a78bfa" />
          <PSlider label="Eye Enhance" value={eyebrow} onChange={setEyebrow} color="#f472b6" />
          <PSlider label="Pupil Enlarge" value={0} min={-30} max={50} onChange={() => {}} color="#818cf8" />
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
          <PSlider label="Lip Color" value={0} min={-100} max={100} onChange={() => {}} color="#e11d48" />
        </Section>

        <Section title="Preset Looks" icon={<Star size={13} />} defaultOpen={false}>
          {[
            { name: "Natural Beauty", color: "bg-pink-600" },
            { name: "Soft Glamour", color: "bg-purple-600" },
            { name: "Magazine Cover", color: "bg-violet-600" },
            { name: "Fresh & Dewy", color: "bg-blue-600" },
            { name: "Bold Makeup", color: "bg-red-600" },
            { name: "Barely-There", color: "bg-amber-600" },
          ].map((look) => (
            <button
              key={look.name}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[hsl(220_15%_16%)] transition-all text-left w-full"
            >
              <div className={`w-4 h-4 rounded-full ${look.color} shrink-0`} />
              <span className="text-[11px] text-gray-300">{look.name}</span>
            </button>
          ))}
        </Section>
      </div>

      <div className="shrink-0 px-3 py-2 border-t border-[hsl(220_15%_14%)]">
        <button
          onClick={applyPortraitAdjustments}
          disabled={!sourceImage}
          className="w-full action-btn-primary action-btn justify-center py-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Sliders size={12} /> Apply Portrait Edits
        </button>
      </div>
    </div>
  );
}
