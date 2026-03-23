import { useEditorStore } from "@/lib/editorStore";
import {
  Download, Smartphone, Monitor, Globe, Printer,
  Instagram, Twitter, Facebook,
  AlertTriangle, CheckCircle2, Loader2, Lock, Unlock,
  Crop, Maximize,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";

// ─── Presets ──────────────────────────────────────────────────────────────────

interface ExportPreset {
  name: string;
  icon: React.ReactNode;
  width: number;
  height: number;
  format: "png" | "jpeg" | "webp";
  quality: number;
  description: string;
  group: string;
}

const PRESETS: ExportPreset[] = [
  // Social
  { name: "Instagram Post",     icon: <Instagram size={11} />, width: 1080, height: 1080, format: "jpeg", quality: 95,  description: "Square 1:1",      group: "Social" },
  { name: "Instagram Story",    icon: <Smartphone size={11} />,width: 1080, height: 1920, format: "jpeg", quality: 95,  description: "9:16 vertical",   group: "Social" },
  { name: "Twitter / X Post",   icon: <Twitter size={11} />,   width: 1600, height: 900,  format: "jpeg", quality: 90,  description: "16:9 landscape",  group: "Social" },
  { name: "Facebook Cover",     icon: <Facebook size={11} />,  width: 1640, height: 924,  format: "jpeg", quality: 90,  description: "Cover photo",     group: "Social" },
  { name: "LinkedIn Banner",    icon: <Monitor size={11} />,   width: 1584, height: 396,  format: "png",  quality: 100, description: "Profile banner",  group: "Social" },
  { name: "YouTube Thumb",      icon: <Globe size={11} />,     width: 1280, height: 720,  format: "jpeg", quality: 95,  description: "16:9 HD",         group: "Social" },
  // Print
  { name: "Print 4×6",          icon: <Printer size={11} />,   width: 1800, height: 1200, format: "png",  quality: 100, description: "300 DPI",         group: "Print" },
  { name: "Print 5×7",          icon: <Printer size={11} />,   width: 2100, height: 1500, format: "png",  quality: 100, description: "300 DPI",         group: "Print" },
  { name: "Print 8×10",         icon: <Printer size={11} />,   width: 3000, height: 2400, format: "png",  quality: 100, description: "300 DPI",         group: "Print" },
  { name: "Print A4",           icon: <Printer size={11} />,   width: 2480, height: 3508, format: "png",  quality: 100, description: "300 DPI",         group: "Print" },
  { name: "Print A3",           icon: <Printer size={11} />,   width: 3508, height: 4961, format: "png",  quality: 100, description: "300 DPI",         group: "Print" },
  // Screen
  { name: "Full HD 1080p",      icon: <Monitor size={11} />,   width: 1920, height: 1080, format: "png",  quality: 100, description: "1920×1080",       group: "Screen" },
  { name: "QHD 1440p",          icon: <Monitor size={11} />,   width: 2560, height: 1440, format: "png",  quality: 100, description: "2560×1440",       group: "Screen" },
  { name: "4K UHD",             icon: <Monitor size={11} />,   width: 3840, height: 2160, format: "png",  quality: 100, description: "3840×2160",       group: "Screen" },
  { name: "5K Retina",          icon: <Monitor size={11} />,   width: 5120, height: 2880, format: "png",  quality: 100, description: "5120×2880",       group: "Screen" },
  { name: "8K UHD",             icon: <Monitor size={11} />,   width: 7680, height: 4320, format: "png",  quality: 100, description: "7680×4320",       group: "Screen" },
  { name: "Web OG Image",       icon: <Globe size={11} />,     width: 1200, height: 628,  format: "webp", quality: 85,  description: "Open Graph",      group: "Web" },
];

const PRESET_GROUPS = ["Social", "Print", "Screen", "Web"];

// Browser hard limit — beyond this toBlob always returns null in Chrome/Safari
const BROWSER_MAX_PX = 16384;

// ─── High-quality scaling engine ──────────────────────────────────────────────

/**
 * Scales srcCanvas to targetW×targetH with the highest possible quality.
 *
 * For DOWNSCALING we use iterative halving (similar to mip-mapping):
 *   4000→2000→1000→500  beats  4000→500  in sharpness by a large margin.
 *
 * For UPSCALING a single drawImage pass with imageSmoothingQuality="high"
 *   (bicubic in Chromium, Lanczos in some browsers) is as good as possible
 *   in a canvas context — you cannot recover detail that isn't in the source.
 *
 * fit="contain" → letterbox / pillarbox (transparent bars, no crop)
 * fit="cover"   → scale-to-fill then centre-crop to exact target dimensions
 */
async function scaleCanvas(
  src: HTMLCanvasElement,
  targetW: number,
  targetH: number,
  fit: "contain" | "cover",
  onProgress?: (pct: number) => void
): Promise<HTMLCanvasElement> {
  const srcW = src.width;
  const srcH = src.height;

  // Destination canvas
  const dst = document.createElement("canvas");
  dst.width  = targetW;
  dst.height = targetH;
  const dctx = dst.getContext("2d")!;
  dctx.imageSmoothingEnabled = true;
  dctx.imageSmoothingQuality = "high";

  // Compute draw rect based on fit mode
  let drawX = 0, drawY = 0, drawW = targetW, drawH = targetH;
  let clipX = 0, clipY = 0, clipW = srcW, clipH = srcH;

  const srcRatio = srcW / srcH;
  const dstRatio = targetW / targetH;

  if (fit === "contain") {
    if (srcRatio > dstRatio) {
      // Source is wider than dest: fit width, letterbox height
      drawW = targetW;
      drawH = Math.round(targetW / srcRatio);
      drawY = Math.round((targetH - drawH) / 2);
    } else {
      // Source is taller than dest: fit height, pillarbox width
      drawH = targetH;
      drawW = Math.round(targetH * srcRatio);
      drawX = Math.round((targetW - drawW) / 2);
    }
  } else {
    // cover: crop source to match destination aspect ratio
    if (srcRatio > dstRatio) {
      // Source is wider: crop width
      clipW = Math.round(srcH * dstRatio);
      clipX = Math.round((srcW - clipW) / 2);
    } else {
      // Source is taller: crop height
      clipH = Math.round(srcW / dstRatio);
      clipY = Math.round((srcH - clipH) / 2);
    }
  }

  // ── Iterative step-down for downscaling ───────────────────────────────────
  // Each halving step produces a much sharper result than a single giant scale.
  // We iterate until the intermediate canvas is close to the target size.
  let current: HTMLCanvasElement | null = null;
  let cw = fit === "cover" ? clipW : srcW;
  let ch = fit === "cover" ? clipH : srcH;

  // Source rect for first draw (handles cover cropping in first pass)
  let sx = clipX, sy = clipY, sw = clipW, sh = clipH;
  let steps = 0;

  // Count how many halvings we need
  {
    let tw = cw, th = ch;
    while (tw / 2 >= drawW && th / 2 >= drawH) { tw = Math.ceil(tw / 2); th = Math.ceil(th / 2); steps++; }
  }

  let stepsDone = 0;

  while (cw / 2 >= drawW || ch / 2 >= drawH) {
    const nextW = Math.max(drawW, Math.ceil(cw / 2));
    const nextH = Math.max(drawH, Math.ceil(ch / 2));

    const tmp = document.createElement("canvas");
    tmp.width  = nextW;
    tmp.height = nextH;
    const tctx = tmp.getContext("2d")!;
    tctx.imageSmoothingEnabled = true;
    tctx.imageSmoothingQuality = "high";

    if (current === null) {
      // First step — draw from original source, applying any cover crop
      tctx.drawImage(src, sx, sy, sw, sh, 0, 0, nextW, nextH);
    } else {
      tctx.drawImage(current, 0, 0, nextW, nextH);
    }

    current = tmp;
    cw = nextW;
    ch = nextH;
    sx = 0; sy = 0; sw = cw; sh = ch;

    stepsDone++;
    onProgress?.(20 + Math.round((stepsDone / Math.max(steps, 1)) * 50));

    // Yield between steps so the browser stays responsive
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  // ── Final draw into the destination canvas ────────────────────────────────
  const finalSrc = current ?? src;
  if (fit === "contain") {
    dctx.drawImage(finalSrc, sx, sy, finalSrc.width, finalSrc.height, drawX, drawY, drawW, drawH);
  } else {
    // cover: at this point the intermediate is already the right aspect ratio
    dctx.drawImage(finalSrc, 0, 0, finalSrc.width, finalSrc.height, 0, 0, targetW, targetH);
  }

  onProgress?.(80);
  return dst;
}

// ─── Main export function ─────────────────────────────────────────────────────

/**
 * Exports the current canvas at any target resolution with real quality.
 *
 * SOURCE: Always the #main-canvas — this is the ONLY correct source because:
 *   • It is at the original image's native pixel resolution
 *   • It has ALL adjustments, filters, tone curves baked in
 *   • It has ALL brush strokes, dodge/burn, clone, heal, liquify painted on it
 *
 *   Re-rendering from sourceImage URL would lose every paint stroke and would
 *   mis-apply adjustments (position-dependent effects like vignette and radial
 *   filters would scale incorrectly on a strip-processed canvas).
 *
 * QUALITY: Uses iterative step-down halving for downscaling (far sharper than
 *   a single drawImage stretch, which the browser applies nearest-neighbour or
 *   bilinear in a single pass giving a blurry result).
 *
 * SIZE: For exports LARGER than the source canvas, we upscale with bilinear.
 *   You cannot manufacture real pixels that don't exist in the original photo.
 *   The best approach is to paint/shoot at the highest resolution you need.
 */
async function exportImage(opts: {
  targetW: number;
  targetH: number;
  format: "png" | "jpeg" | "webp";
  quality: number;
  fit: "contain" | "cover";
  filename: string;
  onProgress: (pct: number) => void;
}): Promise<void> {
  const { targetW, targetH, format, quality, fit, filename, onProgress } = opts;

  // ── 1. Grab the main canvas (contains all edits at native resolution) ─────
  const mainCanvas = document.getElementById("main-canvas") as HTMLCanvasElement | null;
  if (!mainCanvas || mainCanvas.width === 0) {
    throw new Error("No image is open. Please load an image before exporting.");
  }
  onProgress(5);

  // ── 2. Validate target dimensions against browser limits ─────────────────
  if (targetW > BROWSER_MAX_PX || targetH > BROWSER_MAX_PX) {
    throw new Error(
      `${targetW}×${targetH} exceeds the browser canvas limit of ${BROWSER_MAX_PX}px per side. ` +
      `Maximum supported export is ${BROWSER_MAX_PX}×${BROWSER_MAX_PX}.`
    );
  }
  if (targetW < 1 || targetH < 1) {
    throw new Error("Export dimensions must be at least 1×1 pixels.");
  }
  onProgress(10);

  // ── 3. Scale to target resolution with iterative step-down ───────────────
  const exportCanvas = await scaleCanvas(mainCanvas, targetW, targetH, fit, onProgress);
  onProgress(85);

  // ── 4. Encode to file using toBlob (NOT toDataURL) ────────────────────────
  // toDataURL() produces a base64 string (33% overhead), can silently return
  // a blank result on large canvases, and blocks the main thread.
  // toBlob() streams data to a Blob directly — far more memory-efficient.
  const mime = `image/${format}`;
  const blob = await new Promise<Blob>((resolve, reject) => {
    exportCanvas.toBlob(
      (b) => {
        if (b) {
          resolve(b);
        } else {
          reject(new Error(
            `Encoding failed — the canvas returned null.\n` +
            `This usually means the export size (${targetW}×${targetH}) ` +
            `exceeded your device's GPU memory.\n` +
            `Try reducing the resolution or switching to JPEG format.`
          ));
        }
      },
      mime,
      quality / 100
    );
  });
  onProgress(95);

  // ── 5. Trigger download ───────────────────────────────────────────────────
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoke after download has started
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  onProgress(100);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExportPanel() {
  const { exportFormat, exportQuality, setExportFormat, setExportQuality, sourceImage } = useEditorStore();

  const [customW,        setCustomW]        = useState(1920);
  const [customH,        setCustomH]        = useState(1080);
  const [lockRatio,      setLockRatio]      = useState(true);
  const [fitMode,        setFitMode]        = useState<"contain" | "cover">("contain");
  const [progress,       setProgress]       = useState(0);
  const [isExporting,    setIsExporting]    = useState(false);
  const [exportError,    setExportError]    = useState<string | null>(null);
  const [exportDone,     setExportDone]     = useState(false);
  const [activeGroup,    setActiveGroup]    = useState("Screen");

  const ratioRef = useRef<number>(16 / 9);

  function getCurrentCanvasSize(): { w: number; h: number } {
    const c = document.getElementById("main-canvas") as HTMLCanvasElement | null;
    return { w: c?.width ?? 0, h: c?.height ?? 0 };
  }

  // Maintain aspect ratio when typing custom dimensions
  function onWChange(v: number) {
    setCustomW(v);
    if (lockRatio && ratioRef.current > 0) setCustomH(Math.max(1, Math.round(v / ratioRef.current)));
  }
  function onHChange(v: number) {
    setCustomH(v);
    if (lockRatio && ratioRef.current > 0) setCustomW(Math.max(1, Math.round(v * ratioRef.current)));
  }
  function toggleLock() {
    if (!lockRatio) {
      // Locking — capture current ratio
      if (customH > 0) ratioRef.current = customW / customH;
    }
    setLockRatio((v) => !v);
  }

  // ── Run an export ──────────────────────────────────────────────────────────

  const runExport = useCallback(async (
    targetW: number, targetH: number,
    fmt: "png" | "jpeg" | "webp",
    qual: number,
    label: string
  ) => {
    if (!sourceImage) return;
    setExportError(null);
    setExportDone(false);
    setIsExporting(true);
    setProgress(0);

    const slug     = label.toLowerCase().replace(/[^\w-]/g, "-");
    const filename = `proeditor-${slug}-${Date.now()}.${fmt}`;

    try {
      await exportImage({ targetW, targetH, format: fmt, quality: qual, fit: fitMode, filename, onProgress: setProgress });
      setExportDone(true);
    } catch (err: any) {
      setExportError(err?.message ?? "Export failed for an unknown reason.");
    } finally {
      await new Promise((r) => setTimeout(r, 700));
      setIsExporting(false);
      setProgress(0);
    }
  }, [sourceImage, fitMode]);

  function handleCurrentSize() {
    const { w, h } = getCurrentCanvasSize();
    if (w && h) runExport(w, h, exportFormat, exportQuality, `${w}x${h}`);
  }
  function handlePreset(p: ExportPreset) {
    runExport(p.width, p.height, p.format, p.quality, p.name);
  }
  function handleCustom() {
    runExport(customW, customH, exportFormat, exportQuality, `custom-${customW}x${customH}`);
  }

  // Computed values
  const { w: srcW, h: srcH } = getCurrentCanvasSize();
  const customTooLarge = customW > BROWSER_MAX_PX || customH > BROWSER_MAX_PX;

  const progressLabel =
    progress <  10 ? "Preparing…"           :
    progress <  80 ? `Scaling… ${progress}%` :
    progress <  90 ? "Encoding…"             :
    progress <  98 ? "Saving…"               : "Done!";

  const filteredPresets = PRESETS.filter((p) => p.group === activeGroup);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[hsl(215_20%_18%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download size={13} className="text-violet-400" />
            <span className="text-xs font-bold text-white">Export</span>
          </div>
          {srcW > 0 && (
            <span className="text-[9px] font-mono text-gray-600">{srcW}×{srcH} source</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">

        {!sourceImage && (
          <div className="px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-700/30 text-[10px] text-amber-400">
            Load an image to enable export.
          </div>
        )}

        {/* ── Status bar ─────────────────────────────────────────────────── */}
        {isExporting && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Loader2 size={11} className="text-violet-400 animate-spin" />
                <span className="text-[10px] text-violet-400">{progressLabel}</span>
              </div>
              <span className="text-[9px] font-mono text-gray-600">{progress}%</span>
            </div>
            <div className="h-1.5 bg-[hsl(220_15%_14%)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {exportDone && !isExporting && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-900/20 border border-green-700/30">
            <CheckCircle2 size={12} className="text-green-400 shrink-0" />
            <span className="text-[10px] text-green-400">Download started — check your Downloads folder.</span>
          </div>
        )}

        {exportError && !isExporting && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-900/20 border border-red-700/30">
            <AlertTriangle size={12} className="text-red-400 shrink-0 mt-0.5" />
            <span className="text-[10px] text-red-400 leading-relaxed whitespace-pre-wrap">{exportError}</span>
          </div>
        )}

        {/* ── Format ─────────────────────────────────────────────────────── */}
        <div>
          <div className="panel-section-header">FORMAT</div>
          <div className="grid grid-cols-3 gap-1 mt-1.5">
            {(["png", "jpeg", "webp"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setExportFormat(f)}
                className={`py-2 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all border ${
                  exportFormat === f
                    ? "bg-violet-600 border-violet-500 text-white"
                    : "border-[hsl(220_15%_18%)] text-gray-500 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-gray-600 mt-1 text-center">
            {exportFormat === "png"  && "Lossless · Transparency · Largest files"}
            {exportFormat === "jpeg" && "Lossy compression · Smallest files · No transparency"}
            {exportFormat === "webp" && "Modern · Best ratio · Supported everywhere"}
          </p>
        </div>

        {/* ── Quality ────────────────────────────────────────────────────── */}
        {exportFormat !== "png" && (
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Quality</span>
              <span className="text-[10px] text-violet-400 font-mono">{exportQuality}%</span>
            </div>
            <input type="range" min={1} max={100} value={exportQuality}
              onChange={(e) => setExportQuality(Number(e.target.value))}
              className="w-full" />
          </div>
        )}

        {/* ── Fit mode ───────────────────────────────────────────────────── */}
        <div>
          <div className="panel-section-header">WHEN ASPECT RATIO DIFFERS</div>
          <div className="grid grid-cols-2 gap-1 mt-1.5">
            <button
              onClick={() => setFitMode("contain")}
              className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all border ${
                fitMode === "contain"
                  ? "bg-violet-900/40 border-violet-700/60 text-violet-300"
                  : "border-[hsl(220_15%_18%)] text-gray-500 hover:text-white"
              }`}
            >
              <Maximize size={10} />
              Fit (letterbox)
            </button>
            <button
              onClick={() => setFitMode("cover")}
              className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all border ${
                fitMode === "cover"
                  ? "bg-violet-900/40 border-violet-700/60 text-violet-300"
                  : "border-[hsl(220_15%_18%)] text-gray-500 hover:text-white"
              }`}
            >
              <Crop size={10} />
              Fill (crop edges)
            </button>
          </div>
        </div>

        {/* ── Quick export at current size ───────────────────────────────── */}
        <button
          onClick={handleCurrentSize}
          disabled={!sourceImage || isExporting}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            sourceImage && !isExporting
              ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-900/30"
              : "bg-[hsl(220_15%_14%)] text-gray-600 cursor-not-allowed"
          }`}
        >
          <Download size={14} />
          Export at original size {srcW > 0 ? `(${srcW}×${srcH})` : ""}
        </button>

        {/* ── Resolution presets ─────────────────────────────────────────── */}
        <div>
          <div className="panel-section-header">RESOLUTION PRESETS</div>

          {/* Group tabs */}
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {PRESET_GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all border ${
                  activeGroup === g
                    ? "bg-violet-900/40 border-violet-700/50 text-violet-300"
                    : "border-[hsl(220_15%_18%)] text-gray-600 hover:text-gray-300"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-0.5 mt-1.5">
            {filteredPresets.map((p) => {
              const over = p.width > BROWSER_MAX_PX || p.height > BROWSER_MAX_PX;
              const isUpscale = srcW > 0 && (p.width > srcW || p.height > srcH);
              return (
                <button
                  key={p.name}
                  onClick={() => !over && !isExporting && handlePreset(p)}
                  disabled={!sourceImage || isExporting || over}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all group ${
                    !sourceImage || isExporting || over
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-[hsl(220_15%_15%)] cursor-pointer"
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-[hsl(220_15%_13%)] flex items-center justify-center text-violet-400 shrink-0">
                    {p.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-gray-300 font-medium leading-tight">{p.name}</div>
                    <div className="text-[9px] text-gray-600 leading-tight">
                      {p.width}×{p.height} · {p.description}
                      {isUpscale && !over && (
                        <span className="text-amber-600 ml-1">↑ upscale</span>
                      )}
                      {over && <span className="text-red-500 ml-1">⚠ too large</span>}
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-gray-700 group-hover:text-gray-500 uppercase shrink-0">
                    {p.format}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Custom size ────────────────────────────────────────────────── */}
        <div>
          <div className="panel-section-header">CUSTOM SIZE</div>
          <div className="flex gap-2 mt-1.5 items-end">
            <div className="flex-1">
              <div className="text-[9px] text-gray-600 mb-1">Width px</div>
              <input
                type="number" min={1} max={BROWSER_MAX_PX}
                value={customW}
                onChange={(e) => onWChange(Math.max(1, Number(e.target.value)))}
                className="w-full bg-[hsl(222_18%_11%)] border border-[hsl(220_15%_18%)] text-xs text-white rounded-md px-2 py-1.5 outline-none focus:border-violet-700"
              />
            </div>
            <button
              onClick={toggleLock}
              className={`mb-0.5 p-1.5 rounded border transition-all ${
                lockRatio
                  ? "bg-violet-900/40 border-violet-700/60 text-violet-400"
                  : "border-[hsl(220_15%_18%)] text-gray-600 hover:text-gray-400"
              }`}
              title={lockRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
            >
              {lockRatio ? <Lock size={10} /> : <Unlock size={10} />}
            </button>
            <div className="flex-1">
              <div className="text-[9px] text-gray-600 mb-1">Height px</div>
              <input
                type="number" min={1} max={BROWSER_MAX_PX}
                value={customH}
                onChange={(e) => onHChange(Math.max(1, Number(e.target.value)))}
                className="w-full bg-[hsl(222_18%_11%)] border border-[hsl(220_15%_18%)] text-xs text-white rounded-md px-2 py-1.5 outline-none focus:border-violet-700"
              />
            </div>
          </div>

          {/* Upscale warning */}
          {srcW > 0 && (customW > srcW || customH > srcH) && !customTooLarge && (
            <div className="mt-1.5 flex items-start gap-2 px-2 py-1.5 rounded-lg bg-amber-900/15 border border-amber-800/30">
              <AlertTriangle size={10} className="text-amber-500 shrink-0 mt-0.5" />
              <span className="text-[9px] text-amber-500 leading-snug">
                Your source image is {srcW}×{srcH}. Exporting larger will upscale — you cannot recover detail that isn't in the original photo.
                Use the original resolution or smaller for best quality.
              </span>
            </div>
          )}

          {/* Over-limit error */}
          {customTooLarge && (
            <div className="mt-1.5 flex items-start gap-2 px-2 py-1.5 rounded-lg bg-red-900/20 border border-red-700/30">
              <AlertTriangle size={10} className="text-red-400 shrink-0 mt-0.5" />
              <span className="text-[9px] text-red-400 leading-snug">
                Exceeds browser canvas limit of {BROWSER_MAX_PX}px per side.
              </span>
            </div>
          )}

          <button
            onClick={handleCustom}
            disabled={!sourceImage || isExporting || customTooLarge}
            className={`w-full mt-2 py-1.5 text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              sourceImage && !isExporting && !customTooLarge
                ? "bg-[hsl(220_15%_16%)] text-gray-300 hover:text-white hover:bg-[hsl(220_15%_20%)]"
                : "bg-[hsl(220_15%_12%)] text-gray-600 cursor-not-allowed"
            }`}
          >
            <Download size={11} />
            Export at {customW}×{customH}
          </button>
        </div>

        {/* ── Quality note ───────────────────────────────────────────────── */}
        <div className="px-3 py-2 rounded-lg bg-[hsl(222_18%_10%)] border border-[hsl(220_15%_15%)]">
          <p className="text-[9px] text-gray-600 leading-relaxed">
            <strong className="text-gray-500">How quality works:</strong> All exports read
            from the full-resolution main canvas (not a screen screenshot), including every
            brush stroke, adjustment, and filter. Downscaling uses iterative halving for
            sharpness. Exporting <em>larger</em> than your source photo upscales — the maximum
            real quality is always limited by the original image resolution.
          </p>
        </div>

      </div>
    </div>
  );
}
