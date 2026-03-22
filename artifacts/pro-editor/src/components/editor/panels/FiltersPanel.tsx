import { useEditorStore } from "@/lib/editorStore";
import { FILTERS, LUT_PRESETS } from "@/lib/imageUtils";
import { useState } from "react";
import { Check, Star, Film, Camera, Aperture, Zap } from "lucide-react";

const FILTER_CATEGORIES = [
  { id: "all", label: "All", icon: <Star size={11} /> },
  { id: "basic", label: "Basic", icon: <Aperture size={11} /> },
  { id: "cinematic", label: "Cinematic", icon: <Film size={11} /> },
  { id: "film", label: "Film", icon: <Camera size={11} /> },
  { id: "black-white", label: "B&W", icon: <Aperture size={11} /> },
  { id: "retro", label: "Retro", icon: <Zap size={11} /> },
  { id: "artistic", label: "Artistic", icon: <Star size={11} /> },
];

export default function FiltersPanel() {
  const { selectedFilter, setSelectedFilter, selectedLut, setSelectedLut, filterOpacity, setFilterOpacity, sourceImage } = useEditorStore();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"presets" | "luts">("presets");

  const filteredFilters = activeCategory === "all"
    ? FILTERS
    : FILTERS.filter((f) => f.category === activeCategory);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(222_18%_8%)] border-b border-[hsl(220_15%_14%)] shrink-0">
        <span className="text-xs font-bold text-white tracking-tight">Filters & Presets</span>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("presets")}
            className={`px-2.5 py-1 text-[10px] font-semibold rounded transition-all ${activeTab === "presets" ? "bg-violet-600 text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            Presets
          </button>
          <button
            onClick={() => setActiveTab("luts")}
            className={`px-2.5 py-1 text-[10px] font-semibold rounded transition-all ${activeTab === "luts" ? "bg-violet-600 text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            LUTs
          </button>
        </div>
      </div>

      {activeTab === "presets" && (
        <>
          {/* Category pills */}
          <div className="px-2 py-2 border-b border-[hsl(220_15%_14%)] overflow-x-auto shrink-0">
            <div className="flex gap-1.5 whitespace-nowrap">
              {FILTER_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                    activeCategory === cat.id
                      ? "bg-violet-600 text-white"
                      : "bg-[hsl(220_15%_16%)] text-gray-400 hover:text-white"
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity */}
          <div className="px-3 py-2 border-b border-[hsl(220_15%_14%)] shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 w-12">Opacity</span>
              <input
                type="range"
                min={0}
                max={100}
                value={filterOpacity}
                onChange={(e) => setFilterOpacity(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-[10px] text-white font-mono w-7 text-right">{filterOpacity}%</span>
            </div>
          </div>

          {/* Filter grid */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-2 gap-2">
              {filteredFilters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`filter-preview relative overflow-hidden rounded-xl border-2 transition-all ${
                    selectedFilter === f.id
                      ? "active border-violet-500"
                      : "border-[hsl(220_15%_18%)] hover:border-[hsl(220_15%_30%)]"
                  }`}
                >
                  <div className="w-full aspect-square relative">
                    {sourceImage ? (
                      <img
                        src={sourceImage}
                        alt={f.name}
                        className="w-full h-full object-cover"
                        style={{ filter: f.css || undefined }}
                      />
                    ) : (
                      <div
                        className="w-full h-full bg-gradient-to-br from-violet-900 via-pink-800 to-orange-700"
                        style={{ filter: f.css || undefined }}
                      />
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* Active check */}
                    {selectedFilter === f.id && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center shadow-lg">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5">
                    <span className="text-[10px] text-white font-semibold drop-shadow-sm">{f.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === "luts" && (
        <div className="flex-1 overflow-y-auto p-2">
          <div className="mb-3 px-1">
            <p className="text-[10px] text-gray-500">Cinematic Look-Up Tables for professional color grading</p>
          </div>
          <div className="flex flex-col gap-1.5">
            {LUT_PRESETS.map((lut) => (
              <button
                key={lut.id}
                onClick={() => setSelectedLut(lut.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
                  selectedLut === lut.id
                    ? "border-violet-500 bg-violet-900/20"
                    : "border-[hsl(220_15%_18%)] hover:border-[hsl(220_15%_28%)] hover:bg-[hsl(220_15%_14%)]"
                }`}
              >
                <div className={`w-10 h-6 rounded-md bg-gradient-to-r ${lut.gradient} shrink-0 shadow-md`} />
                <div className="flex-1">
                  <div className="text-xs text-white font-semibold">{lut.name}</div>
                </div>
                {selectedLut === lut.id && <Check size={12} className="text-violet-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
