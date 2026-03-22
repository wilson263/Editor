import { useState, useCallback } from "react";
import { useEditorStore } from "@/lib/editorStore";
import { generateId } from "@/lib/imageUtils";
import {
  Zap, Wind, Radio, Circle, Palette, Camera, Monitor,
  ChevronDown, ChevronRight, RotateCcw, Play, Check, AlertCircle
} from "lucide-react";

interface EffectSliderProps {
  label: string; value: number; min?: number; max?: number;
  onChange: (v: number) => void; unit?: string;
}
function EffectSlider({ label, value, min = 0, max = 100, onChange, unit = "" }: EffectSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-1 group">
      <div className="flex justify-between">
        <span className="text-[10px] text-gray-400">{label}</span>
        <div className="flex items-center gap-1">
          {value !== 0 && (
            <button onClick={() => onChange(0)} className="opacity-0 group-hover:opacity-100 text-[8px] text-gray-600 hover:text-violet-400 transition-all">×</button>
          )}
          <span className="text-[10px] text-white font-mono">{value}{unit}</span>
        </div>
      </div>
      <div className="relative">
        <div className="absolute inset-0 h-[3px] top-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{ background: `linear-gradient(to right, hsl(258 90% 66% / 0.6) 0%, hsl(258 90% 66% / 0.6) ${pct}%, hsl(220 15% 20%) ${pct}%)` }} />
        <input type="range" min={min} max={max} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative w-full" style={{ background: "transparent" }} />
      </div>
    </div>
  );
}

interface SectionProps { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; color?: string; }
function Section({ title, icon, children, defaultOpen = false, color = "text-violet-400" }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[hsl(220_15%_14%)] last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[hsl(220_15%_13%)] transition-all">
        <span className={color}>{icon}</span>
        <span className="text-[11px] font-bold text-white flex-1 text-left">{title}</span>
        {open ? <ChevronDown size={10} className="text-gray-600" /> : <ChevronRight size={10} className="text-gray-600" />}
      </button>
      {open && <div className="px-3 pb-3 flex flex-col gap-2">{children}</div>}
    </div>
  );
}

function applyMotionBlur(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, distance: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  const dx = Math.cos(radians) * distance;
  const dy = Math.sin(radians) * distance;
  const steps = Math.ceil(distance / 2);
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width; tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext("2d")!;
  tempCtx.drawImage(canvas, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    ctx.globalAlpha = 1 / steps;
    ctx.drawImage(tempCanvas, dx * t - dx / 2, dy * t - dy / 2);
  }
  ctx.globalAlpha = 1;
}

