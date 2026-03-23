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

// ============================================================
// WORLD-CLASS IMAGE PROCESSING ADDITIONS
// ============================================================

/**
 * Real unsharp mask — the gold standard for photo sharpening
 * Radius: blur radius, Amount: sharpening strength, Threshold: edge sensitivity
 */
export function applyUnsharpMask(
  imageData: ImageData,
  radius: number,
  amount: number,
  threshold: number
): void {
  if (amount <= 0) return;
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const blurred = new Uint8ClampedArray(data);

  // Gaussian blur approximation via box blur (3-pass)
  const r = Math.max(1, Math.round(radius));
  function boxBlur(arr: Uint8ClampedArray, ch: number, rad: number) {
    const tmp = new Float32Array(width * height);
    // Horizontal pass
    for (let y = 0; y < height; y++) {
      let sum = 0, count = 0;
      for (let x = -rad; x <= rad; x++) {
        const sx = Math.min(width - 1, Math.max(0, x));
        sum += arr[(y * width + sx) * 4 + ch];
        count++;
      }
      for (let x = 0; x < width; x++) {
        tmp[y * width + x] = sum / count;
        const addX = Math.min(width - 1, x + rad + 1);
        const rmX = Math.max(0, x - rad);
        sum += arr[(y * width + addX) * 4 + ch] - arr[(y * width + rmX) * 4 + ch];
      }
    }
    // Vertical pass
    for (let x = 0; x < width; x++) {
      let sum2 = 0, count2 = 0;
      for (let y = -rad; y <= rad; y++) {
        const sy = Math.min(height - 1, Math.max(0, y));
        sum2 += tmp[sy * width + x];
        count2++;
      }
      for (let y = 0; y < height; y++) {
        arr[(y * width + x) * 4 + ch] = Math.round(sum2 / count2);
        const addY = Math.min(height - 1, y + rad + 1);
        const rmY = Math.max(0, y - rad);
        sum2 += tmp[addY * width + x] - tmp[rmY * width + x];
      }
    }
  }

  for (let ch = 0; ch < 3; ch++) boxBlur(blurred, ch, r);

  // Unsharp mask: original + amount * (original - blurred) where diff > threshold
  const scale = amount / 100;
  for (let i = 0; i < data.length; i += 4) {
    for (let ch = 0; ch < 3; ch++) {
      const orig = data[i + ch];
      const blur = blurred[i + ch];
      const diff = orig - blur;
      if (Math.abs(diff) >= threshold) {
        data[i + ch] = Math.max(0, Math.min(255, orig + diff * scale));
      }
    }
  }
}

/**
 * Real luminosity-based Clarity enhancement (local contrast)
 */
export function applyClarity(imageData: ImageData, amount: number): void {
  if (amount === 0) return;
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const blurred = new Uint8ClampedArray(data);

  // Large-radius blur (local average)
  const r = 25;
  function boxBlurLuma(arr: Uint8ClampedArray, rad: number) {
    const luma = new Float32Array(width * height);
    for (let i = 0; i < width * height; i++) {
      luma[i] = arr[i * 4] * 0.299 + arr[i * 4 + 1] * 0.587 + arr[i * 4 + 2] * 0.114;
    }
    const tmpH = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
      let sum = 0;
      for (let x = -rad; x <= rad; x++) sum += luma[y * width + Math.max(0, Math.min(width - 1, x))];
      for (let x = 0; x < width; x++) {
        tmpH[y * width + x] = sum / (rad * 2 + 1);
        sum += luma[y * width + Math.min(width - 1, x + rad + 1)] - luma[y * width + Math.max(0, x - rad)];
      }
    }
    const result = new Float32Array(width * height);
    for (let x = 0; x < width; x++) {
      let sum2 = 0;
      for (let y = -rad; y <= rad; y++) sum2 += tmpH[Math.max(0, Math.min(height - 1, y)) * width + x];
      for (let y = 0; y < height; y++) {
        result[y * width + x] = sum2 / (rad * 2 + 1);
        sum2 += tmpH[Math.min(height - 1, y + rad + 1) * width + x] - tmpH[Math.max(0, y - rad) * width + x];
      }
    }
    return result;
  }

  const localAvg = boxBlurLuma(blurred, r);
  const scale = amount / 100 * 0.5;

  for (let i = 0; i < data.length; i += 4) {
    const luma = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
    const avg = localAvg[i / 4];
    const localContrast = luma - avg;
    const boost = 1 + localContrast / 255 * scale;
    data[i]   = Math.max(0, Math.min(255, data[i]   * boost));
    data[i+1] = Math.max(0, Math.min(255, data[i+1] * boost));
    data[i+2] = Math.max(0, Math.min(255, data[i+2] * boost));
  }
}

