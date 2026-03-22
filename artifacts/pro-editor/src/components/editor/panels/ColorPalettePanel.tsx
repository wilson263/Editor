import { useState, useCallback } from "react";
import { useEditorStore } from "@/lib/editorStore";
import { Palette, RefreshCw, Copy, Check, Droplets, Grid3X3, AlertCircle, Shuffle } from "lucide-react";

interface ColorEntry {
  hex: string;
  pct: number;
  r: number; g: number; b: number;
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

function extractDominantColors(canvas: HTMLCanvasElement, count = 8): ColorEntry[] {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];

  const sampleW = Math.min(canvas.width, 200);
  const sampleH = Math.min(canvas.height, 200);
  const imgData = ctx.getImageData(
    Math.floor((canvas.width - sampleW) / 2),
    Math.floor((canvas.height - sampleH) / 2),
    sampleW, sampleH
  );
  const data = imgData.data;

  // Build color histogram with quantization (6-bit per channel)
  const colorMap = new Map<string, { r: number; g: number; b: number; count: number }>();
  for (let i = 0; i < data.length; i += 4) {
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    if (data[i + 3] < 128) continue; // skip transparent
    const key = `${r},${g},${b}`;
    const existing = colorMap.get(key);
    if (existing) existing.count++;
    else colorMap.set(key, { r, g, b, count: 1 });
  }

  const totalPixels = (sampleW * sampleH);
  const sorted = Array.from(colorMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, count * 3);

  // Filter out near-duplicates
  const result: ColorEntry[] = [];
  for (const c of sorted) {
    const isDuplicate = result.some((existing) => {
      return Math.abs(existing.r - c.r) < 32 && Math.abs(existing.g - c.g) < 32 && Math.abs(existing.b - c.b) < 32;
    });
    if (!isDuplicate) {
      const hex = "#" + [c.r, c.g, c.b].map((v) => Math.min(255, v).toString(16).padStart(2, "0")).join("");
      result.push({ hex, pct: Math.round((c.count / totalPixels) * 100), r: c.r, g: c.g, b: c.b });
    }
    if (result.length >= count) break;
  }

  return result;
}

function getHarmonyColors(baseHex: string, type: string): string[] {
  const [r, g, b] = hexToRgb(baseHex);
  const [h, s, l] = rgbToHsl(r, g, b);
  switch (type) {
    case "complementary":
      return [baseHex, hslToHex((h + 180) % 360, s, l)];
    case "analogous":
      return [hslToHex((h - 30 + 360) % 360, s, l), baseHex, hslToHex((h + 30) % 360, s, l)];
    case "triadic":
      return [baseHex, hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)];
    case "split-complementary":
      return [baseHex, hslToHex((h + 150) % 360, s, l), hslToHex((h + 210) % 360, s, l)];
    case "tetradic":
      return [baseHex, hslToHex((h + 90) % 360, s, l), hslToHex((h + 180) % 360, s, l), hslToHex((h + 270) % 360, s, l)];
    case "shades":
      return [
        hslToHex(h, s, Math.min(90, l + 30)),
        hslToHex(h, s, Math.min(90, l + 15)),
        baseHex,
        hslToHex(h, s, Math.max(10, l - 15)),
        hslToHex(h, s, Math.max(10, l - 30)),
      ];
    default:
      return [baseHex];
  }
}

