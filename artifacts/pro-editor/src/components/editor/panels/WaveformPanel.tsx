import { useEditorStore } from "@/lib/editorStore";
import { useEffect, useRef, useState } from "react";
import { BarChart2 } from "lucide-react";

type WaveformMode = "luma" | "rgb-parade" | "vectorscope" | "false-color";

export default function WaveformPanel() {
  const { sourceImage, adjustments } = useEditorStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<WaveformMode>("luma");
  const [opacity, setOpacity] = useState(85);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const srcCanvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    const img = new Image();
    img.onload = () => {
      const offscreen = document.createElement("canvas");
      const scale = Math.min(1, 300 / Math.max(img.naturalWidth, img.naturalHeight));
      offscreen.width = Math.max(1, Math.round(img.naturalWidth * scale));
      offscreen.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const oc = offscreen.getContext("2d", { willReadFrequently: true });
      if (!oc) return;

      if (srcCanvas && srcCanvas.width > 0) {
        oc.drawImage(srcCanvas, 0, 0, offscreen.width, offscreen.height);
      } else {
        oc.drawImage(img, 0, 0, offscreen.width, offscreen.height);
      }

      const imgData = oc.getImageData(0, 0, offscreen.width, offscreen.height);
      const pixels = imgData.data;
      const W_SRC = offscreen.width;

      const W = canvas.offsetWidth || 220;
      const H = 180;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);

      ctx.fillStyle = "hsl(222 18% 7%)";
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        const y = (i / 4) * H;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // IRE labels
      ["100", "75", "50", "25", "0"].forEach((label, i) => {
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.font = "8px monospace";
        ctx.fillText(label, 2, (i / 4) * H + 9);
      });

      const alpha = (opacity / 100);

      if (mode === "luma") {
        const waveData = new Array(W).fill(null).map(() => new Array(H).fill(0));
        for (let px = 0; px < pixels.length; px += 4) {
          const x = Math.round(((px / 4) % W_SRC) / W_SRC * (W - 1));
          const lum = Math.round(0.299 * pixels[px] + 0.587 * pixels[px + 1] + 0.114 * pixels[px + 2]);
          const y = Math.round((1 - lum / 255) * (H - 1));
          waveData[x][y]++;
        }
        waveData.forEach((col, x) => {
          col.forEach((count, y) => {
            if (count > 0) {
              const intensity = Math.min(1, count / 5) * alpha;
              ctx.fillStyle = `rgba(200,200,200,${intensity})`;
              ctx.fillRect(x, y, 1, 1);
            }
          });
        });
      } else if (mode === "rgb-parade") {
        const third = Math.floor(W / 3);
        const channels = [
          { offset: 0, color: [255, 50, 50], key: 0 },
          { offset: third, color: [50, 200, 50], key: 1 },
          { offset: third * 2, color: [50, 100, 255], key: 2 },
        ];
        channels.forEach(({ offset, color, key }) => {
          const waveData = new Array(third).fill(null).map(() => new Array(H).fill(0));
          for (let px = 0; px < pixels.length; px += 4) {
            const x = Math.round(((px / 4) % W_SRC) / W_SRC * (third - 1));
            const val = pixels[px + key];
            const y = Math.round((1 - val / 255) * (H - 1));
            waveData[x][y]++;
          }
          waveData.forEach((col, x) => {
            col.forEach((count, y) => {
              if (count > 0) {
                const intensity = Math.min(1, count / 5) * alpha;
                ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${intensity})`;
                ctx.fillRect(x + offset, y, 1, 1);
              }
            });
          });
        });
      } else if (mode === "vectorscope") {
        const cx = W / 2, cy = H / 2;
        const radius = Math.min(cx, cy) - 8;
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 1;
        [0.25, 0.5, 0.75, 1].forEach(r => {
          ctx.beginPath(); ctx.arc(cx, cy, r * radius, 0, Math.PI * 2); ctx.stroke();
        });
        for (let angle = 0; angle < 360; angle += 30) {
          const rad = (angle * Math.PI) / 180;
          ctx.beginPath(); ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(rad) * radius, cy + Math.sin(rad) * radius);
          ctx.stroke();
        }

        for (let px = 0; px < pixels.length; px += 16) {
          const r = pixels[px], g = pixels[px + 1], b = pixels[px + 2];
          const u = -0.147 * r - 0.289 * g + 0.436 * b;
          const v = 0.615 * r - 0.515 * g - 0.100 * b;
          const nx = cx + (u / 112) * radius;
          const ny = cy - (v / 157) * radius;
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.6})`;
          ctx.fillRect(nx, ny, 1.5, 1.5);
        }
      } else if (mode === "false-color") {
        const waveData = new Array(W).fill(null).map(() => new Array(H).fill(0));
        for (let px = 0; px < pixels.length; px += 4) {
          const x = Math.round(((px / 4) % W_SRC) / W_SRC * (W - 1));
          const lum = (0.299 * pixels[px] + 0.587 * pixels[px + 1] + 0.114 * pixels[px + 2]) / 255;
          const y = Math.round((1 - lum) * (H - 1));
          waveData[x][y]++;
        }
        waveData.forEach((col, x) => {
          col.forEach((count, y) => {
            if (count > 0) {
              const lum = 1 - y / H;
              let r: number, g: number, b: number;
              if (lum < 0.1) { r = 80; g = 0; b = 200; }
              else if (lum < 0.35) { r = 0; g = 150; b = 255; }
              else if (lum < 0.55) { r = 0; g = 220; b = 100; }
              else if (lum < 0.75) { r = 255; g = 200; b = 0; }
              else if (lum < 0.9) { r = 255; g = 100; b = 0; }
              else { r = 255; g = 0; b = 50; }
              const intensity = Math.min(1, count / 5) * alpha;
              ctx.fillStyle = `rgba(${r},${g},${b},${intensity})`;
              ctx.fillRect(x, y, 1, 1);
            }
          });
        });
      }
    };
    img.src = sourceImage ?? "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
  }, [sourceImage, adjustments, mode, opacity]);

  const MODES: { id: WaveformMode; label: string; desc: string }[] = [
    { id: "luma", label: "Luma", desc: "Luminance waveform" },
    { id: "rgb-parade", label: "RGB Parade", desc: "RGB channel comparison" },
    { id: "vectorscope", label: "Vectorscope", desc: "Color saturation & hue" },
    { id: "false-color", label: "False Color", desc: "Exposure guide" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(215_20%_18%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <BarChart2 size={13} className="text-cyan-400" />
          <span className="text-xs font-bold text-white">Waveform Monitor</span>
          <span className="text-[8px] text-cyan-500 bg-cyan-900/30 px-1.5 py-0.5 rounded font-bold">VIDEO PRO</span>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Mode selector */}
        <div className="grid grid-cols-2 border-b border-[hsl(215_20%_18%)]">
          {MODES.map((m) => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`py-2 px-2 text-[10px] font-semibold border-b-2 transition-all ${
                mode === m.id
                  ? "text-cyan-400 border-cyan-500 bg-cyan-900/10"
                  : "text-gray-600 border-transparent hover:text-gray-300"
              }`}>
              {m.label}
            </button>
          ))}
        </div>

        <div className="p-3 flex flex-col gap-3">
          {!sourceImage && (
            <div className="px-3 py-2 rounded-lg bg-[hsl(220_15%_12%)] text-[10px] text-gray-600 text-center">
              Load an image to see waveform
            </div>
          )}

          <div className="rounded-lg overflow-hidden border border-[hsl(220_15%_16%)]">
            <canvas
              ref={canvasRef}
              className="w-full"
              style={{ height: "180px", display: "block" }}
            />
          </div>

          <div className="text-[9px] text-gray-600 text-center">
            {MODES.find(m => m.id === mode)?.desc}
            {mode === "false-color" && " — Blue: underexposed · Green: correct · Red: overexposed"}
          </div>

          {/* Opacity */}
          <div className="adj-row">
            <div className="adj-row-header">
              <span className="adj-label">Overlay Brightness</span>
              <span className="adj-value">{opacity}%</span>
            </div>
            <div className="relative">
              <div className="absolute inset-0 h-[3px] top-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                style={{ background: `linear-gradient(to right, hsl(180 90% 40% / 0.7) 0%, hsl(180 90% 40% / 0.7) ${opacity}%, hsl(220 15% 22%) ${opacity}%)` }} />
              <input type="range" min={10} max={100} value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="relative w-full" style={{ background: "transparent" }} />
            </div>
          </div>

          {/* IRE guide */}
          {mode === "luma" && (
            <div>
              <div className="panel-section-header">IRE REFERENCE</div>
              <div className="flex flex-col gap-1">
                {[
                  { ire: "100 IRE", desc: "Pure white (clip point)", color: "text-red-400" },
                  { ire: "90+ IRE", desc: "Highlights risk clipping", color: "text-orange-400" },
                  { ire: "50 IRE", desc: "Mid-tone exposure", color: "text-green-400" },
                  { ire: "10 IRE", desc: "Near black, rich shadows", color: "text-blue-400" },
                  { ire: "0 IRE", desc: "Crushed blacks", color: "text-gray-500" },
                ].map(({ ire, desc, color }) => (
                  <div key={ire} className="flex items-center gap-2 text-[9px]">
                    <span className={`font-mono w-16 shrink-0 ${color}`}>{ire}</span>
                    <span className="text-gray-600">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
