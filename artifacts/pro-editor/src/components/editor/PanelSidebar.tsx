import { useEditorStore } from "@/lib/editorStore";
import AdjustmentsPanel from "./panels/AdjustmentsPanel";
import FiltersPanel from "./panels/FiltersPanel";
import LayersPanel from "./panels/LayersPanel";
import TextPanel from "./panels/TextPanel";
import AIPanel from "./panels/AIPanel";
import CropPanel from "./panels/CropPanel";
import ColorGradingPanel from "./panels/ColorGradingPanel";

export default function PanelSidebar() {
  const { activePanel } = useEditorStore();

  const panels: Record<string, React.ReactNode> = {
    adjustments: <AdjustmentsPanel />,
    filters: <FiltersPanel />,
    layers: <LayersPanel />,
    "text-panel": <TextPanel />,
    ai: <AIPanel />,
    "crop-panel": <CropPanel />,
    color: <ColorGradingPanel />,
  };

  return (
    <div className="w-64 bg-[hsl(220_13%_12%)] border-l border-[hsl(215_20%_16%)] flex flex-col shrink-0 overflow-hidden">
      {panels[activePanel] || (
        <div className="flex items-center justify-center h-full text-gray-600 text-xs">
          Select a panel
        </div>
      )}
    </div>
  );
}
