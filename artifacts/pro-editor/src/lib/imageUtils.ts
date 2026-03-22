import type { Adjustments } from "./editorStore";

export const FILTERS: { id: string; name: string; css: string; category: string }[] = [
  { id: "none", name: "Original", css: "", category: "basic" },
  { id: "vivid", name: "Vivid", css: "saturate(1.6) contrast(1.1)", category: "basic" },
  { id: "cinema", name: "Cinema", css: "contrast(1.2) saturate(0.85) sepia(0.1)", category: "cinematic" },
  { id: "chrome", name: "Chrome", css: "saturate(1.3) contrast(1.15) brightness(1.05)", category: "basic" },
  { id: "fade", name: "Fade", css: "contrast(0.85) brightness(1.1) saturate(0.8)", category: "basic" },
  { id: "mono", name: "Mono", css: "grayscale(1) contrast(1.1)", category: "black-white" },
  { id: "noir", name: "Noir", css: "grayscale(1) contrast(1.4) brightness(0.85)", category: "black-white" },
  { id: "silver", name: "Silver", css: "grayscale(0.9) contrast(1.05) brightness(1.1)", category: "black-white" },
  { id: "warm", name: "Warm", css: "sepia(0.3) saturate(1.2) brightness(1.05)", category: "basic" },
  { id: "cool", name: "Cool", css: "hue-rotate(15deg) saturate(1.1) brightness(1.05)", category: "basic" },
  { id: "golden", name: "Golden Hour", css: "sepia(0.5) saturate(1.4) brightness(1.1) contrast(1.05)", category: "cinematic" },
  { id: "matte", name: "Matte", css: "contrast(0.9) brightness(1.05) saturate(0.9)", category: "cinematic" },
  { id: "lush", name: "Lush", css: "saturate(1.8) brightness(1.05) contrast(1.05)", category: "basic" },
  { id: "haze", name: "Haze", css: "brightness(1.15) contrast(0.85) saturate(0.75)", category: "cinematic" },
  { id: "punch", name: "Punch", css: "contrast(1.3) saturate(1.5)", category: "basic" },
  { id: "dreamy", name: "Dreamy", css: "brightness(1.1) contrast(0.9) saturate(0.9) blur(0.5px)", category: "artistic" },
  { id: "vintage", name: "Vintage", css: "sepia(0.4) contrast(1.1) brightness(0.9) saturate(1.2)", category: "retro" },
  { id: "arctic", name: "Arctic", css: "hue-rotate(180deg) saturate(0.5) brightness(1.3)", category: "artistic" },
  { id: "summer", name: "Summer", css: "hue-rotate(-10deg) saturate(1.4) brightness(1.1)", category: "basic" },
  { id: "forest", name: "Forest", css: "hue-rotate(30deg) saturate(1.3) brightness(0.95)", category: "nature" },
  { id: "neon", name: "Neon", css: "saturate(2) contrast(1.2) brightness(1.1)", category: "artistic" },
  { id: "blueprint", name: "Blueprint", css: "hue-rotate(200deg) saturate(1.5) contrast(1.2)", category: "artistic" },
  { id: "sunset", name: "Sunset", css: "sepia(0.6) saturate(1.6) hue-rotate(-15deg) brightness(1.05)", category: "cinematic" },
  { id: "tokyo", name: "Tokyo Night", css: "hue-rotate(320deg) saturate(1.4) contrast(1.1)", category: "cinematic" },
  { id: "portra", name: "Portra 400", css: "sepia(0.2) saturate(1.1) brightness(1.08) contrast(0.95)", category: "film" },
  { id: "velvia", name: "Velvia 50", css: "saturate(1.7) contrast(1.15) brightness(0.95)", category: "film" },
  { id: "provia", name: "Provia 100F", css: "saturate(1.2) contrast(1.05) brightness(1.02)", category: "film" },
  { id: "hp5", name: "HP5 Plus", css: "grayscale(1) contrast(1.2) brightness(0.95)", category: "film" },
  { id: "trixX", name: "Tri-X 400", css: "grayscale(1) contrast(1.5) brightness(0.85)", category: "film" },
  { id: "ektar", name: "Ektar 100", css: "saturate(1.5) contrast(1.1) brightness(1.02) hue-rotate(-5deg)", category: "film" },
  { id: "crossProcess", name: "Cross Process", css: "saturate(1.6) contrast(1.3) hue-rotate(20deg)", category: "retro" },
  { id: "lomography", name: "Lomography", css: "contrast(1.2) saturate(1.4) brightness(0.9)", category: "retro" },
  { id: "cyberpunk", name: "Cyberpunk", css: "hue-rotate(280deg) saturate(1.8) contrast(1.3) brightness(1.1)", category: "artistic" },
  { id: "matrix", name: "Matrix", css: "hue-rotate(90deg) saturate(1.5) contrast(1.2) brightness(0.9)", category: "artistic" },
  { id: "pastel", name: "Pastel", css: "saturate(0.7) brightness(1.15) contrast(0.85)", category: "artistic" },
  { id: "teal-orange", name: "Teal & Orange", css: "saturate(1.3) contrast(1.1) hue-rotate(-5deg)", category: "cinematic" },
  { id: "bleach", name: "Bleach Bypass", css: "saturate(0.6) contrast(1.5) brightness(0.95)", category: "cinematic" },
  { id: "morning", name: "Morning Mist", css: "brightness(1.1) saturate(0.85) contrast(0.9) hue-rotate(5deg)", category: "nature" },
  { id: "dark-soul", name: "Dark Soul", css: "brightness(0.7) contrast(1.6) saturate(0.4)", category: "artistic" },
  { id: "spring", name: "Spring Blossom", css: "hue-rotate(20deg) saturate(1.2) brightness(1.12) contrast(0.95)", category: "nature" },
  { id: "infrared", name: "Infrared", css: "hue-rotate(140deg) saturate(1.6) contrast(1.4) brightness(1.1)", category: "artistic" },
  { id: "polaroid", name: "Polaroid", css: "sepia(0.3) saturate(1.1) brightness(1.1) contrast(0.85)", category: "retro" },
  { id: "kodachrome", name: "Kodachrome", css: "saturate(1.4) contrast(1.2) brightness(1.0) hue-rotate(-8deg)", category: "film" },
  { id: "agfa", name: "Agfa Vista", css: "saturate(1.25) contrast(1.08) brightness(0.98) hue-rotate(5deg)", category: "film" },
  { id: "fuji400h", name: "Fuji 400H", css: "saturate(0.9) contrast(0.98) brightness(1.05) hue-rotate(8deg)", category: "film" },
  { id: "sear", name: "Searing", css: "contrast(1.5) saturate(1.8) brightness(1.2) hue-rotate(-5deg)", category: "basic" },
  { id: "midnight", name: "Midnight", css: "brightness(0.8) contrast(1.3) saturate(0.7) hue-rotate(230deg)", category: "cinematic" },
  { id: "aurora", name: "Aurora", css: "hue-rotate(160deg) saturate(1.6) contrast(1.1) brightness(0.9)", category: "artistic" },
];

