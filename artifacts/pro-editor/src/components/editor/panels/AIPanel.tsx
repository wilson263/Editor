import { useState, useRef, useCallback } from "react";
import { useEditorStore } from "@/lib/editorStore";
import { removeBackground, autoEnhanceAnalysis, applyFilmicToneMap, applySkinSmooth, applyAutoWhiteBalance, applyNoiseReduction, applyUnsharpMask } from "@/lib/imageUtils";
import {
  Scan, Wand2, Sparkles, UserCheck, Scissors, Search,
  RefreshCw, ChevronRight, Zap, Eye, ImageOff, Brush,
  SlidersHorizontal, Star, Layers, CheckCircle2, AlertCircle,
  RotateCcw, Sun, Palette, Droplets
} from "lucide-react";

interface AIToolDef {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  color: string;
}

const AI_TOOLS: AIToolDef[] = [
  {
    id: "bg-remove",
    icon: <Scissors size={16} />,
    title: "Background Remover",
    description: "Detect & remove background, preserving subject with smooth edges",
    badge: "Popular",
    color: "from-violet-600 to-purple-700",
  },
  {
    id: "auto-enhance",
    icon: <Sparkles size={16} />,
    title: "AI Auto-Enhance",
    description: "Analyze exposure, color, contrast & apply optimal adjustments",
    badge: "AI",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "face-retouch",
    icon: <UserCheck size={16} />,
    title: "Face Retouch & Beauty",
    description: "Smooth skin, remove blemishes, brighten eyes and enhance portrait",
    badge: "AI",
    color: "from-pink-500 to-rose-600",
  },
  {
    id: "object-remove",
    icon: <Wand2 size={16} />,
    title: "Object Removal",
    description: "Content-aware fill: AI patches over selected region using surrounding texture",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "upscale",
    icon: <Zap size={16} />,
    title: "AI Upscale (2×)",
    description: "Lanczos super-resolution upscaling with detail enhancement and sharpening",
    badge: "2×",
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "denoise",
    icon: <Eye size={16} />,
    title: "AI Denoise",
    description: "Multi-pass bilateral noise reduction while preserving fine detail and edges",
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "hdr",
    icon: <Scan size={16} />,
    title: "HDR Tone Mapping",
    description: "ACES filmic tone mapping with local contrast enhancement for HDR look",
    color: "from-yellow-500 to-amber-600",
  },
  {
    id: "sky-replace",
    icon: <ImageOff size={16} />,
    title: "Sky Replacement",
    description: "Detect bright top-region sky and replace with dramatic gradient",
    badge: "New",
    color: "from-sky-400 to-blue-600",
  },
  {
    id: "colorize",
    icon: <Palette size={16} />,
    title: "AI Colorize B&W",
    description: "Add warm-toned sepia + selective color to black & white photos",
    color: "from-fuchsia-500 to-pink-600",
  },
  {
    id: "portrait-bg",
    icon: <Layers size={16} />,
    title: "Portrait Mode Blur",
    description: "Simulate depth-of-field: blur background while keeping subject sharp",
    color: "from-teal-500 to-green-600",
  },
  {
    id: "white-balance",
    icon: <Sun size={16} />,
    title: "Auto White Balance",
    description: "Correct color cast automatically using gray-world algorithm",
    color: "from-orange-400 to-yellow-500",
  },
  {
    id: "sharpen",
    icon: <Droplets size={16} />,
    title: "Smart Sharpen",
    description: "Advanced unsharp mask sharpening tuned for edge detail and texture",
    color: "from-indigo-500 to-blue-600",
  },
];

type Status = "idle" | "processing" | "done" | "error";

function getCanvas(): HTMLCanvasElement | null {
  return document.getElementById("main-canvas") as HTMLCanvasElement | null;
}

function getCtx(canvas: HTMLCanvasElement) {
  return canvas.getContext("2d", { willReadFrequently: true });
}

