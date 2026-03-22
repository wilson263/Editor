import { useEditorStore, type GradientOverlay, type GradientType, type BlendMode } from "@/lib/editorStore";
import { BLEND_MODES } from "@/lib/imageUtils";
import { Plus, Trash2, Eye, EyeOff, Layers, Sun, Minus, ChevronRight } from "lucide-react";
import { useState } from "react";

const GRADIENT_TYPES: { id: GradientType; label: string; desc: string }[] = [
  { id: "linear", label: "Linear", desc: "Left to right gradient" },
  { id: "radial", label: "Radial", desc: "Circle from center out" },
  { id: "angular", label: "Angular", desc: "Sweep around a point" },
  { id: "reflected", label: "Reflected", desc: "Mirror on both sides" },
];

const GRADIENT_PRESETS: { name: string; stops: GradientOverlay["stops"]; type: GradientType }[] = [
  { name: "Sky Blue", type: "linear", stops: [{ offset: 0, color: "#0ea5e9", opacity: 0.7 }, { offset: 1, color: "#0c4a6e", opacity: 0 }] },
  { name: "Sunset", type: "linear", stops: [{ offset: 0, color: "#f97316", opacity: 0.6 }, { offset: 0.5, color: "#ec4899", opacity: 0.3 }, { offset: 1, color: "#7c3aed", opacity: 0 }] },
  { name: "Forest", type: "radial", stops: [{ offset: 0, color: "#22c55e", opacity: 0.5 }, { offset: 1, color: "#14532d", opacity: 0 }] },
  { name: "Dark Vignette", type: "radial", stops: [{ offset: 0, color: "#000000", opacity: 0 }, { offset: 1, color: "#000000", opacity: 0.8 }] },
  { name: "Warm Glow", type: "radial", stops: [{ offset: 0, color: "#fde047", opacity: 0.4 }, { offset: 1, color: "#78350f", opacity: 0 }] },
  { name: "Cold Teal", type: "linear", stops: [{ offset: 0, color: "#0d9488", opacity: 0.5 }, { offset: 1, color: "#134e4a", opacity: 0 }] },
  { name: "Film Noir", type: "linear", stops: [{ offset: 0, color: "#000000", opacity: 0.6 }, { offset: 0.4, color: "#000000", opacity: 0 }, { offset: 1, color: "#000000", opacity: 0.6 }] },
  { name: "Golden Hour", type: "linear", stops: [{ offset: 0, color: "#f59e0b", opacity: 0.7 }, { offset: 1, color: "#dc2626", opacity: 0 }] },
];

function generateId() { return Math.random().toString(36).slice(2, 10); }

