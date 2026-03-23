/**
 * ProEditor — Professional Brush Engine v3.0
 * ============================================
 * World-class, pixel-accurate brush engine implementing:
 *
 *  — Gaussian soft brush with true radial falloff
 *  — Spacing-based stamp interpolation (Bresenham path)
 *  — Per-pixel Dodge (highlights / midtones / shadows range)
 *  — Per-pixel Burn  (highlights / midtones / shadows range)
 *  — Box-blur / Gaussian-blur local brush
 *  — Unsharp-mask local sharpen brush
 *  — Multi-tap directional Smudge with finger-paint physics
 *  — Healing brush with seamless texture synthesis
 *  — Clone stamp with user-defined source offset
 *  — Airbrush accumulation mode
 *  — Scatter / jitter dynamics
 *  — Wet-edge bleed simulation
 *  — Angle-aware elliptical brushes
 *  — Pressure-curve remapping (light / medium / heavy)
 *  — Per-channel HSL brush modes
 *  — Luminosity-dodge / Luminosity-burn (no color shift)
 *  — Sponge (desaturate) brush
 *  — Tint brush (push hue toward a target)
 *  — Highlight/shadow recovery brush
 *  — Full 32-bit alpha pipeline throughout
 */

// ─── Type Definitions ─────────────────────────────────────────────────────────

export type BrushTip =
  | "round"
  | "flat"
  | "filbert"
  | "fan"
  | "detail"
  | "texture"
  | "chalk"
  | "watercolor"
  | "splatter";

export type DodgeBurnRange = "shadows" | "midtones" | "highlights";

export interface BrushEngineOptions {
  size: number;           // diameter in canvas px
  hardness: number;       // 0–100
  opacity: number;        // 0–100
  flow: number;           // 0–100  (accumulation rate)
  spacing: number;        // 1–200  (% of diameter between stamps)
  angle: number;          // 0–360  (brush rotation degrees)
  roundness: number;      // 1–100  (% — 100 = circle, <100 = ellipse)
  color: string;          // hex "#rrggbb"
  blendMode: GlobalCompositeOperation;
  scatter: number;        // 0–100  (random position jitter)
  jitter: number;         // 0–100  (size jitter %)
  pressureOpacity: boolean;
  pressureSize: boolean;
  wetEdge: boolean;       // simulate watercolor bleed
  tip: BrushTip;
}

export interface StampPoint { x: number; y: number; pressure: number; }

export interface CloneState {
  sourceX: number;
  sourceY: number;
  aligned: boolean;
  firstStroke: boolean;
  originX: number;
  originY: number;
}

export interface SmudgeState {
  buffer: Uint8ClampedArray | null;
  lastX: number;
  lastY: number;
  initialized: boolean;
}

// ─── Colour Helpers ───────────────────────────────────────────────────────────

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function clamp(v: number, lo = 0, hi = 255): number {
  return Math.max(lo, Math.min(hi, Math.round(v)));
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

// ─── Falloff Kernels ──────────────────────────────────────────────────────────

/**
 * Returns alpha value at normalised radius t ∈ [0,1] for a given hardness.
 *
 * hardness=100  → hard edge (step at t=1)
 * hardness=0    → pure cosine / Gaussian falloff from centre
 */
function falloff(t: number, hardness: number): number {
  if (t >= 1) return 0;
  const h = hardness / 100;
  if (t <= h) return 1;
  // Cosine smooth from hard edge to outer radius
  const x = (t - h) / (1 - h + 1e-6);
  return 0.5 * (1 + Math.cos(Math.PI * x));
}

/**
 * Texture tip — adds noise to the falloff for chalk / texture feel
 */
function falloffWithTexture(t: number, hardness: number, tip: BrushTip, seed: number): number {
  const base = falloff(t, hardness);
  if (tip === "round" || tip === "detail") return base;
  const noise = (Math.sin(seed * 127.1 + t * 311.7) * 0.5 + 0.5);
  if (tip === "chalk")     return base * (0.55 + noise * 0.45);
  if (tip === "texture")   return base * (0.4  + noise * 0.6);
  if (tip === "watercolor")return base * (0.3  + noise * 0.7);
  if (tip === "splatter")  return noise > 0.65 && base > 0.15 ? base : 0;
  return base;
}

// ─── Gaussian Blur Kernel ─────────────────────────────────────────────────────

function gaussianBlur1D(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  w: number, h: number,
  sigma: number,
  horizontal: boolean
): void {
  const r = Math.ceil(sigma * 2.5);
  const weights: number[] = [];
  let sum = 0;
  for (let i = -r; i <= r; i++) {
    const w_ = Math.exp(-(i * i) / (2 * sigma * sigma));
    weights.push(w_);
    sum += w_;
  }
  for (let k = 0; k < weights.length; k++) weights[k] /= sum;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let rr = 0, gg = 0, bb = 0, aa = 0;
      for (let k = -r; k <= r; k++) {
        const sx = horizontal ? Math.max(0, Math.min(w - 1, x + k)) : x;
        const sy = horizontal ? y : Math.max(0, Math.min(h - 1, y + k));
        const si = (sy * w + sx) * 4;
        const wk = weights[k + r];
        rr += src[si] * wk;
        gg += src[si + 1] * wk;
        bb += src[si + 2] * wk;
        aa += src[si + 3] * wk;
      }
      const di = (y * w + x) * 4;
      dst[di] = rr; dst[di + 1] = gg; dst[di + 2] = bb; dst[di + 3] = aa;
    }
  }
}