export const LUT_PRESETS = [
  { id: "none", name: "None", gradient: "from-gray-700 to-gray-500" },
  { id: "cinematic", name: "Cinematic", gradient: "from-blue-900 to-orange-700" },
  { id: "teal-orange", name: "Teal & Orange", gradient: "from-teal-600 to-orange-500" },
  { id: "morning-mist", name: "Morning Mist", gradient: "from-blue-200 to-purple-300" },
  { id: "golden-hour", name: "Golden Hour", gradient: "from-yellow-400 to-orange-600" },
  { id: "bleach-bypass", name: "Bleach Bypass", gradient: "from-gray-500 to-yellow-700" },
  { id: "cross-process", name: "Cross Process", gradient: "from-green-600 to-pink-500" },
  { id: "fuji-velvia", name: "Fuji Velvia", gradient: "from-green-700 to-red-600" },
  { id: "kodak-portra", name: "Kodak Portra", gradient: "from-amber-200 to-orange-400" },
  { id: "neon-noir", name: "Neon Noir", gradient: "from-purple-900 to-pink-500" },
  { id: "arctic", name: "Arctic Blue", gradient: "from-blue-300 to-cyan-500" },
  { id: "sunset-strip", name: "Sunset Strip", gradient: "from-red-500 to-purple-700" },
  { id: "desert-dunes", name: "Desert Dunes", gradient: "from-yellow-600 to-amber-800" },
  { id: "emerald-city", name: "Emerald City", gradient: "from-emerald-400 to-teal-700" },
  { id: "retro-chrome", name: "Retro Chrome", gradient: "from-slate-400 to-orange-300" },
];

