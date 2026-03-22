import { useState, useRef, useCallback } from "react";
import { useEditorStore, type Adjustments, DEFAULT_ADJUSTMENTS } from "@/lib/editorStore";
import { Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronRight, RadioTower, Circle, Pen, Check } from "lucide-react";

type MaskType = "radial" | "linear" | "brush";

interface LocalAdj {
  id: string;
  name: string;
  type: MaskType;
  visible: boolean;
  // Radial params
  cx: number; cy: number; rx: number; ry: number; feather: number;
  angle: number;
  invert: boolean;
  adjustments: Partial<Adjustments>;
}

function AdjSlider({ label, value, min = -100, max = 100, onChange }: { label: string; value: number; min?: number; max?: number; onChange: (v: number) => void }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="group flex flex-col gap-0.5">
      <div className="flex justify-between">
        <span className="text-[9px] text-gray-500">{label}</span>
        <span
          className="text-[9px] text-white font-mono cursor-ew-resize"
          onMouseDown={e => {
            const startX = e.clientX, startVal = value;
            const move = (ev: MouseEvent) => onChange(Math.max(min, Math.min(max, startVal + Math.round((ev.clientX - startX) / 2))));
            const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
            window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
          }}
        >{value > 0 ? `+${value}` : value}</span>
      </div>
      <div className="relative">
        <div className="absolute inset-0 h-[2px] top-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{ background: `linear-gradient(to right, hsl(258 90% 66% / 0.5) 0%, hsl(258 90% 66% / 0.5) ${pct}%, hsl(220 15% 18%) ${pct}%)` }} />
        <input type="range" min={min} max={max} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="relative w-full" style={{ background: "transparent", height: "16px" }} />
      </div>
    </div>
  );
}

const defaultAdj: Partial<Adjustments> = {
  exposure: 0, contrast: 0, highlights: 0, shadows: 0, clarity: 0,
  saturation: 0, temperature: 0, sharpness: 0, noiseReduction: 0,
};

function createLocal(type: MaskType, idx: number): LocalAdj {
  return {
    id: Math.random().toString(36).slice(2, 10),
    name: `${type === "radial" ? "Radial" : type === "linear" ? "Linear" : "Brush"} Filter ${idx + 1}`,
    type,
    visible: true,
    cx: 50, cy: 50, rx: 30, ry: 25, feather: 50,
    angle: 0,
    invert: false,
    adjustments: { ...defaultAdj },
  };
}

