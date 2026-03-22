import { useEditorStore } from "@/lib/editorStore";
import { Info, Cpu, Clock, Image } from "lucide-react";

export default function StatusBar() {
  const { activeTool, activePanel, layers, adjustments, resolution, aiProcessing, zoom, historyIndex, history, sourceImage } = useEditorStore();

  const hasEdits = Object.entries(adjustments).some(([, v]) => v !== 0);

  return (
    <div className="h-6 bg-[hsl(222_18%_6%)] border-t border-[hsl(220_15%_12%)] flex items-center justify-between px-3 shrink-0">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <span className="text-[9px] text-gray-600 font-mono">
          Tool: <span className="text-gray-400 capitalize">{activeTool}</span>
        </span>
        <span className="text-[9px] text-gray-600 font-mono">
          Layers: <span className="text-gray-400">{layers.length}</span>
        </span>
        <span className="text-[9px] text-gray-600 font-mono">
          History: <span className="text-gray-400">{historyIndex + 1}/{Math.max(1, history.length)}</span>
        </span>
        {aiProcessing && (
          <span className="text-[9px] text-violet-400 animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full inline-block animate-ping" />
            AI Processing...
          </span>
        )}
        {hasEdits && (
          <span className="text-[9px] text-amber-500/70 flex items-center gap-1">
            <span className="w-1 h-1 bg-amber-500 rounded-full inline-block" />
            Unsaved edits
          </span>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {sourceImage && (
          <span className="text-[9px] text-gray-600 font-mono">
            Zoom: <span className="text-gray-400">{zoom}%</span>
          </span>
        )}
        <span className="text-[9px] text-gray-600 font-mono">
          Res: <span className="text-gray-400">{resolution}</span>
        </span>
        <span className="text-[9px] text-gray-600 font-mono">
          Exp: <span className="text-gray-400">{adjustments.exposure > 0 ? "+" : ""}{adjustments.exposure}</span>
        </span>
        <div className="flex items-center gap-1 text-gray-700">
          <Info size={9} />
          <span className="text-[9px]">ProEditor v2.0 · 8K</span>
        </div>
      </div>
    </div>
  );
}