export default function GradientPanel() {
  const {
    gradientOverlays, addGradientOverlay, removeGradientOverlay,
    updateGradientOverlay, activeGradientId, setActiveGradient,
    adjustments, setAdjustment,
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<"overlays" | "radial">("overlays");
  const activeOverlay = gradientOverlays.find((g) => g.id === activeGradientId);

  function createPreset(preset: typeof GRADIENT_PRESETS[0]) {
    const overlay: GradientOverlay = {
      id: generateId(),
      name: preset.name,
      type: preset.type,
      angle: 90,
      centerX: 50,
      centerY: 50,
      radius: 50,
      feather: 30,
      opacity: 80,
      blendMode: "normal",
      stops: preset.stops,
      visible: true,
      adjustments: {},
    };
    addGradientOverlay(overlay);
  }

  function createBlank() {
    const overlay: GradientOverlay = {
      id: generateId(),
      name: `Gradient ${gradientOverlays.length + 1}`,
      type: "linear",
      angle: 90,
      centerX: 50,
      centerY: 50,
      radius: 50,
      feather: 30,
      opacity: 80,
      blendMode: "normal",
      stops: [{ offset: 0, color: "#000000", opacity: 0.5 }, { offset: 1, color: "#000000", opacity: 0 }],
      visible: true,
      adjustments: {},
    };
    addGradientOverlay(overlay);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(222_18%_8%)] border-b border-[hsl(220_15%_14%)] shrink-0">
        <div className="flex items-center gap-2">
          <Layers size={12} className="text-violet-400" />
          <span className="text-xs font-bold text-white tracking-tight">Gradient & Mask</span>
        </div>
        <button
          onClick={createBlank}
          className="flex items-center gap-1 px-2 py-1 bg-violet-600 hover:bg-violet-500 rounded-md text-[10px] text-white font-semibold transition-all"
        >
          <Plus size={10} /> Add
        </button>
      </div>

      <div className="flex border-b border-[hsl(220_15%_14%)] shrink-0">
        <button
          onClick={() => setActiveTab("overlays")}
          className={`flex-1 py-2 text-[10px] font-semibold transition-all ${activeTab === "overlays" ? "text-violet-400 border-b-2 border-violet-500" : "text-gray-500 hover:text-gray-300"}`}
        >
          Overlays ({gradientOverlays.length})
        </button>
        <button
          onClick={() => setActiveTab("radial")}
          className={`flex-1 py-2 text-[10px] font-semibold transition-all ${activeTab === "radial" ? "text-violet-400 border-b-2 border-violet-500" : "text-gray-500 hover:text-gray-300"}`}
        >
          Presets
        </button>
      </div>

      {activeTab === "radial" && (
        <div className="flex-1 overflow-y-auto p-2">
          <div className="mb-2 text-[10px] text-gray-500 px-1">Click a preset to add as gradient overlay</div>
          <div className="grid grid-cols-2 gap-2">
            {GRADIENT_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => createPreset(preset)}
                className="group relative rounded-xl overflow-hidden border-2 border-[hsl(220_15%_18%)] hover:border-violet-500 transition-all aspect-video"
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: preset.type === "radial"
                      ? `radial-gradient(circle, ${preset.stops.map((s) => `${s.color} ${s.offset * 100}%`).join(", ")})`
                      : `linear-gradient(${preset.stops.map((s) => `${s.color} ${s.offset * 100}%`).join(", ")})`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-1 left-1.5">
                  <span className="text-[9px] text-white font-semibold drop-shadow">{preset.name}</span>
                </div>
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center">
                    <Plus size={10} className="text-white" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "overlays" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Overlay list */}
          <div className="border-b border-[hsl(220_15%_14%)] overflow-y-auto max-h-40">
            {gradientOverlays.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2 text-gray-600">
                <Layers size={24} className="opacity-40" />
                <div className="text-[10px] text-center text-gray-600">
                  No gradient overlays.<br />Add one or pick a preset.
                </div>
              </div>
            ) : (
              <div className="p-2 flex flex-col gap-1">
                {gradientOverlays.map((overlay) => (
                  <div
                    key={overlay.id}
                    onClick={() => setActiveGradient(overlay.id === activeGradientId ? null : overlay.id)}
                    className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all border ${
                      activeGradientId === overlay.id
                        ? "border-violet-500/50 bg-violet-900/15"
                        : "border-transparent hover:bg-[hsl(220_15%_14%)]"
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-md shrink-0"
                      style={{
                        background: overlay.type === "radial"
                          ? `radial-gradient(circle, ${overlay.stops.map((s) => `${s.color} ${s.offset * 100}%`).join(", ")})`
                          : `linear-gradient(${overlay.stops.map((s) => `${s.color} ${s.offset * 100}%`).join(", ")})`,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-white font-medium truncate">{overlay.name}</div>
                      <div className="text-[9px] text-gray-500 capitalize">{overlay.type} · {overlay.opacity}%</div>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); updateGradientOverlay(overlay.id, { visible: !overlay.visible }); }}
                        className="p-1 text-gray-500 hover:text-white"
                      >
                        {overlay.visible ? <Eye size={11} /> : <EyeOff size={11} />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeGradientOverlay(overlay.id); }}
                        className="p-1 text-gray-500 hover:text-red-400"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active overlay settings */}
          {activeOverlay ? (
            <div className="flex-1 overflow-y-auto">
              <div className="panel-section">
                <div className="panel-label">Type</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {GRADIENT_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => updateGradientOverlay(activeOverlay.id, { type: t.id })}
                      className={`py-2 px-3 rounded-lg border text-[10px] font-semibold transition-all text-left ${
                        activeOverlay.type === t.id
                          ? "border-violet-500 bg-violet-900/20 text-violet-300"
                          : "border-[hsl(220_15%_18%)] text-gray-400 hover:border-[hsl(220_15%_28%)]"
                      }`}
                    >
                      <div>{t.label}</div>
                      <div className="text-[8px] opacity-60 font-normal">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="panel-section">
                <div className="panel-label">Settings</div>
                <div className="flex flex-col gap-3">
                  {[
                    { label: "Opacity", key: "opacity", min: 0, max: 100, unit: "%" },
                    ...(activeOverlay.type === "linear"
                      ? [{ label: "Angle", key: "angle", min: 0, max: 360, unit: "°" }]
                      : [
                          { label: "Center X", key: "centerX", min: 0, max: 100, unit: "%" },
                          { label: "Center Y", key: "centerY", min: 0, max: 100, unit: "%" },
                          { label: "Radius", key: "radius", min: 1, max: 100, unit: "%" },
                        ]
                    ),
                    { label: "Feather", key: "feather", min: 0, max: 100, unit: "%" },
                  ].map(({ label, key, min, max, unit }) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 w-14 shrink-0">{label}</span>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        value={(activeOverlay as any)[key]}
                        onChange={(e) => updateGradientOverlay(activeOverlay.id, { [key]: Number(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-[10px] font-mono text-white w-9 text-right shrink-0">
                        {(activeOverlay as any)[key]}{unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel-section">
                <div className="panel-label">Blend Mode</div>
                <select
                  value={activeOverlay.blendMode}
                  onChange={(e) => updateGradientOverlay(activeOverlay.id, { blendMode: e.target.value as BlendMode })}
                  className="w-full bg-[hsl(220_15%_14%)] border border-[hsl(220_15%_20%)] text-xs text-white rounded-lg px-3 py-2 outline-none capitalize"
                >
                  {BLEND_MODES.map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
                </select>
              </div>

              <div className="panel-section">
                <div className="panel-label">Color Stops</div>
                <div className="flex flex-col gap-2">
                  {activeOverlay.stops.map((stop, i) => (
                    <div key={i} className="flex items-center gap-2 bg-[hsl(220_15%_13%)] rounded-lg px-2 py-2">
                      <input
                        type="color"
                        value={stop.color}
                        onChange={(e) => {
                          const stops = activeOverlay.stops.map((s, si) => si === i ? { ...s, color: e.target.value } : s);
                          updateGradientOverlay(activeOverlay.id, { stops });
                        }}
                        className="w-8 h-7 cursor-pointer rounded border border-[hsl(220_15%_22%)] bg-transparent p-0"
                      />
                      <div className="flex-1 flex items-center gap-1">
                        <span className="text-[9px] text-gray-600 w-6">{Math.round(stop.offset * 100)}%</span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={Math.round(stop.opacity * 100)}
                          onChange={(e) => {
                            const stops = activeOverlay.stops.map((s, si) => si === i ? { ...s, opacity: Number(e.target.value) / 100 } : s);
                            updateGradientOverlay(activeOverlay.id, { stops });
                          }}
                          className="flex-1"
                        />
                        <span className="text-[9px] text-gray-400 font-mono w-7 text-right">{Math.round(stop.opacity * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600 text-[11px]">
              Select a gradient to edit
            </div>
          )}
        </div>
      )}
    </div>
  );
}
