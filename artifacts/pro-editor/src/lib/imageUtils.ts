import type { Adjustments } from "./editorStore";

export const FILTERS: { id: string; name: string; css: string; category: string }[] = [
  { id: "none", name: "Original", css: "", category: "basic" },
  { id: "vivid", name: "Vivid", css: "saturate(1.6) contrast(1.1)", category: "basic" },
  { id: "cinema", name: "Cinema", css: "contrast(1.2) saturate(0.85) sepia(0.1)", category: "cinematic" },
  { id: "chrome", name: "Chrome", css: "saturate(1.3) contrast(1.15) brightness(1.05)", category: "basic" },
  { id: "fade", name: "Fade", css: "contrast(0.85) brightness(1.1) saturate(0.8)", category: "basic" },
  { id: "mono", name: "Mono", css: "grayscale(1) contrast(1.1)", category: "black-white" },
  { id: "noir", name: "Noir", css: "grayscale(1) contrast(1.4) brightness(0.85)", category: "black-white" },
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
  { id: "tokyo", name: "Tokyo", css: "hue-rotate(320deg) saturate(1.4) contrast(1.1)", category: "cinematic" },
  { id: "portra", name: "Portra", css: "sepia(0.2) saturate(1.1) brightness(1.08) contrast(0.95)", category: "film" },
  { id: "velvia", name: "Velvia", css: "saturate(1.7) contrast(1.15) brightness(0.95)", category: "film" },
  { id: "provia", name: "Provia", css: "saturate(1.2) contrast(1.05) brightness(1.02)", category: "film" },
  { id: "hp5", name: "HP5", css: "grayscale(1) contrast(1.2) brightness(0.95)", category: "film" },
  { id: "trixX", name: "Tri-X", css: "grayscale(1) contrast(1.5) brightness(0.85)", category: "film" },
  { id: "ektar", name: "Ektar", css: "saturate(1.5) contrast(1.1) brightness(1.02) hue-rotate(-5deg)", category: "film" },
  { id: "crossProcess", name: "Cross Process", css: "saturate(1.6) contrast(1.3) hue-rotate(20deg)", category: "retro" },
  { id: "lomography", name: "Lomography", css: "contrast(1.2) saturate(1.4) brightness(0.9)", category: "retro" },
  { id: "cyberpunk", name: "Cyberpunk", css: "hue-rotate(280deg) saturate(1.8) contrast(1.3) brightness(1.1)", category: "artistic" },
  { id: "matrix", name: "Matrix", css: "hue-rotate(90deg) saturate(1.5) contrast(1.2) brightness(0.9)", category: "artistic" },
  { id: "pastel", name: "Pastel", css: "saturate(0.7) brightness(1.15) contrast(0.85)", category: "artistic" },
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
];

export const BLEND_MODES = [
  "normal", "multiply", "screen", "overlay", "darken", "lighten",
  "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion",
  "hue", "saturation", "color", "luminosity",
] as const;

export const SHAPES = [
  { id: "rectangle", label: "Rectangle" },
  { id: "ellipse", label: "Ellipse" },
  { id: "triangle", label: "Triangle" },
  { id: "star", label: "Star" },
  { id: "heart", label: "Heart" },
  { id: "arrow", label: "Arrow" },
  { id: "line", label: "Line" },
  { id: "diamond", label: "Diamond" },
];

export const AI_TOOLS = [
  { id: "remove-bg", label: "Remove Background", icon: "✂️", desc: "Automatically remove image background" },
  { id: "enhance", label: "AI Enhance", icon: "✨", desc: "Upscale and enhance details" },
  { id: "denoise", label: "AI Denoise", icon: "🔊", desc: "Remove noise with AI" },
  { id: "colorize", label: "Colorize", icon: "🎨", desc: "AI colorize black & white photos" },
  { id: "restore", label: "Restore", icon: "🔄", desc: "Restore old or damaged photos" },
  { id: "relight", label: "AI Relight", icon: "💡", desc: "Change lighting with AI" },
  { id: "sky-replace", label: "Sky Replace", icon: "☁️", desc: "Replace the sky automatically" },
  { id: "portrait-enhance", label: "Portrait Enhance", icon: "👤", desc: "AI face and skin enhancement" },
  { id: "expand", label: "Expand Image", icon: "↔️", desc: "Generatively expand image boundaries" },
  { id: "object-remove", label: "Remove Object", icon: "🪄", desc: "Remove unwanted objects" },
];