export default function LocalAdjPanel() {
  const { sourceImage, setAdjustment, adjustments } = useEditorStore();
  const [filters, setFilters] = useState<LocalAdj[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  function addFilter(type: MaskType) {
    const f = createLocal(type, filters.length);
    setFilters(prev => [...prev, f]);
    setActiveId(f.id);
  }

  function removeFilter(id: string) {
    setFilters(prev => prev.filter(f => f.id !== id));
    if (activeId === id) setActiveId(null);
  }

  function toggleVisible(id: string) {
    setFilters(prev => prev.map(f => f.id === id ? { ...f, visible: !f.visible } : f));
  }

  function updateAdj(id: string, key: keyof Adjustments, value: number) {
    setFilters(prev => prev.map(f => {
      if (f.id !== id) return f;
      return { ...f, adjustments: { ...f.adjustments, [key]: value } };
    }));
  }

  function updateParam(id: string, updates: Partial<LocalAdj>) {
    setFilters(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }

  const activeFilter = filters.find(f => f.id === activeId);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(215_20%_18%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
            <RadioTower size={11} className="text-white" />
          </div>
          <span className="text-xs font-bold text-white">Local Adjustments</span>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">Apply targeted edits to specific areas using masks</p>
      </div>

      {/* Add mask buttons */}
      <div className="px-3 py-2 border-b border-[hsl(215_20%_18%)] shrink-0">
        <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1.5">Add Mask</div>
        <div className="flex gap-1.5">
          <button
            onClick={() => addFilter("radial")}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-[hsl(220_15%_20%)] hover:border-teal-600/50 hover:bg-teal-900/10 text-[10px] text-gray-400 hover:text-teal-300 transition-all"
          >
            <Circle size={11} /> Radial
          </button>
          <button
            onClick={() => addFilter("linear")}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-[hsl(220_15%_20%)] hover:border-cyan-600/50 hover:bg-cyan-900/10 text-[10px] text-gray-400 hover:text-cyan-300 transition-all"
          >
            <RadioTower size={11} /> Linear
          </button>
          <button
            onClick={() => addFilter("brush")}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-[hsl(220_15%_20%)] hover:border-violet-600/50 hover:bg-violet-900/10 text-[10px] text-gray-400 hover:text-violet-300 transition-all"
          >
            <Pen size={11} /> Brush
          </button>
        </div>
      </div>

      {/* Filter list */}
      {filters.length > 0 && (
        <div className="px-2 py-2 border-b border-[hsl(215_20%_18%)] shrink-0 max-h-36 overflow-y-auto">
          {filters.map((f) => (
            <div key={f.id}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all mb-1 ${activeId === f.id ? "bg-teal-900/20 border border-teal-600/30" : "hover:bg-[hsl(220_15%_14%)]"}`}
              onClick={() => setActiveId(f.id === activeId ? null : f.id)}
            >
              <span className={`text-[9px] px-1 rounded font-bold ${f.type === "radial" ? "bg-teal-900/40 text-teal-400" : f.type === "linear" ? "bg-cyan-900/40 text-cyan-400" : "bg-violet-900/40 text-violet-400"}`}>
                {f.type.charAt(0).toUpperCase()}
              </span>
              <span className="text-[11px] text-gray-300 flex-1 truncate">{f.name}</span>
              <button
                onClick={e => { e.stopPropagation(); toggleVisible(f.id); }}
                className="p-0.5 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {f.visible ? <Eye size={11} /> : <EyeOff size={11} className="text-gray-700" />}
              </button>
              <button
                onClick={e => { e.stopPropagation(); removeFilter(f.id); }}
                className="p-0.5 text-gray-500 hover:text-red-400 transition-colors"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Active filter editor */}
      {activeFilter ? (
        <div className="flex-1 overflow-y-auto">
          {/* Mask parameters */}
          <div className="px-3 py-2 border-b border-[hsl(215_20%_18%)]">
            <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-2">Mask Shape</div>
            {activeFilter.type === "radial" && (
              <div className="flex flex-col gap-2">
                <AdjSlider label="Width" value={activeFilter.rx} min={5} max={100} onChange={v => updateParam(activeFilter.id, { rx: v })} />
                <AdjSlider label="Height" value={activeFilter.ry} min={5} max={100} onChange={v => updateParam(activeFilter.id, { ry: v })} />
                <AdjSlider label="Feather" value={activeFilter.feather} min={0} max={100} onChange={v => updateParam(activeFilter.id, { feather: v })} />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Invert mask</span>
                  <button
                    onClick={() => updateParam(activeFilter.id, { invert: !activeFilter.invert })}
                    className={`w-8 h-4 rounded-full transition-all relative ${activeFilter.invert ? "bg-teal-600" : "bg-[hsl(220_15%_20%)]"}`}
                  >
                    <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${activeFilter.invert ? "left-4.5 left-[calc(100%-14px)]" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            )}
            {activeFilter.type === "linear" && (
              <div className="flex flex-col gap-2">
                <AdjSlider label="Angle" value={activeFilter.angle} min={0} max={360} onChange={v => updateParam(activeFilter.id, { angle: v })} />
                <AdjSlider label="Feather" value={activeFilter.feather} min={0} max={100} onChange={v => updateParam(activeFilter.id, { feather: v })} />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Invert direction</span>
                  <button
                    onClick={() => updateParam(activeFilter.id, { invert: !activeFilter.invert })}
                    className={`w-8 h-4 rounded-full transition-all relative ${activeFilter.invert ? "bg-cyan-600" : "bg-[hsl(220_15%_20%)]"}`}
                  >
                    <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${activeFilter.invert ? "left-[calc(100%-14px)]" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            )}
            {activeFilter.type === "brush" && (
              <div className="px-2 py-2 rounded-lg bg-[hsl(220_15%_12%)] border border-[hsl(220_15%_18%)]">
                <p className="text-[10px] text-gray-500 leading-relaxed">Select the Brush tool and paint the mask area on the canvas. The adjustments below will be applied to the painted region.</p>
              </div>
            )}
          </div>

          {/* Adjustments for this mask */}
          <div className="px-3 py-2">
            <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-2">Local Adjustments</div>
            <div className="flex flex-col gap-2">
              {[
                { key: "exposure", label: "Exposure", min: -100, max: 100 },
                { key: "contrast", label: "Contrast", min: -100, max: 100 },
                { key: "highlights", label: "Highlights", min: -100, max: 100 },
                { key: "shadows", label: "Shadows", min: -100, max: 100 },
                { key: "clarity", label: "Clarity", min: -100, max: 100 },
                { key: "saturation", label: "Saturation", min: -100, max: 100 },
                { key: "temperature", label: "Temperature", min: -100, max: 100 },
                { key: "sharpness", label: "Sharpness", min: 0, max: 100 },
                { key: "noiseReduction", label: "Noise Reduction", min: 0, max: 100 },
              ].map(({ key, label, min, max }) => (
                <AdjSlider
                  key={key}
                  label={label}
                  value={(activeFilter.adjustments[key as keyof Adjustments] as number) ?? 0}
                  min={min}
                  max={max}
                  onChange={v => updateAdj(activeFilter.id, key as keyof Adjustments, v)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-4">
          {filters.length === 0 ? (
            <>
              <div className="w-10 h-10 rounded-2xl bg-[hsl(220_15%_14%)] flex items-center justify-center">
                <RadioTower size={16} className="text-teal-500" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-gray-400 mb-1">No Local Adjustments</div>
                <div className="text-[10px] text-gray-600 leading-relaxed">Add a radial or linear mask to apply targeted edits to specific areas of your image</div>
              </div>
            </>
          ) : (
            <>
              <div className="text-[11px] text-gray-500">Select a mask to edit its adjustments</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