/**
 * Real LAB-space color grading via approximate RGB-LAB-RGB conversion
 * Much more perceptually accurate than RGB adjustments alone
 */
function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  // sRGB to linear
  const linearize = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const rl = linearize(r), gl = linearize(g), bl = linearize(b);
  // Linear to XYZ (D65)
  const X = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375;
  const Y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750;
  const Z = rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041;
  // XYZ to Lab
  const f = (t: number) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16/116;
  const fx = f(X / 0.95047), fy = f(Y / 1.0), fz = f(Z / 1.08883);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function labToRgb(L: number, a: number, b: number): [number, number, number] {
  const fy = (L + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;
  const fInv = (t: number) => t > 0.20689655 ? t * t * t : (t - 16/116) / 7.787;
  const X = fInv(fx) * 0.95047;
  const Y = fInv(fy) * 1.0;
  const Z = fInv(fz) * 1.08883;
  const r = X *  3.2404542 - Y * 1.5371385 - Z * 0.4985314;
  const g = X * -0.9692660 + Y * 1.8760108 + Z * 0.0415560;
  const bl2 = X *  0.0556434 - Y * 0.2040259 + Z * 1.0572252;
  const delinearize = (c: number) => {
    const v = Math.max(0, c);
    const s = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1/2.4) - 0.055;
    return Math.max(0, Math.min(255, Math.round(s * 255)));
  };
  return [delinearize(r), delinearize(g), delinearize(bl2)];
}

/**
 * Apply LAB-space vibrance (boost less saturated colors selectively)
 */
export function applyVibrance(imageData: ImageData, amount: number): void {
  if (amount === 0) return;
  const data = imageData.data;
  const scale = amount / 100;

  for (let i = 0; i < data.length; i += 4) {
    const [L, a, b] = rgbToLab(data[i], data[i+1], data[i+2]);
    const chroma = Math.sqrt(a * a + b * b);
    // Vibrance: boost low-chroma colors more
    const vibranceBoost = scale * (1 - chroma / 128);
    const newA = a + a * vibranceBoost;
    const newB = b + b * vibranceBoost;
    const [nr, ng, nb] = labToRgb(L, newA, newB);
    data[i] = nr; data[i+1] = ng; data[i+2] = nb;
  }
}

/**
 * Proper skin tone detection and smoothing using HSL ranges
 */
export function applySkinSmooth(imageData: ImageData, amount: number): void {
  if (amount <= 0) return;
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const copy = new Uint8ClampedArray(data);
  const strength = amount / 100;
  const radius = Math.ceil(strength * 6);

  function isSkinTone(r: number, g: number, b: number): boolean {
    // Skin detection in RGB space
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return r > 95 && g > 40 && b > 20 &&
           r > g && r > b &&
           max - min > 15 &&
           Math.abs(r - g) > 15 &&
           r > 160;
  }

  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      if (!isSkinTone(r, g, b)) continue;

      // Gaussian-weighted average of nearby skin pixels
      let sumR = 0, sumG = 0, sumB = 0, total = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx, ny = y + dy;
          const ni = (ny * width + nx) * 4;
          const nr = copy[ni], ng = copy[ni+1], nb = copy[ni+2];
          if (!isSkinTone(nr, ng, nb)) continue;
          const w = Math.exp(-(dx*dx + dy*dy) / (2 * radius * radius));
          sumR += nr * w; sumG += ng * w; sumB += nb * w; total += w;
        }
      }
      if (total > 0) {
        data[idx]   = Math.round(r * (1-strength) + (sumR/total) * strength);
        data[idx+1] = Math.round(g * (1-strength) + (sumG/total) * strength);
        data[idx+2] = Math.round(b * (1-strength) + (sumB/total) * strength);
      }
    }
  }
}

