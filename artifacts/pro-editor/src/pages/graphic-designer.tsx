import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";

type BlendMode = "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten" | "color-dodge" | "color-burn" | "hard-light" | "soft-light" | "difference" | "exclusion";
type TextEffect = "none" | "shadow" | "outline" | "gradient" | "emboss";
type Tool = "select" | "text" | "shape" | "image" | "sticker" | "pen" | "eraser" | "eyedropper" | "crop" | "ruler";
type ShapeType = "rect" | "circle" | "triangle" | "star" | "pentagon" | "hexagon" | "diamond" | "arrow" | "heart" | "cloud";
type Layer = {
  id: string; type: "text" | "shape" | "image" | "sticker" | "gradient" | "line";
  x: number; y: number; w: number; h: number;
  content?: string; color?: string; bg?: string; bg2?: string;
  fontSize?: number; fontFamily?: string; fontWeight?: string; fontStyle?: string; textDecoration?: string;
  letterSpacing?: number; lineHeight?: number; textAlign?: string; textEffect?: TextEffect;
  shape?: ShapeType; opacity?: number; rotation?: number; locked?: boolean; visible?: boolean;
  blendMode?: BlendMode; borderRadius?: number; borderColor?: string; borderWidth?: number;
  shadowX?: number; shadowY?: number; shadowBlur?: number; shadowColor?: string;
  gradientAngle?: number; gradientType?: "linear" | "radial";
  flipX?: boolean; flipY?: boolean; skewX?: number; skewY?: number;
  imageUrl?: string; imageFilter?: string;
};
type Template = { id: string; label: string; w: number; h: number; icon: string; category: string };
type HistoryEntry = { layers: Layer[]; bg: string };

const TEMPLATES: Template[] = [
  { id: "ig_post", label: "Instagram Post", w: 1080, h: 1080, icon: "📷", category: "Social" },
  { id: "ig_story", label: "Instagram Story", w: 1080, h: 1920, icon: "📱", category: "Social" },
  { id: "ig_reel", label: "Instagram Reel", w: 1080, h: 1920, icon: "🎬", category: "Social" },
  { id: "yt_thumb", label: "YouTube Thumbnail", w: 1280, h: 720, icon: "▶️", category: "Social" },
  { id: "yt_banner", label: "YouTube Banner", w: 2560, h: 1440, icon: "📺", category: "Social" },
  { id: "twitter", label: "Twitter Post", w: 1200, h: 675, icon: "🐦", category: "Social" },
  { id: "twitter_header", label: "Twitter Header", w: 1500, h: 500, icon: "🐦", category: "Social" },
  { id: "fb_cover", label: "Facebook Cover", w: 820, h: 312, icon: "👥", category: "Social" },
  { id: "fb_post", label: "Facebook Post", w: 1200, h: 630, icon: "👥", category: "Social" },
  { id: "linkedin", label: "LinkedIn Banner", w: 1584, h: 396, icon: "💼", category: "Social" },
  { id: "linkedin_post", label: "LinkedIn Post", w: 1200, h: 627, icon: "💼", category: "Social" },
  { id: "tiktok", label: "TikTok Cover", w: 1080, h: 1920, icon: "🎵", category: "Social" },
  { id: "poster", label: "Poster A4", w: 794, h: 1123, icon: "🗒️", category: "Print" },
  { id: "poster_a3", label: "Poster A3", w: 1123, h: 1587, icon: "🗒️", category: "Print" },
  { id: "flyer", label: "Flyer", w: 816, h: 1056, icon: "📄", category: "Print" },
  { id: "business", label: "Business Card", w: 1050, h: 600, icon: "💼", category: "Print" },
  { id: "postcard", label: "Postcard", w: 1500, h: 1050, icon: "✉️", category: "Print" },
  { id: "brochure", label: "Brochure", w: 2480, h: 1754, icon: "📋", category: "Print" },
  { id: "logo", label: "Logo", w: 800, h: 800, icon: "✦", category: "Branding" },
  { id: "favicon", label: "Favicon", w: 512, h: 512, icon: "🔲", category: "Branding" },
  { id: "email_header", label: "Email Header", w: 600, h: 200, icon: "📧", category: "Branding" },
  { id: "banner", label: "Web Banner", w: 1200, h: 400, icon: "🌐", category: "Web" },
  { id: "leaderboard", label: "Leaderboard Ad", w: 728, h: 90, icon: "📊", category: "Web" },
  { id: "skyscraper", label: "Skyscraper Ad", w: 160, h: 600, icon: "📊", category: "Web" },
  { id: "presentation", label: "Presentation 16:9", w: 1920, h: 1080, icon: "📊", category: "Docs" },
  { id: "presentation_4_3", label: "Presentation 4:3", w: 1024, h: 768, icon: "📊", category: "Docs" },
  { id: "resume", label: "Resume", w: 794, h: 1123, icon: "📄", category: "Docs" },
  { id: "invoice", label: "Invoice", w: 794, h: 1123, icon: "🧾", category: "Docs" },
  { id: "certificate", label: "Certificate", w: 1123, h: 794, icon: "🏆", category: "Docs" },
  { id: "infographic", label: "Infographic", w: 800, h: 2000, icon: "📊", category: "Docs" },
];

