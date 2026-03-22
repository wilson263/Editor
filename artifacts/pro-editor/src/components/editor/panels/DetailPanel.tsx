import { useEditorStore } from "@/lib/editorStore";
import { RotateCcw } from "lucide-react";

export default function DetailPanel() {
  const { adjustments, setAdjustment } = useEditorStore();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(222_18%_8%)] border-b border-[hsl(220_15%_14%)] shrink-0">
        <span className="text-xs font-bold text-white tracking-tight">Detail</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Sharpening */}
        <div className="panel-section">
          <div className="panel-label">Sharpening</div>
          <div className="flex flex-col gap-3">
            {[
              { label: "Amount", key: "sharpness", min: 0, max: 150 },
              { label: "Radius", key: "sharpenRadius", min: 0, max: 100 },
              { label: "Detail", key: "sharpenDetail", min: 0, max: 100 },
              { label: "Masking", key: "sharpenMasking", min: 0, max: 100 },
            ].map(({ label, key, min, max }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-[11px] text-gray-400">{label}</span>
                  <span className="text-[10px] text-white font-mono">
                    {(adjustments as any)[key] ?? 0}
                  </span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={(adjustments as any)[key] ?? 0}
                  onChange={(e) => setAdjustment(key as any, Number(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Noise Reduction */}
        <div className="panel-section">
          <div className="panel-label">Noise Reduction</div>
          <div className="flex flex-col gap-3">
            {[
              { label: "Luminance", key: "noiseReduction", min: 0, max: 100 },
              { label: "Lum Detail", key: "noiseReductionDetail", min: 0, max: 100 },
              { label: "Color", key: "colorNoiseReduction", min: 0, max: 100 },
              { label: "Color Detail", key: "colorNoiseDetail", min: 0, max: 100 },
            ].map(({ label, key, min, max }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-[11px] text-gray-400">{label}</span>
                  <span className="text-[10px] text-white font-mono">
                    {(adjustments as any)[key] ?? 0}
                  </span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={(adjustments as any)[key] ?? 0}
                  onChange={(e) => setAdjustment(key as any, Number(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Lens Corrections */}
        <div className="panel-section">
          <div className="panel-label">Lens Corrections</div>
          <div className="flex flex-col gap-3">
            {[
              { label: "Distortion", key: "lensDistortion", min: -100, max: 100 },
              { label: "Vignetting", key: "lensVignette", min: -100, max: 100 },
              { label: "Defringe", key: "defringe", min: 0, max: 100 },
              { label: "Chromatic Aberration", key: "chromaticAberration", min: 0, max: 100 },
            ].map(({ label, key, min, max }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-[11px] text-gray-400">{label}</span>
                  <span className="text-[10px] text-white font-mono">
                    {(adjustments as any)[key] ?? 0}
                  </span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={(adjustments as any)[key] ?? 0}
                  onChange={(e) => setAdjustment(key as any, Number(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Transform */}
        <div className="panel-section">
          <div className="panel-label">Optics &amp; Transform</div>
          <div className="flex flex-col gap-3">
            {[
              { label: "Perspective V", key: "perspectiveV", min: -100, max: 100 },
              { label: "Perspective H", key: "perspectiveH", min: -100, max: 100 },
              { label: "Scale", key: "perspectiveScale", min: 50, max: 150 },
            ].map(({ label, key, min, max }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-[11px] text-gray-400">{label}</span>
                  <span className="text-[10px] text-white font-mono">
                    {(adjustments as any)[key] ?? (key === "perspectiveScale" ? 100 : 0)}
                  </span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={(adjustments as any)[key] ?? (key === "perspectiveScale" ? 100 : 0)}
                  onChange={(e) => setAdjustment(key as any, Number(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