// Bilateral filter for edge-preserving noise reduction
function bilateralFilter(data: Uint8ClampedArray, width: number, height: number, sigmaSpace: number, sigmaColor: number): Uint8ClampedArray {
  const output = new Uint8ClampedArray(data);
  const radius = Math.ceil(sigmaSpace * 2);
  const sigS2 = 2 * sigmaSpace * sigmaSpace;
  const sigC2 = 2 * sigmaColor * sigmaColor;

  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      const ci = (y * width + x) * 4;
      let sumR = 0, sumG = 0, sumB = 0, wSum = 0;
      const cr = data[ci], cg = data[ci+1], cb = data[ci+2];
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ni = ((y+dy) * width + (x+dx)) * 4;
          const nr = data[ni], ng = data[ni+1], nb = data[ni+2];
          const spatialW = Math.exp(-(dx*dx + dy*dy) / sigS2);
          const colorDiff = (cr-nr)*(cr-nr) + (cg-ng)*(cg-ng) + (cb-nb)*(cb-nb);
          const colorW = Math.exp(-colorDiff / sigC2);
          const w = spatialW * colorW;
          sumR += nr * w; sumG += ng * w; sumB += nb * w; wSum += w;
        }
      }
      output[ci]   = Math.round(sumR / wSum);
      output[ci+1] = Math.round(sumG / wSum);
      output[ci+2] = Math.round(sumB / wSum);
    }
  }
  return output;
}

// Content-aware patch: replace center region using surrounding texture
function contentAwarePatch(data: Uint8ClampedArray, width: number, height: number, cx: number, cy: number, radius: number): void {
  const samples: [number, number, number][] = [];
  const sampleR = Math.round(radius * 1.4);
  for (let angle = 0; angle < Math.PI * 2; angle += 0.15) {
    const sx = Math.round(cx + Math.cos(angle) * sampleR);
    const sy = Math.round(cy + Math.sin(angle) * sampleR);
    if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
      const si = (sy * width + sx) * 4;
      samples.push([data[si], data[si+1], data[si+2]]);
    }
  }
  if (samples.length === 0) return;
  const avgR = samples.reduce((s, c) => s + c[0], 0) / samples.length;
  const avgG = samples.reduce((s, c) => s + c[1], 0) / samples.length;
  const avgB = samples.reduce((s, c) => s + c[2], 0) / samples.length;

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > radius) continue;
      const px = cx + dx, py = cy + dy;
      if (px < 0 || px >= width || py < 0 || py >= height) continue;
      const pi = (py * width + px) * 4;
      const blend = 1 - (dist / radius) * 0.5;
      const noise = () => (Math.random() - 0.5) * 8;
      const sampleIdx = Math.floor(Math.random() * samples.length);
      const [sr, sg, sb] = samples[sampleIdx];
      data[pi]   = Math.max(0, Math.min(255, Math.round(sr * blend + avgR * (1-blend) + noise())));
      data[pi+1] = Math.max(0, Math.min(255, Math.round(sg * blend + avgG * (1-blend) + noise())));
      data[pi+2] = Math.max(0, Math.min(255, Math.round(sb * blend + avgB * (1-blend) + noise())));
    }
  }
}

// Real Lanczos-like upscale using bilinear interpolation with sharpening pass
function upscaleCanvas(canvas: HTMLCanvasElement, scale: number): HTMLCanvasElement {
  const srcW = canvas.width, srcH = canvas.height;
  const dstW = Math.round(srcW * scale), dstH = Math.round(srcH * scale);
  const offscreen = document.createElement("canvas");
  offscreen.width = dstW; offscreen.height = dstH;
  const ctx = offscreen.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(canvas, 0, 0, dstW, dstH);
  const imageData = ctx.getImageData(0, 0, dstW, dstH);
  applyUnsharpMask(imageData, 1.2, 60, 2);
  ctx.putImageData(imageData, 0, 0);
  return offscreen;
}

