import { useEditorStore } from "@/lib/editorStore";
import { BLEND_MODES } from "@/lib/imageUtils";
import { Brush, RefreshCw, Droplets } from "lucide-react";
import type { BlendMode } from "@/lib/editorStore";

const BRUSH_PRESETS = [
  { name: "Soft", size: 30, hardness: 20, opacity: 80, flow: 90 },
  { name: "Hard", size: 20, hardness: 100, opacity: 100, flow: 100 },
  { name: "Large Soft", size: 100, hardness: 10, opacity: 60, flow: 80 },
  { name: "Detail", size: 6, hardness: 90, opacity: 100, flow: 100 },
  { name: "Airbrush", size: 50, hardness: 0, opacity: 30, flow: 30 },
  { name: "Watercolor", size: 40, hardness: 0, opacity: 50, flow: 40 },
];

function BrushPreview({
  size, hardness, color, angle, roundness
}: { size: number; hardness: number; color: string; angle: number; roundness: number }) {
  const previewSize = 80;
  const brushDisplay = Math.min(size, previewSize - 8);
  const alphaFromHardness = hardness / 100;

  return (
    <div className="w-full h-24 bg-[hsl(220_15%_12%)] rounded-xl border border-[hsl(220_15%_18%)] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 checkerboard opacity-30" style={{
        backgroundImage: "repeating-conic-gradient(hsl(220 15% 18%) 0% 25%, transparent 0% 50%)",
        backgroundSize: "12px 12px"
      }} />
      <div
        style={{
          width: brushDisplay,
          height: brushDisplay * (roundness / 100),
          borderRadius: "50%",
          background: color,
          transform: `rotate(${angle}deg)`,
          boxShadow: `0 0 ${(1 - alphaFromHardness) * 30}px ${(1 - alphaFromHardness) * 20}px ${color}60`,
          opacity: 0.85,
          filter: hardness < 80 ? `blur(${(1 - hardness / 100) * 8}px)` : undefined,
        }}
      />
      <div className="absolute bottom-1 right-2 text-[8px] font-mono text-gray-600">{size}px</div>
    </div>
  );
}

function SliderRow({ label, value, min, max, step = 1, onChange, unit = "" }: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; unit?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-500 w-16 shrink-0">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))} className="flex-1" />
      <span className="text-[10px] font-mono text-white w-10 text-right shrink-0">{value}{unit}</span>
    </div>
  );
}

