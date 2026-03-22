import { useEditorStore } from "@/lib/editorStore";
import { Download, Image, Share2, Smartphone, Monitor, Square, Instagram, Twitter, Facebook, Globe, Printer } from "lucide-react";
import { useState } from "react";

interface SocialPreset {
  name: string;
  icon: React.ReactNode;
  width: number;
  height: number;
  format: "png" | "jpeg" | "webp";
  quality: number;
  description: string;
}

const SOCIAL_PRESETS: SocialPreset[] = [
  { name: "Instagram Post", icon: <Instagram size={12} />, width: 1080, height: 1080, format: "jpeg", quality: 95, description: "Square 1:1" },
  { name: "Instagram Story", icon: <Smartphone size={12} />, width: 1080, height: 1920, format: "jpeg", quality: 95, description: "9:16 vertical" },
  { name: "Twitter/X Post", icon: <Twitter size={12} />, width: 1600, height: 900, format: "jpeg", quality: 90, description: "16:9 landscape" },
  { name: "Facebook Cover", icon: <Facebook size={12} />, width: 1640, height: 924, description: "Cover photo", format: "jpeg", quality: 90 },
  { name: "LinkedIn Banner", icon: <Monitor size={12} />, width: 1584, height: 396, format: "png", quality: 100, description: "Profile banner" },
  { name: "YouTube Thumbnail", icon: <Globe size={12} />, width: 1280, height: 720, format: "jpeg", quality: 95, description: "16:9 HD" },
  { name: "Print 4×6", icon: <Printer size={12} />, width: 1800, height: 1200, format: "png", quality: 100, description: "@ 300 DPI" },
  { name: "Print 8×10", icon: <Printer size={12} />, width: 3000, height: 2400, format: "png", quality: 100, description: "@ 300 DPI" },
  { name: "Wallpaper 4K", icon: <Monitor size={12} />, width: 3840, height: 2160, format: "png", quality: 100, description: "UHD desktop" },
  { name: "Web Banner", icon: <Globe size={12} />, width: 1200, height: 628, format: "webp", quality: 85, description: "OG image" },
];

