import { useEditorStore } from "@/lib/editorStore";

const SELECTIVE_RANGES = [
  { key: "red", label: "Reds", swatch: "#ef4444", range: "0°-30° / 330°-360°" },
  { key: "yellow", label: "Yellows", swatch: "#eab308", range: "30°-90°" },
  { key: "green", label: "Greens", swatch: "#22c55e", range: "90°-150°" },
  { key: "cyan", label: "Cyans", swatch: "#06b6d4", range: "150°-210°" },
  { key: "blue", label: "Blues", swatch: "#3b82f6", range: "210°-270°" },
  { key: "magenta", label: "Magentas", swatch: "#ec4899", range: "270°-330°" },
  { key: "white", label: "Whites", swatch: "#f3f4f6", range: "Luminance >75%" },
  { key: "neutral", label: "Neutrals", swatch: "#9ca3af", range: "Luminance 25-75%" },
  { key: "black", label: "Blacks", swatch: "#374151", range: "Luminance <25%" },
] as const;

const CHANNELS = ["cyan-red", "magenta-green", "yellow-blue", "black"] as const;

type SelectiveRangeKey = (typeof SELECTIVE_RANGES)[number]["key"];
type ChannelKey = (typeof CHANNELS)[number];

interface SelectiveAdjustment {
  [rangeKey: string]: {
    [channel: string]: number;
  };
}

import { useState } from "react";
import { Pipette, RotateCcw } from "lucide-react";

