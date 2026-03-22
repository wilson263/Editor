import { useEditorStore } from "@/lib/editorStore";
import { Info } from "lucide-react";

export default function StatusBar() {
  const { activeTool, activePanel, layers, adjustments, resolution, aiProcessing } = useEditorStore();

  return (
    <div className="h-6 bg-[hsl(220_13%_8%)] border-t border-[hsl(215_20%_16%)] flex items-center justify-between px-3 shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-gray-600 font-mono">Tool: <span className="text-gray-400 capitalize">{activeTool}</span></span>
        <span className="text-[10px] text-gray-600 font-mono">Layers: <span className="text-gray-400">{layers.length}</span></span>
        {aiProcessing && (
          <span className="text-[10px] text-violet-400 animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full inline-block animate-ping" />
            AI Processing...
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-gray-600 font-mono">Resolution: <span className="text-gray-400">{resolution}</span></span>
        <span className="text-[10px] text-gray-600 font-mono">Brightness: <span className="text-gray-400">{adjustments.brightness > 0 ? "+" : ""}{adjustments.brightness}</span></span>
        <div className="flex items-center gap-1 text-gray-700">
          <Info size={10} />
          <span className="text-[9px]">ProEditor v1.0 · 8K Support</span>
        </div>
      </div>
    </div>
  );
}
