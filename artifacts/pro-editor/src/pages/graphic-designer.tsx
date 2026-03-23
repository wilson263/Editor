import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";

type Tool = "select" | "text" | "shape" | "image" | "sticker" | "pen" | "eraser";
type Layer = {
  id: string; type: "text" | "shape" | "image" | "sticker"; x: number; y: number; w: number; h: number;
  content?: string; color?: string; bg?: string; fontSize?: number; fontFamily?: string;
  shape?: "rect" | "circle" | "triangle" | "star"; opacity?: number; rotation?: number; locked?: boolean; visible?: boolean;
};
type Template = { id: string; label: string; w: number; h: number; icon: string; category: string };

const TEMPLATES: Template[] = [
  { id: "ig_post", label: "Instagram Post", w: 1080, h: 1080, icon: "📷", category: "Social" },
  { id: "ig_story", label: "Instagram Story", w: 1080, h: 1920, icon: "📱", category: "Social" },
  { id: "yt_thumb", label: "YouTube Thumbnail", w: 1280, h: 720, icon: "▶️", category: "Social" },
  { id: "yt_banner", label: "YouTube Banner", w: 2560, h: 1440, icon: "📺", category: "Social" },
  { id: "poster", label: "Poster A4", w: 794, h: 1123, icon: "🗒️", category: "Print" },
  { id: "logo", label: "Logo", w: 800, h: 800, icon: "✦", category: "Branding" },
  { id: "banner", label: "Web Banner", w: 1200, h: 400, icon: "🌐", category: "Web" },
  { id: "business", label: "Business Card", w: 1050, h: 600, icon: "💼", category: "Print" },
  { id: "presentation", label: "Presentation", w: 1920, h: 1080, icon: "📊", category: "Docs" },
  { id: "resume", label: "Resume", w: 794, h: 1123, icon: "📄", category: "Docs" },
  { id: "twitter", label: "Twitter Post", w: 1200, h: 675, icon: "🐦", category: "Social" },
  { id: "linkedin", label: "LinkedIn Banner", w: 1584, h: 396, icon: "💼", category: "Social" },
];

