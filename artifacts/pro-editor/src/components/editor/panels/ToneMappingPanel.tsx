import { useState } from "react";
import { useEditorStore } from "@/lib/editorStore";
import { Sun, Camera, Check, Play, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";

// Camera profile curves (simplified)
const CAMERA_PROFILES = [
  { id: "none", name: "Linear", brand: "Generic" },
  { id: "canon-faithful", name: "Canon Faithful", brand: "Canon" },
  { id: "canon-landscape", name: "Canon Landscape", brand: "Canon" },
  { id: "canon-neutral", name: "Canon Neutral", brand: "Canon" },
  { id: "nikon-vivid", name: "Nikon Vivid", brand: "Nikon" },
  { id: "nikon-natural", name: "Nikon Natural", brand: "Nikon" },
  { id: "nikon-portrait", name: "Nikon Portrait", brand: "Nikon" },
  { id: "sony-vivid", name: "Sony Vivid", brand: "Sony" },
  { id: "sony-neutral", name: "Sony Neutral", brand: "Sony" },
  { id: "sony-cinema", name: "Sony Cine Profile", brand: "Sony" },
  { id: "fuji-velvia", name: "Velvia/Vivid", brand: "Fujifilm" },
  { id: "fuji-provia", name: "Provia/Standard", brand: "Fujifilm" },
  { id: "fuji-classic-neg", name: "Classic Negative", brand: "Fujifilm" },
  { id: "fuji-eterna", name: "Eterna Cinema", brand: "Fujifilm" },
  { id: "fuji-acros", name: "Acros (B&W)", brand: "Fujifilm" },
  { id: "leica-vivid", name: "Leica Vivid", brand: "Leica" },
  { id: "hasselblad-natural", name: "Hasselblad Natural", brand: "Hasselblad" },
  { id: "arri-logc", name: "ARRI Log C", brand: "ARRI" },
  { id: "red-log3g10", name: "RED Log3G10", brand: "RED" },
  { id: "slog3", name: "Sony S-Log3", brand: "Sony Log" },
];

const TONE_MAPPING_ALGORITHMS = [
  { id: "none", name: "None", desc: "No tone mapping" },
  { id: "reinhard", name: "Reinhard", desc: "Classic global tone mapping" },
  { id: "aces", name: "ACES Filmic", desc: "Academy Color Encoding System" },
  { id: "filmic", name: "Filmic", desc: "S-curve filmic response" },
  { id: "hejl", name: "Hejl-Burgess", desc: "Jim Hejl & Richard Burgess-Dawson" },
  { id: "uncharted2", name: "Uncharted 2", desc: "Uncharted 2 HDR operator" },
  { id: "lottes", name: "Lottes", desc: "Timothy Lottes HDR operator" },
  { id: "uchimura", name: "Uchimura", desc: "Hajime Uchimura operator" },
];

const BRAND_COLORS: Record<string, string> = {
  "Canon": "text-red-400",
  "Nikon": "text-yellow-400",
  "Sony": "text-blue-400",
  "Fujifilm": "text-green-400",
  "Leica": "text-red-300",
  "Hasselblad": "text-amber-400",
  "ARRI": "text-orange-400",
  "RED": "text-red-500",
  "Sony Log": "text-blue-300",
  "Generic": "text-gray-400",
};

function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }

function reinhardToneMap(r: number, g: number, b: number): [number, number, number] {
  return [r / (1 + r), g / (1 + g), b / (1 + b)];
}

function acesToneMap(r: number, g: number, b: number): [number, number, number] {
  const a = 2.51, b2 = 0.03, c = 2.43, d = 0.59, e = 0.14;
  const f = (x: number) => clamp01((x * (a * x + b2)) / (x * (c * x + d) + e));
  return [f(r), f(g), f(b)];
}

