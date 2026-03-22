import { useState } from "react";
import { useEditorStore } from "@/lib/editorStore";
import { generateId } from "@/lib/imageUtils";
import { FONTS } from "@/lib/imageUtils";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Plus } from "lucide-react";

export default function TextPanel() {
  const { addLayer } = useEditorStore();
  const [text, setText] = useState("Your Text Here");
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState("Inter");
  const [color, setColor] = useState("#ffffff");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [align, setAlign] = useState<"left" | "center" | "right">("center");
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [opacity, setOpacity] = useState(100);
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowBlur, setShadowBlur] = useState(4);
  const [outlineEnabled, setOutlineEnabled] = useState(false);
  const [outlineColor, setOutlineColor] = useState("#000000");
  const [outlineWidth, setOutlineWidth] = useState(2);

  function addText() {
    const id = generateId();
    addLayer({
      id,
      name: text.slice(0, 20) || "Text Layer",
      type: "text",
      visible: true,
      locked: false,
      opacity,
      blendMode: "normal",
      text,
      textStyle: {
        fontSize,
        fontFamily,
        color,
        bold,
        italic,
        underline,
        align,
        x: 50,
        y: 50,
      },
    });
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-3 py-2 border-b border-[hsl(215_20%_18%)]">
        <span className="text-xs font-semibold text-white">Text & Typography</span>
      </div>

      <div className="p-3 flex flex-col gap-3">
        {/* Text input */}
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Text Content</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full bg-[hsl(215_20%_16%)] border border-[hsl(215_20%_22%)] rounded-md text-sm text-white px-2 py-2 outline-none resize-none focus:border-violet-500 transition-all"
            placeholder="Enter text..."
          />
        </div>

        {/* Font family */}
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Font Family</label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full bg-[hsl(215_20%_16%)] border border-[hsl(215_20%_22%)] text-xs text-white rounded-md px-2 py-2 outline-none focus:border-violet-500"
          >
            {FONTS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Font size */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest">Size</label>
            <span className="text-[10px] text-gray-300 font-mono">{fontSize}px</span>
          </div>
          <input type="range" min={8} max={400} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" />
        </div>

        {/* Style toggles */}
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Style</label>
          <div className="flex gap-1.5">
            <button
              onClick={() => setBold(!bold)}
              className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${bold ? "bg-violet-600 text-white" : "bg-[hsl(215_20%_18%)] text-gray-400 hover:text-white"}`}
            >
              <Bold size={12} className="mx-auto" />
            </button>
            <button
              onClick={() => setItalic(!italic)}
              className={`flex-1 py-1.5 rounded-md text-xs transition-all ${italic ? "bg-violet-600 text-white" : "bg-[hsl(215_20%_18%)] text-gray-400 hover:text-white"}`}
            >
              <Italic size={12} className="mx-auto" />
            </button>
            <button
              onClick={() => setUnderline(!underline)}
              className={`flex-1 py-1.5 rounded-md text-xs transition-all ${underline ? "bg-violet-600 text-white" : "bg-[hsl(215_20%_18%)] text-gray-400 hover:text-white"}`}
            >
              <Underline size={12} className="mx-auto" />
            </button>
          </div>
        </div>

        {/* Alignment */}
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Alignment</label>
          <div className="flex gap-1.5">
            {(["left", "center", "right"] as const).map((a, i) => (
              <button
                key={a}
                onClick={() => setAlign(a)}
                className={`flex-1 py-1.5 rounded-md transition-all ${align === a ? "bg-violet-600 text-white" : "bg-[hsl(215_20%_18%)] text-gray-400 hover:text-white"}`}
              >
                {i === 0 ? <AlignLeft size={12} className="mx-auto" /> : i === 1 ? <AlignCenter size={12} className="mx-auto" /> : <AlignRight size={12} className="mx-auto" />}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Color</label>
          <div className="flex items-center gap-2">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-[hsl(215_20%_22%)] bg-transparent" />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-1 bg-[hsl(215_20%_16%)] border border-[hsl(215_20%_22%)] rounded px-2 py-1.5 text-xs text-white font-mono outline-none"
            />
          </div>
        </div>

        {/* Letter spacing */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest">Letter Spacing</label>
            <span className="text-[10px] text-gray-300 font-mono">{letterSpacing}px</span>
          </div>
          <input type="range" min={-10} max={50} value={letterSpacing} onChange={(e) => setLetterSpacing(Number(e.target.value))} className="w-full" />
        </div>

        {/* Opacity */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest">Opacity</label>
            <span className="text-[10px] text-gray-300 font-mono">{opacity}%</span>
          </div>
          <input type="range" min={0} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full" />
        </div>

        {/* Shadow */}
        <div className="border border-[hsl(215_20%_18%)] rounded-lg p-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest">Shadow</label>
            <button
              onClick={() => setShadowEnabled(!shadowEnabled)}
              className={`w-8 h-4 rounded-full transition-all relative ${shadowEnabled ? "bg-violet-600" : "bg-[hsl(215_20%_22%)]"}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${shadowEnabled ? "right-0.5" : "left-0.5"}`} />
            </button>
          </div>
          {shadowEnabled && (
            <div className="flex gap-2">
              <input type="color" value={shadowColor} onChange={(e) => setShadowColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer" />
              <div className="flex-1">
                <div className="flex justify-between"><span className="text-[9px] text-gray-600">Blur</span><span className="text-[9px] text-gray-400">{shadowBlur}</span></div>
                <input type="range" min={0} max={40} value={shadowBlur} onChange={(e) => setShadowBlur(Number(e.target.value))} className="w-full" />
              </div>
            </div>
          )}
        </div>

        {/* Outline */}
        <div className="border border-[hsl(215_20%_18%)] rounded-lg p-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest">Outline</label>
            <button
              onClick={() => setOutlineEnabled(!outlineEnabled)}
              className={`w-8 h-4 rounded-full transition-all relative ${outlineEnabled ? "bg-violet-600" : "bg-[hsl(215_20%_22%)]"}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${outlineEnabled ? "right-0.5" : "left-0.5"}`} />
            </button>
          </div>
          {outlineEnabled && (
            <div className="flex gap-2">
              <input type="color" value={outlineColor} onChange={(e) => setOutlineColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer" />
              <div className="flex-1">
                <div className="flex justify-between"><span className="text-[9px] text-gray-600">Width</span><span className="text-[9px] text-gray-400">{outlineWidth}px</span></div>
                <input type="range" min={1} max={20} value={outlineWidth} onChange={(e) => setOutlineWidth(Number(e.target.value))} className="w-full" />
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div
          className="w-full h-20 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 border border-[hsl(215_20%_20%)] flex items-center justify-center overflow-hidden"
        >
          <span
            style={{
              fontFamily,
              fontSize: Math.min(fontSize, 36),
              color,
              fontWeight: bold ? "bold" : "normal",
              fontStyle: italic ? "italic" : "normal",
              textDecoration: underline ? "underline" : "none",
              letterSpacing: letterSpacing + "px",
              textAlign: align,
              opacity: opacity / 100,
              textShadow: shadowEnabled ? `0 0 ${shadowBlur}px ${shadowColor}` : undefined,
              WebkitTextStroke: outlineEnabled ? `${outlineWidth}px ${outlineColor}` : undefined,
            }}
          >
            {text || "Preview"}
          </span>
        </div>

        {/* Add button */}
        <button
          onClick={addText}
          className="flex items-center justify-center gap-2 w-full py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-md text-xs font-medium transition-all"
        >
          <Plus size={13} /> Add Text to Canvas
        </button>
      </div>
    </div>
  );
}
