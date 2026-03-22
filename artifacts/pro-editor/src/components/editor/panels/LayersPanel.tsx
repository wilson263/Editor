import { useEditorStore, type Layer, type BlendMode } from "@/lib/editorStore";
import { Eye, EyeOff, Lock, Unlock, Trash2, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { generateId } from "@/lib/imageUtils";

const BLEND_MODES: BlendMode[] = [
  "normal", "multiply", "screen", "overlay", "darken", "lighten",
  "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion"
];

function LayerItem({ layer }: { layer: Layer }) {
  const { activeLayerId, setActiveLayer, updateLayer, removeLayer, moveLayer } = useEditorStore();
  const isActive = activeLayerId === layer.id;

  return (
    <div
      onClick={() => setActiveLayer(layer.id)}
      className={`flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-all ${
        isActive ? "bg-violet-900/30 border border-violet-700/40" : "hover:bg-[hsl(215_20%_16%)]"
      }`}
    >
      {/* Thumbnail */}
      <div className="w-8 h-8 rounded bg-[hsl(215_20%_18%)] shrink-0 overflow-hidden flex items-center justify-center text-[10px] text-gray-500 border border-[hsl(215_20%_20%)]">
        {layer.data ? (
          <img src={layer.data} alt="" className="w-full h-full object-cover" />
        ) : layer.type === "text" ? (
          <span className="font-bold text-white">T</span>
        ) : (
          <span>■</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-white truncate font-medium">{layer.name}</div>
        <div className="text-[10px] text-gray-500 capitalize">{layer.type}</div>
      </div>

      {/* Opacity */}
      <div className="text-[10px] text-gray-500 font-mono w-7 text-right">{layer.opacity}%</div>

      {/* Actions */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }}
          className="p-0.5 rounded text-gray-500 hover:text-white transition-all"
        >
          {layer.visible ? <Eye size={11} /> : <EyeOff size={11} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { locked: !layer.locked }); }}
          className="p-0.5 rounded text-gray-500 hover:text-white transition-all"
        >
          {layer.locked ? <Lock size={11} /> : <Unlock size={11} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}
          className="p-0.5 rounded text-gray-500 hover:text-red-400 transition-all"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

export default function LayersPanel() {
  const { layers, addLayer, activeLayerId, updateLayer, moveLayer } = useEditorStore();

  function addImageLayer() {
    const id = generateId();
    addLayer({
      id,
      name: `Layer ${layers.length + 1}`,
      type: "image",
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: "normal",
    });
  }

  const activeLayer = layers.find((l) => l.id === activeLayerId);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[hsl(215_20%_18%)]">
        <span className="text-xs font-semibold text-white">Layers</span>
        <div className="flex items-center gap-1">
          <button
            onClick={addImageLayer}
            className="p-1 rounded hover:bg-violet-900/30 text-gray-400 hover:text-violet-400 transition-all"
            title="Add layer"
          >
            <Plus size={13} />
          </button>
          {activeLayerId && (
            <>
              <button onClick={() => moveLayer(activeLayerId, "up")} className="p-1 rounded hover:bg-[hsl(215_20%_18%)] text-gray-400 hover:text-white transition-all">
                <ChevronUp size={13} />
              </button>
              <button onClick={() => moveLayer(activeLayerId, "down")} className="p-1 rounded hover:bg-[hsl(215_20%_18%)] text-gray-400 hover:text-white transition-all">
                <ChevronDown size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Layer properties if active */}
      {activeLayer && (
        <div className="px-3 py-2 border-b border-[hsl(215_20%_18%)] space-y-2 bg-[hsl(220_13%_11%)]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 w-14">Opacity</span>
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
            <span className="text-[10px] text-gray-500 w-14">Blend</span>
            <select
              value={activeLayer.blendMode}
              onChange={(e) => updateLayer(activeLayer.id, { blendMode: e.target.value as BlendMode })}
              className="flex-1 bg-[hsl(215_20%_18%)] border border-[hsl(215_20%_22%)] text-[10px] text-white rounded px-1 py-0.5 outline-none"
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
          <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2">
            <span className="text-3xl">⬛</span>
            <span className="text-xs text-center">No layers yet.<br />Upload an image or add a layer.</span>
          </div>
        ) : (
          [...layers].reverse().map((layer) => (
            <LayerItem key={layer.id} layer={layer} />
          ))
        )}
      </div>
    </div>
  );
}