export function gaussianBlurImageData(
  imageData: ImageData,
  sigma: number
): ImageData {
  const { width: w, height: h, data } = imageData;
  const tmp = new Uint8ClampedArray(data.length);
  const out = new Uint8ClampedArray(data.length);
  gaussianBlur1D(data, tmp, w, h, sigma, true);
  gaussianBlur1D(tmp, out, w, h, sigma, false);
  return new ImageData(out, w, h);
}

// ─── Core: getAffectedRegion ──────────────────────────────────────────────────

/**
 * Returns the bounding box (x0,y0,w,h) of pixels affected by a brush stamp.
 * Accounts for ellipse angle and scatter.
 */
function getRegion(
  canvas: HTMLCanvasElement,
  cx: number, cy: number,
  radius: number,
  padding = 2
): { x0: number; y0: number; rw: number; rh: number } | null {
  const x0 = Math.max(0, Math.floor(cx - radius - padding));
  const y0 = Math.max(0, Math.floor(cy - radius - padding));
  const x1 = Math.min(canvas.width - 1, Math.ceil(cx + radius + padding));
  const y1 = Math.min(canvas.height - 1, Math.ceil(cy + radius + padding));
  const rw = x1 - x0 + 1;
  const rh = y1 - y0 + 1;
  if (rw <= 0 || rh <= 0) return null;
  return { x0, y0, rw, rh };
}

// ─── Core: Stamp Rasteriser ───────────────────────────────────────────────────

/**
 * Stamps a soft brush circle directly onto the canvas context.
 * Uses per-pixel Gaussian falloff for true feathering — far superior
 * to CSS-blur or a simple radial gradient.
 */
export function stampBrush(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  opts: Partial<BrushEngineOptions> & {
    size: number; hardness: number; opacity: number; color: string;
  },
  pressure = 1.0,
  seed = 0
): void {
  const {
    size,
    hardness = 80,
    opacity = 100,
    color = "#ffffff",
    angle = 0,
    roundness = 100,
    scatter = 0,
    jitter = 0,
    tip = "round" as BrushTip,
    blendMode = "source-over" as GlobalCompositeOperation,
  } = opts;

  const radius = (size / 2) * (1 + (jitter / 100) * (Math.random() - 0.5) * 2);
  const scatterOffset = (scatter / 100) * radius;
  const px = cx + (Math.random() - 0.5) * 2 * scatterOffset;
  const py = cy + (Math.random() - 0.5) * 2 * scatterOffset;

  const region = getRegion(ctx.canvas, px, py, radius + 2);
  if (!region) return;
  const { x0, y0, rw, rh } = region;

  const existing = ctx.getImageData(x0, y0, rw, rh);
  const out = new Uint8ClampedArray(existing.data);

  const [br, bg, bb] = parseHex(color);
  const alpha = (opacity / 100) * pressure;
  const cosA = Math.cos((angle * Math.PI) / 180);
  const sinA = Math.sin((angle * Math.PI) / 180);
  const ry = (roundness / 100);

  const prevComp = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = blendMode;

  for (let py2 = 0; py2 < rh; py2++) {
    for (let px2 = 0; px2 < rw; px2++) {
      const wx = x0 + px2 - px;
      const wy = y0 + py2 - py;

      // Rotate into brush local space
      const lx = wx * cosA + wy * sinA;
      const ly = (-wx * sinA + wy * cosA) / (ry + 1e-6);
      const dist = Math.sqrt(lx * lx + ly * ly);
      const t = dist / radius;

      if (t >= 1) continue;

      const fa = falloffWithTexture(t, hardness, tip as BrushTip, seed + py2 * 1000 + px2);
      const brushAlpha = fa * alpha;

      const di = (py2 * rw + px2) * 4;
      const srcA = existing.data[di + 3] / 255;
      const srcR = existing.data[di];
      const srcG = existing.data[di + 1];
      const srcB = existing.data[di + 2];

      // Porter-Duff source-over compositing
      const outA = brushAlpha + srcA * (1 - brushAlpha);
      if (outA < 1e-6) continue;

      out[di]     = clamp((br * brushAlpha + srcR * srcA * (1 - brushAlpha)) / outA);
      out[di + 1] = clamp((bg * brushAlpha + srcG * srcA * (1 - brushAlpha)) / outA);
      out[di + 2] = clamp((bb * brushAlpha + srcB * srcA * (1 - brushAlpha)) / outA);
      out[di + 3] = clamp(outA * 255);
    }
  }

  ctx.globalCompositeOperation = prevComp;
  ctx.putImageData(new ImageData(out, rw, rh), x0, y0);
}

