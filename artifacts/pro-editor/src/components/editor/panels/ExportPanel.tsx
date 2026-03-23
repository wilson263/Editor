import { useEditorStore } from "@/lib/editorStore";
import {
  buildCanvasFilter,
  applyPixelAdjustments,
  applyVignette,
} from "@/lib/imageUtils";
import {
  Download, Image, Share2, Smartphone, Monitor, Square,
  Instagram, Twitter, Facebook, Globe, Printer,
  AlertTriangle, CheckCircle2, Loader2,
} from "lucide-react";
import { useState, useRef } from "react";

// ─── Presets ──────────────────────────────────────────────────────────────────

interface ExportPreset {
  name: string;
  icon: React.ReactNode;
  width: number;
  height: number;
  format: "png" | "jpeg" | "webp";
  quality: number;
  description: string;
}

const PRESETS: ExportPreset[] = [
  { name: "Instagram Post",     icon: <Instagram size={12} />, width: 1080,  height: 1080,  format: "jpeg", quality: 95,  description: "Square 1:1" },
  { name: "Instagram Story",    icon: <Smartphone size={12} />, width: 1080,  height: 1920,  format: "jpeg", quality: 95,  description: "9:16 vertical" },
  { name: "Twitter / X Post",   icon: <Twitter size={12} />,   width: 1600,  height: 900,   format: "jpeg", quality: 90,  description: "16:9 landscape" },
  { name: "Facebook Cover",     icon: <Facebook size={12} />,  width: 1640,  height: 924,   format: "jpeg", quality: 90,  description: "Cover photo" },
  { name: "LinkedIn Banner",    icon: <Monitor size={12} />,   width: 1584,  height: 396,   format: "png",  quality: 100, description: "Profile banner" },
  { name: "YouTube Thumbnail",  icon: <Globe size={12} />,     width: 1280,  height: 720,   format: "jpeg", quality: 95,  description: "16:9 HD" },
  { name: "Print 4×6 @300dpi",  icon: <Printer size={12} />,  width: 1800,  height: 1200,  format: "png",  quality: 100, description: "300 DPI print" },
  { name: "Print 8×10 @300dpi", icon: <Printer size={12} />,  width: 3000,  height: 2400,  format: "png",  quality: 100, description: "300 DPI print" },
  { name: "Wallpaper 1080p",    icon: <Monitor size={12} />,   width: 1920,  height: 1080,  format: "png",  quality: 100, description: "Full HD desktop" },
  { name: "Wallpaper 4K",       icon: <Monitor size={12} />,   width: 3840,  height: 2160,  format: "png",  quality: 100, description: "UHD 4K desktop" },
  { name: "Wallpaper 5K",       icon: <Monitor size={12} />,   width: 5120,  height: 2880,  format: "png",  quality: 100, description: "5K Retina" },
  { name: "Wallpaper 8K",       icon: <Monitor size={12} />,   width: 7680,  height: 4320,  format: "png",  quality: 100, description: "Ultra HD 8K" },
  { name: "Web Banner (OG)",    icon: <Globe size={12} />,     width: 1200,  height: 628,   format: "webp", quality: 85,  description: "Open Graph" },
];

// Browser canvas maximum safe dimensions (Chrome: 16384×16384; Safari: 4096×4096)
const BROWSER_MAX_CANVAS = 16384;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(w: number, h: number, format: string): string {
  const px = w * h;
  const bpp = format === "jpeg" ? 3 : 4;
  const raw = px * bpp;
  if (raw > 1e9) return (raw / 1e9).toFixed(1) + " GB uncompressed";
  if (raw > 1e6) return (raw / 1e6).toFixed(0) + " MB uncompressed";
  return (raw / 1e3).toFixed(0) + " KB uncompressed";
}

function isOverBrowserLimit(w: number, h: number): boolean {
  return w > BROWSER_MAX_CANVAS || h > BROWSER_MAX_CANVAS;
}

// ─── Core export engine ───────────────────────────────────────────────────────

/**
 * Renders the edited image at any target resolution and downloads it.
 *
 * Key improvements over the old implementation:
 *  1. Re-renders from the original source image (not just upscaling the screen canvas).
 *     This means 8K export is as sharp as your original photo allows.
 *  2. Applies all CSS-filter effects + pixel-level adjustments at full target res.
 *  3. Uses toBlob() instead of toDataURL() — dramatically lower memory usage.
 *  4. Processes pixels in 200-line horizontal strips so the UI stays responsive.
 *  5. Provides accurate progress and clear error messages on failure.
 */