export default function BrushPanel() {
  const {
    brushSize, setBrushSize,
    brushOpacity, setBrushOpacity,
    brushHardness, setBrushHardness,
    brushFlow, setBrushFlow,
    brushSpacing, setBrushSpacing,
    brushAngle, setBrushAngle,
    brushRoundness, setBrushRoundness,
    brushColor, setBrushColor,
    brushSecondaryColor, setBrushSecondaryColor,
    brushPressure, setBrushPressure,
    brushBlendMode, setBrushBlendMode,
  } = useEditorStore();

  function applyPreset(preset: typeof BRUSH_PRESETS[0]) {
    setBrushSize(preset.size);
    setBrushHardness(preset.hardness);
    setBrushOpacity(preset.opacity);
    setBrushFlow(preset.flow);
  }

  function swapColors() {
    const tmp = brushColor;
    setBrushColor(brushSecondaryColor);
    setBrushSecondaryColor(tmp);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(222_18%_8%)] border-b border-[hsl(220_15%_14%)] shrink-0">
        <div className="flex items-center gap-2">
          <Brush size={12} className="text-violet-400" />
          <span className="text-xs font-bold text-white tracking-tight">Brush Settings</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Live preview */}
        <div className="panel-section">
          <div className="panel-label">Preview</div>
          <BrushPreview
            size={brushSize}
            hardness={brushHardness}
            color={brushColor}
            angle={brushAngle}
            roundness={brushRoundness}
          />
        </div>

        {/* Colors */}
        <div className="panel-section">
          <div className="panel-label">Colors</div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-10 h-10 rounded-lg border-2 border-[hsl(220_15%_25%)] cursor-pointer shadow-md"
                style={{ background: brushColor }}
                title="Primary color"
              />
              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg border-2 border-[hsl(220_15%_20%)] cursor-pointer"
                style={{ background: brushSecondaryColor }}
                title="Secondary color"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <label className="text-[9px] text-gray-500 w-12">Primary</label>
                <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)}
                  className="w-8 h-6 cursor-pointer rounded border border-[hsl(220_15%_22%)] bg-transparent p-0" />
                <input type="text" value={brushColor} onChange={(e) => setBrushColor(e.target.value)}
                  className="flex-1 bg-[hsl(220_15%_14%)] text-[9px] text-white font-mono rounded px-1.5 py-1 border border-[hsl(220_15%_20%)] outline-none w-20" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[9px] text-gray-500 w-12">Secondary</label>
                <input type="color" value={brushSecondaryColor} onChange={(e) => setBrushSecondaryColor(e.target.value)}
                  className="w-8 h-6 cursor-pointer rounded border border-[hsl(220_15%_22%)] bg-transparent p-0" />
                <input type="text" value={brushSecondaryColor} onChange={(e) => setBrushSecondaryColor(e.target.value)}
                  className="flex-1 bg-[hsl(220_15%_14%)] text-[9px] text-white font-mono rounded px-1.5 py-1 border border-[hsl(220_15%_20%)] outline-none w-20" />
              </div>
            </div>
            <button onClick={swapColors} className="p-2 rounded-lg bg-[hsl(220_15%_16%)] hover:bg-[hsl(220_15%_22%)] text-gray-400 hover:text-white transition-all" title="Swap colors (X)">
              <RefreshCw size={12} />
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="panel-section">
          <div className="panel-label">Presets</div>
          <div className="grid grid-cols-3 gap-1.5">
            {BRUSH_PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl border border-[hsl(220_15%_18%)] hover:border-violet-500/50 hover:bg-violet-900/10 transition-all"
              >
                <div
                  className="w-6 h-6 rounded-full"
                  style={{
                    background: brushColor,
                    opacity: 0.8,
                    filter: p.hardness < 50 ? `blur(${(1 - p.hardness / 100) * 3}px)` : undefined,
                    width: Math.max(8, Math.min(24, p.size / 4)),
                    height: Math.max(8, Math.min(24, p.size / 4)),
                  }}
                />
                <span className="text-[9px] text-gray-400">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Core settings */}
        <div className="panel-section">
          <div className="panel-label">Dynamics</div>
          <div className="flex flex-col gap-3">
            <SliderRow label="Size" value={brushSize} min={1} max={500} onChange={setBrushSize} unit="px" />
            <SliderRow label="Opacity" value={brushOpacity} min={0} max={100} onChange={setBrushOpacity} unit="%" />
            <SliderRow label="Hardness" value={brushHardness} min={0} max={100} onChange={setBrushHardness} unit="%" />
            <SliderRow label="Flow" value={brushFlow} min={1} max={100} onChange={setBrushFlow} unit="%" />
          </div>
        </div>

        {/* Shape settings */}
        <div className="panel-section">
          <div className="panel-label">Shape</div>
          <div className="flex flex-col gap-3">
            <SliderRow label="Spacing" value={brushSpacing} min={1} max={200} onChange={setBrushSpacing} unit="%" />
            <SliderRow label="Angle" value={brushAngle} min={0} max={360} onChange={setBrushAngle} unit="°" />
            <SliderRow label="Roundness" value={brushRoundness} min={1} max={100} onChange={setBrushRoundness} unit="%" />
          </div>
        </div>

        {/* Blend mode */}
        <div className="panel-section">
          <div className="panel-label">Blend Mode</div>
          <select
            value={brushBlendMode}
            onChange={(e) => setBrushBlendMode(e.target.value as BlendMode)}
            className="w-full bg-[hsl(220_15%_14%)] border border-[hsl(220_15%_20%)] text-xs text-white rounded-lg px-3 py-2 outline-none focus:border-violet-500 capitalize"
          >
            {BLEND_MODES.map((m) => (
              <option key={m} value={m} className="capitalize">{m}</option>
            ))}
          </select>
        </div>

        {/* Options */}
        <div className="panel-section">
          <div className="panel-label">Options</div>
          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <div className="text-[11px] text-gray-300 font-medium">Pressure Sensitivity</div>
              <div className="text-[9px] text-gray-600">Simulate pen tablet pressure</div>
            </div>
            <button
              onClick={() => setBrushPressure(!brushPressure)}
              className={`w-10 h-5 rounded-full transition-all relative ${brushPressure ? "bg-violet-600" : "bg-[hsl(220_15%_22%)]"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow ${brushPressure ? "right-0.5" : "left-0.5"}`} />
            </button>
          </label>
        </div>

        {/* Color presets */}
        <div className="panel-section">
          <div className="panel-label">Color Swatches</div>
          <div className="flex flex-wrap gap-1.5">
            {[
              "#ffffff", "#000000", "#ef4444", "#f97316", "#eab308",
              "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
              "#6366f1", "#14b8a6", "#f59e0b", "#10b981", "#e11d48",
            ].map((c) => (
              <button
                key={c}
                onClick={() => setBrushColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${brushColor === c ? "border-violet-400 scale-110" : "border-transparent"}`}
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