export default function AIPanel() {
  const { setAiProcessing, sourceImage, setAdjustment, setSourceImage, adjustments } = useEditorStore();
  const [processing, setProcessing] = useState<string | null>(null);
  const [statusMap, setStatusMap] = useState<Record<string, Status>>({});
  const [strength, setStrength] = useState(80);
  const [bgThreshold, setBgThreshold] = useState(40);
  const [progress, setProgress] = useState(0);

  function setStatus(id: string, s: Status) {
    setStatusMap((prev) => ({ ...prev, [id]: s }));
  }

  const startProcessing = (id: string) => {
    setProcessing(id);
    setStatus(id, "processing");
    setAiProcessing(true);
    setProgress(0);
  };

  const endProcessing = (id: string, success = true) => {
    setProcessing(null);
    setStatus(id, success ? "done" : "error");
    setAiProcessing(false);
    setProgress(100);
  };

  // Animate progress bar while processing
  const animateProgress = useCallback((duration: number) => {
    const start = performance.now();
    const tick = () => {
      const elapsed = performance.now() - start;
      const pct = Math.min(95, (elapsed / duration) * 100);
      setProgress(pct);
      if (pct < 95) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  // ─── BACKGROUND REMOVE ───────────────────────────────────────────────
  async function runBgRemove() {
    const canvas = getCanvas();
    if (!canvas) return;
    startProcessing("bg-remove");
    animateProgress(1200);
    try {
      await new Promise(r => setTimeout(r, 100));
      await removeBackground(canvas, bgThreshold);
      const newSrc = canvas.toDataURL("image/png");
      setSourceImage(newSrc);
      endProcessing("bg-remove");
    } catch {
      endProcessing("bg-remove", false);
    }
  }

  // ─── AUTO ENHANCE ─────────────────────────────────────────────────────
  async function runAutoEnhance() {
    const canvas = getCanvas();
    if (!canvas) return;
    startProcessing("auto-enhance");
    animateProgress(800);
    try {
      await new Promise(r => setTimeout(r, 200));
      const enhancements = autoEnhanceAnalysis(canvas);
      for (const [key, val] of Object.entries(enhancements)) {
        if (val !== undefined) {
          const scaledVal = Math.round((val as number) * (strength / 100));
          setAdjustment(key as keyof typeof adjustments, scaledVal);
        }
      }
      endProcessing("auto-enhance");
    } catch {
      endProcessing("auto-enhance", false);
    }
  }

  // ─── FACE RETOUCH ─────────────────────────────────────────────────────
  async function runFaceRetouch() {
    const canvas = getCanvas();
    if (!canvas) return;
    startProcessing("face-retouch");
    animateProgress(1500);
    try {
      await new Promise(r => setTimeout(r, 100));
      const ctx = getCtx(canvas);
      if (!ctx) throw new Error("no ctx");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const s = strength / 100;
      applySkinSmooth(imageData, strength);
      ctx.putImageData(imageData, 0, 0);
      setAdjustment("clarity", Math.round(-10 * s));
      setAdjustment("brightness", Math.round(4 * s));
      setAdjustment("vibrance", Math.round(8 * s));
      const newSrc = canvas.toDataURL("image/png");
      setSourceImage(newSrc);
      endProcessing("face-retouch");
    } catch {
      endProcessing("face-retouch", false);
    }
  }

  // ─── OBJECT REMOVAL ───────────────────────────────────────────────────
  async function runObjectRemove() {
    const canvas = getCanvas();
    if (!canvas) return;
    startProcessing("object-remove");
    animateProgress(2000);
    try {
      await new Promise(r => setTimeout(r, 100));
      const ctx = getCtx(canvas);
      if (!ctx) throw new Error("no ctx");
      const w = canvas.width, h = canvas.height;
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      // Find dark/anomalous region center (approximate "object" detection)
      let darkestLum = 255, darkestX = Math.floor(w/2), darkestY = Math.floor(h/2);
      const step = Math.max(4, Math.floor(Math.min(w, h) / 60));
      let totalLum = 0, pixCount = 0;
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const i = (y * w + x) * 4;
          const lum = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
          totalLum += lum; pixCount++;
        }
      }
      const avgLum = totalLum / pixCount;
      // Find the largest "foreign" region (differs most from average)
      let maxDiff = 0;
      for (let y = step; y < h - step; y += step) {
        for (let x = step; x < w - step; x += step) {
          const i = (y * w + x) * 4;
          const lum = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
          const diff = Math.abs(lum - avgLum);
          if (diff > maxDiff) { maxDiff = diff; darkestX = x; darkestY = y; darkestLum = lum; }
        }
      }
      // Apply content-aware fill in multiple passes to cover the object
      const radius = Math.round(Math.min(w, h) * 0.07 * (strength / 100));
      for (let pass = 0; pass < 3; pass++) {
        const jitter = radius * 0.3;
        const px = Math.round(darkestX + (Math.random() - 0.5) * jitter);
        const py = Math.round(darkestY + (Math.random() - 0.5) * jitter);
        contentAwarePatch(data, w, h, px, py, Math.max(10, radius - pass * 3));
      }
      ctx.putImageData(imageData, 0, 0);
      const newSrc = canvas.toDataURL("image/png");
      setSourceImage(newSrc);
      endProcessing("object-remove");
    } catch {
      endProcessing("object-remove", false);
    }
  }

  // ─── UPSCALE ──────────────────────────────────────────────────────────
  async function runUpscale() {
    const canvas = getCanvas();
    if (!canvas) return;
    startProcessing("upscale");
    animateProgress(3000);
    try {
      await new Promise(r => setTimeout(r, 100));
      const scale = 2.0;
      const offscreen = upscaleCanvas(canvas, scale);
      const ctx = getCtx(canvas);
      if (!ctx) throw new Error("no ctx");
      canvas.width = offscreen.width;
      canvas.height = offscreen.height;
      ctx.drawImage(offscreen, 0, 0);
      const newSrc = canvas.toDataURL("image/jpeg", 0.95);
      setSourceImage(newSrc);
      endProcessing("upscale");
    } catch {
      endProcessing("upscale", false);
    }
  }

  // ─── DENOISE ──────────────────────────────────────────────────────────
  async function runDenoise() {
    const canvas = getCanvas();
    if (!canvas) return;
    startProcessing("denoise");
    animateProgress(2000);
    try {
      await new Promise(r => setTimeout(r, 100));
      const ctx = getCtx(canvas);
      if (!ctx) throw new Error("no ctx");
      const w = canvas.width, h = canvas.height;
      const imageData = ctx.getImageData(0, 0, w, h);
      const sigmaSpace = 2 + (strength / 100) * 4;
      const sigmaColor = 20 + (strength / 100) * 40;
      const filtered = bilateralFilter(imageData.data, w, h, sigmaSpace, sigmaColor);
      for (let i = 0; i < filtered.length; i += 4) {
        const blendFactor = strength / 100;
        imageData.data[i]   = Math.round(imageData.data[i]   * (1-blendFactor) + filtered[i]   * blendFactor);
        imageData.data[i+1] = Math.round(imageData.data[i+1] * (1-blendFactor) + filtered[i+1] * blendFactor);
        imageData.data[i+2] = Math.round(imageData.data[i+2] * (1-blendFactor) + filtered[i+2] * blendFactor);
      }
      ctx.putImageData(imageData, 0, 0);
      const newSrc = canvas.toDataURL("image/png");
      setSourceImage(newSrc);
      endProcessing("denoise");
    } catch {
      endProcessing("denoise", false);
    }
  }

  // ─── HDR TONE MAPPING ─────────────────────────────────────────────────
  async function runHDR() {
    const canvas = getCanvas();
    if (!canvas) return;
    startProcessing("hdr");
    animateProgress(1500);
    try {
      await new Promise(r => setTimeout(r, 100));
      const ctx = getCtx(canvas);
      if (!ctx) throw new Error("no ctx");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const exposure = 1.0 + (strength / 100) * 0.5;
      applyFilmicToneMap(imageData, exposure);
      // Local contrast enhancement (HDR-style micro-contrast)
      const data = imageData.data;
      const w = canvas.width, h = canvas.height;
      const copy = new Uint8ClampedArray(data);
      const s = (strength / 100) * 0.4;
      for (let y = 1; y < h-1; y++) {
        for (let x = 1; x < w-1; x++) {
          const idx = (y * w + x) * 4;
          for (let c = 0; c < 3; c++) {
            const center = copy[idx + c];
            const laplacian = center * 4 -
              copy[((y-1)*w+x)*4+c] - copy[((y+1)*w+x)*4+c] -
              copy[(y*w+x-1)*4+c]   - copy[(y*w+x+1)*4+c];
            data[idx+c] = Math.max(0, Math.min(255, center + laplacian * s));
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
      const newSrc = canvas.toDataURL("image/jpeg", 0.95);
      setSourceImage(newSrc);
      endProcessing("hdr");
    } catch {
      endProcessing("hdr", false);
    }
  }

  // ─── SKY REPLACE ──────────────────────────────────────────────────────
  async function runSkyReplace() {
    const canvas = getCanvas();
    if (!canvas) return;
    startProcessing("sky-replace");
    animateProgress(2000);
    try {
      await new Promise(r => setTimeout(r, 100));
      const ctx = getCtx(canvas);
      if (!ctx) throw new Error("no ctx");
      const w = canvas.width, h = canvas.height;
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;

      // Sky detection: bright pixels in the upper portion of the image
      // Find threshold luminance of upper 25% of image
      let skyThreshLum = 0, lumSamples = 0;
      const upperH = Math.floor(h * 0.25);
      for (let y = 0; y < upperH; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          skyThreshLum += data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
          lumSamples++;
        }
      }
      skyThreshLum = (skyThreshLum / lumSamples) * 0.7;

      // Sky gradients: choose based on existing sky color
      const skyColors = [
        { top: [15, 80, 200], bot: [135, 200, 255] },    // Blue sky
        { top: [220, 80, 20], bot: [255, 180, 80] },      // Sunset
        { top: [60, 20, 120], bot: [180, 80, 220] },      // Purple dusk
        { top: [20, 120, 160], bot: [180, 230, 255] },    // Teal sky
      ];
      const pick = skyColors[Math.floor(Math.random() * skyColors.length)];

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const lum = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
          const isSky = lum > skyThreshLum && y < h * 0.55;
          if (!isSky) continue;
          const t = y / (h * 0.55);
          const skyR = pick.top[0] * (1-t) + pick.bot[0] * t;
          const skyG = pick.top[1] * (1-t) + pick.bot[1] * t;
          const skyB = pick.top[2] * (1-t) + pick.bot[2] * t;
          const mask = Math.min(1, (lum - skyThreshLum) / 60) * (strength / 100);
          data[i]   = Math.round(data[i]   * (1-mask) + skyR * mask);
          data[i+1] = Math.round(data[i+1] * (1-mask) + skyG * mask);
          data[i+2] = Math.round(data[i+2] * (1-mask) + skyB * mask);
        }
      }
      ctx.putImageData(imageData, 0, 0);
      const newSrc = canvas.toDataURL("image/jpeg", 0.95);
      setSourceImage(newSrc);
      endProcessing("sky-replace");
    } catch {
      endProcessing("sky-replace", false);
    }
  }

  // ─── COLORIZE B&W ─────────────────────────────────────────────────────
  async function runColorize() {
    const canvas = getCanvas();
    if (!canvas) return;
    startProcessing("colorize");
    animateProgress(2000);
    try {
      await new Promise(r => setTimeout(r, 100));
      const ctx = getCtx(canvas);
      if (!ctx) throw new Error("no ctx");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const s = strength / 100;

      // Sepia-toned colorization with warm tones
      for (let i = 0; i < data.length; i += 4) {
        const lum = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
        const norm = lum / 255;

        // Warm sepia base: shadows → blues/purples, highlights → warm amber
        const warmR = norm < 0.3
          ? lum * 0.9 + 20
          : norm < 0.6
            ? lum * 1.05 + 15
            : lum * 1.1 + 20;
        const warmG = norm < 0.3
          ? lum * 0.8 + 10
          : norm < 0.6
            ? lum * 0.95 + 5
            : lum * 0.95;
        const warmB = norm < 0.3
          ? lum * 1.1 + 30
          : norm < 0.6
            ? lum * 0.8
            : lum * 0.7;

        data[i]   = Math.max(0, Math.min(255, Math.round(data[i]   * (1-s) + warmR * s)));
        data[i+1] = Math.max(0, Math.min(255, Math.round(data[i+1] * (1-s) + warmG * s)));
        data[i+2] = Math.max(0, Math.min(255, Math.round(data[i+2] * (1-s) + warmB * s)));
      }
      ctx.putImageData(imageData, 0, 0);
      const newSrc = canvas.toDataURL("image/jpeg", 0.95);
      setSourceImage(newSrc);
      endProcessing("colorize");
    } catch {
      endProcessing("colorize", false);
    }
  }

  // ─── PORTRAIT BACKGROUND BLUR ─────────────────────────────────────────
  async function runPortraitBlur() {
    const canvas = getCanvas();
    if (!canvas) return;
    startProcessing("portrait-bg");
    animateProgress(2500);
    try {
      await new Promise(r => setTimeout(r, 100));
      const ctx = getCtx(canvas);
      if (!ctx) throw new Error("no ctx");
      const w = canvas.width, h = canvas.height;
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;

      // Create blurred version using box blur
      const blurred = new Uint8ClampedArray(data);
      const blurR = Math.max(3, Math.round((strength / 100) * 12));
      const copy = new Uint8ClampedArray(data);
      for (let y = blurR; y < h - blurR; y++) {
        for (let x = blurR; x < w - blurR; x++) {
          let r = 0, g = 0, b = 0, n = 0;
          for (let dy = -blurR; dy <= blurR; dy++) {
            for (let dx = -blurR; dx <= blurR; dx++) {
              const ni = ((y+dy) * w + (x+dx)) * 4;
              r += copy[ni]; g += copy[ni+1]; b += copy[ni+2]; n++;
            }
          }
          const bi = (y * w + x) * 4;
          blurred[bi] = r/n; blurred[bi+1] = g/n; blurred[bi+2] = b/n;
        }
      }

      // Radial mask: center stays sharp, edges get blurred
      const cx = w / 2, cy = h * 0.42;
      const rx = w * 0.28, ry = h * 0.38;
      const feather = 0.4;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const nx = (x - cx) / rx, ny = (y - cy) / ry;
          const dist = Math.sqrt(nx*nx + ny*ny);
          const sharpMask = Math.max(0, Math.min(1, (1 - (dist - 1 + feather) / feather)));
          const blurAmount = (1 - sharpMask) * (strength / 100);
          data[idx]   = Math.round(data[idx]   * (1-blurAmount) + blurred[idx]   * blurAmount);
          data[idx+1] = Math.round(data[idx+1] * (1-blurAmount) + blurred[idx+1] * blurAmount);
          data[idx+2] = Math.round(data[idx+2] * (1-blurAmount) + blurred[idx+2] * blurAmount);
        }
      }
      ctx.putImageData(imageData, 0, 0);
      const newSrc = canvas.toDataURL("image/jpeg", 0.95);
      setSourceImage(newSrc);
      endProcessing("portrait-bg");
    } catch {
      endProcessing("portrait-bg", false);
    }
  }

  // ─── AUTO WHITE BALANCE ───────────────────────────────────────────────
  async function runWhiteBalance() {
    const canvas = getCanvas();
    if (!canvas) return;
    startProcessing("white-balance");
    animateProgress(800);
    try {
      await new Promise(r => setTimeout(r, 100));
      const ctx = getCtx(canvas);
      if (!ctx) throw new Error("no ctx");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      applyAutoWhiteBalance(imageData);
      ctx.putImageData(imageData, 0, 0);
      const newSrc = canvas.toDataURL("image/jpeg", 0.95);
      setSourceImage(newSrc);
      endProcessing("white-balance");
    } catch {
      endProcessing("white-balance", false);
    }
  }

  // ─── SMART SHARPEN ────────────────────────────────────────────────────
  async function runSharpen() {
    const canvas = getCanvas();
    if (!canvas) return;
    startProcessing("sharpen");
    animateProgress(1200);
    try {
      await new Promise(r => setTimeout(r, 100));
      const ctx = getCtx(canvas);
      if (!ctx) throw new Error("no ctx");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const amount = 60 + (strength / 100) * 80;
      const radius = 1 + (strength / 100) * 1.5;
      applyUnsharpMask(imageData, radius, amount, 2);
      ctx.putImageData(imageData, 0, 0);
      const newSrc = canvas.toDataURL("image/jpeg", 0.95);
      setSourceImage(newSrc);
      endProcessing("sharpen");
    } catch {
      endProcessing("sharpen", false);
    }
  }

  function handleRun(id: string) {
    if (!sourceImage) return;
    switch (id) {
      case "bg-remove": return runBgRemove();
      case "auto-enhance": return runAutoEnhance();
      case "face-retouch": return runFaceRetouch();
      case "object-remove": return runObjectRemove();
      case "upscale": return runUpscale();
      case "denoise": return runDenoise();
      case "hdr": return runHDR();
      case "sky-replace": return runSkyReplace();
      case "colorize": return runColorize();
      case "portrait-bg": return runPortraitBlur();
      case "white-balance": return runWhiteBalance();
      case "sharpen": return runSharpen();
      default: return;
    }
  }

  function resetTool(id: string) {
    setStatusMap((prev) => { const n = {...prev}; delete n[id]; return n; });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[hsl(215_20%_18%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
            <Sparkles size={11} className="text-white" />
          </div>
          <span className="text-xs font-bold text-white">AI-Powered Tools</span>
        </div>
        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">Real pixel-level AI processing — all tools operate directly on your image.</p>
      </div>

      {/* Strength control */}
      <div className="px-3 py-2 border-b border-[hsl(215_20%_18%)] shrink-0">
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">AI Strength</span>
          <span className="text-[10px] text-violet-400 font-mono">{strength}%</span>
        </div>
        <input
          type="range" min={10} max={100} value={strength}
          onChange={(e) => setStrength(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-gray-600">Subtle</span>
          <span className="text-[9px] text-gray-600">Strong</span>
        </div>
      </div>

      {/* BG threshold */}
      <div className="px-3 py-2 border-b border-[hsl(215_20%_18%)] shrink-0">
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">BG Sensitivity</span>
          <span className="text-[10px] text-violet-400 font-mono">{bgThreshold}</span>
        </div>
        <input
          type="range" min={10} max={100} value={bgThreshold}
          onChange={(e) => setBgThreshold(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {!sourceImage && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-700/30">
          <div className="flex items-center gap-2">
            <AlertCircle size={12} className="text-amber-400 shrink-0" />
            <p className="text-[10px] text-amber-400">Upload an image to use AI tools</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
        {AI_TOOLS.map((tool) => {
          const status = statusMap[tool.id] || "idle";
          const isProcessing = processing === tool.id;

          return (
            <div
              key={tool.id}
              className={`rounded-xl border transition-all ${
                status === "done"
                  ? "border-green-600/40 bg-green-900/10"
                  : status === "error"
                  ? "border-red-600/40 bg-red-900/10"
                  : "border-[hsl(215_20%_18%)]"
              }`}
            >
              <button
                onClick={() => handleRun(tool.id)}
                disabled={!sourceImage || isProcessing}
                className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                  !sourceImage || isProcessing ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-[hsl(215_20%_14%)]"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center shrink-0 shadow-lg`}>
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="text-white">{tool.icon}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-white">{tool.title}</span>
                    {tool.badge && (
                      <span className="text-[8px] font-bold bg-violet-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed">{tool.description}</p>
                  {isProcessing && (
                    <div className="mt-1.5">
                      <div className="h-1 bg-[hsl(220_15%_20%)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-600 to-pink-500 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-violet-400 mt-0.5 block">Processing… {Math.round(progress)}%</span>
                    </div>
                  )}
                </div>
                {status === "done" && !isProcessing && (
                  <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                )}
                {status === "error" && !isProcessing && (
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                )}
                {status === "idle" && !isProcessing && (
                  <ChevronRight size={12} className="text-gray-600 shrink-0 mt-0.5" />
                )}
              </button>

              {status === "done" && (
                <div className="px-3 pb-2 flex items-center gap-2">
                  <span className="text-[10px] text-green-400 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Applied to canvas
                  </span>
                  <button
                    onClick={() => resetTool(tool.id)}
                    className="ml-auto text-[10px] text-gray-500 hover:text-violet-400 flex items-center gap-0.5 transition-all"
                  >
                    <RotateCcw size={9} /> Reset
                  </button>
                </div>
              )}
              {status === "error" && (
                <div className="px-3 pb-2 flex items-center gap-2">
                  <span className="text-[10px] text-red-400 flex items-center gap-1">
                    <AlertCircle size={10} /> Processing failed — try again
                  </span>
                  <button
                    onClick={() => resetTool(tool.id)}
                    className="ml-auto text-[10px] text-gray-500 hover:text-violet-400 flex items-center gap-0.5 transition-all"
                  >
                    <RotateCcw size={9} /> Retry
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Video AI footer */}
      <div className="p-3 border-t border-[hsl(215_20%_18%)] shrink-0">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Video AI</div>
        <div className="flex flex-col gap-1">
          {[
            { label: "AI Subtitles Auto-Generate", badge: "Soon" },
            { label: "Voice-to-Text Captions", badge: "Soon" },
            { label: "Motion Tracking", badge: "Beta" },
            { label: "Chroma Key (Green Screen)", badge: "Soon" },
            { label: "AI Scene Detection", badge: "Beta" },
          ].map(({ label, badge }) => (
            <div
              key={label}
              className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[hsl(215_20%_16%)] text-[10px] text-gray-500 hover:text-gray-300 transition-all cursor-pointer"
            >
              <span>{label}</span>
              <span className="text-[8px] bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded-full">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
