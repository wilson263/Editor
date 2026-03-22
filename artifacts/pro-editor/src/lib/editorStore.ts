import { create } from "zustand";

export type EditMode = "photo" | "video";
export type ActiveTool =
  | "select" | "crop" | "brush" | "eraser" | "text" | "shape" | "gradient"
  | "heal" | "clone" | "blur-tool" | "sharpen-tool" | "dodge" | "burn"
  | "smudge" | "liquify" | "lasso" | "magic-wand" | "eyedropper" | "hand"
  | "ruler" | "pen";

export type BlendMode =
  | "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten"
  | "color-dodge" | "color-burn" | "hard-light" | "soft-light" | "difference"
  | "exclusion" | "hue" | "saturation" | "color" | "luminosity"
  | "dissolve" | "linear-burn" | "linear-dodge" | "vivid-light" | "pin-light";

export interface Layer {
  id: string;
  name: string;
  type: "image" | "text" | "shape" | "adjustment" | "fill";
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  data?: string;
  text?: string;
  fill?: string;
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
    letterSpacing: number;
    lineHeight: number;
    shadow: boolean;
    shadowColor: string;
    shadowBlur: number;
    stroke: boolean;
    strokeColor: string;
    strokeWidth: number;
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
  color: string;
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
  dehaze: number;
  texture: number;
  hslRed: number; hslOrange: number; hslYellow: number; hslGreen: number;
  hslAqua: number; hslBlue: number; hslPurple: number; hslMagenta: number;
  hslRedSat: number; hslOrangeSat: number; hslYellowSat: number; hslGreenSat: number;
  hslAquaSat: number; hslBlueSat: number; hslPurpleSat: number; hslMagentaSat: number;
  hslRedLum: number; hslOrangeLum: number; hslYellowLum: number; hslGreenLum: number;
  hslAquaLum: number; hslBlueLum: number; hslPurpleLum: number; hslMagentaLum: number;
  splitShadowH: number; splitShadowS: number; splitShadowL: number;
  splitHighlightH: number; splitHighlightS: number; splitHighlightL: number;
  splitBalance: number;
  sharpenRadius: number; sharpenDetail: number; sharpenMasking: number;
  noiseReductionDetail: number; colorNoiseReduction: number; colorNoiseDetail: number;
  lensDistortion: number; lensVignette: number; defringe: number; chromaticAberration: number;
  perspectiveV: number; perspectiveH: number; perspectiveScale: number;
}

export interface Crop {
  x: number; y: number; width: number; height: number;
  rotation: number; flipH: boolean; flipV: boolean; aspectRatio: string;
}

export interface CurvePoint { x: number; y: number; }

export interface Snapshot {
  id: string;
  name: string;
  timestamp: number;
  thumbnail?: string;
  adjustments: Adjustments;
  layers: Layer[];
  selectedFilter: string;
}

export interface Watermark {
  id: string;
  type: "text" | "image";
  text?: string;
  imageData?: string;
  position: "top-left" | "top-center" | "top-right" | "center" | "bottom-left" | "bottom-center" | "bottom-right";
  opacity: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  rotation: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  visible: boolean;
}

export type GradientType = "linear" | "radial" | "angular" | "reflected";
export interface GradientOverlay {
  id: string;
  name: string;
  type: GradientType;
  angle: number;
  centerX: number;
  centerY: number;
  radius: number;
  feather: number;
  opacity: number;
  blendMode: BlendMode;
  stops: { offset: number; color: string; opacity: number }[];
  visible: boolean;
  adjustments: Partial<Adjustments>;
}

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0, contrast: 0, saturation: 0, exposure: 0,
  highlights: 0, shadows: 0, whites: 0, blacks: 0,
  temperature: 0, tint: 0, vibrance: 0, clarity: 0,
  sharpness: 0, noiseReduction: 0, blur: 0, vignette: 0,
  grain: 0, hue: 0, dehaze: 0, texture: 0,
  hslRed: 0, hslOrange: 0, hslYellow: 0, hslGreen: 0,
  hslAqua: 0, hslBlue: 0, hslPurple: 0, hslMagenta: 0,
  hslRedSat: 0, hslOrangeSat: 0, hslYellowSat: 0, hslGreenSat: 0,
  hslAquaSat: 0, hslBlueSat: 0, hslPurpleSat: 0, hslMagentaSat: 0,
  hslRedLum: 0, hslOrangeLum: 0, hslYellowLum: 0, hslGreenLum: 0,
  hslAquaLum: 0, hslBlueLum: 0, hslPurpleLum: 0, hslMagentaLum: 0,
  splitShadowH: 0, splitShadowS: 0, splitShadowL: 0,
  splitHighlightH: 0, splitHighlightS: 0, splitHighlightL: 0,
  splitBalance: 0,
  sharpenRadius: 0, sharpenDetail: 0, sharpenMasking: 0,
  noiseReductionDetail: 0, colorNoiseReduction: 0, colorNoiseDetail: 0,
  lensDistortion: 0, lensVignette: 0, defringe: 0, chromaticAberration: 0,
  perspectiveV: 0, perspectiveH: 0, perspectiveScale: 100,
};

