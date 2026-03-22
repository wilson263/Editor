import { useState, useCallback, useRef } from "react";
import { useEditorStore } from "@/lib/editorStore";
import { LUT_PRESETS, applyLUT, parseCubeLUT, type LUTPreset } from "@/lib/lut";
import { Film, Upload, RotateCcw, ChevronDown, ChevronRight, Zap, Check } from "lucide-react";

const CATEGORIES = ["Film", "Cinematic", "Creative", "Black & White", "Tone Mapping"];

function LUTCard({ preset, active, onApply }: { preset: LUTPreset; active: boolean; onApply: (p: LUTPreset) => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onApply(preset)}
      className={`relative flex flex-col w-full text-left rounded-lg border transition-all overflow-hidden ${
        active
          ? "border-violet-500 bg-violet-900/20"
          : "border-[hsl(220_15%_18%)] bg-[hsl(220_15%_12%)] hover:border-violet-700/50"
      }`}
    >
      {/* Preview swatch gradient */}
      <div
        className="h-8 w-full"
        style={{
          background: active
            ? "linear-gradient(to right, #4c1d95, #7c3aed, #c026d3)"
            : hover
            ? "linear-gradient(to right, #1e1b4b, #4338ca, #7c3aed)"
            : "linear-gradient(to right, #111827, #374151, #6b7280)",
        }}
      />
      <div className="px-2 py-1.5 flex flex-col gap-0.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-white">{preset.name}</span>
          {active && <Check size={9} className="text-violet-400 shrink-0" />}
        </div>
        <span className="text-[9px] text-gray-500 leading-tight line-clamp-2">{preset.description}</span>
      </div>
    </button>
  );
}

