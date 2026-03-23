import { useRef, useState, useEffect, useCallback } from "react";
import { useEditorStore, type VideoClip } from "@/lib/editorStore";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Scissors, Plus, Trash2, Music, Film, Image, ChevronDown,
  Download, Settings, ZoomIn, ZoomOut, RefreshCw, Lock,
  Unlock, Eye, EyeOff, Copy, SplitSquareVertical, ChevronRight,
  Wand2, Sun, Contrast, Palette
} from "lucide-react";
import { generateId, TRANSITIONS } from "@/lib/imageUtils";

const TRACK_HEIGHT = 52;
const PX_PER_SEC = 60;

function TimelineClip({ clip, onSelect, selected }: { clip: VideoClip; onSelect: () => void; selected?: boolean }) {
  const { removeVideoClip } = useEditorStore();
  const COLORS = {
    video: selected ? "bg-violet-600 border-violet-400" : "bg-violet-700 border-violet-500",
    audio: selected ? "bg-emerald-600 border-emerald-400" : "bg-emerald-700 border-emerald-500",
    image: selected ? "bg-blue-600 border-blue-400" : "bg-blue-700 border-blue-500",
  };

  const width = Math.max(clip.duration * PX_PER_SEC - 2, 40);

  return (
    <div
      onClick={onSelect}
      className={`absolute top-1 bottom-1 timeline-clip border rounded cursor-pointer ${COLORS[clip.type]} flex items-center px-2 gap-1 overflow-hidden group transition-all`}
      style={{
        left: clip.startTime * PX_PER_SEC,
        width,
      }}
      title={clip.name}
    >
      {/* Waveform-like decoration for audio */}
      {clip.type === "audio" && (
        <div className="absolute inset-0 flex items-center px-1 opacity-30">
          {Array.from({ length: Math.max(4, Math.floor(width / 8)) }, (_, i) => (
            <div
              key={i}
              className="flex-1 mx-px bg-white rounded-full"
              style={{ height: `${20 + Math.sin(i * 1.3) * 14}%` }}
            />
          ))}
        </div>
      )}
      <span className="text-[10px] text-white truncate flex-1 font-medium relative z-10">{clip.name}</span>
      <button
        onClick={(e) => { e.stopPropagation(); removeVideoClip(clip.id); }}
        className="hidden group-hover:flex p-0.5 rounded hover:bg-black/30 text-white/70 hover:text-white relative z-10"
      >
        <Trash2 size={10} />
      </button>
    </div>
  );
}

