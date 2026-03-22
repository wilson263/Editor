import { useEditorStore, DEFAULT_ADJUSTMENTS, type Adjustments } from "@/lib/editorStore";
import { RotateCcw, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useCallback } from "react";
import Histogram from "@/components/editor/Histogram";

interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  trackColor?: string;
  showDot?: boolean;
}

function AdjSlider({ label, value, min = -100, max = 100, onChange, trackColor, showDot = true }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="adj-row group">
      <div className="adj-row-header">
        <span className="adj-label">{label}</span>
        <div className="flex items-center gap-1">
          {value !== 0 && (
            <button
              onClick={() => onChange(0)}
              className="opacity-0 group-hover:opacity-100 text-[8px] text-gray-600 hover:text-violet-400 transition-all w-4 text-center"
              title="Reset"
            >
              ×
            </button>
          )}
          <span
            className="adj-value cursor-ew-resize select-none"
            onMouseDown={(e) => {
              const startX = e.clientX;
              const startVal = value;
              const range = max - min;
              const handleMove = (me: MouseEvent) => {
                const delta = Math.round(((me.clientX - startX) / 200) * range);
                onChange(Math.max(min, Math.min(max, startVal + delta)));
              };
              const handleUp = () => {
                window.removeEventListener("mousemove", handleMove);
                window.removeEventListener("mouseup", handleUp);
              };
              window.addEventListener("mousemove", handleMove);
              window.addEventListener("mouseup", handleUp);
            }}
          >
            {value > 0 ? "+" : ""}{value}
          </span>
        </div>
      </div>
      <div className="relative">
        <div
          className="absolute inset-0 h-[3px] top-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            background: trackColor
              ? `linear-gradient(to right, hsl(220 15% 22%), ${trackColor})`
              : `linear-gradient(to right, hsl(258 90% 66% / 0.7) 0%, hsl(258 90% 66% / 0.7) ${pct}%, hsl(220 15% 22%) ${pct}%)`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative w-full"
          style={{ background: "transparent" }}
        />
        {showDot && Math.abs((max + min) / 2 - (min + max) / 2) < 1 && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-0.5 -translate-y-1/2 w-0.5 h-3 bg-[hsl(220_15%_30%)] pointer-events-none rounded-full"
          />
        )}
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="panel-section">
      <button
        className="flex items-center justify-between w-full mb-2 group"
        onClick={() => setOpen(!open)}
      >
        <span className="panel-label">{title}</span>
        {open ? (
          <ChevronDown size={10} className="text-gray-600 group-hover:text-gray-400 transition-all" />
        ) : (
          <ChevronRight size={10} className="text-gray-600 group-hover:text-gray-400 transition-all" />
        )}
      </button>
      {open && <div className="flex flex-col gap-3">{children}</div>}
    </div>
  );
}

export default function AdjustmentsPanel() {
  const { adjustments, setAdjustment, resetAdjustments, pushHistory, sourceImage } = useEditorStore();
  const adj = adjustments;

  const set = (key: keyof Adjustments) => (v: number) => {
    setAdjustment(key, v);
  };

  const hasChanges = Object.entries(adj).some(([k, v]) => {
    const def = DEFAULT_ADJUSTMENTS[k as keyof Adjustments];
    return v !== def;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(222_18%_8%)] border-b border-[hsl(220_15%_14%)] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white tracking-tight">Adjustments</span>
          {hasChanges && (
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
          )}
        </div>
        <button
          onClick={() => { resetAdjustments(); }}
          disabled={!hasChanges}
          className={`flex items-center gap-1 text-[10px] transition-all ${hasChanges ? "text-gray-400 hover:text-violet-400 cursor-pointer" : "text-gray-700 cursor-not-allowed"}`}
        >
          <RotateCcw size={10} /> Reset All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Histogram */}
        {sourceImage && (
          <div className="panel-section">
            <div className="panel-label">Histogram</div>
            <Histogram />
          </div>
        )}

        <Section title="Light">
          <AdjSlider label="Exposure" value={adj.exposure} min={-5} max={5} onChange={set("exposure")} />
          <AdjSlider label="Brightness" value={adj.brightness} onChange={set("brightness")} />
          <AdjSlider label="Contrast" value={adj.contrast} onChange={set("contrast")} />
          <AdjSlider label="Highlights" value={adj.highlights} onChange={set("highlights")} trackColor="#f8d66f" />
          <AdjSlider label="Shadows" value={adj.shadows} onChange={set("shadows")} trackColor="#6366f1" />
          <AdjSlider label="Whites" value={adj.whites} onChange={set("whites")} trackColor="#f3f4f6" />
          <AdjSlider label="Blacks" value={adj.blacks} onChange={set("blacks")} trackColor="#374151" />
        </Section>

        <Section title="Color">
          <AdjSlider label="Temperature" value={adj.temperature} onChange={set("temperature")} trackColor="#f59e0b" />
          <AdjSlider label="Tint" value={adj.tint} onChange={set("tint")} trackColor="#ec4899" />
          <AdjSlider label="Vibrance" value={adj.vibrance} onChange={set("vibrance")} trackColor="#f97316" />
          <AdjSlider label="Saturation" value={adj.saturation} onChange={set("saturation")} trackColor="#a855f7" />
          <AdjSlider label="Hue" value={adj.hue} min={-180} max={180} onChange={set("hue")} trackColor="#06b6d4" />
        </Section>

        <Section title="Presence">
          <AdjSlider label="Clarity" value={adj.clarity} onChange={set("clarity")} />
          <AdjSlider label="Texture" value={adj.texture} onChange={set("texture")} />
          <AdjSlider label="Dehaze" value={adj.dehaze} onChange={set("dehaze")} />
        </Section>

        <Section title="Detail">
          <AdjSlider label="Sharpness" value={adj.sharpness} min={0} max={150} onChange={set("sharpness")} />
          <AdjSlider label="Noise Reduction" value={adj.noiseReduction} min={0} max={100} onChange={set("noiseReduction")} />
        </Section>

        <Section title="Effects">
          <AdjSlider label="Vignette" value={adj.vignette} onChange={set("vignette")} trackColor="#1f2937" />
          <AdjSlider label="Blur" value={adj.blur} min={0} max={100} onChange={set("blur")} />
          <AdjSlider label="Grain" value={adj.grain} min={0} max={100} onChange={set("grain")} trackColor="#78716c" />
        </Section>
      </div>

      {/* Push to history button */}
      <div className="shrink-0 px-3 py-2 border-t border-[hsl(220_15%_14%)]">
        <button
          onClick={() => pushHistory("Adjustments")}
          className="w-full action-btn justify-center text-[11px]"
        >
          Save to History
        </button>
      </div>
    </div>
  );
}