const STICKERS = ["🎉", "🔥", "✨", "💎", "🚀", "❤️", "⭐", "🌈", "🎨", "💡", "🎯", "⚡", "🌟", "💫", "🎁", "🏆", "🦋", "🌸", "🎭", "🦄"];
const FONTS = ["Inter", "Space Grotesk", "Roboto", "Poppins", "Playfair Display", "Montserrat", "Oswald", "Raleway", "Lato", "Open Sans"];
const BRAND_COLORS = ["#7c3aed", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316", "#84cc16"];

function renderLayer(
  layer: Layer, selected: boolean, onClick: () => void,
  onDrag: (startX: number, startY: number, curX: number, curY: number) => void,
  scale: number
) {
  if (!layer.visible) return null;
  const style: React.CSSProperties = {
    position: "absolute", left: layer.x, top: layer.y, width: layer.w, height: layer.h,
    opacity: (layer.opacity ?? 100) / 100,
    transform: `rotate(${layer.rotation ?? 0}deg)`,
    cursor: layer.locked ? "not-allowed" : "move",
    userSelect: "none",
    outline: selected ? "2px solid #7c3aed" : "none",
    outlineOffset: 2,
    boxSizing: "border-box",
  };

  let inner: React.ReactNode = null;

  if (layer.type === "text") {
    Object.assign(style, { display: "flex", alignItems: "center", justifyContent: "center", color: layer.color || "#111", fontSize: (layer.fontSize ?? 32), fontFamily: layer.fontFamily || "Inter", fontWeight: 700, textAlign: "center" as const, background: layer.bg || "transparent", wordBreak: "break-word" as const, padding: 8 });
    inner = layer.content || "Your Text";
  } else if (layer.type === "shape") {
    if (layer.shape === "circle") Object.assign(style, { borderRadius: "50%", background: layer.bg || "#7c3aed" });
    else if (layer.shape === "triangle") {
      Object.assign(style, { background: "transparent", width: 0, height: 0, borderLeft: `${layer.w / 2}px solid transparent`, borderRight: `${layer.w / 2}px solid transparent`, borderBottom: `${layer.h}px solid ${layer.bg || "#7c3aed"}` });
    }
    else if (layer.shape === "star") { Object.assign(style, { display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.min(layer.w, layer.h) * 0.8, color: layer.bg || "#f59e0b", background: "transparent" }); inner = "★"; }
    else Object.assign(style, { borderRadius: 8, background: layer.bg || "#7c3aed" });
  } else if (layer.type === "image") {
    Object.assign(style, { background: layer.bg || "#e5e7eb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.min(layer.w, layer.h) * 0.4 });
    inner = "🖼️";
  } else if (layer.type === "sticker") {
    Object.assign(style, { display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.min(layer.w, layer.h) * 0.8, background: "transparent" });
    inner = layer.content || "⭐";
  }

  return (
    <div key={layer.id} style={style} onClick={(e) => { if (layer.locked) return; e.stopPropagation(); onClick(); }}
      onMouseDown={(e) => {
        if (layer.locked) return;
        e.preventDefault();
        const sx = e.clientX, sy = e.clientY;
        const move = (me: MouseEvent) => onDrag(sx, sy, me.clientX, me.clientY);
        const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
      }}>
      {inner}
      {selected && !layer.locked && (
        <>
          <div style={{ position: "absolute", top: -20, left: 0, background: "#7c3aed", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap", pointerEvents: "none" }}>
            {layer.type} · {Math.round(layer.w)}×{Math.round(layer.h)}
          </div>
          {/* Resize handle */}
          <div style={{ position: "absolute", bottom: -4, right: -4, width: 10, height: 10, background: "#7c3aed", borderRadius: 2, cursor: "se-resize" }} />
        </>
      )}
    </div>
  );
}

export default function GraphicDesigner() {
  const [, navigate] = useLocation();
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool>("select");
  const [template, setTemplate] = useState<Template>(TEMPLATES[0]);
  const [showTemplates, setShowTemplates] = useState(true);
  const [zoom, setZoom] = useState(0.5);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [rightTab, setRightTab] = useState<"layers" | "properties" | "ai" | "brand">("layers");
  const [textInput, setTextInput] = useState("Your Text");
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [fontSize, setFontSize] = useState(48);
  const [fillColor, setFillColor] = useState("#7c3aed");
  const [brandColors, setBrandColors] = useState(BRAND_COLORS.slice(0, 5));
  const [aiPrompt, setAiPrompt] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedLayer = layers.find(l => l.id === selected);

  const addLayer = useCallback((type: Layer["type"], extra?: Partial<Layer>) => {
    const id = `layer_${Date.now()}`;
    const base: Layer = {
      id, type, x: Math.round(template.w / 2 - 100), y: Math.round(template.h / 2 - 50),
      w: 200, h: 100, opacity: 100, rotation: 0, visible: true, locked: false,
      ...extra,
    };
    setLayers(prev => [...prev, base]);
    setSelected(id);
  }, [template]);

  const updateLayer = useCallback((id: string, patch: Partial<Layer>) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
  }, []);

  const dragLayer = useCallback((id: string, sx: number, sy: number, cx: number, cy: number) => {
    setLayers(prev => {
      const l = prev.find(x => x.id === id);
      if (!l || l.locked) return prev;
      return prev.map(x => x.id === id ? { ...x, x: Math.round(l.x + (cx - sx) / zoom), y: Math.round(l.y + (cy - sy) / zoom) } : x);
    });
  }, [zoom]);

  const deleteSelected = () => {
    if (!selected) return;
    setLayers(prev => prev.filter(l => l.id !== selected));
    setSelected(null);
  };

  const moveLayer = (id: string, dir: -1 | 1) => {
    setLayers(prev => {
      const i = prev.findIndex(l => l.id === id);
      if (i + dir < 0 || i + dir >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[i + dir]] = [next[i + dir], next[i]];
      return next;
    });
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.round((e.clientX - rect.left) / zoom);
    const y = Math.round((e.clientY - rect.top) / zoom);
    if (tool === "text") {
      addLayer("text", { x: x - 100, y: y - 25, w: 200, h: 50, content: textInput, color: "#111827", bg: "transparent", fontSize, fontFamily: selectedFont });
      setTool("select");
    } else if (tool === "shape") {
      addLayer("shape", { x: x - 60, y: y - 60, w: 120, h: 120, bg: fillColor, shape: "rect" });
      setTool("select");
    } else {
      setSelected(null);
    }
  };

  const exportCanvas = () => {
    const a = document.createElement("a");
    a.href = "#";
    a.download = "design.png";
    alert("Export feature: In production this would render the canvas to PNG/PDF using html2canvas or Konva.");
  };

  if (showTemplates) {
    return (
      <div style={{ height: "100vh", background: "#0a0a14", color: "#e5e7eb", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 52, background: "#1a1a2e", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", padding: "0 24px", gap: 12 }}>
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#a78bfa", fontSize: 22, cursor: "pointer" }}>✦</button>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>Graphic Designer — Choose a Template</span>
          <button onClick={() => { setShowTemplates(false); setTemplate({ id: "custom", label: "Custom", w: 800, h: 600, icon: "🎨", category: "Custom" }); }}
            style={{ marginLeft: "auto", padding: "6px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 13 }}>
            Custom Size
          </button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: 40 }}>
          {["Social", "Print", "Branding", "Web", "Docs"].map(cat => {
            const items = TEMPLATES.filter(t => t.category === cat);
            if (!items.length) return null;
            return (
              <div key={cat} style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>{cat}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                  {items.map(t => (
                    <div key={t.id} onClick={() => { setTemplate(t); setShowTemplates(false); setBgColor("#ffffff"); setLayers([]); }}
                      style={{ width: 160, cursor: "pointer", background: "#13131f", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden", transition: "all 0.2s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#7c3aed"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}>
                      <div style={{ background: "rgba(124,58,237,0.1)", height: 100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
                        {t.icon}
                      </div>
                      <div style={{ padding: "10px 12px" }}>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{t.label}</div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>{t.w}×{t.h}px</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0a0a14", color: "#e5e7eb", fontFamily: "'Inter', sans-serif" }}>
      {/* Top Bar */}
      <div style={{ height: 52, background: "#1a1a2e", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", padding: "0 12px", gap: 8, flexShrink: 0 }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#a78bfa", fontSize: 22, cursor: "pointer" }}>✦</button>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>Graphic Designer</span>
        <span style={{ fontSize: 12, color: "#4b5563", marginLeft: 4 }}>— {template.label} ({template.w}×{template.h})</span>
        <button onClick={() => setShowTemplates(true)} style={{ marginLeft: 4, padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 12 }}>Templates</button>

        {/* Tools */}
        <div style={{ marginLeft: 12, display: "flex", gap: 3, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 3 }}>
          {([
            { id: "select" as Tool, icon: "↖", label: "Select" },
            { id: "text" as Tool, icon: "T", label: "Text" },
            { id: "shape" as Tool, icon: "⬜", label: "Shape" },
            { id: "sticker" as Tool, icon: "⭐", label: "Sticker" },
            { id: "image" as Tool, icon: "🖼", label: "Image" },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTool(t.id)} title={t.label}
              style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: tool === t.id ? "rgba(124,58,237,0.4)" : "transparent", color: tool === t.id ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: t.id === "text" ? 14 : 16, fontWeight: 700 }}>
              {t.icon}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 8, display: "flex", gap: 4 }}>
          <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#9ca3af", borderRadius: 4, width: 26, height: 26, cursor: "pointer", fontSize: 16 }}>−</button>
          <span style={{ fontSize: 12, color: "#6b7280", minWidth: 40, textAlign: "center", lineHeight: "26px" }}>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#9ca3af", borderRadius: 4, width: 26, height: 26, cursor: "pointer", fontSize: 16 }}>+</button>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {selected && <button onClick={deleteSelected} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#f87171", cursor: "pointer", fontSize: 12 }}>🗑</button>}
          <button onClick={exportCanvas} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>⬇ Export</button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left Toolbar */}
        <div style={{ width: 56, background: "#13131f", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: 6 }}>
          {STICKERS.slice(0, 10).map(s => (
            <button key={s} onClick={() => { addLayer("sticker", { content: s, w: 80, h: 80 }); }} title={`Add ${s}`}
              style={{ width: 40, height: 40, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {s}
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, overflow: "auto", background: "#0a0a14", display: "flex", alignItems: "center", justifyContent: "center", padding: 40, cursor: tool !== "select" ? "crosshair" : "default" }}>
          <div style={{
            width: template.w * zoom, height: template.h * zoom,
            background: bgColor,
            boxShadow: "0 8px 60px rgba(0,0,0,0.8)",
            position: "relative", flexShrink: 0, overflow: "hidden",
          }} onClick={handleCanvasClick}>
            <div ref={canvasRef} style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: "top left", width: template.w, height: template.h }}>
              {layers.map(layer =>
                renderLayer(layer, layer.id === selected, () => { if (!layer.locked) setSelected(layer.id); },
                  (sx, sy, cx, cy) => dragLayer(layer.id, sx, sy, cx, cy), zoom)
              )}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ width: 268, background: "#13131f", borderLeft: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {(["layers", "properties", "ai", "brand"] as const).map(tab => (
              <button key={tab} onClick={() => setRightTab(tab)}
                style={{ flex: 1, padding: "10px 0", fontSize: 11, cursor: "pointer", border: "none", background: "none",
                  color: rightTab === tab ? "#a78bfa" : "#6b7280", fontWeight: rightTab === tab ? 700 : 400,
                  borderBottom: rightTab === tab ? "2px solid #7c3aed" : "2px solid transparent", textTransform: "capitalize" }}>
                {tab === "layers" ? "🗂" : tab === "properties" ? "⚙" : tab === "ai" ? "🤖" : "🎨"}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: "auto" }}>
            {/* Canvas BG */}
            <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#6b7280", flex: 1 }}>Canvas BG</span>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: 32, height: 28, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, cursor: "pointer", background: "transparent" }} />
            </div>

            {rightTab === "layers" && (
              <div style={{ padding: 12 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  <button onClick={() => addLayer("text", { content: textInput, w: 200, h: 60, color: "#111827", bg: "transparent", fontSize, fontFamily: selectedFont })}
                    style={{ flex: 1, padding: "7px 0", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 12 }}>+ Text</button>
                  <button onClick={() => addLayer("shape", { w: 120, h: 120, bg: fillColor, shape: "rect" })}
                    style={{ flex: 1, padding: "7px 0", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 12 }}>+ Shape</button>
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, fontWeight: 600, textTransform: "uppercase" }}>Layers ({layers.length})</div>
                {layers.length === 0 && <div style={{ textAlign: "center", color: "#4b5563", fontSize: 12, padding: "20px 0" }}>Click the canvas to add elements</div>}
                {[...layers].reverse().map((l, i) => (
                  <div key={l.id} onClick={() => setSelected(l.id)}
                    style={{ padding: "8px 10px", borderRadius: 6, marginBottom: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                      background: l.id === selected ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${l.id === selected ? "#7c3aed" : "rgba(255,255,255,0.06)"}`,
                      opacity: l.visible ? 1 : 0.4 }}>
                    <span style={{ fontSize: 14 }}>{l.type === "text" ? "T" : l.type === "sticker" ? l.content : l.type === "shape" ? "⬜" : "🖼"}</span>
                    <span style={{ fontSize: 12, color: "#d1d5db", flex: 1 }}>{l.type === "text" ? (l.content?.slice(0, 12) || "Text") : l.type}</span>
                    <button onClick={(e) => { e.stopPropagation(); updateLayer(l.id, { visible: !l.visible }); }}
                      style={{ background: "none", border: "none", color: l.visible ? "#6b7280" : "#3b3b4f", cursor: "pointer", fontSize: 12 }}>👁</button>
                    <button onClick={(e) => { e.stopPropagation(); moveLayer(l.id, -1); }}
                      style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 11 }}>↑</button>
                    <button onClick={(e) => { e.stopPropagation(); moveLayer(l.id, 1); }}
                      style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 11 }}>↓</button>
                  </div>
                ))}
                {/* Stickers section */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, fontWeight: 600, textTransform: "uppercase" }}>Stickers & Icons</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {STICKERS.map(s => (
                      <button key={s} onClick={() => addLayer("sticker", { content: s, w: 80, h: 80 })}
                        style={{ width: 36, height: 36, borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", cursor: "pointer", fontSize: 18 }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {rightTab === "properties" && (
              <div style={{ padding: 12 }}>
                {selectedLayer ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700 }}>{selectedLayer.type.toUpperCase()} PROPERTIES</div>
                    {[{ l: "X", k: "x" }, { l: "Y", k: "y" }, { l: "W", k: "w" }, { l: "H", k: "h" }, { l: "Rotation", k: "rotation" }].map(({ l, k }) => (
                      <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 60, fontSize: 12, color: "#6b7280" }}>{l}</span>
                        <input type="number" value={(selectedLayer as Record<string, number>)[k] ?? 0}
                          onChange={e => updateLayer(selected!, { [k]: Number(e.target.value) } as Partial<Layer>)}
                          style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "5px 8px", color: "#e5e7eb", fontSize: 13 }} />
                      </div>
                    ))}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 60, fontSize: 12, color: "#6b7280" }}>Opacity</span>
                      <input type="range" min={0} max={100} value={selectedLayer.opacity ?? 100} onChange={e => updateLayer(selected!, { opacity: Number(e.target.value) })} style={{ flex: 1 }} />
                      <span style={{ fontSize: 12, color: "#6b7280", minWidth: 28 }}>{selectedLayer.opacity ?? 100}%</span>
                    </div>
                    {selectedLayer.type === "text" && (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 60, fontSize: 12, color: "#6b7280" }}>Text</span>
                          <input value={selectedLayer.content ?? ""} onChange={e => updateLayer(selected!, { content: e.target.value })}
                            style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "5px 8px", color: "#e5e7eb", fontSize: 13 }} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 60, fontSize: 12, color: "#6b7280" }}>Font</span>
                          <select value={selectedLayer.fontFamily ?? "Inter"} onChange={e => updateLayer(selected!, { fontFamily: e.target.value })}
                            style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "5px 8px", color: "#e5e7eb", fontSize: 13 }}>
                            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 60, fontSize: 12, color: "#6b7280" }}>Size</span>
                          <input type="number" value={selectedLayer.fontSize ?? 32} onChange={e => updateLayer(selected!, { fontSize: Number(e.target.value) })}
                            style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "5px 8px", color: "#e5e7eb", fontSize: 13 }} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 60, fontSize: 12, color: "#6b7280" }}>Color</span>
                          <input type="color" value={selectedLayer.color ?? "#111111"} onChange={e => updateLayer(selected!, { color: e.target.value })}
                            style={{ flex: 1, height: 32, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
                        </div>
                      </>
                    )}
                    {selectedLayer.type === "shape" && (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 60, fontSize: 12, color: "#6b7280" }}>Shape</span>
                          <select value={selectedLayer.shape ?? "rect"} onChange={e => updateLayer(selected!, { shape: e.target.value as Layer["shape"] })}
                            style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "5px 8px", color: "#e5e7eb", fontSize: 13 }}>
                            <option value="rect">Rectangle</option>
                            <option value="circle">Circle</option>
                            <option value="triangle">Triangle</option>
                            <option value="star">Star</option>
                          </select>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 60, fontSize: 12, color: "#6b7280" }}>Fill</span>
                          <input type="color" value={selectedLayer.bg ?? "#7c3aed"} onChange={e => updateLayer(selected!, { bg: e.target.value })}
                            style={{ flex: 1, height: 32, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
                        </div>
                      </>
                    )}
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      <button onClick={() => updateLayer(selected!, { locked: !selectedLayer.locked })}
                        style={{ flex: 1, padding: "7px 0", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: selectedLayer.locked ? "rgba(124,58,237,0.2)" : "transparent", color: selectedLayer.locked ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 12 }}>
                        {selectedLayer.locked ? "🔒 Locked" : "🔓 Lock"}
                      </button>
                      <button onClick={deleteSelected} style={{ flex: 1, padding: "7px 0", borderRadius: 6, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#f87171", cursor: "pointer", fontSize: 12 }}>🗑 Delete</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", color: "#4b5563", fontSize: 13, padding: 24 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>👆</div>
                    Select a layer to edit
                  </div>
                )}
                {/* Add elements section */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, fontWeight: 600, textTransform: "uppercase" }}>Quick Add</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Text content"
                        style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "6px 8px", color: "#e5e7eb", fontSize: 12 }} />
                      <button onClick={() => addLayer("text", { content: textInput, w: 200, h: 60, color: "#111827", bg: "transparent", fontSize, fontFamily: selectedFont })}
                        style={{ padding: "6px 10px", borderRadius: 6, border: "none", background: "#7c3aed", color: "#fff", cursor: "pointer", fontSize: 12 }}>Add</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {rightTab === "ai" && (
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700, marginBottom: 10 }}>🤖 AI Design Tools</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>🎨 Generate Design</div>
                    <textarea rows={3} value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder='e.g. "Modern tech startup Instagram post"'
                      style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "8px 10px", color: "#e5e7eb", fontSize: 12, resize: "none", marginBottom: 8 }} />
                    <button style={{ width: "100%", padding: "8px 0", borderRadius: 6, border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>✨ Generate</button>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>🖼 Background Remover</div>
                    <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>Upload an image to remove its background automatically.</p>
                    <button style={{ width: "100%", padding: "8px 0", borderRadius: 6, border: "1px dashed rgba(255,255,255,0.15)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 12 }}>📁 Upload Image</button>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>✦ AI Logo Generator</div>
                    <input placeholder="Brand name" style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "7px 10px", color: "#e5e7eb", fontSize: 12, marginBottom: 8 }} />
                    <button style={{ width: "100%", padding: "8px 0", borderRadius: 6, border: "none", background: "#7c3aed", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 12 }}>Generate Logo</button>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>🎨 AI Color Palette</div>
                    <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                      {brandColors.map((c, i) => <div key={i} style={{ flex: 1, height: 28, borderRadius: 4, background: c, cursor: "pointer" }} />)}
                    </div>
                    <button onClick={() => setBrandColors(BRAND_COLORS.sort(() => Math.random() - 0.5).slice(0, 5))}
                      style={{ width: "100%", padding: "8px 0", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 12 }}>
                      🔀 Regenerate Palette
                    </button>
                  </div>
                </div>
              </div>
            )}

            {rightTab === "brand" && (
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700, marginBottom: 12 }}>🎨 Brand Kit</div>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Brand Colors</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {brandColors.map((c, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <input type="color" value={c} onChange={e => setBrandColors(prev => prev.map((x, j) => j === i ? e.target.value : x))}
                          style={{ width: 36, height: 36, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, cursor: "pointer", background: "transparent" }} />
                      </div>
                    ))}
                    <button onClick={() => setBrandColors(prev => [...prev, "#000000"])} style={{ width: 36, height: 36, borderRadius: 6, border: "1px dashed rgba(255,255,255,0.15)", background: "transparent", color: "#6b7280", cursor: "pointer", fontSize: 20 }}>+</button>
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Brand Fonts</div>
                  {["Heading", "Body", "Accent"].map(role => (
                    <div key={role} style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>{role}</div>
                      <select style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "6px 8px", color: "#e5e7eb", fontSize: 12 }}>
                        {FONTS.map(f => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>🏪 Template Marketplace</div>
                  {["Minimal Business Pack", "Social Media Bundle", "Startup Kit", "Creator Pack"].map(t => (
                    <div key={t} style={{ padding: "8px 10px", borderRadius: 6, marginBottom: 4, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#d1d5db" }}>{t}</span>
                      <button style={{ padding: "3px 8px", borderRadius: 4, border: "none", background: "#7c3aed", color: "#fff", cursor: "pointer", fontSize: 11 }}>Get</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