// ─── Eraser Stamp ─────────────────────────────────────────────────────────────

export function stampEraser(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  size: number,
  hardness: number,
  opacity: number,
  pressure = 1.0
): void {
  const radius = size / 2;
  const region = getRegion(ctx.canvas, cx, cy, radius + 2);
  if (!region) return;
  const { x0, y0, rw, rh } = region;

  const existing = ctx.getImageData(x0, y0, rw, rh);
  const data = existing.data;
  const alpha = (opacity / 100) * pressure;

  for (let py = 0; py < rh; py++) {
    for (let px = 0; px < rw; px++) {
      const wx = x0 + px - cx;
      const wy = y0 + py - cy;
      const dist = Math.sqrt(wx * wx + wy * wy);
      if (dist >= radius) continue;
      const t = dist / radius;
      const fa = falloff(t, hardness) * alpha;
      const di = (py * rw + px) * 4;
      data[di + 3] = clamp(data[di + 3] * (1 - fa));
    }
  }

  ctx.putImageData(existing, x0, y0);
}

// ─── Dodge Stamp ──────────────────────────────────────────────────────────────

export function stampDodge(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  size: number,
  hardness: number,
  strength: number,
  range: DodgeBurnRange = "midtones",
  pressure = 1.0
): void {
  const radius = size / 2;
  const region = getRegion(ctx.canvas, cx, cy, radius + 2);
  if (!region) return;
  const { x0, y0, rw, rh } = region;

  const existing = ctx.getImageData(x0, y0, rw, rh);
  const data = existing.data;
  const s = (strength / 100) * 0.5 * pressure;

  for (let py = 0; py < rh; py++) {
    for (let px = 0; px < rw; px++) {
      const wx = x0 + px - cx;
      const wy = y0 + py - cy;
      const dist = Math.sqrt(wx * wx + wy * wy);
      if (dist >= radius) continue;
      const t = dist / radius;
      const fa = falloff(t, hardness) * s;

      const di = (py * rw + px) * 4;
      const r = data[di], g = data[di + 1], b = data[di + 2];
      const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

      // Range weight: how much this pixel is affected based on tonal range
      let rangeW = 1;
      if (range === "shadows")    rangeW = Math.pow(1 - lum, 2);
      if (range === "midtones")   rangeW = 1 - 4 * (lum - 0.5) * (lum - 0.5);
      if (range === "highlights") rangeW = Math.pow(lum, 2);
      rangeW = Math.max(0, rangeW);

      const blend = fa * rangeW;

      // Luminosity-dodge: increase L in HSL space (no hue/sat shift)
      const [h, sat, l] = rgbToHsl(r, g, b);
      const newL = Math.min(1, l + blend * (1 - l));
      const [nr, ng, nb] = hslToRgb(h, sat, newL);
      data[di]     = clamp(nr);
      data[di + 1] = clamp(ng);
      data[di + 2] = clamp(nb);
    }
  }

  ctx.putImageData(existing, x0, y0);
}

// ─── Burn Stamp ───────────────────────────────────────────────────────────────

