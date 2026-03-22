import { useEditorStore } from "@/lib/editorStore";
import { useEffect, useRef, useState } from "react";

export default function Histogram() {
  const { sourceImage, adjustments } = useEditorStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [channel, setChannel] = useState<"all" | "r" | "g" | "b">("all");

  useEffect(() => {
    if (!sourceImage || !canvasRef.current) return;

    const img = new Image();
    img.onload = () => {
      const offscreen = document.createElement("canvas");
      offscreen.width = img.naturalWidth;
      offscreen.height = img.naturalHeight;
      const ctx = offscreen.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
      const data = imageData.data;

      const rHist = new Array(256).fill(0);
      const gHist = new Array(256).fill(0);
      const bHist = new Array(256).fill(0);
      const lumHist = new Array(256).fill(0);

      for (let i = 0; i < data.length; i += 4) {
        rHist[data[i]]++;
        gHist[data[i + 1]]++;
        bHist[data[i + 2]]++;
        const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        lumHist[lum]++;
      }

      const histCanvas = canvasRef.current;
      if (!histCanvas) return;
      const hCtx = histCanvas.getContext("2d");
      if (!hCtx) return;

      histCanvas.width = histCanvas.offsetWidth * window.devicePixelRatio || 256;
      histCanvas.height = 64;
      hCtx.clearRect(0, 0, histCanvas.width, histCanvas.height);

      const W = histCanvas.width;
      const H = histCanvas.height;
      const maxR = Math.max(...rHist);
      const maxG = Math.max(...gHist);
      const maxB = Math.max(...bHist);
      const maxL = Math.max(...lumHist);

      const drawChannel = (hist: number[], maxVal: number, color: string, alpha: number = 0.7) => {
        hCtx.beginPath();
        hCtx.moveTo(0, H);
        for (let i = 0; i < 256; i++) {
          const x = (i / 255) * W;
          const y = H - (hist[i] / maxVal) * H * 0.9;
          if (i === 0) hCtx.lineTo(x, y);
          else hCtx.lineTo(x, y);
        }
        hCtx.lineTo(W, H);
        hCtx.closePath();
        hCtx.fillStyle = color;
        hCtx.globalAlpha = alpha;
        hCtx.fill();
        hCtx.globalAlpha = 1;
      };

      if (channel === "all") {
        drawChannel(rHist, maxR, "rgba(255, 60, 60, 0.5)");
        drawChannel(gHist, maxG, "rgba(60, 200, 60, 0.5)");
        drawChannel(bHist, maxB, "rgba(60, 100, 255, 0.5)");
      } else if (channel === "r") {
        drawChannel(rHist, maxR, "rgba(255, 80, 80, 0.8)");
      } else if (channel === "g") {
        drawChannel(gHist, maxG, "rgba(80, 220, 80, 0.8)");
      } else if (channel === "b") {
        drawChannel(bHist, maxB, "rgba(80, 120, 255, 0.8)");
      }
    };
    img.src = sourceImage;
  }, [sourceImage, adjustments, channel]);

  return (
    <div>
      <div className="rounded-md overflow-hidden bg-[hsl(222_18%_8%)] border border-[hsl(220_15%_16%)] mb-2">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height: "64px", display: "block" }}
        />
      </div>
      <div className="flex gap-1">
        {(["all", "r", "g", "b"] as const).map((ch) => (
          <button
            key={ch}
            onClick={() => setChannel(ch)}
            className={`flex-1 py-1 text-[9px] font-bold rounded transition-all uppercase ${
              channel === ch
                ? ch === "all" ? "bg-[hsl(258_90%_60%)] text-white" :
                  ch === "r" ? "bg-red-700 text-white" :
                  ch === "g" ? "bg-green-700 text-white" :
                  "bg-blue-700 text-white"
                : "bg-[hsl(220_15%_16%)] text-gray-500 hover:text-gray-300"
            }`}
          >
            {ch}
          </button>
        ))}
      </div>
    </div>
  );
}
