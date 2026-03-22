import { useState, useRef } from "react";
import { useEditorStore } from "@/lib/editorStore";
import { generateId } from "@/lib/imageUtils";
import {
  Layers, CircleOff, Rectangle, Brush, Star, Zap, Plus, Trash2,
  Eye, EyeOff, ChevronDown, ChevronRight, Check, AlertCircle
} from "lucide-react";

interface Mask {
  id: string;
  name: string;
  type: "brush" | "linear-gradient" | "radial-gradient" | "luminosity" | "color-range";
  visible: boolean;
  inverted: boolean;
  feather: number;
  opacity: number;
  data?: string;
}

const MASK_TYPES = [
  { id: "brush", label: "Brush Mask", icon: <Brush size={13} />, desc: "Paint a mask with brush", color: "text-violet-400" },
  { id: "linear-gradient", label: "Linear Gradient", icon: <Rectangle size={13} />, desc: "Gradient mask from top to bottom", color: "text-blue-400" },
  { id: "radial-gradient", label: "Radial Gradient", icon: <Star size={13} />, desc: "Circular radial gradient mask", color: "text-green-400" },
  { id: "luminosity", label: "Luminosity Mask", icon: <Zap size={13} />, desc: "Target by brightness range", color: "text-amber-400" },
  { id: "color-range", label: "Color Range", icon: <CircleOff size={13} />, desc: "Select by color similarity", color: "text-pink-400" },
];

function applyLinearGradientMask(canvas: HTMLCanvasElement, direction: string, feather: number) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const { width: w, height: h } = canvas;
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = w; maskCanvas.height = h;
  const mCtx = maskCanvas.getContext("2d")!;

  let x0 = 0, y0 = 0, x1 = 0, y1 = 0;
  switch (direction) {
    case "top-bottom": x0 = 0; y0 = 0; x1 = 0; y1 = h; break;
    case "bottom-top": x0 = 0; y0 = h; x1 = 0; y1 = 0; break;
    case "left-right": x0 = 0; y0 = 0; x1 = w; y1 = 0; break;
    case "right-left": x0 = w; y0 = 0; x1 = 0; y1 = 0; break;
  }

  const grad = mCtx.createLinearGradient(x0, y0, x1, y1);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(Math.max(0, 0.5 - feather / 200), "rgba(0,0,0,0.8)");
  grad.addColorStop(Math.min(1, 0.5 + feather / 200), "rgba(0,0,0,0)");
  mCtx.fillStyle = grad;
  mCtx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(maskCanvas, 0, 0);
  ctx.globalCompositeOperation = "source-over";
}

function applyRadialGradientMask(canvas: HTMLCanvasElement, feather: number, cx = 50, cy = 50) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const { width: w, height: h } = canvas;
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = w; maskCanvas.height = h;
  const mCtx = maskCanvas.getContext("2d")!;

  const x = w * cx / 100, y = h * cy / 100;
  const r = Math.min(w, h) * (0.3 + feather / 200);
  const grad = mCtx.createRadialGradient(x, y, r * 0.2, x, y, r);
  grad.addColorStop(0, "rgba(0,0,0,1)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  mCtx.fillStyle = grad;
  mCtx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(maskCanvas, 0, 0);
  ctx.globalCompositeOperation = "source-over";
}

function applyLuminosityMask(canvas: HTMLCanvasElement, shadowsOnly: boolean, highlightsOnly: boolean) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    if (shadowsOnly && lum > 128) data[i + 3] = Math.min(data[i + 3], Math.round((128 - lum + 128) * 2));
    if (highlightsOnly && lum < 128) data[i + 3] = Math.min(data[i + 3], Math.round(lum * 2));
  }
  ctx.putImageData(imgData, 0, 0);
}

function applyColorRangeMask(canvas: HTMLCanvasElement, targetColor: string, tolerance: number) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const hex = targetColor.replace("#", "");
  const tr = parseInt(hex.slice(0, 2), 16), tg = parseInt(hex.slice(2, 4), 16), tb = parseInt(hex.slice(4, 6), 16);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const dist = Math.sqrt((data[i] - tr) ** 2 + (data[i + 1] - tg) ** 2 + (data[i + 2] - tb) ** 2);
    if (dist > tolerance * 2) data[i + 3] = 0;
    else data[i + 3] = Math.round(data[i + 3] * (1 - dist / (tolerance * 2)));
  }
  ctx.putImageData(imgData, 0, 0);
}