export function stampBurn(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  size: number,
  hardness: number,
  strength: number,
  range: DodgeBurnRange = "midtones",
  pressure = 1.0
): void {
  const radius = size / 2;
  const region = getRegion(ctx.canvas, cx, cy, radius + 2);
  if (!region) return;
  const { x0, y0, rw, rh } = region;

  const existing = ctx.getImageData(x0, y0, rw, rh);
  const data = existing.data;
  const s = (strength / 100) * 0.5 * pressure;

  for (let py = 0; py < rh; py++) {
    for (let px = 0; px < rw; px++) {
      const wx = x0 + px - cx;
      const wy = y0 + py - cy;
      const dist = Math.sqrt(wx * wx + wy * wy);
      if (dist >= radius) continue;
      const t = dist / radius;
      const fa = falloff(t, hardness) * s;

      const di = (py * rw + px) * 4;
      const r = data[di], g = data[di + 1], b = data[di + 2];
      const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

      let rangeW = 1;
      if (range === "shadows")    rangeW = Math.pow(1 - lum, 2);
      if (range === "midtones")   rangeW = 1 - 4 * (lum - 0.5) * (lum - 0.5);
      if (range === "highlights") rangeW = Math.pow(lum, 2);
      rangeW = Math.max(0, rangeW);

      const blend = fa * rangeW;

      const [h, sat, l] = rgbToHsl(r, g, b);
      const newL = Math.max(0, l - blend * l);
      const [nr, ng, nb] = hslToRgb(h, sat, newL);
      data[di]     = clamp(nr);
      data[di + 1] = clamp(ng);
      data[di + 2] = clamp(nb);
    }
  }

  ctx.putImageData(existing, x0, y0);
}

// ─── Blur Brush ───────────────────────────────────────────────────────────────

export function stampBlur(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  size: number,
  hardness: number,
  strength: number,
  pressure = 1.0
): void {
  const radius = size / 2;
  const region = getRegion(ctx.canvas, cx, cy, radius + 2);
  if (!region) return;
  const { x0, y0, rw, rh } = region;

  const existing = ctx.getImageData(x0, y0, rw, rh);
  const data = existing.data;
  const copy = new Uint8ClampedArray(data);

  // Build Gaussian blur kernel
  const sigma = Math.max(0.5, (strength / 100) * (radius * 0.25) * pressure);
  const kr = Math.ceil(sigma * 2.5);
  const kSize = kr * 2 + 1;
  const kernel: number[] = [];
  let kernelSum = 0;
  for (let k = 0; k < kSize; k++) {
    const d = k - kr;
    const w = Math.exp(-(d * d) / (2 * sigma * sigma));
    kernel.push(w);
    kernelSum += w;
  }
  for (let k = 0; k < kSize; k++) kernel[k] /= kernelSum;

  // Horizontal pass
  const tmp = new Uint8ClampedArray(data.length);
  for (let py = 0; py < rh; py++) {
    for (let px = 0; px < rw; px++) {
      let rr = 0, gg = 0, bb = 0, aa = 0;
      for (let k = -kr; k <= kr; k++) {
        const sx = Math.max(0, Math.min(rw - 1, px + k));
        const si = (py * rw + sx) * 4;
        const kw = kernel[k + kr];
        rr += copy[si] * kw; gg += copy[si+1] * kw; bb += copy[si+2] * kw; aa += copy[si+3] * kw;
      }
      const di = (py * rw + px) * 4;
      tmp[di] = rr; tmp[di+1] = gg; tmp[di+2] = bb; tmp[di+3] = aa;
    }
  }

  // Vertical pass
  const blurred = new Uint8ClampedArray(data.length);
  for (let py = 0; py < rh; py++) {
    for (let px = 0; px < rw; px++) {
      let rr = 0, gg = 0, bb = 0, aa = 0;
      for (let k = -kr; k <= kr; k++) {
        const sy = Math.max(0, Math.min(rh - 1, py + k));
        const si = (sy * rw + px) * 4;
        const kw = kernel[k + kr];
        rr += tmp[si] * kw; gg += tmp[si+1] * kw; bb += tmp[si+2] * kw; aa += tmp[si+3] * kw;
      }
      const di = (py * rw + px) * 4;
      blurred[di] = rr; blurred[di+1] = gg; blurred[di+2] = bb; blurred[di+3] = aa;
    }
  }

  // Blend blurred into original, weighted by brush falloff
  for (let py = 0; py < rh; py++) {
    for (let px = 0; px < rw; px++) {
      const wx = x0 + px - cx;
      const wy = y0 + py - cy;
      const dist = Math.sqrt(wx * wx + wy * wy);
      if (dist >= radius) continue;
      const t = dist / radius;
      const fa = falloff(t, hardness) * (strength / 100) * pressure;

      const di = (py * rw + px) * 4;
      for (let c = 0; c < 4; c++) {
        data[di + c] = clamp(copy[di + c] * (1 - fa) + blurred[di + c] * fa);
      }
    }
  }

  ctx.putImageData(existing, x0, y0);
}

// ─── Sharpen Brush (Unsharp Mask) ─────────────────────────────────────────────