export default function LUTPanel() {
  const { sourceImage, setSourceImage } = useEditorStore();
  const [activeLUT, setActiveLUT] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(100);
  const [openCats, setOpenCats] = useState<Set<string>>(new Set(["Film", "Cinematic"]));
  const [customLUTName, setCustomLUTName] = useState<string | null>(null);
  const [customLUTFn, setCustomLUTFn] = useState<((r: number, g: number, b: number) => [number, number, number]) | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [baseImageData, setBaseImageData] = useState<ImageData | null>(null);

  const getCanvasAndCtx = useCallback(() => {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement | null;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true }) ?? null;
    return { canvas, ctx };
  }, []);

  // Store base image when panel mounts or image changes
  const storeBase = useCallback(() => {
    const { canvas, ctx } = getCanvasAndCtx();
    if (!canvas || !ctx) return;
    setBaseImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
  }, [getCanvasAndCtx]);

  const applyPreset = useCallback(async (preset: LUTPreset) => {
    const { canvas, ctx } = getCanvasAndCtx();
    if (!canvas || !ctx || !sourceImage) return;

    setProcessing(true);
    setActiveLUT(preset.id);

    // Always re-render from base if available
    const imgData = baseImageData ?? ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (!baseImageData) setBaseImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));

    const copy = new ImageData(new Uint8ClampedArray(imgData.data), imgData.width, imgData.height);
    applyLUT(copy, preset, intensity);
    ctx.putImageData(copy, 0, 0);
    setSourceImage(canvas.toDataURL("image/png"));
    setProcessing(false);
  }, [baseImageData, getCanvasAndCtx, intensity, setSourceImage, sourceImage]);

  const applyCustomLUT = useCallback(async () => {
    if (!customLUTFn) return;
    const { canvas, ctx } = getCanvasAndCtx();
    if (!canvas || !ctx || !sourceImage) return;
    setProcessing(true);
    setActiveLUT("custom");

    const imgData = baseImageData ?? ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (!baseImageData) setBaseImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));

    const copy = new ImageData(new Uint8ClampedArray(imgData.data), imgData.width, imgData.height);
    const customPreset: LUTPreset = {
      id: "custom", name: customLUTName ?? "Custom", category: "Custom",
      description: "Custom .cube LUT", intensity: 100, data: customLUTFn,
    };
    applyLUT(copy, customPreset, intensity);
    ctx.putImageData(copy, 0, 0);
    setSourceImage(canvas.toDataURL("image/png"));
    setProcessing(false);
  }, [baseImageData, customLUTFn, customLUTName, getCanvasAndCtx, intensity, setSourceImage, sourceImage]);

  const handleReset = useCallback(() => {
    if (!baseImageData) return;
    const { canvas, ctx } = getCanvasAndCtx();
    if (!canvas || !ctx) return;
    ctx.putImageData(baseImageData, 0, 0);
    setSourceImage(canvas.toDataURL("image/png"));
    setActiveLUT(null);
  }, [baseImageData, getCanvasAndCtx, setSourceImage]);

  const handleCubeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const fn = parseCubeLUT(text);
      if (fn) {
        setCustomLUTFn(() => fn);
        setCustomLUTName(file.name.replace(".cube", ""));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const toggleCat = (cat: string) => {
    setOpenCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(220_15%_14%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <Film size={13} className="text-violet-400" />
          <span className="text-xs font-bold text-white">Color LUT</span>
          <span className="ml-auto text-[9px] text-violet-400 bg-violet-900/30 px-1.5 py-0.5 rounded">Pro</span>
        </div>
        <p className="text-[9px] text-gray-500 mt-1">Professional cinematic Look-Up Tables. Apply film emulation & creative grades.</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Intensity slider */}
        <div className="px-3 py-2 border-b border-[hsl(220_15%_14%)]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-400">LUT Intensity</span>
            <span className="text-[10px] text-white font-mono">{intensity}%</span>
          </div>
          <input
            type="range" min={0} max={100} value={intensity}
            onChange={e => setIntensity(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Custom LUT upload */}
        <div className="px-3 py-2 border-b border-[hsl(220_15%_14%)]">
          <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1.5">Import LUT</div>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg border border-dashed border-[hsl(220_15%_22%)] hover:border-violet-600 text-[10px] text-gray-500 hover:text-violet-400 transition-all"
          >
            <Upload size={12} />
            {customLUTName ? (
              <span className="text-violet-400 truncate">{customLUTName}</span>
            ) : (
              <span>Upload .cube LUT file</span>
            )}
          </button>
          <input ref={fileRef} type="file" accept=".cube" className="hidden" onChange={handleCubeUpload} />
          {customLUTFn && (
            <button
              onClick={applyCustomLUT}
              disabled={!sourceImage || processing}
              className="mt-1.5 w-full action-btn-primary action-btn justify-center py-1.5 disabled:opacity-40"
            >
              <Zap size={11} /> Apply Custom LUT
            </button>
          )}
        </div>

        {/* Presets by category */}
        {CATEGORIES.map(cat => {
          const presets = LUT_PRESETS.filter(p => p.category === cat);
          const isOpen = openCats.has(cat);
          return (
            <div key={cat} className="border-b border-[hsl(220_15%_14%)]">
              <button
                onClick={() => toggleCat(cat)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[hsl(220_15%_14%)] transition-all"
              >
                <span className="text-[10px] font-semibold text-gray-300 flex-1 text-left">{cat}</span>
                <span className="text-[9px] text-gray-600">{presets.length}</span>
                {isOpen ? <ChevronDown size={10} className="text-gray-600" /> : <ChevronRight size={10} className="text-gray-600" />}
              </button>
              {isOpen && (
                <div className="px-3 pb-3 grid grid-cols-2 gap-1.5">
                  {presets.map(preset => (
                    <LUTCard
                      key={preset.id}
                      preset={preset}
                      active={activeLUT === preset.id}
                      onApply={(p) => {
                        if (!baseImageData) storeBase();
                        applyPreset(p);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-3 py-2 border-t border-[hsl(220_15%_14%)] shrink-0 flex gap-2">
        <button
          onClick={handleReset}
          disabled={!activeLUT || !baseImageData}
          className="flex-1 action-btn justify-center py-1.5 disabled:opacity-30"
        >
          <RotateCcw size={11} /> Reset
        </button>
        {processing && (
          <span className="text-[9px] text-violet-400 flex items-center gap-1 animate-pulse">
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-ping inline-block" />
            Applying…
          </span>
        )}
      </div>
    </div>
  );
}