const STICKERS = ["🎉", "🔥", "✨", "💎", "🚀", "❤️", "⭐", "🌈", "🎨", "💡", "🎯", "⚡", "🌟", "💫", "🎁", "🏆", "🦋", "🌸", "🎭", "🦄", "🌊", "🍀", "🎸", "🏅", "💥", "🌺", "🎪", "🦋", "🌙", "☀️", "🌊", "🦊", "🐉", "🌴", "🍕", "🎮", "🏆", "🎵", "🎬", "🌍"];
const FONTS = ["Inter", "Space Grotesk", "Roboto", "Poppins", "Playfair Display", "Montserrat", "Oswald", "Raleway", "Lato", "Open Sans", "Nunito", "Source Sans Pro", "Ubuntu", "Cabin", "Josefin Sans", "Dancing Script", "Pacifico", "Lobster", "Georgia", "Times New Roman"];
const BRAND_COLORS = ["#7c3aed", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316", "#84cc16", "#06b6d4", "#a855f7", "#e11d48", "#d97706", "#059669"];
const BLEND_MODES: BlendMode[] = ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion"];
const IMAGE_FILTERS = ["none", "grayscale(100%)", "sepia(100%)", "blur(2px)", "brightness(130%)", "contrast(150%)", "saturate(200%)", "hue-rotate(90deg)", "invert(100%)", "opacity(50%)", "drop-shadow(4px 4px 8px black)"];
const GRADIENT_PRESETS = [
  { name: "Violet Dream", a: "#7c3aed", b: "#ec4899" },
  { name: "Ocean Blue", a: "#0ea5e9", b: "#06b6d4" },
  { name: "Sunset", a: "#f97316", b: "#ef4444" },
  { name: "Forest", a: "#10b981", b: "#065f46" },
  { name: "Gold", a: "#f59e0b", b: "#d97706" },
  { name: "Rose", a: "#f43f5e", b: "#ec4899" },
  { name: "Sky", a: "#3b82f6", b: "#8b5cf6" },
  { name: "Mint", a: "#34d399", b: "#06b6d4" },
];

function renderLayer(layer: Layer, selected: boolean, onClick: () => void, onDrag: (sx: number, sy: number, cx: number, cy: number) => void, scale: number) {
  if (!layer.visible) return null;
  const flipTransform = `${layer.flipX ? "scaleX(-1)" : ""} ${layer.flipY ? "scaleY(-1)" : ""} rotate(${layer.rotation ?? 0}deg) skewX(${layer.skewX ?? 0}deg) skewY(${layer.skewY ?? 0}deg)`;
  const shadow = layer.shadowX !== undefined
    ? `${layer.shadowX}px ${layer.shadowY}px ${layer.shadowBlur}px ${layer.shadowColor || "rgba(0,0,0,0.3)"}`
    : undefined;
  const style: React.CSSProperties = {
    position: "absolute", left: layer.x, top: layer.y, width: layer.w, height: layer.h,
    opacity: (layer.opacity ?? 100) / 100,
    transform: flipTransform,
    cursor: layer.locked ? "not-allowed" : "move",
    userSelect: "none",
    outline: selected ? "2px solid #7c3aed" : "none",
    outlineOffset: 2,
    boxSizing: "border-box",
    mixBlendMode: (layer.blendMode || "normal") as any,
  };
  if (shadow) style.boxShadow = shadow;
  if (layer.borderColor && layer.borderWidth) {
    style.border = `${layer.borderWidth}px solid ${layer.borderColor}`;
  }
  if (layer.borderRadius) style.borderRadius = layer.borderRadius;

  let inner: React.ReactNode = null;

  if (layer.type === "gradient") {
    const gradStyle = layer.gradientType === "radial"
      ? `radial-gradient(circle, ${layer.bg}, ${layer.bg2 || "#000"})`
      : `linear-gradient(${layer.gradientAngle ?? 135}deg, ${layer.bg}, ${layer.bg2 || "#000"})`;
    Object.assign(style, { background: gradStyle });
  } else if (layer.type === "line") {
    Object.assign(style, { background: layer.bg || "#7c3aed", height: layer.borderWidth || 2, borderRadius: 2 });
  } else if (layer.type === "text") {
    let textShadow: string | undefined;
    if (layer.textEffect === "shadow") textShadow = "2px 2px 4px rgba(0,0,0,0.5)";
    else if (layer.textEffect === "emboss") textShadow = "1px 1px 0 rgba(255,255,255,0.3), -1px -1px 0 rgba(0,0,0,0.3)";
    const bgStyle = layer.textEffect === "gradient" && layer.bg2
      ? `linear-gradient(135deg, ${layer.color || "#111"}, ${layer.bg2})`
      : undefined;
    Object.assign(style, {
      display: "flex", alignItems: "center", justifyContent: layer.textAlign === "left" ? "flex-start" : layer.textAlign === "right" ? "flex-end" : "center",
      color: bgStyle ? "transparent" : (layer.color || "#111"),
      fontSize: (layer.fontSize ?? 32),
      fontFamily: layer.fontFamily || "Inter",
      fontWeight: layer.fontWeight || "700",
      fontStyle: layer.fontStyle || "normal",
      textDecoration: layer.textDecoration || "none",
      letterSpacing: layer.letterSpacing ?? 0,
      lineHeight: layer.lineHeight ?? 1.2,
      textAlign: (layer.textAlign as any) || "center",
      background: bgStyle || (layer.bg || "transparent"),
      WebkitBackgroundClip: bgStyle ? "text" : undefined,
      WebkitTextFillColor: bgStyle ? "transparent" : undefined,
      textShadow,
      wordBreak: "break-word" as const, padding: 8,
      WebkitTextStroke: layer.textEffect === "outline" ? `2px ${layer.bg2 || "#000"}` : undefined,
    });
    inner = layer.content || "Your Text";
  } else if (layer.type === "shape") {
    if (layer.shape === "circle") {
      Object.assign(style, { borderRadius: "50%", background: layer.bg || "#7c3aed" });
    } else if (layer.shape === "triangle") {
      Object.assign(style, { background: "transparent", width: 0, height: 0, border: "none", boxShadow: "none", outline: "none", borderLeft: `${layer.w / 2}px solid transparent`, borderRight: `${layer.w / 2}px solid transparent`, borderBottom: `${layer.h}px solid ${layer.bg || "#7c3aed"}` });
    } else if (layer.shape === "star") {
      Object.assign(style, { display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.min(layer.w, layer.h) * 0.8, color: layer.bg || "#f59e0b", background: "transparent" });
      inner = "★";
    } else if (layer.shape === "heart") {
      Object.assign(style, { display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.min(layer.w, layer.h) * 0.85, color: layer.bg || "#ef4444", background: "transparent" });
      inner = "♥";
    } else if (layer.shape === "diamond") {
      Object.assign(style, { background: layer.bg || "#7c3aed", transform: `${flipTransform} rotate(45deg)` });
    } else if (layer.shape === "pentagon") {
      Object.assign(style, { display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.min(layer.w, layer.h) * 0.85, color: layer.bg || "#10b981", background: "transparent" });
      inner = "⬠";
    } else if (layer.shape === "hexagon") {
      Object.assign(style, { display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.min(layer.w, layer.h) * 0.85, color: layer.bg || "#3b82f6", background: "transparent" });
      inner = "⬡";
    } else if (layer.shape === "arrow") {
      Object.assign(style, { display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.min(layer.w, layer.h) * 0.75, color: layer.bg || "#7c3aed", background: "transparent" });
      inner = "➜";
    } else if (layer.shape === "cloud") {
      Object.assign(style, { display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.min(layer.w, layer.h) * 0.8, color: layer.bg || "#e5e7eb", background: "transparent" });
      inner = "☁";
    } else {
      const gradBg = layer.bg2 ? `linear-gradient(${layer.gradientAngle ?? 135}deg, ${layer.bg}, ${layer.bg2})` : (layer.bg || "#7c3aed");
      Object.assign(style, { borderRadius: layer.borderRadius ?? 8, background: gradBg });
    }
  } else if (layer.type === "image") {
    Object.assign(style, {
      borderRadius: layer.borderRadius ?? 8, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.min(layer.w, layer.h) * 0.35, overflow: "hidden",
      background: layer.imageUrl ? "transparent" : (layer.bg || "#e5e7eb"),
      filter: layer.imageFilter || undefined,
    });
    inner = layer.imageUrl
      ? <img src={layer.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: layer.imageFilter || undefined }} />
      : "🖼️";
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
          <div style={{ position: "absolute", top: -22, left: 0, background: "#7c3aed", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap", pointerEvents: "none" }}>
            {layer.type} · {Math.round(layer.w)}×{Math.round(layer.h)} · ({Math.round(layer.x)},{Math.round(layer.y)})
          </div>
          <div style={{ position: "absolute", bottom: -5, right: -5, width: 12, height: 12, background: "#7c3aed", borderRadius: 2, cursor: "se-resize", border: "2px solid #fff" }} />
          <div style={{ position: "absolute", bottom: -5, left: -5, width: 12, height: 12, background: "#7c3aed", borderRadius: 2, cursor: "sw-resize", border: "2px solid #fff" }} />
          <div style={{ position: "absolute", top: -5, right: -5, width: 12, height: 12, background: "#7c3aed", borderRadius: 2, cursor: "ne-resize", border: "2px solid #fff" }} />
          <div style={{ position: "absolute", top: -5, left: -5, width: 12, height: 12, background: "#7c3aed", borderRadius: 2, cursor: "nw-resize", border: "2px solid #fff" }} />
        </>
      )}
    </div>
  );
}

const inp = (extra?: React.CSSProperties): React.CSSProperties => ({ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "5px 8px", color: "#e5e7eb", fontSize: 13, ...extra });
const lbl = (w = 70): React.CSSProperties => ({ width: w, fontSize: 12, color: "#6b7280", flexShrink: 0 });
const row: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8 };
const sectionHead = (text: string) => (
  <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, margin: "12px 0 6px" }}>{text}</div>
);