const COLOR_PALETTES_PREBUILT = [
  { name: "Golden Hour", colors: ["#FF6B35", "#F7C59F", "#EFEFD0", "#004E89", "#1A936F"] },
  { name: "Cyberpunk", colors: ["#00FFFF", "#FF00FF", "#7B2FBE", "#1A1A2E", "#E94560"] },
  { name: "Pastel Dreams", colors: ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF"] },
  { name: "Monochrome", colors: ["#0D0D0D", "#2D2D2D", "#5E5E5E", "#9E9E9E", "#E0E0E0"] },
  { name: "Ocean", colors: ["#05668D", "#028090", "#00B4D8", "#90E0EF", "#CAF0F8"] },
  { name: "Autumn", colors: ["#7D2E0C", "#B64008", "#E05C14", "#F5963F", "#FAC589"] },
  { name: "Forest", colors: ["#132A13", "#31572C", "#4F772D", "#90A955", "#ECF39E"] },
  { name: "Neon Nights", colors: ["#0D0D0D", "#FF2965", "#FF7700", "#FFE400", "#00FFB4"] },
];

export default function ColorPalettePanel() {
  const { sourceImage, setBrushColor } = useEditorStore();
  const [palette, setPalette] = useState<ColorEntry[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [colorCount, setColorCount] = useState(8);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [harmonyType, setHarmonyType] = useState("complementary");
  const [harmonyColors, setHarmonyColors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"extract" | "harmony" | "prebuilt">("extract");

  async function extractPalette() {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    setExtracting(true);
    await new Promise(r => setTimeout(r, 100));
    const colors = extractDominantColors(canvas, colorCount);
    setPalette(colors);
    setExtracting(false);
  }

  function copyHex(hex: string) {
    navigator.clipboard.writeText(hex).catch(() => {});
    setCopied(hex);
    setTimeout(() => setCopied(null), 1500);
  }

  function updateHarmony(hex: string, type: string) {
    setSelectedColor(hex);
    setHarmonyColors(getHarmonyColors(hex, type));
  }

  const HARMONY_TYPES = [
    { id: "complementary", label: "Complement" },
    { id: "analogous", label: "Analogous" },
    { id: "triadic", label: "Triadic" },
    { id: "split-complementary", label: "Split" },
    { id: "tetradic", label: "Tetradic" },
    { id: "shades", label: "Shades" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(220_15%_14%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center">
            <Palette size={11} className="text-white" />
          </div>
          <span className="text-xs font-bold text-white">Color Palette & Harmony</span>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">Extract colors from image, explore harmony</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[hsl(220_15%_14%)] shrink-0">
        {(["extract", "harmony", "prebuilt"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[10px] font-semibold capitalize transition-all ${activeTab === tab ? "text-violet-400 border-b-2 border-violet-500" : "text-gray-500 hover:text-gray-300"}`}
          >
            {tab === "prebuilt" ? "Prebuilt" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "extract" && (
          <div className="p-3 flex flex-col gap-3">
            {!sourceImage && (
              <div className="px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-700/30">
                <div className="flex items-center gap-2"><AlertCircle size={12} className="text-amber-400 shrink-0" /><p className="text-[10px] text-amber-400">Upload an image to extract colors</p></div>
              </div>
            )}

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-gray-400">Colors to Extract</span>
                <span className="text-[10px] text-white font-mono">{colorCount}</span>
              </div>
              <input type="range" min={4} max={16} value={colorCount} onChange={(e) => setColorCount(Number(e.target.value))} className="w-full" />
            </div>

            <button
              onClick={extractPalette}
              disabled={!sourceImage || extracting}
              className="w-full flex items-center justify-center gap-2 py-2 bg-violet-700/40 hover:bg-violet-700/60 border border-violet-600/30 text-[11px] font-semibold text-violet-300 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {extracting ? <div className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" /> : <Droplets size={12} />}
              {extracting ? "Analyzing..." : "Extract Palette from Image"}
            </button>

            {palette.length > 0 && (
              <>
                {/* Color strip */}
                <div className="flex h-8 rounded-lg overflow-hidden shadow-lg">
                  {palette.map((c) => (
                    <div
                      key={c.hex}
                      style={{ background: c.hex, flex: Math.max(c.pct, 5) }}
                      onClick={() => { setSelectedColor(c.hex); updateHarmony(c.hex, harmonyType); }}
                      className={`cursor-pointer transition-all hover:opacity-90 ${selectedColor === c.hex ? "ring-2 ring-white ring-inset" : ""}`}
                      title={`${c.hex} (${c.pct}%)`}
                    />
                  ))}
                </div>

                {/* Color swatches */}
                <div className="grid grid-cols-4 gap-2">
                  {palette.map((c) => (
                    <div key={c.hex} className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => { setSelectedColor(c.hex); updateHarmony(c.hex, harmonyType); setBrushColor(c.hex); copyHex(c.hex); }}
                        style={{ background: c.hex }}
                        className={`w-full aspect-square rounded-lg shadow-md border-2 transition-all ${selectedColor === c.hex ? "border-white" : "border-transparent"}`}
                        title={`${c.hex} · ${c.pct}%`}
                      />
                      <div className="text-[8px] text-gray-500 font-mono">{c.hex.slice(1).toUpperCase()}</div>
                      <div className="text-[8px] text-gray-600">{c.pct}%</div>
                    </div>
                  ))}
                </div>

                {/* Copy row */}
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => copyHex(palette.map(c => c.hex).join(", "))}
                    className="flex items-center gap-1 px-2 py-1 bg-[hsl(220_15%_14%)] hover:bg-[hsl(220_15%_18%)] rounded text-[10px] text-gray-400 hover:text-white transition-all"
                  >
                    <Copy size={9} /> Copy All HEX
                  </button>
                  <button
                    onClick={() => {
                      const css = `:root {\n${palette.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join("\n")}\n}`;
                      navigator.clipboard.writeText(css).catch(() => {});
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-[hsl(220_15%_14%)] hover:bg-[hsl(220_15%_18%)] rounded text-[10px] text-gray-400 hover:text-white transition-all"
                  >
                    <Copy size={9} /> CSS Variables
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "harmony" && (
          <div className="p-3 flex flex-col gap-3">
            <div>
              <div className="text-[10px] text-gray-400 mb-1.5">Base Color</div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedColor || "#7c3aed"}
                  onChange={(e) => updateHarmony(e.target.value, harmonyType)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-2 border-[hsl(220_15%_22%)]"
                />
                <span className="text-[11px] text-white font-mono">{(selectedColor || "#7c3aed").toUpperCase()}</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-gray-400 mb-1.5">Harmony Type</div>
              <div className="grid grid-cols-3 gap-1">
                {HARMONY_TYPES.map((ht) => (
                  <button
                    key={ht.id}
                    onClick={() => { setHarmonyType(ht.id); updateHarmony(selectedColor || "#7c3aed", ht.id); }}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border transition-all ${harmonyType === ht.id ? "border-violet-500 bg-violet-900/20 text-violet-300" : "border-[hsl(220_15%_18%)] text-gray-400 hover:text-white"}`}
                  >
                    {ht.label}
                  </button>
                ))}
              </div>
            </div>

            {harmonyColors.length > 0 && (
              <div>
                <div className="text-[10px] text-gray-400 mb-2">Harmony Colors</div>
                <div className="flex gap-2 mb-2">
                  {harmonyColors.map((c) => (
                    <div key={c} className="flex-1 flex flex-col items-center gap-1">
                      <button
                        onClick={() => { setBrushColor(c); copyHex(c); }}
                        style={{ background: c }}
                        className="w-full aspect-square rounded-lg shadow-md border border-[hsl(220_15%_25%)]"
                        title={`${c} — click to use`}
                      />
                      <span className="text-[8px] text-gray-500 font-mono">{c.slice(1).toUpperCase()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex h-6 rounded-lg overflow-hidden">
                  {harmonyColors.map((c) => <div key={c} style={{ background: c }} className="flex-1" />)}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "prebuilt" && (
          <div className="p-3 flex flex-col gap-3">
            {COLOR_PALETTES_PREBUILT.map((pal) => (
              <div key={pal.name}>
                <div className="text-[10px] font-semibold text-white mb-1.5">{pal.name}</div>
                <div className="flex gap-1.5">
                  {pal.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setBrushColor(c); copyHex(c); }}
                      style={{ background: c }}
                      className="flex-1 aspect-square rounded-lg shadow-md border border-[hsl(220_15%_22%)] hover:scale-110 transition-all"
                      title={`${c} — click to use as brush color`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {copied && (
        <div className="shrink-0 mx-3 mb-3 px-3 py-2 bg-green-900/30 border border-green-700/30 rounded-lg flex items-center gap-2">
          <Check size={11} className="text-green-400" />
          <span className="text-[10px] text-green-400 font-mono">{copied} copied!</span>
        </div>
      )}
    </div>
  );
}
