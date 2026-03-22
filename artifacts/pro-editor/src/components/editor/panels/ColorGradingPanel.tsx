import { useEditorStore, type Adjustments } from "@/lib/editorStore";
import { LUT_PRESETS } from "@/lib/imageUtils";

const HSL_CHANNELS = [
  { key: "hslRed", label: "Red", color: "#ef4444" },
  { key: "hslOrange", label: "Orange", color: "#f97316" },
  { key: "hslYellow", label: "Yellow", color: "#eab308" },
  { key: "hslGreen", label: "Green", color: "#22c55e" },
  { key: "hslAqua", label: "Aqua", color: "#06b6d4" },
  { key: "hslBlue", label: "Blue", color: "#3b82f6" },
  { key: "hslPurple", label: "Purple", color: "#a855f7" },
  { key: "hslMagenta", label: "Magenta", color: "#ec4899" },
] as const;

function CurvePoint({ x, y }: { x: number; y: number }) {
  return (
    <circle
      cx={x}
      cy={y}
      r={5}
      fill="white"
      stroke="#8b5cf6"
      strokeWidth={2}
      className="cursor-grab"
    />
  );
}

export default function ColorGradingPanel() {
  const { adjustments, setAdjustment } = useEditorStore();

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-3 py-2 border-b border-[hsl(215_20%_18%)]">
        <span className="text-xs font-semibold text-white">Color Grading</span>
      </div>

      <div className="p-3 flex flex-col gap-4">
        {/* Curves */}
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Tone Curve</div>
          <div className="relative bg-[hsl(215_20%_14%)] rounded-lg overflow-hidden border border-[hsl(215_20%_20%)]">
            <svg viewBox="0 0 200 200" className="w-full" style={{ aspectRatio: "1" }}>
              {/* Grid lines */}
              {[50, 100, 150].map((v) => (
                <g key={v}>
                  <line x1={v} y1={0} x2={v} y2={200} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                  <line x1={0} y1={v} x2={200} y2={v} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                </g>
              ))}
              {/* Diagonal reference */}
              <line x1={0} y1={200} x2={200} y2={0} stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="4 4" />
              {/* Curve */}
              <path
                d="M0,200 C50,150 100,100 150,60 Q175,30 200,0"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="none"
              />
              {/* Control points */}
              <CurvePoint x={0} y={200} />
              <CurvePoint x={100} y={100} />
              <CurvePoint x={200} y={0} />
            </svg>
            <div className="absolute bottom-1 left-0 right-0 flex justify-around text-[9px] text-gray-600">
              <span>Blacks</span><span>Shadows</span><span>Mids</span><span>Highlights</span><span>Whites</span>
            </div>
          </div>

          {/* RGB Channels */}
          <div className="flex gap-1 mt-2">
            {["RGB", "R", "G", "B"].map((ch) => (
              <button
                key={ch}
                className={`flex-1 py-1 text-[10px] rounded font-medium transition-all ${
                  ch === "RGB"
                    ? "bg-violet-600 text-white"
                    : ch === "R"
                    ? "bg-[hsl(215_20%_18%)] text-red-400 hover:bg-red-900/30"
                    : ch === "G"
                    ? "bg-[hsl(215_20%_18%)] text-green-400 hover:bg-green-900/30"
                    : "bg-[hsl(215_20%_18%)] text-blue-400 hover:bg-blue-900/30"
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        {/* HSL */}
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">HSL / Color Mix</div>
          <div className="flex flex-col gap-2">
            {HSL_CHANNELS.map(({ key, label, color }) => (
              <div key={key}>
                <div className="flex justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                    <span className="text-[10px] text-gray-400">{label}</span>
                  </div>
                  <span className="text-[10px] text-gray-300 font-mono">
                    {adjustments[key as keyof Adjustments] > 0 ? "+" : ""}{adjustments[key as keyof Adjustments]}
                  </span>
                </div>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={adjustments[key as keyof Adjustments] as number}
                  onChange={(e) => setAdjustment(key as keyof Adjustments, Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: color }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* LUT Presets */}
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">LUT Presets</div>
          <div className="grid grid-cols-2 gap-1.5">
            {LUT_PRESETS.map((lut) => (
              <button
                key={lut}
                className="flex items-center gap-2 px-2 py-2 rounded-lg border border-[hsl(215_20%_18%)] hover:border-violet-600/50 hover:bg-violet-900/10 transition-all text-left"
              >
                <div className="w-8 h-5 rounded shrink-0 bg-gradient-to-r from-teal-700 to-orange-600" />
                <span className="text-[10px] text-gray-400 hover:text-white truncate">{lut}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Wheels */}
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Color Wheels</div>
          <div className="grid grid-cols-3 gap-2">
            {["Shadows", "Midtones", "Highlights"].map((zone) => (
              <div key={zone} className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-full border-2 border-[hsl(215_20%_22%)] bg-conic-gradient relative overflow-hidden"
                  style={{
                    background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
                    opacity: 0.7,
                  }}
                >
                  <div className="absolute inset-1 rounded-full bg-[hsl(220_13%_13%)] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white/80" />
                  </div>
                </div>
                <span className="text-[9px] text-gray-500">{zone}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
