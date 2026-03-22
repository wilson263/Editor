import { useState } from "react";
import { useEditorStore } from "@/lib/editorStore";
import { generateId, FONTS } from "@/lib/imageUtils";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Plus, Type, Strikethrough } from "lucide-react";

const PRESET_TEXT_STYLES = [
  { label: "Headline", size: 96, font: "Bebas Neue", color: "#ffffff", bold: false },
  { label: "Subheadline", size: 48, font: "Inter", color: "#e5e7eb", bold: true },
  { label: "Body", size: 24, font: "Inter", color: "#d1d5db", bold: false },
  { label: "Caption", size: 16, font: "Inter", color: "#9ca3af", bold: false },
  { label: "Script", size: 64, font: "Dancing Script", color: "#ffffff", bold: false },
  { label: "Impact", size: 80, font: "Impact", color: "#fde047", bold: false },
];

export default function TextPanel() {
  const { addLayer, layers, updateLayer, activeLayerId } = useEditorStore();
  const [text, setText] = useState("Your Text Here");
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState("Inter");
  const [color, setColor] = useState("#ffffff");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [align, setAlign] = useState<"left" | "center" | "right">("center");
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.4);
  const [opacity, setOpacity] = useState(100);
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowBlur, setShadowBlur] = useState(10);
  const [strokeEnabled, setStrokeEnabled] = useState(false);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);

  function applyPreset(preset: typeof PRESET_TEXT_STYLES[0]) {
    setFontSize(preset.size);
    setFontFamily(preset.font);
    setColor(preset.color);
    setBold(preset.bold);
  }

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
        letterSpacing,
        lineHeight,
        shadow: shadowEnabled,
        shadowColor,
        shadowBlur,
        stroke: strokeEnabled,
        strokeColor,
        strokeWidth,
      },
    });
  }

  const activeLayer = layers.find((l) => l.id === activeLayerId && l.type === "text");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(222_18%_8%)] border-b border-[hsl(220_15%_14%)] shrink-0">
        <span className="text-xs font-bold text-white tracking-tight">Text & Typography</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Quick presets */}
        <div className="panel-section">
          <div className="panel-label">Quick Styles</div>
          <div className="grid grid-cols-2 gap-1.5">
            {PRESET_TEXT_STYLES.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className="px-2 py-2 rounded-lg border border-[hsl(220_15%_18%)] hover:border-violet-500/50 hover:bg-violet-900/10 transition-all text-left"
              >
                <span
                  className="text-xs text-white font-medium block truncate"
                  style={{ fontFamily: p.font, fontWeight: p.bold ? "bold" : "normal" }}
                >
                  {p.label}
                </span>
                <span className="text-[9px] text-gray-600">{p.font} · {p.size}px</span>
              </button>
            ))}
          </div>
        </div>

        {/* Text input */}
        <div className="panel-section">
          <div className="panel-label">Content</div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full bg-[hsl(220_15%_14%)] border border-[hsl(220_15%_20%)] rounded-lg text-sm text-white px-3 py-2 outline-none resize-none focus:border-violet-500 transition-all"
            placeholder="Enter text..."
          />
        </div>

        {/* Font */}
        <div className="panel-section">
          <div className="panel-label">Font</div>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full bg-[hsl(220_15%_14%)] border border-[hsl(220_15%_20%)] text-xs text-white rounded-lg px-3 py-2 outline-none focus:border-violet-500 mb-2"
          >
            {FONTS.map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
            ))}
          </select>

          {/* Font size */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 w-6">Size</span>
            <input
              type="range"
              min={8}
              max={400}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-12 bg-[hsl(220_15%_14%)] border border-[hsl(220_15%_20%)] text-[10px] text-white rounded px-1.5 py-1 outline-none text-center font-mono"
            />
          </div>
        </div>

        {/* Style */}
        <div className="panel-section">
          <div className="panel-label">Style & Alignment</div>
          <div className="flex gap-1 mb-2">
            {[
              { state: bold, setter: setBold, icon: <Bold size={12} />, tip: "Bold" },
              { state: italic, setter: setItalic, icon: <Italic size={12} />, tip: "Italic" },
              { state: underline, setter: setUnderline, icon: <Underline size={12} />, tip: "Underline" },
            ].map(({ state, setter, icon, tip }, i) => (
              <button
                key={i}
                onClick={() => setter(!state)}
                title={tip}
                className={`flex-1 py-2 rounded-md transition-all ${state ? "bg-violet-600 text-white" : "bg-[hsl(220_15%_16%)] text-gray-400 hover:text-white border border-[hsl(220_15%_20%)]"}`}
              >
                <div className="flex justify-center">{icon}</div>
              </button>
            ))}
            <div className="w-px bg-[hsl(220_15%_18%)] mx-1" />
            {(["left", "center", "right"] as const).map((a, i) => (
              <button
                key={a}
                onClick={() => setAlign(a)}
                className={`flex-1 py-2 rounded-md transition-all ${align === a ? "bg-violet-600 text-white" : "bg-[hsl(220_15%_16%)] text-gray-400 hover:text-white border border-[hsl(220_15%_20%)]"}`}
              >
                <div className="flex justify-center">
                  {i === 0 ? <AlignLeft size={12} /> : i === 1 ? <AlignCenter size={12} /> : <AlignRight size={12} />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="panel-section">
          <div className="panel-label">Color</div>
          <div className="flex items-center gap-2">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
              className="w-9 h-9 rounded-lg cursor-pointer border border-[hsl(220_15%_20%)] bg-transparent p-0.5" />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-1 bg-[hsl(220_15%_14%)] border border-[hsl(220_15%_20%)] rounded-lg px-3 py-2 text-xs text-white font-mono outline-none focus:border-violet-500"
            />
          </div>

          {/* Preset colors */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {["#ffffff", "#000000", "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#8b5cf6", "#ec4899", "#fde047"].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full border-2 transition-all ${color === c ? "border-violet-400 scale-110" : "border-transparent hover:scale-110"}`}
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* Spacing */}
        <div className="panel-section">
          <div className="panel-label">Spacing</div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 w-16">Letter</span>
              <input type="range" min={-10} max={50} value={letterSpacing}
                onChange={(e) => setLetterSpacing(Number(e.target.value))} className="flex-1" />
              <span className="text-[10px] text-white font-mono w-6 text-right">{letterSpacing}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 w-16">Line</span>
              <input type="range" min={0.5} max={3} step={0.1} value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))} className="flex-1" />
              <span className="text-[10px] text-white font-mono w-6 text-right">{lineHeight.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 w-16">Opacity</span>
              <input type="range" min={0} max={100} value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))} className="flex-1" />
              <span className="text-[10px] text-white font-mono w-6 text-right">{opacity}%</span>
            </div>
          </div>
        </div>

        {/* Shadow */}
        <div className="panel-section">
          <div className="flex items-center justify-between mb-2">
            <div className="panel-label" style={{ marginBottom: 0 }}>Drop Shadow</div>
            <button
              onClick={() => setShadowEnabled(!shadowEnabled)}
              className={`w-9 h-5 rounded-full transition-all relative ${shadowEnabled ? "bg-violet-600" : "bg-[hsl(220_15%_22%)]"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow ${shadowEnabled ? "right-0.5" : "left-0.5"}`} />
            </button>
          </div>
          {shadowEnabled && (
            <div className="flex gap-2 items-center">
              <input type="color" value={shadowColor} onChange={(e) => setShadowColor(e.target.value)}
                className="w-8 h-8 rounded-md cursor-pointer border border-[hsl(220_15%_20%)] bg-transparent p-0.5" />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-[9px] text-gray-600">Blur</span>
                  <span className="text-[9px] text-gray-400">{shadowBlur}px</span>
                </div>
                <input type="range" min={0} max={50} value={shadowBlur}
                  onChange={(e) => setShadowBlur(Number(e.target.value))} className="w-full" />
              </div>
            </div>
          )}
        </div>

        {/* Stroke */}
        <div className="panel-section">
          <div className="flex items-center justify-between mb-2">
            <div className="panel-label" style={{ marginBottom: 0 }}>Stroke / Outline</div>
            <button
              onClick={() => setStrokeEnabled(!strokeEnabled)}
              className={`w-9 h-5 rounded-full transition-all relative ${strokeEnabled ? "bg-violet-600" : "bg-[hsl(220_15%_22%)]"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow ${strokeEnabled ? "right-0.5" : "left-0.5"}`} />
            </button>
          </div>
          {strokeEnabled && (
            <div className="flex gap-2 items-center">
              <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)}
                className="w-8 h-8 rounded-md cursor-pointer border border-[hsl(220_15%_20%)] bg-transparent p-0.5" />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-[9px] text-gray-600">Width</span>
                  <span className="text-[9px] text-gray-400">{strokeWidth}px</span>
                </div>
                <input type="range" min={1} max={20} value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))} className="w-full" />
              </div>
            </div>
          )}
        </div>

        {/* Live Preview */}
        <div className="panel-section">
          <div className="panel-label">Preview</div>
          <div className="w-full h-24 rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-[hsl(220_15%_18%)] flex items-center justify-center overflow-hidden px-3">
            <span
              style={{
                fontFamily,
                fontSize: Math.min(fontSize, 42),
                color,
                fontWeight: bold ? "bold" : "normal",
                fontStyle: italic ? "italic" : "normal",
                textDecoration: underline ? "underline" : "none",
                letterSpacing: `${letterSpacing}px`,
                lineHeight,
                textAlign: align,
                opacity: opacity / 100,
                textShadow: shadowEnabled ? `0 2px ${shadowBlur}px ${shadowColor}` : undefined,
                WebkitTextStroke: strokeEnabled ? `${strokeWidth}px ${strokeColor}` : undefined,
                maxWidth: "100%",
                wordBreak: "break-word",
              }}
            >
              {text || "Preview"}
            </span>
          </div>
        </div>
      </div>

      {/* Add button */}
      <div className="shrink-0 p-3 border-t border-[hsl(220_15%_14%)]">
        <button
          onClick={addText}
          className="action-btn-primary action-btn w-full justify-center py-2.5"
        >
          <Plus size={13} /> Add Text to Canvas
        </button>
      </div>
    </div>
  );
}
