import { useEditorStore } from "@/lib/editorStore";
import { useState, useEffect } from "react";
import { Activity, Cpu, Layers, Clock } from "lucide-react";

export default function StatusBar() {
  const {
    activeTool, activePanel, layers, adjustments, resolution, aiProcessing,
    zoom, historyIndex, history, sourceImage, brushSize, brushColor,
    selectedFilter, exportFormat, showGrid, showRulers
  } = useEditorStore();

  const [fps, setFps] = useState(60);
  const [memoryMB, setMemoryMB] = useState(0);
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
        frameCount = 0; lastTime = now;
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
      setMousePos({
        x: Math.round((e.clientX - rect.left) * (canvas.width / rect.width)),
        y: Math.round((e.clientY - rect.top) * (canvas.height / rect.height)),
      });
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const TOOL_LABELS: Record<string, string> = {
    "select": "Select", "hand": "Pan", "crop": "Crop", "brush": "Brush",
    "eraser": "Eraser", "text": "Text", "shape": "Shape", "gradient": "Gradient",
    "eyedropper": "Eyedropper", "lasso": "Lasso", "magic-wand": "Magic Wand",
    "heal": "Heal", "clone": "Clone Stamp", "dodge": "Dodge", "burn": "Burn",
    "smudge": "Smudge", "blur-tool": "Blur", "sharpen-tool": "Sharpen",
    "liquify": "Liquify", "pen": "Pen", "ruler": "Straighten",
  };

  const fpsColor = fps >= 50 ? "rgba(52,211,153,0.8)" : fps >= 30 ? "rgba(251,191,36,0.8)" : "rgba(248,113,113,0.8)";

  const sep = <span style={{ color: "rgba(139,92,246,0.2)", margin: "0 2px" }}>|</span>;

  return (
    <div style={{
      height: "24px",
      background: "linear-gradient(180deg, #050310 0%, #030008 100%)",
      borderTop: "1px solid rgba(139,92,246,0.1)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 12px", flexShrink: 0, userSelect: "none",
      boxShadow: "0 -1px 0 rgba(0,0,0,0.5)",
    }}>
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px", overflow: "hidden" }}>
        <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", fontFamily: "monospace", display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>Tool:</span>
          <span style={{ color: "rgba(255,255,255,0.55)" }}>{TOOL_LABELS[activeTool] || activeTool}</span>
          {activeTool === "brush" && (
            <>
              <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
              <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: brushColor, boxShadow: `0 0 4px ${brushColor}` }} />
              <span style={{ color: "rgba(255,255,255,0.4)" }}>{brushSize}px</span>
            </>
          )}
        </span>

        {sep}

        <span style={{ fontSize: "9px", fontFamily: "monospace", display: "flex", alignItems: "center", gap: "4px", color: "rgba(255,255,255,0.25)" }}>
          <Layers size={8} style={{ color: "rgba(139,92,246,0.5)" }} />
          <span style={{ color: "rgba(255,255,255,0.45)" }}>{layers.length} layers</span>
          {activeLayerCount > 0 && <span style={{ color: "rgba(255,255,255,0.2)" }}>({activeLayerCount} vis)</span>}
        </span>

        {sep}

        <span style={{ fontSize: "9px", fontFamily: "monospace", display: "flex", alignItems: "center", gap: "4px", color: "rgba(255,255,255,0.25)" }}>
          <Clock size={8} style={{ color: "rgba(139,92,246,0.5)" }} />
          <span style={{ color: "rgba(255,255,255,0.4)" }}>{historyIndex + 1}/{Math.max(1, history.length)}</span>
        </span>

        {selectedFilter !== "none" && (
          <>{sep}<span style={{ fontSize: "9px", color: "rgba(139,92,246,0.8)", fontFamily: "monospace" }}>Filter: {selectedFilter}</span></>
        )}

        {aiProcessing && (
          <>{sep}
            <span style={{ fontSize: "9px", color: "#a78bfa", display: "flex", alignItems: "center", gap: "4px", animation: "pulse 1.5s ease-in-out infinite" }}>
              <span style={{ width: "5px", height: "5px", background: "#a78bfa", borderRadius: "50%", display: "inline-block", animation: "ping 1s cubic-bezier(0,0,0.2,1) infinite" }} />
              AI Processing...
            </span>
          </>
        )}

        {hasEdits && (
          <>{sep}
            <span style={{ fontSize: "9px", display: "flex", alignItems: "center", gap: "4px", color: "rgba(245,158,11,0.6)" }}>
              <span style={{ width: "4px", height: "4px", background: "#f59e0b", borderRadius: "50%", display: "inline-block" }} />
              Unsaved
            </span>
          </>
        )}

        {(showGrid || showRulers) && (
          <>{sep}
            <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>
              {showGrid && "Grid"}{showGrid && showRulers && " · "}{showRulers && "Rulers"}
            </span>
          </>
        )}
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
        {sourceImage && (mousePos.x > 0 || mousePos.y > 0) && (
          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>
            {mousePos.x}, {mousePos.y}
          </span>
        )}

        {sourceImage && (
          <>{sep}
            <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.3)" }}>
              <span style={{ color: "rgba(255,255,255,0.15)" }}>Zoom: </span>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>{zoom}%</span>
            </span>
          </>
        )}

        {sep}
        <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.3)" }}>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>Res: </span>
          <span style={{ color: "rgba(255,255,255,0.45)" }}>{resolution.split(" ")[0]}</span>
        </span>

        {sep}
        <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.3)" }}>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>Exp: </span>
          <span style={{ color: adjustments.exposure > 0 ? "rgba(245,158,11,0.7)" : adjustments.exposure < 0 ? "rgba(96,165,250,0.7)" : "rgba(255,255,255,0.45)" }}>
            {adjustments.exposure > 0 ? "+" : ""}{adjustments.exposure}
          </span>
        </span>

        {sep}
        <span style={{ fontSize: "9px", fontFamily: "monospace", display: "flex", alignItems: "center", gap: "3px", color: fpsColor }}>
          <Activity size={8} />
          {fps}fps
        </span>

        {memoryMB > 0 && (
          <>{sep}
            <span style={{ fontSize: "9px", fontFamily: "monospace", display: "flex", alignItems: "center", gap: "3px", color: "rgba(255,255,255,0.2)" }}>
              <Cpu size={8} /> {memoryMB}MB
            </span>
          </>
        )}

        {sep}
        <span style={{ fontSize: "9px", color: "rgba(139,92,246,0.5)", fontFamily: "monospace" }}>
          ✦ ProEditor v4.0 · 8K · AI
        </span>
      </div>
    </div>
  );
}
