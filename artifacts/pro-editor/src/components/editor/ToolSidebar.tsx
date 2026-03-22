import { useEditorStore, type ActiveTool } from "@/lib/editorStore";
import {
  MousePointer2, Crop, Brush, Eraser, Type, Square, Wand2,
  Pipette, Layers, Sparkles, Sliders, Palette, Scan, Blend,
  Zap, CircleDot, PenTool, Magnet, Scissors
} from "lucide-react";

const TOOLS: { id: ActiveTool; icon: React.ReactNode; label: string }[] = [
  { id: "select", icon: <MousePointer2 size={17} />, label: "Select" },
  { id: "crop", icon: <Crop size={17} />, label: "Crop" },
  { id: "brush", icon: <Brush size={17} />, label: "Brush" },
  { id: "eraser", icon: <Eraser size={17} />, label: "Eraser" },
  { id: "heal", icon: <Wand2 size={17} />, label: "Heal" },
  { id: "clone", icon: <Magnet size={17} />, label: "Clone" },
  { id: "text", icon: <Type size={17} />, label: "Text" },
  { id: "shape", icon: <Square size={17} />, label: "Shape" },
  { id: "gradient", icon: <Blend size={17} />, label: "Gradient" },
  { id: "blur-tool", icon: <CircleDot size={17} />, label: "Blur" },
  { id: "sharpen-tool", icon: <Zap size={17} />, label: "Sharpen" },
];

const PANELS = [
  { id: "adjustments", icon: <Sliders size={17} />, label: "Adjust" },
  { id: "filters", icon: <Sparkles size={17} />, label: "Filters" },
  { id: "color", icon: <Palette size={17} />, label: "Color" },
  { id: "crop-panel", icon: <Crop size={17} />, label: "Crop" },
  { id: "layers", icon: <Layers size={17} />, label: "Layers" },
  { id: "text-panel", icon: <Type size={17} />, label: "Text" },
  { id: "ai", icon: <Scan size={17} />, label: "AI Tools" },
];

export default function ToolSidebar() {
  const { activeTool, setActiveTool, activePanel, setActivePanel } = useEditorStore();

  return (
    <div className="w-14 bg-[#0d0d1a] border-r border-[hsl(215_20%_16%)] flex flex-col items-center py-2 gap-1 shrink-0 overflow-y-auto">
      {/* Tools */}
      <div className="text-[9px] text-gray-600 font-medium mb-1 tracking-widest uppercase">Tools</div>
      {TOOLS.map((t) => (
        <button
          key={t.id}
          onClick={() => setActiveTool(t.id)}
          title={t.label}
          className={`tool-btn w-10 ${activeTool === t.id ? "active" : ""}`}
        >
          {t.icon}
          <span>{t.label}</span>
        </button>
      ))}

      <div className="w-8 h-px bg-[hsl(215_20%_16%)] my-2" />

      {/* Panels */}
      <div className="text-[9px] text-gray-600 font-medium mb-1 tracking-widest uppercase">Panels</div>
      {PANELS.map((p) => (
        <button
          key={p.id}
          onClick={() => setActivePanel(p.id)}
          title={p.label}
          className={`tool-btn w-10 ${activePanel === p.id ? "active" : ""}`}
        >
          {p.icon}
          <span>{p.label}</span>
        </button>
      ))}
    </div>
  );
}
