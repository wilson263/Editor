import { useEditorStore } from "@/lib/editorStore";
import { FILTERS } from "@/lib/imageUtils";

export default function FiltersPanel() {
  const { selectedFilter, setSelectedFilter, sourceImage } = useEditorStore();

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-[hsl(215_20%_18%)]">
        <span className="text-xs font-semibold text-white">Filters & Presets</span>
      </div>
      <div className="p-2 overflow-y-auto grid grid-cols-2 gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFilter(f.id)}
            className={`filter-preview relative overflow-hidden rounded-lg border-2 transition-all ${
              selectedFilter === f.id
                ? "border-violet-500"
                : "border-[hsl(215_20%_18%)] hover:border-gray-500"
            }`}
          >
            <div
              className="w-full aspect-square bg-gradient-to-br from-violet-900 via-blue-800 to-teal-700 flex items-end"
              style={{ filter: f.css || undefined }}
            >
              {sourceImage ? (
                <img
                  src={sourceImage}
                  alt={f.name}
                  className="w-full h-full object-cover absolute inset-0"
                  style={{ filter: f.css || undefined }}
                />
              ) : (
                <div
                  className="w-full h-full absolute inset-0 bg-gradient-to-br from-violet-900 via-pink-800 to-orange-700"
                  style={{ filter: f.css || undefined }}
                />
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 py-1">
              <span className="text-[10px] text-white font-medium">{f.name}</span>
            </div>
            {selectedFilter === f.id && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
                <span className="text-[8px] text-white">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* LUT Section */}
      <div className="px-3 py-2 border-t border-[hsl(215_20%_18%)]">
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Cinematic LUTs</div>
        <div className="flex flex-col gap-1">
          {["None", "Cinematic", "Teal & Orange", "Morning Mist", "Golden Hour", "Bleach Bypass", "Cross Process"].map((lut) => (
            <button
              key={lut}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-gray-400 hover:text-white hover:bg-[hsl(215_20%_18%)] transition-all text-left"
            >
              <div className="w-6 h-4 rounded bg-gradient-to-r from-violet-800 to-teal-600 shrink-0" />
              {lut}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
