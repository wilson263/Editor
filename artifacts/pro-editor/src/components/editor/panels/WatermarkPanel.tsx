import { useEditorStore, type Watermark } from "@/lib/editorStore";
import { FONTS } from "@/lib/imageUtils";
import { Plus, Trash2, Eye, EyeOff, Type, Image, ToggleLeft, ToggleRight } from "lucide-react";
import { useState, useRef } from "react";

const POSITIONS: Watermark["position"][] = [
  "top-left", "top-center", "top-right",
  "center",
  "bottom-left", "bottom-center", "bottom-right",
];

const POSITION_LABELS: Record<Watermark["position"], string> = {
  "top-left": "↖ Top Left",
  "top-center": "↑ Top Center",
  "top-right": "↗ Top Right",
  "center": "✦ Center",
  "bottom-left": "↙ Bottom Left",
  "bottom-center": "↓ Bottom Center",
  "bottom-right": "↘ Bottom Right",
};

function generateId() { return Math.random().toString(36).slice(2, 10); }

export default function WatermarkPanel() {
  const { watermarks, addWatermark, removeWatermark, updateWatermark, watermarkEnabled, toggleWatermarkEnabled } = useEditorStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const active = watermarks.find((w) => w.id === activeId);

  function addText() {
    const wm: Watermark = {
      id: generateId(),
      type: "text",
      text: "© Your Name 2025",
      position: "bottom-right",
      opacity: 70,
      fontSize: 24,
      fontFamily: "Inter",
      color: "#ffffff",
      rotation: 0,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      visible: true,
    };
    addWatermark(wm);
    setActiveId(wm.id);
  }

  function addImage(src: string) {
    const wm: Watermark = {
      id: generateId(),
      type: "image",
      imageData: src,
      position: "bottom-right",
      opacity: 80,
      fontSize: 0,
      fontFamily: "",
      color: "",
      rotation: 0,
      scale: 0.15,
      offsetX: 0,
      offsetY: 0,
      visible: true,
    };
    addWatermark(wm);
    setActiveId(wm.id);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(222_18%_8%)] border-b border-[hsl(220_15%_14%)] shrink-0">
        <span className="text-xs font-bold text-white tracking-tight">Watermark</span>
        <button
          onClick={toggleWatermarkEnabled}
          className={`flex items-center gap-1 text-[10px] font-semibold transition-all ${watermarkEnabled ? "text-violet-400" : "text-gray-600"}`}
          title="Enable/disable watermarks"
        >
          {watermarkEnabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          {watermarkEnabled ? "On" : "Off"}
        </button>
      </div>

      {/* Add watermark */}
      <div className="p-2 border-b border-[hsl(220_15%_14%)] flex gap-1.5 shrink-0">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => addImage(ev.target?.result as string);
            reader.readAsDataURL(file);
          }}
        />
        <button onClick={addText} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-[hsl(220_15%_22%)] text-[10px] text-gray-500 hover:text-violet-400 hover:border-violet-500/50 transition-all">
          <Type size={11} /> Text
        </button>
        <button onClick={() => imageInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-[hsl(220_15%_22%)] text-[10px] text-gray-500 hover:text-violet-400 hover:border-violet-500/50 transition-all">
          <Image size={11} /> Logo
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Watermark list */}
        {watermarks.length > 0 && (
          <div className="p-2 border-b border-[hsl(220_15%_14%)]">
            <div className="flex flex-col gap-1">
              {watermarks.map((wm) => (
                <div
                  key={wm.id}
                  onClick={() => setActiveId(wm.id === activeId ? null : wm.id)}
                  className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all border ${
                    activeId === wm.id ? "border-violet-500/50 bg-violet-900/15" : "border-transparent hover:bg-[hsl(220_15%_14%)]"
                  }`}
                >
                  <div className="w-8 h-8 rounded-md bg-[hsl(220_15%_16%)] flex items-center justify-center shrink-0">
                    {wm.type === "text"
                      ? <Type size={12} className="text-violet-400" />
                      : wm.imageData
                      ? <img src={wm.imageData} className="w-full h-full object-contain rounded-md" alt="" />
                      : <Image size={12} className="text-blue-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-white font-medium truncate">
                      {wm.type === "text" ? wm.text?.slice(0, 20) : "Image watermark"}
                    </div>
                    <div className="text-[9px] text-gray-500">{POSITION_LABELS[wm.position]} · {wm.opacity}%</div>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); updateWatermark(wm.id, { visible: !wm.visible }); }}
                      className="p-1 text-gray-500 hover:text-white">
                      {wm.visible ? <Eye size={11} /> : <EyeOff size={11} className="text-gray-700" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); removeWatermark(wm.id); if (activeId === wm.id) setActiveId(null); }}
                      className="p-1 text-gray-500 hover:text-red-400">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active watermark editor */}
        {active ? (
          <div className="flex flex-col gap-0">
            {active.type === "text" && (
              <div className="panel-section">
                <div className="panel-label">Text</div>
                <textarea
                  value={active.text}
                  onChange={(e) => updateWatermark(active.id, { text: e.target.value })}
                  rows={2}
                  className="w-full bg-[hsl(220_15%_14%)] border border-[hsl(220_15%_20%)] rounded-lg text-sm text-white px-3 py-2 outline-none resize-none focus:border-violet-500 mb-2"
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <select
                      value={active.fontFamily}
                      onChange={(e) => updateWatermark(active.id, { fontFamily: e.target.value })}
                      className="w-full bg-[hsl(220_15%_14%)] border border-[hsl(220_15%_20%)] text-[10px] text-white rounded-md px-2 py-1.5 outline-none"
                    >
                      {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <input
                    type="color"
                    value={active.color}
                    onChange={(e) => updateWatermark(active.id, { color: e.target.value })}
                    className="w-9 h-8 cursor-pointer rounded-md border border-[hsl(220_15%_22%)] bg-transparent p-0.5"
                  />
                </div>
              </div>
            )}

            <div className="panel-section">
              <div className="panel-label">Position</div>
              <div className="grid grid-cols-3 gap-1 mb-2">
                {(["top-left", "top-center", "top-right", "center", "bottom-left", "bottom-center", "bottom-right"] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => updateWatermark(active.id, { position: pos })}
                    className={`py-1.5 rounded-md text-[9px] font-medium transition-all ${
                      active.position === pos
                        ? "bg-violet-600 text-white"
                        : "bg-[hsl(220_15%_16%)] text-gray-500 hover:text-white border border-[hsl(220_15%_20%)]"
                    } ${pos === "center" ? "col-start-2" : ""}`}
                  >
                    {POSITION_LABELS[pos].split(" ").slice(1).join(" ") || "Center"}
                  </button>
                ))}
              </div>
            </div>

            <div className="panel-section">
              <div className="panel-label">Appearance</div>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Opacity", key: "opacity", min: 0, max: 100, unit: "%" },
                  { label: active.type === "text" ? "Font Size" : "Scale", key: active.type === "text" ? "fontSize" : "scale", min: active.type === "text" ? 8 : 1, max: active.type === "text" ? 200 : 100, unit: active.type === "text" ? "px" : "%" },
                  { label: "Rotation", key: "rotation", min: -180, max: 180, unit: "°" },
                  { label: "Offset X", key: "offsetX", min: -100, max: 100, unit: "px" },
                  { label: "Offset Y", key: "offsetY", min: -100, max: 100, unit: "px" },
                ].map(({ label, key, min, max, unit }) => {
                  const rawVal = (active as any)[key];
                  const displayVal = key === "scale" ? Math.round(rawVal * 100) : rawVal;
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 w-14 shrink-0">{label}</span>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        value={displayVal}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          updateWatermark(active.id, { [key]: key === "scale" ? v / 100 : v });
                        }}
                        className="flex-1"
                      />
                      <span className="text-[10px] font-mono text-white w-10 text-right shrink-0">{displayVal}{unit}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            {active.type === "text" && (
              <div className="panel-section">
                <div className="panel-label">Preview</div>
                <div className="w-full h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-[hsl(220_15%_18%)] relative overflow-hidden flex items-center justify-center">
                  <span
                    style={{
                      fontFamily: active.fontFamily,
                      fontSize: Math.min(active.fontSize, 22),
                      color: active.color,
                      opacity: active.opacity / 100,
                      transform: `rotate(${active.rotation}deg)`,
                    }}
                    className="text-center px-2 truncate max-w-full"
                  >
                    {active.text}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          watermarks.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-600">
              <Type size={28} className="opacity-40" />
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">No watermarks</div>
                <div className="text-[10px] text-gray-700">Add a text or image watermark above</div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
