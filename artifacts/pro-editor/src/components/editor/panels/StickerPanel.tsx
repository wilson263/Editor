import { useState } from "react";
import { useEditorStore } from "@/lib/editorStore";
import { generateId } from "@/lib/imageUtils";
import { Smile, Search, Star, Flame, Heart, Sun, Zap, Cloud, Music, Camera } from "lucide-react";

const STICKER_CATEGORIES = [
  { id: "emoji", label: "Emoji", icon: <Smile size={12} /> },
  { id: "shapes", label: "Shapes", icon: <Star size={12} /> },
  { id: "nature", label: "Nature", icon: <Sun size={12} /> },
  { id: "arrows", label: "Arrows", icon: <Zap size={12} /> },
  { id: "frames", label: "Frames", icon: <Camera size={12} /> },
  { id: "badges", label: "Badges", icon: <Flame size={12} /> },
];

const STICKERS: Record<string, { id: string; emoji: string; label: string }[]> = {
  emoji: [
    { id: "s1", emoji: "❤️", label: "Heart" },
    { id: "s2", emoji: "⭐", label: "Star" },
    { id: "s3", emoji: "🔥", label: "Fire" },
    { id: "s4", emoji: "💫", label: "Sparkle" },
    { id: "s5", emoji: "✨", label: "Stars" },
    { id: "s6", emoji: "💯", label: "100" },
    { id: "s7", emoji: "👑", label: "Crown" },
    { id: "s8", emoji: "💎", label: "Diamond" },
    { id: "s9", emoji: "🌈", label: "Rainbow" },
    { id: "s10", emoji: "🎉", label: "Party" },
    { id: "s11", emoji: "🌸", label: "Blossom" },
    { id: "s12", emoji: "🦋", label: "Butterfly" },
    { id: "s13", emoji: "🌙", label: "Moon" },
    { id: "s14", emoji: "☀️", label: "Sun" },
    { id: "s15", emoji: "⚡", label: "Lightning" },
    { id: "s16", emoji: "🌊", label: "Wave" },
  ],
  shapes: [
    { id: "sh1", emoji: "▲", label: "Triangle" },
    { id: "sh2", emoji: "◆", label: "Diamond" },
    { id: "sh3", emoji: "●", label: "Circle" },
    { id: "sh4", emoji: "■", label: "Square" },
    { id: "sh5", emoji: "★", label: "Star" },
    { id: "sh6", emoji: "♥", label: "Heart" },
    { id: "sh7", emoji: "✦", label: "4-Star" },
    { id: "sh8", emoji: "❋", label: "Asterisk" },
  ],
  nature: [
    { id: "n1", emoji: "🌺", label: "Flower" },
    { id: "n2", emoji: "🍀", label: "Clover" },
    { id: "n3", emoji: "🌿", label: "Herb" },
    { id: "n4", emoji: "🍁", label: "Leaf" },
    { id: "n5", emoji: "🌻", label: "Sunflower" },
    { id: "n6", emoji: "🌵", label: "Cactus" },
    { id: "n7", emoji: "🦋", label: "Butterfly" },
    { id: "n8", emoji: "🌍", label: "Earth" },
  ],
  arrows: [
    { id: "a1", emoji: "→", label: "Right" },
    { id: "a2", emoji: "←", label: "Left" },
    { id: "a3", emoji: "↑", label: "Up" },
    { id: "a4", emoji: "↓", label: "Down" },
    { id: "a5", emoji: "↗", label: "Up-Right" },
    { id: "a6", emoji: "↙", label: "Down-Left" },
    { id: "a7", emoji: "⟲", label: "Rotate" },
    { id: "a8", emoji: "⟳", label: "Refresh" },
  ],
  frames: [
    { id: "f1", emoji: "🖼️", label: "Frame" },
    { id: "f2", emoji: "📷", label: "Camera" },
    { id: "f3", emoji: "🎞️", label: "Film" },
    { id: "f4", emoji: "📸", label: "Snapshot" },
    { id: "f5", emoji: "🪟", label: "Window" },
    { id: "f6", emoji: "📺", label: "Screen" },
  ],
  badges: [
    { id: "b1", emoji: "🏅", label: "Medal" },
    { id: "b2", emoji: "🥇", label: "Gold" },
    { id: "b3", emoji: "🏆", label: "Trophy" },
    { id: "b4", emoji: "🎖️", label: "Badge" },
    { id: "b5", emoji: "🌟", label: "Glow Star" },
    { id: "b6", emoji: "🔖", label: "Bookmark" },
    { id: "b7", emoji: "💥", label: "Burst" },
    { id: "b8", emoji: "🆕", label: "New" },
  ],
};

const TEXT_OVERLAYS = [
  { text: "LOVE", color: "#ef4444" },
  { text: "WOW", color: "#f59e0b" },
  { text: "AMAZING", color: "#8b5cf6" },
  { text: "STUNNING", color: "#06b6d4" },
  { text: "PERFECT", color: "#ec4899" },
  { text: "BLESSED", color: "#10b981" },
  { text: "VIBES", color: "#f97316" },
  { text: "#MOOD", color: "#a855f7" },
];