export function buildFilterCSS(adj: Adjustments, selectedFilter: string): string {
  const filter = FILTERS.find((f) => f.id === selectedFilter);
  const filterBase = filter?.css || "";

  const brightness = 1 + adj.brightness / 100 + adj.exposure / 200;
  const contrast = 1 + adj.contrast / 100;
  const saturation = 1 + adj.saturation / 100 + adj.vibrance / 200;
  const blur = adj.blur / 10;
  const sharpness = adj.sharpness > 0 ? `contrast(${1 + adj.sharpness / 200})` : "";
  const hueRotate = adj.hue;

  let css = `brightness(${brightness.toFixed(3)}) contrast(${contrast.toFixed(3)}) saturate(${saturation.toFixed(3)}) hue-rotate(${hueRotate}deg)`;
  if (blur > 0) css += ` blur(${blur.toFixed(1)}px)`;
  if (sharpness) css = sharpness + " " + css;
  if (filterBase) css = filterBase + " " + css;

  return css;
}

export function buildCanvasFilter(adj: Adjustments, selectedFilter: string): string {
  return buildFilterCSS(adj, selectedFilter);
}

function clamp(v: number, min = 0, max = 255): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  let r, g, b;
  if (s === 0) { r = g = b = l; } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [r * 255, g * 255, b * 255];
}

function applyCurveToChannel(val: number, points: Array<{x: number; y: number}>): number {
  if (!points || points.length < 2) return val;
  const normalizedVal = val / 255 * 200;
  let low = points[0], high = points[points.length - 1];
  for (let i = 0; i < points.length - 1; i++) {
    if (normalizedVal >= points[i].x && normalizedVal <= points[i+1].x) {
      low = points[i]; high = points[i+1]; break;
    }
  }
  const t = high.x === low.x ? 0 : (normalizedVal - low.x) / (high.x - low.x);
  const curveY = low.y + t * (high.y - low.y);
  return clamp((1 - curveY / 200) * 255);
}

