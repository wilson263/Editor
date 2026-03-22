import { useEditorStore, type Layer, type BlendMode } from "@/lib/editorStore";
import { Eye, EyeOff, Lock, Unlock, Trash2, Plus, ChevronUp, ChevronDown, Copy, Layers, Image, Type, Square } from "lucide-react";
import { generateId, BLEND_MODES } from "@/lib/imageUtils";
import { useState } from "react";

function LayerIcon({ type }: { type: string }) {
  switch (type) {
    case "text": return <Type size={10} className="text-violet-400" />;
    case "shape": return <Square size={10} className="text-blue-400" />;
    case "image": return <Image size={10} className="text-green-400" />;
    default: return <Layers size={10} className="text-gray-400" />;
  }
}

function LayerItem({ layer }: { layer: Layer }) {
  const { activeLayerId, setActiveLayer, updateLayer, removeLayer, moveLayer, duplicateLayer } = useEditorStore();
  const isActive = activeLayerId === layer.id;
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div
      onClick={() => setActiveLayer(layer.id)}
      onContextMenu={(e) => { e.preventDefault(); setShowOptions(!showOptions); }}
      className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all relative ${
        isActive
          ? "bg-[hsl(258_90%_66%/0.12)] border border-[hsl(258_90%_66%/0.3)] shadow-sm"
          : "hover:bg-[hsl(220_15%_14%)] border border-transparent"
      }`}
    >
      {/* Thumbnail */}
      <div className="w-8 h-8 rounded-md bg-[hsl(220_15%_16%)] shrink-0 overflow-hidden flex items-center justify-center border border-[hsl(220_15%_20%)] shadow-sm">
        {layer.data ? (
          <img src={layer.data} alt="" className="w-full h-full object-cover" />
        ) : (
          <LayerIcon type={layer.type} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-white truncate font-semibold leading-tight">{layer.name}</div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[9px] text-gray-500 capitalize">{layer.type}</span>
          <span className="text-[9px] text-gray-600">·</span>
          <span className="text-[9px] text-gray-600 font-mono capitalize">{layer.blendMode}</span>
        </div>
      </div>

      {/* Opacity badge */}
      <div className="text-[9px] text-gray-500 font-mono w-7 text-right shrink-0">
        {layer.opacity}%
      </div>

      {/* Actions (show on hover or active) */}
      <div className={`flex items-center gap-0.5 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
        <button
          onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }}
          className="p-1 rounded text-gray-500 hover:text-white transition-all"
          title={layer.visible ? "Hide" : "Show"}
        >
          {layer.visible ? <Eye size={11} /> : <EyeOff size={11} className="text-gray-700" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { locked: !layer.locked }); }}
          className="p-1 rounded text-gray-500 hover:text-white transition-all"
          title={layer.locked ? "Unlock" : "Lock"}
        >
          {layer.locked ? <Lock size={11} className="text-yellow-500" /> : <Unlock size={11} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); duplicateLayer(layer.id); }}
          className="p-1 rounded text-gray-500 hover:text-blue-400 transition-all"
          title="Duplicate"
        >
          <Copy size={11} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}
          className="p-1 rounded text-gray-500 hover:text-red-400 transition-all"
          title="Delete"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

