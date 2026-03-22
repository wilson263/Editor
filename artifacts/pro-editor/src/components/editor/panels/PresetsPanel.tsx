import { useState, useRef, useCallback } from "react";
import { useEditorStore, DEFAULT_ADJUSTMENTS, type Adjustments } from "@/lib/editorStore";
import { Star, Plus, Trash2, Download, Upload, ChevronRight, Check, Edit3, X, BookOpen, Sparkles } from "lucide-react";

interface Preset {
  id: string;
  name: string;
  category: string;
  adjustments: Adjustments;
  filter: string;
  thumbnail?: string;
  builtIn?: boolean;
}

const BUILT_IN_PRESETS: Preset[] = [
  {
    id: "golden-hour", name: "Golden Hour", category: "Cinematic", builtIn: true,
    filter: "none",
    adjustments: { ...DEFAULT_ADJUSTMENTS, temperature: 25, tint: 5, exposure: 0.3, highlights: -20, shadows: 15, vibrance: 20, clarity: 10, saturation: 10 }
  },
  {
    id: "matte-film", name: "Matte Film", category: "Cinematic", builtIn: true,
    filter: "fade",
    adjustments: { ...DEFAULT_ADJUSTMENTS, contrast: -15, blacks: 20, highlights: -10, shadows: 10, saturation: -10, vibrance: 5, grain: 20 }
  },
  {
    id: "moody-blue", name: "Moody Blue", category: "Cinematic", builtIn: true,
    filter: "cool",
    adjustments: { ...DEFAULT_ADJUSTMENTS, temperature: -20, tint: -5, contrast: 15, highlights: -25, shadows: 20, clarity: 15, vibrance: -10 }
  },
  {
    id: "portrait-pro", name: "Portrait Pro", category: "Portrait", builtIn: true,
    filter: "none",
    adjustments: { ...DEFAULT_ADJUSTMENTS, exposure: 0.2, clarity: -10, vibrance: 15, temperature: 5, highlights: -10, shadows: 20, noiseReduction: 20 }
  },
  {
    id: "skin-glow", name: "Skin Glow", category: "Portrait", builtIn: true,
    filter: "warm",
    adjustments: { ...DEFAULT_ADJUSTMENTS, brightness: 5, saturation: -5, clarity: -20, vibrance: 10, temperature: 10, shadows: 10 }
  },
  {
    id: "street-noir", name: "Street Noir", category: "Black & White", builtIn: true,
    filter: "noir",
    adjustments: { ...DEFAULT_ADJUSTMENTS, contrast: 30, clarity: 25, shadows: -10, highlights: -15, grain: 30 }
  },
  {
    id: "silver-gelatin", name: "Silver Gelatin", category: "Black & White", builtIn: true,
    filter: "silver",
    adjustments: { ...DEFAULT_ADJUSTMENTS, contrast: 15, clarity: 10, grain: 15, noiseReduction: 5 }
  },
  {
    id: "analog-film", name: "Analog Film", category: "Film Emulation", builtIn: true,
    filter: "portra",
    adjustments: { ...DEFAULT_ADJUSTMENTS, temperature: 8, contrast: -5, saturation: -8, grain: 25, vibrance: 10, shadows: 10 }
  },
  {
    id: "velvia-look", name: "Velvia Look", category: "Film Emulation", builtIn: true,
    filter: "velvia",
    adjustments: { ...DEFAULT_ADJUSTMENTS, saturation: 25, contrast: 15, clarity: 10, vibrance: 20 }
  },
  {
    id: "landscape-pop", name: "Landscape Pop", category: "Landscape", builtIn: true,
    filter: "lush",
    adjustments: { ...DEFAULT_ADJUSTMENTS, clarity: 30, vibrance: 25, saturation: 10, contrast: 10, dehaze: 20, hslGreen: 15, hslBlue: 10 }
  },
  {
    id: "golden-meadow", name: "Golden Meadow", category: "Landscape", builtIn: true,
    filter: "golden",
    adjustments: { ...DEFAULT_ADJUSTMENTS, temperature: 15, clarity: 20, vibrance: 20, highlights: -15, hslYellow: 20, hslGreen: 15 }
  },
  {
    id: "fade-cool", name: "Fade Cool", category: "Lifestyle", builtIn: true,
    filter: "none",
    adjustments: { ...DEFAULT_ADJUSTMENTS, contrast: -20, blacks: 15, temperature: -10, saturation: -15, vibrance: 5 }
  },
  {
    id: "warm-summer", name: "Warm Summer", category: "Lifestyle", builtIn: true,
    filter: "summer",
    adjustments: { ...DEFAULT_ADJUSTMENTS, temperature: 20, vibrance: 30, clarity: 5, highlights: -10, shadows: 15 }
  },
  {
    id: "cyberpunk-glow", name: "Cyberpunk", category: "Creative", builtIn: true,
    filter: "cyberpunk",
    adjustments: { ...DEFAULT_ADJUSTMENTS, contrast: 25, saturation: 30, clarity: 20, vibrance: 20, hslBlue: 30, hslPurple: 20 }
  },
  {
    id: "vintage-fade", name: "Vintage Fade", category: "Retro", builtIn: true,
    filter: "vintage",
    adjustments: { ...DEFAULT_ADJUSTMENTS, contrast: -10, blacks: 20, temperature: 12, grain: 30, saturation: -20, vibrance: 5 }
  },
  {
    id: "high-fashion", name: "High Fashion", category: "Portrait", builtIn: true,
    filter: "none",
    adjustments: { ...DEFAULT_ADJUSTMENTS, contrast: 20, clarity: 25, vibrance: 15, highlights: -20, shadows: 30, hslRed: 10 }
  },
];