export default function VideoEditor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const {
    sourceVideo, videoClips, addVideoClip, playheadTime, setPlayheadTime,
    isPlaying, setIsPlaying, totalDuration, sourceImage
  } = useEditorStore();

  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showTransitions, setShowTransitions] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [selectedRes, setSelectedRes] = useState("1080p");
  const [selectedSpeed, setSelectedSpeed] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [activeTab, setActiveTab] = useState<"properties" | "effects" | "export">("properties");
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [videoFilter, setVideoFilter] = useState("none");

  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
      videoRef.current.muted = muted;
    }
  }, [volume, muted]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = selectedSpeed;
    }
  }, [selectedSpeed]);

  function handleTimeUpdate() {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    setPlayheadTime(videoRef.current.currentTime);
  }

  function seekTo(t: number) {
    if (!videoRef.current) return;
    videoRef.current.currentTime = t;
    setPlayheadTime(t);
    setCurrentTime(t);
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 100);
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  }

  function addDemoClips() {
    const clips: VideoClip[] = [
      { id: generateId(), name: "Main Video", src: "", startTime: 0, endTime: 8, duration: 8, track: 0, type: "video", volume: 100, speed: 1, filters: {} as any },
      { id: generateId(), name: "B-Roll Clip", src: "", startTime: 8.5, endTime: 15, duration: 6.5, track: 0, type: "video", volume: 100, speed: 1, filters: {} as any },
      { id: generateId(), name: "Cutaway", src: "", startTime: 16, endTime: 22, duration: 6, track: 0, type: "video", volume: 100, speed: 1, filters: {} as any },
      { id: generateId(), name: "Background Music", src: "", startTime: 0, endTime: 22, duration: 22, track: 1, type: "audio", volume: 75, speed: 1, filters: {} as any },
      { id: generateId(), name: "SFX Layer", src: "", startTime: 3, endTime: 10, duration: 7, track: 1, type: "audio", volume: 60, speed: 1, filters: {} as any },
      { id: generateId(), name: "Title Overlay", src: "", startTime: 0, endTime: 4, duration: 4, track: 2, type: "image", volume: 0, speed: 1, filters: {} as any },
      { id: generateId(), name: "Lower Third", src: "", startTime: 6, endTime: 12, duration: 6, track: 2, type: "image", volume: 0, speed: 1, filters: {} as any },
    ];
    clips.forEach(addVideoClip);
  }

  function splitAtPlayhead() {
    const selectedClip = videoClips.find(c => c.id === selectedClipId);
    if (!selectedClip) return;
    const { removeVideoClip } = useEditorStore.getState();
    if (currentTime <= selectedClip.startTime || currentTime >= selectedClip.endTime) return;
    const leftDur = currentTime - selectedClip.startTime;
    const rightDur = selectedClip.endTime - currentTime;
    removeVideoClip(selectedClip.id);
    addVideoClip({ ...selectedClip, id: generateId(), endTime: currentTime, duration: leftDur, name: selectedClip.name + " A" });
    addVideoClip({ ...selectedClip, id: generateId(), startTime: currentTime, duration: rightDur, name: selectedClip.name + " B" });
  }

  async function simulateExport() {
    setIsExporting(true);
    setExportProgress(0);
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 80));
      setExportProgress(i);
    }
    setIsExporting(false);
    setExportProgress(0);
  }

  const tracks = [0, 1, 2];
  const trackLabels: Record<number, string> = { 0: "Video", 1: "Audio", 2: "Overlay" };
  const trackColors: Record<number, string> = { 0: "text-violet-400", 1: "text-emerald-400", 2: "text-blue-400" };
  const trackIcons: Record<number, React.ReactNode> = {
    0: <Film size={11} />,
    1: <Music size={11} />,
    2: <Image size={11} />,
  };

  const dur = videoRef.current?.duration || totalDuration || 30;
  const selectedClip = videoClips.find(c => c.id === selectedClipId);

  const VIDEO_FILTERS = [
    { id: "none", label: "Original", css: "" },
    { id: "vivid", label: "Vivid", css: "saturate(1.5) contrast(1.1)" },
    { id: "cinema", label: "Cinematic", css: "contrast(1.2) saturate(0.85) sepia(0.15)" },
    { id: "warm", label: "Warm", css: "sepia(0.3) saturate(1.2) brightness(1.05)" },
    { id: "cool", label: "Cool", css: "hue-rotate(15deg) saturate(1.1)" },
    { id: "bw", label: "B&W", css: "grayscale(1) contrast(1.2)" },
    { id: "fade", label: "Faded", css: "contrast(0.85) brightness(1.1) saturate(0.8)" },
    { id: "neon", label: "Neon", css: "saturate(2) contrast(1.2) brightness(1.1)" },
  ];

  return (
    <div className="flex flex-col h-full bg-[hsl(220_13%_10%)]">
      {/* Preview + Controls */}
      <div className="flex gap-0 h-[calc(100%-240px)] min-h-0">
        {/* Video Preview */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
          {sourceVideo ? (
            <video
              ref={videoRef}
              src={sourceVideo}
              className="max-w-full max-h-full object-contain"
              style={{ filter: VIDEO_FILTERS.find(f => f.id === videoFilter)?.css || "" }}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-600">
              <Film size={40} className="opacity-40" />
              <span className="text-sm font-medium">Upload a video to start editing</span>
              <p className="text-xs text-gray-700 text-center max-w-48">Supports MP4, MOV, WebM, AVI. Drag & drop or use the upload button above.</p>
              <button
                onClick={addDemoClips}
                className="text-xs text-violet-400 hover:text-violet-300 transition-all px-3 py-1.5 rounded border border-violet-600/30 hover:border-violet-500/50"
              >
                + Add demo clips to timeline
              </button>
            </div>
          )}

          {/* Overlays */}
          <div className="absolute top-2 left-2 font-mono text-xs text-white/60 bg-black/50 px-2 py-0.5 rounded">
            {formatTime(currentTime)} / {formatTime(dur)}
          </div>
          {videoFilter !== "none" && (
            <div className="absolute top-2 right-2 text-[10px] text-white/50 bg-black/50 px-2 py-0.5 rounded">
              Filter: {VIDEO_FILTERS.find(f => f.id === videoFilter)?.label}
            </div>
          )}
          {isPlaying && (
            <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title="Recording/Playing" />
          )}
        </div>

        {/* Properties / Effects / Export panel */}
        <div className="w-56 border-l border-[hsl(215_20%_16%)] flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[hsl(215_20%_16%)] shrink-0">
            {(["properties", "effects", "export"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-[10px] font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? "text-violet-300 border-b border-violet-500"
                    : "text-gray-600 hover:text-gray-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 text-xs">
            {activeTab === "properties" && (
              <>
                {/* Volume */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Volume</span>
                    <span className="text-gray-300 font-mono">{volume}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full" />
                </div>
                {/* Speed */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Playback Speed</span>
                    <span className="text-gray-300 font-mono">{selectedSpeed}x</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[0.25, 0.5, 1, 1.5, 2, 4].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSpeed(s)}
                        className={`py-1 rounded text-[10px] transition-all ${
                          selectedSpeed === s
                            ? "bg-violet-600 text-white"
                            : "bg-[hsl(215_20%_16%)] text-gray-400 hover:bg-violet-900/30 hover:text-violet-300"
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
                {/* Transition */}
                <div>
                  <span className="text-gray-500 block mb-1.5">Clip Transition</span>
                  <select
                    className="w-full bg-[hsl(215_20%_16%)] border border-[hsl(215_20%_22%)] text-[10px] text-white rounded px-2 py-1.5 outline-none"
                  >
                    {TRANSITIONS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                {/* Clip info */}
                {selectedClip && (
                  <div className="rounded-lg bg-[hsl(215_20%_14%)] p-2 text-[10px] flex flex-col gap-1">
                    <div className="text-gray-500 font-semibold uppercase tracking-widest mb-1">Selected Clip</div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name</span>
                      <span className="text-gray-300">{selectedClip.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start</span>
                      <span className="text-gray-300 font-mono">{formatTime(selectedClip.startTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="text-gray-300 font-mono">{formatTime(selectedClip.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type</span>
                      <span className={`capitalize ${trackColors[selectedClip.track]}`}>{selectedClip.type}</span>
                    </div>
                    <button
                      onClick={splitAtPlayhead}
                      className="mt-1 w-full py-1 rounded bg-violet-600/20 border border-violet-600/30 text-violet-300 hover:bg-violet-600/30 transition-all flex items-center justify-center gap-1"
                    >
                      <SplitSquareVertical size={10} /> Split at Playhead
                    </button>
                  </div>
                )}
                {!selectedClip && (
                  <div className="text-[10px] text-gray-600 text-center py-2">
                    Click a clip to select it
                  </div>
                )}
              </>
            )}

            {activeTab === "effects" && (
              <>
                <div>
                  <span className="text-gray-500 block mb-2 uppercase tracking-widest text-[10px]">Video Filter</span>
                  <div className="grid grid-cols-2 gap-1">
                    {VIDEO_FILTERS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setVideoFilter(f.id)}
                        className={`py-1.5 rounded text-[10px] border transition-all ${
                          videoFilter === f.id
                            ? "bg-violet-600/30 border-violet-500 text-violet-300"
                            : "border-[hsl(215_20%_20%)] text-gray-400 hover:border-violet-600/40"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 block mb-2 uppercase tracking-widest text-[10px]">Color Correction</span>
                  {[
                    { label: "Brightness", min: -100, max: 100, def: 0 },
                    { label: "Contrast", min: -100, max: 100, def: 0 },
                    { label: "Saturation", min: -100, max: 100, def: 0 },
                  ].map(({ label, min, max, def }) => (
                    <div key={label} className="mb-2">
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-gray-600">{label}</span>
                        <span className="text-gray-500 font-mono">{def}</span>
                      </div>
                      <input type="range" min={min} max={max} defaultValue={def} className="w-full" />
                    </div>
                  ))}
                </div>
                <div>
                  <span className="text-gray-500 block mb-2 uppercase tracking-widest text-[10px]">AI Effects</span>
                  {["Stabilize Footage", "Denoise Video", "Sharpen Details", "Motion Blur"].map((fx) => (
                    <button
                      key={fx}
                      className="w-full flex items-center justify-between px-2 py-1.5 mb-1 rounded bg-[hsl(215_20%_14%)] text-[10px] text-gray-400 hover:text-violet-300 hover:bg-violet-900/20 transition-all"
                    >
                      <span>{fx}</span>
                      <ChevronRight size={10} />
                    </button>
                  ))}
                </div>
              </>
            )}

            {activeTab === "export" && (
              <>
                <div>
                  <span className="text-gray-500 block mb-2 uppercase tracking-widest text-[10px]">Resolution</span>
                  <div className="flex flex-col gap-1">
                    {[
                      { label: "720p HD", value: "720p" },
                      { label: "1080p Full HD", value: "1080p" },
                      { label: "4K Ultra HD", value: "4K" },
                      { label: "8K", value: "8K" },
                    ].map(({ label, value }) => (
                      <button
                        key={value}
                        onClick={() => setSelectedRes(value)}
                        className={`py-1.5 rounded text-[10px] border transition-all text-left px-2 flex justify-between ${
                          selectedRes === value
                            ? "bg-violet-600/20 border-violet-500 text-violet-300"
                            : "border-[hsl(215_20%_20%)] text-gray-400 hover:border-violet-600/50"
                        }`}
                      >
                        <span>{label}</span>
                        {value === "4K" && <span className="text-[8px] text-amber-400 bg-amber-900/30 px-1 rounded">PRO</span>}
                        {value === "8K" && <span className="text-[8px] text-violet-400 bg-violet-900/30 px-1 rounded">MAX</span>}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 block mb-2 uppercase tracking-widest text-[10px]">Format</span>
                  <div className="grid grid-cols-3 gap-1">
                    {["MP4", "MOV", "WebM"].map((fmt) => (
                      <button key={fmt} className="py-1.5 rounded text-[10px] border border-[hsl(215_20%_20%)] text-gray-400 hover:border-violet-600/40 hover:text-violet-300 transition-all">
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
                {isExporting ? (
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-violet-400">Exporting...</span>
                      <span className="text-violet-400 font-mono">{exportProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-[hsl(215_20%_18%)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-pink-500 rounded-full transition-all"
                        style={{ width: `${exportProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={simulateExport}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 text-white text-xs font-semibold flex items-center justify-center gap-2 hover:from-violet-500 hover:to-pink-500 transition-all"
                  >
                    <Download size={13} /> Export Video
                  </button>
                )}
                <div className="text-[10px] text-gray-600 text-center">
                  {videoClips.length} clips · {formatTime(dur)} total
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Playback controls */}
      <div className="h-10 border-t border-[hsl(215_20%_16%)] flex items-center px-3 gap-2 bg-[hsl(220_13%_11%)] shrink-0">
        <button onClick={() => seekTo(0)} className="p-1 text-gray-400 hover:text-white transition-all" title="Go to start">
          <SkipBack size={14} />
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition-all shadow-lg shadow-violet-900/50"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>
        <button onClick={() => seekTo(Math.min(currentTime + 5, dur))} className="p-1 text-gray-400 hover:text-white transition-all" title="Skip 5s forward">
          <SkipForward size={14} />
        </button>

        {/* Progress bar */}
        <div className="flex-1 relative group">
          <div className="h-1.5 bg-[hsl(215_20%_20%)] rounded-full overflow-hidden group-hover:h-2 transition-all">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all"
              style={{ width: `${(currentTime / Math.max(dur, 1)) * 100}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={dur}
            step={0.01}
            value={currentTime}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-pointer w-full"
          />
        </div>

        <span className="text-xs text-gray-400 font-mono w-20 shrink-0">{formatTime(currentTime)}</span>

        <button onClick={() => setMuted(!muted)} className="p-1 text-gray-400 hover:text-white transition-all">
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
        <div className="w-14 shrink-0">
          <input
            type="range"
            min={0}
            max={100}
            value={muted ? 0 : volume}
            onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false); }}
            className="w-full"
          />
        </div>

        {/* Timeline zoom */}
        <div className="flex items-center gap-1 ml-1">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-1 text-gray-500 hover:text-white transition-all" title="Zoom out timeline">
            <ZoomOut size={12} />
          </button>
          <span className="text-[10px] text-gray-600 font-mono w-8 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} className="p-1 text-gray-500 hover:text-white transition-all" title="Zoom in timeline">
            <ZoomIn size={12} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 ml-1">
          <button
            onClick={splitAtPlayhead}
            title="Split selected clip at playhead"
            className="flex items-center gap-1 px-2 py-1 rounded bg-[hsl(215_20%_18%)] text-xs text-gray-400 hover:text-white transition-all"
          >
            <Scissors size={11} /> Split
          </button>
          <button
            onClick={addDemoClips}
            className="flex items-center gap-1 px-2 py-1 rounded bg-violet-600/20 border border-violet-600/40 text-xs text-violet-300 hover:bg-violet-600/30 transition-all"
          >
            <Plus size={11} /> Add Clips
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="border-t border-[hsl(215_20%_16%)] flex flex-col overflow-hidden bg-[hsl(220_13%_9%)]" style={{ height: 150 }}>
        {/* Time ruler */}
        <div className="flex h-5 shrink-0 border-b border-[hsl(215_20%_16%)]">
          <div className="w-20 shrink-0 border-r border-[hsl(215_20%_16%)] bg-[hsl(220_13%_10%)] flex items-center justify-center">
            <span className="text-[9px] text-gray-600">Tracks</span>
          </div>
          <div className="flex-1 relative overflow-x-auto" ref={timelineRef}>
            <div className="absolute inset-0 flex" style={{ width: `${dur * PX_PER_SEC * zoom}px` }}>
              {Array.from({ length: Math.ceil(dur) + 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute flex flex-col items-start"
                  style={{ left: i * PX_PER_SEC * zoom }}
                >
                  <div className="h-2 w-px bg-[hsl(215_20%_25%)]" />
                  <span className="text-[9px] text-gray-600 font-mono ml-0.5">{i}s</span>
                </div>
              ))}
              {/* Playhead on ruler */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-violet-400 z-10 cursor-ew-resize"
                style={{ left: currentTime * PX_PER_SEC * zoom }}
              >
                <div className="absolute -top-0.5 -left-1.5 w-3 h-2 bg-violet-400 clip-triangle" style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Track rows */}
        <div className="flex-1 overflow-y-auto overflow-x-auto">
          {tracks.map((trackNum) => (
            <div key={trackNum} className="flex" style={{ height: TRACK_HEIGHT }}>
              {/* Track header */}
              <div className="w-20 shrink-0 flex items-center gap-1.5 px-2 border-r border-b border-[hsl(215_20%_16%)] bg-[hsl(220_13%_10%)]">
                <span className={trackColors[trackNum]}>{trackIcons[trackNum]}</span>
                <span className="text-[9px] text-gray-500 font-medium">{trackLabels[trackNum]}</span>
              </div>
              {/* Track clips area */}
              <div
                className="flex-1 relative bg-[hsl(220_13%_9%)] border-b border-[hsl(215_20%_16%)]"
                style={{ minWidth: `${dur * PX_PER_SEC * zoom}px` }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  seekTo(x / (PX_PER_SEC * zoom));
                }}
              >
                {/* Subtle grid lines */}
                {Array.from({ length: Math.ceil(dur) }, (_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 w-px bg-white/3"
                    style={{ left: (i + 1) * PX_PER_SEC * zoom }}
                  />
                ))}
                {/* Playhead */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-violet-500/50 z-10 pointer-events-none"
                  style={{ left: currentTime * PX_PER_SEC * zoom }}
                />
                {videoClips
                  .filter((c) => c.track === trackNum)
                  .map((clip) => {
                    const scaledClip = { ...clip, startTime: clip.startTime * zoom, duration: clip.duration * zoom };
                    return (
                      <TimelineClip
                        key={clip.id}
                        clip={scaledClip}
                        selected={selectedClipId === clip.id}
                        onSelect={() => setSelectedClipId(clip.id === selectedClipId ? null : clip.id)}
                      />
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