function applyChromaticAberration(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, amount: number) {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const copy = new Uint8ClampedArray(imgData.data);
  const w = canvas.width;
  const shift = Math.round(amount * 0.1);
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * w + x) * 4;
      const ri = (y * w + Math.max(0, x - shift)) * 4;
      const bi = (y * w + Math.min(w - 1, x + shift)) * 4;
      imgData.data[i] = copy[ri];
      imgData.data[i + 2] = copy[bi + 2];
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function applyHalftone(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dotSize: number, spacing: number) {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const step = spacing + dotSize;
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const i = (Math.min(y, canvas.height - 1) * canvas.width + Math.min(x, canvas.width - 1)) * 4;
      const lum = (imgData.data[i] * 0.299 + imgData.data[i + 1] * 0.587 + imgData.data[i + 2] * 0.114) / 255;
      const r = (1 - lum) * dotSize;
      if (r > 0.5) {
        ctx.beginPath();
        ctx.arc(x + step / 2, y + step / 2, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${imgData.data[i]},${imgData.data[i + 1]},${imgData.data[i + 2]},1)`;
        ctx.fill();
      }
    }
  }
}

function applyGlitch(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, intensity: number) {
  const slices = Math.round(intensity / 10) + 3;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < slices; i++) {
    const y = Math.floor(Math.random() * canvas.height);
    const h = Math.floor(Math.random() * 20 + 5);
    const offset = Math.floor((Math.random() - 0.5) * intensity * 2);
    const slice = ctx.getImageData(0, y, canvas.width, Math.min(h, canvas.height - y));
    ctx.putImageData(slice, offset, y);
  }
  // RGB shift on random rows
  for (let i = 0; i < 3; i++) {
    const y = Math.floor(Math.random() * canvas.height);
    const h = Math.floor(Math.random() * 8 + 2);
    const safe = Math.min(h, canvas.height - y);
    if (safe <= 0) continue;
    const slice = ctx.getImageData(0, y, canvas.width, safe);
    const d = slice.data;
    const shift = Math.floor(Math.random() * 10 + 3);
    for (let p = 0; p < d.length; p += 4) {
      const xi = (p / 4) % canvas.width;
      const ri = Math.min(xi + shift, canvas.width - 1) * 4 + Math.floor(p / (canvas.width * 4)) * canvas.width * 4;
      if (ri < d.length) d[p] = d[ri];
    }
    ctx.putImageData(slice, 0, y);
  }
}

function applyDuotone(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, color1: string, color2: string) {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const hex1 = color1.replace("#", "");
  const hex2 = color2.replace("#", "");
  const r1 = parseInt(hex1.slice(0, 2), 16), g1 = parseInt(hex1.slice(2, 4), 16), b1 = parseInt(hex1.slice(4, 6), 16);
  const r2 = parseInt(hex2.slice(0, 2), 16), g2 = parseInt(hex2.slice(2, 4), 16), b2 = parseInt(hex2.slice(4, 6), 16);
  for (let i = 0; i < data.length; i += 4) {
    const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
    data[i] = Math.round(r1 + (r2 - r1) * lum);
    data[i + 1] = Math.round(g1 + (g2 - g1) * lum);
    data[i + 2] = Math.round(b1 + (b2 - b1) * lum);
  }
  ctx.putImageData(imgData, 0, 0);
}

function applyPixelate(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, pixelSize: number) {
  if (pixelSize < 2) return;
  const w = canvas.width, h = canvas.height;
  for (let y = 0; y < h; y += pixelSize) {
    for (let x = 0; x < w; x += pixelSize) {
      const pw = Math.min(pixelSize, w - x), ph = Math.min(pixelSize, h - y);
      const imgData = ctx.getImageData(x, y, pw, ph);
      const d = imgData.data;
      let r = 0, g = 0, b = 0, cnt = 0;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; cnt++; }
      r /= cnt; g /= cnt; b /= cnt;
      ctx.fillStyle = `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
      ctx.fillRect(x, y, pw, ph);
    }
  }
}

