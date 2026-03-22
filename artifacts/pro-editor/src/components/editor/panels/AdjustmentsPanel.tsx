import { useEditorStore, DEFAULT_ADJUSTMENTS, type Adjustments } from "@/lib/editorStore";
import { RotateCcw } from "lucide-react";

interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  color?: string;
}

function AdjSlider({ label, value, min = -100, max = 100, onChange, color = "#8b5cf6" }: SliderProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs font-mono text-gray-300 w-8 text-right">{value > 0 ? "+" : ""}{value}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: color }}
        />
        {/* Center line */}
        <div className="absolute top-1/2 left-1/2 -translate-x-0.5 -translate-y-1/2 w-0.5 h-2 bg-gray-600 pointer-events-none" />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2 px-1">{title}</div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

export default function AdjustmentsPanel() {
  const { adjustments, setAdjustment, resetAdjustments } = useEditorStore();
  const adj = adjustments;

  const set = (key: keyof Adjustments) => (v: number) => setAdjustment(key, v);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[hsl(215_20%_18%)]">
        <span className="text-xs font-semibold text-white">Adjustments</span>
        <button
          onClick={resetAdjustments}
          className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-violet-400 transition-all"
        >
          <RotateCcw size={11} /> Reset
        </button>
      </div>

      <div className="p-3 flex flex-col gap-0">
        <Section title="Light">
          <AdjSlider label="Exposure" value={adj.exposure} onChange={set("exposure")} />
          <AdjSlider label="Brightness" value={adj.brightness} onChange={set("brightness")} />
          <AdjSlider label="Contrast" value={adj.contrast} onChange={set("contrast")} />
          <AdjSlider label="Highlights" value={adj.highlights} onChange={set("highlights")} color="#f59e0b" />
          <AdjSlider label="Shadows" value={adj.shadows} onChange={set("shadows")} color="#6366f1" />
          <AdjSlider label="Whites" value={adj.whites} onChange={set("whites")} color="#e5e7eb" />
          <AdjSlider label="Blacks" value={adj.blacks} onChange={set("blacks")} color="#374151" />
        </Section>

        <Section title="Color">
          <AdjSlider label="Saturation" value={adj.saturation} onChange={set("saturation")} color="#ec4899" />
          <AdjSlider label="Vibrance" value={adj.vibrance} onChange={set("vibrance")} color="#f97316" />
          <AdjSlider label="Hue" value={adj.hue} min={-180} max={180} onChange={set("hue")} color="#06b6d4" />
          <AdjSlider label="Temperature" value={adj.temperature} onChange={set("temperature")} color="#f59e0b" />
          <AdjSlider label="Tint" value={adj.tint} onChange={set("tint")} color="#a78bfa" />
        </Section>

        <Section title="Detail">
          <AdjSlider label="Sharpness" value={adj.sharpness} min={0} max={100} onChange={set("sharpness")} />
          <AdjSlider label="Clarity" value={adj.clarity} onChange={set("clarity")} />
          <AdjSlider label="Noise Reduction" value={adj.noiseReduction} min={0} max={100} onChange={set("noiseReduction")} />
        </Section>

        <Section title="Effects">
          <AdjSlider label="Blur" value={adj.blur} min={0} max={100} onChange={set("blur")} />
          <AdjSlider label="Vignette" value={adj.vignette} onChange={set("vignette")} color="#1f2937" />
          <AdjSlider label="Grain" value={adj.grain} min={0} max={100} onChange={set("grain")} color="#78716c" />
        </Section>
      </div>
    </div>
  );
}
