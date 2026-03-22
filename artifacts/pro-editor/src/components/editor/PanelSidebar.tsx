import { useEditorStore } from "@/lib/editorStore";
import AdjustmentsPanel from "./panels/AdjustmentsPanel";
import FiltersPanel from "./panels/FiltersPanel";
import LayersPanel from "./panels/LayersPanel";
import TextPanel from "./panels/TextPanel";
import AIPanel from "./panels/AIPanel";
import CropPanel from "./panels/CropPanel";
import ColorGradingPanel from "./panels/ColorGradingPanel";
import DetailPanel from "./panels/DetailPanel";
import HistoryPanel from "./panels/HistoryPanel";
import BrushPanel from "./panels/BrushPanel";
import GradientPanel from "./panels/GradientPanel";
import WatermarkPanel from "./panels/WatermarkPanel";
import SelectiveColorPanel from "./panels/SelectiveColorPanel";
import PortraitPanel from "./panels/PortraitPanel";
import CollagePanel from "./panels/CollagePanel";
import StickerPanel from "./panels/StickerPanel";
import { SlidersHorizontal } from "lucide-react";

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
    detail: <DetailPanel />,
    history: <HistoryPanel />,
    "brush-panel": <BrushPanel />,
    "gradient-panel": <GradientPanel />,
    watermark: <WatermarkPanel />,
    selective: <SelectiveColorPanel />,
    portrait: <PortraitPanel />,
    collage: <CollagePanel />,
    stickers: <StickerPanel />,
  };

  return (
    <div className="w-64 bg-[hsl(222_18%_10%)] border-l border-[hsl(220_15%_14%)] flex flex-col shrink-0 overflow-hidden">
      {panels[activePanel] || (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-700">
          <div className="w-12 h-12 rounded-2xl bg-[hsl(220_15%_14%)] flex items-center justify-center">
            <SlidersHorizontal size={20} className="text-gray-600" />
          </div>
          <div className="text-center">
            <div className="text-xs font-semibold text-gray-500 mb-1">No panel selected</div>
            <div className="text-[10px] text-gray-700 max-w-[160px] text-center leading-relaxed">
              Choose a tool or panel from the left sidebar
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
