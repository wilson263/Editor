import { useRef, useState, useEffect } from "react";
import { useEditorStore, type VideoClip } from "@/lib/editorStore";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Scissors, Plus, Trash2, Music, Film, Image, ChevronDown
} from "lucide-react";
import { generateId, TRANSITIONS } from "@/lib/imageUtils";

const TRACK_HEIGHT = 52;
const PX_PER_SEC = 60;

function TimelineClip({ clip }: { clip: VideoClip }) {
  const { removeVideoClip } = useEditorStore();
  const COLORS = {
    video: "bg-violet-700 border-violet-500",
    audio: "bg-emerald-700 border-emerald-500",
    image: "bg-blue-700 border-blue-500",
  };

  return (
    <div
      className={`absolute top-1 bottom-1 timeline-clip border rounded ${COLORS[clip.type]} flex items-center px-2 gap-1 overflow-hidden group`}
      style={{
        left: clip.startTime * PX_PER_SEC,
        width: Math.max(clip.duration * PX_PER_SEC - 2, 40),
      }}
      title={clip.name}
    >
      <span className="text-[10px] text-white truncate flex-1 font-medium">{clip.name}</span>
      <button
        onClick={() => removeVideoClip(clip.id)}
        className="hidden group-hover:flex p-0.5 rounded hover:bg-black/30 text-white/70 hover:text-white"
      >
        <Trash2 size={10} />
      </button>
    </div>
  );
}