function filmicToneMap(r: number, g: number, b: number): [number, number, number] {
  const filmicCurve = (x: number) => {
    const x2 = Math.max(0, x - 0.004);
    return (x2 * (6.2 * x2 + 0.5)) / (x2 * (6.2 * x2 + 1.7) + 0.06);
  };
  return [filmicCurve(r), filmicCurve(g), filmicCurve(b)];
}

function hejlToneMap(r: number, g: number, b: number): [number, number, number] {
  const hejl = (x: number) => clamp01(x * (6.2 * x + 0.5) / (x * (6.2 * x + 1.7) + 0.06));
  return [hejl(r), hejl(g), hejl(b)];
}

function uncharted2ToneMap(r: number, g: number, b: number): [number, number, number] {
  const A = 0.15, B = 0.50, C = 0.10, D = 0.20, E = 0.02, F = 0.30, W = 11.2;
  const u2 = (x: number) => ((x * (A * x + C * B) + D * E) / (x * (A * x + B) + D * F)) - E / F;
  const whiteScale = 1 / u2(W);
  return [u2(r * 2) * whiteScale, u2(g * 2) * whiteScale, u2(b * 2) * whiteScale];
}

function applyToneMap(canvas: HTMLCanvasElement, algorithm: string, exposure: number) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const expFactor = Math.pow(2, exposure / 100 * 3);

  for (let i = 0; i < data.length; i += 4) {
    let r = (data[i] / 255) * expFactor;
    let g = (data[i + 1] / 255) * expFactor;
    let b = (data[i + 2] / 255) * expFactor;

    let nr = r, ng = g, nb = b;
    switch (algorithm) {
      case "reinhard": [nr, ng, nb] = reinhardToneMap(r, g, b); break;
      case "aces": [nr, ng, nb] = acesToneMap(r, g, b); break;
      case "filmic": [nr, ng, nb] = filmicToneMap(r, g, b); break;
      case "hejl": [nr, ng, nb] = hejlToneMap(r, g, b); break;
      case "uncharted2": [nr, ng, nb] = uncharted2ToneMap(r, g, b); break;
      case "lottes":
        nr = clamp01(r / (r + 0.85)); ng = clamp01(g / (g + 0.85)); nb = clamp01(b / (b + 0.85)); break;
      case "uchimura": {
        const P = 1, a = 1, m = 0.22, l = 0.4, c2 = 1.33, b3 = 0;
        const uchimura = (x: number) => {
          const l0 = ((P - m) * l) / a;
          const L0 = m - m / a;
          const L1 = m + (1 - m) / a;
          const S0 = m + l0;
          const S1 = m + a * l0;
          const C2 = (a * P) / (P - S1);
          const CP = -C2 / P;
          const w0 = 1 - (1 / (1 + Math.exp(a * (x - m))));
          const w2 = (x < m + l0) ? 0 : 1;
          const w1 = 1 - w0 - w2;
          const T = m * Math.pow(x / m, c2) + b3;
          const S = P - (P - S1) * Math.exp(CP * (x - S0));
          const L = m + a * (x - m);
          return T * w0 + L * w1 + S * w2;
        };
        nr = uchimura(r); ng = uchimura(g); nb = uchimura(b);
        break;
      }
    }
    data[i] = Math.min(255, nr * 255);
    data[i + 1] = Math.min(255, ng * 255);
    data[i + 2] = Math.min(255, nb * 255);
  }
  ctx.putImageData(imgData, 0, 0);
}

