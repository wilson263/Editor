import { useEditorStore, type Adjustments } from "@/lib/editorStore";
import { useState, useRef, useCallback } from "react";
import { RotateCcw } from "lucide-react";

const HSL_CHANNELS = [
  { key: "hslRed", satKey: "hslRedSat", lumKey: "hslRedLum", label: "Red", color: "#ef4444", bg: "bg-red-500" },
  { key: "hslOrange", satKey: "hslOrangeSat", lumKey: "hslOrangeLum", label: "Orange", color: "#f97316", bg: "bg-orange-500" },
  { key: "hslYellow", satKey: "hslYellowSat", lumKey: "hslYellowLum", label: "Yellow", color: "#eab308", bg: "bg-yellow-500" },
  { key: "hslGreen", satKey: "hslGreenSat", lumKey: "hslGreenLum", label: "Green", color: "#22c55e", bg: "bg-green-500" },
  { key: "hslAqua", satKey: "hslAquaSat", lumKey: "hslAquaLum", label: "Aqua", color: "#06b6d4", bg: "bg-cyan-500" },
  { key: "hslBlue", satKey: "hslBlueSat", lumKey: "hslBlueLum", label: "Blue", color: "#3b82f6", bg: "bg-blue-500" },
  { key: "hslPurple", satKey: "hslPurpleSat", lumKey: "hslPurpleLum", label: "Purple", color: "#a855f7", bg: "bg-purple-500" },
  { key: "hslMagenta", satKey: "hslMagentaSat", lumKey: "hslMagentaLum", label: "Magenta", color: "#ec4899", bg: "bg-pink-500" },
] as const;

type CurveChannel = "rgb" | "r" | "g" | "b";
type HslChannel = "hue" | "saturation" | "luminance";

interface CurveEditorProps {
  channel: CurveChannel;
}