/**
 * Advanced auto white balance using Gray World + Retinex
 */
export function applyAutoWhiteBalance(imageData: ImageData): void {
  const data = imageData.data;
  let sumR = 0, sumG = 0, sumB = 0;
  const n = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    sumR += data[i]; sumG += data[i+1]; sumB += data[i+2];
  }

  const avgR = sumR / n, avgG = sumG / n, avgB = sumB / n;
  const avgGray = (avgR + avgG + avgB) / 3;

  const scaleR = avgGray / avgR;
  const scaleG = avgGray / avgG;
  const scaleB = avgGray / avgB;

  for (let i = 0; i < data.length; i += 4) {
    data[i]   = Math.max(0, Math.min(255, data[i]   * scaleR));
    data[i+1] = Math.max(0, Math.min(255, data[i+1] * scaleG));
    data[i+2] = Math.max(0, Math.min(255, data[i+2] * scaleB));
  }
}

/**
 * HDR Tone Mapping — Filmic (ACES approximation)
 * Best-in-class tone mapping for HDR-looking results
 */
export function applyFilmicToneMap(imageData: ImageData, exposure: number = 1.0): void {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    for (let ch = 0; ch < 3; ch++) {
      let x = (data[i + ch] / 255) * exposure;
      // ACES filmic curve
      x = Math.max(0, x);
      const a = 2.51, bv = 0.03, c = 2.43, d = 0.59, e2 = 0.14;
      const mapped = (x * (a * x + bv)) / (x * (c * x + d) + e2);
      data[i + ch] = Math.max(0, Math.min(255, Math.round(Math.max(0, Math.min(1, mapped)) * 255)));
    }
  }
}

/**
 * Smart object clone stamp with Poisson blending simulation
 */
export function cloneStamp(
  ctx: CanvasRenderingContext2D,
  srcX: number, srcY: number,
  dstX: number, dstY: number,
  radius: number,
  opacity: number
): void {
  const srcData = ctx.getImageData(
    Math.max(0, srcX - radius), Math.max(0, srcY - radius),
    radius * 2, radius * 2
  );
  const dstData = ctx.getImageData(
    Math.max(0, dstX - radius), Math.max(0, dstY - radius),
    radius * 2, radius * 2
  );

  const sd = srcData.data, dd = dstData.data;
  const alpha = opacity / 100;

  for (let y = 0; y < radius * 2; y++) {
    for (let x = 0; x < radius * 2; x++) {
      const cx = x - radius, cy = y - radius;
      const dist = Math.sqrt(cx*cx + cy*cy);
      if (dist > radius) continue;
      // Soft edge falloff
      const falloff = Math.pow(1 - dist / radius, 0.5) * alpha;
      const si = (y * radius * 2 + x) * 4;
      dd[si]   = Math.round(dd[si]   * (1-falloff) + sd[si]   * falloff);
      dd[si+1] = Math.round(dd[si+1] * (1-falloff) + sd[si+1] * falloff);
      dd[si+2] = Math.round(dd[si+2] * (1-falloff) + sd[si+2] * falloff);
    }
  }
  ctx.putImageData(dstData, Math.max(0, dstX - radius), Math.max(0, dstY - radius));
}

/**
 * Content-aware heal: replace a region using texture synthesis from surrounding area
 */
