import { useEditorStore } from "@/lib/editorStore";
import { RotateCcw, Move3d } from "lucide-react";
import { useState } from "react";

interface PerspSliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}

function PerspSlider({ label, value, min = -100, max = 100, onChange }: PerspSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="adj-row group">
      <div className="adj-row-header">
        <span className="adj-label">{label}</span>
        <div className="flex items-center gap-1">
          {value !== 0 && (
            <button
              onClick={() => onChange(0)}
              className="opacity-0 group-hover:opacity-100 text-[8px] text-gray-600 hover:text-violet-400 transition-all"
            >×</button>
          )}
          <span className="adj-value cursor-ew-resize select-none"
            onMouseDown={(e) => {
              const startX = e.clientX, startVal = value, range = max - min;
              const mv = (me: MouseEvent) => onChange(Math.max(min, Math.min(max, startVal + Math.round(((me.clientX - startX) / 200) * range))));
              const up = () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); };
              window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up);
            }}>
            {value > 0 ? "+" : ""}{value}
          </span>
        </div>
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

export default function PerspectivePanel() {
  const { adjustments, setAdjustment } = useEditorStore();
  const [mode, setMode] = useState<"basic" | "advanced">("basic");

  function resetAll() {
    setAdjustment("perspectiveV", 0);
    setAdjustment("perspectiveH", 0);
    setAdjustment("perspectiveScale", 100);
    setAdjustment("lensDistortion", 0);
    setAdjustment("lensVignette", 0);
    setAdjustment("chromaticAberration", 0);
    setAdjustment("defringe", 0);
  }

  const TRANSFORM_PRESETS = [
    { label: "Portrait Correct", v: -5, h: 0, scale: 100 },
    { label: "Architecture Fix", v: -15, h: 2, scale: 102 },
    { label: "Wide Angle", v: 8, h: 0, scale: 98 },
    { label: "Fisheye", v: 0, h: 0, scale: 95 },
    { label: "Tilt-Shift", v: -20, h: 0, scale: 105 },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(215_20%_18%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Move3d size={13} className="text-violet-400" />
            <span className="text-xs font-bold text-white">Geometry & Lens</span>
          </div>
          <button onClick={resetAll} className="text-[9px] text-gray-600 hover:text-violet-400 flex items-center gap-1 transition-all">
            <RotateCcw size={9} /> Reset
          </button>
        </div>
      </div>

      <div className="flex border-b border-[hsl(215_20%_18%)] shrink-0">
        {["basic", "advanced"].map((m) => (
          <button key={m} onClick={() => setMode(m as any)}
            className={`flex-1 py-1.5 text-[10px] capitalize transition-all ${mode === m ? "text-violet-400 border-b-2 border-violet-500" : "text-gray-600 hover:text-gray-300"}`}>
            {m}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Visual transform indicator */}
        <div className="m-3 rounded-lg border border-[hsl(220_15%_18%)] overflow-hidden bg-[hsl(222_18%_7%)] flex items-center justify-center p-3">
          <div className="relative w-24 h-16">
            <div
              className="w-full h-full border-2 border-violet-500/50 rounded"
              style={{
                transform: `perspective(200px) rotateX(${adjustments.perspectiveV * 0.3}deg) rotateY(${adjustments.perspectiveH * 0.3}deg) scale(${adjustments.perspectiveScale / 100})`,
                background: "linear-gradient(135deg, hsl(220 15% 14%), hsl(222 18% 10%))",
                transition: "transform 0.1s ease",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-[8px] text-gray-600 font-mono">PREVIEW</div>
              </div>
              <div className="absolute inset-1 border border-violet-500/20 rounded-sm" />
            </div>
          </div>
        </div>

        <div className="px-3 pb-3 flex flex-col gap-1">
          {/* Perspective section */}
          <div className="panel-section-header">PERSPECTIVE</div>
          <PerspSlider label="Vertical" value={adjustments.perspectiveV} min={-100} max={100}
            onChange={(v) => setAdjustment("perspectiveV", v)} />
          <PerspSlider label="Horizontal" value={adjustments.perspectiveH} min={-100} max={100}
            onChange={(v) => setAdjustment("perspectiveH", v)} />
          <PerspSlider label="Scale" value={adjustments.perspectiveScale - 100} min={-50} max={50}
            onChange={(v) => setAdjustment("perspectiveScale", 100 + v)} />

          {/* Lens Corrections */}
          <div className="panel-section-header mt-2">LENS CORRECTIONS</div>
          <PerspSlider label="Distortion" value={adjustments.lensDistortion} min={-100} max={100}
            onChange={(v) => setAdjustment("lensDistortion", v)} />
          <PerspSlider label="Lens Vignette" value={adjustments.lensVignette} min={-100} max={100}
            onChange={(v) => setAdjustment("lensVignette", v)} />
          <PerspSlider label="Defringe" value={adjustments.defringe} min={0} max={100}
            onChange={(v) => setAdjustment("defringe", v)} />
          <PerspSlider label="Chromatic Aberr." value={adjustments.chromaticAberration} min={0} max={100}
            onChange={(v) => setAdjustment("chromaticAberration", v)} />

          {mode === "advanced" && (
            <>
              <div className="panel-section-header mt-2">TRANSFORM PRESETS</div>
              <div className="flex flex-col gap-1">
                {TRANSFORM_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setAdjustment("perspectiveV", p.v);
                      setAdjustment("perspectiveH", p.h);
                      setAdjustment("perspectiveScale", p.scale);
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-[11px] text-gray-400 hover:text-white hover:bg-[hsl(220_15%_16%)] transition-all"
                  >
                    <span>{p.label}</span>
                    <span className="text-gray-600 text-[9px]">V:{p.v > 0 ? "+" : ""}{p.v} H:{p.h > 0 ? "+" : ""}{p.h}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