export interface HistoryEntry {
  adjustments: Adjustments;
  layers: Layer[];
  description: string;
  timestamp: number;
}

export interface Guide {
  id: string;
  orientation: "h" | "v";
  position: number;
}

export interface BrushSettings {
  size: number;
  opacity: number;
  hardness: number;
  flow: number;
  spacing: number;
  angle: number;
  roundness: number;
  color: string;
  secondaryColor: string;
  pressureSensitive: boolean;
  blendMode: BlendMode;
}

export interface EditorState {
  mode: EditMode;
  activeTool: ActiveTool;
  activePanel: string;
  zoom: number;
  layers: Layer[];
  activeLayerId: string | null;
  adjustments: Adjustments;
  selectedFilter: string;
  selectedLut: string;
  filterOpacity: number;
  crop: Crop;
  sourceImage: string | null;
  sourceVideo: string | null;
  history: HistoryEntry[];
  historyIndex: number;
  videoClips: VideoClip[];
  playheadTime: number;
  isPlaying: boolean;
  totalDuration: number;
  brushSize: number;
  brushOpacity: number;
  brushColor: string;
  brushHardness: number;
  brushFlow: number;
  brushSpacing: number;
  brushAngle: number;
  brushRoundness: number;
  brushSecondaryColor: string;
  brushPressure: boolean;
  brushBlendMode: BlendMode;
  canvasWidth: number;
  canvasHeight: number;
  resolution: string;
  aiProcessing: boolean;
  aiResult: string | null;
  showGrid: boolean;
  showRulers: boolean;
  showGuides: boolean;
  guides: Guide[];
  snapToGrid: boolean;
  gridSize: number;
  curvePoints: { rgb: CurvePoint[]; r: CurvePoint[]; g: CurvePoint[]; b: CurvePoint[] };
  activeCurveChannel: "rgb" | "r" | "g" | "b";
  activeHslChannel: "hue" | "saturation" | "luminance";
  exportFormat: "png" | "jpeg" | "webp";
  exportQuality: number;
  proofingEnabled: boolean;
  softProofProfile: string;
  showHistogram: boolean;
  histogramChannel: "all" | "r" | "g" | "b";
  panOffset: { x: number; y: number };
  isCropping: boolean;
  sampleColor: string | null;
  selectedShape: string;
  straightenAngle: number;
  showBeforeAfter: boolean;
  maskMode: boolean;
  textInput: string;
  textActive: boolean;
  snapshots: Snapshot[];
  watermarks: Watermark[];
  watermarkEnabled: boolean;
  gradientOverlays: GradientOverlay[];
  activeGradientId: string | null;
  showKeyboardShortcuts: boolean;
  colorPickerColor: string;
  compareSliderPosition: number;
  selectionMask: string | null;

