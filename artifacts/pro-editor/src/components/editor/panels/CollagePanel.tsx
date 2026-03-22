import { useState, useRef } from "react";
import { useEditorStore } from "@/lib/editorStore";
import { generateId } from "@/lib/imageUtils";
import {
  Grid3X3, Plus, Trash2, Upload, Layout, Image,
  AlignCenter, Columns2, Rows3, LayoutGrid, Square,
  ChevronRight
} from "lucide-react";

interface CollageImage {
  id: string;
  src: string;
  name: string;
}

const COLLAGE_LAYOUTS = [
  { id: "1x1", label: "Single", icon: <Square size={14} />, cols: 1, rows: 1 },
  { id: "1x2", label: "Side by Side", icon: <Columns2 size={14} />, cols: 2, rows: 1 },
  { id: "2x1", label: "Stack 2", icon: <Rows3 size={14} />, cols: 1, rows: 2 },
  { id: "2x2", label: "Grid 2x2", icon: <LayoutGrid size={14} />, cols: 2, rows: 2 },
  { id: "3x1", label: "Triple Row", icon: <Layout size={14} />, cols: 3, rows: 1 },
  { id: "3x3", label: "Grid 3x3", icon: <Grid3X3 size={14} />, cols: 3, rows: 3 },
  { id: "1+2", label: "1 Big + 2 Small", icon: <AlignCenter size={14} />, cols: 2, rows: 2 },
  { id: "featured", label: "Featured + Strip", icon: <Layout size={14} />, cols: 3, rows: 2 },
];

const FRAME_STYLES = [
  { id: "none", label: "No Frame" },
  { id: "thin", label: "Thin White" },
  { id: "thick", label: "Thick White" },
  { id: "rounded", label: "Rounded" },
  { id: "shadow", label: "Drop Shadow" },
  { id: "vintage", label: "Vintage Film" },
  { id: "polaroid", label: "Polaroid" },
  { id: "instagram", label: "Instagram" },
];