function applyCameraProfile(canvas: HTMLCanvasElement, profile: string) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx || profile === "none") return;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Profile-specific color science adjustments
  const profiles: Record<string, (r: number, g: number, b: number) => [number, number, number]> = {
    "canon-faithful": (r, g, b) => [r * 1.05, g * 0.99, b * 0.97],
    "canon-landscape": (r, g, b) => [r * 0.96, g * 1.08, b * 0.92],
    "canon-neutral": (r, g, b) => [r * 0.99, g * 1.01, b * 1.02],
    "nikon-vivid": (r, g, b) => [r * 1.1, g * 1.05, b * 0.95],
    "nikon-natural": (r, g, b) => [r * 1.0, g * 1.02, b * 0.98],
    "nikon-portrait": (r, g, b) => [r * 1.05, g * 1.0, b * 0.97],
    "sony-vivid": (r, g, b) => [r * 1.08, g * 1.03, b * 0.93],
    "sony-neutral": (r, g, b) => [r * 1.01, g * 1.0, b * 0.99],
    "sony-cinema": (r, g, b) => [r * 0.95, g * 0.98, b * 1.08],
    "fuji-velvia": (r, g, b) => [r * 1.15, g * 1.08, b * 0.88],
    "fuji-provia": (r, g, b) => [r * 1.02, g * 1.04, b * 1.0],
    "fuji-classic-neg": (r, g, b) => [r * 0.9, g * 0.92, b * 0.98],
    "fuji-eterna": (r, g, b) => [r * 0.85, g * 0.88, b * 0.92],
    "fuji-acros": (r, g, b) => { const l = r * 0.299 + g * 0.587 + b * 0.114; return [l * 1.05, l * 1.05, l * 1.05]; },
    "leica-vivid": (r, g, b) => [r * 1.06, g * 1.04, b * 0.94],
    "hasselblad-natural": (r, g, b) => [r * 1.02, g * 1.01, b * 1.0],
    "arri-logc": (r, g, b) => { const log = (x: number) => Math.log(x / 0.18 + 1) * 0.3; return [log(r / 255) * 255, log(g / 255) * 255, log(b / 255) * 255]; },
    "red-log3g10": (r, g, b) => { const log = (x: number) => Math.log10(Math.max(0.001, x / 255) * 155.975494 + 1) / 3 * 255; return [log(r), log(g), log(b)]; },
    "slog3": (r, g, b) => { const slog = (x: number) => { const n = x / 255; return (n >= 0 ? (0.432699 * Math.log10(Math.max(0, n) + 0.037584) + 0.616596) : 0.030001) * 255; }; return [slog(r), slog(g), slog(b)]; },
  };

  const fn = profiles[profile];
  if (!fn) return;

  for (let i = 0; i < data.length; i += 4) {
    let [r, g, b] = fn(data[i], data[i + 1], data[i + 2]);
    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }
  ctx.putImageData(imgData, 0, 0);
}

function Section({ title, icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[hsl(220_15%_14%)] last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[hsl(220_15%_13%)] transition-all">
        <span className="text-amber-400">{icon}</span>
        <span className="text-[11px] font-bold text-white flex-1 text-left">{title}</span>
        {open ? <ChevronDown size={10} className="text-gray-600" /> : <ChevronRight size={10} className="text-gray-600" />}
      </button>
      {open && <div className="px-3 pb-3 flex flex-col gap-2">{children}</div>}
    </div>
  );
}