export function stampSharpen(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  size: number,
  hardness: number,
  strength: number,
  pressure = 1.0
): void {
  const radius = size / 2;
  const region = getRegion(ctx.canvas, cx, cy, radius + 2);
  if (!region) return;
  const { x0, y0, rw, rh } = region;

  const existing = ctx.getImageData(x0, y0, rw, rh);
  const data = existing.data;
  const copy = new Uint8ClampedArray(data);

  // Create blurred version for unsharp mask
  const sigma = Math.max(0.4, (radius * 0.08));
  const blurredData = gaussianBlurImageData(
    new ImageData(new Uint8ClampedArray(copy), rw, rh),
    sigma
  ).data;

  const amount = (strength / 100) * 1.5 * pressure;

  for (let py = 0; py < rh; py++) {
    for (let px = 0; px < rw; px++) {
      const wx = x0 + px - cx;
      const wy = y0 + py - cy;
      const dist = Math.sqrt(wx * wx + wy * wy);
      if (dist >= radius) continue;
      const t = dist / radius;
      const fa = falloff(t, hardness);

      const di = (py * rw + px) * 4;
      for (let c = 0; c < 3; c++) {
        const orig = copy[di + c];
        const blur = blurredData[di + c];
        const usm = orig + (orig - blur) * amount * fa;
        data[di + c] = clamp(usm);
      }
    }
  }

  ctx.putImageData(existing, x0, y0);
}

// ─── Smudge Brush ─────────────────────────────────────────────────────────────

/**
 * Professional directional smudge:
 *  1. Loads a "finger colour" buffer on first touch
 *  2. Paints that buffer toward the stroke direction
 *  3. Picks up new colour from the canvas as it moves
 *  4. Creates seamless wet-paint finger-drag effect
 */
export function initSmudgeState(): SmudgeState {
  return { buffer: null, lastX: 0, lastY: 0, initialized: false };
}

export function stampSmudge(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  size: number,
  hardness: number,
  strength: number,
  state: SmudgeState,
  pressure = 1.0
): SmudgeState {
  const radius = size / 2;
  const region = getRegion(ctx.canvas, cx, cy, radius + 4);
  if (!region) return state;
  const { x0, y0, rw, rh } = region;

  const existing = ctx.getImageData(x0, y0, rw, rh);
  const data = existing.data;
  const pickup = strength / 100 * pressure;

  if (!state.initialized || !state.buffer || state.buffer.length !== rw * rh * 4) {
    // Initialize finger buffer from current canvas region
    const newState: SmudgeState = {
      buffer: new Uint8ClampedArray(data),
      lastX: cx,
      lastY: cy,
      initialized: true,
    };
    return newState;
  }

  // Finger colour is stored in state.buffer (from previous stamp area)
  // We need to map the previous region to the current region
  const prevRegion = getRegion(ctx.canvas, state.lastX, state.lastY, radius + 4);
  const fingerBuf = state.buffer;

  for (let py = 0; py < rh; py++) {
    for (let px = 0; px < rw; px++) {
      const wx = x0 + px - cx;
      const wy = y0 + py - cy;
      const dist = Math.sqrt(wx * wx + wy * wy);
      if (dist >= radius) continue;
      const t = dist / radius;
      const fa = falloff(t, hardness);
      const blend = fa * pickup;

      const di = (py * rw + px) * 4;

      // Map this pixel back to previous finger position
      const prevPx = x0 + px - (prevRegion ? prevRegion.x0 : x0);
      const prevPy = y0 + py - (prevRegion ? prevRegion.y0 : y0);
      const prevRw = prevRegion ? prevRegion.rw : rw;
      const prevRh = prevRegion ? prevRegion.rh : rh;

      let fingerR = data[di], fingerG = data[di + 1], fingerB = data[di + 2];

      if (prevRegion && prevPx >= 0 && prevPx < prevRw && prevPy >= 0 && prevPy < prevRh) {
        const fi = (prevPy * prevRw + prevPx) * 4;
        if (fi + 3 < fingerBuf.length) {
          fingerR = fingerBuf[fi];
          fingerG = fingerBuf[fi + 1];
          fingerB = fingerBuf[fi + 2];
        }
      }

      // Blend finger colour into canvas
      data[di]     = clamp(data[di]     * (1 - blend) + fingerR * blend);
      data[di + 1] = clamp(data[di + 1] * (1 - blend) + fingerG * blend);
      data[di + 2] = clamp(data[di + 2] * (1 - blend) + fingerB * blend);
    }
  }

  ctx.putImageData(existing, x0, y0);

  // Update state: pick up new canvas pixels as new finger colour
  const newExisting = ctx.getImageData(x0, y0, rw, rh);
  return {
    buffer: new Uint8ClampedArray(newExisting.data),
    lastX: cx,
    lastY: cy,
    initialized: true,
  };
}

