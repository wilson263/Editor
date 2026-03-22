import type { Adjustments } from "./editorStore";

export const FILTERS: { id: string; name: string; css: string }[] = [
  { id: "none", name: "Original", css: "" },
  { id: "vivid", name: "Vivid", css: "saturate(1.6) contrast(1.1)" },
  { id: "cinema", name: "Cinema", css: "contrast(1.2) saturate(0.85) sepia(0.1)" },
  { id: "chrome", name: "Chrome", css: "saturate(1.3) contrast(1.15) brightness(1.05)" },
  { id: "fade", name: "Fade", css: "contrast(0.85) brightness(1.1) saturate(0.8)" },
  { id: "mono", name: "Mono", css: "grayscale(1) contrast(1.1)" },
  { id: "noir", name: "Noir", css: "grayscale(1) contrast(1.4) brightness(0.85)" },
  { id: "warm", name: "Warm", css: "sepia(0.3) saturate(1.2) brightness(1.05)" },
  { id: "cool", name: "Cool", css: "hue-rotate(15deg) saturate(1.1) brightness(1.05)" },
  { id: "golden", name: "Golden", css: "sepia(0.5) saturate(1.4) brightness(1.1) contrast(1.05)" },
  { id: "matte", name: "Matte", css: "contrast(0.9) brightness(1.05) saturate(0.9)" },
  { id: "lush", name: "Lush", css: "saturate(1.8) brightness(1.05) contrast(1.05)" },
  { id: "haze", name: "Haze", css: "brightness(1.15) contrast(0.85) saturate(0.75)" },
  { id: "punch", name: "Punch", css: "contrast(1.3) saturate(1.5)" },
  { id: "dreamy", name: "Dreamy", css: "brightness(1.1) contrast(0.9) saturate(0.9) blur(0.5px)" },
  { id: "vintage", name: "Vintage", css: "sepia(0.4) contrast(1.1) brightness(0.9) saturate(1.2)" },
  { id: "arctic", name: "Arctic", css: "hue-rotate(180deg) saturate(0.5) brightness(1.3)" },
  { id: "summer", name: "Summer", css: "hue-rotate(-10deg) saturate(1.4) brightness(1.1)" },
  { id: "forest", name: "Forest", css: "hue-rotate(30deg) saturate(1.3) brightness(0.95)" },
  { id: "neon", name: "Neon", css: "saturate(2) contrast(1.2) brightness(1.1)" },
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

export function buildVignetteCSS(vignette: number): string {
  if (vignette === 0) return "none";
  const intensity = Math.abs(vignette) / 100;
  const color = vignette > 0 ? "rgba(0,0,0" : "rgba(255,255,255";
  return `radial-gradient(ellipse at center, transparent 50%, ${color},${intensity * 0.8}) 100%)`;
}

export function buildCanvasFilter(adj: Adjustments, selectedFilter: string): string {
  return buildFilterCSS(adj, selectedFilter);
}

export async function applyAdjustmentsToCanvas(
  canvas: HTMLCanvasElement,
  adj: Adjustments,
  selectedFilter: string
): Promise<void> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.filter = buildCanvasFilter(adj, selectedFilter);
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
  { label: "Cinematic 2.39:1", width: 2048, height: 858 },
];

export const LUT_PRESETS = [
  "None", "Cinematic", "Teal & Orange", "Morning Mist", "Golden Hour",
  "Bleach Bypass", "Cross Process", "Fuji Velvia", "Kodak Portra", "Neon Noir",
];

export const TRANSITIONS = [
  "None", "Fade", "Dissolve", "Wipe Left", "Wipe Right", "Slide Up",
  "Slide Down", "Zoom In", "Zoom Out", "Spin", "Glitch",
];

export const FONTS = [
  "Inter", "Roboto", "Playfair Display", "Montserrat", "Bebas Neue",
  "Comic Sans MS", "Georgia", "Impact", "Arial Black", "Courier New",
  "Dancing Script", "Lobster", "Oswald", "Raleway", "Nunito",
];