export async function applyPixelAdjustments(
  canvas: HTMLCanvasElement,
  adj: Adjustments,
  curvePoints: { rgb: Array<{x:number;y:number}>; r: Array<{x:number;y:number}>; g: Array<{x:number;y:number}>; b: Array<{x:number;y:number}> }
): Promise<void> {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const temperatureShift = adj.temperature;
  const tintShift = adj.tint;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i+1], b = data[i+2];

    if (adj.temperature !== 0) {
      r = clamp(r + temperatureShift * 0.8);
      b = clamp(b - temperatureShift * 0.8);
    }
    if (adj.tint !== 0) {
      g = clamp(g + tintShift * 0.4);
      r = clamp(r - tintShift * 0.2);
    }

    if (adj.highlights !== 0 || adj.shadows !== 0) {
      const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      if (adj.highlights !== 0) {
        const highlightFactor = Math.pow(lum, 2) * (adj.highlights / 100) * 0.5;
        r = clamp(r + highlightFactor * (255 - r));
        g = clamp(g + highlightFactor * (255 - g));
        b = clamp(b + highlightFactor * (255 - b));
      }
      if (adj.shadows !== 0) {
        const shadowFactor = Math.pow(1 - lum, 2) * (adj.shadows / 100) * 0.5;
        r = clamp(r + shadowFactor * (128 - r));
        g = clamp(g + shadowFactor * (128 - g));
        b = clamp(b + shadowFactor * (128 - b));
      }
    }

    if (adj.whites !== 0) {
      const wf = adj.whites / 100;
      r = clamp(r + wf * (255 - r) * 0.5);
      g = clamp(g + wf * (255 - g) * 0.5);
      b = clamp(b + wf * (255 - b) * 0.5);
    }
    if (adj.blacks !== 0) {
      const bf = adj.blacks / 100;
      r = clamp(r * (1 - Math.abs(bf) * 0.5) + (bf < 0 ? 0 : r * bf * 0.3));
      g = clamp(g * (1 - Math.abs(bf) * 0.5) + (bf < 0 ? 0 : g * bf * 0.3));
      b = clamp(b * (1 - Math.abs(bf) * 0.5) + (bf < 0 ? 0 : b * bf * 0.3));
    }

    if (adj.clarity !== 0) {
      const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      const mid = 0.5;
      const cf = adj.clarity / 100 * 0.4 * (1 - Math.pow((lum - mid) / mid, 2));
      r = clamp(r + cf * (r - 128));
      g = clamp(g + cf * (g - 128));
      b = clamp(b + cf * (b - 128));
    }

    if (adj.dehaze !== 0) {
      const df = adj.dehaze / 100 * 0.5;
      r = clamp(r * (1 + df) - 30 * df);
      g = clamp(g * (1 + df) - 20 * df);
      b = clamp(b * (1 + df) - 10 * df);
    }

    if (adj.vibrance !== 0) {
      const [hh, ss, ll] = rgbToHsl(r, g, b);
      const vibranceFactor = (adj.vibrance / 100) * (1 - ss);
      const newS = Math.max(0, Math.min(1, ss + vibranceFactor * 0.5));
      if (newS !== ss) {
        const [nr, ng, nb] = hslToRgb(hh, newS, ll);
        r = nr; g = ng; b = nb;
      }
    }

    if (adj.hslRed !== 0 || adj.hslGreen !== 0 || adj.hslBlue !== 0 ||
        adj.hslAqua !== 0 || adj.hslOrange !== 0 || adj.hslYellow !== 0 ||
        adj.hslPurple !== 0 || adj.hslMagenta !== 0 ||
        adj.hslRedSat !== 0 || adj.hslGreenSat !== 0 || adj.hslBlueSat !== 0 ||
        adj.hslRedLum !== 0 || adj.hslGreenLum !== 0 || adj.hslBlueLum !== 0) {
      const [hh, ss, ll] = rgbToHsl(r, g, b);
      let hueAdjust = 0, satAdjust = 0, lumAdjust = 0;

      const getColorWeight = (targetH: number, rangeH: number): number => {
        const diff = Math.abs(((hh - targetH + 540) % 360) - 180);
        return Math.max(0, 1 - diff / rangeH);
      };

      const ranges: Array<{ h: number; range: number; hAdj: number; sAdj: number; lAdj: number }> = [
        { h: 0, range: 40, hAdj: adj.hslRed, sAdj: adj.hslRedSat, lAdj: adj.hslRedLum },
        { h: 30, range: 35, hAdj: adj.hslOrange, sAdj: adj.hslOrangeSat, lAdj: adj.hslOrangeLum },
        { h: 60, range: 35, hAdj: adj.hslYellow, sAdj: adj.hslYellowSat, lAdj: adj.hslYellowLum },
        { h: 120, range: 50, hAdj: adj.hslGreen, sAdj: adj.hslGreenSat, lAdj: adj.hslGreenLum },
        { h: 180, range: 50, hAdj: adj.hslAqua, sAdj: adj.hslAquaSat, lAdj: adj.hslAquaLum },
        { h: 240, range: 50, hAdj: adj.hslBlue, sAdj: adj.hslBlueSat, lAdj: adj.hslBlueLum },
        { h: 280, range: 45, hAdj: adj.hslPurple, sAdj: adj.hslPurpleSat, lAdj: adj.hslPurpleLum },
        { h: 320, range: 40, hAdj: adj.hslMagenta, sAdj: adj.hslMagentaSat, lAdj: adj.hslMagentaLum },
        { h: 360, range: 40, hAdj: adj.hslRed, sAdj: adj.hslRedSat, lAdj: adj.hslRedLum },
      ];

      for (const range of ranges) {
        const w = getColorWeight(range.h, range.range);
        if (w > 0) {
          hueAdjust += w * range.hAdj;
          satAdjust += w * range.sAdj;
          lumAdjust += w * range.lAdj;
        }
      }

      if (hueAdjust !== 0 || satAdjust !== 0 || lumAdjust !== 0) {
        const newH = (hh + hueAdjust * 1.8 + 360) % 360;
        const newS = Math.max(0, Math.min(1, ss + satAdjust / 100));
        const newL = Math.max(0, Math.min(1, ll + lumAdjust / 100));
        const [nr, ng, nb] = hslToRgb(newH, newS, newL);
        r = nr; g = ng; b = nb;
      }
    }

    if (curvePoints?.rgb?.length > 2) {
      r = applyCurveToChannel(r, curvePoints.rgb);
      g = applyCurveToChannel(g, curvePoints.rgb);
      b = applyCurveToChannel(b, curvePoints.rgb);
    }
    if (curvePoints?.r?.length > 2) r = applyCurveToChannel(r, curvePoints.r);
    if (curvePoints?.g?.length > 2) g = applyCurveToChannel(g, curvePoints.g);
    if (curvePoints?.b?.length > 2) b = applyCurveToChannel(b, curvePoints.b);

    if (adj.splitShadowS !== 0 || adj.splitHighlightS !== 0) {
      const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      const shadowWeight = Math.pow(1 - lum, 2) * (adj.splitShadowS / 100);
      const highlightWeight = Math.pow(lum, 2) * (adj.splitHighlightS / 100);

      if (shadowWeight > 0) {
        const [sr, sg, sb] = hslToRgb(adj.splitShadowH, 1, 0.5);
        r = clamp(r + (sr - r) * shadowWeight * 0.5);
        g = clamp(g + (sg - g) * shadowWeight * 0.5);
        b = clamp(b + (sb - b) * shadowWeight * 0.5);
      }
      if (highlightWeight > 0) {
        const [hr, hg, hb] = hslToRgb(adj.splitHighlightH, 1, 0.5);
        r = clamp(r + (hr - r) * highlightWeight * 0.5);
        g = clamp(g + (hg - g) * highlightWeight * 0.5);
        b = clamp(b + (hb - b) * highlightWeight * 0.5);
      }
    }

    if (adj.grain > 0) {
      const noise = (Math.random() - 0.5) * adj.grain * 0.5;
      r = clamp(r + noise);
      g = clamp(g + noise);
      b = clamp(b + noise);
    }

    if (adj.texture !== 0) {
      const avg = (r + g + b) / 3;
      const tf = adj.texture / 200;
      r = clamp(r + (r - avg) * tf);
      g = clamp(g + (g - avg) * tf);
      b = clamp(b + (b - avg) * tf);
    }

    data[i] = r;
    data[i+1] = g;
    data[i+2] = b;
  }

  ctx.putImageData(imageData, 0, 0);
}