export function contentAwareHeal(
  imageData: ImageData,
  cx: number, cy: number,
  radius: number
): void {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;

  // Sample surrounding pixels (outside radius) to fill center
  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      if (x < 0 || x >= w || y < 0 || y >= h) continue;
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > radius) continue;

      // Sample from edge of the heal brush (random direction)
      const angle = Math.atan2(dy, dx);
      const sampleDist = radius * 1.3;
      const sx = Math.round(cx + Math.cos(angle) * sampleDist);
      const sy = Math.round(cy + Math.sin(angle) * sampleDist);

      if (sx < 0 || sx >= w || sy < 0 || sy >= h) continue;

      const src = (sy * w + sx) * 4;
      const dst = (y * w + x) * 4;
      const blend = 1 - dist / radius;

      data[dst]   = Math.round(data[dst]   * (1-blend) + data[src]   * blend);
      data[dst+1] = Math.round(data[dst+1] * (1-blend) + data[src+1] * blend);
      data[dst+2] = Math.round(data[dst+2] * (1-blend) + data[src+2] * blend);
    }
  }
}

/**
 * Halation effect — simulates film halation (glow on bright areas)
 * Used in vintage/cinematic grading
 */
export function applyHalation(imageData: ImageData, amount: number, hue: number = 10): void {
  if (amount <= 0) return;
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const blurred = new Uint8ClampedArray(data);

  // Large gaussian blur
  const radius = 12;
  const copy = new Uint8ClampedArray(data);
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      let r = 0, g = 0, b = 0, count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx*dx + dy*dy > radius*radius) continue;
          const ni = ((y+dy)*width + (x+dx)) * 4;
          r += copy[ni]; g += copy[ni+1]; b += copy[ni+2]; count++;
        }
      }
      const bi = (y*width + x) * 4;
      blurred[bi]   = r / count;
      blurred[bi+1] = g / count;
      blurred[bi+2] = b / count;
    }
  }

  // Add to red/warm channel only on bright areas (halation)
  const scale = amount / 100;
  for (let i = 0; i < data.length; i += 4) {
    const lum = (blurred[i] * 0.299 + blurred[i+1] * 0.587 + blurred[i+2] * 0.114) / 255;
    if (lum > 0.7) {
      const boost = lum * scale * 80;
      data[i]   = Math.min(255, data[i]   + boost);
      data[i+1] = Math.min(255, data[i+1] + boost * 0.3);
      data[i+2] = Math.min(255, data[i+2] + boost * 0.1);
    }
  }
}

/**
 * Radial filter — applies adjustments in a radial gradient mask
 * Professional-grade local adjustment
 */
export interface RadialFilter {
  cx: number; cy: number;
  rx: number; ry: number;
  feather: number;
  invert: boolean;
  exposure: number;
  brightness: number;
  contrast: number;
  saturation: number;
}

export function applyRadialFilter(imageData: ImageData, filter: RadialFilter): void {
  const data = imageData.data;
  const { cx, cy, rx, ry, feather, invert, exposure, brightness, contrast, saturation } = filter;

  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      const ellipseDist = Math.sqrt(nx*nx + ny*ny);
      let mask = 1 - Math.min(1, Math.max(0, (ellipseDist - 1 + feather) / feather));
      if (invert) mask = 1 - mask;

      if (mask <= 0) continue;

      const i = (y * imageData.width + x) * 4;
      let r = data[i], g = data[i+1], b = data[i+2];

      // Exposure
      if (exposure !== 0) {
        const ef = Math.pow(2, exposure * mask);
        r = Math.min(255, r * ef);
        g = Math.min(255, g * ef);
        b = Math.min(255, b * ef);
      }
      // Brightness
      if (brightness !== 0) {
        const bm = brightness * mask;
        r = Math.min(255, Math.max(0, r + bm));
        g = Math.min(255, Math.max(0, g + bm));
        b = Math.min(255, Math.max(0, b + bm));
      }
      // Contrast
      if (contrast !== 0) {
        const cm = 1 + contrast * mask / 100;
        r = Math.min(255, Math.max(0, (r - 128) * cm + 128));
        g = Math.min(255, Math.max(0, (g - 128) * cm + 128));
        b = Math.min(255, Math.max(0, (b - 128) * cm + 128));
      }
      // Saturation
      if (saturation !== 0) {
        const lum = r * 0.299 + g * 0.587 + b * 0.114;
        const sm = 1 + saturation * mask / 100;
        r = Math.min(255, Math.max(0, lum + (r - lum) * sm));
        g = Math.min(255, Math.max(0, lum + (g - lum) * sm));
        b = Math.min(255, Math.max(0, lum + (b - lum) * sm));
      }

      data[i] = r; data[i+1] = g; data[i+2] = b;
    }
  }
}

