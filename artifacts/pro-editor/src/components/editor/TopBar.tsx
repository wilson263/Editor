import { useEditorStore } from "@/lib/editorStore";
import { RESOLUTIONS } from "@/lib/imageUtils";
import {
  Undo2, Redo2, Download, Upload, ZoomIn, ZoomOut, Monitor,
  Film, Save, Share2, Settings, ChevronDown, Grid3X3, Ruler,
  RotateCcw, Maximize2, SlidersHorizontal, History, Eye, Columns2,
  Copy, FileImage, Clipboard, FolderOpen, Printer, Link2, Check,
  LayoutTemplate, Sparkles
} from "lucide-react";
import { useRef, useState, useCallback } from "react";

export default function TopBar() {
  const {
    mode, setMode, zoom, setZoom, resolution, setResolution,
    setSourceImage, setSourceVideo, adjustments, selectedFilter,
    undo, redo, history, historyIndex,
    showGrid, toggleGrid, showRulers, toggleRulers,
    exportFormat, exportQuality, setExportFormat, setExportQuality,
    toggleBeforeAfter, showBeforeAfter, layers, resetAdjustments,
    setActivePanel
  } = useEditorStore();

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showZoomMenu, setShowZoomMenu] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setSourceImage(src);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSourceVideo(url);
  }

  function handleExport() {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement("a");
    const mimeMap = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" };
    link.download = `proeditor-${Date.now()}.${exportFormat}`;
    link.href = canvas.toDataURL(mimeMap[exportFormat], exportQuality / 100);
    link.click();
    setShowExportMenu(false);
  }

  function handleCopyToClipboard() {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch {
        // Fallback: download
        handleExport();
      }
    });
  }

  async function handleBatchExport() {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const formats: Array<{ format: string; mime: string; suffix: string }> = [
      { format: "PNG", mime: "image/png", suffix: "png" },
      { format: "JPEG", mime: "image/jpeg", suffix: "jpg" },
      { format: "WebP", mime: "image/webp", suffix: "webp" },
    ];

    for (const f of formats) {
      await new Promise<void>((resolve) => {
        const link = document.createElement("a");
        link.download = `proeditor-export.${f.suffix}`;
        link.href = canvas.toDataURL(f.mime, exportQuality / 100);
        link.click();
        setTimeout(resolve, 200);
      });
    }
    setShowExportMenu(false);
  }

  function handlePrintExport() {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><body style="margin:0"><img src="${dataUrl}" style="max-width:100%;display:block" /><script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
    setShowExportMenu(false);
  }

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const ZOOM_PRESETS = [10, 25, 50, 75, 100, 150, 200, 400, 800, 1600];

  return (
    <div
      className="h-11 bg-[hsl(222_18%_7%)] border-b border-[hsl(220_15%_13%)] flex items-center px-2 gap-1.5 shrink-0 z-50 shadow-lg"
      onClick={(e) => {
        // Close menus when clicking outside
        const target = e.target as Element;
        if (!target.closest("[data-menu]")) {
          setShowExportMenu(false);
          setShowZoomMenu(false);
          setShowFileMenu(false);
        }
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 min-w-[130px] mr-1 shrink-0">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg">
          <Sparkles size={12} className="text-white" />
        </div>
        <span className="font-bold text-white text-sm tracking-tight">ProEditor</span>
        <span className="pro-badge">PRO</span>
      </div>

      <div className="h-5 w-px bg-[hsl(220_15%_16%)]" />

      {/* Mode Switch */}
      <div className="mode-pill shrink-0">
        <button
          onClick={() => setMode("photo")}
          className={`mode-pill-btn ${mode === "photo" ? "active" : ""}`}
        >
          <Monitor size={11} className="inline mr-1" />Photo
        </button>
        <button
          onClick={() => setMode("video")}
          className={`mode-pill-btn ${mode === "video" ? "active" : ""}`}
        >
          <Film size={11} className="inline mr-1" />Video
        </button>
      </div>

      <div className="h-5 w-px bg-[hsl(220_15%_16%)]" />

      {/* File Menu */}
      <div className="relative shrink-0" data-menu>
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />

        <button
          onClick={() => setShowFileMenu(!showFileMenu)}
          className="action-btn text-[11px]"
        >
          <FolderOpen size={11} /> Open
          <ChevronDown size={9} className="ml-0.5" />
        </button>

        {showFileMenu && (
          <div className="absolute top-full left-0 mt-1 bg-[hsl(222_18%_12%)] border border-[hsl(220_15%_20%)] rounded-xl shadow-2xl z-50 py-1.5 w-44">
            <button
              onClick={() => { imageInputRef.current?.click(); setShowFileMenu(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] text-gray-300 hover:bg-[hsl(220_15%_16%)] hover:text-white transition-all"
            >
              <FileImage size={12} className="text-violet-400" /> Open Image
            </button>
            <button
              onClick={() => { videoInputRef.current?.click(); setShowFileMenu(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] text-gray-300 hover:bg-[hsl(220_15%_16%)] hover:text-white transition-all"
            >
              <Film size={12} className="text-violet-400" /> Open Video
            </button>
            <div className="h-px bg-[hsl(220_15%_18%)] my-1" />
            <button
              onClick={() => { setActivePanel("collage"); setShowFileMenu(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] text-gray-300 hover:bg-[hsl(220_15%_16%)] hover:text-white transition-all"
            >
              <LayoutTemplate size={12} className="text-violet-400" /> New Collage
            </button>
          </div>
        )}
      </div>

      <div className="h-5 w-px bg-[hsl(220_15%_16%)]" />

      {/* History */}
      <div className="flex items-center shrink-0">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-1.5 rounded transition-all ${canUndo ? "text-gray-400 hover:text-white hover:bg-[hsl(220_15%_16%)]" : "text-gray-700 cursor-not-allowed"}`}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={14} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-1.5 rounded transition-all ${canRedo ? "text-gray-400 hover:text-white hover:bg-[hsl(220_15%_16%)]" : "text-gray-700 cursor-not-allowed"}`}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 size={14} />
        </button>
      </div>

      <div className="h-5 w-px bg-[hsl(220_15%_16%)]" />

      {/* View toggles */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={toggleGrid}
          className={`p-1.5 rounded transition-all ${showGrid ? "text-violet-400 bg-violet-900/20" : "text-gray-600 hover:text-gray-300"}`}
          title="Toggle Grid (Ctrl+')"
        >
          <Grid3X3 size={13} />
        </button>
        <button
          onClick={toggleRulers}
          className={`p-1.5 rounded transition-all ${showRulers ? "text-violet-400 bg-violet-900/20" : "text-gray-600 hover:text-gray-300"}`}
          title="Toggle Rulers (Ctrl+R)"
        >
          <Ruler size={13} />
        </button>
        <button
          onClick={toggleBeforeAfter}
          className={`p-1.5 rounded transition-all ${showBeforeAfter ? "text-violet-400 bg-violet-900/20" : "text-gray-600 hover:text-gray-300"}`}
          title="Before/After Comparison"
        >
          <Columns2 size={13} />
        </button>
        <button
          onClick={handleCopyToClipboard}
          className={`p-1.5 rounded transition-all ${copySuccess ? "text-green-400" : "text-gray-600 hover:text-gray-300"}`}
          title="Copy to Clipboard"
        >
          {copySuccess ? <Check size={13} /> : <Clipboard size={13} />}
        </button>
      </div>

      <div className="h-5 w-px bg-[hsl(220_15%_16%)]" />

      {/* Zoom */}
      <div className="relative shrink-0" data-menu>
        <div
          className="flex items-center gap-1 bg-[hsl(222_18%_11%)] border border-[hsl(220_15%_18%)] rounded-md px-1.5 py-1 cursor-pointer hover:border-[hsl(220_15%_28%)]"
          onClick={() => setShowZoomMenu(!showZoomMenu)}
        >
          <button onClick={(e) => { e.stopPropagation(); setZoom(zoom - 10); }} className="text-gray-400 hover:text-white p-0.5">
            <ZoomOut size={12} />
          </button>
          <span className="text-xs text-white font-mono w-9 text-center select-none">{zoom}%</span>
          <button onClick={(e) => { e.stopPropagation(); setZoom(zoom + 10); }} className="text-gray-400 hover:text-white p-0.5">
            <ZoomIn size={12} />
          </button>
        </div>
        {showZoomMenu && (
          <div className="absolute top-full left-0 mt-1 bg-[hsl(222_18%_12%)] border border-[hsl(220_15%_20%)] rounded-lg shadow-xl z-50 py-1 min-w-[100px]">
            {ZOOM_PRESETS.map((z) => (
              <button
                key={z}
                onClick={() => { setZoom(z); setShowZoomMenu(false); }}
                className={`w-full px-3 py-1.5 text-left text-xs transition-all hover:bg-[hsl(220_15%_16%)] ${zoom === z ? "text-violet-400" : "text-gray-300"}`}
              >
                {z}%
              </button>
            ))}
            <div className="h-px bg-[hsl(220_15%_16%)] my-1" />
            <button
              onClick={() => { setZoom(100); setShowZoomMenu(false); }}
              className="w-full px-3 py-1.5 text-left text-xs text-gray-300 hover:bg-[hsl(220_15%_16%)] transition-all"
            >
              100% — Actual Size
            </button>
          </div>
        )}
      </div>

      {/* Resolution */}
      <div className="relative flex items-center shrink-0">
        <select
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          className="bg-[hsl(222_18%_11%)] border border-[hsl(220_15%_18%)] text-[11px] text-gray-300 rounded-md px-2 py-1.5 outline-none hover:border-[hsl(220_15%_28%)] transition-all appearance-none pr-6 cursor-pointer"
        >
          {RESOLUTIONS.map((r) => (
            <option key={r.label} value={r.label}>{r.label}</option>
          ))}
        </select>
        <ChevronDown size={10} className="absolute right-1.5 text-gray-500 pointer-events-none" />
      </div>

      <div className="flex-1" />

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => setActivePanel("ai")}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-violet-600/80 to-fuchsia-600/80 hover:from-violet-600 hover:to-fuchsia-600 text-white text-[11px] font-semibold rounded-lg transition-all shadow-lg"
          title="AI Tools"
        >
          <Sparkles size={11} /> AI Tools
        </button>

        <button className="p-1.5 rounded text-gray-500 hover:text-gray-300 hover:bg-[hsl(220_15%_14%)] transition-all" title="Settings">
          <Settings size={14} />
        </button>
        <button className="p-1.5 rounded text-gray-500 hover:text-gray-300 hover:bg-[hsl(220_15%_14%)] transition-all" title="Share">
          <Share2 size={14} />
        </button>

        <div className="relative" data-menu>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="action-btn-primary action-btn"
          >
            <Download size={12} /> Export
            <ChevronDown size={10} className="ml-0.5" />
          </button>

          {showExportMenu && (
            <div className="absolute top-full right-0 mt-1 bg-[hsl(222_18%_12%)] border border-[hsl(220_15%_20%)] rounded-xl shadow-2xl z-50 p-4 w-60">
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Export Format</div>
              <div className="flex gap-1.5 mb-4">
                {(["png", "jpeg", "webp"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setExportFormat(f)}
                    className={`export-format-btn flex-1 ${exportFormat === f ? "active" : ""}`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>

              {exportFormat !== "png" && (
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] text-gray-500">Quality</span>
                    <span className="text-[10px] text-white font-mono">{exportQuality}%</span>
                  </div>
                  <input
                    type="range" min={50} max={100} value={exportQuality}
                    onChange={(e) => setExportQuality(Number(e.target.value))}
                  />
                </div>
              )}

              <div className="flex flex-col gap-1 mb-3">
                <button
                  onClick={handleExport}
                  className="w-full action-btn-primary action-btn justify-center py-2"
                >
                  <Download size={13} /> Export as {exportFormat.toUpperCase()}
                </button>
                <button
                  onClick={handleCopyToClipboard}
                  className="w-full action-btn justify-center py-1.5"
                >
                  <Clipboard size={12} />
                  {copySuccess ? "Copied!" : "Copy to Clipboard"}
                </button>
              </div>

              <div className="h-px bg-[hsl(220_15%_18%)] mb-3" />
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Advanced</div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={handleBatchExport}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[hsl(220_15%_16%)] text-[11px] text-gray-400 hover:text-white transition-all"
                >
                  <Copy size={11} /> Batch Export (PNG + JPG + WebP)
                </button>
                <button
                  onClick={handlePrintExport}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[hsl(220_15%_16%)] text-[11px] text-gray-400 hover:text-white transition-all"
                >
                  <Printer size={11} /> Print / Export as PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
