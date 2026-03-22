import { useState } from "react";
import { useEditorStore } from "@/lib/editorStore";
import {
  Scan, Wand2, Sparkles, UserCheck, Scissors, Search,
  RefreshCw, ChevronRight, Zap, Eye, ImageOff
} from "lucide-react";

interface AITool {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}

const AI_TOOLS: AITool[] = [
  {
    id: "bg-remove",
    icon: <Scissors size={18} />,
    title: "Background Remover",
    description: "Automatically detect and remove background from photos and videos",
    badge: "Popular",
  },
  {
    id: "auto-enhance",
    icon: <Sparkles size={18} />,
    title: "AI Auto-Enhance",
    description: "One-tap professional enhancement — color, sharpness, lighting",
    badge: "AI",
  },
  {
    id: "face-retouch",
    icon: <UserCheck size={18} />,
    title: "Face Retouch & Beauty",
    description: "Smooth skin, remove blemishes, enhance eyes and lips",
    badge: "AI",
  },
  {
    id: "object-remove",
    icon: <Wand2 size={18} />,
    title: "Object Removal",
    description: "Draw over any object to erase it — AI fills the background",
  },
  {
    id: "object-replace",
    icon: <RefreshCw size={18} />,
    title: "Object Replace",
    description: "Select an object and replace it with AI-generated content",
    badge: "New",
  },
  {
    id: "upscale",
    icon: <Zap size={18} />,
    title: "AI Upscale (8K)",
    description: "Upscale any image to 8K resolution with AI super-resolution",
    badge: "8K",
  },
  {
    id: "denoise",
    icon: <Eye size={18} />,
    title: "AI Denoise",
    description: "Remove noise and grain from photos while preserving detail",
  },
  {
    id: "hdr",
    icon: <Scan size={18} />,
    title: "HDR Reconstruction",
    description: "Convert standard photos to HDR with advanced tone mapping",
  },
  {
    id: "sky-replace",
    icon: <ImageOff size={18} />,
    title: "Sky Replacement",
    description: "Intelligently replace the sky in any outdoor photo",
  },
  {
    id: "colorize",
    icon: <Search size={18} />,
    title: "AI Colorize",
    description: "Add color to black & white photos with AI",
  },
];

export default function AIPanel() {
  const { aiProcessing, setAiProcessing, setAiResult, sourceImage } = useEditorStore();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [strength, setStrength] = useState(80);
  const [processing, setProcessing] = useState<string | null>(null);

  function runAI(toolId: string) {
    setProcessing(toolId);
    setAiProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      setProcessing(null);
      setAiProcessing(false);
      setActiveTool(toolId);
      // In production: call AI API here
    }, 2500);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-[hsl(215_20%_18%)]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
            <Sparkles size={11} className="text-white" />
          </div>
          <span className="text-xs font-semibold text-white">AI-Powered Tools</span>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">Professional AI editing powered by machine learning</p>
      </div>

      {/* Strength control */}
      <div className="px-3 py-2 border-b border-[hsl(215_20%_18%)] bg-[hsl(220_13%_11%)]">
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">AI Strength</span>
          <span className="text-[10px] text-violet-400 font-mono">{strength}%</span>
        </div>
        <input
          type="range"
          min={10}
          max={100}
          value={strength}
          onChange={(e) => setStrength(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* No image warning */}
      {!sourceImage && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-700/30">
          <p className="text-[10px] text-amber-400">Upload an image or video to use AI tools</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
        {AI_TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => runAI(tool.id)}
            disabled={!sourceImage || processing === tool.id}
            className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left ${
              activeTool === tool.id
                ? "border-violet-600 bg-violet-900/20"
                : "border-[hsl(215_20%_18%)] hover:border-violet-700/50 hover:bg-[hsl(215_20%_14%)]"
            } ${!sourceImage ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className={`mt-0.5 shrink-0 text-gray-400 ${activeTool === tool.id ? "text-violet-400" : ""}`}>
              {processing === tool.id ? (
                <div className="w-[18px] h-[18px] border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                tool.icon
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-xs font-medium ${activeTool === tool.id ? "text-violet-300" : "text-white"}`}>
                  {tool.title}
                </span>
                {tool.badge && (
                  <span className="text-[8px] font-bold bg-violet-600 text-white px-1 rounded uppercase tracking-wide">
                    {tool.badge}
                  </span>
                )}
                {processing === tool.id && (
                  <span className="text-[9px] text-violet-400 animate-pulse">Processing...</span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed">{tool.description}</p>
            </div>
            {activeTool === tool.id ? (
              <span className="text-[9px] text-violet-400 shrink-0 mt-1">Applied ✓</span>
            ) : (
              <ChevronRight size={12} className="text-gray-600 shrink-0 mt-1" />
            )}
          </button>
        ))}
      </div>

      {/* Video AI footer */}
      <div className="p-3 border-t border-[hsl(215_20%_18%)] bg-[hsl(220_13%_11%)]">
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Video AI</div>
        <div className="flex flex-col gap-1">
          {["AI Subtitles Auto-Generate", "Voice-to-Text Captions", "Motion Tracking", "Green Screen (Chroma Key)"].map((feat) => (
            <button
              key={feat}
              className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-[hsl(215_20%_18%)] text-[10px] text-gray-400 hover:text-white transition-all"
            >
              <span>{feat}</span>
              <ChevronRight size={10} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