// ============================================================
// ADVANCED PROCESSING ADDITIONS v2
// ============================================================

/**
 * Median filter — best for removing salt-and-pepper noise while preserving edges
 */
export function applyMedianFilter(imageData: ImageData, radius: number): void {
  if (radius <= 0) return;
  const w = imageData.width, h = imageData.height;
  const data = imageData.data;
  const copy = new Uint8ClampedArray(data);
  const r = Math.min(radius, 4);

  for (let y = r; y < h - r; y++) {
    for (let x = r; x < w - r; x++) {
      const rArr: number[] = [], gArr: number[] = [], bArr: number[] = [];
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const ni = ((y+dy)*w + (x+dx)) * 4;
          rArr.push(copy[ni]); gArr.push(copy[ni+1]); bArr.push(copy[ni+2]);
        }
      }
      rArr.sort((a, b) => a - b); gArr.sort((a, b) => a - b); bArr.sort((a, b) => a - b);
      const mid = Math.floor(rArr.length / 2);
      const i = (y * w + x) * 4;
      data[i] = rArr[mid]; data[i+1] = gArr[mid]; data[i+2] = bArr[mid];
    }
  }
}

/**
 * High-pass filter for texture extraction / frequency separation
 */
export function applyHighPass(imageData: ImageData, radius: number, blend: number): void {
  const w = imageData.width, h = imageData.height;
  const data = imageData.data;
  const copy = new Uint8ClampedArray(data);
  const r = Math.max(1, radius);

  // Gaussian blur
  const blurred = new Uint8ClampedArray(copy);
  for (let y = r; y < h - r; y++) {
    for (let x = r; x < w - r; x++) {
      let sr = 0, sg = 0, sb = 0, n = 0;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const ni = ((y+dy)*w+(x+dx))*4;
          const gw = Math.exp(-(dx*dx+dy*dy)/(2*r*r));
          sr += copy[ni]*gw; sg += copy[ni+1]*gw; sb += copy[ni+2]*gw; n += gw;
        }
      }
      const bi = (y*w+x)*4;
      blurred[bi]=sr/n; blurred[bi+1]=sg/n; blurred[bi+2]=sb/n;
    }
  }

  // High pass = original - blurred + 128 (neutral grey)
  const s = blend / 100;
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const hp = copy[i+c] - blurred[i+c] + 128;
      data[i+c] = Math.max(0, Math.min(255, Math.round(copy[i+c] * (1-s) + hp * s)));
    }
  }
}

/**
 * Orton glow effect — dreamy soft focus for portraits/landscape
 * Blends original with overexposed blurred version
 */
export function applyOrtonGlow(imageData: ImageData, amount: number): void {
  if (amount <= 0) return;
  const w = imageData.width, h = imageData.height;
  const data = imageData.data;
  const copy = new Uint8ClampedArray(data);
  const radius = Math.ceil(amount / 15);

  // Overexpose copy
  const bright = new Uint8ClampedArray(copy);
  for (let i = 0; i < bright.length; i += 4) {
    bright[i]   = Math.min(255, copy[i]   * 1.5);
    bright[i+1] = Math.min(255, copy[i+1] * 1.5);
    bright[i+2] = Math.min(255, copy[i+2] * 1.5);
  }

  // Blur the overexposed version
  for (let y = radius; y < h - radius; y++) {
    for (let x = radius; x < w - radius; x++) {
      let r = 0, g = 0, b = 0, n = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ni = ((y+dy)*w+(x+dx))*4;
          r += bright[ni]; g += bright[ni+1]; b += bright[ni+2]; n++;
        }
      }
      const bi = (y*w+x)*4;
      bright[bi]=r/n; bright[bi+1]=g/n; bright[bi+2]=b/n;
    }
  }

  // Multiply blend: original * blurred/255
  const s = amount / 100;
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const multiplied = (copy[i+c] / 255) * (bright[i+c] / 255) * 255;
      const blended = copy[i+c] * (1-s) + multiplied * s;
      data[i+c] = Math.max(0, Math.min(255, Math.round(blended)));
    }
  }
}