export function applyVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  strength: number
): void {
  if (strength === 0) return;
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.3,
    width / 2, height / 2, Math.max(width, height) * 0.7
  );
  const color = strength > 0 ? "rgba(0,0,0," : "rgba(255,255,255,";
  const intensity = Math.abs(strength) / 100;
  gradient.addColorStop(0, color + "0)");
  gradient.addColorStop(1, color + (intensity * 0.85) + ")");
  const prevOp = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = strength > 0 ? "multiply" : "screen";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = prevOp;
}

export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export const RESOLUTIONS = [
  { label: "720p (1280x720)", width: 1280, height: 720 },
  { label: "1080p (1920x1080)", width: 1920, height: 1080 },
  { label: "2K (2560x1440)", width: 2560, height: 1440 },
  { label: "4K (3840x2160)", width: 3840, height: 2160 },
  { label: "5K (5120x2880)", width: 5120, height: 2880 },
  { label: "8K (7680x4320)", width: 7680, height: 4320 },
  { label: "Square (1080x1080)", width: 1080, height: 1080 },
  { label: "Portrait (1080x1350)", width: 1080, height: 1350 },
  { label: "Story (1080x1920)", width: 1080, height: 1920 },
  { label: "Cinematic (2048x858)", width: 2048, height: 858 },
  { label: "Banner (1500x500)", width: 1500, height: 500 },
];

