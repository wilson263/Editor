import { useState } from "react";
import { useEditorStore } from "@/lib/editorStore";
import { Camera, ChevronDown, ChevronRight, RotateCcw, Zap, Sun, Aperture } from "lucide-react";

interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  color?: string;
  unit?: string;
}

function Slider({ label, value, min = -100, max = 100, step = 1, onChange, color = "#8b5cf6", unit = "" }: SliderProps) {
  const neutral = (min + max) / 2;
  return (
    <div className="flex flex-col gap-0.5 group">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-400">{label}</span>
        <div className="flex items-center gap-1">
          {value !== neutral && (
            <button
              onClick={() => onChange(neutral)}
              className="opacity-0 group-hover:opacity-100 text-[8px] text-gray-600 hover:text-violet-400 transition-all"
            >×</button>
          )}
          <span className="text-[10px] font-mono text-white w-8 text-right">
            {value > 0 ? `+${value}` : value}{unit}
          </span>
        </div>
      </div>
      <div className="relative h-4">
        <div
          className="absolute h-[3px] top-1/2 -translate-y-1/2 left-0 right-0 rounded-full"
          style={{
            background: value === neutral
              ? 'hsl(220 15% 22%)'
              : `linear-gradient(to right, hsl(220 15% 22%) ${((Math.min(value, neutral) - min) / (max - min)) * 100}%, ${color} ${((Math.max(value, neutral) - min) / (max - min)) * 100}%, hsl(220 15% 22%) ${((Math.max(value, neutral) - min) / (max - min)) * 100}%)`
          }}
        />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="relative w-full" style={{ background: "transparent" }}
        />
      </div>
    </div>
  );
}

interface SectionProps { title: string; icon?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }
function Section({ title, icon, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[hsl(220_15%_14%)] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[hsl(220_15%_14%)] transition-all text-left"
      >
        {icon && <span className="text-violet-400">{icon}</span>}
        <span className="text-[11px] font-semibold text-white flex-1">{title}</span>
        {open ? <ChevronDown size={9} className="text-gray-600" /> : <ChevronRight size={9} className="text-gray-600" />}
      </button>
      {open && <div className="px-3 pb-3 flex flex-col gap-2">{children}</div>}
    </div>
  );
}

const CAMERA_PROFILES = [
  "Standard", "Faithful", "Landscape", "Portrait", "Neutral",
  "Vivid", "Monochrome", "Auto",
  "Adobe Standard", "Adobe Portrait", "Adobe Landscape", "Adobe Vivid",
  "Camera Faithful", "Camera Vivid", "Camera Neutral",
];

