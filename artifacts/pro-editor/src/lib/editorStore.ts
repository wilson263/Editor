import { create } from "zustand";

export type EditMode = "photo" | "video";
export type ActiveTool =
  | "select"
  | "crop"
  | "brush"
  | "eraser"
  | "text"
  | "shape"
  | "gradient"
  | "heal"
  | "clone"
  | "blur-tool"
  | "sharpen-tool";

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "hard-light"
  | "soft-light"
  | "difference"
  | "exclusion";

export interface Layer {
  id: string;
  name: string;
  type: "image" | "text" | "shape" | "adjustment";
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  data?: string; // base64 for images
  text?: string;
  textStyle?: {
    fontSize: number;
    fontFamily: string;
    color: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    align: "left" | "center" | "right";
    x: number;
    y: number;
  };
}

export interface VideoClip {
  id: string;
  name: string;
  src: string;
  startTime: number;
  endTime: number;
  duration: number;
  track: number;
  type: "video" | "audio" | "image";
  volume: number;
  speed: number;
  filters: Adjustments;
  transition?: string;
}

export interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
  temperature: number;
  tint: number;
  vibrance: number;
  clarity: number;
  sharpness: number;
  noiseReduction: number;
  blur: number;
  vignette: number;
  grain: number;
  hue: number;
  // HSL per channel
  hslRed: number;
  hslOrange: number;
  hslYellow: number;
  hslGreen: number;
  hslAqua: number;
  hslBlue: number;
  hslPurple: number;
  hslMagenta: number;
}

export interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
}

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  temperature: 0,
  tint: 0,
  vibrance: 0,
  clarity: 0,
  sharpness: 0,
  noiseReduction: 0,
  blur: 0,
  vignette: 0,
  grain: 0,
  hue: 0,
  hslRed: 0,
  hslOrange: 0,
  hslYellow: 0,
  hslGreen: 0,
  hslAqua: 0,
  hslBlue: 0,
  hslPurple: 0,
  hslMagenta: 0,
};

export interface EditorState {
  mode: EditMode;
  activeTool: ActiveTool;
  activePanel: string;
  zoom: number;
  layers: Layer[];
  activeLayerId: string | null;
  adjustments: Adjustments;
  selectedFilter: string;
  crop: Crop;
  sourceImage: string | null;
  sourceVideo: string | null;
  history: string[];
  historyIndex: number;
  videoClips: VideoClip[];
  playheadTime: number;
  isPlaying: boolean;
  totalDuration: number;
  brushSize: number;
  brushOpacity: number;
  brushColor: string;
  brushHardness: number;
  canvasWidth: number;
  canvasHeight: number;
  resolution: string;
  aiProcessing: boolean;
  aiResult: string | null;

  setMode: (mode: EditMode) => void;
  setActiveTool: (tool: ActiveTool) => void;
  setActivePanel: (panel: string) => void;
  setZoom: (zoom: number) => void;
  setAdjustment: (key: keyof Adjustments, value: number) => void;
  resetAdjustments: () => void;
  setSelectedFilter: (filter: string) => void;
  setSourceImage: (src: string | null) => void;
  setSourceVideo: (src: string | null) => void;
  addLayer: (layer: Layer) => void;
  removeLayer: (id: string) => void;
  setActiveLayer: (id: string | null) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  moveLayer: (id: string, direction: "up" | "down") => void;
  setCrop: (crop: Partial<Crop>) => void;
  addVideoClip: (clip: VideoClip) => void;
  removeVideoClip: (id: string) => void;
  setPlayheadTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setBrushSize: (size: number) => void;
  setBrushColor: (color: string) => void;
  setBrushOpacity: (opacity: number) => void;
  setResolution: (res: string) => void;
  setAiProcessing: (v: boolean) => void;
  setAiResult: (v: string | null) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  mode: "photo",
  activeTool: "select",
  activePanel: "adjustments",
  zoom: 100,
  layers: [],
  activeLayerId: null,
  adjustments: { ...DEFAULT_ADJUSTMENTS },
  selectedFilter: "none",
  crop: { x: 0, y: 0, width: 100, height: 100, rotation: 0, flipH: false, flipV: false },
  sourceImage: null,
  sourceVideo: null,
  history: [],
  historyIndex: -1,
  videoClips: [],
  playheadTime: 0,
  isPlaying: false,
  totalDuration: 60,
  brushSize: 20,
  brushOpacity: 100,
  brushColor: "#ffffff",
  brushHardness: 80,
  canvasWidth: 3840,
  canvasHeight: 2160,
  resolution: "4K (3840x2160)",
  aiProcessing: false,
  aiResult: null,

  setMode: (mode) => set({ mode }),
  setActiveTool: (activeTool) => set({ activeTool }),
  setActivePanel: (activePanel) => set({ activePanel }),
  setZoom: (zoom) => set({ zoom: Math.max(5, Math.min(3200, zoom)) }),
  setAdjustment: (key, value) =>
    set((s) => ({ adjustments: { ...s.adjustments, [key]: value } })),
  resetAdjustments: () => set({ adjustments: { ...DEFAULT_ADJUSTMENTS } }),
  setSelectedFilter: (selectedFilter) => set({ selectedFilter }),
  setSourceImage: (sourceImage) => set({ sourceImage, mode: "photo" }),
  setSourceVideo: (sourceVideo) => set({ sourceVideo, mode: "video" }),
  addLayer: (layer) => set((s) => ({ layers: [...s.layers, layer], activeLayerId: layer.id })),
  removeLayer: (id) =>
    set((s) => ({ layers: s.layers.filter((l) => l.id !== id) })),
  setActiveLayer: (activeLayerId) => set({ activeLayerId }),
  updateLayer: (id, updates) =>
    set((s) => ({
      layers: s.layers.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })),
  moveLayer: (id, direction) =>
    set((s) => {
      const idx = s.layers.findIndex((l) => l.id === id);
      if (idx < 0) return s;
      const layers = [...s.layers];
      const swap = direction === "up" ? idx + 1 : idx - 1;
      if (swap < 0 || swap >= layers.length) return s;
      [layers[idx], layers[swap]] = [layers[swap], layers[idx]];
      return { layers };
    }),
  setCrop: (crop) => set((s) => ({ crop: { ...s.crop, ...crop } })),
  addVideoClip: (clip) => set((s) => ({ videoClips: [...s.videoClips, clip] })),
  removeVideoClip: (id) =>
    set((s) => ({ videoClips: s.videoClips.filter((c) => c.id !== id) })),
  setPlayheadTime: (playheadTime) => set({ playheadTime }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setBrushSize: (brushSize) => set({ brushSize }),
  setBrushColor: (brushColor) => set({ brushColor }),
  setBrushOpacity: (brushOpacity) => set({ brushOpacity }),
  setResolution: (resolution) => set({ resolution }),
  setAiProcessing: (aiProcessing) => set({ aiProcessing }),
  setAiResult: (aiResult) => set({ aiResult }),
}));