export const ASPECT_RATIOS = [
  { label: "Free", value: "free" },
  { label: "Original", value: "original" },
  { label: "1:1", value: "1:1" },
  { label: "4:3", value: "4:3" },
  { label: "3:2", value: "3:2" },
  { label: "16:9", value: "16:9" },
  { label: "21:9", value: "21:9" },
  { label: "5:4", value: "5:4" },
  { label: "9:16", value: "9:16" },
  { label: "3:4", value: "3:4" },
  { label: "Golden", value: "1.618:1" },
];

export const TRANSITIONS = [
  "None", "Fade", "Dissolve", "Wipe Left", "Wipe Right", "Slide Up",
  "Slide Down", "Zoom In", "Zoom Out", "Spin", "Glitch", "Burn", "Dip to Black",
];

export const FONTS = [
  "Inter", "Roboto", "Playfair Display", "Montserrat", "Bebas Neue",
  "Comic Sans MS", "Georgia", "Impact", "Arial Black", "Courier New",
  "Dancing Script", "Lobster", "Oswald", "Raleway", "Nunito",
  "Poppins", "Lato", "Open Sans", "Source Sans Pro", "Merriweather",
  "Abril Fatface", "Pacifico", "Permanent Marker", "Special Elite", "Cinzel",
  "Roboto Slab", "Ubuntu", "Quicksand", "Righteous", "Orbitron",
];

export const BLEND_MODES = [
  "normal", "multiply", "screen", "overlay", "darken", "lighten",
  "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion",
  "hue", "saturation", "color", "luminosity",
] as const;

export const SHAPES = [
  { id: "rectangle", label: "Rectangle" },
  { id: "rounded-rect", label: "Rounded Rect" },
  { id: "ellipse", label: "Ellipse" },
  { id: "triangle", label: "Triangle" },
  { id: "pentagon", label: "Pentagon" },
  { id: "hexagon", label: "Hexagon" },
  { id: "star", label: "Star" },
  { id: "heart", label: "Heart" },
  { id: "arrow", label: "Arrow" },
  { id: "line", label: "Line" },
  { id: "diamond", label: "Diamond" },
  { id: "parallelogram", label: "Parallelogram" },
];

export const AI_TOOLS = [
  { id: "remove-bg", label: "Remove Background", icon: "✂️", desc: "Automatically remove image background" },
  { id: "enhance", label: "AI Enhance", icon: "✨", desc: "Upscale and enhance details" },
  { id: "denoise", label: "AI Denoise", icon: "🔊", desc: "Remove noise with AI" },
  { id: "colorize", label: "Colorize B&W", icon: "🎨", desc: "AI colorize black & white photos" },
  { id: "restore", label: "Photo Restore", icon: "🔄", desc: "Restore old or damaged photos" },
  { id: "relight", label: "AI Relight", icon: "💡", desc: "Change lighting with AI" },
  { id: "sky-replace", label: "Sky Replace", icon: "☁️", desc: "Replace the sky automatically" },
  { id: "portrait-enhance", label: "Portrait Enhance", icon: "👤", desc: "AI face and skin enhancement" },
  { id: "expand", label: "Expand Image", icon: "↔️", desc: "Generatively expand image boundaries" },
  { id: "object-remove", label: "Remove Object", icon: "🪄", desc: "Remove unwanted objects" },
];

export function computeHistogramData(canvas: HTMLCanvasElement): {
  r: number[]; g: number[]; b: number[]; lum: number[];
} {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const r = new Array(256).fill(0);
  const g = new Array(256).fill(0);
  const b = new Array(256).fill(0);
  const lum = new Array(256).fill(0);
  if (!ctx) return { r, g, b, lum };

  const imgData = ctx.getImageData(0, 0, Math.min(canvas.width, 800), Math.min(canvas.height, 600));
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    r[data[i]]++;
    g[data[i+1]]++;
    b[data[i+2]]++;
    const l = Math.round(data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114);
    lum[l]++;
  }
  return { r, g, b, lum };
}

