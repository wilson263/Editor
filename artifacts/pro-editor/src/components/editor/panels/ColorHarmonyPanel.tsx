import { useEditorStore } from "@/lib/editorStore";
import { useEffect, useRef, useState, useCallback } from "react";
import { Palette } from "lucide-react";

type HarmonyMode = "complementary" | "analogous" | "triadic" | "tetradic" | "split-comp" | "monochromatic";

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function getHarmonyColors(h: number, s: number, l: number, mode: HarmonyMode): [number, number, number][] {
  switch (mode) {
    case "complementary": return [[h, s, l], [(h + 180) % 360, s, l]];
    case "analogous": return [[(h - 30 + 360) % 360, s, l], [h, s, l], [(h + 30) % 360, s, l]];
    case "triadic": return [[h, s, l], [(h + 120) % 360, s, l], [(h + 240) % 360, s, l]];
    case "tetradic": return [[h, s, l], [(h + 90) % 360, s, l], [(h + 180) % 360, s, l], [(h + 270) % 360, s, l]];
    case "split-comp": return [[h, s, l], [(h + 150) % 360, s, l], [(h + 210) % 360, s, l]];
    case "monochromatic": return [[h, s, Math.max(20, l - 30)], [h, s, Math.max(30, l - 15)], [h, s, l], [h, s, Math.min(80, l + 15)], [h, s, Math.min(90, l + 30)]];
    default: return [[h, s, l]];
  }
}

export default function ColorHarmonyPanel() {
  const { setBrushColor, colorPickerColor } = useEditorStore();
  const wheelRef = useRef<HTMLCanvasElement>(null);
  const [baseColor, setBaseColor] = useState("#8b5cf6");
  const [mode, setMode] = useState<HarmonyMode>("complementary");
  const [saturation, setSaturation] = useState(75);
  const [lightness, setLightness] = useState(55);

  const [hue, s2, l2] = hexToHsl(baseColor);
  const harmonies = getHarmonyColors(hue, saturation, lightness, mode);

  const drawWheel = useCallback(() => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const SIZE = 180;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);

    const cx = SIZE / 2, cy = SIZE / 2, r = SIZE / 2 - 4;

    for (let angle = 0; angle < 360; angle += 1) {
      const startAngle = ((angle - 1) * Math.PI) / 180;
      const endAngle = ((angle + 1) * Math.PI) / 180;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, "white");
      grad.addColorStop(1, `hsl(${angle}, 100%, 50%)`);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Dark overlay for lightness
    const darken = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    darken.addColorStop(0, "transparent");
    darken.addColorStop(1, `rgba(0,0,0,${1 - lightness / 100})`);
    ctx.fillStyle = darken;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Draw harmony dots
    harmonies.forEach(([h, _s, _l], i) => {
      const rad = ((h - 90) * Math.PI) / 180;
      const dist = (_s / 100) * r * 0.85;
      const dx = cx + Math.cos(rad) * dist;
      const dy = cy + Math.sin(rad) * dist;
      ctx.beginPath();
      ctx.arc(dx, dy, i === 0 ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = hslToHex(h, _s, _l);
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = i === 0 ? 2.5 : 1.5;
      ctx.stroke();
    });
  }, [harmonies, lightness]);

  useEffect(() => { drawWheel(); }, [drawWheel]);

  function handleWheelClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = wheelRef.current!;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2, cy = rect.height / 2;
    const dx = e.clientX - rect.left - cx;
    const dy = e.clientY - rect.top - cy;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    const newHue = ((angle + 360) % 360);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const r = rect.width / 2 - 4;
    const newSat = Math.min(100, Math.round((dist / r) * 100));
    setBaseColor(hslToHex(newHue, newSat, lightness));
    setSaturation(newSat);
  }

  const MODES: HarmonyMode[] = ["complementary", "analogous", "triadic", "tetradic", "split-comp", "monochromatic"];

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(215_20%_18%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <Palette size={13} className="text-violet-400" />
          <span className="text-xs font-bold text-white">Color Harmony</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {/* Color wheel */}
        <div className="flex flex-col items-center gap-2">
          <canvas
            ref={wheelRef}
            className="cursor-crosshair rounded-full"
            style={{ width: 180, height: 180 }}
            onClick={handleWheelClick}
          />
          <div className="text-[9px] text-gray-600">Click to select base color</div>
        </div>

        {/* Lightness */}
        <div className="adj-row">
          <div className="adj-row-header">
            <span className="adj-label">Lightness</span>
            <span className="adj-value">{lightness}%</span>
          </div>
          <div className="relative">
            <div className="absolute inset-0 h-[3px] top-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{ background: `linear-gradient(to right, #000, hsl(${hue}, ${saturation}%, 50%), #fff)` }} />
            <input type="range" min={10} max={90} value={lightness}
              onChange={(e) => setLightness(Number(e.target.value))}
              className="relative w-full" style={{ background: "transparent" }} />
          </div>
        </div>

        {/* Harmony mode */}
        <div>
          <div className="panel-section-header">HARMONY TYPE</div>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {MODES.map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`py-1.5 px-2 text-[10px] capitalize rounded-lg transition-all text-left ${
                  mode === m ? "bg-violet-700 text-white" : "bg-[hsl(220_15%_13%)] text-gray-500 hover:text-white"
                }`}>{m.replace("-", " ")}</button>
            ))}
          </div>
        </div>

        {/* Palette swatches */}
        <div>
          <div className="panel-section-header">GENERATED PALETTE</div>
          <div className="flex gap-1 mt-2">
            {harmonies.map(([h, s, l], i) => {
              const hex = hslToHex(h, s, l);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <button
                    onClick={() => { setBaseColor(hex); setBrushColor(hex); }}
                    className="w-full rounded-lg hover:scale-105 transition-all border-2 border-transparent hover:border-white/30"
                    style={{ background: hex, height: 48 }}
                    title={`${hex} — Click to use`}
                  />
                  <span className="text-[8px] text-gray-600 font-mono">{hex.slice(1)}</span>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => harmonies.forEach(([h, s, l]) => {})}
            className="w-full mt-2 py-1.5 text-[10px] text-gray-500 hover:text-violet-400 transition-all text-center"
          >
            Click any color to set as brush color →
          </button>
        </div>

        {/* Base color input */}
        <div>
          <div className="panel-section-header">BASE COLOR</div>
          <div className="flex gap-2 mt-1 items-center">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => { setBaseColor(e.target.value); const [, s, l] = hexToHsl(e.target.value); setSaturation(s); setLightness(l); }}
              className="w-10 h-8 rounded border-0 cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={baseColor}
              onChange={(e) => e.target.value.match(/^#[0-9a-fA-F]{6}$/) && setBaseColor(e.target.value)}
              className="flex-1 bg-[hsl(222_18%_11%)] border border-[hsl(220_15%_18%)] text-xs text-white rounded-md px-2 py-1.5 outline-none font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