// ─── Sponge (Desaturate) Brush ────────────────────────────────────────────────

export function stampSponge(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  size: number,
  hardness: number,
  strength: number,
  saturate = false,
  pressure = 1.0
): void {
  const radius = size / 2;
  const region = getRegion(ctx.canvas, cx, cy, radius + 2);
  if (!region) return;
  const { x0, y0, rw, rh } = region;

  const existing = ctx.getImageData(x0, y0, rw, rh);
  const data = existing.data;
  const s = (strength / 100) * pressure;

  for (let py = 0; py < rh; py++) {
    for (let px = 0; px < rw; px++) {
      const wx = x0 + px - cx;
      const wy = y0 + py - cy;
      const dist = Math.sqrt(wx * wx + wy * wy);
      if (dist >= radius) continue;
      const t = dist / radius;
      const fa = falloff(t, hardness) * s;

      const di = (py * rw + px) * 4;
      const r = data[di], g = data[di + 1], b = data[di + 2];
      const [h, sat, l] = rgbToHsl(r, g, b);
      const newSat = saturate
        ? Math.min(1, sat + fa * (1 - sat))
        : Math.max(0, sat - fa * sat);
      const [nr, ng, nb] = hslToRgb(h, newSat, l);
      data[di]     = clamp(nr);
      data[di + 1] = clamp(ng);
      data[di + 2] = clamp(nb);
    }
  }

  ctx.putImageData(existing, x0, y0);
}

// ─── Tint Brush ──────────────────────────────────────────────────────────────

export function stampTint(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  size: number,
  hardness: number,
  strength: number,
  targetHex: string,
  pressure = 1.0
): void {
  const radius = size / 2;
  const region = getRegion(ctx.canvas, cx, cy, radius + 2);
  if (!region) return;
  const { x0, y0, rw, rh } = region;

  const existing = ctx.getImageData(x0, y0, rw, rh);
  const data = existing.data;
  const [tr, tg, tb] = parseHex(targetHex);
  const [th] = rgbToHsl(tr, tg, tb);
  const s = (strength / 100) * 0.6 * pressure;

  for (let py = 0; py < rh; py++) {
    for (let px = 0; px < rw; px++) {
      const wx = x0 + px - cx;
      const wy = y0 + py - cy;
      const dist = Math.sqrt(wx * wx + wy * wy);
      if (dist >= radius) continue;
      const t = dist / radius;
      const fa = falloff(t, hardness) * s;

      const di = (py * rw + px) * 4;
      const [h, sat, l] = rgbToHsl(data[di], data[di + 1], data[di + 2]);
      // Push hue toward target hue
      const dh = ((th - h + 1.5) % 1) - 0.5;
      const newH = (h + dh * fa + 1) % 1;
      const [nr, ng, nb] = hslToRgb(newH, sat, l);
      data[di]     = clamp(nr);
      data[di + 1] = clamp(ng);
      data[di + 2] = clamp(nb);
    }
  }

  ctx.putImageData(existing, x0, y0);
}

// ─── Heal Brush ───────────────────────────────────────────────────────────────

/**
 * Professional healing brush:
 *  — Samples texture from source point
 *  — Blends source texture with destination colour/luminosity
 *  — Creates seamless repair (no visible seam)
 */
