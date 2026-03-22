import { useEffect, useRef } from "react";
import { useEditorStore } from "@/lib/editorStore";
import TopBar from "@/components/editor/TopBar";
import ToolSidebar from "@/components/editor/ToolSidebar";
import PanelSidebar from "@/components/editor/PanelSidebar";
import PhotoCanvas from "@/components/editor/PhotoCanvas";
import VideoEditor from "@/components/editor/VideoEditor";
import StatusBar from "@/components/editor/StatusBar";

export default function EditorPage() {
  const { mode, sourceImage, sourceVideo } = useEditorStore();

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const store = useEditorStore.getState();
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case "v": store.setActiveTool("select"); break;
        case "c": store.setActiveTool("crop"); break;
        case "b": store.setActiveTool("brush"); break;
        case "e": store.setActiveTool("eraser"); break;
        case "t": store.setActiveTool("text"); break;
        case "=": case "+": store.setZoom(store.zoom + 10); break;
        case "-": store.setZoom(store.zoom - 10); break;
        case "0": store.setZoom(100); break;
        case " ": {
          e.preventDefault();
          store.setIsPlaying(!store.isPlaying);
          break;
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[hsl(220_13%_10%)]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Top bar */}
      <TopBar />

      {/* Main editor area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left tool sidebar */}
        <ToolSidebar />

        {/* Center workspace */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {mode === "photo" ? (
            <PhotoCanvas />
          ) : (
            <VideoEditor />
          )}
        </div>

        {/* Right panel sidebar */}
        <PanelSidebar />
      </div>

      {/* Status bar */}
      <StatusBar />
    </div>
  );
}