export default function LayersPanel() {
  const { layers, addLayer, activeLayerId, updateLayer, moveLayer } = useEditorStore();
  const [showAddMenu, setShowAddMenu] = useState(false);

  function addNewLayer(type: Layer["type"]) {
    const id = generateId();
    addLayer({
      id,
      name: type === "text" ? "Text Layer" : type === "shape" ? "Shape Layer" : `Layer ${layers.length + 1}`,
      type,
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: "normal",
      ...(type === "text" ? {
        text: "Double-click to edit",
        textStyle: {
          fontSize: 48,
          fontFamily: "Inter",
          color: "#ffffff",
          bold: false,
          italic: false,
          underline: false,
          align: "center" as const,
          x: 50,
          y: 50,
          letterSpacing: 0,
          lineHeight: 1.4,
          shadow: false,
          shadowColor: "#000000",
          shadowBlur: 10,
          stroke: false,
          strokeColor: "#000000",
          strokeWidth: 2,
        }
      } : {}),
    });
    setShowAddMenu(false);
  }

  const activeLayer = layers.find((l) => l.id === activeLayerId);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(222_18%_8%)] border-b border-[hsl(220_15%_14%)] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white tracking-tight">Layers</span>
          <span className="text-[9px] text-gray-600 font-mono">{layers.length}</span>
        </div>
        <div className="flex items-center gap-1 relative">
          {activeLayerId && (
            <>
              <button
                onClick={() => moveLayer(activeLayerId, "up")}
                className="p-1 rounded text-gray-500 hover:text-white hover:bg-[hsl(220_15%_16%)] transition-all"
                title="Move Up"
              >
                <ChevronUp size={12} />
              </button>
              <button
                onClick={() => moveLayer(activeLayerId, "down")}
                className="p-1 rounded text-gray-500 hover:text-white hover:bg-[hsl(220_15%_16%)] transition-all"
                title="Move Down"
              >
                <ChevronDown size={12} />
              </button>
            </>
          )}
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="p-1 rounded bg-violet-600 hover:bg-violet-500 text-white transition-all"
            title="Add Layer"
          >
            <Plus size={12} />
          </button>
          {showAddMenu && (
            <div className="absolute top-full right-0 mt-1 bg-[hsl(222_18%_12%)] border border-[hsl(220_15%_20%)] rounded-lg shadow-2xl z-50 py-1 min-w-[140px]">
              {[
                { type: "image" as const, label: "Image Layer", icon: <Image size={12} /> },
                { type: "text" as const, label: "Text Layer", icon: <Type size={12} /> },
                { type: "shape" as const, label: "Shape Layer", icon: <Square size={12} /> },
                { type: "adjustment" as const, label: "Adjustment", icon: <Layers size={12} /> },
              ].map(({ type, label, icon }) => (
                <button
                  key={type}
                  onClick={() => addNewLayer(type)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-[hsl(220_15%_16%)] transition-all"
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active layer properties */}
      {activeLayer && (
        <div className="px-3 py-2.5 border-b border-[hsl(220_15%_14%)] bg-[hsl(222_18%_9%)] shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest w-10">Opacity</span>
            <input
              type="range"
              min={0}
              max={100}
              value={activeLayer.opacity}
              onChange={(e) => updateLayer(activeLayer.id, { opacity: Number(e.target.value) })}
              className="flex-1"
            />
            <span className="text-[10px] text-gray-300 font-mono w-7 text-right">{activeLayer.opacity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest w-10">Blend</span>
            <select
              value={activeLayer.blendMode}
              onChange={(e) => updateLayer(activeLayer.id, { blendMode: e.target.value as BlendMode })}
              className="flex-1 bg-[hsl(220_15%_16%)] border border-[hsl(220_15%_22%)] text-[10px] text-white rounded-md px-2 py-1 outline-none hover:border-violet-500 transition-all capitalize"
            >
              {BLEND_MODES.map((m) => (
                <option key={m} value={m} className="capitalize">{m}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Layer list */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {layers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3 py-8">
            <div className="w-12 h-12 rounded-xl bg-[hsl(220_15%_14%)] flex items-center justify-center">
              <Layers size={20} className="text-gray-600" />
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-gray-500 mb-1">No layers yet</div>
              <div className="text-[10px] text-gray-700">Upload an image or add a layer using the + button</div>
            </div>
          </div>
        ) : (
          [...layers].reverse().map((layer) => (
            <LayerItem key={layer.id} layer={layer} />
          ))
        )}
      </div>

      {/* Footer */}
      {layers.length > 0 && (
        <div className="px-3 py-2 border-t border-[hsl(220_15%_14%)] shrink-0">
          <div className="flex items-center justify-between text-[9px] text-gray-600">
            <span>{layers.length} layer{layers.length !== 1 ? "s" : ""}</span>
            {activeLayer && <span className="capitalize">{activeLayer.blendMode} · {activeLayer.opacity}%</span>}
          </div>
        </div>
      )}
    </div>
  );
}
