import { useEditorStore } from "@/lib/editorStore";
import { useState, useEffect } from "react";
import { Info, Cpu, Clock, Zap, Layers, Activity } from "lucide-react";

export default function StatusBar() {
  const {
    activeTool, activePanel, layers, adjustments, resolution, aiProcessing,
    zoom, historyIndex, history, sourceImage, brushSize, brushColor,
    selectedFilter, exportFormat, showGrid, showRulers
  } = useEditorStore();

  const [fps, setFps] = useState(60);
  const [memoryMB, setMemoryMB] = useState(0);
  const [renderTime, setRenderTime] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const hasEdits = Object.entries(adjustments).some(([, v]) => v !== 0);
  const activeLayerCount = layers.filter(l => l.visible).length;

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    function tick() {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.round(frameCount * 1000 / (now - lastTime)));
        frameCount = 0;
        lastTime = now;

        // Performance memory API (Chrome)
        if ((performance as any).memory) {
          setMemoryMB(Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024));
        }
      }
      animId = requestAnimationFrame(tick);
    }
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      setMousePos({
        x: Math.round((e.clientX - rect.left) * scaleX),
        y: Math.round((e.clientY - rect.top) * scaleY),
      });
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const TOOL_LABELS: Record<string, string> = {
    "select": "Select", "hand": "Pan", "crop": "Crop", "brush": "Brush", "eraser": "Eraser",
    "text": "Text", "shape": "Shape", "gradient": "Gradient", "eyedropper": "Eyedropper",
    "lasso": "Lasso", "magic-wand": "Magic Wand", "heal": "Heal", "clone": "Clone Stamp",
    "dodge": "Dodge", "burn": "Burn", "smudge": "Smudge", "blur-tool": "Blur",
    "sharpen-tool": "Sharpen", "liquify": "Liquify", "pen": "Pen", "ruler": "Straighten",
  };

  return (
    <div className="h-6 bg-[hsl(222_18%_5%)] border-t border-[hsl(220_15%_11%)] flex items-center justify-between px-3 shrink-0 select-none">
      {/* Left section */}
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Tool indicator */}
        <span className="text-[9px] text-gray-600 font-mono flex items-center gap-1">
          <span className="text-gray-700">Tool:</span>
          <span className="text-gray-400">{TOOL_LABELS[activeTool] || activeTool}</span>
          {activeTool === "brush" && (
            <>
              <span className="text-gray-700 ml-1">·</span>
              <span className="inline-block w-2 h-2 rounded-full border border-gray-600" style={{ background: brushColor }} />
              <span className="text-gray-500">{brushSize}px</span>
            </>
          )}
        </span>

        <span className="text-gray-800 text-[9px]">|</span>

        {/* Layers */}
        <span className="text-[9px] text-gray-600 font-mono flex items-center gap-1">
          <Layers size={8} className="text-gray-700" />
          <span className="text-gray-400">{layers.length}</span>
          {activeLayerCount > 0 && <span className="text-gray-700">({activeLayerCount} vis)</span>}
        </span>

        <span className="text-gray-800 text-[9px]">|</span>

        {/* History */}
        <span className="text-[9px] text-gray-600 font-mono flex items-center gap-1">
          <Clock size={8} className="text-gray-700" />
          <span className="text-gray-400">{historyIndex + 1}/{Math.max(1, history.length)}</span>
        </span>

        {/* Filter */}
        {selectedFilter !== "none" && (
          <>
            <span className="text-gray-800 text-[9px]">|</span>
            <span className="text-[9px] text-violet-500 font-mono">Filter: {selectedFilter}</span>
          </>
        )}

        {/* AI Processing */}
        {aiProcessing && (
          <>
            <span className="text-gray-800 text-[9px]">|</span>
            <span className="text-[9px] text-violet-400 animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full inline-block animate-ping" />
              AI Processing...
            </span>
          </>
        )}

        {/* Unsaved */}
        {hasEdits && (
          <>
            <span className="text-gray-800 text-[9px]">|</span>
            <span className="text-[9px] text-amber-500/70 flex items-center gap-1">
              <span className="w-1 h-1 bg-amber-500 rounded-full inline-block" />
              Unsaved edits
            </span>
          </>
        )}

        {/* View indicators */}
        {(showGrid || showRulers) && (
          <>
            <span className="text-gray-800 text-[9px]">|</span>
            <span className="text-[9px] text-gray-700">
              {showGrid && "Grid"}{showGrid && showRulers && " · "}{showRulers && "Rulers"}
            </span>
          </>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Mouse position on canvas */}
        {sourceImage && (mousePos.x > 0 || mousePos.y > 0) && (
          <span className="text-[9px] text-gray-700 font-mono">
            {mousePos.x}, {mousePos.y}
          </span>
        )}

        {sourceImage && (
          <span className="text-[9px] text-gray-600 font-mono">
            <span className="text-gray-700">Zoom:</span> <span className="text-gray-400">{zoom}%</span>
          </span>
        )}

        <span className="text-[9px] text-gray-600 font-mono">
          <span className="text-gray-700">Res:</span> <span className="text-gray-400">{resolution.split(" ")[0]}</span>
        </span>

        <span className="text-[9px] text-gray-600 font-mono">
          <span className="text-gray-700">Exp:</span>
          <span className={`${adjustments.exposure > 0 ? "text-amber-500" : adjustments.exposure < 0 ? "text-blue-400" : "text-gray-400"}`}>
            {" "}{adjustments.exposure > 0 ? "+" : ""}{adjustments.exposure}
          </span>
        </span>

        {/* FPS counter */}
        <span className={`text-[9px] font-mono flex items-center gap-0.5 ${fps >= 50 ? "text-green-700" : fps >= 30 ? "text-amber-700" : "text-red-700"}`}>
          <Activity size={8} />
          {fps}fps
        </span>

        {/* Memory */}
        {memoryMB > 0 && (
          <span className="text-[9px] text-gray-700 font-mono flex items-center gap-0.5">
            <Cpu size={8} />
            {memoryMB}MB
          </span>
        )}

        <span className="text-gray-800 text-[9px]">|</span>

        <span className="text-[9px] text-gray-700 flex items-center gap-1">
          <Info size={8} />
          ProEditor v3.0 · 8K
        </span>
      </div>
    </div>
  );
}
