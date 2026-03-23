import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";

type Screen = { id: string; name: string; elements: CanvasElement[] };
type CanvasElement = {
  id: string; type: string; x: number; y: number; w: number; h: number;
  text?: string; color?: string; bg?: string; fontSize?: number; borderRadius?: number;
};
type DeviceSize = { label: string; w: number; h: number };

const DEVICES: DeviceSize[] = [
  { label: "iPhone 15 Pro", w: 393, h: 852 },
  { label: "iPhone SE", w: 375, h: 667 },
  { label: "Android L", w: 412, h: 915 },
  { label: "Android M", w: 360, h: 800 },
];

const COMPONENT_LIBRARY = [
  { type: "button", label: "Button", icon: "⬜", defaultW: 200, defaultH: 48, color: "#fff", bg: "#7c3aed" },
  { type: "card", label: "Card", icon: "🃏", defaultW: 280, defaultH: 120, color: "#1a1a2e", bg: "#ffffff" },
  { type: "image", label: "Image", icon: "🖼️", defaultW: 280, defaultH: 160, color: "#666", bg: "#e5e7eb" },
  { type: "textfield", label: "Text Field", icon: "✏️", defaultW: 280, defaultH: 44, color: "#374151", bg: "#f9fafb" },
  { type: "navbar", label: "Nav Bar", icon: "📱", defaultW: 390, defaultH: 56, color: "#111827", bg: "#ffffff" },
  { type: "text", label: "Text", icon: "T", defaultW: 200, defaultH: 32, color: "#111827", bg: "transparent" },
  { type: "icon", label: "Icon", icon: "⭐", defaultW: 48, defaultH: 48, color: "#7c3aed", bg: "transparent" },
  { type: "divider", label: "Divider", icon: "—", defaultW: 300, defaultH: 2, color: "#e5e7eb", bg: "#e5e7eb" },
  { type: "avatar", label: "Avatar", icon: "👤", defaultW: 56, defaultH: 56, color: "#fff", bg: "#7c3aed" },
  { type: "badge", label: "Badge", icon: "🏷️", defaultW: 80, defaultH: 28, color: "#fff", bg: "#10b981" },
  { type: "switch", label: "Switch", icon: "🔘", defaultW: 60, defaultH: 32, color: "#fff", bg: "#7c3aed" },
  { type: "tab", label: "Tab Bar", icon: "📑", defaultW: 390, defaultH: 72, color: "#374151", bg: "#ffffff" },
];

const AI_PROMPTS = [
  "Login screen", "Food delivery app home", "Social feed", "Profile page",
  "E-commerce product page", "Dashboard overview", "Onboarding screen", "Settings page",
];