function applyOilPaint(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, radius: number) {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const out = ctx.createImageData(canvas.width, canvas.height);
  const d = imgData.data, od = out.data;
  const w = canvas.width, h = canvas.height;
  const intensityLevels = 32;
  for (let y = radius; y < h - radius; y++) {
    for (let x = radius; x < w - radius; x++) {
      const intensityCount = new Array(intensityLevels).fill(0);
      const rSum = new Array(intensityLevels).fill(0);
      const gSum = new Array(intensityLevels).fill(0);
      const bSum = new Array(intensityLevels).fill(0);
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const i = ((y + ky) * w + (x + kx)) * 4;
          const intensity = Math.round(((d[i] + d[i+1] + d[i+2]) / 3 / 255) * (intensityLevels - 1));
          intensityCount[intensity]++;
          rSum[intensity] += d[i];
          gSum[intensity] += d[i+1];
          bSum[intensity] += d[i+2];
        }
      }
      let maxCount = 0, maxIdx = 0;
      for (let k = 0; k < intensityLevels; k++) {
        if (intensityCount[k] > maxCount) { maxCount = intensityCount[k]; maxIdx = k; }
      }
      const oi = (y * w + x) * 4;
      od[oi] = rSum[maxIdx] / maxCount;
      od[oi+1] = gSum[maxIdx] / maxCount;
      od[oi+2] = bSum[maxIdx] / maxCount;
      od[oi+3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
}

export default function EffectsPanel() {
  const { sourceImage, setSourceImage } = useEditorStore();

  // Motion blur
  const [mbDistance, setMbDistance] = useState(0);
  const [mbAngle, setMbAngle] = useState(0);

  // Radial/zoom blur
  const [zoomBlur, setZoomBlur] = useState(0);

  // Chromatic aberration
  const [chromatic, setChromatic] = useState(0);

  // Halftone
  const [halftoneDot, setHalftoneDot] = useState(6);
  const [halftoneSpacing, setHalftoneSpacing] = useState(4);
  const [halftoneEnabled, setHalftoneEnabled] = useState(false);

  // Glitch
  const [glitchIntensity, setGlitchIntensity] = useState(0);

  // Duotone
  const [duotoneColor1, setDuotoneColor1] = useState("#1a1a3e");
  const [duotoneColor2, setDuotoneColor2] = useState("#ff6b6b");
  const [duotoneEnabled, setDuotoneEnabled] = useState(false);

  // Pixelate
  const [pixelSize, setPixelSize] = useState(1);

  // Oil paint
  const [oilRadius, setOilRadius] = useState(0);

  // Vignette
  const [vignetteSoft, setVignetteSoft] = useState(0);
  const [vignetteColor, setVignetteColor] = useState("#000000");

  // Lens flare
  const [lensFlare, setLensFlare] = useState(false);
  const [flareX, setFlareX] = useState(20);
  const [flareY, setFlareY] = useState(20);

  // Applying state
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Record<string, boolean>>({});

  async function applyEffect(id: string, fn: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void) {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setApplying(id);
    await new Promise(r => setTimeout(r, 50));
    fn(ctx, canvas);
    setSourceImage(canvas.toDataURL("image/png"));
    setApplying(null);
    setApplied(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setApplied(prev => { const n = {...prev}; delete n[id]; return n; }), 2000);
  }

  const ApplyBtn = ({ id, onClick, label = "Apply" }: { id: string; onClick: () => void; label?: string }) => (
    <button
      onClick={onClick}
      disabled={!sourceImage || applying === id}
      className="mt-1 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-violet-700/40 hover:bg-violet-700/60 border border-violet-600/30 text-[11px] font-semibold text-violet-300 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {applying === id ? (
        <div className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
      ) : applied[id] ? (
        <Check size={11} className="text-green-400" />
      ) : (
        <Play size={11} />
      )}
      {applying === id ? "Applying..." : applied[id] ? "Applied!" : label}
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(220_15%_14%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Zap size={11} className="text-white" />
          </div>
          <span className="text-xs font-bold text-white">Creative Effects</span>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">Destructive effects applied directly to canvas</p>
      </div>

      {!sourceImage && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-700/30 shrink-0">
          <div className="flex items-center gap-2"><AlertCircle size={12} className="text-amber-400 shrink-0" /><p className="text-[10px] text-amber-400">Upload an image to apply effects</p></div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <Section title="Motion Blur" icon={<Wind size={13} />} defaultOpen={true} color="text-blue-400">
          <EffectSlider label="Distance" value={mbDistance} min={0} max={60} onChange={setMbDistance} unit="px" />
          <EffectSlider label="Angle" value={mbAngle} min={0} max={360} onChange={setMbAngle} unit="°" />
          <ApplyBtn id="motion-blur" label="Apply Motion Blur"
            onClick={() => applyEffect("motion-blur", (ctx, cv) => applyMotionBlur(ctx, cv, mbDistance, mbAngle))} />
        </Section>

        <Section title="Chromatic Aberration" icon={<Radio size={13} />} color="text-red-400">
          <EffectSlider label="Shift Amount" value={chromatic} min={0} max={100} onChange={setChromatic} />
          <div className="text-[9px] text-gray-600 -mt-1">Splits RGB channels for lens fringing effect</div>
          <ApplyBtn id="chromatic" label="Apply Aberration"
            onClick={() => applyEffect("chromatic", (ctx, cv) => applyChromaticAberration(ctx, cv, chromatic))} />
        </Section>

        <Section title="Halftone" icon={<Circle size={13} />} color="text-yellow-400">
          <EffectSlider label="Dot Size" value={halftoneDot} min={2} max={20} onChange={setHalftoneDot} unit="px" />
          <EffectSlider label="Spacing" value={halftoneSpacing} min={1} max={15} onChange={setHalftoneSpacing} unit="px" />
          <ApplyBtn id="halftone" label="Apply Halftone"
            onClick={() => applyEffect("halftone", (ctx, cv) => applyHalftone(ctx, cv, halftoneDot, halftoneSpacing))} />
        </Section>

        <Section title="Glitch" icon={<Monitor size={13} />} color="text-cyan-400">
          <EffectSlider label="Intensity" value={glitchIntensity} min={0} max={100} onChange={setGlitchIntensity} />
          <ApplyBtn id="glitch" label="Apply Glitch Effect"
            onClick={() => applyEffect("glitch", (ctx, cv) => applyGlitch(ctx, cv, glitchIntensity))} />
        </Section>

        <Section title="Duotone" icon={<Palette size={13} />} color="text-pink-400">
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="text-[9px] text-gray-500 mb-1">Shadow Color</div>
              <input type="color" value={duotoneColor1} onChange={(e) => setDuotoneColor1(e.target.value)}
                className="w-full h-8 rounded-lg cursor-pointer border border-[hsl(220_15%_22%)]" />
            </div>
            <div className="flex-1">
              <div className="text-[9px] text-gray-500 mb-1">Highlight Color</div>
              <input type="color" value={duotoneColor2} onChange={(e) => setDuotoneColor2(e.target.value)}
                className="w-full h-8 rounded-lg cursor-pointer border border-[hsl(220_15%_22%)]" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[
              { c1: "#1a1a3e", c2: "#ff6b6b", name: "Violet/Red" },
              { c1: "#004d40", c2: "#ffeb3b", name: "Teal/Gold" },
              { c1: "#1a0533", c2: "#00e5ff", name: "Purple/Cyan" },
              { c1: "#1b0000", c2: "#ff8c00", name: "Noir/Orange" },
              { c1: "#003300", c2: "#ff1744", name: "Dark/Rose" },
              { c1: "#0d0d0d", c2: "#e8d5b7", name: "Coal/Sepia" },
            ].map((preset) => (
              <button key={preset.name}
                onClick={() => { setDuotoneColor1(preset.c1); setDuotoneColor2(preset.c2); }}
                className="h-8 rounded-lg border border-[hsl(220_15%_20%)] hover:border-violet-500 transition-all overflow-hidden relative"
                title={preset.name}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1/2" style={{ background: preset.c1 }} />
                <div className="absolute right-0 top-0 bottom-0 w-1/2" style={{ background: preset.c2 }} />
              </button>
            ))}
          </div>
          <ApplyBtn id="duotone" label="Apply Duotone"
            onClick={() => applyEffect("duotone", (ctx, cv) => applyDuotone(ctx, cv, duotoneColor1, duotoneColor2))} />
        </Section>

        <Section title="Pixelate" icon={<Camera size={13} />} color="text-orange-400">
          <EffectSlider label="Pixel Size" value={pixelSize} min={1} max={40} onChange={setPixelSize} unit="px" />
          <ApplyBtn id="pixelate" label="Apply Pixelate"
            onClick={() => applyEffect("pixelate", (ctx, cv) => applyPixelate(ctx, cv, pixelSize))} />
        </Section>

        <Section title="Oil Paint" icon={<Palette size={13} />} color="text-amber-400">
          <EffectSlider label="Brush Radius" value={oilRadius} min={1} max={6} onChange={setOilRadius} />
          <div className="text-[9px] text-gray-600 -mt-1">⚠️ Slower on large images</div>
          <ApplyBtn id="oil" label="Apply Oil Paint"
            onClick={() => applyEffect("oil", (ctx, cv) => applyOilPaint(ctx, cv, Math.max(1, oilRadius)))} />
        </Section>

        <Section title="Vignette" icon={<Circle size={13} />} color="text-gray-400">
          <EffectSlider label="Strength" value={vignetteSoft} min={0} max={100} onChange={setVignetteSoft} />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400">Color</span>
            <input type="color" value={vignetteColor} onChange={(e) => setVignetteColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border border-[hsl(220_15%_22%)]" />
          </div>
          <ApplyBtn id="vignette" label="Apply Vignette"
            onClick={() => applyEffect("vignette", (ctx, cv) => {
              const hex = vignetteColor.replace("#", "");
              const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
              const gradient = ctx.createRadialGradient(cv.width/2, cv.height/2, Math.min(cv.width, cv.height)*0.25, cv.width/2, cv.height/2, Math.max(cv.width, cv.height)*0.75);
              gradient.addColorStop(0, "transparent");
              gradient.addColorStop(1, `rgba(${r},${g},${b},${vignetteSoft / 100 * 0.9})`);
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, cv.width, cv.height);
            })} />
        </Section>
      </div>
    </div>
  );
}