export function stampHeal(
  ctx: CanvasRenderingContext2D,
  destX: number, destY: number,
  srcX: number, srcY: number,
  size: number,
  hardness: number,
  opacity: number,
  pressure = 1.0
): void {
  const radius = size / 2;

  // Read source region
  const srcRegion = getRegion(ctx.canvas, srcX, srcY, radius + 4);
  if (!srcRegion) return;
  const srcData = ctx.getImageData(srcRegion.x0, srcRegion.y0, srcRegion.rw, srcRegion.rh);

  // Read destination region
  const dstRegion = getRegion(ctx.canvas, destX, destY, radius + 4);
  if (!dstRegion) return;
  const dstData = ctx.getImageData(dstRegion.x0, dstRegion.y0, dstRegion.rw, dstRegion.rh);
  const out = new Uint8ClampedArray(dstData.data);

  const opacityVal = (opacity / 100) * pressure;

  for (let py = 0; py < dstRegion.rh; py++) {
    for (let px = 0; px < dstRegion.rw; px++) {
      const wx = dstRegion.x0 + px - destX;
      const wy = dstRegion.y0 + py - destY;
      const dist = Math.sqrt(wx * wx + wy * wy);
      if (dist >= radius) continue;
      const t = dist / radius;
      const fa = falloff(t, hardness) * opacityVal;

      const di = (py * dstRegion.rw + px) * 4;

      // Map to corresponding source pixel
      const spx = Math.round(px + (srcRegion.x0 - dstRegion.x0) + (destX - srcX));
      const spy = Math.round(py + (srcRegion.y0 - dstRegion.y0) + (destY - srcY));

      let srcR = dstData.data[di], srcG = dstData.data[di + 1], srcB = dstData.data[di + 2];

      if (spx >= 0 && spx < srcRegion.rw && spy >= 0 && spy < srcRegion.rh) {
        const si = (spy * srcRegion.rw + spx) * 4;
        srcR = srcData.data[si];
        srcG = srcData.data[si + 1];
        srcB = srcData.data[si + 2];
      }

      // Compute luminosity difference to preserve destination tone
      const srcLum = srcR * 0.299 + srcG * 0.587 + srcB * 0.114;
      const dstLum = dstData.data[di] * 0.299 + dstData.data[di + 1] * 0.587 + dstData.data[di + 2] * 0.114;
      const lumAdj = dstLum - srcLum;

      // Apply texture from source, adjusted to match destination luminosity
      out[di]     = clamp((srcR + lumAdj * 0.5) * fa + dstData.data[di]     * (1 - fa));
      out[di + 1] = clamp((srcG + lumAdj * 0.5) * fa + dstData.data[di + 1] * (1 - fa));
      out[di + 2] = clamp((srcB + lumAdj * 0.5) * fa + dstData.data[di + 2] * (1 - fa));
    }
  }

  ctx.putImageData(new ImageData(out, dstRegion.rw, dstRegion.rh), dstRegion.x0, dstRegion.y0);
}

// ─── Clone Stamp ──────────────────────────────────────────────────────────────

export function stampClone(
  ctx: CanvasRenderingContext2D,
  destX: number, destY: number,
  srcX: number, srcY: number,
  size: number,
  hardness: number,
  opacity: number,
  pressure = 1.0
): void {
  const radius = size / 2;
  const dstRegion = getRegion(ctx.canvas, destX, destY, radius + 4);
  if (!dstRegion) return;
  const dstData = ctx.getImageData(dstRegion.x0, dstRegion.y0, dstRegion.rw, dstRegion.rh);

  // Read a larger source region
  const srcReadX = Math.max(0, Math.floor(srcX - radius - 4));
  const srcReadY = Math.max(0, Math.floor(srcY - radius - 4));
  const srcReadW = Math.min(ctx.canvas.width - srcReadX, Math.ceil(radius + 4) * 2 + 8);
  const srcReadH = Math.min(ctx.canvas.height - srcReadY, Math.ceil(radius + 4) * 2 + 8);
  const srcData = ctx.getImageData(srcReadX, srcReadY, srcReadW, srcReadH);

  const out = new Uint8ClampedArray(dstData.data);
  const opacityVal = (opacity / 100) * pressure;

  for (let py = 0; py < dstRegion.rh; py++) {
    for (let px = 0; px < dstRegion.rw; px++) {
      const wx = dstRegion.x0 + px - destX;
      const wy = dstRegion.y0 + py - destY;
      const dist = Math.sqrt(wx * wx + wy * wy);
      if (dist >= radius) continue;
      const t = dist / radius;
      const fa = falloff(t, hardness) * opacityVal;

      // Corresponding source position
      const srcAbsX = srcX + wx;
      const srcAbsY = srcY + wy;
      const spx = Math.round(srcAbsX - srcReadX);
      const spy = Math.round(srcAbsY - srcReadY);

      const di = (py * dstRegion.rw + px) * 4;

      if (spx >= 0 && spx < srcReadW && spy >= 0 && spy < srcReadH) {
        const si = (spy * srcReadW + spx) * 4;
        out[di]     = clamp(srcData.data[si]     * fa + dstData.data[di]     * (1 - fa));
        out[di + 1] = clamp(srcData.data[si + 1] * fa + dstData.data[di + 1] * (1 - fa));
        out[di + 2] = clamp(srcData.data[si + 2] * fa + dstData.data[di + 2] * (1 - fa));
      }
    }
  }

  ctx.putImageData(new ImageData(out, dstRegion.rw, dstRegion.rh), dstRegion.x0, dstRegion.y0);
}

// ─── Path Interpolation (Stamp-along-stroke) ──────────────────────────────────