const CATEGORIES = Array.from(new Set(BUILT_IN_PRESETS.map(p => p.category)));

export default function PresetsPanel() {
  const { adjustments, selectedFilter, setAdjustment, setSelectedFilter, sourceImage } = useEditorStore();
  const [userPresets, setUserPresets] = useState<Preset[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allCategories = ["All", "My Presets", ...CATEGORIES];

  const filteredPresets = [...BUILT_IN_PRESETS, ...userPresets].filter(p => {
    const matchesCategory = activeCategory === "All" ||
      (activeCategory === "My Presets" && !p.builtIn) ||
      p.category === activeCategory;
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function applyPreset(preset: Preset) {
    for (const [key, val] of Object.entries(preset.adjustments)) {
      setAdjustment(key as keyof Adjustments, val as number);
    }
    setSelectedFilter(preset.filter);
    setAppliedId(preset.id);
    setTimeout(() => setAppliedId(null), 1500);
  }

  function saveCurrentAsPreset() {
    if (!newName.trim()) return;
    setSaving(true);
    const preset: Preset = {
      id: Math.random().toString(36).slice(2, 10),
      name: newName.trim(),
      category: "My Presets",
      adjustments: { ...adjustments },
      filter: selectedFilter,
    };
    setUserPresets(prev => [...prev, preset]);
    setNewName("");
    setSaving(false);
  }

  function deletePreset(id: string) {
    setUserPresets(prev => prev.filter(p => p.id !== id));
  }

  function exportPresets() {
    const data = JSON.stringify(userPresets, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "my-presets.json";
    link.click();
  }

  function importPresets(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as Preset[];
        if (Array.isArray(data)) {
          setUserPresets(prev => [...prev, ...data.map(p => ({ ...p, id: Math.random().toString(36).slice(2, 10), builtIn: false }))]);
        }
      } catch {}
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function startEdit(preset: Preset) {
    setEditingId(preset.id);
    setEditName(preset.name);
  }

  function saveEdit(id: string) {
    setUserPresets(prev => prev.map(p => p.id === id ? { ...p, name: editName } : p));
    setEditingId(null);
  }

  const grouped = filteredPresets.reduce<Record<string, Preset[]>>((acc, p) => {
    const cat = p.builtIn ? p.category : "My Presets";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(215_20%_18%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
            <BookOpen size={11} className="text-white" />
          </div>
          <span className="text-xs font-bold text-white">Presets</span>
          <span className="ml-auto text-[9px] text-gray-600">{BUILT_IN_PRESETS.length + userPresets.length} total</span>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">One-click professional looks & custom styles</p>
      </div>

      {/* Save current as preset */}
      <div className="px-3 py-2 border-b border-[hsl(215_20%_18%)] shrink-0">
        <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1.5">Save Current Edit</div>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && saveCurrentAsPreset()}
            placeholder="Preset name..."
            className="flex-1 bg-[hsl(220_15%_14%)] border border-[hsl(220_15%_20%)] rounded-lg px-2 py-1.5 text-[11px] text-white placeholder-gray-600 outline-none focus:border-amber-500/60 transition-colors"
          />
          <button
            onClick={saveCurrentAsPreset}
            disabled={!newName.trim()}
            className="px-2.5 py-1.5 bg-amber-700/40 hover:bg-amber-700/60 border border-amber-600/30 text-amber-300 rounded-lg text-[11px] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Plus size={11} /> Save
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-1.5 border-b border-[hsl(215_20%_18%)] shrink-0">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search presets..."
          className="w-full bg-[hsl(220_15%_13%)] border border-[hsl(220_15%_20%)] rounded-lg px-2 py-1.5 text-[11px] text-white placeholder-gray-600 outline-none focus:border-amber-500/40 transition-colors"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 px-2 py-1.5 overflow-x-auto border-b border-[hsl(215_20%_18%)] shrink-0 scrollbar-none">
        {allCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-2 py-1 rounded-lg text-[10px] font-semibold transition-all shrink-0 ${
              activeCategory === cat
                ? "bg-amber-600/30 border border-amber-500/40 text-amber-300"
                : "text-gray-500 hover:text-gray-300 hover:bg-[hsl(220_15%_15%)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Presets list */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-3">
        {Object.entries(grouped).map(([category, presets]) => (
          <div key={category}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Star size={9} className="text-amber-500" />
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{category}</span>
              <span className="text-[9px] text-gray-700">({presets.length})</span>
            </div>
            <div className="flex flex-col gap-1">
              {presets.map(preset => (
                <div key={preset.id} className={`group flex items-center gap-2 px-2.5 py-2 rounded-xl border transition-all cursor-pointer ${
                  appliedId === preset.id
                    ? "border-amber-500/50 bg-amber-900/15"
                    : "border-[hsl(220_15%_18%)] hover:border-[hsl(220_15%_28%)] hover:bg-[hsl(220_15%_14%)]"
                }`}
                  onClick={() => applyPreset(preset)}
                >
                  {/* Color swatch based on filter/adjustments */}
                  <div className="w-7 h-7 rounded-lg shrink-0 overflow-hidden border border-[hsl(220_15%_22%)]"
                    style={{
                      background: `linear-gradient(135deg, hsl(${
                        preset.adjustments.temperature > 0 ? '35' : preset.adjustments.temperature < 0 ? '210' : '260'
                      } 60% 45%), hsl(${
                        preset.adjustments.temperature > 0 ? '20' : preset.adjustments.temperature < 0 ? '230' : '280'
                      } 50% 25%))`
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    {editingId === preset.id ? (
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <input
                          autoFocus
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") saveEdit(preset.id); if (e.key === "Escape") setEditingId(null); }}
                          className="flex-1 bg-[hsl(220_15%_18%)] border border-amber-500/40 rounded px-1 py-0.5 text-[11px] text-white outline-none"
                        />
                        <button onClick={() => saveEdit(preset.id)} className="text-green-400 p-0.5"><Check size={11} /></button>
                        <button onClick={() => setEditingId(null)} className="text-gray-500 p-0.5"><X size={11} /></button>
                      </div>
                    ) : (
                      <>
                        <div className="text-[11px] font-semibold text-white truncate">{preset.name}</div>
                        <div className="text-[9px] text-gray-600">{preset.category}</div>
                      </>
                    )}
                  </div>

                  {appliedId === preset.id && (
                    <Check size={12} className="text-amber-400 shrink-0" />
                  )}

                  {!preset.builtIn && editingId !== preset.id && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
                      <button onClick={() => startEdit(preset)} className="p-1 text-gray-500 hover:text-gray-300 transition-colors"><Edit3 size={10} /></button>
                      <button onClick={() => deletePreset(preset.id)} className="p-1 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={10} /></button>
                    </div>
                  )}

                  {preset.builtIn && !appliedId && (
                    <ChevronRight size={10} className="text-gray-700 shrink-0 opacity-0 group-hover:opacity-100 transition-all" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredPresets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <Sparkles size={20} className="text-gray-600" />
            <div className="text-[11px] text-gray-500">No presets found</div>
            <div className="text-[10px] text-gray-700">Try a different search or category</div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="p-2 border-t border-[hsl(215_20%_18%)] shrink-0 flex gap-1.5">
        <button
          onClick={exportPresets}
          disabled={userPresets.length === 0}
          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border border-[hsl(220_15%_20%)] text-[10px] text-gray-400 hover:text-white hover:border-[hsl(220_15%_30%)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={11} /> Export
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border border-[hsl(220_15%_20%)] text-[10px] text-gray-400 hover:text-white hover:border-[hsl(220_15%_30%)] transition-all"
        >
          <Upload size={11} /> Import
        </button>
        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={importPresets} />
      </div>
    </div>
  );
}