export default function CollagePanel() {
  const { addLayer, layers, sourceImage } = useEditorStore();
  const [images, setImages] = useState<CollageImage[]>([]);
  const [selectedLayout, setSelectedLayout] = useState("2x2");
  const [selectedFrame, setSelectedFrame] = useState("none");
  const [gap, setGap] = useState(4);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [cornerRadius, setCornerRadius] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages((prev) => [
          ...prev,
          { id: generateId(), src: ev.target?.result as string, name: file.name }
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  function removeImage(id: string) {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  async function buildCollage() {
    const layout = COLLAGE_LAYOUTS.find((l) => l.id === selectedLayout);
    if (!layout || images.length === 0) return;

    const cellW = 400;
    const cellH = 300;
    const totalW = cellW * layout.cols + gap * (layout.cols + 1);
    const totalH = cellH * layout.rows + gap * (layout.rows + 1);

    const canvas = document.createElement("canvas");
    canvas.width = totalW;
    canvas.height = totalH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, totalW, totalH);

    let imgIdx = 0;
    for (let row = 0; row < layout.rows; row++) {
      for (let col = 0; col < layout.cols; col++) {
        if (imgIdx >= images.length) break;
        const x = gap + col * (cellW + gap);
        const y = gap + row * (cellH + gap);

        const img = new Image();
        img.src = images[imgIdx].src;
        await new Promise<void>((resolve) => {
          img.onload = () => {
            // Cover fill
            const scale = Math.max(cellW / img.width, cellH / img.height);
            const sw = img.width * scale;
            const sh = img.height * scale;
            const ox = (cellW - sw) / 2;
            const oy = (cellH - sh) / 2;

            if (cornerRadius > 0) {
              ctx.save();
              ctx.beginPath();
              ctx.roundRect(x, y, cellW, cellH, cornerRadius);
              ctx.clip();
            }

            ctx.drawImage(img, x + ox, y + oy, sw, sh);

            // Frame overlay
            if (selectedFrame === "shadow") {
              ctx.shadowColor = "rgba(0,0,0,0.4)";
              ctx.shadowBlur = 12;
              ctx.shadowOffsetX = 3;
              ctx.shadowOffsetY = 3;
            }
            if (selectedFrame === "thin") {
              ctx.strokeStyle = "#ffffff";
              ctx.lineWidth = 2;
              ctx.strokeRect(x, y, cellW, cellH);
            }
            if (selectedFrame === "thick") {
              ctx.strokeStyle = "#ffffff";
              ctx.lineWidth = 8;
              ctx.strokeRect(x + 4, y + 4, cellW - 8, cellH - 8);
            }

            if (cornerRadius > 0) ctx.restore();
            resolve();
          };
          img.onerror = () => resolve();
        });
        imgIdx++;
      }
    }

    const dataUrl = canvas.toDataURL("image/png");
    addLayer({
      id: generateId(),
      name: `Collage (${layout.label})`,
      type: "image",
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: "normal",
      data: dataUrl,
    });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(220_15%_14%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Grid3X3 size={11} className="text-white" />
          </div>
          <span className="text-xs font-bold text-white">Collage Maker</span>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">Combine multiple photos into a collage layout</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Add images */}
        <div className="p-3 border-b border-[hsl(220_15%_14%)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Photos ({images.length})</span>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 transition-all"
            >
              <Plus size={11} /> Add Photos
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileAdd} />

          {images.length === 0 ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-4 border-2 border-dashed border-[hsl(220_15%_20%)] rounded-xl text-center text-gray-600 hover:border-violet-600/40 hover:text-violet-400 transition-all"
            >
              <Upload size={18} className="mx-auto mb-1" />
              <span className="text-[10px]">Click to add photos</span>
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {images.map((img) => (
                <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-[hsl(220_15%_18%)]">
                  <img src={img.src} alt={img.name} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={8} className="text-white" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-[hsl(220_15%_20%)] flex items-center justify-center text-gray-600 hover:border-violet-600/40 hover:text-violet-400 transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Layout picker */}
        <div className="p-3 border-b border-[hsl(220_15%_14%)]">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-2">Layout</span>
          <div className="grid grid-cols-2 gap-1.5">
            {COLLAGE_LAYOUTS.map((layout) => (
              <button
                key={layout.id}
                onClick={() => setSelectedLayout(layout.id)}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-all ${
                  selectedLayout === layout.id
                    ? "border-violet-500 bg-violet-900/20 text-violet-300"
                    : "border-[hsl(220_15%_18%)] text-gray-400 hover:border-[hsl(220_15%_28%)]"
                }`}
              >
                <span className="shrink-0">{layout.icon}</span>
                <span className="text-[10px] font-medium">{layout.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Frame style */}
        <div className="p-3 border-b border-[hsl(220_15%_14%)]">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-2">Frame Style</span>
          <div className="grid grid-cols-2 gap-1">
            {FRAME_STYLES.map((frame) => (
              <button
                key={frame.id}
                onClick={() => setSelectedFrame(frame.id)}
                className={`px-2 py-1.5 rounded-lg border text-[10px] transition-all ${
                  selectedFrame === frame.id
                    ? "border-violet-500 bg-violet-900/20 text-violet-300"
                    : "border-[hsl(220_15%_18%)] text-gray-400 hover:border-[hsl(220_15%_28%)]"
                }`}
              >
                {frame.label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="p-3 border-b border-[hsl(220_15%_14%)]">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-3">Settings</span>

          <div className="flex flex-col gap-2">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-gray-400">Gap</span>
                <span className="text-[10px] text-white font-mono">{gap}px</span>
              </div>
              <input type="range" min={0} max={20} value={gap} onChange={(e) => setGap(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-gray-400">Corner Radius</span>
                <span className="text-[10px] text-white font-mono">{cornerRadius}px</span>
              </div>
              <input type="range" min={0} max={40} value={cornerRadius} onChange={(e) => setCornerRadius(Number(e.target.value))} className="w-full" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">Background</span>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border border-[hsl(220_15%_22%)]"
              />
              <span className="text-[10px] text-gray-500 font-mono">{bgColor}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 px-3 py-2 border-t border-[hsl(220_15%_14%)]">
        <button
          onClick={buildCollage}
          disabled={images.length === 0}
          className="w-full action-btn-primary action-btn justify-center py-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Grid3X3 size={12} /> Build Collage
        </button>
        <p className="text-[9px] text-gray-600 text-center mt-1">Creates collage as a new layer</p>
      </div>
    </div>
  );
}
