import { useState } from "react";
import { Droplets, RotateCcw, CircleDot, ZoomIn, ZoomOut, Wind, Minus, Plus, Magnet } from "lucide-react";

export type LiquifyTool = "push" | "pull" | "pinch" | "bloat" | "rotate" | "freeze" | "reconstruct";

interface LiquifyPanelProps {
  activeTool: LiquifyTool;
  onToolChange: (t: LiquifyTool) => void;
  brushSize: number;
  onBrushSizeChange: (v: number) => void;
  brushPressure: number;
  onBrushPressureChange: (v: number) => void;
  onReset: () => void;
  onApply: () => void;
  onCancel: () => void;
}

const TOOLS: { id: LiquifyTool; icon: React.ReactNode; label: string; desc: string }[] = [
  { id: "push", icon: <Wind size={13} />, label: "Forward Warp", desc: "Warp pixels in brush direction" },
  { id: "pull", icon: <Wind size={13} className="rotate-180" />, label: "Pull", desc: "Pull pixels backward" },
  { id: "pinch", icon: <Magnet size={13} />, label: "Pucker", desc: "Pinch pixels toward center" },
  { id: "bloat", icon: <ZoomIn size={13} />, label: "Bloat", desc: "Push pixels outward from center" },
  { id: "rotate", icon: <RotateCcw size={13} />, label: "Twirl", desc: "Rotate pixels around brush center" },
  { id: "reconstruct", icon: <RotateCcw size={13} className="scale-x-[-1]" />, label: "Reconstruct", desc: "Restore toward original" },
  { id: "freeze", icon: <CircleDot size={13} />, label: "Freeze", desc: "Protect area from warping" },
];

export default function LiquifyPanel({
  activeTool, onToolChange, brushSize, onBrushSizeChange,
  brushPressure, onBrushPressureChange, onReset, onApply, onCancel
}: LiquifyPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(220_15%_14%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <Droplets size={13} className="text-violet-400" />
          <span className="text-xs font-bold text-white">Liquify</span>
          <span className="ml-auto text-[9px] text-violet-400 bg-violet-900/30 px-1.5 py-0.5 rounded">Mesh Warp</span>
        </div>
        <p className="text-[9px] text-gray-500 mt-1">Real-time mesh-based warp. Paint on the canvas to warp pixels.</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Tool selection */}
        <div className="px-3 py-2 border-b border-[hsl(220_15%_14%)]">
          <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-2">Warp Tool</div>
          <div className="flex flex-col gap-1">
            {TOOLS.map(tool => (
              <button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all ${
                  activeTool === tool.id
                    ? "bg-violet-900/40 border border-violet-700/60 text-white"
                    : "border border-transparent hover:bg-[hsl(220_15%_15%)] text-gray-400 hover:text-white"
                }`}
              >
                <span className="text-violet-400 shrink-0">{tool.icon}</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold">{tool.label}</span>
                  <span className="text-[9px] text-gray-600">{tool.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Brush settings */}
        <div className="px-3 py-2 border-b border-[hsl(220_15%_14%)]">
          <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-2">Brush</div>
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-400">Size</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onBrushSizeChange(Math.max(10, brushSize - 10))}
                    className="w-5 h-5 flex items-center justify-center rounded bg-[hsl(220_15%_15%)] text-gray-400 hover:text-white"
                  ><Minus size={9} /></button>
                  <span className="text-[10px] text-white font-mono w-8 text-center">{brushSize}</span>
                  <button
                    onClick={() => onBrushSizeChange(Math.min(500, brushSize + 10))}
                    className="w-5 h-5 flex items-center justify-center rounded bg-[hsl(220_15%_15%)] text-gray-400 hover:text-white"
                  ><Plus size={9} /></button>
                </div>
              </div>
              <input
                type="range" min={10} max={500} value={brushSize}
                onChange={e => onBrushSizeChange(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-400">Pressure</span>
                <span className="text-[10px] text-white font-mono">{brushPressure}%</span>
              </div>
              <input
                type="range" min={1} max={100} value={brushPressure}
                onChange={e => onBrushPressureChange(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Mesh options */}
        <div className="px-3 py-2">
          <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-2">Mesh Options</div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onReset}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-[hsl(220_15%_15%)] text-[10px] text-gray-400 hover:text-white transition-all border border-transparent hover:border-[hsl(220_15%_18%)]"
            >
              <RotateCcw size={11} />
              Reset All Distortions
            </button>
          </div>
        </div>
      </div>

      <div className="px-3 py-2 border-t border-[hsl(220_15%_14%)] shrink-0 flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 action-btn justify-center py-2 text-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={onApply}
          className="flex-1 action-btn-primary action-btn justify-center py-2"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