export default function GraphicDesigner() {
  const [, navigate] = useLocation();
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool>("select");
  const [template, setTemplate] = useState<Template>(TEMPLATES[0]);
  const [showTemplates, setShowTemplates] = useState(true);
  const [zoom, setZoom] = useState(0.5);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [bgGradient, setBgGradient] = useState(false);
  const [bgGradientColor2, setBgGradientColor2] = useState("#c4b5fd");
  const [rightTab, setRightTab] = useState<"layers" | "properties" | "ai" | "brand" | "export">("layers");
  const [textInput, setTextInput] = useState("Your Text");
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [fontSize, setFontSize] = useState(48);
  const [fillColor, setFillColor] = useState("#7c3aed");
  const [brandColors, setBrandColors] = useState(BRAND_COLORS.slice(0, 6));
  const [brandName, setBrandName] = useState("MyBrand");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([{ layers: [], bg: "#ffffff" }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showRulers, setShowRulers] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [showGuides, setShowGuides] = useState(false);
  const [sidebarLeft, setSidebarLeft] = useState(true);
  const [themePreset, setThemePreset] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [searchSticker, setSearchSticker] = useState("");
  const [selectedBlendMode, setSelectedBlendMode] = useState<BlendMode>("normal");
  const [copiedLayer, setCopiedLayer] = useState<Layer | null>(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [exportFormat, setExportFormat] = useState<"PNG" | "JPG" | "SVG" | "PDF" | "WebP">("PNG");
  const [exportScale, setExportScale] = useState(1);
  const [exportQuality, setExportQuality] = useState(90);
  const [colorPaletteMode, setColorPaletteMode] = useState<"custom" | "complementary" | "triadic" | "analogous">("custom");
  const [eyedropperColor, setEyedropperColor] = useState<string | null>(null);

  const selectedLayer = layers.find(l => l.id === selected);

  const pushHistory = useCallback((newLayers: Layer[], newBg: string) => {
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, { layers: newLayers, bg: newBg }].slice(-50);
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    setLayers(prev.layers);
    setBgColor(prev.bg);
    setHistoryIndex(i => i - 1);
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    setLayers(next.layers);
    setBgColor(next.bg);
    setHistoryIndex(i => i + 1);
  }, [history, historyIndex]);

  const snap = useCallback((v: number) => snapToGrid ? Math.round(v / gridSize) * gridSize : v, [snapToGrid, gridSize]);

  const addLayer = useCallback((type: Layer["type"], extra?: Partial<Layer>) => {
    const id = `layer_${Date.now()}`;
    const base: Layer = {
      id, type, x: snap(Math.round(template.w / 2 - 100)), y: snap(Math.round(template.h / 2 - 50)),
      w: 200, h: 100, opacity: 100, rotation: 0, visible: true, locked: false,
      blendMode: "normal", ...extra,
    };
    const newLayers = [...layers, base];
    setLayers(newLayers);
    setSelected(id);
    pushHistory(newLayers, bgColor);
  }, [layers, template, bgColor, pushHistory, snap]);

  const updateLayer = useCallback((id: string, patch: Partial<Layer>) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
  }, []);

  const commitUpdate = useCallback((id: string, patch: Partial<Layer>) => {
    const newLayers = layers.map(l => l.id === id ? { ...l, ...patch } : l);
    setLayers(newLayers);
    pushHistory(newLayers, bgColor);
  }, [layers, bgColor, pushHistory]);

  const dragLayer = useCallback((id: string, sx: number, sy: number, cx: number, cy: number) => {
    setLayers(prev => {
      const l = prev.find(x => x.id === id);
      if (!l || l.locked) return prev;
      return prev.map(x => x.id === id ? { ...x, x: snap(Math.round(l.x + (cx - sx) / zoom)), y: snap(Math.round(l.y + (cy - sy) / zoom)) } : x);
    });
  }, [zoom, snap]);

  const deleteSelected = useCallback(() => {
    if (!selected) return;
    const newLayers = layers.filter(l => l.id !== selected);
    setLayers(newLayers);
    setSelected(null);
    pushHistory(newLayers, bgColor);
  }, [selected, layers, bgColor, pushHistory]);

  const duplicateLayer = useCallback(() => {
    if (!selectedLayer) return;
    const id = `layer_${Date.now()}`;
    const dup: Layer = { ...selectedLayer, id, x: selectedLayer.x + 20, y: selectedLayer.y + 20 };
    const newLayers = [...layers, dup];
    setLayers(newLayers);
    setSelected(id);
    pushHistory(newLayers, bgColor);
  }, [selectedLayer, layers, bgColor, pushHistory]);

  const copyLayer = useCallback(() => { if (selectedLayer) setCopiedLayer({ ...selectedLayer }); }, [selectedLayer]);
  const pasteLayer = useCallback(() => {
    if (!copiedLayer) return;
    const id = `layer_${Date.now()}`;
    const pasted: Layer = { ...copiedLayer, id, x: copiedLayer.x + 30, y: copiedLayer.y + 30 };
    const newLayers = [...layers, pasted];
    setLayers(newLayers);
    setSelected(id);
    pushHistory(newLayers, bgColor);
  }, [copiedLayer, layers, bgColor, pushHistory]);

  const moveLayer = (id: string, dir: -1 | 1) => {
    setLayers(prev => {
      const i = prev.findIndex(l => l.id === id);
      if (i + dir < 0 || i + dir >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[i + dir]] = [next[i + dir], next[i]];
      return next;
    });
  };

  const bringToFront = (id: string) => {
    setLayers(prev => { const l = prev.find(x => x.id === id); if (!l) return prev; return [...prev.filter(x => x.id !== id), l]; });
  };
  const sendToBack = (id: string) => {
    setLayers(prev => { const l = prev.find(x => x.id === id); if (!l) return prev; return [l, ...prev.filter(x => x.id !== id)]; });
  };

  const alignLayers = (alignment: "left" | "center-h" | "right" | "top" | "center-v" | "bottom") => {
    if (!selected) return;
    const l = layers.find(x => x.id === selected);
    if (!l) return;
    let patch: Partial<Layer> = {};
    if (alignment === "left") patch = { x: 0 };
    else if (alignment === "right") patch = { x: template.w - l.w };
    else if (alignment === "center-h") patch = { x: Math.round((template.w - l.w) / 2) };
    else if (alignment === "top") patch = { y: 0 };
    else if (alignment === "bottom") patch = { y: template.h - l.h };
    else if (alignment === "center-v") patch = { y: Math.round((template.h - l.h) / 2) };
    commitUpdate(selected, patch);
  };

  const groupSelection = () => {
    // Placeholder for grouping - marks layers with a group tag
    alert("Group feature: Select multiple layers to group them together (multi-select coming soon)");
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = snap(Math.round((e.clientX - rect.left) / zoom));
    const y = snap(Math.round((e.clientY - rect.top) / zoom));
    if (tool === "text") {
      addLayer("text", { x: x - 100, y: y - 25, w: 200, h: 50, content: textInput, color: "#111827", bg: "transparent", fontSize, fontFamily: selectedFont, fontWeight: "700" });
      setTool("select");
    } else if (tool === "shape") {
      addLayer("shape", { x: x - 60, y: y - 60, w: 120, h: 120, bg: fillColor, shape: "rect" });
      setTool("select");
    } else if (tool === "eyedropper") {
      setEyedropperColor(bgColor);
      setTool("select");
    } else {
      setSelected(null);
    }
  };

  const handleImageUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    addLayer("image", { imageUrl: url, w: 300, h: 200 });
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(f => { if (f.type.startsWith("image/")) handleImageUpload(f); });
  };

  const generateAILayout = useCallback(() => {
    setAiGenerating(true);
    setTimeout(() => {
      const layouts: Layer[][] = [
        [
          { id: `ai1_${Date.now()}`, type: "gradient", x: 0, y: 0, w: template.w, h: template.h, bg: "#7c3aed", bg2: "#ec4899", gradientAngle: 135, gradientType: "linear", opacity: 100, rotation: 0, visible: true, locked: false, blendMode: "normal" },
          { id: `ai2_${Date.now()}`, type: "shape", x: template.w * 0.1, y: template.h * 0.35, w: template.w * 0.8, h: 4, bg: "rgba(255,255,255,0.3)", shape: "rect", opacity: 100, rotation: 0, visible: true, locked: false, blendMode: "normal" },
          { id: `ai3_${Date.now()}`, type: "text", x: template.w * 0.05, y: template.h * 0.2, w: template.w * 0.9, h: 80, content: aiPrompt || "YOUR HEADLINE", color: "#ffffff", bg: "transparent", fontSize: Math.min(template.w, template.h) * 0.08, fontFamily: "Montserrat", fontWeight: "800", opacity: 100, rotation: 0, visible: true, locked: false, blendMode: "normal" },
          { id: `ai4_${Date.now()}`, type: "text", x: template.w * 0.05, y: template.h * 0.42, w: template.w * 0.9, h: 50, content: "Subheading goes here · Made with ProEditor", color: "rgba(255,255,255,0.75)", bg: "transparent", fontSize: Math.min(template.w, template.h) * 0.03, fontFamily: "Inter", fontWeight: "400", opacity: 100, rotation: 0, visible: true, locked: false, blendMode: "normal" },
          { id: `ai5_${Date.now()}`, type: "shape", x: template.w * 0.3, y: template.h * 0.6, w: template.w * 0.4, h: Math.max(40, template.h * 0.08), bg: "#ffffff", shape: "rect", borderRadius: 40, opacity: 100, rotation: 0, visible: true, locked: false, blendMode: "normal" },
          { id: `ai6_${Date.now()}`, type: "text", x: template.w * 0.3, y: template.h * 0.6, w: template.w * 0.4, h: Math.max(40, template.h * 0.08), content: "GET STARTED →", color: "#7c3aed", bg: "transparent", fontSize: Math.min(template.w, template.h) * 0.025, fontFamily: "Inter", fontWeight: "700", opacity: 100, rotation: 0, visible: true, locked: false, blendMode: "normal" },
        ],
      ];
      const chosen = layouts[0].map(l => ({ ...l, id: `ai_${Date.now()}_${l.id}` }));
      const newLayers = [...layers, ...chosen];
      setLayers(newLayers);
      pushHistory(newLayers, bgColor);
      setAiGenerating(false);
    }, 1200);
  }, [aiPrompt, layers, template, bgColor, pushHistory]);

  const applyColorPalette = (mode: typeof colorPaletteMode) => {
    if (mode === "complementary") {
      const base = brandColors[0];
      const h = parseInt(base.slice(1), 16);
      setBrandColors([base, `#${((h + 0x800000) % 0x1000000).toString(16).padStart(6, "0")}`, "#ffffff", "#000000", "#f3f4f6", "#6b7280"]);
    } else if (mode === "triadic") {
      setBrandColors(["#7c3aed", "#ed3a3a", "#3aed7c", "#ffffff", "#111827", "#6b7280"]);
    } else if (mode === "analogous") {
      setBrandColors(["#7c3aed", "#5b3aed", "#9b3aed", "#b53aed", "#3a5bed", "#3a9bed"]);
    }
    setColorPaletteMode(mode);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "z") { e.preventDefault(); undo(); }
      else if (ctrl && e.key === "y") { e.preventDefault(); redo(); }
      else if (ctrl && e.key === "c") { e.preventDefault(); copyLayer(); }
      else if (ctrl && e.key === "v") { e.preventDefault(); pasteLayer(); }
      else if (ctrl && e.key === "d") { e.preventDefault(); duplicateLayer(); }
      else if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); deleteSelected(); }
      else if (e.key === "v") setTool("select");
      else if (e.key === "t") setTool("text");
      else if (e.key === "s") setTool("shape");
      else if (e.key === "i") setTool("eyedropper");
      else if (e.key === "Escape") setSelected(null);
      else if (e.key === "ArrowLeft" && selected) updateLayer(selected, { x: (selectedLayer?.x ?? 0) - (e.shiftKey ? 10 : 1) });
      else if (e.key === "ArrowRight" && selected) updateLayer(selected, { x: (selectedLayer?.x ?? 0) + (e.shiftKey ? 10 : 1) });
      else if (e.key === "ArrowUp" && selected) updateLayer(selected, { y: (selectedLayer?.y ?? 0) - (e.shiftKey ? 10 : 1) });
      else if (e.key === "ArrowDown" && selected) updateLayer(selected, { y: (selectedLayer?.y ?? 0) + (e.shiftKey ? 10 : 1) });
      else if (e.key === "[" && selected) moveLayer(selected, -1);
      else if (e.key === "]" && selected) moveLayer(selected, 1);
      else if (ctrl && e.key === "=") setZoom(z => Math.min(3, z + 0.1));
      else if (ctrl && e.key === "-") setZoom(z => Math.max(0.1, z - 0.1));
      else if (e.key === "?") setShowKeyboardHelp(h => !h);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selected, selectedLayer, undo, redo, copyLayer, pasteLayer, duplicateLayer, deleteSelected, updateLayer, moveLayer]);

  const bgStyle = bgGradient
    ? `linear-gradient(135deg, ${bgColor}, ${bgGradientColor2})`
    : bgColor;

  if (showTemplates) {
    return (
      <div style={{ height: "100vh", background: "#0a0a14", color: "#e5e7eb", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 52, background: "#1a1a2e", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", padding: "0 24px", gap: 12 }}>
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#a78bfa", fontSize: 22, cursor: "pointer" }}>✦</button>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>Graphic Designer — Choose a Template</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button onClick={() => { setShowTemplates(false); setTemplate({ id: "custom", label: "Custom", w: 800, h: 600, icon: "🎨", category: "Custom" }); }}
              style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 13 }}>
              Custom Size
            </button>
          </div>
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
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0a0a14", color: "#e5e7eb", fontFamily: "'Inter', sans-serif" }}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleFileDrop}>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />

      {/* Keyboard Help Modal */}
      {showKeyboardHelp && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowKeyboardHelp(false)}>
          <div style={{ background: "#1a1a2e", borderRadius: 16, padding: 32, width: 480, border: "1px solid rgba(255,255,255,0.1)" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#a78bfa", marginBottom: 20 }}>⌨️ Keyboard Shortcuts</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                ["V", "Select Tool"], ["T", "Text Tool"], ["S", "Shape Tool"], ["I", "Eyedropper"],
                ["Ctrl+Z", "Undo"], ["Ctrl+Y", "Redo"], ["Ctrl+C", "Copy"], ["Ctrl+V", "Paste"],
                ["Ctrl+D", "Duplicate"], ["Delete", "Delete Layer"], ["[ / ]", "Move Layer Order"],
                ["Arrow Keys", "Move 1px"], ["Shift+Arrow", "Move 10px"], ["Esc", "Deselect"],
                ["Ctrl+=", "Zoom In"], ["Ctrl+-", "Zoom Out"], ["?", "Toggle this help"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ background: "rgba(255,255,255,0.1)", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontFamily: "monospace", color: "#a78bfa", whiteSpace: "nowrap" }}>{k}</span>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div style={{ height: 52, background: "#1a1a2e", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", padding: "0 10px", gap: 6, flexShrink: 0 }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#a78bfa", fontSize: 20, cursor: "pointer" }} title="Back">✦</button>
        <span style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>Graphic Designer</span>
        <span style={{ fontSize: 11, color: "#4b5563", marginLeft: 2 }}>— {template.label} ({template.w}×{template.h})</span>

        {/* Templates & Size */}
        <button onClick={() => setShowTemplates(true)} style={{ marginLeft: 4, padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 11 }}>Templates</button>

        {/* Tools */}
        <div style={{ marginLeft: 8, display: "flex", gap: 2, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 3 }}>
          {([
            { id: "select" as Tool, icon: "↖", label: "Select (V)" },
            { id: "text" as Tool, icon: "T", label: "Text (T)" },
            { id: "shape" as Tool, icon: "⬜", label: "Shape (S)" },
            { id: "sticker" as Tool, icon: "⭐", label: "Sticker" },
            { id: "image" as Tool, icon: "🖼", label: "Image" },
            { id: "eyedropper" as Tool, icon: "💉", label: "Eyedropper (I)" },
            { id: "ruler" as Tool, icon: "📏", label: "Ruler" },
          ] as const).map(t => (
            <button key={t.id} onClick={() => { setTool(t.id); if (t.id === "image") fileInputRef.current?.click(); }} title={t.label}
              style={{ padding: "4px 8px", borderRadius: 5, border: "none", background: tool === t.id ? "rgba(124,58,237,0.4)" : "transparent", color: tool === t.id ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: t.id === "text" ? 13 : 14, fontWeight: 700 }}>
              {t.icon}
            </button>
          ))}
        </div>

        {/* View Controls */}
        <div style={{ marginLeft: 6, display: "flex", gap: 3, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 3 }}>
          <button onClick={() => setShowGrid(g => !g)} title="Toggle Grid" style={{ padding: "4px 8px", borderRadius: 5, border: "none", background: showGrid ? "rgba(124,58,237,0.3)" : "transparent", color: showGrid ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 12 }}>⊞</button>
          <button onClick={() => setShowRulers(r => !r)} title="Toggle Rulers" style={{ padding: "4px 8px", borderRadius: 5, border: "none", background: showRulers ? "rgba(124,58,237,0.3)" : "transparent", color: showRulers ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 12 }}>📏</button>
          <button onClick={() => setSnapToGrid(s => !s)} title="Snap to Grid" style={{ padding: "4px 8px", borderRadius: 5, border: "none", background: snapToGrid ? "rgba(124,58,237,0.3)" : "transparent", color: snapToGrid ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 12 }}>🧲</button>
          <button onClick={() => setShowGuides(g => !g)} title="Show Guides" style={{ padding: "4px 8px", borderRadius: 5, border: "none", background: showGuides ? "rgba(124,58,237,0.3)" : "transparent", color: showGuides ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 12 }}>⊕</button>
        </div>

        {/* Undo/Redo */}
        <div style={{ display: "flex", gap: 2 }}>
          <button onClick={undo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)"
            style={{ padding: "4px 8px", borderRadius: 5, border: "none", background: "rgba(255,255,255,0.06)", color: historyIndex <= 0 ? "#3b3b4f" : "#9ca3af", cursor: historyIndex <= 0 ? "not-allowed" : "pointer", fontSize: 14 }}>↩</button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo (Ctrl+Y)"
            style={{ padding: "4px 8px", borderRadius: 5, border: "none", background: "rgba(255,255,255,0.06)", color: historyIndex >= history.length - 1 ? "#3b3b4f" : "#9ca3af", cursor: historyIndex >= history.length - 1 ? "not-allowed" : "pointer", fontSize: 14 }}>↪</button>
        </div>

        {/* Zoom */}
        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
          <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#9ca3af", borderRadius: 4, width: 24, height: 24, cursor: "pointer", fontSize: 16 }}>−</button>
          <button onClick={() => setZoom(0.5)} style={{ fontSize: 11, color: "#6b7280", minWidth: 40, textAlign: "center", lineHeight: "24px", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>{Math.round(zoom * 100)}%</button>
          <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#9ca3af", borderRadius: 4, width: 24, height: 24, cursor: "pointer", fontSize: 16 }}>+</button>
          <button onClick={() => setZoom(1)} style={{ padding: "2px 6px", borderRadius: 4, border: "none", background: "rgba(255,255,255,0.04)", color: "#6b7280", cursor: "pointer", fontSize: 10 }}>1:1</button>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          <button onClick={() => setShowKeyboardHelp(h => !h)} title="Keyboard Shortcuts (?)"
            style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 11 }}>⌨️</button>
          {selected && (
            <>
              <button onClick={copyLayer} title="Copy (Ctrl+C)" style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 11 }}>⎘</button>
              <button onClick={duplicateLayer} title="Duplicate (Ctrl+D)" style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 11 }}>⧉</button>
              <button onClick={deleteSelected} title="Delete" style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#f87171", cursor: "pointer", fontSize: 11 }}>🗑</button>
            </>
          )}
          {copiedLayer && (
            <button onClick={pasteLayer} title="Paste (Ctrl+V)" style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 11 }}>📋</button>
          )}
          <button onClick={() => setRightTab("export")} style={{ padding: "5px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 12 }}>⬇ Export</button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left Toolbar — Stickers / Quick Shapes */}
        {sidebarLeft && (
          <div style={{ width: 52, background: "#13131f", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0", gap: 4, overflow: "auto" }}>
            <div style={{ fontSize: 9, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Shapes</div>
            {([["rect", "⬜"], ["circle", "⭕"], ["triangle", "△"], ["star", "★"], ["heart", "♥"], ["diamond", "◆"], ["arrow", "➜"], ["cloud", "☁"], ["pentagon", "⬠"], ["hexagon", "⬡"]] as const).map(([s, icon]) => (
              <button key={s} onClick={() => { addLayer("shape", { w: 120, h: 120, bg: fillColor, shape: s as ShapeType }); }} title={`Add ${s}`}
                style={{ width: 38, height: 38, borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", cursor: "pointer", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {icon}
              </button>
            ))}
            <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
            <div style={{ fontSize: 9, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Gradient</div>
            {GRADIENT_PRESETS.slice(0, 4).map(g => (
              <button key={g.name} onClick={() => addLayer("gradient", { w: 200, h: 120, bg: g.a, bg2: g.b, gradientAngle: 135, gradientType: "linear" })} title={g.name}
                style={{ width: 38, height: 38, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", background: `linear-gradient(135deg, ${g.a}, ${g.b})` }} />
            ))}
            <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
            <div style={{ fontSize: 9, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Stickers</div>
            {STICKERS.slice(0, 12).map(s => (
              <button key={s} onClick={() => addLayer("sticker", { content: s, w: 80, h: 80 })} title={`Add ${s}`}
                style={{ width: 38, height: 38, borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", cursor: "pointer", fontSize: 19, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Canvas */}
        <div style={{ flex: 1, overflow: "auto", background: dragOver ? "rgba(124,58,237,0.08)" : "#0a0a14", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 40, cursor: tool !== "select" ? "crosshair" : "default", transition: "background 0.2s" }}>
          {/* Ruler Top */}
          {showRulers && (
            <div style={{ position: "absolute", top: 52, left: 52, right: 0, height: 20, background: "#1a1a2e", borderBottom: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", zIndex: 5, display: "flex", alignItems: "center" }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} style={{ position: "relative", width: 100, borderRight: "1px solid rgba(255,255,255,0.1)", height: "100%", display: "flex", alignItems: "flex-end" }}>
                  <span style={{ fontSize: 8, color: "#4b5563", marginLeft: 2, marginBottom: 2 }}>{i * 100}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{
            width: template.w * zoom, height: template.h * zoom,
            background: bgStyle,
            boxShadow: "0 8px 60px rgba(0,0,0,0.8)",
            position: "relative", flexShrink: 0, overflow: "hidden",
            outline: dragOver ? "3px dashed #7c3aed" : "none",
          }} onClick={handleCanvasClick}>
            {/* Grid overlay */}
            {showGrid && (
              <svg style={{ position: "absolute", inset: 0, opacity: 0.15, pointerEvents: "none", zIndex: 1 }} width={template.w * zoom} height={template.h * zoom}>
                <defs>
                  <pattern id="gridpat" width={gridSize * zoom} height={gridSize * zoom} patternUnits="userSpaceOnUse">
                    <path d={`M ${gridSize * zoom} 0 L 0 0 0 ${gridSize * zoom}`} fill="none" stroke="#7c3aed" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#gridpat)" />
              </svg>
            )}
            {/* Guides */}
            {showGuides && (
              <>
                <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(0,255,255,0.3)", pointerEvents: "none", zIndex: 2 }} />
                <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(0,255,255,0.3)", pointerEvents: "none", zIndex: 2 }} />
              </>
            )}
            <div ref={canvasRef} style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: "top left", width: template.w, height: template.h }}>
              {layers.map(layer =>
                renderLayer(layer, layer.id === selected, () => { if (!layer.locked) setSelected(layer.id); },
                  (sx, sy, cx, cy) => dragLayer(layer.id, sx, sy, cx, cy), zoom)
              )}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ width: 272, background: "#13131f", borderLeft: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", overflowX: "auto" }}>
            {(["layers", "properties", "ai", "brand", "export"] as const).map(tab => (
              <button key={tab} onClick={() => setRightTab(tab)}
                style={{ flex: "0 0 auto", padding: "9px 8px", fontSize: 10, cursor: "pointer", border: "none", background: "none",
                  color: rightTab === tab ? "#a78bfa" : "#6b7280", fontWeight: rightTab === tab ? 700 : 400,
                  borderBottom: rightTab === tab ? "2px solid #7c3aed" : "2px solid transparent", textTransform: "capitalize", whiteSpace: "nowrap" }}>
                {tab === "layers" ? "🗂 Layers" : tab === "properties" ? "⚙ Props" : tab === "ai" ? "🤖 AI" : tab === "brand" ? "🎨 Brand" : "⬇ Export"}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: "auto" }}>
            {/* Canvas Background */}
            <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Canvas Background</div>
              <div style={row}>
                <span style={lbl()}>Color</span>
                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: 32, height: 26, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, cursor: "pointer", background: "transparent" }} />
                <label style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                  <input type="checkbox" checked={bgGradient} onChange={e => setBgGradient(e.target.checked)} style={{ cursor: "pointer" }} />
                  Gradient
                </label>
                {bgGradient && <input type="color" value={bgGradientColor2} onChange={e => setBgGradientColor2(e.target.value)} style={{ width: 26, height: 26, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, cursor: "pointer", background: "transparent" }} />}
              </div>
            </div>

            {rightTab === "layers" && (
              <div style={{ padding: 12 }}>
                <div style={row}>
                  <button onClick={() => addLayer("text", { content: textInput, w: 200, h: 60, color: "#111827", bg: "transparent", fontSize, fontFamily: selectedFont, fontWeight: "700" })}
                    style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 11 }}>+ Text</button>
                  <button onClick={() => addLayer("shape", { w: 120, h: 120, bg: fillColor, shape: "rect" })}
                    style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 11 }}>+ Shape</button>
                  <button onClick={() => addLayer("gradient", { w: 200, h: 120, bg: "#7c3aed", bg2: "#ec4899", gradientAngle: 135, gradientType: "linear" })}
                    style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 11 }}>+ Grad</button>
                </div>

                {/* Alignment tools */}
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Align Selected</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {[["left", "⇤"], ["center-h", "↔"], ["right", "⇥"], ["top", "⇑"], ["center-v", "↕"], ["bottom", "⇓"]].map(([a, icon]) => (
                      <button key={a} onClick={() => alignLayers(a as any)} title={a}
                        style={{ padding: "4px 8px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", color: "#9ca3af", cursor: "pointer", fontSize: 13 }}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, margin: "12px 0 6px" }}>Layers ({layers.length})</div>
                {layers.length === 0 && <div style={{ textAlign: "center", color: "#4b5563", fontSize: 12, padding: "20px 0" }}>Click the canvas to add elements</div>}
                {[...layers].reverse().map((l) => (
                  <div key={l.id} onClick={() => setSelected(l.id)}
                    style={{ padding: "6px 8px", borderRadius: 6, marginBottom: 3, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                      background: l.id === selected ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${l.id === selected ? "#7c3aed" : "rgba(255,255,255,0.06)"}`,
                      opacity: l.visible ? 1 : 0.4 }}>
                    <span style={{ fontSize: 13 }}>{l.type === "text" ? "T" : l.type === "sticker" ? l.content : l.type === "shape" ? "⬜" : l.type === "gradient" ? "🌈" : l.type === "line" ? "—" : "🖼"}</span>
                    <span style={{ fontSize: 11, color: "#d1d5db", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {l.type === "text" ? (l.content?.slice(0, 14) || "Text") : l.type === "sticker" ? l.content : l.type}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); updateLayer(l.id, { visible: !l.visible }); }}
                      style={{ background: "none", border: "none", color: l.visible ? "#6b7280" : "#3b3b4f", cursor: "pointer", fontSize: 11, padding: 0 }}>👁</button>
                    <button onClick={(e) => { e.stopPropagation(); updateLayer(l.id, { locked: !l.locked }); }}
                      style={{ background: "none", border: "none", color: l.locked ? "#a78bfa" : "#3b3b4f", cursor: "pointer", fontSize: 10, padding: 0 }}>
                      {l.locked ? "🔒" : "🔓"}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); moveLayer(l.id, -1); }}
                      style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 10, padding: 0 }}>↑</button>
                    <button onClick={(e) => { e.stopPropagation(); moveLayer(l.id, 1); }}
                      style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 10, padding: 0 }}>↓</button>
                  </div>
                ))}

                {/* Stickers */}
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Stickers</div>
                  <input value={searchSticker} onChange={e => setSearchSticker(e.target.value)} placeholder="Search..."
                    style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 8px", color: "#e5e7eb", fontSize: 11, marginBottom: 6 }} />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {STICKERS.filter(s => !searchSticker || s.includes(searchSticker)).map(s => (
                      <button key={s} onClick={() => addLayer("sticker", { content: s, w: 80, h: 80 })}
                        style={{ width: 34, height: 34, borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", cursor: "pointer", fontSize: 17 }}>
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
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, textTransform: "uppercase" }}>{selectedLayer.type} Properties</div>

                    {sectionHead("Position & Size")}
                    {[{ l: "X", k: "x" }, { l: "Y", k: "y" }, { l: "W", k: "w" }, { l: "H", k: "h" }].map(({ l, k }) => (
                      <div key={k} style={row}>
                        <span style={lbl(24)}>{l}</span>
                        <input type="number" value={(selectedLayer as any)[k] ?? 0}
                          onChange={e => updateLayer(selected!, { [k]: Number(e.target.value) } as Partial<Layer>)}
                          onBlur={e => commitUpdate(selected!, { [k]: Number(e.target.value) } as Partial<Layer>)}
                          style={inp()} />
                      </div>
                    ))}

                    {sectionHead("Transform")}
                    <div style={row}>
                      <span style={lbl()}>Rotation</span>
                      <input type="range" min={-180} max={180} value={selectedLayer.rotation ?? 0} onChange={e => updateLayer(selected!, { rotation: Number(e.target.value) })} onMouseUp={e => commitUpdate(selected!, { rotation: Number((e.target as HTMLInputElement).value) })} style={{ flex: 1 }} />
                      <span style={{ fontSize: 11, color: "#6b7280", minWidth: 32 }}>{selectedLayer.rotation ?? 0}°</span>
                    </div>
                    <div style={row}>
                      <span style={lbl()}>Opacity</span>
                      <input type="range" min={0} max={100} value={selectedLayer.opacity ?? 100} onChange={e => updateLayer(selected!, { opacity: Number(e.target.value) })} style={{ flex: 1 }} />
                      <span style={{ fontSize: 11, color: "#6b7280", minWidth: 32 }}>{selectedLayer.opacity ?? 100}%</span>
                    </div>
                    <div style={row}>
                      <span style={lbl()}>Skew X</span>
                      <input type="range" min={-45} max={45} value={selectedLayer.skewX ?? 0} onChange={e => updateLayer(selected!, { skewX: Number(e.target.value) })} style={{ flex: 1 }} />
                      <span style={{ fontSize: 11, color: "#6b7280", minWidth: 28 }}>{selectedLayer.skewX ?? 0}°</span>
                    </div>
                    <div style={row}>
                      <span style={lbl()}>Skew Y</span>
                      <input type="range" min={-45} max={45} value={selectedLayer.skewY ?? 0} onChange={e => updateLayer(selected!, { skewY: Number(e.target.value) })} style={{ flex: 1 }} />
                      <span style={{ fontSize: 11, color: "#6b7280", minWidth: 28 }}>{selectedLayer.skewY ?? 0}°</span>
                    </div>
                    <div style={row}>
                      <span style={lbl()}>Flip</span>
                      <button onClick={() => updateLayer(selected!, { flipX: !selectedLayer.flipX })}
                        style={{ flex: 1, padding: "4px 0", borderRadius: 4, border: "1px solid", borderColor: selectedLayer.flipX ? "#7c3aed" : "rgba(255,255,255,0.1)", background: selectedLayer.flipX ? "rgba(124,58,237,0.2)" : "transparent", color: selectedLayer.flipX ? "#a78bfa" : "#9ca3af", cursor: "pointer", fontSize: 11 }}>⇔ Horiz</button>
                      <button onClick={() => updateLayer(selected!, { flipY: !selectedLayer.flipY })}
                        style={{ flex: 1, padding: "4px 0", borderRadius: 4, border: "1px solid", borderColor: selectedLayer.flipY ? "#7c3aed" : "rgba(255,255,255,0.1)", background: selectedLayer.flipY ? "rgba(124,58,237,0.2)" : "transparent", color: selectedLayer.flipY ? "#a78bfa" : "#9ca3af", cursor: "pointer", fontSize: 11 }}>⇕ Vert</button>
                    </div>

                    {sectionHead("Blend Mode")}
                    <select value={selectedLayer.blendMode || "normal"} onChange={e => updateLayer(selected!, { blendMode: e.target.value as BlendMode })}
                      style={{ ...inp(), padding: "5px 8px" }}>
                      {BLEND_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>

                    {sectionHead("Layer Order")}
                    <div style={row}>
                      <button onClick={() => bringToFront(selected!)} style={{ flex: 1, padding: "5px 0", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 11 }}>⤒ Front</button>
                      <button onClick={() => sendToBack(selected!)} style={{ flex: 1, padding: "5px 0", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 11 }}>⤓ Back</button>
                    </div>

                    {sectionHead("Shadow")}
                    <div style={row}>
                      <span style={lbl()}>Offset X</span>
                      <input type="number" value={selectedLayer.shadowX ?? 0} onChange={e => updateLayer(selected!, { shadowX: Number(e.target.value) })} style={inp()} />
                    </div>
                    <div style={row}>
                      <span style={lbl()}>Offset Y</span>
                      <input type="number" value={selectedLayer.shadowY ?? 0} onChange={e => updateLayer(selected!, { shadowY: Number(e.target.value) })} style={inp()} />
                    </div>
                    <div style={row}>
                      <span style={lbl()}>Blur</span>
                      <input type="number" value={selectedLayer.shadowBlur ?? 0} onChange={e => updateLayer(selected!, { shadowBlur: Number(e.target.value) })} style={inp()} />
                    </div>
                    <div style={row}>
                      <span style={lbl()}>S. Color</span>
                      <input type="color" value={selectedLayer.shadowColor || "#000000"} onChange={e => updateLayer(selected!, { shadowColor: e.target.value })} style={{ flex: 1, height: 28, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
                    </div>

                    {sectionHead("Border")}
                    <div style={row}>
                      <span style={lbl()}>Width</span>
                      <input type="number" value={selectedLayer.borderWidth ?? 0} onChange={e => updateLayer(selected!, { borderWidth: Number(e.target.value) })} style={inp()} />
                    </div>
                    <div style={row}>
                      <span style={lbl()}>Color</span>
                      <input type="color" value={selectedLayer.borderColor || "#7c3aed"} onChange={e => updateLayer(selected!, { borderColor: e.target.value })} style={{ flex: 1, height: 28, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
                    </div>
                    <div style={row}>
                      <span style={lbl()}>Radius</span>
                      <input type="number" value={selectedLayer.borderRadius ?? 0} onChange={e => updateLayer(selected!, { borderRadius: Number(e.target.value) })} style={inp()} />
                    </div>

                    {selectedLayer.type === "text" && (
                      <>
                        {sectionHead("Text")}
                        <div style={row}>
                          <span style={lbl()}>Content</span>
                          <input value={selectedLayer.content ?? ""} onChange={e => updateLayer(selected!, { content: e.target.value })} style={inp()} />
                        </div>
                        <div style={row}>
                          <span style={lbl()}>Font</span>
                          <select value={selectedLayer.fontFamily || "Inter"} onChange={e => updateLayer(selected!, { fontFamily: e.target.value })} style={{ ...inp(), padding: "4px 6px" }}>
                            {FONTS.map(f => <option key={f}>{f}</option>)}
                          </select>
                        </div>
                        <div style={row}>
                          <span style={lbl()}>Size</span>
                          <input type="number" value={selectedLayer.fontSize ?? 32} onChange={e => updateLayer(selected!, { fontSize: Number(e.target.value) })} style={inp()} />
                        </div>
                        <div style={row}>
                          <span style={lbl()}>Weight</span>
                          <select value={selectedLayer.fontWeight || "700"} onChange={e => updateLayer(selected!, { fontWeight: e.target.value })} style={{ ...inp(), padding: "4px 6px" }}>
                            {["100", "200", "300", "400", "500", "600", "700", "800", "900"].map(w => <option key={w} value={w}>{w}</option>)}
                          </select>
                        </div>
                        <div style={row}>
                          <span style={lbl()}>Align</span>
                          <div style={{ display: "flex", gap: 3 }}>
                            {["left", "center", "right"].map(a => (
                              <button key={a} onClick={() => updateLayer(selected!, { textAlign: a })}
                                style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid", borderColor: selectedLayer.textAlign === a ? "#7c3aed" : "rgba(255,255,255,0.1)", background: selectedLayer.textAlign === a ? "rgba(124,58,237,0.2)" : "transparent", color: selectedLayer.textAlign === a ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 12 }}>
                                {a === "left" ? "⬤◌◌" : a === "center" ? "◌⬤◌" : "◌◌⬤"}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div style={row}>
                          <span style={lbl()}>Style</span>
                          <button onClick={() => updateLayer(selected!, { fontStyle: selectedLayer.fontStyle === "italic" ? "normal" : "italic" })}
                            style={{ flex: 1, padding: "4px 0", borderRadius: 4, border: "1px solid", borderColor: selectedLayer.fontStyle === "italic" ? "#7c3aed" : "rgba(255,255,255,0.1)", background: selectedLayer.fontStyle === "italic" ? "rgba(124,58,237,0.2)" : "transparent", color: selectedLayer.fontStyle === "italic" ? "#a78bfa" : "#9ca3af", cursor: "pointer", fontSize: 12, fontStyle: "italic" }}>I</button>
                          <button onClick={() => updateLayer(selected!, { textDecoration: selectedLayer.textDecoration === "underline" ? "none" : "underline" })}
                            style={{ flex: 1, padding: "4px 0", borderRadius: 4, border: "1px solid", borderColor: selectedLayer.textDecoration === "underline" ? "#7c3aed" : "rgba(255,255,255,0.1)", background: selectedLayer.textDecoration === "underline" ? "rgba(124,58,237,0.2)" : "transparent", color: selectedLayer.textDecoration === "underline" ? "#a78bfa" : "#9ca3af", cursor: "pointer", fontSize: 12, textDecoration: "underline" }}>U</button>
                        </div>
                        <div style={row}>
                          <span style={lbl()}>Letter Sp.</span>
                          <input type="number" value={selectedLayer.letterSpacing ?? 0} onChange={e => updateLayer(selected!, { letterSpacing: Number(e.target.value) })} style={inp()} />
                        </div>
                        <div style={row}>
                          <span style={lbl()}>Line H.</span>
                          <input type="number" step={0.1} value={selectedLayer.lineHeight ?? 1.2} onChange={e => updateLayer(selected!, { lineHeight: Number(e.target.value) })} style={inp()} />
                        </div>
                        <div style={row}>
                          <span style={lbl()}>Color</span>
                          <input type="color" value={selectedLayer.color ?? "#111111"} onChange={e => updateLayer(selected!, { color: e.target.value })} style={{ flex: 1, height: 28, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
                        </div>
                        <div style={row}>
                          <span style={lbl()}>Text FX</span>
                          <select value={selectedLayer.textEffect || "none"} onChange={e => updateLayer(selected!, { textEffect: e.target.value as TextEffect })} style={{ ...inp(), padding: "4px 6px" }}>
                            {["none", "shadow", "outline", "gradient", "emboss"].map(x => <option key={x} value={x}>{x}</option>)}
                          </select>
                        </div>
                        {(selectedLayer.textEffect === "gradient" || selectedLayer.textEffect === "outline") && (
                          <div style={row}>
                            <span style={lbl()}>Color 2</span>
                            <input type="color" value={selectedLayer.bg2 ?? "#ec4899"} onChange={e => updateLayer(selected!, { bg2: e.target.value })} style={{ flex: 1, height: 28, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
                          </div>
                        )}
                        <div style={row}>
                          <span style={lbl()}>BG</span>
                          <input type="color" value={selectedLayer.bg || "#00000000"} onChange={e => updateLayer(selected!, { bg: e.target.value })} style={{ flex: 1, height: 28, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
                        </div>
                      </>
                    )}

                    {selectedLayer.type === "shape" && (
                      <>
                        {sectionHead("Shape")}
                        <div style={row}>
                          <span style={lbl()}>Shape</span>
                          <select value={selectedLayer.shape ?? "rect"} onChange={e => updateLayer(selected!, { shape: e.target.value as ShapeType })} style={{ ...inp(), padding: "4px 6px" }}>
                            {(["rect", "circle", "triangle", "star", "heart", "diamond", "pentagon", "hexagon", "arrow", "cloud"] as ShapeType[]).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div style={row}>
                          <span style={lbl()}>Fill</span>
                          <input type="color" value={selectedLayer.bg ?? "#7c3aed"} onChange={e => updateLayer(selected!, { bg: e.target.value })} style={{ flex: 1, height: 28, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
                        </div>
                        <div style={row}>
                          <span style={lbl()}>Fill 2</span>
                          <input type="color" value={selectedLayer.bg2 ?? selectedLayer.bg ?? "#7c3aed"} onChange={e => updateLayer(selected!, { bg2: e.target.value })} style={{ flex: 1, height: 28, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
                        </div>
                        <div style={row}>
                          <span style={lbl()}>Grad °</span>
                          <input type="range" min={0} max={360} value={selectedLayer.gradientAngle ?? 135} onChange={e => updateLayer(selected!, { gradientAngle: Number(e.target.value) })} style={{ flex: 1 }} />
                          <span style={{ fontSize: 11, color: "#6b7280", minWidth: 28 }}>{selectedLayer.gradientAngle ?? 135}°</span>
                        </div>
                      </>
                    )}

                    {selectedLayer.type === "gradient" && (
                      <>
                        {sectionHead("Gradient")}
                        <div style={row}>
                          <span style={lbl()}>Color A</span>
                          <input type="color" value={selectedLayer.bg ?? "#7c3aed"} onChange={e => updateLayer(selected!, { bg: e.target.value })} style={{ flex: 1, height: 28, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
                        </div>
                        <div style={row}>
                          <span style={lbl()}>Color B</span>
                          <input type="color" value={selectedLayer.bg2 ?? "#ec4899"} onChange={e => updateLayer(selected!, { bg2: e.target.value })} style={{ flex: 1, height: 28, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
                        </div>
                        <div style={row}>
                          <span style={lbl()}>Type</span>
                          <select value={selectedLayer.gradientType || "linear"} onChange={e => updateLayer(selected!, { gradientType: e.target.value as "linear" | "radial" })} style={{ ...inp(), padding: "4px 6px" }}>
                            <option value="linear">Linear</option>
                            <option value="radial">Radial</option>
                          </select>
                        </div>
                        {selectedLayer.gradientType !== "radial" && (
                          <div style={row}>
                            <span style={lbl()}>Angle</span>
                            <input type="range" min={0} max={360} value={selectedLayer.gradientAngle ?? 135} onChange={e => updateLayer(selected!, { gradientAngle: Number(e.target.value) })} style={{ flex: 1 }} />
                            <span style={{ fontSize: 11, color: "#6b7280", minWidth: 28 }}>{selectedLayer.gradientAngle ?? 135}°</span>
                          </div>
                        )}
                        <div style={{ marginTop: 8 }}>
                          <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 6 }}>Gradient Presets</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {GRADIENT_PRESETS.map(g => (
                              <button key={g.name} onClick={() => updateLayer(selected!, { bg: g.a, bg2: g.b })} title={g.name}
                                style={{ width: 32, height: 24, borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", background: `linear-gradient(135deg, ${g.a}, ${g.b})` }} />
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {selectedLayer.type === "image" && (
                      <>
                        {sectionHead("Image")}
                        <div style={row}>
                          <span style={lbl()}>Filter</span>
                          <select value={selectedLayer.imageFilter || "none"} onChange={e => updateLayer(selected!, { imageFilter: e.target.value === "none" ? undefined : e.target.value })} style={{ ...inp(), padding: "4px 6px" }}>
                            {IMAGE_FILTERS.map(f => <option key={f} value={f}>{f.split("(")[0]}</option>)}
                          </select>
                        </div>
                        <button onClick={() => fileInputRef.current?.click()}
                          style={{ width: "100%", padding: "8px 0", borderRadius: 6, border: "1px dashed rgba(255,255,255,0.15)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 12, marginTop: 4 }}>
                          📁 Replace Image
                        </button>
                      </>
                    )}

                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <button onClick={() => updateLayer(selected!, { locked: !selectedLayer.locked })}
                        style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: selectedLayer.locked ? "rgba(124,58,237,0.2)" : "transparent", color: selectedLayer.locked ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 11 }}>
                        {selectedLayer.locked ? "🔒 Locked" : "🔓 Lock"}
                      </button>
                      <button onClick={deleteSelected} style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#f87171", cursor: "pointer", fontSize: 11 }}>🗑 Delete</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", color: "#4b5563", fontSize: 13, padding: 24 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>👆</div>
                    Select a layer to edit its properties
                  </div>
                )}
              </div>
            )}

            {rightTab === "ai" && (
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700, marginBottom: 10 }}>🤖 AI Design Tools</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>✨ AI Layout Generator</div>
                    <textarea rows={3} value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder='e.g. "Modern tech startup Instagram post"'
                      style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "7px 10px", color: "#e5e7eb", fontSize: 12, resize: "none", marginBottom: 8 }} />
                    <button onClick={generateAILayout} disabled={aiGenerating}
                      style={{ width: "100%", padding: "8px 0", borderRadius: 6, border: "none", background: aiGenerating ? "#4b3b6d" : "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 700, cursor: aiGenerating ? "not-allowed" : "pointer", fontSize: 12 }}>
                      {aiGenerating ? "⏳ Generating..." : "✨ Generate Layout"}
                    </button>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>🖼 Background Remover</div>
                    <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, lineHeight: 1.5 }}>Upload an image and remove its background automatically using AI.</p>
                    <button onClick={() => fileInputRef.current?.click()} style={{ width: "100%", padding: "8px 0", borderRadius: 6, border: "1px dashed rgba(255,255,255,0.15)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 11 }}>📁 Upload & Remove BG</button>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>🎨 AI Color Palette</div>
                    <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
                      {brandColors.slice(0, 6).map((c, i) => (
                        <div key={i} style={{ flex: 1, height: 26, borderRadius: 4, background: c, cursor: "pointer" }} title={c} onClick={() => { if (selected) updateLayer(selected, { bg: c }); }} />
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                      {["custom", "complementary", "triadic", "analogous"].map(m => (
                        <button key={m} onClick={() => applyColorPalette(m as any)}
                          style={{ flex: 1, padding: "3px 0", borderRadius: 4, border: "1px solid", borderColor: colorPaletteMode === m ? "#7c3aed" : "rgba(255,255,255,0.1)", background: colorPaletteMode === m ? "rgba(124,58,237,0.2)" : "transparent", color: colorPaletteMode === m ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 9 }}>
                          {m.slice(0, 4)}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setBrandColors(BRAND_COLORS.sort(() => Math.random() - 0.5).slice(0, 6))}
                      style={{ width: "100%", padding: "7px 0", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 11 }}>
                      🔀 Regenerate
                    </button>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>✦ Smart Suggestions</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {["Add gradient background", "Add title text layer", "Add CTA button shape", "Add accent sticker", "Add logo placeholder"].map(s => (
                        <button key={s} onClick={() => {
                          if (s.includes("gradient")) addLayer("gradient", { w: template.w, h: template.h, x: 0, y: 0, bg: "#7c3aed", bg2: "#ec4899", gradientAngle: 135 });
                          else if (s.includes("title")) addLayer("text", { content: "Your Title", w: template.w * 0.8, h: 80, x: template.w * 0.1, y: template.h * 0.3, fontSize: 64, fontWeight: "800", color: "#fff" });
                          else if (s.includes("CTA")) addLayer("shape", { w: 200, h: 50, shape: "rect", bg: "#7c3aed", borderRadius: 12 });
                          else if (s.includes("sticker")) addLayer("sticker", { content: "✨", w: 80, h: 80 });
                          else if (s.includes("logo")) addLayer("text", { content: "LOGO", w: 120, h: 40, fontSize: 20, fontWeight: "800", color: "#7c3aed" });
                        }}
                          style={{ padding: "7px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", color: "#9ca3af", cursor: "pointer", fontSize: 11, textAlign: "left" }}>
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  {eyedropperColor && (
                    <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>💉 Sampled Color</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: eyedropperColor, border: "2px solid rgba(255,255,255,0.2)" }} />
                        <span style={{ fontSize: 12, color: "#9ca3af", fontFamily: "monospace" }}>{eyedropperColor}</span>
                        <button onClick={() => { if (selected) updateLayer(selected, { bg: eyedropperColor! }); }}
                          style={{ flex: 1, padding: "5px 0", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#a78bfa", cursor: "pointer", fontSize: 11 }}>Apply</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {rightTab === "brand" && (
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700, marginBottom: 10 }}>🎨 Brand Kit</div>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Brand Name</div>
                  <input value={brandName} onChange={e => setBrandName(e.target.value)} style={{ ...inp(), width: "100%", boxSizing: "border-box", marginBottom: 8 }} />
                  <button onClick={() => addLayer("text", { content: brandName, w: 200, h: 48, fontSize: 28, fontWeight: "800", color: brandColors[0] })}
                    style={{ width: "100%", padding: "7px 0", borderRadius: 6, border: "none", background: "rgba(124,58,237,0.3)", color: "#a78bfa", cursor: "pointer", fontSize: 11 }}>+ Add Brand Name</button>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Brand Colors</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {brandColors.map((c, i) => (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <input type="color" value={c} onChange={e => setBrandColors(prev => prev.map((x, j) => j === i ? e.target.value : x))}
                          style={{ width: 40, height: 40, border: "2px solid rgba(255,255,255,0.1)", borderRadius: 8, cursor: "pointer", background: "transparent" }} />
                        <button onClick={() => setBrandColors(prev => prev.filter((_, j) => j !== i))}
                          style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 10, padding: 0 }}>✕</button>
                      </div>
                    ))}
                    <button onClick={() => setBrandColors(prev => [...prev, "#7c3aed"])}
                      style={{ width: 40, height: 40, borderRadius: 8, border: "1px dashed rgba(255,255,255,0.2)", background: "transparent", color: "#6b7280", cursor: "pointer", fontSize: 18 }}>+</button>
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Brand Typography</div>
                  <select value={selectedFont} onChange={e => setSelectedFont(e.target.value)} style={{ width: "100%", ...inp(), padding: "6px 8px", marginBottom: 8 }}>
                    {FONTS.map(f => <option key={f}>{f}</option>)}
                  </select>
                  <div style={{ fontSize: 14, fontFamily: selectedFont, color: "#e5e7eb", padding: "8px 0", textAlign: "center" }}>{brandName || "Brand Name Preview"}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Gradient Presets</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {GRADIENT_PRESETS.map(g => (
                      <button key={g.name} onClick={() => addLayer("gradient", { w: template.w, h: template.h, x: 0, y: 0, bg: g.a, bg2: g.b, gradientAngle: 135 })} title={g.name}
                        style={{ width: 44, height: 44, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", background: `linear-gradient(135deg, ${g.a}, ${g.b})`, position: "relative", overflow: "hidden" }}>
                        <span style={{ position: "absolute", bottom: 2, left: 0, right: 0, textAlign: "center", fontSize: 8, color: "rgba(255,255,255,0.8)" }}>{g.name.slice(0, 6)}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Quick Templates</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {["Social Post", "Business Card Layout", "Logo Frame", "Banner Layout"].map(t => (
                      <button key={t} style={{ padding: "7px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", color: "#9ca3af", cursor: "pointer", fontSize: 11, textAlign: "left" }}>
                        📐 {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {rightTab === "export" && (
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700, marginBottom: 10 }}>⬇ Export Design</div>

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Format</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {(["PNG", "JPG", "SVG", "PDF", "WebP"] as const).map(f => (
                      <button key={f} onClick={() => setExportFormat(f)}
                        style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid", borderColor: exportFormat === f ? "#7c3aed" : "rgba(255,255,255,0.1)", background: exportFormat === f ? "rgba(124,58,237,0.2)" : "transparent", color: exportFormat === f ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Scale</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3].map(s => (
                      <button key={s} onClick={() => setExportScale(s)}
                        style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid", borderColor: exportScale === s ? "#7c3aed" : "rgba(255,255,255,0.1)", background: exportScale === s ? "rgba(124,58,237,0.2)" : "transparent", color: exportScale === s ? "#a78bfa" : "#6b7280", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                        {s}×
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 6 }}>
                    Output: {template.w * exportScale}×{template.h * exportScale}px
                  </div>
                </div>

                {exportFormat === "JPG" && (
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Quality: {exportQuality}%</div>
                    <input type="range" min={10} max={100} value={exportQuality} onChange={e => setExportQuality(Number(e.target.value))} style={{ width: "100%" }} />
                  </div>
                )}

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Export Info</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b7280" }}>
                      <span>Format</span><span style={{ color: "#a78bfa" }}>{exportFormat}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b7280" }}>
                      <span>Dimensions</span><span style={{ color: "#a78bfa" }}>{template.w * exportScale}×{template.h * exportScale}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b7280" }}>
                      <span>Layers</span><span style={{ color: "#a78bfa" }}>{layers.length}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b7280" }}>
                      <span>Template</span><span style={{ color: "#a78bfa" }}>{template.label}</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => alert(`Exporting as ${exportFormat} at ${exportScale}× scale (${template.w * exportScale}×${template.h * exportScale}px).\n\nIn production this uses html2canvas to render the canvas at full resolution.`)}
                  style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13, marginBottom: 8 }}>
                  ⬇ Download {exportFormat}
                </button>
                <button style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 12, marginBottom: 4 }}>
                  📋 Copy to Clipboard
                </button>
                <button style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 12, marginBottom: 4 }}>
                  🔗 Share Link
                </button>
                <button style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 12 }}>
                  ☁ Save to Cloud
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