// Real background removal using color-distance-based alpha masking
export async function removeBackground(canvas: HTMLCanvasElement, threshold = 30): Promise<void> {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  // Sample background from corners
  const cornerSamples: number[][] = [];
  const samplePoints = [
    [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
    [Math.floor(width / 4), 0], [Math.floor(3 * width / 4), 0],
  ];
  for (const [x, y] of samplePoints) {
    const idx = (y * width + x) * 4;
    cornerSamples.push([data[idx], data[idx + 1], data[idx + 2]]);
  }

  const bgR = cornerSamples.reduce((s, c) => s + c[0], 0) / cornerSamples.length;
  const bgG = cornerSamples.reduce((s, c) => s + c[1], 0) / cornerSamples.length;
  const bgB = cornerSamples.reduce((s, c) => s + c[2], 0) / cornerSamples.length;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const dist = Math.sqrt(
      Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
    );
    if (dist < threshold * 2) {
      const alpha = Math.max(0, Math.min(255, (dist / (threshold * 2)) * 255));
      data[i + 3] = alpha;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// Auto-enhance: analyze image and apply optimal adjustments
export function autoEnhanceAnalysis(canvas: HTMLCanvasElement): Partial<Adjustments> {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return {};

  const imgData = ctx.getImageData(0, 0, Math.min(canvas.width, 400), Math.min(canvas.height, 400));
  const data = imgData.data;

  let totalR = 0, totalG = 0, totalB = 0, totalLum = 0;
  let minLum = 255, maxLum = 0;
  let darkCount = 0, brightCount = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const lum = r * 0.299 + g * 0.587 + b * 0.114;
    totalR += r; totalG += g; totalB += b; totalLum += lum;
    minLum = Math.min(minLum, lum);
    maxLum = Math.max(maxLum, lum);
    if (lum < 80) darkCount++;
    if (lum > 180) brightCount++;
  }

  const avgR = totalR / pixelCount;
  const avgG = totalG / pixelCount;
  const avgB = totalB / pixelCount;
  const avgLum = totalLum / pixelCount;
  const darkRatio = darkCount / pixelCount;
  const brightRatio = brightCount / pixelCount;

  const enhancements: Partial<Adjustments> = {};

  // Fix exposure
  if (avgLum < 90) enhancements.exposure = Math.min(3, (90 - avgLum) / 30);
  else if (avgLum > 170) enhancements.exposure = Math.max(-3, (170 - avgLum) / 30);

  // Fix contrast if range is narrow
  const range = maxLum - minLum;
  if (range < 150) enhancements.contrast = Math.min(40, (150 - range) / 5);

  // Fix white balance (color cast)
  const avgAll = (avgR + avgG + avgB) / 3;
  if (avgB - avgAll > 15) enhancements.temperature = -Math.min(30, (avgB - avgAll));
  if (avgR - avgAll > 15) enhancements.temperature = Math.min(30, (avgR - avgAll));

  // Shadows and highlights
  if (darkRatio > 0.3) enhancements.shadows = Math.min(30, darkRatio * 80);
  if (brightRatio > 0.3) enhancements.highlights = Math.max(-30, -brightRatio * 60);

  // Boost vibrance slightly
  enhancements.vibrance = 15;
  enhancements.clarity = 10;

  return enhancements;
}

// Apply Gaussian-style blur in-place for noise reduction
export function applyNoiseReduction(imageData: ImageData, strength: number): void {
  if (strength <= 0) return;
  const radius = Math.ceil(strength / 20);
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const copy = new Uint8ClampedArray(data);

  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      let r = 0, g = 0, b = 0, count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4;
          r += copy[idx]; g += copy[idx + 1]; b += copy[idx + 2];
          count++;
        }
      }
      const idx = (y * width + x) * 4;
      const factor = strength / 100;
      data[idx] = copy[idx] * (1 - factor) + (r / count) * factor;
      data[idx + 1] = copy[idx + 1] * (1 - factor) + (g / count) * factor;
      data[idx + 2] = copy[idx + 2] * (1 - factor) + (b / count) * factor;
    }
  }
}