  setMode: (mode: EditMode) => void;
  setActiveTool: (tool: ActiveTool) => void;
  setActivePanel: (panel: string) => void;
  setZoom: (zoom: number) => void;
  setAdjustment: (key: keyof Adjustments, value: number) => void;
  resetAdjustments: () => void;
  setSelectedFilter: (filter: string) => void;
  setSelectedLut: (lut: string) => void;
  setFilterOpacity: (v: number) => void;
  setSourceImage: (src: string | null) => void;
  setSourceVideo: (src: string | null) => void;
  addLayer: (layer: Layer) => void;
  removeLayer: (id: string) => void;
  setActiveLayer: (id: string | null) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  moveLayer: (id: string, direction: "up" | "down") => void;
  duplicateLayer: (id: string) => void;
  setCrop: (crop: Partial<Crop>) => void;
  addVideoClip: (clip: VideoClip) => void;
  removeVideoClip: (id: string) => void;
  setPlayheadTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setBrushSize: (size: number) => void;
  setBrushColor: (color: string) => void;
  setBrushOpacity: (opacity: number) => void;
  setBrushHardness: (h: number) => void;
  setBrushFlow: (f: number) => void;
  setBrushSpacing: (v: number) => void;
  setBrushAngle: (v: number) => void;
  setBrushRoundness: (v: number) => void;
  setBrushSecondaryColor: (v: string) => void;
  setBrushPressure: (v: boolean) => void;
  setBrushBlendMode: (v: BlendMode) => void;
  setResolution: (res: string) => void;
  setAiProcessing: (v: boolean) => void;
  setAiResult: (v: string | null) => void;
  toggleGrid: () => void;
  toggleRulers: () => void;
  toggleGuides: () => void;
  addGuide: (guide: Guide) => void;
  removeGuide: (id: string) => void;
  setCurvePoints: (channel: "rgb" | "r" | "g" | "b", points: CurvePoint[]) => void;
  setActiveCurveChannel: (ch: "rgb" | "r" | "g" | "b") => void;
  setActiveHslChannel: (ch: "hue" | "saturation" | "luminance") => void;
  setExportFormat: (f: "png" | "jpeg" | "webp") => void;
  setExportQuality: (q: number) => void;
  pushHistory: (description: string) => void;
  undo: () => void;
  redo: () => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  setIsCropping: (v: boolean) => void;
  setSampleColor: (c: string | null) => void;
  setSelectedShape: (s: string) => void;
  setStraightenAngle: (a: number) => void;
  toggleBeforeAfter: () => void;
  setMaskMode: (v: boolean) => void;
  setTextInput: (t: string) => void;
  setTextActive: (v: boolean) => void;
  addSnapshot: (name: string) => void;
  removeSnapshot: (id: string) => void;
  restoreSnapshot: (id: string) => void;
  renameSnapshot: (id: string, name: string) => void;
  addWatermark: (wm: Watermark) => void;
  removeWatermark: (id: string) => void;
  updateWatermark: (id: string, updates: Partial<Watermark>) => void;
  toggleWatermarkEnabled: () => void;
  addGradientOverlay: (overlay: GradientOverlay) => void;
  removeGradientOverlay: (id: string) => void;
  updateGradientOverlay: (id: string, updates: Partial<GradientOverlay>) => void;
  setActiveGradient: (id: string | null) => void;
  toggleKeyboardShortcuts: () => void;
  setColorPickerColor: (c: string) => void;
  setCompareSliderPosition: (v: number) => void;
  setSelectionMask: (v: string | null) => void;
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
  selectedLut: "none",
  filterOpacity: 100,
  crop: { x: 0, y: 0, width: 100, height: 100, rotation: 0, flipH: false, flipV: false, aspectRatio: "free" },
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
  brushFlow: 100,
  brushSpacing: 25,
  brushAngle: 0,
  brushRoundness: 100,
  brushSecondaryColor: "#000000",
  brushPressure: false,
  brushBlendMode: "normal",
  canvasWidth: 3840,
  canvasHeight: 2160,
  resolution: "4K (3840x2160)",
  aiProcessing: false,
  aiResult: null,
  showGrid: false,
  showRulers: true,
  showGuides: true,
  guides: [],
  snapToGrid: false,
  gridSize: 50,
  curvePoints: {
    rgb: [{ x: 0, y: 200 }, { x: 100, y: 100 }, { x: 200, y: 0 }],
    r: [{ x: 0, y: 200 }, { x: 200, y: 0 }],
    g: [{ x: 0, y: 200 }, { x: 200, y: 0 }],
    b: [{ x: 0, y: 200 }, { x: 200, y: 0 }],
  },
  activeCurveChannel: "rgb",
  activeHslChannel: "hue",
  exportFormat: "png",
  exportQuality: 95,
  proofingEnabled: false,
  softProofProfile: "sRGB",
  showHistogram: true,
  histogramChannel: "all",
  panOffset: { x: 0, y: 0 },
  isCropping: false,
  sampleColor: null,
  selectedShape: "rectangle",
  straightenAngle: 0,
  showBeforeAfter: false,
  maskMode: false,
  textInput: "Your text here",
  textActive: false,
  snapshots: [],
  watermarks: [],
  watermarkEnabled: false,
  gradientOverlays: [],
  activeGradientId: null,
  showKeyboardShortcuts: false,
  colorPickerColor: "#ffffff",
  compareSliderPosition: 50,
  selectionMask: null,

