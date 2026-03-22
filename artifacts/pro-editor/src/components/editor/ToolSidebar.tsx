import { useEditorStore, type ActiveTool } from "@/lib/editorStore";
import {
  MousePointer2, Crop, Brush, Eraser, Type, Square, Blend,
  Wand2, Magnet, CircleDot, Zap, Pipette, Hand,
  PenTool, Lasso, Sparkles, Sun, Moon, Wind, Layers,
  Sliders, Palette, Scan, SlidersHorizontal, Filter,
  Move, Clock, Droplets, Stamp, Keyboard,
  User, Grid3X3, Smile, Film, Scissors, Star, Package, Box,
  BookOpen, RadioTower, Navigation, Move3d, Download, Layers2,
  TrendingUp, BarChart2, ZoomIn, Grid, Layers as LayersIcon,
  Activity, Camera
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const TOOLS: { id: ActiveTool; icon: React.ReactNode; label: string; shortcut?: string; group: string }[] = [
  { id: "select", icon: <MousePointer2 size={14} />, label: "Select", shortcut: "V", group: "select" },
  { id: "hand", icon: <Hand size={14} />, label: "Pan", shortcut: "H", group: "select" },
  { id: "lasso", icon: <Lasso size={14} />, label: "Lasso", shortcut: "L", group: "select" },
  { id: "magic-wand", icon: <Wand2 size={14} />, label: "Wand", shortcut: "W", group: "select" },
  { id: "eyedropper", icon: <Pipette size={14} />, label: "Picker", shortcut: "I", group: "select" },
  { id: "crop", icon: <Crop size={14} />, label: "Crop", shortcut: "C", group: "transform" },
  { id: "ruler", icon: <Move size={14} />, label: "Straight", shortcut: "R", group: "transform" },
  { id: "brush", icon: <Brush size={14} />, label: "Brush", shortcut: "B", group: "paint" },
  { id: "eraser", icon: <Eraser size={14} />, label: "Eraser", shortcut: "E", group: "paint" },
  { id: "clone", icon: <Magnet size={14} />, label: "Clone", shortcut: "S", group: "paint" },
  { id: "heal", icon: <Sparkles size={14} />, label: "Heal", shortcut: "J", group: "paint" },
  { id: "dodge", icon: <Sun size={14} />, label: "Dodge", shortcut: "O", group: "paint" },
  { id: "burn", icon: <Moon size={14} />, label: "Burn", shortcut: "O", group: "paint" },
  { id: "smudge", icon: <Wind size={14} />, label: "Smudge", group: "paint" },
  { id: "blur-tool", icon: <CircleDot size={14} />, label: "Blur", group: "filter" },
  { id: "sharpen-tool", icon: <Zap size={14} />, label: "Sharpen", group: "filter" },
  { id: "liquify", icon: <Droplets size={14} />, label: "Liquify", group: "filter" },
  { id: "text", icon: <Type size={14} />, label: "Text", shortcut: "T", group: "shape" },
  { id: "shape", icon: <Square size={14} />, label: "Shape", shortcut: "U", group: "shape" },
  { id: "gradient", icon: <Blend size={14} />, label: "Gradient", shortcut: "G", group: "shape" },
  { id: "pen", icon: <PenTool size={14} />, label: "Pen", shortcut: "P", group: "shape" },
];

const PANELS = [
  // Core
  { id: "adjustments", icon: <Sliders size={13} />, label: "Adjust", group: "Core" },
  { id: "filters", icon: <Filter size={13} />, label: "Filters", group: "Core" },
  { id: "color", icon: <Palette size={13} />, label: "Color", group: "Core" },
  { id: "detail", icon: <SlidersHorizontal size={13} />, label: "Detail", group: "Core" },
  { id: "selective", icon: <Pipette size={13} />, label: "Select", group: "Core" },
  // Creative
  { id: "effects", icon: <Zap size={13} />, label: "Effects", group: "Creative" },
  { id: "tone-mapping", icon: <Sun size={13} />, label: "Tone", group: "Creative" },
  { id: "palette", icon: <Star size={13} />, label: "Palette", group: "Creative" },
  { id: "gradient-panel", icon: <Blend size={13} />, label: "Grad", group: "Creative" },
  { id: "masking", icon: <Scissors size={13} />, label: "Mask", group: "Creative" },
  // Layers & Text
  { id: "layers", icon: <Layers size={13} />, label: "Layers", group: "Layers" },
  { id: "text-panel", icon: <Type size={13} />, label: "Text", group: "Layers" },
  { id: "stickers", icon: <Smile size={13} />, label: "Sticker", group: "Layers" },
  { id: "watermark", icon: <Stamp size={13} />, label: "Mark", group: "Layers" },
  // Tools
  { id: "crop-panel", icon: <Crop size={13} />, label: "Crop", group: "Tools" },
  { id: "brush-panel", icon: <Brush size={13} />, label: "Brush", group: "Tools" },
  // AI & Advanced
  { id: "ai", icon: <Scan size={13} />, label: "AI", group: "AI" },
  { id: "portrait", icon: <User size={13} />, label: "Portrait", group: "AI" },
  { id: "collage", icon: <Grid3X3 size={13} />, label: "Collage", group: "AI" },
  { id: "batch", icon: <Package size={13} />, label: "Batch", group: "AI" },
  { id: "local-adj", icon: <RadioTower size={13} />, label: "Local", group: "AI" },
  // Presets & History
  { id: "presets", icon: <BookOpen size={13} />, label: "Presets", group: "History" },
  { id: "history", icon: <Clock size={13} />, label: "History", group: "History" },
  // View & Navigation
  { id: "navigator", icon: <Navigation size={13} />, label: "Nav", group: "View" },
  { id: "perspective", icon: <Move3d size={13} />, label: "Lens", group: "View" },
  { id: "export", icon: <Download size={13} />, label: "Export", group: "View" },
  { id: "waveform", icon: <BarChart2 size={13} />, label: "Wave", group: "View" },
  // Pixel Tools
  { id: "noise-reduction", icon: <Layers2 size={13} />, label: "Noise", group: "Pixel" },
  { id: "smart-sharpen", icon: <ZoomIn size={13} />, label: "Sharp", group: "Pixel" },
  { id: "motion-blur", icon: <Wind size={13} />, label: "Motion", group: "Pixel" },
  { id: "content-aware", icon: <Wand2 size={13} />, label: "Fill", group: "Pixel" },
  { id: "frequency-separation", icon: <Activity size={13} />, label: "FreqSep", group: "Pixel" },
  // Art & Creative
  { id: "curve-editor", icon: <TrendingUp size={13} />, label: "Curves", group: "Art" },
  { id: "color-harmony", icon: <Palette size={13} />, label: "Harmony", group: "Art" },
  { id: "glitch-art", icon: <Zap size={13} />, label: "Glitch", group: "Art" },
  { id: "double-exposure", icon: <Layers2 size={13} />, label: "DblExp", group: "Art" },
  { id: "pixelate", icon: <Grid size={13} />, label: "Pixel", group: "Art" },
  { id: "lut", icon: <Film size={13} />, label: "LUT", group: "Art" },
  { id: "liquify-panel", icon: <Droplets size={13} />, label: "Liquify", group: "Pixel" },
  { id: "raw-controls", icon: <Camera size={13} />, label: "RAW", group: "Pixel" },
];

const GROUP_LABELS: Record<string, string> = {
  select: "Select",
  transform: "Transform",
  paint: "Paint",
  filter: "Filters",
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
            <span className="leading-none">{tool.label}</span>
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
  const panelGroups = Array.from(new Set(PANELS.map((p) => p.group)));

  return (
    <div className="w-[52px] bg-[hsl(222_18%_7%)] border-r border-[hsl(220_15%_13%)] flex flex-col items-center py-2 gap-0.5 shrink-0 overflow-y-auto overflow-x-hidden scrollbar-hide">
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

      {/* Brush color preview */}
      {["brush", "eraser", "dodge", "burn"].includes(activeTool) && (
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

      <div className="flex-1" />

      {/* Panels grouped */}
      <div className="w-full px-1.5 pb-1">
        <div className="w-7 h-px bg-[hsl(220_15%_15%)] my-1.5 mx-auto" />
        {panelGroups.map((group, gi) => (
          <div key={group} className="flex flex-col items-center gap-0.5 w-full mb-1">
            {gi > 0 && <div className="w-6 h-px bg-[hsl(220_15%_13%)] my-0.5" />}
            <div className="text-[6px] text-gray-800 font-bold uppercase tracking-widest w-full text-center mb-0.5">{group}</div>
            {PANELS.filter((p) => p.group === group).map((p) => (
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
                  <TooltipContent side="right" className="text-xs">{p.label} Panel</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        ))}

        {/* Keyboard shortcuts */}
        <div className="w-full h-px bg-[hsl(220_15%_14%)] my-1.5" />
        <TooltipProvider delayDuration={400}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleKeyboardShortcuts}
                className="tool-btn w-9 mx-auto text-gray-600 hover:text-violet-400"
              >
                <Keyboard size={13} />
                <span>Keys</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">Keyboard Shortcuts (?)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
