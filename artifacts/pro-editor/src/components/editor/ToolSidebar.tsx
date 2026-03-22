import { useEditorStore, type ActiveTool } from "@/lib/editorStore";
import {
  MousePointer2, Crop, Brush, Eraser, Type, Square, Blend,
  Wand2, Magnet, Scissors, CircleDot, Zap, Pipette, Hand,
  PenTool, Lasso, Sparkles, Sun, Moon, Wind, Layers,
  Sliders, Palette, Scan, SlidersHorizontal, Filter,
  Move, Clock, Droplets, Stamp, Keyboard,
  User, Grid3X3, Smile
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const TOOLS: { id: ActiveTool; icon: React.ReactNode; label: string; shortcut?: string; group: string }[] = [
  { id: "select", icon: <MousePointer2 size={15} />, label: "Select", shortcut: "V", group: "select" },
  { id: "hand", icon: <Hand size={15} />, label: "Pan", shortcut: "H", group: "select" },
  { id: "lasso", icon: <Lasso size={15} />, label: "Lasso Select", shortcut: "L", group: "select" },
  { id: "magic-wand", icon: <Wand2 size={15} />, label: "Magic Wand", shortcut: "W", group: "select" },
  { id: "eyedropper", icon: <Pipette size={15} />, label: "Color Picker", shortcut: "I", group: "select" },
  { id: "crop", icon: <Crop size={15} />, label: "Crop", shortcut: "C", group: "transform" },
  { id: "ruler", icon: <Move size={15} />, label: "Straighten", shortcut: "R", group: "transform" },
  { id: "brush", icon: <Brush size={15} />, label: "Brush", shortcut: "B", group: "paint" },
  { id: "eraser", icon: <Eraser size={15} />, label: "Eraser", shortcut: "E", group: "paint" },
  { id: "clone", icon: <Magnet size={15} />, label: "Clone Stamp", shortcut: "S", group: "paint" },
  { id: "heal", icon: <Sparkles size={15} />, label: "Healing Brush", shortcut: "J", group: "paint" },
  { id: "dodge", icon: <Sun size={15} />, label: "Dodge", shortcut: "O", group: "paint" },
  { id: "burn", icon: <Moon size={15} />, label: "Burn", shortcut: "O", group: "paint" },
  { id: "smudge", icon: <Wind size={15} />, label: "Smudge", group: "paint" },
  { id: "blur-tool", icon: <CircleDot size={15} />, label: "Blur", group: "filter" },
  { id: "sharpen-tool", icon: <Zap size={15} />, label: "Sharpen", group: "filter" },
  { id: "liquify", icon: <Droplets size={15} />, label: "Liquify", group: "filter" },
  { id: "text", icon: <Type size={15} />, label: "Text", shortcut: "T", group: "shape" },
  { id: "shape", icon: <Square size={15} />, label: "Shape", shortcut: "U", group: "shape" },
  { id: "gradient", icon: <Blend size={15} />, label: "Gradient", shortcut: "G", group: "shape" },
  { id: "pen", icon: <PenTool size={15} />, label: "Pen", shortcut: "P", group: "shape" },
];

const PANELS = [
  { id: "adjustments", icon: <Sliders size={14} />, label: "Adjust" },
  { id: "filters", icon: <Filter size={14} />, label: "Filters" },
  { id: "color", icon: <Palette size={14} />, label: "Color" },
  { id: "detail", icon: <SlidersHorizontal size={14} />, label: "Detail" },
  { id: "selective", icon: <Pipette size={14} />, label: "Select" },
  { id: "gradient-panel", icon: <Blend size={14} />, label: "Grad" },
  { id: "layers", icon: <Layers size={14} />, label: "Layers" },
  { id: "text-panel", icon: <Type size={14} />, label: "Text" },
  { id: "crop-panel", icon: <Crop size={14} />, label: "Crop" },
  { id: "brush-panel", icon: <Brush size={14} />, label: "Brush" },
  { id: "watermark", icon: <Stamp size={14} />, label: "Mark" },
  { id: "history", icon: <Clock size={14} />, label: "History" },
  { id: "ai", icon: <Scan size={14} />, label: "AI" },
  { id: "portrait", icon: <User size={14} />, label: "Portrait" },
  { id: "collage", icon: <Grid3X3 size={14} />, label: "Collage" },
  { id: "stickers", icon: <Smile size={14} />, label: "Stickers" },
];

const GROUP_LABELS: Record<string, string> = {
  select: "Selection",
  transform: "Transform",
  paint: "Retouching",
  filter: "Effects",
  shape: "Drawing",
};

function ToolBtn({ tool, activeTool, onSelect }: { tool: typeof TOOLS[0]; activeTool: string; onSelect: () => void }) {
  return (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onSelect}
            className={`tool-btn w-9 ${activeTool === tool.id ? "active" : ""}`}
          >
            {tool.icon}
            <span className="leading-none">{tool.label.split(" ")[0]}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          <div className="font-semibold">{tool.label}</div>
          {tool.shortcut && <div className="text-gray-400">Key: {tool.shortcut}</div>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function ToolSidebar() {
  const { activeTool, setActiveTool, activePanel, setActivePanel, brushColor, brushSize, toggleKeyboardShortcuts } = useEditorStore();

  const groups = Array.from(new Set(TOOLS.map((t) => t.group)));

  return (
    <div className="w-[52px] bg-[hsl(222_18%_7%)] border-r border-[hsl(220_15%_13%)] flex flex-col items-center py-2 gap-0.5 shrink-0 overflow-y-auto overflow-x-hidden">
      {/* Tools by group */}
      {groups.map((group, gi) => (
        <div key={group} className="flex flex-col items-center gap-0.5 w-full px-1.5">
          {gi > 0 && <div className="w-7 h-px bg-[hsl(220_15%_15%)] my-1" />}
          <div className="text-[7px] text-gray-700 font-bold uppercase tracking-widest mb-0.5 px-1 w-full text-center">
            {GROUP_LABELS[group]}
          </div>
          {TOOLS.filter((t) => t.group === group).map((t) => (
            <ToolBtn key={t.id} tool={t} activeTool={activeTool} onSelect={() => setActiveTool(t.id)} />
          ))}
        </div>
      ))}

      <div className="flex-1" />

      {/* Brush color preview */}
      {(activeTool === "brush" || activeTool === "eraser" || activeTool === "dodge" || activeTool === "burn") && (
        <div className="mb-1 w-full px-1.5">
          <div className="w-full h-px bg-[hsl(220_15%_15%)] my-1" />
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-7 h-7 rounded-full border-2 border-[hsl(220_15%_25%)] shadow-inner cursor-pointer hover:scale-110 transition-all"
              style={{ background: brushColor }}
              onClick={() => setActivePanel("brush-panel")}
              title={`Brush: ${brushColor} · ${brushSize}px`}
            />
            <div className="text-[8px] text-gray-600 font-mono">{brushSize}px</div>
          </div>
        </div>
      )}

      {/* Panels */}
      <div className="w-full px-1.5 pb-1">
        <div className="w-7 h-px bg-[hsl(220_15%_15%)] my-1.5 mx-auto" />
        <div className="text-[7px] text-gray-700 font-bold uppercase tracking-widest mb-0.5 text-center w-full">Panels</div>
        {PANELS.map((p) => (
          <TooltipProvider key={p.id} delayDuration={400}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActivePanel(p.id)}
                  className={`tool-btn w-9 mx-auto ${activePanel === p.id ? "active" : ""}`}
                >
                  {p.icon}
                  <span>{p.label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {p.label} Panel
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}

        {/* Keyboard shortcuts button */}
        <div className="w-full h-px bg-[hsl(220_15%_15%)] my-1.5" />
        <TooltipProvider delayDuration={400}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleKeyboardShortcuts}
                className="tool-btn w-9 mx-auto text-gray-600 hover:text-violet-400"
              >
                <Keyboard size={14} />
                <span>Keys</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              Keyboard Shortcuts (?)
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