export default function SelectiveColorPanel() {
  const { adjustments, setAdjustment } = useEditorStore();
  const [activeRange, setActiveRange] = useState<SelectiveRangeKey>("red");
  const [method, setMethod] = useState<"relative" | "absolute">("relative");

  const getKey = (range: SelectiveRangeKey, channel: ChannelKey) =>
    `selective_${range}_${channel.replace("-", "_")}` as keyof typeof adjustments;

  const getValue = (range: SelectiveRangeKey, channel: ChannelKey): number => {
    const key = getKey(range, channel);
    return (adjustments as any)[key] ?? 0;
  };

  const channelLabels: Record<ChannelKey, { label: string; neg: string; pos: string; colorNeg: string; colorPos: string }> = {
    "cyan-red": { label: "Cyan / Red", neg: "Cyan", pos: "Red", colorNeg: "#06b6d4", colorPos: "#ef4444" },
    "magenta-green": { label: "Magenta / Green", neg: "Magenta", pos: "Green", colorNeg: "#ec4899", colorPos: "#22c55e" },
    "yellow-blue": { label: "Yellow / Blue", neg: "Yellow", pos: "Blue", colorNeg: "#eab308", colorPos: "#3b82f6" },
    "black": { label: "Black", neg: "Lighter", pos: "Darker", colorNeg: "#9ca3af", colorPos: "#1f2937" },
  };

  const activeRangeData = SELECTIVE_RANGES.find((r) => r.key === activeRange)!;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(222_18%_8%)] border-b border-[hsl(220_15%_14%)] shrink-0">
        <div className="flex items-center gap-2">
          <Pipette size={12} className="text-violet-400" />
          <span className="text-xs font-bold text-white tracking-tight">Selective Color</span>
        </div>
        <div className="flex gap-1">
          {(["relative", "absolute"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`px-2 py-0.5 text-[9px] font-semibold rounded capitalize transition-all ${method === m ? "bg-violet-600 text-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Color range selector */}
      <div className="p-2 border-b border-[hsl(220_15%_14%)] shrink-0">
        <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-2">Color Range</div>
        <div className="grid grid-cols-3 gap-1.5">
          {SELECTIVE_RANGES.map((range) => {
            const hasChanges = CHANNELS.some((ch) => getValue(range.key, ch) !== 0);
            return (
              <button
                key={range.key}
                onClick={() => setActiveRange(range.key)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-all text-left ${
                  activeRange === range.key
                    ? "border-violet-500 bg-violet-900/20"
                    : "border-[hsl(220_15%_18%)] hover:border-[hsl(220_15%_28%)] hover:bg-[hsl(220_15%_13%)]"
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0 border border-black/20"
                  style={{ background: range.swatch }}
                />
                <span className={`text-[9px] font-medium truncate ${activeRange === range.key ? "text-violet-300" : "text-gray-400"}`}>
                  {range.label}
                </span>
                {hasChanges && <div className="w-1 h-1 rounded-full bg-violet-500 ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active range info */}
      <div className="px-3 py-2 bg-[hsl(222_18%_9%)] border-b border-[hsl(220_15%_14%)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border border-black/20" style={{ background: activeRangeData.swatch }} />
          <div>
            <div className="text-[11px] text-white font-semibold">{activeRangeData.label}</div>
            <div className="text-[9px] text-gray-600">{activeRangeData.range}</div>
          </div>
          <button
            onClick={() => {
              CHANNELS.forEach((ch) => {
                const key = getKey(activeRange, ch);
                setAdjustment(key, 0);
              });
            }}
            className="ml-auto flex items-center gap-1 text-[9px] text-gray-600 hover:text-violet-400 transition-all"
          >
            <RotateCcw size={9} /> Reset
          </button>
        </div>
      </div>

      {/* Channel sliders */}
      <div className="flex-1 overflow-y-auto">
        <div className="panel-section">
          <div className="flex flex-col gap-4">
            {CHANNELS.map((channel) => {
              const info = channelLabels[channel];
              const value = getValue(activeRange, channel);
              const pct = ((value + 100) / 200) * 100;
              return (
                <div key={channel} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-gray-400">{info.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {value !== 0 && (
                        <button
                          onClick={() => setAdjustment(getKey(activeRange, channel), 0)}
                          className="text-[8px] text-gray-600 hover:text-violet-400 transition-all"
                        >
                          ×
                        </button>
                      )}
                      <span
                        className="text-[10px] font-mono text-white w-8 text-right cursor-ew-resize select-none"
                        onMouseDown={(e) => {
                          const startX = e.clientX;
                          const startVal = value;
                          const handleMove = (me: MouseEvent) => {
                            const delta = Math.round((me.clientX - startX) / 2);
                            const newVal = Math.max(-100, Math.min(100, startVal + delta));
                            setAdjustment(getKey(activeRange, channel), newVal);
                          };
                          const handleUp = () => {
                            window.removeEventListener("mousemove", handleMove);
                            window.removeEventListener("mouseup", handleUp);
                          };
                          window.addEventListener("mousemove", handleMove);
                          window.addEventListener("mouseup", handleUp);
                        }}
                      >
                        {value > 0 ? "+" : ""}{value}
                      </span>
                    </div>
                  </div>

                  {/* Color gradient track */}
                  <div className="relative h-2 rounded-full overflow-hidden"
                    style={{
                      background: `linear-gradient(to right, ${info.colorNeg}, ${channel === "black" ? "#6b7280" : "#ffffff"}, ${info.colorPos})`
                    }}
                  >
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md rounded-full"
                      style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
                    />
                  </div>

                  <input
                    type="range"
                    min={-100}
                    max={100}
                    value={value}
                    onChange={(e) => setAdjustment(getKey(activeRange, channel), Number(e.target.value))}
                    className="w-full"
                    style={{ background: "transparent", marginTop: -4 }}
                  />

                  <div className="flex justify-between text-[8px] text-gray-700">
                    <span>{info.neg} (-100)</span>
                    <span>0</span>
                    <span>{info.pos} (+100)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info card */}
        <div className="mx-3 mb-3 p-3 rounded-xl bg-[hsl(222_18%_8%)] border border-[hsl(220_15%_16%)]">
          <div className="text-[9px] text-gray-500 leading-relaxed">
            <strong className="text-gray-400">Selective Color</strong> allows you to adjust the CMYK composition of specific color ranges without affecting others. Use <em>Relative</em> mode to shift by percentage, or <em>Absolute</em> to set exact values.
          </div>
        </div>
      </div>
    </div>
  );
}
