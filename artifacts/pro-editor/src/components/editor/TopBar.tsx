import { useEditorStore } from "@/lib/editorStore";
import { RESOLUTIONS } from "@/lib/imageUtils";
import {
  Undo2, Redo2, Download, ZoomIn, ZoomOut, Monitor,
  Film, Share2, Settings, ChevronDown, Grid3X3, Ruler,
  Columns2, Copy, FileImage, Clipboard, FolderOpen, Printer,
  LayoutTemplate, Sparkles, Check
} from "lucide-react";
import { useRef, useState } from "react";

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
    reader.onload = (ev) => { setSourceImage(ev.target?.result as string); };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSourceVideo(URL.createObjectURL(file));
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
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch { handleExport(); }
    });
  }

  async function handleBatchExport() {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    for (const f of [
      { mime: "image/png", suffix: "png" },
      { mime: "image/jpeg", suffix: "jpg" },
      { mime: "image/webp", suffix: "webp" },
    ]) {
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
    w.document.write(`<html><body style="margin:0"><img src="${dataUrl}" style="max-width:100%;display:block"/><script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
    setShowExportMenu(false);
  }

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const ZOOM_PRESETS = [10, 25, 50, 75, 100, 150, 200, 400, 800, 1600];

  return (
    <div
      className="shrink-0 z-50"
      style={{
        height: "46px",
        background: "linear-gradient(180deg, #0a0818 0%, #060412 100%)",
        borderBottom: "1px solid rgba(139,92,246,0.12)",
        boxShadow: "0 1px 0 rgba(139,92,246,0.05), 0 4px 24px rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
        gap: "6px",
        position: "relative",
      }}
      onClick={(e) => {
        const target = e.target as Element;
        if (!target.closest("[data-menu]")) {
          setShowExportMenu(false);
          setShowZoomMenu(false);
          setShowFileMenu(false);
        }
      }}
    >
      {/* Subtle top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(236,72,153,0.3), transparent)",
        pointerEvents: "none",
      }} />

      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0 mr-1" style={{ minWidth: "148px" }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "8px",
          background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 12px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}>
          <Sparkles size={13} className="text-white" />
        </div>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700, fontSize: "15px", letterSpacing: "-0.3px", color: "white",
        }}>ProEditor</span>
        <span className="pro-badge">PRO</span>
      </div>

      {/* Divider */}
      <div style={{ width: "1px", height: "20px", background: "rgba(139,92,246,0.15)", flexShrink: 0 }} />

      {/* Mode Switch */}
      <div className="mode-pill shrink-0">
        <button onClick={() => setMode("photo")} className={`mode-pill-btn ${mode === "photo" ? "active" : ""}`}>
          <Monitor size={11} /> Photo
        </button>
        <button onClick={() => setMode("video")} className={`mode-pill-btn ${mode === "video" ? "active" : ""}`}>
          <Film size={11} /> Video
        </button>
      </div>

      <div style={{ width: "1px", height: "20px", background: "rgba(139,92,246,0.15)", flexShrink: 0 }} />

      {/* File Menu */}
      <div className="relative shrink-0" data-menu>
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
        <button onClick={() => setShowFileMenu(!showFileMenu)} className="action-btn">
          <FolderOpen size={11} /> Open <ChevronDown size={9} className="ml-0.5" />
        </button>
        {showFileMenu && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 50,
            background: "#0d0b22", border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: "12px", boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(139,92,246,0.05)",
            padding: "6px", minWidth: "160px",
          }}>
            <button onClick={() => { imageInputRef.current?.click(); setShowFileMenu(false); }} style={{
              width: "100%", display: "flex", alignItems: "center", gap: "8px",
              padding: "7px 10px", fontSize: "11px", color: "rgba(255,255,255,0.65)",
              background: "none", border: "none", borderRadius: "7px", cursor: "pointer",
              transition: "all 0.15s",
            }}
              onMouseOver={e => (e.currentTarget.style.background = "rgba(139,92,246,0.12)")}
              onMouseOut={e => (e.currentTarget.style.background = "none")}
            >
              <FileImage size={12} style={{ color: "#a78bfa" }} /> Open Image
            </button>
            <button onClick={() => { videoInputRef.current?.click(); setShowFileMenu(false); }} style={{
              width: "100%", display: "flex", alignItems: "center", gap: "8px",
              padding: "7px 10px", fontSize: "11px", color: "rgba(255,255,255,0.65)",
              background: "none", border: "none", borderRadius: "7px", cursor: "pointer",
              transition: "all 0.15s",
            }}
              onMouseOver={e => (e.currentTarget.style.background = "rgba(139,92,246,0.12)")}
              onMouseOut={e => (e.currentTarget.style.background = "none")}
            >
              <Film size={12} style={{ color: "#a78bfa" }} /> Open Video
            </button>
            <div style={{ height: "1px", background: "rgba(139,92,246,0.1)", margin: "4px 8px" }} />
            <button onClick={() => { setActivePanel("collage"); setShowFileMenu(false); }} style={{
              width: "100%", display: "flex", alignItems: "center", gap: "8px",
              padding: "7px 10px", fontSize: "11px", color: "rgba(255,255,255,0.65)",
              background: "none", border: "none", borderRadius: "7px", cursor: "pointer",
              transition: "all 0.15s",
            }}
              onMouseOver={e => (e.currentTarget.style.background = "rgba(139,92,246,0.12)")}
              onMouseOut={e => (e.currentTarget.style.background = "none")}
            >
              <LayoutTemplate size={12} style={{ color: "#a78bfa" }} /> New Collage
            </button>
          </div>
        )}
      </div>

      <div style={{ width: "1px", height: "20px", background: "rgba(139,92,246,0.15)", flexShrink: 0 }} />

      {/* History controls */}
      <div className="flex items-center gap-0.5 shrink-0">
        {[
          { action: undo, enabled: canUndo, icon: <Undo2 size={14} />, title: "Undo (Ctrl+Z)" },
          { action: redo, enabled: canRedo, icon: <Redo2 size={14} />, title: "Redo (Ctrl+Shift+Z)" },
        ].map(({ action, enabled, icon, title }, i) => (
          <button key={i} onClick={action} disabled={!enabled} title={title} style={{
            width: "28px", height: "28px", borderRadius: "7px", border: "none",
            background: "none", cursor: enabled ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: enabled ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.12)",
            transition: "all 0.15s",
          }}
            onMouseOver={e => enabled && (e.currentTarget.style.background = "rgba(255,255,255,0.06)", e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
            onMouseOut={e => (e.currentTarget.style.background = "none", e.currentTarget.style.color = enabled ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.12)")}
          >
            {icon}
          </button>
        ))}
      </div>

      <div style={{ width: "1px", height: "20px", background: "rgba(139,92,246,0.15)", flexShrink: 0 }} />

      {/* View toggles */}
      <div className="flex items-center gap-0.5 shrink-0">
        {[
          { active: showGrid, action: toggleGrid, icon: <Grid3X3 size={13} />, title: "Toggle Grid (Ctrl+')" },
          { active: showRulers, action: toggleRulers, icon: <Ruler size={13} />, title: "Toggle Rulers (Ctrl+R)" },
          { active: showBeforeAfter, action: toggleBeforeAfter, icon: <Columns2 size={13} />, title: "Before/After" },
          { active: copySuccess, action: handleCopyToClipboard, icon: copySuccess ? <Check size={13} /> : <Clipboard size={13} />, title: "Copy to Clipboard" },
        ].map(({ active, action, icon, title }, i) => (
          <button key={i} onClick={action} title={title} style={{
            width: "28px", height: "28px", borderRadius: "7px", border: "none",
            background: active ? "rgba(139,92,246,0.18)" : "none",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: active ? "#c4b5fd" : "rgba(255,255,255,0.3)",
            transition: "all 0.15s",
            boxShadow: active ? "0 0 10px rgba(139,92,246,0.15)" : "none",
          }}
            onMouseOver={e => !active && (e.currentTarget.style.background = "rgba(255,255,255,0.05)", e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
            onMouseOut={e => !active && (e.currentTarget.style.background = "none", e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
          >
            {icon}
          </button>
        ))}
      </div>

      <div style={{ width: "1px", height: "20px", background: "rgba(139,92,246,0.15)", flexShrink: 0 }} />

      {/* Zoom */}
      <div className="relative shrink-0" data-menu>
        <div onClick={() => setShowZoomMenu(!showZoomMenu)} style={{
          display: "flex", alignItems: "center", gap: "4px",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "7px", padding: "3px 6px", cursor: "pointer",
          transition: "border-color 0.15s",
        }}>
          <button onClick={(e) => { e.stopPropagation(); setZoom(zoom - 10); }} style={{ background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.4)",display:"flex",padding:"2px" }}>
            <ZoomOut size={11} />
          </button>
          <span style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255,255,255,0.7)", width: "38px", textAlign: "center", userSelect: "none" }}>
            {zoom}%
          </span>
          <button onClick={(e) => { e.stopPropagation(); setZoom(zoom + 10); }} style={{ background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.4)",display:"flex",padding:"2px" }}>
            <ZoomIn size={11} />
          </button>
        </div>
        {showZoomMenu && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 50,
            background: "#0d0b22", border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: "10px", boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
            padding: "4px", minWidth: "96px",
          }}>
            {ZOOM_PRESETS.map((z) => (
              <button key={z} onClick={() => { setZoom(z); setShowZoomMenu(false); }} style={{
                width: "100%", padding: "5px 12px", fontSize: "11px", textAlign: "left",
                background: "none", border: "none", borderRadius: "6px", cursor: "pointer",
                color: zoom === z ? "#c4b5fd" : "rgba(255,255,255,0.55)", transition: "all 0.15s",
              }}
                onMouseOver={e => (e.currentTarget.style.background = "rgba(139,92,246,0.12)")}
                onMouseOut={e => (e.currentTarget.style.background = "none")}
              >
                {z}%
              </button>
            ))}
            <div style={{ height: "1px", background: "rgba(139,92,246,0.1)", margin: "4px 8px" }} />
            <button onClick={() => { setZoom(100); setShowZoomMenu(false); }} style={{
              width: "100%", padding: "5px 12px", fontSize: "11px", textAlign: "left",
              background: "none", border: "none", borderRadius: "6px", cursor: "pointer",
              color: "rgba(255,255,255,0.4)", transition: "all 0.15s",
            }}
              onMouseOver={e => (e.currentTarget.style.background = "rgba(139,92,246,0.12)")}
              onMouseOut={e => (e.currentTarget.style.background = "none")}
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
          style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.55)", borderRadius: "7px",
            fontSize: "11px", padding: "4px 22px 4px 8px", outline: "none",
            appearance: "none", cursor: "pointer", transition: "border-color 0.15s",
          }}
        >
          {RESOLUTIONS.map((r) => <option key={r.label} value={r.label}>{r.label}</option>)}
        </select>
        <ChevronDown size={10} style={{ position: "absolute", right: "6px", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* AI Tools button — premium gradient */}
        <button onClick={() => setActivePanel("ai")} style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "5px 14px", borderRadius: "8px",
          background: "linear-gradient(135deg, rgba(139,92,246,0.85), rgba(236,72,153,0.7))",
          color: "white", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 700,
          boxShadow: "0 2px 16px rgba(139,92,246,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
          letterSpacing: "0.3px", transition: "all 0.2s",
        }}
          onMouseOver={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(139,92,246,0.7), inset 0 1px 0 rgba(255,255,255,0.2)"; }}
          onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(139,92,246,0.45), inset 0 1px 0 rgba(255,255,255,0.15)"; }}
        >
          <Sparkles size={12} /> AI Tools
        </button>

        {[
          { icon: <Settings size={14} />, title: "Settings" },
          { icon: <Share2 size={14} />, title: "Share" },
        ].map(({ icon, title }, i) => (
          <button key={i} title={title} style={{
            width: "30px", height: "30px", borderRadius: "8px", border: "none",
            background: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,0.3)", transition: "all 0.15s",
          }}
            onMouseOver={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)", e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            onMouseOut={e => (e.currentTarget.style.background = "none", e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
          >
            {icon}
          </button>
        ))}

        {/* Export */}
        <div className="relative" data-menu>
          <button onClick={() => setShowExportMenu(!showExportMenu)} className="action-btn action-btn-primary" style={{ gap: "5px" }}>
            <Download size={12} /> Export <ChevronDown size={10} />
          </button>
          {showExportMenu && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 50,
              background: "#0d0b22", border: "1px solid rgba(139,92,246,0.2)",
              borderRadius: "14px", boxShadow: "0 24px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(139,92,246,0.05)",
              padding: "16px", width: "240px",
            }}>
              <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "12px" }}>Format</div>
              <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
                {(["png", "jpeg", "webp"] as const).map((f) => (
                  <button key={f} onClick={() => setExportFormat(f)} className={`export-format-btn flex-1`}
                    style={{ flex: 1, fontWeight: exportFormat === f ? 700 : 600,
                      background: exportFormat === f ? "rgba(139,92,246,0.2)" : "none",
                      color: exportFormat === f ? "#c4b5fd" : "rgba(255,255,255,0.35)",
                      border: exportFormat === f ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >{f.toUpperCase()}</button>
                ))}
              </div>
              {exportFormat !== "png" && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>Quality</span>
                    <span style={{ fontSize: "10px", color: "#c4b5fd", fontFamily: "monospace", fontWeight: 700 }}>{exportQuality}%</span>
                  </div>
                  <input type="range" min={50} max={100} value={exportQuality} onChange={(e) => setExportQuality(Number(e.target.value))} />
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px" }}>
                <button onClick={handleExport} className="action-btn action-btn-primary" style={{ justifyContent: "center", padding: "8px" }}>
                  <Download size={13} /> Export as {exportFormat.toUpperCase()}
                </button>
                <button onClick={handleCopyToClipboard} className="action-btn" style={{ justifyContent: "center", padding: "7px" }}>
                  <Clipboard size={12} />{copySuccess ? " Copied!" : " Copy to Clipboard"}
                </button>
              </div>
              <div style={{ height: "1px", background: "rgba(139,92,246,0.1)", margin: "8px 0" }} />
              <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "8px" }}>Advanced</div>
              {[
                { action: handleBatchExport, icon: <Copy size={11} />, label: "Batch Export (PNG+JPG+WebP)" },
                { action: handlePrintExport, icon: <Printer size={11} />, label: "Print / Export as PDF" },
              ].map(({ action, icon, label }) => (
                <button key={label} onClick={action} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "7px",
                  padding: "6px 8px", borderRadius: "7px", background: "none", border: "none",
                  fontSize: "11px", color: "rgba(255,255,255,0.4)", cursor: "pointer",
                  transition: "all 0.15s", textAlign: "left",
                }}
                  onMouseOver={e => (e.currentTarget.style.background = "rgba(139,92,246,0.12)", e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
                  onMouseOut={e => (e.currentTarget.style.background = "none", e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
