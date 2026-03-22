import { useEditorStore } from "@/lib/editorStore";
import { RESOLUTIONS } from "@/lib/imageUtils";
import {
  Undo2, Redo2, Download, Upload, ZoomIn, ZoomOut, Monitor,
  Film, Save, Share2, Settings, ChevronDown
} from "lucide-react";
import { useRef } from "react";

export default function TopBar() {
  const {
    mode, setMode, zoom, setZoom, resolution, setResolution,
    setSourceImage, setSourceVideo, adjustments, selectedFilter, layers
  } = useEditorStore();

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setSourceImage(src);
    };
    reader.readAsDataURL(file);
  }

  function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSourceVideo(url);
  }

  function handleExport() {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "proeditor-export.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="h-12 bg-[#0d0d1a] border-b border-[hsl(215_20%_16%)] flex items-center justify-between px-3 gap-2 shrink-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 min-w-[140px]">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm">P</div>
        <span className="font-bold text-white text-sm tracking-wide">ProEditor</span>
        <span className="text-[10px] text-violet-400 bg-violet-900/30 px-1.5 py-0.5 rounded font-medium">PRO</span>
      </div>

      {/* Mode Switch */}
      <div className="flex items-center bg-[#1a1a2e] rounded-lg p-0.5 border border-[hsl(215_20%_18%)]">
        <button
          onClick={() => setMode("photo")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${mode === "photo" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}
        >
          <Monitor size={12} /> Photo
        </button>
        <button
          onClick={() => setMode("video")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${mode === "video" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}
        >
          <Film size={12} /> Video
        </button>
      </div>

      {/* Upload buttons */}
      <div className="flex items-center gap-1.5">
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
        <button
          onClick={() => imageInputRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1a1a2e] border border-[hsl(215_20%_20%)] rounded-md text-xs text-gray-300 hover:text-white hover:border-violet-500 transition-all"
        >
          <Upload size={12} /> Image
        </button>
        <button
          onClick={() => videoInputRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1a1a2e] border border-[hsl(215_20%_20%)] rounded-md text-xs text-gray-300 hover:text-white hover:border-violet-500 transition-all"
        >
          <Upload size={12} /> Video
        </button>
      </div>

      {/* History */}
      <div className="flex items-center gap-0.5">
        <button className="p-1.5 rounded hover:bg-[#1a1a2e] text-gray-400 hover:text-white transition-all" title="Undo">
          <Undo2 size={15} />
        </button>
        <button className="p-1.5 rounded hover:bg-[#1a1a2e] text-gray-400 hover:text-white transition-all" title="Redo">
          <Redo2 size={15} />
        </button>
      </div>

      {/* Zoom */}
      <div className="flex items-center gap-1 bg-[#1a1a2e] border border-[hsl(215_20%_18%)] rounded-md px-2 py-1">
        <button onClick={() => setZoom(zoom - 10)} className="text-gray-400 hover:text-white transition-all">
          <ZoomOut size={13} />
        </button>
        <span className="text-xs text-white font-mono w-10 text-center">{zoom}%</span>
        <button onClick={() => setZoom(zoom + 10)} className="text-gray-400 hover:text-white transition-all">
          <ZoomIn size={13} />
        </button>
      </div>

      {/* Resolution */}
      <div className="relative">
        <select
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          className="bg-[#1a1a2e] border border-[hsl(215_20%_18%)] text-xs text-gray-300 rounded-md px-2 py-1.5 outline-none hover:border-violet-500 transition-all appearance-none pr-6 cursor-pointer"
        >
          {RESOLUTIONS.map((r) => (
            <option key={r.label} value={r.label}>{r.label}</option>
          ))}
        </select>
        <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <button className="p-1.5 rounded hover:bg-[#1a1a2e] text-gray-400 hover:text-white transition-all" title="Settings">
          <Settings size={15} />
        </button>
        <button className="p-1.5 rounded hover:bg-[#1a1a2e] text-gray-400 hover:text-white transition-all" title="Share">
          <Share2 size={15} />
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-md text-xs font-medium transition-all"
        >
          <Download size={12} /> Export
        </button>
      </div>
    </div>
  );
}