function renderElement(el: CanvasElement, selected: boolean, onClick: () => void, onDrag: (dx: number, dy: number) => void) {
  const base: React.CSSProperties = {
    position: "absolute", left: el.x, top: el.y, width: el.w, height: el.h,
    cursor: "move", userSelect: "none",
    outline: selected ? "2px solid #7c3aed" : "none",
    outlineOffset: 2,
    boxSizing: "border-box",
  };

  let inner: React.ReactNode = null;
  let style: React.CSSProperties = { ...base, background: el.bg || "transparent", borderRadius: el.borderRadius ?? 8, color: el.color || "#111" };

  switch (el.type) {
    case "button":
      style = { ...style, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: el.fontSize ?? 15, borderRadius: el.borderRadius ?? 12 };
      inner = el.text || "Button";
      break;
    case "card":
      style = { ...style, boxShadow: "0 2px 12px rgba(0,0,0,0.1)", border: "1px solid #f0f0f0", padding: 12 };
      inner = <div><div style={{ fontWeight: 600, marginBottom: 4 }}>{el.text || "Card Title"}</div><div style={{ fontSize: 13, opacity: 0.6 }}>Card content goes here</div></div>;
      break;
    case "image":
      style = { ...style, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, borderRadius: el.borderRadius ?? 12 };
      inner = "🖼️";
      break;
    case "textfield":
      style = { ...style, border: "1.5px solid #d1d5db", borderRadius: el.borderRadius ?? 10, padding: "0 14px", display: "flex", alignItems: "center", fontSize: 14 };
      inner = <span style={{ opacity: 0.5 }}>{el.text || "Enter text..."}</span>;
      break;
    case "navbar":
      style = { ...style, borderRadius: 0, display: "flex", alignItems: "center", padding: "0 16px", justifyContent: "space-between", boxShadow: "0 1px 0 #e5e7eb" };
      inner = <><span style={{ fontWeight: 700, fontSize: 18 }}>◀</span><span style={{ fontWeight: 700 }}>{el.text || "App Name"}</span><span style={{ fontSize: 20 }}>⋯</span></>;
      break;
    case "text":
      style = { ...style, display: "flex", alignItems: "center", fontSize: el.fontSize ?? 16, fontWeight: 500 };
      inner = el.text || "Text Label";
      break;
    case "icon":
      style = { ...style, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, borderRadius: "50%" };
      inner = "⭐";
      break;
    case "divider":
      style = { ...style, borderRadius: 1, height: 2 };
      break;
    case "avatar":
      style = { ...style, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 22 };
      inner = (el.text || "A").charAt(0).toUpperCase();
      break;
    case "badge":
      style = { ...style, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 };
      inner = el.text || "New";
      break;
    case "switch":
      style = { ...style, borderRadius: 20, display: "flex", alignItems: "center", padding: "0 4px", justifyContent: "flex-end" };
      inner = <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#fff" }} />;
      break;
    case "tab":
      style = { ...style, borderTop: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-around", fontSize: 22, borderRadius: 0 };
      inner = <>{"🏠"}{"🔍"}{"➕"}{"❤️"}{"👤"}</>;
      break;
  }

  return (
    <div
      key={el.id} style={style} onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseDown={(e) => {
        e.preventDefault();
        const startX = e.clientX, startY = e.clientY;
        const move = (me: MouseEvent) => onDrag(me.clientX - startX, me.clientY - startY);
        const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
      }}
    >
      {inner}
      {selected && (
        <div style={{ position: "absolute", top: -20, left: 0, background: "#7c3aed", color: "#fff", fontSize: 11, padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>
          {el.type} · {Math.round(el.w)}×{Math.round(el.h)}
        </div>
      )}
    </div>
  );
}

export default function AppUIDesigner() {
  const [, navigate] = useLocation();
  const [device, setDevice] = useState(DEVICES[0]);
  const [screens, setScreens] = useState<Screen[]>([
    { id: "s1", name: "Home", elements: [] },
    { id: "s2", name: "Login", elements: [] },
    { id: "s3", name: "Profile", elements: [] },
  ]);
  const [activeScreen, setActiveScreen] = useState("s1");
  const [selected, setSelected] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(0.75);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [showPrototype, setShowPrototype] = useState(false);
  const [rightTab, setRightTab] = useState<"components" | "properties" | "layers" | "ai">("components");
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentScreen = screens.find(s => s.id === activeScreen)!;
  const selectedEl = currentScreen?.elements.find(e => e.id === selected);

  const addElement = useCallback((comp: typeof COMPONENT_LIBRARY[0]) => {
    const newEl: CanvasElement = {
      id: `el_${Date.now()}`, type: comp.type,
      x: Math.round(device.w / 2 - comp.defaultW / 2),
      y: Math.round(device.h / 2 - comp.defaultH / 2),
      w: comp.defaultW, h: comp.defaultH,
      text: comp.label, color: comp.color, bg: comp.bg, borderRadius: 10,
    };
    setScreens(prev => prev.map(s => s.id === activeScreen ? { ...s, elements: [...s.elements, newEl] } : s));
    setSelected(newEl.id);
  }, [activeScreen, device]);

  const updateSelected = useCallback((patch: Partial<CanvasElement>) => {
    if (!selected) return;
    setScreens(prev => prev.map(s => s.id === activeScreen
      ? { ...s, elements: s.elements.map(e => e.id === selected ? { ...e, ...patch } : e) }
      : s));
  }, [selected, activeScreen]);

  const dragElement = useCallback((id: string, dx: number, dy: number) => {
    setScreens(prev => {
      const el = prev.find(s => s.id === activeScreen)?.elements.find(e => e.id === id);
      if (!el) return prev;
      return prev.map(s => s.id === activeScreen
        ? { ...s, elements: s.elements.map(e => e.id === id ? { ...e, x: Math.round(el.x + dx / zoom), y: Math.round(el.y + dy / zoom) } : e) }
        : s);
    });
  }, [activeScreen, zoom]);

  const deleteSelected = useCallback(() => {
    if (!selected) return;
    setScreens(prev => prev.map(s => s.id === activeScreen ? { ...s, elements: s.elements.filter(e => e.id !== selected) } : s));
    setSelected(null);
  }, [selected, activeScreen]);

  const addScreen = () => {
    const id = `s${Date.now()}`;
    setScreens(prev => [...prev, { id, name: `Screen ${prev.length + 1}`, elements: [] }]);
    setActiveScreen(id);
  };

  const generateAI = () => {
    const templates: Record<string, CanvasElement[]> = {
      default: [
        { id: "g1", type: "navbar", x: 0, y: 0, w: device.w, h: 56, text: "App", color: "#111", bg: "#fff", borderRadius: 0 },
        { id: "g2", type: "image", x: 16, y: 72, w: device.w - 32, h: 200, color: "#666", bg: "#e5e7eb", borderRadius: 16 },
        { id: "g3", type: "text", x: 16, y: 288, w: 220, h: 32, text: "Welcome Back!", color: "#111827", bg: "transparent", fontSize: 22, borderRadius: 0 },
        { id: "g4", type: "card", x: 16, y: 336, w: device.w - 32, h: 100, text: "Featured Item", color: "#111", bg: "#fff", borderRadius: 16 },
        { id: "g5", type: "button", x: 16, y: 456, w: device.w - 32, h: 52, text: "Get Started", color: "#fff", bg: "#7c3aed", borderRadius: 14 },
        { id: "g6", type: "tab", x: 0, y: device.h - 72, w: device.w, h: 72, color: "#374151", bg: "#fff", borderRadius: 0 },
      ],
    };
    const generated = templates.default.map(e => ({ ...e, id: `ai_${Date.now()}_${e.id}` }));
    setScreens(prev => prev.map(s => s.id === activeScreen ? { ...s, elements: generated } : s));
    setShowAI(false);
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0f0f1a", color: "#e5e7eb", fontFamily: "'Inter', sans-serif" }}>
      {/* Top Bar */}
      <div style={{ height: 52, background: "#1a1a2e", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", padding: "0 16px", gap: 12, flexShrink: 0 }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#a78bfa", fontSize: 22, cursor: "pointer" }}>✦</button>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>App UI Designer</span>
        <div style={{ marginLeft: 8, display: "flex", gap: 4 }}>
          {DEVICES.map(d => (
            <button key={d.label} onClick={() => setDevice(d)}
              style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer", border: "1px solid",
                borderColor: device.label === d.label ? "#7c3aed" : "rgba(255,255,255,0.1)",
                background: device.label === d.label ? "rgba(124,58,237,0.2)" : "transparent",
                color: device.label === d.label ? "#a78bfa" : "#9ca3af" }}>
              {d.label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setShowGrid(g => !g)} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer", border: "1px solid rgba(255,255,255,0.12)", background: showGrid ? "rgba(124,58,237,0.2)" : "transparent", color: "#9ca3af" }}>Grid</button>
          <input type="range" min={40} max={150} value={zoom * 100} onChange={e => setZoom(Number(e.target.value) / 100)} style={{ width: 80 }} />
          <span style={{ fontSize: 12, color: "#6b7280", minWidth: 36 }}>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setShowPrototype(p => !p)} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", border: "1px solid #7c3aed", background: showPrototype ? "#7c3aed" : "transparent", color: showPrototype ? "#fff" : "#a78bfa", fontWeight: 600 }}>▶ Prototype</button>
          <button style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 600 }}>Export</button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left - Screens */}
        <div style={{ width: 160, background: "#13131f", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>Screens</span>
            <button onClick={addScreen} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", color: "#a78bfa", width: 22, height: 22, borderRadius: 4, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 8 }}>
            {screens.map(s => (
              <div key={s.id} onClick={() => { setActiveScreen(s.id); setSelected(null); }}
                style={{ marginBottom: 8, cursor: "pointer" }}>
                <div style={{ borderRadius: 8, border: `2px solid ${s.id === activeScreen ? "#7c3aed" : "rgba(255,255,255,0.08)"}`, background: s.id === activeScreen ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.03)", overflow: "hidden" }}>
                  <div style={{ width: "100%", paddingTop: "180%", position: "relative", background: "#fff" }}>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 11 }}>
                      {s.elements.length > 0 ? `${s.elements.length} layers` : "Empty"}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "center", fontSize: 11, marginTop: 4, color: s.id === activeScreen ? "#a78bfa" : "#6b7280" }}>{s.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, overflow: "auto", background: "#0d0d1a", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 40 }}
          onClick={() => setSelected(null)}>
          <div style={{
            width: device.w * zoom, height: device.h * zoom,
            background: "#fff", borderRadius: 36 * zoom, overflow: "hidden",
            boxShadow: "0 20px 80px rgba(0,0,0,0.8), 0 0 0 10px #1a1a2e, 0 0 0 11px rgba(255,255,255,0.05)",
            position: "relative", flexShrink: 0,
          }}>
            {/* Device frame */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 44 * zoom, background: "#fff", zIndex: 10, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 6, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
              <div style={{ width: 120 * zoom, height: 12 * zoom, background: "#1a1a1a", borderRadius: 20 }} />
            </div>
            {/* Canvas area */}
            <div ref={canvasRef} style={{ position: "absolute", top: 44 * zoom, left: 0, right: 0, bottom: 0, transform: `scale(${zoom})`, transformOrigin: "top left", width: device.w, height: device.h - 44, overflow: "hidden" }}>
              {showGrid && (
                <svg style={{ position: "absolute", inset: 0, opacity: 0.06, pointerEvents: "none" }} width={device.w} height={device.h}>
                  <defs>
                    <pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse">
                      <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#7c3aed" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              )}
              {currentScreen.elements.map(el =>
                renderElement(el, el.id === selected, () => setSelected(el.id),
                  (dx, dy) => dragElement(el.id, dx, dy))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ width: 280, background: "#13131f", borderLeft: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column" }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {(["components", "properties", "layers", "ai"] as const).map(tab => (
              <button key={tab} onClick={() => setRightTab(tab)}
                style={{ flex: 1, padding: "10px 0", fontSize: 11, cursor: "pointer", border: "none", background: "none",
                  color: rightTab === tab ? "#a78bfa" : "#6b7280", fontWeight: rightTab === tab ? 700 : 400, textTransform: "capitalize",
                  borderBottom: rightTab === tab ? "2px solid #7c3aed" : "2px solid transparent" }}>
                {tab === "components" ? "🧩" : tab === "properties" ? "⚙️" : tab === "layers" ? "🗂️" : "🤖"}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: "auto" }}>
            {rightTab === "components" && (
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Drag or click to add</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {COMPONENT_LIBRARY.map(comp => (
                    <button key={comp.type} onClick={() => addElement(comp)}
                      style={{ padding: "12px 8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "#7c3aed")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}>
                      <span style={{ fontSize: 20 }}>{comp.icon}</span>
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>{comp.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {rightTab === "properties" && selectedEl && (
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600 }}>{selectedEl.type.toUpperCase()}</div>
                {[
                  { label: "X", key: "x" as keyof CanvasElement }, { label: "Y", key: "y" as keyof CanvasElement },
                  { label: "W", key: "w" as keyof CanvasElement }, { label: "H", key: "h" as keyof CanvasElement },
                  { label: "Radius", key: "borderRadius" as keyof CanvasElement },
                  { label: "Font Size", key: "fontSize" as keyof CanvasElement },
                ].map(({ label, key }) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 64, fontSize: 12, color: "#6b7280", flexShrink: 0 }}>{label}</span>
                    <input type="number" value={(selectedEl[key] as number) ?? 0}
                      onChange={e => updateSelected({ [key]: Number(e.target.value) } as Partial<CanvasElement>)}
                      style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "4px 8px", color: "#e5e7eb", fontSize: 13 }} />
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 64, fontSize: 12, color: "#6b7280" }}>Text</span>
                  <input value={selectedEl.text ?? ""} onChange={e => updateSelected({ text: e.target.value })}
                    style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "4px 8px", color: "#e5e7eb", fontSize: 13 }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 64, fontSize: 12, color: "#6b7280" }}>Color</span>
                  <input type="color" value={selectedEl.color ?? "#000000"} onChange={e => updateSelected({ color: e.target.value })}
                    style={{ flex: 1, height: 32, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 64, fontSize: 12, color: "#6b7280" }}>Fill</span>
                  <input type="color" value={selectedEl.bg ?? "#ffffff"} onChange={e => updateSelected({ bg: e.target.value })}
                    style={{ flex: 1, height: 32, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
                </div>
                <button onClick={deleteSelected} style={{ marginTop: 8, padding: "8px 0", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#f87171", cursor: "pointer", fontSize: 13 }}>🗑 Delete Element</button>
              </div>
            )}

            {rightTab === "properties" && !selectedEl && (
              <div style={{ padding: 24, textAlign: "center", color: "#4b5563", fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👆</div>
                Select an element to edit properties
              </div>
            )}

            {rightTab === "layers" && (
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 10, fontWeight: 600, textTransform: "uppercase" }}>Layers ({currentScreen.elements.length})</div>
                {currentScreen.elements.length === 0 && (
                  <div style={{ textAlign: "center", color: "#4b5563", fontSize: 13, padding: 24 }}>No layers yet. Add components from the Components tab.</div>
                )}
                {[...currentScreen.elements].reverse().map((el, i) => (
                  <div key={el.id} onClick={() => setSelected(el.id)}
                    style={{ padding: "8px 10px", borderRadius: 6, marginBottom: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                      background: el.id === selected ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${el.id === selected ? "#7c3aed" : "rgba(255,255,255,0.06)"}` }}>
                    <span style={{ fontSize: 14 }}>{COMPONENT_LIBRARY.find(c => c.type === el.type)?.icon ?? "▪"}</span>
                    <span style={{ fontSize: 12, color: "#d1d5db", flex: 1 }}>{el.text || el.type}</span>
                    <span style={{ fontSize: 10, color: "#4b5563" }}>#{i + 1}</span>
                  </div>
                ))}
              </div>
            )}

            {rightTab === "ai" && (
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700, marginBottom: 10 }}>🤖 AI UI Generator</div>
                <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 12, lineHeight: 1.6 }}>Describe the screen you want and AI will generate the layout for you.</p>
                <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder='e.g. "Create a food delivery home screen"'
                  style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 12px", color: "#e5e7eb", fontSize: 13, marginBottom: 8, resize: "none" }} />
                <button onClick={generateAI} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                  ✨ Generate Layout
                </button>
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Quick Prompts</div>
                  {AI_PROMPTS.map(p => (
                    <button key={p} onClick={() => { setAiPrompt(p); }}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", color: "#9ca3af", cursor: "pointer", textAlign: "left", fontSize: 12, marginBottom: 4 }}>
                      → {p}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
                  <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, marginBottom: 6 }}>Export Code</div>
                  <button style={{ width: "100%", padding: "8px 0", borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "#d1d5db", cursor: "pointer", fontSize: 12, marginBottom: 4 }}>📱 Flutter Code</button>
                  <button style={{ width: "100%", padding: "8px 0", borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "#d1d5db", cursor: "pointer", fontSize: 12 }}>⚛️ React Native</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