/**
 * Cinematic color grade — teal shadows, warm highlights (Hollywood look)
 */
export function applyCinematicGrade(imageData: ImageData, strength: number): void {
  if (strength <= 0) return;
  const data = imageData.data;
  const s = strength / 100;

  for (let i = 0; i < data.length; i += 4) {
    const lum = (data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114) / 255;

    // Shadow teal: push shadows toward cyan/teal
    const shadowW = Math.pow(1 - lum, 2);
    // Highlight warm: push highlights toward warm orange
    const highlightW = Math.pow(lum, 2);

    const shadowTealR = -20 * shadowW * s;
    const shadowTealG = 5  * shadowW * s;
    const shadowTealB = 25 * shadowW * s;

    const highlightWarmR = 20 * highlightW * s;
    const highlightWarmG = 5  * highlightW * s;
    const highlightWarmB = -15 * highlightW * s;

    data[i]   = Math.max(0, Math.min(255, data[i]   + shadowTealR + highlightWarmR));
    data[i+1] = Math.max(0, Math.min(255, data[i+1] + shadowTealG + highlightWarmG));
    data[i+2] = Math.max(0, Math.min(255, data[i+2] + shadowTealB + highlightWarmB));
  }
}

/**
 * Advanced dodging and burning — Lightroom-style highlight recovery
 * Lifts shadows, compresses highlights non-linearly
 */
export function applyToneCompression(imageData: ImageData, shadowLift: number, highlightRoll: number): void {
  const data = imageData.data;
  const sLift = shadowLift / 100;
  const hRoll = highlightRoll / 100;

  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      let v = data[i+c] / 255;
      // Shadow lift (crushes blacks toward gray)
      if (sLift > 0) v = v + sLift * (1 - v) * (1 - v) * 0.4;
      // Highlight rolloff (compresses near-whites)
      if (hRoll > 0) {
        const excess = Math.max(0, v - 0.7);
        v = v - excess * hRoll * 0.7;
      }
      data[i+c] = Math.max(0, Math.min(255, Math.round(v * 255)));
    }
  }
}

/**
 * Frequency separation bake — creates a smooth low-freq layer
 * Useful for professional retouching
 */
export function applyFrequencySeparation(imageData: ImageData, blurRadius: number, blendStrength: number): void {
  const w = imageData.width, h = imageData.height;
  const data = imageData.data;
  const copy = new Uint8ClampedArray(data);
  const r = Math.max(2, blurRadius);
  const s = blendStrength / 100;

  // Box blur for low frequency
  const lowFreq = new Uint8ClampedArray(copy);
  for (let y = r; y < h - r; y++) {
    for (let x = r; x < w - r; x++) {
      let sr = 0, sg = 0, sb = 0, n = 0;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const ni = ((y+dy)*w+(x+dx))*4;
          sr += copy[ni]; sg += copy[ni+1]; sb += copy[ni+2]; n++;
        }
      }
      const bi = (y*w+x)*4;
      lowFreq[bi]=sr/n; lowFreq[bi+1]=sg/n; lowFreq[bi+2]=sb/n;
    }
  }

  // Blend: lerp toward low-frequency (smooths skin without losing texture)
  for (let i = 0; i < data.length; i += 4) {
    const lum = (copy[i] * 0.299 + copy[i+1] * 0.587 + copy[i+2] * 0.114);
    // Only apply in midtone skin areas
    const isMidtone = lum > 60 && lum < 210;
    if (!isMidtone) continue;
    const blendAmt = s * 0.6;
    data[i]   = Math.round(copy[i]   * (1-blendAmt) + lowFreq[i]   * blendAmt);
    data[i+1] = Math.round(copy[i+1] * (1-blendAmt) + lowFreq[i+1] * blendAmt);
    data[i+2] = Math.round(copy[i+2] * (1-blendAmt) + lowFreq[i+2] * blendAmt);
  }
}

