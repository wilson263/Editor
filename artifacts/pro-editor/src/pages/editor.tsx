import { useEffect } from "react";
import { useEditorStore } from "@/lib/editorStore";
import TopBar from "@/components/editor/TopBar";
import ToolSidebar from "@/components/editor/ToolSidebar";
import PanelSidebar from "@/components/editor/PanelSidebar";
import PhotoCanvas from "@/components/editor/PhotoCanvas";
import VideoEditor from "@/components/editor/VideoEditor";
import StatusBar from "@/components/editor/StatusBar";
import KeyboardShortcuts from "@/components/editor/KeyboardShortcuts";

export default function EditorPage() {
  const { mode } = useEditorStore();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const store = useEditorStore.getState();
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const ctrl = e.ctrlKey || e.metaKey;

      // Ctrl shortcuts
      if (ctrl) {
        switch (e.key.toLowerCase()) {
          case "z":
            e.preventDefault();
            if (e.shiftKey) store.redo();
            else store.undo();
            return;
          case "y": e.preventDefault(); store.redo(); return;
          case "'": e.preventDefault(); store.toggleGrid(); return;
          case "r": e.preventDefault(); store.toggleRulers(); return;
          case "s": e.preventDefault(); return; // prevent browser save
        }
        return;
      }

      // Function keys → panels
      switch (e.key) {
        case "F1": e.preventDefault(); store.setActivePanel("adjustments"); return;
        case "F2": e.preventDefault(); store.setActivePanel("filters"); return;
        case "F3": e.preventDefault(); store.setActivePanel("color"); return;
        case "F4": e.preventDefault(); store.setActivePanel("layers"); return;
        case "F5": e.preventDefault(); store.setActivePanel("history"); return;
        case "F6": e.preventDefault(); store.setActivePanel("ai"); return;
        case "F7": e.preventDefault(); store.setActivePanel("brush-panel"); return;
        case "F8": e.preventDefault(); store.setActivePanel("gradient-panel"); return;
      }

      // Tool shortcuts
      switch (e.key.toLowerCase()) {
        case "v": store.setActiveTool("select"); break;
        case "h": store.setActiveTool("hand"); break;
        case "c": store.setActiveTool("crop"); break;
        case "b": store.setActiveTool("brush"); break;
        case "e": store.setActiveTool("eraser"); break;
        case "t": store.setActiveTool("text"); break;
        case "l": store.setActiveTool("lasso"); break;
        case "w": store.setActiveTool("magic-wand"); break;
        case "i": store.setActiveTool("eyedropper"); break;
        case "s": store.setActiveTool("clone"); break;
        case "j": store.setActiveTool("heal"); break;
        case "o": store.setActiveTool("dodge"); break;
        case "g": store.setActiveTool("gradient"); break;
        case "p": store.setActiveTool("pen"); break;
        case "u": store.setActiveTool("shape"); break;
        case "x": {
          // Swap brush colors
          const tmp = store.brushColor;
          store.setBrushColor(store.brushSecondaryColor);
          store.setBrushSecondaryColor(tmp);
          break;
        }
        case "=": case "+": store.setZoom(Math.min(3200, store.zoom + 25)); break;
        case "-": store.setZoom(Math.max(5, store.zoom - 25)); break;
        case "0": store.setZoom(100); break;
        case "?": store.toggleKeyboardShortcuts(); break;
        case "escape": {
          if (store.showKeyboardShortcuts) store.toggleKeyboardShortcuts();
          break;
        }
        case " ": {
          e.preventDefault();
          if (store.mode === "video") store.setIsPlaying(!store.isPlaying);
          break;
        }
        case "[": {
          store.setBrushSize(Math.max(1, store.brushSize - 5));
          break;
        }
        case "]": {
          store.setBrushSize(Math.min(500, store.brushSize + 5));
          break;
        }
        case "{": {
          store.setBrushHardness(Math.max(0, store.brushHardness - 10));
          break;
        }
        case "}": {
          store.setBrushHardness(Math.min(100, store.brushHardness + 10));
          break;
        }
        case "delete":
        case "backspace": {
          if (store.activeLayerId) {
            store.removeLayer(store.activeLayerId);
          }
          break;
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div
      className="flex flex-col w-screen h-screen overflow-hidden bg-[hsl(222_18%_8%)]"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <TopBar />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ToolSidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {mode === "photo" ? <PhotoCanvas /> : <VideoEditor />}
        </div>

        <PanelSidebar />
      </div>

      <StatusBar />

      {/* Global overlays */}
      <KeyboardShortcuts />
    </div>
  );
}