export default function VideoEditor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    sourceVideo, videoClips, addVideoClip, playheadTime, setPlayheadTime,
    isPlaying, setIsPlaying, totalDuration, sourceImage
  } = useEditorStore();

  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showTransitions, setShowTransitions] = useState(false);

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

  function handleTimeUpdate() {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    setPlayheadTime(videoRef.current.currentTime);
  }

  function seekTo(t: number) {
    if (!videoRef.current) return;
    videoRef.current.currentTime = t;
    setPlayheadTime(t);
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 100);
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  }

  function addDemoClips() {
    const clips: VideoClip[] = [
      { id: generateId(), name: "Clip 1", src: "", startTime: 0, endTime: 5, duration: 5, track: 0, type: "video", volume: 100, speed: 1, filters: {} as any },
      { id: generateId(), name: "Clip 2", src: "", startTime: 5.5, endTime: 11, duration: 5.5, track: 0, type: "video", volume: 100, speed: 1, filters: {} as any },
      { id: generateId(), name: "Music Track", src: "", startTime: 0, endTime: 12, duration: 12, track: 1, type: "audio", volume: 80, speed: 1, filters: {} as any },
      { id: generateId(), name: "Title Card", src: "", startTime: 0, endTime: 3, duration: 3, track: 2, type: "image", volume: 0, speed: 1, filters: {} as any },
    ];
    clips.forEach(addVideoClip);
  }

  const tracks = [0, 1, 2];
  const trackLabels: Record<number, string> = { 0: "Video", 1: "Audio", 2: "Overlay" };
  const trackIcons: Record<number, React.ReactNode> = {
    0: <Film size={11} />,
    1: <Music size={11} />,
    2: <Image size={11} />,
  };

  const dur = videoRef.current?.duration || totalDuration || 30;

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
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-600">
              <Film size={40} className="opacity-40" />
              <span className="text-sm">Upload a video to start editing</span>
              <button
                onClick={addDemoClips}
                className="text-xs text-violet-400 hover:text-violet-300 transition-all"
              >
                or add demo clips to timeline →
              </button>
            </div>
          )}

          {/* Time overlay */}
          <div className="absolute top-2 left-2 font-mono text-xs text-white/60 bg-black/50 px-2 py-0.5 rounded">
            {formatTime(currentTime)} / {formatTime(dur)}
          </div>
        </div>

        {/* Video properties panel */}
        <div className="w-56 border-l border-[hsl(215_20%_16%)] flex flex-col overflow-y-auto">
          <div className="px-3 py-2 border-b border-[hsl(215_20%_16%)] text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
            Video Properties
          </div>
          <div className="p-3 flex flex-col gap-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">Volume</span>
                <span className="text-gray-300 font-mono">{volume}%</span>
              </div>
              <input type="range" min={0} max={100} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">Speed</span>
                <span className="text-gray-300 font-mono">1.0x</span>
              </div>
              <div className="flex gap-1">
                {[0.25, 0.5, 1, 1.5, 2, 4].map((s) => (
                  <button key={s} className="flex-1 py-1 rounded bg-[hsl(215_20%_16%)] text-[9px] text-gray-400 hover:bg-violet-900/30 hover:text-violet-300 transition-all">
                    {s}x
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-gray-500 block mb-2">Transition</span>
              <select className="w-full bg-[hsl(215_20%_16%)] border border-[hsl(215_20%_22%)] text-[10px] text-white rounded px-2 py-1.5 outline-none">
                {TRANSITIONS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <span className="text-gray-500 block mb-2">Export Resolution</span>
              <div className="flex flex-col gap-1">
                {["720p", "1080p", "4K", "8K"].map((res) => (
                  <button
                    key={res}
                    className={`py-1 rounded text-[10px] border transition-all ${
                      res === "1080p"
                        ? "bg-violet-600/20 border-violet-500 text-violet-300"
                        : "border-[hsl(215_20%_20%)] text-gray-400 hover:border-violet-600/50"
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Playback controls */}
      <div className="h-10 border-t border-[hsl(215_20%_16%)] flex items-center px-3 gap-3 bg-[hsl(220_13%_11%)]">
        <button onClick={() => seekTo(0)} className="p-1 text-gray-400 hover:text-white transition-all">
          <SkipBack size={14} />
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition-all"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>
        <button onClick={() => seekTo(Math.min(currentTime + 5, dur))} className="p-1 text-gray-400 hover:text-white transition-all">
          <SkipForward size={14} />
        </button>

        {/* Progress bar */}
        <div className="flex-1 relative">
          <div className="h-1.5 bg-[hsl(215_20%_20%)] rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 transition-all"
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

        <span className="text-xs text-gray-400 font-mono">{formatTime(currentTime)}</span>

        <button onClick={() => setMuted(!muted)} className="p-1 text-gray-400 hover:text-white transition-all">
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
        <div className="w-16">
          <input
            type="range"
            min={0}
            max={100}
            value={muted ? 0 : volume}
            onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false); }}
            className="w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 ml-2">
          <button className="flex items-center gap-1 px-2 py-1 rounded bg-[hsl(215_20%_18%)] text-xs text-gray-400 hover:text-white transition-all">
            <Scissors size={11} /> Split
          </button>
          <button
            onClick={addDemoClips}
            className="flex items-center gap-1 px-2 py-1 rounded bg-violet-600/20 border border-violet-600/40 text-xs text-violet-300 hover:bg-violet-600/30 transition-all"
          >
            <Plus size={11} /> Add Clip
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="h-[150px] border-t border-[hsl(215_20%_16%)] flex flex-col overflow-hidden bg-[hsl(220_13%_9%)]">
        {/* Time ruler */}
        <div className="flex h-5 shrink-0 border-b border-[hsl(215_20%_16%)]">
          <div className="w-16 shrink-0 border-r border-[hsl(215_20%_16%)] bg-[hsl(220_13%_10%)]" />
          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 flex" style={{ width: `${dur * PX_PER_SEC}px` }}>
              {Array.from({ length: Math.ceil(dur) + 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute flex flex-col items-start"
                  style={{ left: i * PX_PER_SEC }}
                >
                  <div className="h-2 w-px bg-[hsl(215_20%_25%)]" />
                  <span className="text-[9px] text-gray-600 font-mono ml-0.5">{i}s</span>
                </div>
              ))}
              {/* Playhead */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-violet-500 z-10"
                style={{ left: currentTime * PX_PER_SEC }}
              >
                <div className="absolute -top-0 -left-1.5 w-3 h-3 bg-violet-500 rotate-45 transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Track rows */}
        <div className="flex-1 overflow-y-auto overflow-x-auto">
          {tracks.map((trackNum) => (
            <div key={trackNum} className="flex" style={{ height: TRACK_HEIGHT }}>
              {/* Track header */}
              <div className="w-16 shrink-0 flex items-center gap-1.5 px-2 border-r border-[hsl(215_20%_16%)] bg-[hsl(220_13%_10%)] border-b border-b-[hsl(215_20%_16%)]">
                <span className="text-gray-600">{trackIcons[trackNum]}</span>
                <span className="text-[9px] text-gray-500 font-medium">{trackLabels[trackNum]}</span>
              </div>
              {/* Track clips area */}
              <div
                className="flex-1 relative bg-[hsl(220_13%_9%)] border-b border-[hsl(215_20%_16%)]"
                style={{ minWidth: `${dur * PX_PER_SEC}px` }}
              >
                {/* Playhead */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-violet-500/50 z-10 pointer-events-none"
                  style={{ left: currentTime * PX_PER_SEC }}
                />
                {videoClips
                  .filter((c) => c.track === trackNum)
                  .map((clip) => (
                    <TimelineClip key={clip.id} clip={clip} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