export default function StickerPanel() {
  const { addLayer, sourceImage } = useEditorStore();
  const [category, setCategory] = useState("emoji");
  const [search, setSearch] = useState("");
  const [stickerSize, setStickerSize] = useState(80);

  function addSticker(emoji: string, label: string) {
    // Add as text layer with emoji
    addLayer({
      id: generateId(),
      name: `Sticker: ${label}`,
      type: "text",
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: "normal",
      text: emoji,
      textStyle: {
        fontSize: stickerSize,
        fontFamily: "Apple Color Emoji, Segoe UI Emoji, sans-serif",
        color: "#ffffff",
        bold: false,
        italic: false,
        underline: false,
        align: "center",
        x: 50,
        y: 50,
        letterSpacing: 0,
        lineHeight: 1,
        shadow: true,
        shadowColor: "rgba(0,0,0,0.5)",
        shadowBlur: 8,
        stroke: false,
        strokeColor: "#000000",
        strokeWidth: 2,
      },
    });
  }

  function addTextOverlay(text: string, color: string) {
    addLayer({
      id: generateId(),
      name: `Text: ${text}`,
      type: "text",
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: "normal",
      text,
      textStyle: {
        fontSize: 60,
        fontFamily: "Bebas Neue, Impact, Arial Black, sans-serif",
        color,
        bold: true,
        italic: false,
        underline: false,
        align: "center",
        x: 50,
        y: 20,
        letterSpacing: 4,
        lineHeight: 1,
        shadow: true,
        shadowColor: "rgba(0,0,0,0.7)",
        shadowBlur: 10,
        stroke: true,
        strokeColor: "rgba(0,0,0,0.5)",
        strokeWidth: 2,
      },
    });
  }

  const stickers = STICKERS[category] || [];
  const filtered = search
    ? stickers.filter((s) => s.label.toLowerCase().includes(search.toLowerCase()))
    : stickers;

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(220_15%_14%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-pink-400 to-orange-500 flex items-center justify-center">
            <Smile size={11} className="text-white" />
          </div>
          <span className="text-xs font-bold text-white">Stickers & Overlays</span>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">Add stickers, emoji and text art to your photo</p>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-[hsl(220_15%_14%)] shrink-0">
        <div className="relative">
          <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search stickers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-6 pr-2 py-1.5 bg-[hsl(220_15%_13%)] border border-[hsl(220_15%_20%)] rounded-lg text-[11px] text-white outline-none focus:border-violet-500 transition-all"
          />
        </div>
      </div>

      {/* Size control */}
      <div className="px-3 py-2 border-b border-[hsl(220_15%_14%)] shrink-0">
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-gray-400">Sticker Size</span>
          <span className="text-[10px] text-white font-mono">{stickerSize}px</span>
        </div>
        <input type="range" min={20} max={200} value={stickerSize} onChange={(e) => setStickerSize(Number(e.target.value))} className="w-full" />
      </div>

      {/* Categories */}
      <div className="px-2 py-2 border-b border-[hsl(220_15%_14%)] overflow-x-auto shrink-0">
        <div className="flex gap-1.5 whitespace-nowrap">
          {STICKER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setCategory(cat.id); setSearch(""); }}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition-all ${
                category === cat.id
                  ? "bg-violet-600 text-white"
                  : "bg-[hsl(220_15%_16%)] text-gray-400 hover:text-white"
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Sticker grid */}
        <div className="p-2 border-b border-[hsl(220_15%_14%)]">
          <div className="grid grid-cols-4 gap-1.5">
            {filtered.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => addSticker(sticker.emoji, sticker.label)}
                disabled={!sourceImage}
                title={sticker.label}
                className={`aspect-square flex items-center justify-center text-2xl rounded-xl border border-[hsl(220_15%_18%)] hover:border-violet-500 hover:bg-violet-900/20 transition-all ${!sourceImage ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {sticker.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Text overlays */}
        <div className="p-3">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-2">Trendy Text Overlays</span>
          <div className="grid grid-cols-2 gap-1.5">
            {TEXT_OVERLAYS.map((overlay) => (
              <button
                key={overlay.text}
                onClick={() => addTextOverlay(overlay.text, overlay.color)}
                disabled={!sourceImage}
                className={`py-2 px-3 rounded-xl border border-[hsl(220_15%_18%)] hover:border-violet-500 text-sm font-black tracking-widest transition-all ${!sourceImage ? "opacity-40 cursor-not-allowed" : ""}`}
                style={{ color: overlay.color }}
              >
                {overlay.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!sourceImage && (
        <div className="mx-3 mb-3 px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-700/30">
          <p className="text-[10px] text-amber-400">Upload an image to add stickers as layers</p>
        </div>
      )}
    </div>
  );
}
