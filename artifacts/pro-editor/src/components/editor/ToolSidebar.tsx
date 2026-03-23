import { useEditorStore, type ActiveTool } from "@/lib/editorStore";
import {
  MousePointer2, Crop, Brush, Eraser, Type, Square, Blend,
  Wand2, Magnet, CircleDot, Zap, Pipette, Hand,
  PenTool, Lasso, Sparkles, Sun, Moon, Wind, Layers,
  Sliders, Palette, Scan, SlidersHorizontal, Filter,
  Move, Clock, Droplets, Stamp, Keyboard,
  User, Grid3X3, Smile, Film, Scissors, Star, Package, Box,
  BookOpen, RadioTower, Navigation, Move3d, Download, Layers2,
  TrendingUp, BarChart2, ZoomIn, Grid, Activity, Camera
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const TOOLS: { id: ActiveTool; icon: React.ReactNode; label: string; shortcut?: string; group: string }[] = [
  { id: "select", icon: <MousePointer2 size={15} />, label: "Select", shortcut: "V", group: "select" },
  { id: "hand", icon: <Hand size={15} />, label: "Pan", shortcut: "H", group: "select" },
  { id: "lasso", icon: <Lasso size={15} />, label: "Lasso", shortcut: "L", group: "select" },
  { id: "magic-wand", icon: <Wand2 size={15} />, label: "Wand", shortcut: "W", group: "select" },
  { id: "eyedropper", icon: <Pipette size={15} />, label: "Picker", shortcut: "I", group: "select" },
  { id: "crop", icon: <Crop size={15} />, label: "Crop", shortcut: "C", group: "transform" },
  { id: "ruler", icon: <Move size={15} />, label: "Straight", shortcut: "R", group: "transform" },
  { id: "brush", icon: <Brush size={15} />, label: "Brush", shortcut: "B", group: "paint" },
  { id: "eraser", icon: <Eraser size={15} />, label: "Erase", shortcut: "E", group: "paint" },
  { id: "clone", icon: <Magnet size={15} />, label: "Clone", shortcut: "S", group: "paint" },
  { id: "heal", icon: <Sparkles size={15} />, label: "Heal", shortcut: "J", group: "paint" },
  { id: "dodge", icon: <Sun size={15} />, label: "Dodge", shortcut: "O", group: "paint" },
  { id: "burn", icon: <Moon size={15} />, label: "Burn", group: "paint" },
  { id: "smudge", icon: <Wind size={15} />, label: "Smudge", group: "paint" },
  { id: "blur-tool", icon: <CircleDot size={15} />, label: "Blur", group: "filter" },
  { id: "sharpen-tool", icon: <Zap size={15} />, label: "Sharpen", group: "filter" },
  { id: "liquify", icon: <Droplets size={15} />, label: "Liquify", group: "filter" },
  { id: "text", icon: <Type size={15} />, label: "Text", shortcut: "T", group: "draw" },
  { id: "shape", icon: <Square size={15} />, label: "Shape", shortcut: "U", group: "draw" },
  { id: "gradient", icon: <Blend size={15} />, label: "Gradient", shortcut: "G", group: "draw" },
  { id: "pen", icon: <PenTool size={15} />, label: "Pen", shortcut: "P", group: "draw" },
];

const PANELS = [
  { id: "adjustments", icon: <Sliders size={13} />, label: "Adjust", group: "Core" },
  { id: "filters", icon: <Filter size={13} />, label: "Filters", group: "Core" },
  { id: "color", icon: <Palette size={13} />, label: "Color", group: "Core" },
  { id: "detail", icon: <SlidersHorizontal size={13} />, label: "Detail", group: "Core" },
  { id: "selective", icon: <Pipette size={13} />, label: "Selective", group: "Core" },
  { id: "effects", icon: <Zap size={13} />, label: "Effects", group: "Creative" },
  { id: "tone-mapping", icon: <Sun size={13} />, label: "Tone", group: "Creative" },
  { id: "palette", icon: <Star size={13} />, label: "Palette", group: "Creative" },
  { id: "gradient-panel", icon: <Blend size={13} />, label: "Gradient", group: "Creative" },
  { id: "masking", icon: <Scissors size={13} />, label: "Masking", group: "Creative" },
  { id: "layers", icon: <Layers size={13} />, label: "Layers", group: "Layers" },
  { id: "text-panel", icon: <Type size={13} />, label: "Text", group: "Layers" },
  { id: "stickers", icon: <Smile size={13} />, label: "Stickers", group: "Layers" },
  { id: "watermark", icon: <Stamp size={13} />, label: "Watermark", group: "Layers" },
  { id: "crop-panel", icon: <Crop size={13} />, label: "Crop", group: "Tools" },
  { id: "brush-panel", icon: <Brush size={13} />, label: "Brush", group: "Tools" },
  { id: "ai", icon: <Scan size={13} />, label: "AI Tools", group: "AI" },
  { id: "portrait", icon: <User size={13} />, label: "Portrait", group: "AI" },
  { id: "collage", icon: <Grid3X3 size={13} />, label: "Collage", group: "AI" },
  { id: "batch", icon: <Package size={13} />, label: "Batch", group: "AI" },
  { id: "local-adj", icon: <RadioTower size={13} />, label: "Local", group: "AI" },
  { id: "presets", icon: <BookOpen size={13} />, label: "Presets", group: "History" },
  { id: "history", icon: <Clock size={13} />, label: "History", group: "History" },
  { id: "navigator", icon: <Navigation size={13} />, label: "Navigator", group: "View" },
  { id: "perspective", icon: <Move3d size={13} />, label: "Lens", group: "View" },
  { id: "export", icon: <Download size={13} />, label: "Export", group: "View" },
  { id: "waveform", icon: <BarChart2 size={13} />, label: "Waveform", group: "View" },
  { id: "noise-reduction", icon: <Layers2 size={13} />, label: "Noise", group: "Pixel" },
  { id: "smart-sharpen", icon: <ZoomIn size={13} />, label: "Sharpen", group: "Pixel" },
  { id: "motion-blur", icon: <Wind size={13} />, label: "Motion", group: "Pixel" },
  { id: "content-aware", icon: <Wand2 size={13} />, label: "Fill", group: "Pixel" },
  { id: "frequency-separation", icon: <Activity size={13} />, label: "FreqSep", group: "Pixel" },
  { id: "curve-editor", icon: <TrendingUp size={13} />, label: "Curves", group: "Art" },
  { id: "color-harmony", icon: <Palette size={13} />, label: "Harmony", group: "Art" },
  { id: "glitch-art", icon: <Zap size={13} />, label: "Glitch", group: "Art" },
  { id: "double-exposure", icon: <Layers2 size={13} />, label: "DblExp", group: "Art" },
  { id: "pixelate", icon: <Grid size={13} />, label: "Pixelate", group: "Art" },
  { id: "lut", icon: <Film size={13} />, label: "LUT", group: "Art" },
  { id: "liquify-panel", icon: <Droplets size={13} />, label: "Liquify", group: "Pixel" },
  { id: "raw-controls", icon: <Camera size={13} />, label: "RAW", group: "Pixel" },
];

const TOOL_GROUP_META: Record<string, { label: string; color: string }> = {
  select:    { label: "Select", color: "#6366f1" },
  transform: { label: "Transform", color: "#f59e0b" },
  paint:     { label: "Paint", color: "#10b981" },
  filter:    { label: "Filter", color: "#06b6d4" },
  draw:      { label: "Draw", color: "#ec4899" },
};

const PANEL_GROUP_META: Record<string, { color: string }> = {
  Core:      { color: "#8b5cf6" },
  Creative:  { color: "#ec4899" },
  Layers:    { color: "#06b6d4" },
  Tools:     { color: "#f59e0b" },
  AI:        { color: "#10b981" },
  History:   { color: "#6366f1" },
  View:      { color: "#64748b" },
  Pixel:     { color: "#8b5cf6" },
  Art:       { color: "#a855f7" },
};

function ToolBtn({ id, icon, label, shortcut, isActive, onClick }: {
  id: string; icon: React.ReactNode; label: string; shortcut?: string;
  isActive: boolean; onClick: () => void;
}) {
  return (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            style={{
              width: "44px", height: "44px", borderRadius: "10px",
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: "3px",
              background: isActive
                ? "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(109,40,217,0.15))"
                : "transparent",
              border: isActive
                ? "1px solid rgba(139,92,246,0.45)"
                : "1px solid transparent",
              color: isActive ? "#c4b5fd" : "rgba(255,255,255,0.38)",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: isActive ? "0 0 14px rgba(139,92,246,0.25), inset 0 1px 0 rgba(255,255,255,0.05)" : "none",
              position: "relative", overflow: "hidden",
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                e.currentTarget.style.borderColor = "rgba(139,92,246,0.2)";
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.38)";
                e.currentTarget.style.borderColor = "transparent";
              }
            }}
          >
            {isActive && (
              <div style={{
                position: "absolute", left: 0, top: "20%", bottom: "20%",
                width: "2px", borderRadius: "0 2px 2px 0",
                background: "linear-gradient(180deg, #a78bfa, #7c3aed)",
                boxShadow: "0 0 6px #8b5cf6",
              }} />
            )}
            {icon}
            <span style={{
              fontSize: "7px", fontWeight: 700, letterSpacing: "0.4px",
              textTransform: "uppercase", lineHeight: 1,
              color: isActive ? "#c4b5fd" : "rgba(255,255,255,0.25)",
            }}>{label}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" style={{
          fontSize: "12px", fontWeight: 600,
          background: "#0d0b22", border: "1px solid rgba(139,92,246,0.3)",
          color: "#e2e8f0", boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
        }}>
          <div>{label}</div>
          {shortcut && <div style={{ color: "rgba(167,139,250,0.7)", fontSize: "10px", marginTop: "2px" }}>⌨ {shortcut}</div>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function PanelBtn({ id, icon, label, isActive, color, onClick }: {
  id: string; icon: React.ReactNode; label: string;
  isActive: boolean; color: string; onClick: () => void;
}) {
  return (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            style={{
              width: "44px", height: "40px", borderRadius: "9px",
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: "3px",
              background: isActive
                ? `linear-gradient(135deg, ${color}22, ${color}10)`
                : "transparent",
              border: isActive ? `1px solid ${color}44` : "1px solid transparent",
              color: isActive ? color : "rgba(255,255,255,0.3)",
              cursor: "pointer", transition: "all 0.15s ease",
              boxShadow: isActive ? `0 0 12px ${color}20` : "none",
              position: "relative",
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.background = `${color}12`;
                e.currentTarget.style.color = `${color}cc`;
                e.currentTarget.style.borderColor = `${color}22`;
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.3)";
                e.currentTarget.style.borderColor = "transparent";
              }
            }}
          >
            {isActive && (
              <div style={{
                position: "absolute", left: 0, top: "25%", bottom: "25%",
                width: "2px", borderRadius: "0 2px 2px 0",
                background: color,
                boxShadow: `0 0 6px ${color}`,
              }} />
            )}
            {icon}
            <span style={{
              fontSize: "6.5px", fontWeight: 700, letterSpacing: "0.3px",
              textTransform: "uppercase", lineHeight: 1,
              color: isActive ? color : "rgba(255,255,255,0.22)",
            }}>{label.slice(0, 7)}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" style={{
          fontSize: "12px", fontWeight: 600,
          background: "#0d0b22", border: `1px solid ${color}44`,
          color: "#e2e8f0",
        }}>
          {label} Panel
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function ToolSidebar() {
  const { activeTool, setActiveTool, activePanel, setActivePanel, brushColor, brushSize, toggleKeyboardShortcuts } = useEditorStore();

  const toolGroups = Array.from(new Set(TOOLS.map(t => t.group)));
  const panelGroups = Array.from(new Set(PANELS.map(p => p.group)));

  return (
    <div style={{
      width: "56px",
      background: "linear-gradient(180deg, #03000a 0%, #020008 100%)",
      borderRight: "1px solid rgba(139,92,246,0.08)",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "8px 6px",
      flexShrink: 0, overflowY: "auto", overflowX: "hidden",
      gap: "2px",
      scrollbarWidth: "none",
    }}>

      {/* Tools section */}
      {toolGroups.map((group, gi) => {
        const meta = TOOL_GROUP_META[group];
        return (
          <div key={group} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            {gi > 0 && (
              <div style={{
                width: "32px", height: "1px", margin: "5px 0",
                background: `linear-gradient(to right, transparent, ${meta?.color || "rgba(139,92,246,0.2)"}, transparent)`,
              }} />
            )}
            <div style={{
              fontSize: "5.5px", fontWeight: 800, textTransform: "uppercase",
              letterSpacing: "1.5px", color: meta?.color || "rgba(255,255,255,0.15)",
              width: "100%", textAlign: "center", marginBottom: "2px", opacity: 0.7,
            }}>{meta?.label || group}</div>
            {TOOLS.filter(t => t.group === group).map(t => (
              <ToolBtn
                key={t.id}
                id={t.id}
                icon={t.icon}
                label={t.label}
                shortcut={t.shortcut}
                isActive={activeTool === t.id}
                onClick={() => setActiveTool(t.id)}
              />
            ))}
          </div>
        );
      })}

      {/* Brush color */}
      {["brush", "eraser", "dodge", "burn"].includes(activeTool) && (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "4px 0" }}>
          <div style={{ width: "32px", height: "1px", background: "rgba(139,92,246,0.2)" }} />
          <button
            onClick={() => setActivePanel("brush-panel")}
            title={`Brush: ${brushColor} · ${brushSize}px`}
            style={{
              width: "30px", height: "30px", borderRadius: "50%",
              background: brushColor,
              border: "2px solid rgba(139,92,246,0.5)",
              cursor: "pointer",
              boxShadow: `0 0 14px ${brushColor}80, 0 0 4px rgba(0,0,0,0.5)`,
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
          />
          <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>{brushSize}px</span>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Divider */}
      <div style={{
        width: "36px", height: "1px", margin: "6px 0",
        background: "linear-gradient(to right, transparent, rgba(139,92,246,0.3), transparent)",
      }} />

      {/* Panels section */}
      {panelGroups.map((group, gi) => {
        const meta = PANEL_GROUP_META[group] || { color: "#8b5cf6" };
        return (
          <div key={group} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "1px" }}>
            {gi > 0 && (
              <div style={{
                width: "28px", height: "1px", margin: "3px 0",
                background: `linear-gradient(to right, transparent, ${meta.color}44, transparent)`,
              }} />
            )}
            <div style={{
              fontSize: "5px", fontWeight: 800, textTransform: "uppercase",
              letterSpacing: "1px", color: meta.color,
              width: "100%", textAlign: "center", marginBottom: "1px", opacity: 0.5,
            }}>{group}</div>
            {PANELS.filter(p => p.group === group).map(p => (
              <PanelBtn
                key={p.id}
                id={p.id}
                icon={p.icon}
                label={p.label}
                isActive={activePanel === p.id}
                color={meta.color}
                onClick={() => setActivePanel(p.id)}
              />
            ))}
          </div>
        );
      })}

      {/* Keyboard shortcut btn */}
      <div style={{ width: "32px", height: "1px", margin: "4px 0", background: "rgba(255,255,255,0.04)" }} />
      <TooltipProvider delayDuration={400}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleKeyboardShortcuts}
              style={{
                width: "44px", height: "36px", borderRadius: "9px",
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: "3px",
                background: "transparent", border: "1px solid transparent",
                color: "rgba(255,255,255,0.15)", cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "#a78bfa";
                e.currentTarget.style.background = "rgba(139,92,246,0.06)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "rgba(255,255,255,0.15)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Keyboard size={12} />
              <span style={{ fontSize: "6px", fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>Keys</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" style={{ fontSize: "12px", background: "#0d0b22", border: "1px solid rgba(139,92,246,0.3)" }}>
            Keyboard Shortcuts (?)
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
