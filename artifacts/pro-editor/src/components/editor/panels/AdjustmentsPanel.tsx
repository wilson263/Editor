import { useEditorStore, DEFAULT_ADJUSTMENTS, type Adjustments } from "@/lib/editorStore";
import { RotateCcw, ChevronDown, ChevronRight, Sun, Droplets, Eye, Wand2, Zap } from "lucide-react";
import { useState, useCallback } from "react";
import Histogram from "@/components/editor/Histogram";

interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  gradient?: string;
  unit?: string;
}

function AdjSlider({ label, value, min = -100, max = 100, onChange, gradient, unit = "" }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const isChanged = value !== 0;

  const defaultGradient = `linear-gradient(to right, #1a1a2e, #4c1d95, #7c3aed)`;

  return (
    <div
      className="group"
      style={{ marginBottom: "10px" }}
    >
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "5px",
      }}>
        <span style={{
          fontSize: "11px", fontWeight: 600, letterSpacing: "0.3px",
          color: isChanged ? "#c4b5fd" : "rgba(255,255,255,0.5)",
          transition: "color 0.2s",
          textTransform: "uppercase", fontSize: "9.5px", letterSpacing: "0.8px",
        }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {isChanged && (
            <button
              onClick={() => onChange(0)}
              title="Reset"
              style={{
                opacity: 0, background: "none", border: "none",
                color: "#7c3aed", cursor: "pointer", fontSize: "10px",
                padding: "0 2px", lineHeight: 1,
                transition: "opacity 0.15s",
              }}
              className="group-hover-reset"
              onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
            >✕</button>
          )}
          <span
            style={{
              fontSize: "11px", fontWeight: 700, fontFamily: "monospace",
              color: isChanged ? "#a78bfa" : "rgba(255,255,255,0.25)",
              minWidth: "32px", textAlign: "right", cursor: "ew-resize",
              userSelect: "none",
              background: isChanged ? "rgba(139,92,246,0.1)" : "transparent",
              padding: "1px 5px", borderRadius: "4px",
              transition: "all 0.2s",
            }}
            onMouseDown={(e) => {
              const startX = e.clientX;
              const startVal = value;
              const range = max - min;
              const move = (me: MouseEvent) => {
                const delta = Math.round(((me.clientX - startX) / 200) * range);
                onChange(Math.max(min, Math.min(max, startVal + delta)));
              };
              const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
              window.addEventListener("mousemove", move);
              window.addEventListener("mouseup", up);
            }}
          >
            {value > 0 ? "+" : ""}{value}{unit}
          </span>
        </div>
      </div>

      <div style={{ position: "relative", height: "20px", display: "flex", alignItems: "center" }}>
        {/* Track bg */}
        <div style={{
          position: "absolute", left: 0, right: 0,
          height: "4px", borderRadius: "3px",
          background: gradient || defaultGradient,
          opacity: 0.35,
          pointerEvents: "none",
        }} />
        {/* Filled portion */}
        <div style={{
          position: "absolute", left: 0,
          height: "4px", borderRadius: "3px",
          width: `${pct}%`,
          background: gradient || "linear-gradient(to right, #4c1d95, #7c3aed)",
          opacity: 0.9,
          pointerEvents: "none",
          boxShadow: isChanged ? "0 0 8px rgba(139,92,246,0.6)" : "none",
          transition: "box-shadow 0.2s",
        }} />
        {/* Center tick */}
        {min < 0 && max > 0 && (
          <div style={{
            position: "absolute",
            left: `${((0 - min) / (max - min)) * 100}%`,
            top: "50%", transform: "translate(-50%, -50%)",
            width: "2px", height: "8px",
            background: "rgba(255,255,255,0.15)",
            borderRadius: "1px", pointerEvents: "none",
          }} />
        )}
        <input
          type="range" min={min} max={max} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            position: "relative", width: "100%",
            appearance: "none", background: "transparent", cursor: "pointer",
            height: "20px", outline: "none",
          }}
        />
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accentColor?: string;
  defaultOpen?: boolean;
}

