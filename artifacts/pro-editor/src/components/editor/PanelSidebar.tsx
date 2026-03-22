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
import EffectsPanel from "./panels/EffectsPanel";
import ToneMappingPanel from "./panels/ToneMappingPanel";
import ColorPalettePanel from "./panels/ColorPalettePanel";
import BatchPanel from "./panels/BatchPanel";
import MaskingPanel from "./panels/MaskingPanel";
import PresetsPanel from "./panels/PresetsPanel";
import LocalAdjPanel from "./panels/LocalAdjPanel";
import NavigatorPanel from "./panels/NavigatorPanel";
import PerspectivePanel from "./panels/PerspectivePanel";
import ExportPanel from "./panels/ExportPanel";
import NoiseReductionPanel from "./panels/NoiseReductionPanel";
import ContentAwarePanel from "./panels/ContentAwarePanel";
import CurveEditorPanel from "./panels/CurveEditorPanel";
import FrequencySeparationPanel from "./panels/FrequencySeparationPanel";
import MotionBlurPanel from "./panels/MotionBlurPanel";
import ColorHarmonyPanel from "./panels/ColorHarmonyPanel";
import GlitchArtPanel from "./panels/GlitchArtPanel";
import WaveformPanel from "./panels/WaveformPanel";
import SmartSharpenPanel from "./panels/SmartSharpenPanel";
import DoubleExposurePanel from "./panels/DoubleExposurePanel";
import PixelatePanel from "./panels/PixelatePanel";
import LUTPanel from "./panels/LUTPanel";
import LiquifyPanel from "./panels/LiquifyPanel";
import RAWControlsPanel from "./panels/RAWControlsPanel";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import type { LiquifyTool } from "./panels/LiquifyPanel";

export default function PanelSidebar() {
  const { activePanel, setActivePanel, setSourceImage } = useEditorStore();
  const [liquifyTool, setLiquifyTool] = useState<LiquifyTool>("push");
  const [liquifySize, setLiquifySize] = useState(80);
  const [liquifyPressure, setLiquifyPressure] = useState(50);

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
    effects: <EffectsPanel />,
    "tone-mapping": <ToneMappingPanel />,
    palette: <ColorPalettePanel />,
    batch: <BatchPanel />,
    masking: <MaskingPanel />,
    presets: <PresetsPanel />,
    "local-adj": <LocalAdjPanel />,
    navigator: <NavigatorPanel />,
    perspective: <PerspectivePanel />,
    export: <ExportPanel />,
    "noise-reduction": <NoiseReductionPanel />,
    "content-aware": <ContentAwarePanel />,
    "curve-editor": <CurveEditorPanel />,
    "frequency-separation": <FrequencySeparationPanel />,
    "motion-blur": <MotionBlurPanel />,
    "color-harmony": <ColorHarmonyPanel />,
    "glitch-art": <GlitchArtPanel />,
    waveform: <WaveformPanel />,
    "smart-sharpen": <SmartSharpenPanel />,
    "double-exposure": <DoubleExposurePanel />,
    pixelate: <PixelatePanel />,
    "lut": <LUTPanel />,
    "raw-controls": <RAWControlsPanel />,
    "liquify-panel": (
      <LiquifyPanel
        activeTool={liquifyTool}
        onToolChange={setLiquifyTool}
        brushSize={liquifySize}
        onBrushSizeChange={setLiquifySize}
        brushPressure={liquifyPressure}
        onBrushPressureChange={setLiquifyPressure}
        onReset={() => {
          const e = new CustomEvent("liquify-reset");
          window.dispatchEvent(e);
        }}
        onApply={() => {
          const e = new CustomEvent("liquify-apply");
          window.dispatchEvent(e);
          setActivePanel("adjustments");
        }}
        onCancel={() => {
          const e = new CustomEvent("liquify-cancel");
          window.dispatchEvent(e);
          setActivePanel("adjustments");
        }}
      />
    ),
  };

  return (
    <div style={{
      width: "256px",
      background: "linear-gradient(180deg, #080614 0%, #060412 100%)",
      borderLeft: "1px solid rgba(139,92,246,0.1)",
      display: "flex", flexDirection: "column",
      flexShrink: 0, overflow: "hidden",
      boxShadow: "inset 1px 0 0 rgba(139,92,246,0.04)",
    }}>
      {panels[activePanel] || (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "16px" }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "16px",
            background: "rgba(139,92,246,0.08)",
            border: "1px solid rgba(139,92,246,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <SlidersHorizontal size={22} style={{ color: "rgba(139,92,246,0.5)" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.3)", marginBottom: "6px" }}>No panel selected</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.15)", maxWidth: "160px", lineHeight: 1.65, textAlign: "center" }}>
              Choose a tool or panel from the left sidebar
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
