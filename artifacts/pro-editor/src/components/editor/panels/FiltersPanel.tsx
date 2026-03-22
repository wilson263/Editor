import { useEditorStore } from "@/lib/editorStore";
import { FILTERS, LUT_PRESETS } from "@/lib/imageUtils";
import { useState, useRef } from "react";
import { Check, Star, Film, Camera, Aperture, Zap, Upload, Plus, Search, ChevronRight } from "lucide-react";

const FILTER_CATEGORIES = [
  { id: "all", label: "All", icon: <Star size={11} /> },
  { id: "basic", label: "Basic", icon: <Aperture size={11} /> },
  { id: "cinematic", label: "Cinema", icon: <Film size={11} /> },
  { id: "film", label: "Film", icon: <Camera size={11} /> },
  { id: "black-white", label: "B&W", icon: <Aperture size={11} /> },
  { id: "retro", label: "Retro", icon: <Zap size={11} /> },
  { id: "artistic", label: "Art", icon: <Star size={11} /> },
  { id: "nature", label: "Nature", icon: <Star size={11} /> },
];

const PRESET_PACKS = [
  { id: "wedding", name: "Wedding", filters: ["portra", "fade", "warm", "pastel", "dreamy"] },
  { id: "travel", name: "Travel", filters: ["velvia", "vivid", "punch", "golden", "summer"] },
  { id: "portrait", name: "Portrait", filters: ["portra", "fuji400h", "warm", "provia", "agfa"] },
  { id: "street", name: "Street", filters: ["mono", "noir", "trixX", "hp5", "silver"] },
  { id: "cinematic", name: "Cinematic", filters: ["cinema", "teal-orange", "bleach", "tokyo", "midnight"] },
];

export default function FiltersPanel() {
  const { selectedFilter, setSelectedFilter, selectedLut, setSelectedLut, filterOpacity, setFilterOpacity, sourceImage } = useEditorStore();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"presets" | "luts" | "packs">("presets");
  const [search, setSearch] = useState("");
  const [importedLuts, setImportedLuts] = useState<{id:string;name:string;gradient:string}[]>([]);
  const lutFileRef = useRef<HTMLInputElement>(null);

  const filteredFilters = (() => {
    let f = activeCategory === "all" ? FILTERS : FILTERS.filter((f) => f.category === activeCategory);
    if (search) f = f.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
    return f;
  })();

  function handleLutImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = file.name.replace(/\.cube$/i, "");
    // In a real app, parse the .cube file format
    // For now, create a placeholder LUT with the file name
    const gradients = [
      "from-cyan-500 to-orange-500",
      "from-teal-400 to-violet-600",
      "from-amber-400 to-red-600",
      "from-blue-400 to-pink-600",
    ];
    const gradient = gradients[Math.floor(Math.random() * gradients.length)];
    setImportedLuts((prev) => [...prev, { id: `lut-${Date.now()}`, name, gradient }]);
    e.target.value = "";
  }

  const allLuts = [...LUT_PRESETS, ...importedLuts];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(222_18%_8%)] border-b border-[hsl(220_15%_14%)] shrink-0">
        <span className="text-xs font-bold text-white tracking-tight">Filters & Presets</span>
        <div className="flex gap-1">
          {(["presets", "luts", "packs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-1 text-[10px] font-semibold rounded transition-all capitalize ${activeTab === tab ? "bg-violet-600 text-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              {tab === "luts" ? "LUTs" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "presets" && (
        <>
          {/* Search */}
          <div className="px-2 py-2 border-b border-[hsl(220_15%_14%)] shrink-0">
            <div className="relative">
              <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search filters..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-6 pr-2 py-1.5 bg-[hsl(220_15%_13%)] border border-[hsl(220_15%_20%)] rounded-lg text-[11px] text-white outline-none focus:border-violet-500 transition-all"
              />
            </div>
          </div>

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
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity */}
          <div className="px-3 py-2 border-b border-[hsl(220_15%_14%)] shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 w-12">Opacity</span>
              <input type="range" min={0} max={100} value={filterOpacity}
                onChange={(e) => setFilterOpacity(Number(e.target.value))} className="flex-1" />
              <span className="text-[10px] text-white font-mono w-7 text-right">{filterOpacity}%</span>
            </div>
          </div>

          {/* Filter grid */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="text-[10px] text-gray-600 mb-2">
              {filteredFilters.length} filter{filteredFilters.length !== 1 ? "s" : ""}
              {selectedFilter !== "none" && (
                <button onClick={() => setSelectedFilter("none")} className="ml-2 text-violet-400 hover:text-violet-300 transition-all">
                  × Clear
                </button>
              )}
            </div>
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
                      <img src={sourceImage} alt={f.name} className="w-full h-full object-cover" style={{ filter: f.css || undefined }} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-900 via-pink-800 to-orange-700" style={{ filter: f.css || undefined }} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    {selectedFilter === f.id && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center shadow-lg">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                  </div>
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
        <div className="flex-1 overflow-y-auto">
          {/* Import LUT */}
          <div className="px-3 py-2 border-b border-[hsl(220_15%_14%)]">
            <p className="text-[10px] text-gray-500 mb-2">Cinematic LUTs for professional color grading</p>
            <input ref={lutFileRef} type="file" accept=".cube,.3dl,.lut" className="hidden" onChange={handleLutImport} />
            <button
              onClick={() => lutFileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-[hsl(220_15%_22%)] rounded-lg text-[11px] text-gray-500 hover:text-violet-400 hover:border-violet-600/40 transition-all"
            >
              <Upload size={12} /> Import .cube LUT File
            </button>
          </div>
          <div className="p-2 flex flex-col gap-1.5">
            {allLuts.map((lut) => (
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
                  {importedLuts.find((il) => il.id === lut.id) && (
                    <div className="text-[9px] text-violet-400">Custom Import</div>
                  )}
                </div>
                {selectedLut === lut.id && <Check size={12} className="text-violet-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "packs" && (
        <div className="flex-1 overflow-y-auto p-2">
          <p className="text-[10px] text-gray-500 px-1 mb-3">Curated filter packs for different photography styles</p>
          {PRESET_PACKS.map((pack) => {
            const packFilters = FILTERS.filter((f) => pack.filters.includes(f.id));
            return (
              <div key={pack.id} className="mb-4">
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className="text-xs font-bold text-white">{pack.name}</span>
                  <span className="text-[9px] text-gray-600">{packFilters.length} filters</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {packFilters.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFilter(f.id)}
                      className={`relative rounded-lg overflow-hidden border transition-all ${
                        selectedFilter === f.id ? "border-violet-500" : "border-[hsl(220_15%_18%)]"
                      }`}
                    >
                      <div className="w-full aspect-square">
                        {sourceImage ? (
                          <img src={sourceImage} alt={f.name} className="w-full h-full object-cover" style={{ filter: f.css || undefined }} />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-violet-900 via-pink-800 to-orange-700" style={{ filter: f.css || undefined }} />
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <span className="text-[9px] text-white font-medium px-1 pb-1 truncate w-full">{f.name}</span>
                      </div>
                      {selectedFilter === f.id && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
                          <Check size={8} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