  setMode: (mode) => set({ mode }),
  setActiveTool: (activeTool) => set({ activeTool }),
  setActivePanel: (activePanel) => set({ activePanel }),
  setZoom: (zoom) => set({ zoom: Math.max(5, Math.min(3200, zoom)) }),
  setAdjustment: (key, value) =>
    set((s) => ({ adjustments: { ...s.adjustments, [key]: value } })),
  resetAdjustments: () => set({ adjustments: { ...DEFAULT_ADJUSTMENTS } }),
  setSelectedFilter: (selectedFilter) => set({ selectedFilter }),
  setSelectedLut: (selectedLut) => set({ selectedLut }),
  setFilterOpacity: (filterOpacity) => set({ filterOpacity }),
  setSourceImage: (sourceImage) => set({ sourceImage, mode: "photo" }),
  setSourceVideo: (sourceVideo) => set({ sourceVideo, mode: "video" }),
  addLayer: (layer) => set((s) => ({ layers: [...s.layers, layer], activeLayerId: layer.id })),
  removeLayer: (id) => set((s) => ({ layers: s.layers.filter((l) => l.id !== id) })),
  setActiveLayer: (activeLayerId) => set({ activeLayerId }),
  updateLayer: (id, updates) =>
    set((s) => ({ layers: s.layers.map((l) => (l.id === id ? { ...l, ...updates } : l)) })),
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
  duplicateLayer: (id) =>
    set((s) => {
      const layer = s.layers.find((l) => l.id === id);
      if (!layer) return s;
      const newLayer = { ...layer, id: Math.random().toString(36).slice(2, 10), name: `${layer.name} copy` };
      return { layers: [...s.layers, newLayer], activeLayerId: newLayer.id };
    }),
  setCrop: (crop) => set((s) => ({ crop: { ...s.crop, ...crop } })),
  addVideoClip: (clip) => set((s) => ({ videoClips: [...s.videoClips, clip] })),
  removeVideoClip: (id) => set((s) => ({ videoClips: s.videoClips.filter((c) => c.id !== id) })),
  setPlayheadTime: (playheadTime) => set({ playheadTime }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setBrushSize: (brushSize) => set({ brushSize }),
  setBrushColor: (brushColor) => set({ brushColor }),
  setBrushOpacity: (brushOpacity) => set({ brushOpacity }),
  setBrushHardness: (brushHardness) => set({ brushHardness }),
  setBrushFlow: (brushFlow) => set({ brushFlow }),
  setBrushSpacing: (brushSpacing) => set({ brushSpacing }),
  setBrushAngle: (brushAngle) => set({ brushAngle }),
  setBrushRoundness: (brushRoundness) => set({ brushRoundness }),
  setBrushSecondaryColor: (brushSecondaryColor) => set({ brushSecondaryColor }),
  setBrushPressure: (brushPressure) => set({ brushPressure }),
  setBrushBlendMode: (brushBlendMode) => set({ brushBlendMode }),
  setResolution: (resolution) => set({ resolution }),
  setAiProcessing: (aiProcessing) => set({ aiProcessing }),
  setAiResult: (aiResult) => set({ aiResult }),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleRulers: () => set((s) => ({ showRulers: !s.showRulers })),
  toggleGuides: () => set((s) => ({ showGuides: !s.showGuides })),
  addGuide: (guide) => set((s) => ({ guides: [...s.guides, guide] })),
  removeGuide: (id) => set((s) => ({ guides: s.guides.filter((g) => g.id !== id) })),
  setCurvePoints: (channel, points) =>
    set((s) => ({ curvePoints: { ...s.curvePoints, [channel]: points } })),
  setActiveCurveChannel: (activeCurveChannel) => set({ activeCurveChannel }),
  setActiveHslChannel: (activeHslChannel) => set({ activeHslChannel }),
  setExportFormat: (exportFormat) => set({ exportFormat }),
  setExportQuality: (exportQuality) => set({ exportQuality }),
  pushHistory: (description) =>
    set((s) => {
      const entry: HistoryEntry = {
        adjustments: { ...s.adjustments },
        layers: JSON.parse(JSON.stringify(s.layers)),
        description,
        timestamp: Date.now(),
      };
      const newHistory = [...s.history.slice(0, s.historyIndex + 1), entry];
      return { history: newHistory, historyIndex: newHistory.length - 1 };
    }),
  undo: () =>
    set((s) => {
      if (s.historyIndex <= 0) return s;
      const entry = s.history[s.historyIndex - 1];
      return { adjustments: entry.adjustments, layers: entry.layers, historyIndex: s.historyIndex - 1 };
    }),
  redo: () =>
    set((s) => {
      if (s.historyIndex >= s.history.length - 1) return s;
      const entry = s.history[s.historyIndex + 1];
      return { adjustments: entry.adjustments, layers: entry.layers, historyIndex: s.historyIndex + 1 };
    }),
  setPanOffset: (panOffset) => set({ panOffset }),
  setIsCropping: (isCropping) => set({ isCropping }),
  setSampleColor: (sampleColor) => set({ sampleColor }),
  setSelectedShape: (selectedShape) => set({ selectedShape }),
  setStraightenAngle: (straightenAngle) => set({ straightenAngle }),
  toggleBeforeAfter: () => set((s) => ({ showBeforeAfter: !s.showBeforeAfter })),
  setMaskMode: (maskMode) => set({ maskMode }),
  setTextInput: (textInput) => set({ textInput }),
  setTextActive: (textActive) => set({ textActive }),

  addSnapshot: (name) =>
    set((s) => {
      const snap: Snapshot = {
        id: Math.random().toString(36).slice(2, 10),
        name,
        timestamp: Date.now(),
        adjustments: { ...s.adjustments },
        layers: JSON.parse(JSON.stringify(s.layers)),
        selectedFilter: s.selectedFilter,
      };
      return { snapshots: [...s.snapshots, snap] };
    }),
  removeSnapshot: (id) => set((s) => ({ snapshots: s.snapshots.filter((sn) => sn.id !== id) })),
  restoreSnapshot: (id) =>
    set((s) => {
      const snap = s.snapshots.find((sn) => sn.id === id);
      if (!snap) return s;
      const entry: HistoryEntry = {
        adjustments: { ...s.adjustments },
        layers: JSON.parse(JSON.stringify(s.layers)),
        description: `Before restore: ${snap.name}`,
        timestamp: Date.now(),
      };
      const newHistory = [...s.history.slice(0, s.historyIndex + 1), entry];
      return {
        adjustments: { ...snap.adjustments },
        layers: JSON.parse(JSON.stringify(snap.layers)),
        selectedFilter: snap.selectedFilter,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }),
  renameSnapshot: (id, name) =>
    set((s) => ({
      snapshots: s.snapshots.map((sn) => (sn.id === id ? { ...sn, name } : sn)),
    })),

  addWatermark: (wm) => set((s) => ({ watermarks: [...s.watermarks, wm] })),
  removeWatermark: (id) => set((s) => ({ watermarks: s.watermarks.filter((w) => w.id !== id) })),
  updateWatermark: (id, updates) =>
    set((s) => ({ watermarks: s.watermarks.map((w) => (w.id === id ? { ...w, ...updates } : w)) })),
  toggleWatermarkEnabled: () => set((s) => ({ watermarkEnabled: !s.watermarkEnabled })),

  addGradientOverlay: (overlay) => set((s) => ({ gradientOverlays: [...s.gradientOverlays, overlay], activeGradientId: overlay.id })),
  removeGradientOverlay: (id) =>
    set((s) => ({
      gradientOverlays: s.gradientOverlays.filter((g) => g.id !== id),
      activeGradientId: s.activeGradientId === id ? null : s.activeGradientId,
    })),
  updateGradientOverlay: (id, updates) =>
    set((s) => ({
      gradientOverlays: s.gradientOverlays.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    })),
  setActiveGradient: (activeGradientId) => set({ activeGradientId }),

  toggleKeyboardShortcuts: () => set((s) => ({ showKeyboardShortcuts: !s.showKeyboardShortcuts })),
  setColorPickerColor: (colorPickerColor) => set({ colorPickerColor }),
  setCompareSliderPosition: (compareSliderPosition) => set({ compareSliderPosition }),
  setSelectionMask: (selectionMask) => set({ selectionMask }),
}));
