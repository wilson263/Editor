import { useEditorStore } from "@/lib/editorStore";
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Crop } from "lucide-react";

const ASPECT_RATIOS = [
  { label: "Free", w: 0, h: 0 },
  { label: "1:1", w: 1, h: 1 },
  { label: "4:3", w: 4, h: 3 },
  { label: "3:2", w: 3, h: 2 },
  { label: "16:9", w: 16, h: 9 },
  { label: "9:16", w: 9, h: 16 },
  { label: "2:1", w: 2, h: 1 },
  { label: "21:9", w: 21, h: 9 },
  { label: "4:5", w: 4, h: 5 },
  { label: "A4", w: 210, h: 297 },
];

export default function CropPanel() {
  const { crop, setCrop } = useEditorStore();

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-3 py-2 border-b border-[hsl(215_20%_18%)]">
        <span className="text-xs font-semibold text-white">Crop & Transform</span>
      </div>

      <div className="p-3 flex flex-col gap-4">
        {/* Aspect Ratios */}
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Aspect Ratio</div>
          <div className="grid grid-cols-3 gap-1.5">
            {ASPECT_RATIOS.map((r) => (
              <button
                key={r.label}
                className="py-1.5 px-2 rounded-md bg-[hsl(215_20%_16%)] hover:bg-[hsl(215_20%_20%)] border border-[hsl(215_20%_20%)] hover:border-violet-600/50 text-[10px] text-gray-400 hover:text-white transition-all"
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rotation */}
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Rotation</div>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setCrop({ rotation: crop.rotation - 90 })}
              className="flex-1 flex items-center justify-center gap-1 py-2 bg-[hsl(215_20%_16%)] border border-[hsl(215_20%_20%)] rounded-md text-xs text-gray-400 hover:text-white hover:border-violet-500 transition-all"
            >
              <RotateCcw size={13} /> -90°
            </button>
            <button
              onClick={() => setCrop({ rotation: crop.rotation + 90 })}
              className="flex-1 flex items-center justify-center gap-1 py-2 bg-[hsl(215_20%_16%)] border border-[hsl(215_20%_20%)] rounded-md text-xs text-gray-400 hover:text-white hover:border-violet-500 transition-all"
            >
              <RotateCw size={13} /> +90°
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-500">Fine Rotation</span>
              <span className="text-[10px] text-gray-300 font-mono">{crop.rotation}°</span>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              value={crop.rotation}
              onChange={(e) => setCrop({ rotation: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>

        {/* Flip */}
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Flip</div>
          <div className="flex gap-2">
            <button
              onClick={() => setCrop({ flipH: !crop.flipH })}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border text-xs transition-all ${
                crop.flipH
                  ? "bg-violet-600/20 border-violet-500 text-violet-300"
                  : "bg-[hsl(215_20%_16%)] border-[hsl(215_20%_20%)] text-gray-400 hover:text-white"
              }`}
            >
              <FlipHorizontal size={13} /> Horizontal
            </button>
            <button
              onClick={() => setCrop({ flipV: !crop.flipV })}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border text-xs transition-all ${
                crop.flipV
                  ? "bg-violet-600/20 border-violet-500 text-violet-300"
                  : "bg-[hsl(215_20%_16%)] border-[hsl(215_20%_20%)] text-gray-400 hover:text-white"
              }`}
            >
              <FlipVertical size={13} /> Vertical
            </button>
          </div>
        </div>

        {/* Position & Size */}
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Position & Size</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "X", value: crop.x, setter: (v: number) => setCrop({ x: v }) },
              { label: "Y", value: crop.y, setter: (v: number) => setCrop({ y: v }) },
              { label: "W", value: crop.width, setter: (v: number) => setCrop({ width: v }) },
              { label: "H", value: crop.height, setter: (v: number) => setCrop({ height: v }) },
            ].map(({ label, value, setter }) => (
              <div key={label} className="flex items-center gap-1.5 bg-[hsl(215_20%_16%)] border border-[hsl(215_20%_20%)] rounded-md px-2 py-1">
                <span className="text-[10px] text-gray-500 w-3">{label}</span>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setter(Number(e.target.value))}
                  className="flex-1 bg-transparent text-xs text-white outline-none font-mono"
                />
                <span className="text-[9px] text-gray-600">px</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={() => setCrop({ x: 0, y: 0, width: 100, height: 100, rotation: 0, flipH: false, flipV: false })}
          className="flex items-center justify-center gap-2 py-2 bg-[hsl(215_20%_16%)] border border-[hsl(215_20%_20%)] rounded-md text-xs text-gray-400 hover:text-white hover:border-violet-500 transition-all"
        >
          <RotateCcw size={12} /> Reset Transform
        </button>

        {/* Apply */}
        <button className="flex items-center justify-center gap-2 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-md text-xs font-medium transition-all">
          <Crop size={12} /> Apply Crop
        </button>
      </div>
    </div>
  );
}