async function renderAndDownload(opts: {
  sourceImage: string;
  adjustments: ReturnType<typeof useEditorStore>["adjustments"] extends infer A ? A : never;
  selectedFilter: string;
  curvePoints: ReturnType<typeof useEditorStore>["curvePoints"] extends infer C ? C : never;
  targetW: number;
  targetH: number;
  format: "png" | "jpeg" | "webp";
  quality: number;
  filename: string;
  onProgress: (pct: number) => void;
}): Promise<void> {
  const { sourceImage, adjustments, selectedFilter, curvePoints, targetW, targetH, format, quality, filename, onProgress } = opts;

  const mime = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" }[format];

  onProgress(5);

  // ── Step 1: Load the original source image ─────────────────────────────────
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    img.onload  = () => resolve();
    img.onerror = () => reject(new Error("Failed to load source image for export."));
    img.src = sourceImage;
  });
  onProgress(15);

  // ── Step 2: Create export canvas at full target resolution ─────────────────
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width  = targetW;
  exportCanvas.height = targetH;
  const ctx = exportCanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not create export canvas context.");

  // ── Step 3: Draw source at target resolution with CSS filter chain ─────────
  // CSS filters are GPU-accelerated — fast even at 8K
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const cssFilter = buildCanvasFilter(adjustments as any, selectedFilter);
  ctx.filter = cssFilter;
  ctx.drawImage(img, 0, 0, targetW, targetH);
  ctx.filter = "none";
  onProgress(35);

  // ── Step 4: Pixel-level adjustments in horizontal strips ──────────────────
  // We process 200 rows at a time so the browser doesn't lock up on 8K images
  const STRIP_HEIGHT = 200;
  const strips = Math.ceil(targetH / STRIP_HEIGHT);
  const progressStart = 35, progressEnd = 85;

  for (let strip = 0; strip < strips; strip++) {
    const y0 = strip * STRIP_HEIGHT;
    const h  = Math.min(STRIP_HEIGHT, targetH - y0);

    const stripData = ctx.getImageData(0, y0, targetW, h);

    // Apply per-pixel adjustments inline — same logic as applyPixelAdjustments
    // but scoped to this strip to avoid creating a second giant canvas
    const tmp = document.createElement("canvas");
    tmp.width  = targetW;
    tmp.height = h;
    const tctx = tmp.getContext("2d", { willReadFrequently: true });
    if (tctx) {
      tctx.putImageData(stripData, 0, 0);
      await applyPixelAdjustments(tmp, adjustments as any, curvePoints as any);
      const processed = tctx.getImageData(0, 0, targetW, h);
      ctx.putImageData(processed, 0, y0);
    }

    onProgress(progressStart + Math.round(((strip + 1) / strips) * (progressEnd - progressStart)));

    // Yield to browser between strips
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  // ── Step 5: Vignette ───────────────────────────────────────────────────────
  if ((adjustments as any).vignette !== 0) {
    applyVignette(ctx, targetW, targetH, (adjustments as any).vignette);
  }
  onProgress(90);

  // ── Step 6: Export via toBlob (far more memory-efficient than toDataURL) ───
  // toDataURL converts to a base64 string — a 100 MB image becomes a 133 MB string.
  // toBlob streams the data directly, avoiding that overhead entirely.
  const blob = await new Promise<Blob>((resolve, reject) => {
    exportCanvas.toBlob(
      (b) => b
        ? resolve(b)
        : reject(new Error(
            `Export canvas returned null. Your browser may not support ${targetW}×${targetH} at this resolution.\n` +
            "Try reducing the target size or switching to JPEG."
          )),
      mime,
      quality / 100
    );
  });
  onProgress(97);

  // ── Step 7: Trigger download ───────────────────────────────────────────────
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoke after a short delay so the download starts first
  setTimeout(() => URL.revokeObjectURL(url), 5000);

  onProgress(100);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExportPanel() {
  const {
    exportFormat, exportQuality, setExportFormat, setExportQuality,
    sourceImage, adjustments, selectedFilter, curvePoints,
  } = useEditorStore();

  const [customW,       setCustomW]       = useState(1920);
  const [customH,       setCustomH]       = useState(1080);
  const [keepRatio,     setKeepRatio]     = useState(true);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting,  setIsExporting]   = useState(false);
  const [exportError,  setExportError]   = useState<string | null>(null);
  const [exportDone,   setExportDone]    = useState(false);
  const aspectRef = useRef(16 / 9);

  // Maintain aspect ratio when user changes custom dimensions
  function onCustomWChange(v: number) {
    setCustomW(v);
    if (keepRatio) setCustomH(Math.round(v / aspectRef.current));
  }
  function onCustomHChange(v: number) {
    setCustomH(v);
    if (keepRatio) setCustomW(Math.round(v * aspectRef.current));
  }
  function startKeepRatio(w: number, h: number) {
    if (h > 0) aspectRef.current = w / h;
    setKeepRatio(true);
  }

  async function doExport(targetW: number, targetH: number, fmt: "png" | "jpeg" | "webp", qual: number, label: string) {
    if (!sourceImage) return;

    setExportError(null);
    setExportDone(false);
    setIsExporting(true);
    setExportProgress(0);

    const filename = `proeditor-${label}-${Date.now()}.${fmt}`;

    try {
      await renderAndDownload({
        sourceImage,
        adjustments,
        selectedFilter,
        curvePoints,
        targetW,
        targetH,
        format: fmt,
        quality: qual,
        filename,
        onProgress: setExportProgress,
      });
      setExportDone(true);
    } catch (err: any) {
      setExportError(err?.message ?? "Export failed.");
    } finally {
      await new Promise((r) => setTimeout(r, 800));
      setIsExporting(false);
      setExportProgress(0);
    }
  }

  function handleQuickExport() {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    const w = canvas?.width  || customW;
    const h = canvas?.height || customH;
    const label = `${w}x${h}`;
    doExport(w, h, exportFormat, exportQuality, label);
  }

  function handlePreset(p: ExportPreset) {
    doExport(p.width, p.height, p.format, p.quality, p.name.toLowerCase().replace(/[^a-z0-9]/g, "-"));
  }

  function handleCustomExport() {
    doExport(customW, customH, exportFormat, exportQuality, `${customW}x${customH}`);
  }

  const tooLarge = isOverBrowserLimit(customW, customH);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[hsl(215_20%_18%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <Download size={13} className="text-violet-400" />
          <span className="text-xs font-bold text-white">Export & Download</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {!sourceImage && (
          <div className="px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-700/30 text-[10px] text-amber-400">
            Upload an image to enable export.
          </div>
        )}

        {/* Format */}
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
            {exportFormat === "png"  && "Lossless · Transparency · Large files"}
            {exportFormat === "jpeg" && "Lossy · Smaller files · No transparency"}
            {exportFormat === "webp" && "Modern format · Best compression ratio"}
          </div>
        </div>

        {/* Quality */}
        {exportFormat !== "png" && (
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Quality</span>
              <span className="text-[10px] text-violet-400 font-mono">{exportQuality}%</span>
            </div>
            <input
              type="range" min={1} max={100} value={exportQuality}
              onChange={(e) => setExportQuality(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between mt-0.5">
              <span className="text-[9px] text-gray-600">Smaller file</span>
              <span className="text-[9px] text-gray-600">Best quality</span>
            </div>
          </div>
        )}

        {/* Progress / Status */}
        {isExporting && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Loader2 size={12} className="text-violet-400 animate-spin" />
              <span className="text-[10px] text-violet-400">
                {exportProgress < 35 ? "Loading source image…" :
                 exportProgress < 85 ? `Processing pixels… ${exportProgress}%` :
                 exportProgress < 97 ? "Encoding file…" : "Saving…"}
              </span>
            </div>
            <div className="h-1.5 bg-[hsl(220_15%_14%)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full transition-all duration-200"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        )}

        {exportDone && !isExporting && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-900/20 border border-green-700/30">
            <CheckCircle2 size={12} className="text-green-400 shrink-0" />
            <span className="text-[10px] text-green-400">Export complete — check your Downloads folder.</span>
          </div>
        )}

        {exportError && !isExporting && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-900/20 border border-red-700/30">
            <AlertTriangle size={12} className="text-red-400 shrink-0 mt-0.5" />
            <span className="text-[10px] text-red-400 leading-relaxed">{exportError}</span>
          </div>
        )}

        {/* Quick export at current image resolution */}
        <button
          onClick={handleQuickExport}
          disabled={!sourceImage || isExporting}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            sourceImage && !isExporting
              ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-900/30"
              : "bg-[hsl(220_15%_14%)] text-gray-600 cursor-not-allowed"
          }`}
        >
          <Download size={14} />
          Export as {exportFormat.toUpperCase()} (current size)
        </button>

        {/* Resolution Presets */}
        <div>
          <div className="panel-section-header">EXPORT PRESETS</div>
          <div className="flex flex-col gap-0.5 mt-2">
            {PRESETS.map((p) => {
              const over = isOverBrowserLimit(p.width, p.height);
              return (
                <button
                  key={p.name}
                  onClick={() => !over && handlePreset(p)}
                  disabled={!sourceImage || isExporting || over}
                  title={over ? `${p.width}×${p.height} exceeds your browser's canvas limit (${BROWSER_MAX_CANVAS}px). Try a smaller size.` : ""}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all group ${
                    !sourceImage || isExporting || over
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-[hsl(220_15%_16%)] cursor-pointer"
                  }`}
                >
                  <div className="w-7 h-7 rounded-md bg-[hsl(220_15%_14%)] flex items-center justify-center text-violet-400 group-hover:bg-violet-900/30 transition-all shrink-0">
                    {p.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-gray-300 font-semibold">{p.name}</div>
                    <div className="text-[9px] text-gray-600">
                      {p.width}×{p.height} · {p.description}
                      {over && " · ⚠ Too large for browser"}
                    </div>
                  </div>
                  <div className="text-[9px] font-mono text-gray-700 group-hover:text-gray-400 transition-all uppercase">
                    {p.format}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Size */}
        <div>
          <div className="panel-section-header">CUSTOM SIZE</div>
          <div className="flex gap-2 mt-2">
            <div className="flex-1">
              <div className="text-[9px] text-gray-600 mb-1">Width (px)</div>
              <input
                type="number" min={1} max={BROWSER_MAX_CANVAS}
                value={customW}
                onChange={(e) => onCustomWChange(Number(e.target.value))}
                className="w-full bg-[hsl(222_18%_11%)] border border-[hsl(220_15%_18%)] text-xs text-white rounded-md px-2 py-1.5 outline-none focus:border-violet-700"
              />
            </div>
            <div className="flex-1">
              <div className="text-[9px] text-gray-600 mb-1">Height (px)</div>
              <input
                type="number" min={1} max={BROWSER_MAX_CANVAS}
                value={customH}
                onChange={(e) => onCustomHChange(Number(e.target.value))}
                className="w-full bg-[hsl(222_18%_11%)] border border-[hsl(220_15%_18%)] text-xs text-white rounded-md px-2 py-1.5 outline-none focus:border-violet-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setKeepRatio((v) => {
                if (!v) startKeepRatio(customW, customH);
                return !v;
              })}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] transition-all border ${
                keepRatio
                  ? "bg-violet-900/30 border-violet-700/50 text-violet-300"
                  : "border-[hsl(220_15%_18%)] text-gray-600 hover:text-gray-300"
              }`}
            >
              <Square size={10} />
              Lock ratio
            </button>
            <span className="text-[9px] text-gray-700 flex-1 text-right">
              {formatBytes(customW, customH, exportFormat)}
            </span>
          </div>

          {tooLarge && (
            <div className="mt-2 flex items-start gap-2 px-2 py-1.5 rounded-lg bg-red-900/20 border border-red-700/30">
              <AlertTriangle size={11} className="text-red-400 shrink-0 mt-0.5" />
              <span className="text-[9px] text-red-400 leading-relaxed">
                {customW}×{customH} exceeds the browser canvas limit of {BROWSER_MAX_CANVAS}px.
                Maximum safe export is ~{BROWSER_MAX_CANVAS}×{BROWSER_MAX_CANVAS} ({(BROWSER_MAX_CANVAS * BROWSER_MAX_CANVAS / 1e6).toFixed(0)} MP).
              </span>
            </div>
          )}

          <button
            onClick={handleCustomExport}
            disabled={!sourceImage || isExporting || tooLarge}
            className={`w-full mt-2 py-1.5 text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              sourceImage && !isExporting && !tooLarge
                ? "bg-[hsl(220_15%_16%)] text-gray-300 hover:text-white hover:bg-[hsl(220_15%_20%)]"
                : "bg-[hsl(220_15%_12%)] text-gray-600 cursor-not-allowed"
            }`}
          >
            <Download size={11} />
            Export at {customW}×{customH}
          </button>
        </div>

        {/* Info note */}
        <div className="px-3 py-2 rounded-lg bg-[hsl(222_18%_10%)] border border-[hsl(220_15%_15%)]">
          <p className="text-[9px] text-gray-600 leading-relaxed">
            All exports re-render from your original image at the requested resolution — they are not upscaled screenshots.
            All adjustments, filters, and tone curves are applied at full output resolution.
            Large exports (4K+) may take several seconds.
          </p>
        </div>
      </div>
    </div>
  );
}