export default function ExportPanel() {
  const { exportFormat, exportQuality, setExportFormat, setExportQuality, sourceImage } = useEditorStore();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customW, setCustomW] = useState(1920);
  const [customH, setCustomH] = useState(1080);
  const [keepRatio, setKeepRatio] = useState(true);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport(preset?: SocialPreset) {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    setIsExporting(true);
    setExportProgress(0);

    await new Promise(r => setTimeout(r, 100));
    setExportProgress(30);

    const format = preset?.format || exportFormat;
    const quality = preset?.quality || exportQuality;
    const mimeMap = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" };
    const mime = mimeMap[format];

    let exportCanvas = canvas;

    if (preset) {
      exportCanvas = document.createElement("canvas");
      exportCanvas.width = preset.width;
      exportCanvas.height = preset.height;
      const ctx = exportCanvas.getContext("2d");
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(canvas, 0, 0, preset.width, preset.height);
      }
    }

    setExportProgress(70);
    await new Promise(r => setTimeout(r, 100));

    const link = document.createElement("a");
    const suffix = preset ? preset.name.toLowerCase().replace(/[^a-z0-9]/g, "-") : "export";
    link.download = `proeditor-${suffix}-${Date.now()}.${format}`;
    link.href = exportCanvas.toDataURL(mime, quality / 100);
    link.click();

    setExportProgress(100);
    await new Promise(r => setTimeout(r, 500));
    setIsExporting(false);
    setExportProgress(0);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(215_20%_18%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <Download size={13} className="text-violet-400" />
          <span className="text-xs font-bold text-white">Export & Share</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {!sourceImage && (
          <div className="px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-700/30 text-[10px] text-amber-400">
            Upload an image to enable export
          </div>
        )}

        {/* Format selector */}
        <div>
          <div className="panel-section-header">FORMAT</div>
          <div className="grid grid-cols-3 gap-1 mt-2">
            {(["png", "jpeg", "webp"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setExportFormat(f)}
                className={`py-2 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all border ${
                  exportFormat === f
                    ? "bg-violet-600 border-violet-500 text-white"
                    : "border-[hsl(220_15%_18%)] text-gray-500 hover:text-white hover:border-[hsl(220_15%_28%)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="mt-1 text-[9px] text-gray-600 text-center">
            {exportFormat === "png" && "Lossless · Supports transparency · Larger files"}
            {exportFormat === "jpeg" && "Lossy · Smaller files · No transparency"}
            {exportFormat === "webp" && "Modern · Best compression · Wide support"}
          </div>
        </div>

        {/* Quality */}
        {exportFormat !== "png" && (
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Quality</span>
              <span className="text-[10px] text-violet-400 font-mono">{exportQuality}%</span>
            </div>
            <input type="range" min={1} max={100} value={exportQuality}
              onChange={(e) => setExportQuality(Number(e.target.value))}
              className="w-full" />
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-gray-600">Smaller</span>
              <span className="text-[9px] text-gray-600">Best Quality</span>
            </div>
          </div>
        )}

        {/* Quick export */}
        {isExporting ? (
          <div className="flex flex-col gap-2">
            <div className="h-2 bg-[hsl(220_15%_14%)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-pink-500 rounded-full transition-all"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <div className="text-[10px] text-center text-violet-400">Exporting… {exportProgress}%</div>
          </div>
        ) : (
          <button
            onClick={() => handleExport()}
            disabled={!sourceImage}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              sourceImage
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-900/30"
                : "bg-[hsl(220_15%_14%)] text-gray-600 cursor-not-allowed"
            }`}
          >
            <Download size={14} />
            Export as {exportFormat.toUpperCase()}
          </button>
        )}

        {/* Social Media Presets */}
        <div>
          <div className="panel-section-header">SOCIAL MEDIA & PRINT PRESETS</div>
          <div className="flex flex-col gap-1 mt-2">
            {SOCIAL_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  setSelectedPreset(preset.name);
                  handleExport(preset);
                }}
                disabled={!sourceImage}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all group ${
                  !sourceImage
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-[hsl(220_15%_16%)] cursor-pointer"
                }`}
              >
                <div className="w-7 h-7 rounded-md bg-[hsl(220_15%_14%)] flex items-center justify-center text-violet-400 group-hover:bg-violet-900/30 transition-all shrink-0">
                  {preset.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-gray-300 font-semibold">{preset.name}</div>
                  <div className="text-[9px] text-gray-600">{preset.width}×{preset.height} · {preset.description}</div>
                </div>
                <div className="text-[9px] font-mono text-gray-700 group-hover:text-gray-400 transition-all uppercase">
                  {preset.format}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom size */}
        <div>
          <div className="panel-section-header">CUSTOM SIZE</div>
          <div className="flex gap-2 mt-2">
            <div className="flex-1">
              <div className="text-[9px] text-gray-600 mb-1">Width (px)</div>
              <input
                type="number"
                value={customW}
                onChange={(e) => setCustomW(Number(e.target.value))}
                className="w-full bg-[hsl(222_18%_11%)] border border-[hsl(220_15%_18%)] text-xs text-white rounded-md px-2 py-1.5 outline-none"
              />
            </div>
            <div className="flex-1">
              <div className="text-[9px] text-gray-600 mb-1">Height (px)</div>
              <input
                type="number"
                value={customH}
                onChange={(e) => setCustomH(Number(e.target.value))}
                className="w-full bg-[hsl(222_18%_11%)] border border-[hsl(220_15%_18%)] text-xs text-white rounded-md px-2 py-1.5 outline-none"
              />
            </div>
          </div>
          <button
            onClick={() => handleExport({ name: "custom", icon: <Image size={12} />, width: customW, height: customH, format: exportFormat, quality: exportQuality, description: "custom" })}
            disabled={!sourceImage}
            className={`w-full mt-2 py-1.5 text-xs rounded-lg transition-all ${
              sourceImage
                ? "bg-[hsl(220_15%_16%)] text-gray-300 hover:text-white hover:bg-[hsl(220_15%_20%)]"
                : "bg-[hsl(220_15%_12%)] text-gray-600 cursor-not-allowed"
            }`}
          >
            Export at {customW}×{customH}
          </button>
        </div>
      </div>
    </div>
  );
}