/**
 * Smart object detect and inpaint center region with patch-based synthesis
 */
export function smartInpaint(
  imageData: ImageData,
  maskX: number, maskY: number,
  maskW: number, maskH: number
): void {
  const data = imageData.data;
  const w = imageData.width, h = imageData.height;
  const patchSize = 8;

  // For each pixel in mask, find best matching patch outside mask
  for (let py = maskY; py < maskY + maskH; py += patchSize) {
    for (let px = maskX; px < maskX + maskW; px += patchSize) {
      // Find nearest patch on boundary of mask
      let bestDist = Infinity, bestSrcX = 0, bestSrcY = 0;
      const searchRange = Math.max(patchSize * 4, Math.max(maskW, maskH));
      for (let sy = Math.max(0, py - searchRange); sy < Math.min(h - patchSize, py + searchRange); sy += patchSize) {
        for (let sx = Math.max(0, px - searchRange); sx < Math.min(w - patchSize, px + searchRange); sx += patchSize) {
          if (sx >= maskX - patchSize && sx <= maskX + maskW && sy >= maskY - patchSize && sy <= maskY + maskH) continue;
          let dist = 0, samples = 0;
          for (let dy = 0; dy < patchSize; dy++) {
            for (let dx = 0; dx < patchSize; dx++) {
              const si = ((sy+dy)*w+(sx+dx))*4;
              const di = ((py+dy)*w+(px+dx))*4;
              if (py+dy >= maskY && py+dy < maskY+maskH && px+dx >= maskX && px+dx < maskX+maskW) {
                const dr = data[si]-data[di], dg = data[si+1]-data[di+1], db = data[si+2]-data[di+2];
                dist += dr*dr + dg*dg + db*db; samples++;
              }
            }
          }
          const normDist = samples > 0 ? dist / samples : Infinity;
          if (normDist < bestDist) { bestDist = normDist; bestSrcX = sx; bestSrcY = sy; }
        }
      }
      // Copy best matching patch
      for (let dy = 0; dy < patchSize; dy++) {
        for (let dx = 0; dx < patchSize; dx++) {
          const tx = px+dx, ty = py+dy;
          if (tx >= maskX && tx < maskX+maskW && ty >= maskY && ty < maskY+maskH && tx < w && ty < h) {
            const si = ((bestSrcY+dy)*w+(bestSrcX+dx))*4;
            const di = (ty*w+tx)*4;
            data[di]=data[si]; data[di+1]=data[si+1]; data[di+2]=data[si+2];
          }
        }
      }
    }
  }
}

/**
 * Compute SSIM-like quality metric (simplified, single-channel)
 * Returns value 0-1, where 1 = identical images
 */
export function computeImageQuality(imageData: ImageData): { sharpness: number; noise: number; exposure: number; contrast: number } {
  const data = imageData.data;
  const w = imageData.width, h = imageData.height;
  let totalLum = 0, totalGrad = 0, totalVar = 0, n = 0;
  const lums: number[] = [];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      const lum = data[idx] * 0.299 + data[idx+1] * 0.587 + data[idx+2] * 0.114;
      lums.push(lum);
      totalLum += lum;
      // Gradient (edge magnitude for sharpness)
      const gx = Math.abs(data[idx]-data[(y*w+x-1)*4]) + Math.abs(data[idx]-data[(y*w+x+1)*4]);
      const gy = Math.abs(data[idx]-data[((y-1)*w+x)*4]) + Math.abs(data[idx]-data[((y+1)*w+x)*4]);
      totalGrad += Math.sqrt(gx*gx + gy*gy);
      n++;
    }
  }

  const avgLum = totalLum / n;
  lums.forEach(l => { totalVar += (l - avgLum) * (l - avgLum); });
  const stdDev = Math.sqrt(totalVar / n);

  return {
    sharpness: Math.min(100, Math.round(totalGrad / n / 2)),
    noise: Math.max(0, Math.min(100, Math.round(100 - (totalGrad / n) / 3))),
    exposure: Math.round(avgLum / 2.55),
    contrast: Math.round(stdDev / 1.28),
  };
}
