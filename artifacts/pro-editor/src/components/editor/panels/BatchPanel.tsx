import { useState, useRef } from "react";
import { useEditorStore } from "@/lib/editorStore";
import { buildCanvasFilter, applyPixelAdjustments, applyVignette } from "@/lib/imageUtils";
import {
  FolderOpen, Play, Download, Trash2, CheckCircle2, Clock, AlertCircle,
  Plus, Image, Loader2, Settings, SlidersHorizontal, ChevronRight
} from "lucide-react";

interface BatchFile {
  id: string;
  name: string;
  src: string;
  status: "pending" | "processing" | "done" | "error";
  outputUrl?: string;
  errorMsg?: string;
}

const BATCH_ACTIONS = [
  { id: "adjustments", label: "Apply Current Adjustments", icon: "🎚️" },
  { id: "filter", label: "Apply Current Filter", icon: "🎨" },
  { id: "resize", label: "Resize to Resolution", icon: "📐" },
  { id: "watermark", label: "Apply Watermark", icon: "©️" },
  { id: "format", label: "Convert Format", icon: "🔄" },
  { id: "rename", label: "Auto Rename Files", icon: "📝" },
];

export default function BatchPanel() {
  const { adjustments, selectedFilter, curvePoints, watermarks, watermarkEnabled, exportFormat, exportQuality } = useEditorStore();
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>(["adjustments", "filter"]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputFormat, setOutputFormat] = useState<"png" | "jpeg" | "webp">("jpeg");
  const [outputQuality, setOutputQuality] = useState(90);
  const [prefix, setPrefix] = useState("edited_");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFilesAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files || []);
    const entries: BatchFile[] = newFiles.map((f, i) => ({
      id: `${Date.now()}-${i}`,
      name: f.name,
      src: URL.createObjectURL(f),
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...entries]);
    e.target.value = "";
  }

  function toggleAction(id: string) {
    setSelectedActions((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function clearAll() { setFiles([]); }

  async function processFile(file: BatchFile): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject("No context"); return; }

        if (selectedActions.includes("adjustments") || selectedActions.includes("filter")) {
          ctx.filter = buildCanvasFilter(adjustments, selectedActions.includes("filter") ? selectedFilter : "none");
          ctx.drawImage(img, 0, 0);
          ctx.filter = "none";
        } else {
          ctx.drawImage(img, 0, 0);
        }

        if (selectedActions.includes("adjustments")) {
          await applyPixelAdjustments(canvas, adjustments, curvePoints);
        }

        if (adjustments.vignette !== 0) {
          applyVignette(ctx, canvas.width, canvas.height, adjustments.vignette);
        }

        const mimeMap = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" };
        resolve(canvas.toDataURL(mimeMap[outputFormat], outputQuality / 100));
      };
      img.onerror = () => reject("Load error");
      img.src = file.src;
    });
  }

  async function runBatch() {
    if (files.length === 0 || selectedActions.length === 0) return;
    setProcessing(true);
    setProgress(0);

    const updated = [...files];
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status === "done") continue;
      updated[i] = { ...updated[i], status: "processing" };
      setFiles([...updated]);

      try {
        const outputUrl = await processFile(updated[i]);
        updated[i] = { ...updated[i], status: "done", outputUrl };
      } catch (err) {
        updated[i] = { ...updated[i], status: "error", errorMsg: String(err) };
      }

      setProgress(Math.round(((i + 1) / updated.length) * 100));
      setFiles([...updated]);
    }

    setProcessing(false);
  }

  async function downloadAll() {
    const done = files.filter((f) => f.status === "done" && f.outputUrl);
    for (const file of done) {
      await new Promise<void>((res) => {
        const ext = outputFormat;
        const name = prefix + file.name.replace(/\.[^.]+$/, "") + "." + ext;
        const link = document.createElement("a");
        link.href = file.outputUrl!;
        link.download = name;
        link.click();
        setTimeout(res, 250);
      });
    }
  }

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const doneCount = files.filter((f) => f.status === "done").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(220_15%_14%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
            <FolderOpen size={11} className="text-white" />
          </div>
          <span className="text-xs font-bold text-white">Batch Processing</span>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">Apply edits to multiple images at once</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* File queue */}
        <div className="p-3 border-b border-[hsl(220_15%_14%)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Queue ({files.length})
            </span>
            <div className="flex gap-2">
              {files.length > 0 && (
                <button onClick={clearAll} className="text-[10px] text-red-500 hover:text-red-400 transition-all">Clear</button>
              )}
              <button onClick={() => fileRef.current?.click()} className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-all">
                <Plus size={11} /> Add Files
              </button>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFilesAdd} />

          {files.length === 0 ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-4 border-2 border-dashed border-[hsl(220_15%_20%)] rounded-xl text-center hover:border-violet-600/40 hover:text-violet-400 text-gray-600 transition-all"
            >
              <FolderOpen size={18} className="mx-auto mb-1" />
              <span className="text-[10px]">Click to add images</span>
            </button>
          ) : (
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
              {files.map((f) => (
                <div key={f.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[hsl(220_15%_12%)] border border-[hsl(220_15%_16%)]">
                  <div className="shrink-0">
                    {f.status === "pending" && <Clock size={12} className="text-gray-600" />}
                    {f.status === "processing" && <Loader2 size={12} className="text-violet-400 animate-spin" />}
                    {f.status === "done" && <CheckCircle2 size={12} className="text-green-400" />}
                    {f.status === "error" && <AlertCircle size={12} className="text-red-400" />}
                  </div>
                  <span className="text-[10px] text-gray-300 flex-1 truncate">{f.name}</span>
                  {f.status === "done" && f.outputUrl && (
                    <a href={f.outputUrl} download={prefix + f.name} className="text-[10px] text-green-400 hover:text-green-300 flex items-center gap-0.5">
                      <Download size={10} />
                    </a>
                  )}
                  {!processing && (
                    <button onClick={() => removeFile(f.id)} className="text-gray-600 hover:text-red-400 transition-all">
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions to apply */}
        <div className="p-3 border-b border-[hsl(220_15%_14%)]">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-2">Actions</span>
          <div className="flex flex-col gap-1">
            {BATCH_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => toggleAction(action.id)}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-all text-left ${
                  selectedActions.includes(action.id)
                    ? "border-violet-500 bg-violet-900/20 text-violet-300"
                    : "border-[hsl(220_15%_16%)] text-gray-400 hover:border-[hsl(220_15%_24%)] hover:text-white"
                }`}
              >
                <span className="text-sm">{action.icon}</span>
                <span className="text-[11px] font-medium flex-1">{action.label}</span>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                  selectedActions.includes(action.id) ? "border-violet-500 bg-violet-500" : "border-[hsl(220_15%_25%)]"
                }`}>
                  {selectedActions.includes(action.id) && <span className="text-white text-[8px] font-bold">✓</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Output settings */}
        <div className="p-3 border-b border-[hsl(220_15%_14%)]">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-2">Output Settings</span>

          <div className="flex gap-1 mb-2">
            {(["png", "jpeg", "webp"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setOutputFormat(f)}
                className={`flex-1 py-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
                  outputFormat === f ? "border-violet-500 bg-violet-900/20 text-violet-300" : "border-[hsl(220_15%_16%)] text-gray-500"
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          {outputFormat !== "png" && (
            <div className="mb-2">
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-gray-400">Quality</span>
                <span className="text-[10px] text-white font-mono">{outputQuality}%</span>
              </div>
              <input type="range" min={50} max={100} value={outputQuality}
                onChange={(e) => setOutputQuality(Number(e.target.value))} className="w-full" />
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 shrink-0">Prefix</span>
            <input
              type="text" value={prefix} onChange={(e) => setPrefix(e.target.value)}
              className="flex-1 px-2 py-1 bg-[hsl(220_15%_12%)] border border-[hsl(220_15%_18%)] rounded text-[11px] text-white outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Progress */}
        {processing && (
          <div className="p-3">
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-gray-400">Processing...</span>
              <span className="text-[10px] text-violet-400 font-mono">{progress}%</span>
            </div>
            <div className="h-1.5 bg-[hsl(220_15%_16%)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-pink-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats */}
        {files.length > 0 && !processing && (
          <div className="p-3 flex gap-3">
            <div className="flex-1 text-center">
              <div className="text-base font-bold text-gray-300">{pendingCount}</div>
              <div className="text-[9px] text-gray-600">Pending</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-base font-bold text-green-400">{doneCount}</div>
              <div className="text-[9px] text-gray-600">Done</div>
            </div>
            {errorCount > 0 && (
              <div className="flex-1 text-center">
                <div className="text-base font-bold text-red-400">{errorCount}</div>
                <div className="text-[9px] text-gray-600">Errors</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 p-3 border-t border-[hsl(220_15%_14%)] flex flex-col gap-2">
        <button
          onClick={runBatch}
          disabled={files.length === 0 || selectedActions.length === 0 || processing}
          className="w-full flex items-center justify-center gap-2 py-2 action-btn-primary action-btn disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {processing ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
          {processing ? `Processing ${progress}%...` : `Process ${files.length} File${files.length !== 1 ? "s" : ""}`}
        </button>
        {doneCount > 0 && (
          <button
            onClick={downloadAll}
            className="w-full flex items-center justify-center gap-2 py-1.5 action-btn"
          >
            <Download size={12} /> Download All ({doneCount})
          </button>
        )}
      </div>
    </div>
  );
}
