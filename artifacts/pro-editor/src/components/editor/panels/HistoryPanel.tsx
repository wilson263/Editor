import { useEditorStore } from "@/lib/editorStore";
import { Clock, Camera, Trash2, RotateCcw, RotateCw, Plus, Edit2, Check, X } from "lucide-react";
import { useState } from "react";

function timeAgo(ts: number) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}

export default function HistoryPanel() {
  const {
    history, historyIndex, undo, redo,
    snapshots, addSnapshot, removeSnapshot, restoreSnapshot, renameSnapshot,
    adjustments
  } = useEditorStore();

  const [snapshotName, setSnapshotName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [activeTab, setActiveTab] = useState<"history" | "snapshots">("history");

  function handleAddSnapshot() {
    if (!snapshotName.trim()) return;
    addSnapshot(snapshotName.trim());
    setSnapshotName("");
    setShowNameInput(false);
  }

  function jumpToHistory(idx: number) {
    const store = useEditorStore.getState();
    const entry = history[idx];
    if (!entry) return;
    useEditorStore.setState({
      adjustments: { ...entry.adjustments },
      layers: JSON.parse(JSON.stringify(entry.layers)),
      historyIndex: idx,
    });
  }

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(222_18%_8%)] border-b border-[hsl(220_15%_14%)] shrink-0">
        <span className="text-xs font-bold text-white tracking-tight">History</span>
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-1 rounded transition-all ${canUndo ? "text-gray-400 hover:text-white hover:bg-[hsl(220_15%_16%)]" : "text-gray-700 cursor-not-allowed"}`}
            title="Undo"
          >
            <RotateCcw size={12} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-1 rounded transition-all ${canRedo ? "text-gray-400 hover:text-white hover:bg-[hsl(220_15%_16%)]" : "text-gray-700 cursor-not-allowed"}`}
            title="Redo"
          >
            <RotateCw size={12} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[hsl(220_15%_14%)] shrink-0">
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 text-[10px] font-semibold transition-all flex items-center justify-center gap-1 ${activeTab === "history" ? "text-violet-400 border-b-2 border-violet-500" : "text-gray-500 hover:text-gray-300"}`}
        >
          <Clock size={11} /> History
        </button>
        <button
          onClick={() => setActiveTab("snapshots")}
          className={`flex-1 py-2 text-[10px] font-semibold transition-all flex items-center justify-center gap-1 ${activeTab === "snapshots" ? "text-violet-400 border-b-2 border-violet-500" : "text-gray-500 hover:text-gray-300"}`}
        >
          <Camera size={11} /> Snapshots ({snapshots.length})
        </button>
      </div>

      {activeTab === "history" && (
        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-600 py-8">
              <Clock size={28} className="opacity-40" />
              <div className="text-center">
                <div className="text-xs font-medium text-gray-500 mb-1">No history yet</div>
                <div className="text-[10px] text-gray-700">Changes you make will appear here</div>
              </div>
            </div>
          ) : (
            <div className="py-1">
              {[...history].reverse().map((entry, i) => {
                const realIdx = history.length - 1 - i;
                const isCurrent = realIdx === historyIndex;
                const isFuture = realIdx > historyIndex;
                return (
                  <button
                    key={realIdx}
                    onClick={() => jumpToHistory(realIdx)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all text-left border-b border-[hsl(220_15%_12%)] ${
                      isCurrent
                        ? "bg-violet-900/20 border-l-2 border-l-violet-500"
                        : isFuture
                        ? "opacity-40 hover:opacity-60 hover:bg-[hsl(220_15%_13%)]"
                        : "hover:bg-[hsl(220_15%_13%)]"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${isCurrent ? "bg-violet-500" : isFuture ? "bg-gray-700" : "bg-gray-600"}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-[11px] font-medium truncate ${isCurrent ? "text-violet-300" : isFuture ? "text-gray-600" : "text-gray-300"}`}>
                        {entry.description}
                      </div>
                      <div className="text-[9px] text-gray-600 font-mono">{timeAgo(entry.timestamp)}</div>
                    </div>
                    {isCurrent && (
                      <span className="text-[8px] text-violet-400 font-bold uppercase tracking-widest shrink-0">Current</span>
                    )}
                  </button>
                );
              })}

              {/* Initial state */}
              <button
                onClick={() => jumpToHistory(-1)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all text-left ${historyIndex === -1 ? "bg-violet-900/20" : "hover:bg-[hsl(220_15%_13%)] opacity-40"}`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${historyIndex === -1 ? "bg-violet-500" : "bg-gray-700"}`} />
                <span className={`text-[11px] font-medium ${historyIndex === -1 ? "text-violet-300" : "text-gray-600"}`}>Initial State</span>
                {historyIndex === -1 && <span className="text-[8px] text-violet-400 font-bold uppercase tracking-widest ml-auto">Current</span>}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "snapshots" && (
        <div className="flex-1 overflow-y-auto">
          {/* Add snapshot */}
          <div className="p-2 border-b border-[hsl(220_15%_14%)]">
            {showNameInput ? (
              <div className="flex gap-1">
                <input
                  autoFocus
                  type="text"
                  value={snapshotName}
                  onChange={(e) => setSnapshotName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddSnapshot(); if (e.key === "Escape") setShowNameInput(false); }}
                  placeholder="Snapshot name..."
                  className="flex-1 bg-[hsl(220_15%_14%)] border border-[hsl(220_15%_22%)] rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-violet-500"
                />
                <button onClick={handleAddSnapshot} className="p-1.5 rounded-md bg-violet-600 hover:bg-violet-500 text-white transition-all">
                  <Check size={12} />
                </button>
                <button onClick={() => setShowNameInput(false)} className="p-1.5 rounded-md bg-[hsl(220_15%_16%)] text-gray-400 hover:text-white transition-all">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNameInput(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[hsl(220_15%_22%)] rounded-lg text-[11px] text-gray-500 hover:text-violet-400 hover:border-violet-500/50 transition-all"
              >
                <Camera size={11} /> Save Current State as Snapshot
              </button>
            )}
          </div>

          {snapshots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-600">
              <Camera size={28} className="opacity-40" />
              <div className="text-center">
                <div className="text-xs font-medium text-gray-500 mb-1">No snapshots</div>
                <div className="text-[10px] text-gray-700 max-w-[160px] leading-relaxed">
                  Save named snapshots to compare different edit states
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2 flex flex-col gap-1.5">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="group flex items-center gap-2 p-2.5 rounded-xl border border-[hsl(220_15%_18%)] hover:border-violet-500/40 hover:bg-violet-900/10 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-900 to-indigo-900 flex items-center justify-center shrink-0 border border-violet-800/30">
                    <Camera size={13} className="text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {editingId === snap.id ? (
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => { renameSnapshot(snap.id, editName); setEditingId(null); }}
                        onKeyDown={(e) => { if (e.key === "Enter") { renameSnapshot(snap.id, editName); setEditingId(null); } }}
                        className="w-full bg-transparent border-b border-violet-500 text-xs text-white outline-none"
                      />
                    ) : (
                      <div className="text-xs text-white font-semibold truncate">{snap.name}</div>
                    )}
                    <div className="text-[9px] text-gray-600">{timeAgo(snap.timestamp)}</div>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => restoreSnapshot(snap.id)}
                      className="p-1 rounded text-gray-500 hover:text-violet-400 transition-all"
                      title="Restore"
                    >
                      <RotateCcw size={11} />
                    </button>
                    <button
                      onClick={() => { setEditingId(snap.id); setEditName(snap.name); }}
                      className="p-1 rounded text-gray-500 hover:text-blue-400 transition-all"
                      title="Rename"
                    >
                      <Edit2 size={11} />
                    </button>
                    <button
                      onClick={() => removeSnapshot(snap.id)}
                      className="p-1 rounded text-gray-500 hover:text-red-400 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
