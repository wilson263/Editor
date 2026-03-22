import { useEditorStore, type CurvePoint } from "@/lib/editorStore";
import { useEffect, useRef, useState, useCallback } from "react";
import { RotateCcw, TrendingUp } from "lucide-react";

const CHANNEL_COLORS = {
  rgb: { line: "#a78bfa", fill: "rgba(139,92,246,0.15)", dot: "#8b5cf6" },
  r: { line: "#ef4444", fill: "rgba(239,68,68,0.15)", dot: "#dc2626" },
  g: { line: "#22c55e", fill: "rgba(34,197,94,0.15)", dot: "#16a34a" },
  b: { line: "#3b82f6", fill: "rgba(59,130,246,0.15)", dot: "#2563eb" },
};

const DEFAULT_POINTS: CurvePoint[] = [{ x: 0, y: 0 }, { x: 255, y: 255 }];

function catmullRom(t: number, p0: CurvePoint, p1: CurvePoint, p2: CurvePoint, p3: CurvePoint) {
  const t2 = t * t, t3 = t2 * t;
  return {
    x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

export default function CurveEditorPanel() {
  const { curvePoints, activeCurveChannel, setCurvePoints, setActiveCurveChannel } = useEditorStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [localPoints, setLocalPoints] = useState<Record<string, CurvePoint[]>>({
    rgb: [...DEFAULT_POINTS], r: [...DEFAULT_POINTS], g: [...DEFAULT_POINTS], b: [...DEFAULT_POINTS],
  });

  const channel = activeCurveChannel;
  const colors = CHANNEL_COLORS[channel];
  const points = localPoints[channel] ?? DEFAULT_POINTS;

  const drawCurve = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SIZE = canvas.offsetWidth || 220;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);

    const W = SIZE, H = SIZE;
    const PAD = 16;
    const IW = W - PAD * 2, IH = H - PAD * 2;

    ctx.fillStyle = "hsl(222 18% 7%)";
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const x = PAD + (i / 4) * IW, y = PAD + (i / 4) * IH;
      ctx.beginPath(); ctx.moveTo(x, PAD); ctx.lineTo(x, H - PAD); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke();
    }

    // Diagonal reference
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(PAD, H - PAD); ctx.lineTo(W - PAD, PAD); ctx.stroke();
    ctx.setLineDash([]);

    // Sort points by x
    const sorted = [...points].sort((a, b) => a.x - b.x);

    // Build extended points for catmull-rom
    const ext = [sorted[0], ...sorted, sorted[sorted.length - 1]];

    const toCanvas = (p: CurvePoint) => ({
      cx: PAD + (p.x / 255) * IW,
      cy: H - PAD - (p.y / 255) * IH,
    });

    // Draw curve
    ctx.beginPath();
    ctx.moveTo(PAD, H - PAD - (sorted[0].y / 255) * IH);

    for (let i = 0; i < ext.length - 3; i++) {
      for (let t = 0; t <= 1; t += 0.02) {
        const p = catmullRom(t, ext[i], ext[i + 1], ext[i + 2], ext[i + 3]);
        const cx = PAD + (Math.max(0, Math.min(255, p.x)) / 255) * IW;
        const cy = H - PAD - (Math.max(0, Math.min(255, p.y)) / 255) * IH;
        ctx.lineTo(cx, cy);
      }
    }
    ctx.lineTo(W - PAD, H - PAD - (sorted[sorted.length - 1].y / 255) * IH);

    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fill under curve
    ctx.lineTo(W - PAD, H - PAD);
    ctx.lineTo(PAD, H - PAD);
    ctx.closePath();
    ctx.fillStyle = colors.fill;
    ctx.fill();

    // Draw control points
    sorted.forEach((p, i) => {
      const { cx, cy } = toCanvas(p);
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = dragging === i ? "#fff" : colors.dot;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }, [points, colors, dragging, channel]);

  useEffect(() => { drawCurve(); }, [drawCurve]);

  function getCanvasPoint(e: React.MouseEvent<HTMLCanvasElement>): CurvePoint {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const PAD = 16;
    const IW = rect.width - PAD * 2;
    const IH = rect.height - PAD * 2;
    const rx = e.clientX - rect.left;
    const ry = e.clientY - rect.top;
    return {
      x: Math.max(0, Math.min(255, ((rx - PAD) / IW) * 255)),
      y: Math.max(0, Math.min(255, ((IH - (ry - PAD)) / IH) * 255)),
    };
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const pt = getCanvasPoint(e);
    const sorted = [...points].sort((a, b) => a.x - b.x);
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const IW = rect.width - 32, IH = rect.height - 32;

    // Find nearest point
    let nearest = -1, minDist = Infinity;
    sorted.forEach((p, i) => {
      const dx = ((p.x / 255) * IW) - ((pt.x / 255) * IW);
      const dy = ((p.y / 255) * IH) - ((pt.y / 255) * IH);
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 15 && d < minDist) { nearest = i; minDist = d; }
    });

    if (nearest >= 0) {
      setDragging(nearest);
    } else {
      const newPoints = [...sorted, pt].sort((a, b) => a.x - b.x);
      const newLocal = { ...localPoints, [channel]: newPoints };
      setLocalPoints(newLocal);
      setCurvePoints(channel, newPoints);
      setDragging(newPoints.findIndex(p => p === pt));
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (dragging === null) return;
    const pt = getCanvasPoint(e);
    const sorted = [...points].sort((a, b) => a.x - b.x);
    sorted[dragging] = pt;
    const newLocal = { ...localPoints, [channel]: sorted };
    setLocalPoints(newLocal);
    setCurvePoints(channel, sorted);
  }

  function handleMouseUp() { setDragging(null); }

  function resetChannel() {
    const newLocal = { ...localPoints, [channel]: [...DEFAULT_POINTS] };
    setLocalPoints(newLocal);
    setCurvePoints(channel, [...DEFAULT_POINTS]);
  }

  const PRESETS = [
    { name: "Contrast S", points: [{ x: 0, y: 0 }, { x: 64, y: 48 }, { x: 192, y: 208 }, { x: 255, y: 255 }] },
    { name: "Fade Film", points: [{ x: 0, y: 20 }, { x: 128, y: 128 }, { x: 255, y: 235 }] },
    { name: "Lift Shadows", points: [{ x: 0, y: 28 }, { x: 128, y: 128 }, { x: 255, y: 255 }] },
    { name: "Crush Blacks", points: [{ x: 0, y: 0 }, { x: 60, y: 0 }, { x: 200, y: 200 }, { x: 255, y: 255 }] },
    { name: "Blow Highlights", points: [{ x: 0, y: 0 }, { x: 180, y: 220 }, { x: 255, y: 255 }] },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(215_20%_18%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={13} className="text-violet-400" />
            <span className="text-xs font-bold text-white">Curve Editor</span>
          </div>
          <button onClick={resetChannel} className="text-[9px] text-gray-600 hover:text-violet-400 flex items-center gap-1 transition-all">
            <RotateCcw size={9} /> Reset
          </button>
        </div>
      </div>

      {/* Channel tabs */}
      <div className="flex border-b border-[hsl(215_20%_18%)] shrink-0">
        {(["rgb", "r", "g", "b"] as const).map((ch) => (
          <button key={ch} onClick={() => setActiveCurveChannel(ch)}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase transition-all ${
              channel === ch
                ? ch === "rgb" ? "text-violet-400 border-b-2 border-violet-500"
                  : ch === "r" ? "text-red-400 border-b-2 border-red-500"
                  : ch === "g" ? "text-green-400 border-b-2 border-green-500"
                  : "text-blue-400 border-b-2 border-blue-500"
                : "text-gray-600 hover:text-gray-300"
            }`}
          >
            {ch === "rgb" ? "RGB" : ch.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Curve canvas */}
        <div className="p-3">
          <div className="rounded-lg overflow-hidden border border-[hsl(220_15%_16%)] bg-[hsl(222_18%_7%)]">
            <canvas
              ref={canvasRef}
              className="w-full cursor-crosshair select-none"
              style={{ height: "200px", display: "block", touchAction: "none" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-gray-700">Shadows</span>
            <span className="text-[9px] text-gray-600">Click to add • Drag to adjust • {points.length} pts</span>
            <span className="text-[9px] text-gray-700">Highlights</span>
          </div>
        </div>

        {/* Presets */}
        <div className="px-3 pb-3">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Curve Presets</div>
          <div className="grid grid-cols-2 gap-1">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => {
                  const newLocal = { ...localPoints, [channel]: p.points };
                  setLocalPoints(newLocal);
                  setCurvePoints(channel, p.points);
                }}
                className="px-2 py-2 text-[10px] text-gray-400 hover:text-white bg-[hsl(220_15%_12%)] hover:bg-[hsl(220_15%_16%)] rounded-lg transition-all text-center"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Remove points hint */}
        <div className="px-3 pb-3">
          <div className="text-[9px] text-gray-700 bg-[hsl(220_15%_12%)] rounded-lg px-2 py-2 leading-relaxed">
            Click canvas to add points · Drag to adjust · Right-click a point to remove it
          </div>
        </div>
      </div>
    </div>
  );
}