export default function ToneMappingPanel() {
  const { sourceImage, setSourceImage } = useEditorStore();
  const [selectedAlgo, setSelectedAlgo] = useState("none");
  const [exposureComp, setExposureComp] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState("none");
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Record<string, boolean>>({});

  const brands = Array.from(new Set(CAMERA_PROFILES.map((p) => p.brand)));

  async function applyToCanvas(id: string, fn: () => void) {
    const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    setApplying(id);
    await new Promise(r => setTimeout(r, 100));
    fn();
    setSourceImage(canvas.toDataURL("image/png"));
    setApplying(null);
    setApplied(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setApplied(prev => { const n = {...prev}; delete n[id]; return n; }), 2000);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[hsl(220_15%_14%)] bg-[hsl(222_18%_8%)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
            <Sun size={11} className="text-white" />
          </div>
          <span className="text-xs font-bold text-white">Tone Mapping & Profiles</span>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">HDR operators and camera color science profiles</p>
      </div>

      {!sourceImage && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-700/30 shrink-0">
          <div className="flex items-center gap-2"><AlertCircle size={12} className="text-amber-400 shrink-0" /><p className="text-[10px] text-amber-400">Upload an image to use tone mapping</p></div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <Section title="HDR Tone Mapping" icon={<Sun size={13} />} defaultOpen={true}>
          <div className="flex flex-col gap-1">
            {TONE_MAPPING_ALGORITHMS.map((algo) => (
              <button
                key={algo.id}
                onClick={() => setSelectedAlgo(algo.id)}
                className={`flex items-start gap-2.5 px-3 py-2 rounded-lg border transition-all text-left ${
                  selectedAlgo === algo.id ? "border-amber-500 bg-amber-900/20" : "border-[hsl(220_15%_18%)] hover:border-[hsl(220_15%_26%)]"
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${selectedAlgo === algo.id ? "bg-amber-400" : "bg-gray-700"}`} />
                <div>
                  <div className={`text-[11px] font-semibold ${selectedAlgo === algo.id ? "text-amber-300" : "text-white"}`}>{algo.name}</div>
                  <div className="text-[9px] text-gray-600">{algo.desc}</div>
                </div>
                {selectedAlgo === algo.id && <Check size={11} className="text-amber-400 ml-auto shrink-0 mt-0.5" />}
              </button>
            ))}
          </div>

          <div className="mt-2">
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-gray-400">Exposure Compensation</span>
              <span className="text-[10px] text-white font-mono">{exposureComp > 0 ? "+" : ""}{exposureComp}</span>
            </div>
            <input type="range" min={-100} max={100} value={exposureComp} onChange={(e) => setExposureComp(Number(e.target.value))} className="w-full" />
          </div>

          <button
            onClick={() => applyToCanvas("tonemap", () => {
              const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
              if (canvas && selectedAlgo !== "none") applyToneMap(canvas, selectedAlgo, exposureComp);
            })}
            disabled={!sourceImage || applying === "tonemap" || selectedAlgo === "none"}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-700/40 hover:bg-amber-700/60 border border-amber-600/30 text-[11px] font-semibold text-amber-300 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {applying === "tonemap" ? <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" /> : applied["tonemap"] ? <Check size={11} /> : <Play size={11} />}
            {applying === "tonemap" ? "Processing..." : applied["tonemap"] ? "Applied!" : "Apply Tone Map"}
          </button>
        </Section>

        <Section title="Camera Color Profiles" icon={<Camera size={13} />}>
          <p className="text-[10px] text-gray-500 mb-2">Simulate color science from real cameras</p>
          {brands.map((brand) => (
            <div key={brand} className="mb-3">
              <div className={`text-[9px] font-bold uppercase tracking-widest mb-1.5 ${BRAND_COLORS[brand] || "text-gray-500"}`}>{brand}</div>
              <div className="flex flex-col gap-1">
                {CAMERA_PROFILES.filter((p) => p.brand === brand).map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => setSelectedProfile(profile.id)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                      selectedProfile === profile.id ? "border-blue-500 bg-blue-900/20 text-blue-300" : "border-[hsl(220_15%_16%)] text-gray-400 hover:text-white hover:border-[hsl(220_15%_24%)]"
                    }`}
                  >
                    <span className="text-[11px] font-medium flex-1">{profile.name}</span>
                    {selectedProfile === profile.id && <Check size={10} className="text-blue-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={() => applyToCanvas("profile", () => {
              const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
              if (canvas) applyCameraProfile(canvas, selectedProfile);
            })}
            disabled={!sourceImage || applying === "profile" || selectedProfile === "none"}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-700/40 hover:bg-blue-700/60 border border-blue-600/30 text-[11px] font-semibold text-blue-300 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-1"
          >
            {applying === "profile" ? <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> : applied["profile"] ? <Check size={11} /> : <Camera size={11} />}
            {applying === "profile" ? "Applying..." : applied["profile"] ? "Applied!" : `Apply ${CAMERA_PROFILES.find(p => p.id === selectedProfile)?.name || "Profile"}`}
          </button>
        </Section>
      </div>
    </div>
  );
}