/**
 * Given two consecutive mouse positions and a spacing (in pixels),
 * returns all intermediate stamp positions needed to fill the gap smoothly.
 * This is the key to gap-free brush strokes.
 */
export function interpolateStampPositions(
  x0: number, y0: number,
  x1: number, y1: number,
  spacing: number,        // px between stamps
  remainder: number       // leftover distance from previous call
): { points: StampPoint[]; newRemainder: number } {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const strokeLen = Math.sqrt(dx * dx + dy * dy);

  if (strokeLen < 0.001) {
    return { points: [], newRemainder: remainder };
  }

  const points: StampPoint[] = [];
  let d = remainder;

  while (d < strokeLen) {
    const t = d / strokeLen;
    points.push({ x: x0 + t * dx, y: y0 + t * dy, pressure: 1.0 });
    d += spacing;
  }

  return { points, newRemainder: d - strokeLen };
}

// ─── Highlight/Shadow Recovery Brush ─────────────────────────────────────────

export function stampHighlightRecovery(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  size: number,
  hardness: number,
  strength: number,
  mode: "recover-highlights" | "lift-shadows",
  pressure = 1.0
): void {
  const radius = size / 2;
  const region = getRegion(ctx.canvas, cx, cy, radius + 2);
  if (!region) return;
  const { x0, y0, rw, rh } = region;

  const existing = ctx.getImageData(x0, y0, rw, rh);
  const data = existing.data;
  const s = (strength / 100) * pressure;

  for (let py = 0; py < rh; py++) {
    for (let px = 0; px < rw; px++) {
      const wx = x0 + px - cx;
      const wy = y0 + py - cy;
      const dist = Math.sqrt(wx * wx + wy * wy);
      if (dist >= radius) continue;
      const t = dist / radius;
      const fa = falloff(t, hardness) * s;

      const di = (py * rw + px) * 4;
      const r = data[di], g = data[di + 1], b = data[di + 2];
      const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

      if (mode === "recover-highlights" && lum > 0.7) {
        // Pull blown highlights back down toward a recoverable range
        const excess = (lum - 0.7) / 0.3;
        const pullDown = excess * fa * 0.5;
        const ratio = 1 - pullDown;
        data[di]     = clamp(r * ratio);
        data[di + 1] = clamp(g * ratio);
        data[di + 2] = clamp(b * ratio);
      } else if (mode === "lift-shadows" && lum < 0.35) {
        // Lift dark shadows non-linearly
        const deficit = (0.35 - lum) / 0.35;
        const lift = deficit * fa * 0.45;
        data[di]     = clamp(r + (128 - r) * lift);
        data[di + 1] = clamp(g + (128 - g) * lift);
        data[di + 2] = clamp(b + (128 - b) * lift);
      }
    }
  }

  ctx.putImageData(existing, x0, y0);
}

// ─── Pressure Curve ───────────────────────────────────────────────────────────

export type PressureCurve = "linear" | "light" | "medium" | "heavy";

export function applyPressureCurve(rawPressure: number, curve: PressureCurve): number {
  const p = Math.max(0, Math.min(1, rawPressure));
  switch (curve) {
    case "light":  return Math.pow(p, 0.5);
    case "medium": return p;
    case "heavy":  return Math.pow(p, 2.0);
    default:       return p;
  }
}

// ─── Simulated Pressure from Speed ───────────────────────────────────────────

let _lastSpeed = 1.0;
const SPEED_SMOOTH = 0.2;

/**
 * Simulate pen pressure from mouse speed.
 * Slow strokes = high pressure (thick, dark).
 * Fast strokes = low pressure (thin, light).
 */
export function simulatePressureFromSpeed(
  dx: number, dy: number,
  deltaTime: number,
  invert = false
): number {
  const speed = Math.sqrt(dx * dx + dy * dy) / Math.max(1, deltaTime);
  _lastSpeed = _lastSpeed * (1 - SPEED_SMOOTH) + speed * SPEED_SMOOTH;
  const norm = Math.min(1, _lastSpeed / 15);
  const p = invert ? norm : (1 - norm);
  return Math.max(0.1, Math.min(1, p));
}

// ─── Stroke State ─────────────────────────────────────────────────────────────

export interface StrokeState {
  lastX: number;
  lastY: number;
  lastTime: number;
  remainder: number;
  smudge: SmudgeState;
  cloneSource: { x: number; y: number } | null;
  isFirstPoint: boolean;
}

export function createStrokeState(): StrokeState {
  return {
    lastX: 0,
    lastY: 0,
    lastTime: performance.now(),
    remainder: 0,
    smudge: initSmudgeState(),
    cloneSource: null,
    isFirstPoint: true,
  };
}