function Section({ title, icon, children, accentColor = "#8b5cf6", defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{
      borderBottom: "1px solid rgba(139,92,246,0.06)",
      paddingBottom: open ? "4px" : "0",
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          width: "100%", padding: "10px 14px 8px",
          background: "none", border: "none", cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{
          width: "22px", height: "22px", borderRadius: "7px",
          background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}11)`,
          border: `1px solid ${accentColor}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: accentColor, flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{
          fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "1.2px", color: "rgba(255,255,255,0.75)", flex: 1,
        }}>{title}</span>
        <div style={{ color: "rgba(255,255,255,0.2)", transition: "transform 0.2s", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}>
          <ChevronDown size={12} />
        </div>
      </button>
      {open && (
        <div style={{ padding: "0 14px 10px" }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function AdjustmentsPanel() {
  const { adjustments, setAdjustment, resetAdjustments, pushHistory, sourceImage } = useEditorStore();
  const adj = adjustments;

  const set = (key: keyof Adjustments) => (v: number) => setAdjustment(key, v);

  const hasChanges = Object.entries(adj).some(([k, v]) => v !== DEFAULT_ADJUSTMENTS[k as keyof Adjustments]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px 9px",
        background: "linear-gradient(180deg, #0a0414 0%, #060210 100%)",
        borderBottom: "1px solid rgba(139,92,246,0.12)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: hasChanges ? "#8b5cf6" : "rgba(255,255,255,0.1)",
            boxShadow: hasChanges ? "0 0 8px rgba(139,92,246,0.8)" : "none",
            transition: "all 0.3s",
          }} />
          <span style={{ fontSize: "11px", fontWeight: 800, color: "rgba(255,255,255,0.9)", letterSpacing: "0.5px" }}>
            ADJUSTMENTS
          </span>
        </div>
        <button
          onClick={resetAdjustments}
          disabled={!hasChanges}
          style={{
            display: "flex", alignItems: "center", gap: "4px",
            fontSize: "9.5px", fontWeight: 600,
            color: hasChanges ? "#a78bfa" : "rgba(255,255,255,0.15)",
            background: hasChanges ? "rgba(139,92,246,0.08)" : "transparent",
            border: hasChanges ? "1px solid rgba(139,92,246,0.2)" : "1px solid transparent",
            borderRadius: "6px", padding: "3px 8px", cursor: hasChanges ? "pointer" : "not-allowed",
            transition: "all 0.2s",
          }}
        >
          <RotateCcw size={9} /> Reset
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {/* Histogram */}
        {sourceImage && (
          <div style={{ padding: "10px 14px 0" }}>
            <div style={{
              fontSize: "8px", textTransform: "uppercase", letterSpacing: "1.5px",
              color: "rgba(255,255,255,0.2)", fontWeight: 700, marginBottom: "8px",
            }}>Histogram</div>
            <div style={{
              borderRadius: "8px", overflow: "hidden",
              border: "1px solid rgba(139,92,246,0.1)",
            }}>
              <Histogram />
            </div>
          </div>
        )}

        <Section title="Light" icon={<Sun size={11} />} accentColor="#f8d66f" defaultOpen={true}>
          <AdjSlider label="Exposure" value={adj.exposure} min={-5} max={5} onChange={set("exposure")}
            gradient="linear-gradient(to right, #1a1a2e, #f8d66f)" />
          <AdjSlider label="Brightness" value={adj.brightness} onChange={set("brightness")}
            gradient="linear-gradient(to right, #111827, #d1d5db)" />
          <AdjSlider label="Contrast" value={adj.contrast} onChange={set("contrast")}
            gradient="linear-gradient(to right, #3b1c6b, #7c3aed, #f3f4f6)" />
          <AdjSlider label="Highlights" value={adj.highlights} onChange={set("highlights")}
            gradient="linear-gradient(to right, #1e1b4b, #f8d66f, #fff7ed)" />
          <AdjSlider label="Shadows" value={adj.shadows} onChange={set("shadows")}
            gradient="linear-gradient(to right, #0f0a1a, #4338ca, #818cf8)" />
          <AdjSlider label="Whites" value={adj.whites} onChange={set("whites")}
            gradient="linear-gradient(to right, #111827, #6366f1, #f9fafb)" />
          <AdjSlider label="Blacks" value={adj.blacks} onChange={set("blacks")}
            gradient="linear-gradient(to right, #000, #374151, #9ca3af)" />
        </Section>

        <Section title="Color" icon={<Droplets size={11} />} accentColor="#ec4899" defaultOpen={true}>
          <AdjSlider label="Temperature" value={adj.temperature} onChange={set("temperature")}
            gradient="linear-gradient(to right, #1e40af, #3b82f6, #f59e0b, #dc2626)" />
          <AdjSlider label="Tint" value={adj.tint} onChange={set("tint")}
            gradient="linear-gradient(to right, #166534, #10b981, #ec4899, #9d174d)" />
          <AdjSlider label="Vibrance" value={adj.vibrance} onChange={set("vibrance")}
            gradient="linear-gradient(to right, #1e1b4b, #8b5cf6, #f97316)" />
          <AdjSlider label="Saturation" value={adj.saturation} onChange={set("saturation")}
            gradient="linear-gradient(to right, #1f2937, #7c3aed, #ec4899)" />
          <AdjSlider label="Hue" value={adj.hue} min={-180} max={180} onChange={set("hue")}
            gradient="linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899)" />
        </Section>

        <Section title="Presence" icon={<Eye size={11} />} accentColor="#06b6d4" defaultOpen={false}>
          <AdjSlider label="Clarity" value={adj.clarity} onChange={set("clarity")}
            gradient="linear-gradient(to right, #0f172a, #0891b2, #67e8f9)" />
          <AdjSlider label="Texture" value={adj.texture} onChange={set("texture")}
            gradient="linear-gradient(to right, #1e1b4b, #6366f1, #a5b4fc)" />
          <AdjSlider label="Dehaze" value={adj.dehaze} onChange={set("dehaze")}
            gradient="linear-gradient(to right, #1f2937, #6b7280, #f9fafb)" />
        </Section>

        <Section title="Detail" icon={<Wand2 size={11} />} accentColor="#10b981" defaultOpen={false}>
          <AdjSlider label="Sharpness" value={adj.sharpness} min={0} max={150} onChange={set("sharpness")}
            gradient="linear-gradient(to right, #052e16, #059669, #6ee7b7)" />
          <AdjSlider label="Noise Reduction" value={adj.noiseReduction} min={0} max={100} onChange={set("noiseReduction")}
            gradient="linear-gradient(to right, #1e1b4b, #4f46e5, #a5b4fc)" />
        </Section>

        <Section title="Effects" icon={<Zap size={11} />} accentColor="#a855f7" defaultOpen={false}>
          <AdjSlider label="Vignette" value={adj.vignette} onChange={set("vignette")}
            gradient="linear-gradient(to right, #000, #1f2937, #9ca3af)" />
          <AdjSlider label="Blur" value={adj.blur} min={0} max={100} onChange={set("blur")}
            gradient="linear-gradient(to right, #0f172a, #7c3aed, #c4b5fd)" />
          <AdjSlider label="Grain" value={adj.grain} min={0} max={100} onChange={set("grain")}
            gradient="linear-gradient(to right, #1f2937, #78716c, #d6d3d1)" />
        </Section>
      </div>

      {/* Footer action */}
      <div style={{
        flexShrink: 0, padding: "10px 12px",
        borderTop: "1px solid rgba(139,92,246,0.1)",
        background: "linear-gradient(180deg, #060210 0%, #040108 100%)",
      }}>
        <button
          onClick={() => pushHistory("Adjustments")}
          style={{
            width: "100%", padding: "9px 0",
            background: hasChanges
              ? "linear-gradient(135deg, #7c3aed, #6d28d9)"
              : "rgba(255,255,255,0.04)",
            border: hasChanges
              ? "1px solid rgba(139,92,246,0.4)"
              : "1px solid rgba(255,255,255,0.06)",
            borderRadius: "10px",
            color: hasChanges ? "#fff" : "rgba(255,255,255,0.2)",
            fontSize: "10.5px", fontWeight: 700, letterSpacing: "1px",
            textTransform: "uppercase", cursor: "pointer",
            boxShadow: hasChanges ? "0 4px 20px rgba(109,40,217,0.4)" : "none",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { if (hasChanges) (e.currentTarget.style.boxShadow = "0 6px 28px rgba(109,40,217,0.6)"); }}
          onMouseLeave={e => { if (hasChanges) (e.currentTarget.style.boxShadow = "0 4px 20px rgba(109,40,217,0.4)"); }}
        >
          ⚡ Save to History
        </button>
      </div>
    </div>
  );
}