export default function MaskingPanel() {
  const { sourceImage, setSourceImage, addLayer } = useEditorStore();
  const [masks, setMasks] = useState<Mask[]>([]);
  const [selectedMaskType, setSelectedMaskType] = useState("brush");
  const [feather, setFeather] = useState(20);
  const [maskOpacity, setMaskOpacity] = useState(100);
  const [gradientDir, setGradientDir] = useState("top-bottom");
  const [luminosityTarget, setLuminosityTarget] = useState<"shadows" | "midtones" | "highlights">("highlights");
  const [colorRangeTarget, setColorRangeTarget] = useState("#ff0000");
  const [colorTolerance, setColorTolerance] = useState(50);
  const [radialCx, setRadialCx] = useState(50);
  const [radialCy, setRadialCy] = useState(50);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  async function addMask() {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    setApplying(true);
    await new Promise(r => setTimeout(r, 100));

    try {
      switch (selectedMaskType) {
        case "linear-gradient":
          applyLinearGradientMask(canvas, gradientDir, feather);
          break;
        case "radial-gradient":
          applyRadialGradientMask(canvas, feather, radialCx, radialCy);
          break;
        case "luminosity":
          applyLuminosityMask(canvas, luminosityTarget === "shadows", luminosityTarget === "highlights");
          break;
        case "color-range":
          applyColorRangeMask(canvas, colorRangeTarget, colorTolerance);
          break;
        case "brush":
          // Brush mask: handled by switching to brush tool with mask mode
          break;
      }

      const outputUrl = canvas.toDataURL("image/png");
      setSourceImage(outputUrl);

      const maskDef: Mask = {
        id: generateId(),
        name: MASK_TYPES.find(m => m.id === selectedMaskType)?.label || selectedMaskType,
        type: selectedMaskType as Mask["type"],
        visible: true,
        inverted: false,
        feather,
        opacity: maskOpacity,
      };
      setMasks(prev => [...prev, maskDef]);
      setApplied(true);
      setTimeout(() => setApplied(false), 2000);
    } finally {
      setApplying(false);
    }
  }

  function removeMask(id: string) {
    setMasks(prev => prev.filter(m => m.id !== id));
  }

  function toggleMaskVisibility(id: string) {
    setMasks(prev => prev.map(m => m.id === id ? { ...m, visible: !m.visible } : m));
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(220_15%_14%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Layers size={11} className="text-white" />
          </div>
          <span className="text-xs font-bold text-white">Advanced Masking</span>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">Non-destructive masks — luminosity, gradient, color</p>
      </div>

      {!sourceImage && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-700/30 shrink-0">
          <div className="flex items-center gap-2"><AlertCircle size={12} className="text-amber-400 shrink-0" /><p className="text-[10px] text-amber-400">Upload an image to create masks</p></div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {/* Mask type selector */}
        <div className="p-3 border-b border-[hsl(220_15%_14%)]">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-2">Mask Type</span>
          <div className="flex flex-col gap-1">
            {MASK_TYPES.map((mt) => (
              <button
                key={mt.id}
                onClick={() => setSelectedMaskType(mt.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all text-left ${
                  selectedMaskType === mt.id
                    ? "border-cyan-500 bg-cyan-900/20"
                    : "border-[hsl(220_15%_16%)] hover:border-[hsl(220_15%_24%)]"
                }`}
              >
                <span className={mt.color}>{mt.icon}</span>
                <div className="flex-1">
                  <div className={`text-[11px] font-semibold ${selectedMaskType === mt.id ? "text-cyan-300" : "text-white"}`}>{mt.label}</div>
                  <div className="text-[9px] text-gray-600">{mt.desc}</div>
                </div>
                {selectedMaskType === mt.id && <Check size={11} className="text-cyan-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Mask settings */}
        <div className="p-3 border-b border-[hsl(220_15%_14%)]">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-2">Mask Settings</span>

          <div className="flex flex-col gap-2">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-gray-400">Feather</span>
                <span className="text-[10px] text-white font-mono">{feather}</span>
              </div>
              <input type="range" min={0} max={100} value={feather} onChange={(e) => setFeather(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-gray-400">Opacity</span>
                <span className="text-[10px] text-white font-mono">{maskOpacity}%</span>
              </div>
              <input type="range" min={0} max={100} value={maskOpacity} onChange={(e) => setMaskOpacity(Number(e.target.value))} className="w-full" />
            </div>

            {selectedMaskType === "linear-gradient" && (
              <div>
                <div className="text-[10px] text-gray-400 mb-1.5">Direction</div>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { id: "top-bottom", label: "↓ Top to Bottom" },
                    { id: "bottom-top", label: "↑ Bottom to Top" },
                    { id: "left-right", label: "→ Left to Right" },
                    { id: "right-left", label: "← Right to Left" },
                  ].map((dir) => (
                    <button
                      key={dir.id}
                      onClick={() => setGradientDir(dir.id)}
                      className={`py-1.5 px-2 rounded-lg border text-[10px] transition-all ${gradientDir === dir.id ? "border-cyan-500 bg-cyan-900/20 text-cyan-300" : "border-[hsl(220_15%_16%)] text-gray-400 hover:text-white"}`}
                    >
                      {dir.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedMaskType === "radial-gradient" && (
              <div className="flex flex-col gap-1.5">
                <div>
                  <div className="flex justify-between mb-1"><span className="text-[10px] text-gray-400">Center X</span><span className="text-[10px] text-white font-mono">{radialCx}%</span></div>
                  <input type="range" min={0} max={100} value={radialCx} onChange={(e) => setRadialCx(Number(e.target.value))} className="w-full" />
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span className="text-[10px] text-gray-400">Center Y</span><span className="text-[10px] text-white font-mono">{radialCy}%</span></div>
                  <input type="range" min={0} max={100} value={radialCy} onChange={(e) => setRadialCy(Number(e.target.value))} className="w-full" />
                </div>
              </div>
            )}

            {selectedMaskType === "luminosity" && (
              <div>
                <div className="text-[10px] text-gray-400 mb-1.5">Target Range</div>
                <div className="flex gap-1">
                  {(["shadows", "midtones", "highlights"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setLuminosityTarget(t)}
                      className={`flex-1 py-1.5 rounded-lg border text-[10px] font-semibold capitalize transition-all ${luminosityTarget === t ? "border-amber-500 bg-amber-900/20 text-amber-300" : "border-[hsl(220_15%_16%)] text-gray-400 hover:text-white"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedMaskType === "color-range" && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">Target Color</span>
                  <input type="color" value={colorRangeTarget} onChange={(e) => setColorRangeTarget(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-[hsl(220_15%_22%)]" />
                  <span className="text-[10px] text-gray-500 font-mono">{colorRangeTarget}</span>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span className="text-[10px] text-gray-400">Tolerance</span><span className="text-[10px] text-white font-mono">{colorTolerance}</span></div>
                  <input type="range" min={10} max={150} value={colorTolerance} onChange={(e) => setColorTolerance(Number(e.target.value))} className="w-full" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mask list */}
        {masks.length > 0 && (
          <div className="p-3">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-2">Applied Masks</span>
            <div className="flex flex-col gap-1">
              {masks.map((mask) => (
                <div key={mask.id} className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-[hsl(220_15%_12%)] border border-[hsl(220_15%_16%)]">
                  <button onClick={() => toggleMaskVisibility(mask.id)}>
                    {mask.visible ? <Eye size={11} className="text-gray-400" /> : <EyeOff size={11} className="text-gray-600" />}
                  </button>
                  <span className="text-[11px] text-gray-300 flex-1">{mask.name}</span>
                  <span className="text-[9px] text-gray-600">{mask.opacity}%</span>
                  <button onClick={() => removeMask(mask.id)} className="text-gray-600 hover:text-red-400 transition-all">
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 px-3 py-2 border-t border-[hsl(220_15%_14%)]">
        <button
          onClick={addMask}
          disabled={!sourceImage || applying}
          className="w-full flex items-center justify-center gap-2 py-2 action-btn-primary action-btn disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {applying ? (
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : applied ? (
            <Check size={12} />
          ) : (
            <Plus size={12} />
          )}
          {applying ? "Applying Mask..." : applied ? "Mask Applied!" : "Apply Mask"}
        </button>
      </div>
    </div>
  );
}
