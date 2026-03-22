import { useEditorStore } from "@/lib/editorStore";
import { X, Keyboard } from "lucide-react";

const SHORTCUTS = [
  {
    category: "Tools",
    items: [
      { keys: ["V"], desc: "Select / Move" },
      { keys: ["H"], desc: "Hand / Pan" },
      { keys: ["C"], desc: "Crop" },
      { keys: ["B"], desc: "Brush" },
      { keys: ["E"], desc: "Eraser" },
      { keys: ["T"], desc: "Text" },
      { keys: ["L"], desc: "Lasso Select" },
      { keys: ["W"], desc: "Magic Wand" },
      { keys: ["I"], desc: "Eyedropper / Color Picker" },
      { keys: ["S"], desc: "Clone Stamp" },
      { keys: ["J"], desc: "Healing Brush" },
      { keys: ["O"], desc: "Dodge / Burn" },
      { keys: ["G"], desc: "Gradient" },
      { keys: ["P"], desc: "Pen Tool" },
      { keys: ["U"], desc: "Shape Tool" },
      { keys: ["X"], desc: "Swap Foreground / Background" },
    ],
  },
  {
    category: "View",
    items: [
      { keys: ["+", "="], desc: "Zoom In" },
      { keys: ["-"], desc: "Zoom Out" },
      { keys: ["0"], desc: "Fit to Screen (100%)" },
      { keys: ["Ctrl", "Shift", "H"], desc: "Toggle Before/After" },
      { keys: ["Ctrl", "'"], desc: "Toggle Grid" },
      { keys: ["Ctrl", "R"], desc: "Toggle Rulers" },
      { keys: ["?"], desc: "Keyboard Shortcuts" },
    ],
  },
  {
    category: "Edit",
    items: [
      { keys: ["Ctrl", "Z"], desc: "Undo" },
      { keys: ["Ctrl", "Shift", "Z"], desc: "Redo" },
      { keys: ["Ctrl", "D"], desc: "Deselect All" },
      { keys: ["Ctrl", "A"], desc: "Select All" },
      { keys: ["Ctrl", "C"], desc: "Copy Layer" },
      { keys: ["Ctrl", "V"], desc: "Paste Layer" },
      { keys: ["Ctrl", "J"], desc: "Duplicate Layer" },
      { keys: ["Delete"], desc: "Delete Selected Layer" },
    ],
  },
  {
    category: "File",
    items: [
      { keys: ["Ctrl", "O"], desc: "Open Image" },
      { keys: ["Ctrl", "S"], desc: "Save / Export" },
      { keys: ["Ctrl", "Shift", "S"], desc: "Export As..." },
      { keys: ["Ctrl", "Shift", "E"], desc: "Export All Formats" },
    ],
  },
  {
    category: "Panels",
    items: [
      { keys: ["F1"], desc: "Adjustments Panel" },
      { keys: ["F2"], desc: "Filters Panel" },
      { keys: ["F3"], desc: "Color Grading Panel" },
      { keys: ["F4"], desc: "Layers Panel" },
      { keys: ["F5"], desc: "History & Snapshots" },
      { keys: ["F6"], desc: "AI Tools Panel" },
      { keys: ["Tab"], desc: "Toggle All Panels" },
    ],
  },
];

function KbdKey({ k }: { k: string }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[hsl(220_15%_22%)] border border-[hsl(220_15%_30%)] text-[9px] font-bold text-gray-200 font-mono min-w-[22px] text-center justify-center shadow-sm">
      {k}
    </span>
  );
}

export default function KeyboardShortcuts() {
  const { showKeyboardShortcuts, toggleKeyboardShortcuts } = useEditorStore();

  if (!showKeyboardShortcuts) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={toggleKeyboardShortcuts}
      />

      {/* Modal */}
      <div className="relative z-10 bg-[hsl(222_18%_10%)] border border-[hsl(220_15%_18%)] rounded-2xl shadow-2xl w-[720px] max-h-[80vh] flex flex-col overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(220_15%_16%)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-900/50 border border-violet-700/30 flex items-center justify-center">
              <Keyboard size={16} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Keyboard Shortcuts</h2>
              <p className="text-[10px] text-gray-500">Pro-level shortcuts for maximum efficiency</p>
            </div>
          </div>
          <button
            onClick={toggleKeyboardShortcuts}
            className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-[hsl(220_15%_16%)] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            {SHORTCUTS.map((section) => (
              <div key={section.category}>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-3">{section.category}</h3>
                <div className="flex flex-col gap-0">
                  {section.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-[hsl(220_15%_14%)] last:border-0"
                    >
                      <span className="text-[11px] text-gray-300 flex-1">{item.desc}</span>
                      <div className="flex items-center gap-1 shrink-0 ml-3">
                        {item.keys.map((k, ki) => (
                          <span key={ki} className="flex items-center gap-1">
                            <KbdKey k={k} />
                            {ki < item.keys.length - 1 && <span className="text-[8px] text-gray-600">+</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[hsl(220_15%_16%)] text-[10px] text-gray-600 text-center shrink-0">
          Press <KbdKey k="?" /> or <KbdKey k="Esc" /> to close · ProEditor v2.0
        </div>
      </div>
    </div>
  );
}