function CurveEditor({ channel }: CurveEditorProps) {
  const { curvePoints, setCurvePoints } = useEditorStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const points = curvePoints[channel];

  const getSVGPoint = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(200, ((clientX - rect.left) / rect.width) * 200)),
      y: Math.max(0, Math.min(200, ((clientY - rect.top) / rect.height) * 200)),
    };
  };

  const handleMouseDown = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    setDragging(idx);
  };

  const handleSVGMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging === null) return;
    const pt = getSVGPoint(e.clientX, e.clientY);
    const newPoints = points.map((p, i) => (i === dragging ? pt : p));
    setCurvePoints(channel, newPoints);
  }, [dragging, points, channel, setCurvePoints]);

  const handleMouseUp = () => setDragging(null);

  const pathD = () => {
    if (points.length < 2) return "";
    const sorted = [...points].sort((a, b) => a.x - b.x);
    let d = `M${sorted[0].x},${sorted[0].y}`;
    for (let i = 0; i < sorted.length - 1; i++) {
      const p0 = sorted[i];
      const p1 = sorted[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) / 3;
      const cy1 = p0.y;
      const cx2 = p0.x + (2 * (p1.x - p0.x)) / 3;
      const cy2 = p1.y;
      d += ` C${cx1},${cy1} ${cx2},${cy2} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const curveColor = channel === "r" ? "#ef4444" : channel === "g" ? "#22c55e" : channel === "b" ? "#3b82f6" : "#8b5cf6";

  return (
    <div className="rounded-lg overflow-hidden border border-[hsl(220_15%_18%)] bg-[hsl(222_18%_8%)]">
      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        className="w-full aspect-square cursor-crosshair select-none"
        onMouseMove={handleSVGMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(222 18% 6%)" />
            <stop offset="100%" stopColor="hsl(222 18% 12%)" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="url(#bgGrad)" />

        {/* Grid */}
        {[50, 100, 150].map((v) => (
          <g key={v}>
            <line x1={v} y1={0} x2={v} y2={200} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
            <line x1={0} y1={v} x2={200} y2={v} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
          </g>
        ))}

        {/* Diagonal reference */}
        <line x1={0} y1={200} x2={200} y2={0} stroke="rgba(255,255,255,0.08)" strokeWidth={1} strokeDasharray="4 4" />

        {/* Fill under curve */}
        <path
          d={`${pathD()} L200,200 L0,200 Z`}
          fill={`${curveColor}18`}
        />

        {/* Curve */}
        <path
          d={pathD()}
          stroke={curveColor}
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
        />

        {/* Control points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={6}
              fill="transparent"
              className="cursor-grab"
              onMouseDown={(e) => handleMouseDown(e, i)}
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={4}
              fill="white"
              stroke={curveColor}
              strokeWidth={2}
              className="pointer-events-none"
              style={{ filter: `drop-shadow(0 0 3px ${curveColor})` }}
            />
          </g>
        ))}
      </svg>

      {/* Labels */}
      <div className="flex justify-between px-2 py-1 text-[8px] text-gray-600">
        <span>0</span><span>Shadows</span><span>Midtones</span><span>Highlights</span><span>255</span>
      </div>
    </div>
  );
}

export default function ColorGradingPanel() {
  const { adjustments, setAdjustment, activeCurveChannel, setActiveCurveChannel, activeHslChannel, setActiveHslChannel } = useEditorStore();

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(222_18%_8%)] border-b border-[hsl(220_15%_14%)] shrink-0">
        <span className="text-xs font-bold text-white tracking-tight">Color Grading</span>
      </div>

      {/* Tone Curve */}
      <div className="panel-section">
        <div className="flex items-center justify-between mb-2">
          <div className="panel-label">Tone Curve</div>
          <div className="flex gap-1">
            {(["rgb", "r", "g", "b"] as const).map((ch) => (
              <button
                key={ch}
                onClick={() => setActiveCurveChannel(ch)}
                className={`px-2 py-0.5 text-[9px] rounded font-bold uppercase transition-all ${
                  activeCurveChannel === ch
                    ? ch === "rgb" ? "bg-violet-600 text-white"
                      : ch === "r" ? "bg-red-600 text-white"
                      : ch === "g" ? "bg-green-600 text-white"
                      : "bg-blue-600 text-white"
                    : "bg-[hsl(220_15%_18%)] text-gray-500 hover:text-gray-300"
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
        <CurveEditor channel={activeCurveChannel} />
      </div>

      {/* HSL */}
      <div className="panel-section">
        <div className="flex items-center justify-between mb-2">
          <div className="panel-label">HSL / Color Mix</div>
          <div className="flex gap-1">
            {(["hue", "saturation", "luminance"] as const).map((ch) => (
              <button
                key={ch}
                onClick={() => setActiveHslChannel(ch)}
                className={`px-2 py-0.5 text-[9px] rounded font-bold capitalize transition-all ${
                  activeHslChannel === ch ? "bg-violet-600 text-white" : "bg-[hsl(220_15%_18%)] text-gray-500 hover:text-gray-300"
                }`}
              >
                {ch.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {HSL_CHANNELS.map(({ key, satKey, lumKey, label, color, bg }) => {
            const currentKey = activeHslChannel === "hue" ? key : activeHslChannel === "saturation" ? satKey : lumKey;
            const value = adjustments[currentKey as keyof Adjustments] as number;
            return (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-sm shrink-0`} style={{ background: color }} />
                <span className="text-[10px] text-gray-400 w-14 font-medium">{label}</span>
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    value={value}
                    onChange={(e) => setAdjustment(currentKey as keyof Adjustments, Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <span className="text-[10px] text-gray-300 font-mono w-7 text-right">
                  {value > 0 ? "+" : ""}{value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Split Toning */}
      <div className="panel-section">
        <div className="panel-label">Split Toning</div>

        <div className="space-y-3">
          <div>
            <div className="text-[10px] text-gray-500 mb-2">Highlights</div>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "Hue", key: "splitHighlightH", min: 0, max: 360 },
                { label: "Saturation", key: "splitHighlightS", min: 0, max: 100 },
              ].map(({ label, key, min, max }) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 w-16">{label}</span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={adjustments[key as keyof Adjustments] as number}
                    onChange={(e) => setAdjustment(key as keyof Adjustments, Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-6 text-right">
                    {adjustments[key as keyof Adjustments]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-gray-500">Balance</span>
              <span className="text-[10px] font-mono text-gray-300">{adjustments.splitBalance}</span>
            </div>
            <input
              type="range"
              min={-100}
              max={100}
              value={adjustments.splitBalance}
              onChange={(e) => setAdjustment("splitBalance", Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="text-[10px] text-gray-500 mb-2">Shadows</div>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "Hue", key: "splitShadowH", min: 0, max: 360 },
                { label: "Saturation", key: "splitShadowS", min: 0, max: 100 },
              ].map(({ label, key, min, max }) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 w-16">{label}</span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={adjustments[key as keyof Adjustments] as number}
                    onChange={(e) => setAdjustment(key as keyof Adjustments, Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-gray-300 w-6 text-right">
                    {adjustments[key as keyof Adjustments]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Color Wheels */}
      <div className="panel-section">
        <div className="panel-label">Color Wheels</div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Shadows", hue: adjustments.splitShadowH, sat: adjustments.splitShadowS },
            { label: "Midtones", hue: 180, sat: 0 },
            { label: "Highlights", hue: adjustments.splitHighlightH, sat: adjustments.splitHighlightS },
          ].map(({ label, hue, sat }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div
                className="relative w-14 h-14 rounded-full overflow-hidden cursor-crosshair border border-[hsl(220_15%_22%)] shadow-md"
                style={{ background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }}
              >
                <div
                  className="absolute inset-1.5 rounded-full"
                  style={{ background: `radial-gradient(circle, white 30%, transparent 70%)` }}
                />
                <div
                  className="absolute w-3 h-3 rounded-full border-2 border-white shadow-md"
                  style={{
                    left: `${50 + (sat / 100) * 40 * Math.cos((hue * Math.PI) / 180)}%`,
                    top: `${50 - (sat / 100) * 40 * Math.sin((hue * Math.PI) / 180)}%`,
                    transform: "translate(-50%, -50%)",
                    background: `hsl(${hue}, ${sat}%, 50%)`,
                  }}
                />
              </div>
              <span className="text-[9px] text-gray-500 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