export default function RAWControlsPanel() {
  const { adjustments, setAdjustment, resetAdjustments, sourceImage } = useEditorStore();
  const [cameraProfile, setCameraProfile] = useState("Standard");
  const [processingVersion, setProcessingVersion] = useState(2);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(220_15%_14%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <Camera size={13} className="text-violet-400" />
          <span className="text-xs font-bold text-white">RAW Controls</span>
          <span className="ml-auto text-[9px] text-violet-400 bg-violet-900/30 px-1.5 py-0.5 rounded">v{processingVersion}.0</span>
        </div>
        <p className="text-[9px] text-gray-500 mt-0.5">Professional RAW development controls — full non-destructive processing pipeline.</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Camera profile */}
        <div className="px-3 py-2 border-b border-[hsl(220_15%_14%)]">
          <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1.5">Camera Profile</div>
          <select
            value={cameraProfile}
            onChange={e => setCameraProfile(e.target.value)}
            className="w-full bg-[hsl(220_15%_12%)] border border-[hsl(220_15%_20%)] rounded px-2 py-1 text-[10px] text-gray-300 outline-none focus:border-violet-600"
          >
            {CAMERA_PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <div className="flex gap-1 mt-1.5">
            {[1, 2, 3].map(v => (
              <button
                key={v}
                onClick={() => setProcessingVersion(v)}
                className={`flex-1 py-1 rounded text-[9px] font-semibold transition-all ${processingVersion === v ? "bg-violet-700 text-white" : "bg-[hsl(220_15%_15%)] text-gray-500 hover:text-white"}`}
              >
                v{v}.0
              </button>
            ))}
          </div>
        </div>

        {/* White Balance */}
        <Section title="White Balance" icon={<Sun size={11} />}>
          <div className="grid grid-cols-3 gap-1 mb-2">
            {[
              { label: "Daylight", temp: 20, tint: 0 },
              { label: "Cloudy", temp: 30, tint: 5 },
              { label: "Shade", temp: 40, tint: 10 },
              { label: "Tungsten", temp: -50, tint: -10 },
              { label: "Fluorescent", temp: -20, tint: 20 },
              { label: "Flash", temp: 10, tint: -5 },
            ].map(wb => (
              <button
                key={wb.label}
                onClick={() => {
                  setAdjustment("temperature", wb.temp);
                  setAdjustment("tint", wb.tint);
                }}
                className="py-1 rounded bg-[hsl(220_15%_13%)] hover:bg-[hsl(220_15%_18%)] text-[8px] text-gray-400 hover:text-white transition-all"
              >
                {wb.label}
              </button>
            ))}
          </div>
          <Slider label="Temp" value={adjustments.temperature} min={-100} max={100} onChange={v => setAdjustment("temperature", v)} color="#f97316" unit="K" />
          <Slider label="Tint" value={adjustments.tint} min={-100} max={100} onChange={v => setAdjustment("tint", v)} color="#a855f7" />
        </Section>

        {/* Tone */}
        <Section title="Tone" icon={<Aperture size={11} />}>
          <Slider label="Exposure" value={adjustments.exposure} min={-5} max={5} step={0.1} onChange={v => setAdjustment("exposure", v)} color="#fbbf24" />
          <Slider label="Contrast" value={adjustments.contrast} onChange={v => setAdjustment("contrast", v)} color="#60a5fa" />
          <Slider label="Highlights" value={adjustments.highlights} onChange={v => setAdjustment("highlights", v)} color="#f9a8d4" />
          <Slider label="Shadows" value={adjustments.shadows} onChange={v => setAdjustment("shadows", v)} color="#7dd3fc" />
          <Slider label="Whites" value={adjustments.whites} onChange={v => setAdjustment("whites", v)} color="#e2e8f0" />
          <Slider label="Blacks" value={adjustments.blacks} onChange={v => setAdjustment("blacks", v)} color="#64748b" />
        </Section>

        {/* Presence */}
        <Section title="Presence" defaultOpen={false}>
          <Slider label="Texture" value={adjustments.texture} onChange={v => setAdjustment("texture", v)} color="#86efac" />
          <Slider label="Clarity" value={adjustments.clarity} onChange={v => setAdjustment("clarity", v)} color="#34d399" />
          <Slider label="Dehaze" value={adjustments.dehaze} onChange={v => setAdjustment("dehaze", v)} color="#93c5fd" />
          <Slider label="Vibrance" value={adjustments.vibrance} onChange={v => setAdjustment("vibrance", v)} color="#c084fc" />
          <Slider label="Saturation" value={adjustments.saturation} onChange={v => setAdjustment("saturation", v)} color="#e879f9" />
        </Section>

        {/* Color */}
        <Section title="Color" defaultOpen={false}>
          <Slider label="Hue" value={adjustments.hue} onChange={v => setAdjustment("hue", v)} color="#fb923c" />
          <Slider label="Temperature" value={adjustments.temperature} min={-100} max={100} onChange={v => setAdjustment("temperature", v)} color="#f59e0b" />
        </Section>

        {/* Detail */}
        <Section title="Detail" defaultOpen={false}>
          <Slider label="Sharpness" value={adjustments.sharpness} min={0} max={150} onChange={v => setAdjustment("sharpness", v)} color="#a78bfa" />
          <Slider label="Radius" value={adjustments.sharpenRadius} min={0} max={3} step={0.1} onChange={v => setAdjustment("sharpenRadius", v)} color="#818cf8" />
          <Slider label="Detail" value={adjustments.sharpenDetail} min={0} max={100} onChange={v => setAdjustment("sharpenDetail", v)} color="#6366f1" />
          <Slider label="Masking" value={adjustments.sharpenMasking} min={0} max={100} onChange={v => setAdjustment("sharpenMasking", v)} color="#4f46e5" />
          <div className="h-px bg-[hsl(220_15%_16%)] my-1" />
          <Slider label="Noise Reduction" value={adjustments.noiseReduction} min={0} max={100} onChange={v => setAdjustment("noiseReduction", v)} color="#06b6d4" />
          <Slider label="Detail" value={adjustments.noiseReductionDetail} min={0} max={100} onChange={v => setAdjustment("noiseReductionDetail", v)} color="#0ea5e9" />
          <Slider label="Color NR" value={adjustments.colorNoiseReduction} min={0} max={100} onChange={v => setAdjustment("colorNoiseReduction", v)} color="#38bdf8" />
        </Section>

        {/* Effects */}
        <Section title="Effects" defaultOpen={false}>
          <Slider label="Grain Amount" value={adjustments.grain} min={0} max={100} onChange={v => setAdjustment("grain", v)} color="#a1a1aa" />
          <Slider label="Vignette" value={adjustments.vignette} onChange={v => setAdjustment("vignette", v)} color="#52525b" />
        </Section>

        {/* Lens Corrections */}
        <Section title="Lens Corrections" defaultOpen={false}>
          <Slider label="Distortion" value={adjustments.lensDistortion} onChange={v => setAdjustment("lensDistortion", v)} color="#f97316" />
          <Slider label="Vignette" value={adjustments.lensVignette} onChange={v => setAdjustment("lensVignette", v)} color="#ea580c" />
          <Slider label="Defringe" value={adjustments.defringe} min={0} max={100} onChange={v => setAdjustment("defringe", v)} color="#dc2626" />
          <Slider label="Chr. Aberration" value={adjustments.chromaticAberration} onChange={v => setAdjustment("chromaticAberration", v)} color="#b91c1c" />
        </Section>

        {/* Transform */}
        <Section title="Transform" defaultOpen={false}>
          <Slider label="Vertical" value={adjustments.perspectiveV} onChange={v => setAdjustment("perspectiveV", v)} color="#10b981" />
          <Slider label="Horizontal" value={adjustments.perspectiveH} onChange={v => setAdjustment("perspectiveH", v)} color="#059669" />
          <Slider label="Scale" value={adjustments.perspectiveScale} min={50} max={150} onChange={v => setAdjustment("perspectiveScale", v)} color="#047857" />
        </Section>
      </div>

      <div className="px-3 py-2 border-t border-[hsl(220_15%_14%)] shrink-0">
        <button
          onClick={resetAdjustments}
          disabled={!sourceImage}
          className="w-full action-btn justify-center py-1.5 text-gray-400 hover:text-white disabled:opacity-30"
        >
          <RotateCcw size={11} /> Reset All Adjustments
        </button>
      </div>
    </div>
  );
}
