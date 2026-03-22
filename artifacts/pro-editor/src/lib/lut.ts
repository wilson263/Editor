/**
 * LUT (Look-Up-Table) Engine for professional cinematic color grading
 * Supports 3D LUTs, 1D LUTs, and built-in cinematic presets
 */

export interface LUTPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  intensity: number;
  data: (r: number, g: number, b: number) => [number, number, number];
}

function clamp(v: number) { return Math.max(0, Math.min(255, Math.round(v))); }
function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }

// Tone curve helper
function applyCurve(v: number, points: [number, number][]): number {
  const x = v / 255;
  for (let i = 1; i < points.length; i++) {
    if (x <= points[i][0]) {
      const t = (x - points[i-1][0]) / (points[i][0] - points[i-1][0]);
      return (points[i-1][1] + t * (points[i][1] - points[i-1][1])) * 255;
    }
  }
  return v;
}

// Linear interpolation
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    case b: h = ((r - g) / d + 4) / 6; break;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  function hue2rgb(p: number, q: number, t: number) {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255),
  ];
}

export const LUT_PRESETS: LUTPreset[] = [
  {
    id: "fuji-eterna",
    name: "Fuji Eterna 250D",
    category: "Film",
    description: "Classic Fujifilm cinema stock — cool shadows, warm highlights",
    intensity: 100,
    data: (r, g, b) => {
      const [h, s, l] = rgbToHsl(r, g, b);
      // Lift shadows (cinematic base lift)
      const newL = l < 0.3 ? l * 0.85 + 0.04 : l > 0.7 ? l * 0.95 + 0.03 : l;
      // Desaturate slightly
      const newS = s * 0.88;
      // Push cool hue in shadows
      let newH = h;
      if (l < 0.4) newH = (h + 0.55) % 1;
      else if (l > 0.6) newH = (h + 0.03) % 1;
      const [nr, ng, nb] = hslToRgb(newH, newS, newL);
      return [
        clamp(nr + (l < 0.5 ? -8 : 5)),
        clamp(ng + (l < 0.5 ? 2 : 3)),
        clamp(nb + (l < 0.5 ? 12 : -4)),
      ];
    },
  },
  {
    id: "kodak-vision3",
    name: "Kodak Vision3 500T",
    category: "Film",
    description: "Warm tungsten daylight stock with rich midtones",
    intensity: 100,
    data: (r, g, b) => {
      const rn = applyCurve(r, [[0,0],[0.1,0.09],[0.5,0.52],[0.9,0.91],[1,1]]);
      const gn = applyCurve(g, [[0,0.01],[0.3,0.3],[0.7,0.71],[1,0.99]]);
      const bn = applyCurve(b, [[0,0.02],[0.4,0.38],[0.8,0.76],[1,0.95]]);
      return [clamp(rn * 1.04), clamp(gn), clamp(bn * 0.93)];
    },
  },
  {
    id: "teal-orange",
    name: "Teal & Orange",
    category: "Cinematic",
    description: "Hollywood blockbuster complementary split-tone",
    intensity: 100,
    data: (r, g, b) => {
      const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      // Push shadows teal, highlights orange
      const shadowTeal = Math.pow(1 - lum, 2);
      const highlightOrange = Math.pow(lum, 2);
      return [
        clamp(r - shadowTeal * 20 + highlightOrange * 30),
        clamp(g - shadowTeal * 8 + highlightOrange * 5),
        clamp(b + shadowTeal * 35 - highlightOrange * 25),
      ];
    },
  },
  {
    id: "matte-fade",
    name: "Cinematic Matte",
    category: "Cinematic",
    description: "Faded matte look with lifted blacks — indie film aesthetic",
    intensity: 100,
    data: (r, g, b) => {
      return [
        clamp(r * 0.88 + 20),
        clamp(g * 0.86 + 22),
        clamp(b * 0.84 + 28),
      ];
    },
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    category: "Cinematic",
    description: "Warm amber sunset glow across the tonal range",
    intensity: 100,
    data: (r, g, b) => {
      const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      const warmth = lum * 0.7 + 0.3;
      return [
        clamp(r * (1 + 0.15 * warmth)),
        clamp(g * (1 + 0.05 * warmth)),
        clamp(b * (1 - 0.2 * warmth)),
      ];
    },
  },
  {
    id: "bleach-bypass",
    name: "Bleach Bypass",
    category: "Cinematic",
    description: "High contrast desaturated look — classic silver retention",
    intensity: 100,
    data: (r, g, b) => {
      const lum = r * 0.299 + g * 0.587 + b * 0.114;
      const blend = 0.65;
      return [
        clamp(r * (1 - blend) + lum * blend),
        clamp(g * (1 - blend) + lum * blend),
        clamp(b * (1 - blend) + lum * blend),
      ].map((v, i) => {
        const src = [r, g, b][i];
        return clamp(src * 0.15 + v * 1.1); // boost contrast
      }) as [number, number, number];
    },
  },
  {
    id: "moody-blue",
    name: "Moody Blue",
    category: "Cinematic",
    description: "Cold desaturated shadows with deep blue cast",
    intensity: 100,
    data: (r, g, b) => {
      const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      return [
        clamp(r * 0.85 - lum * 10),
        clamp(g * 0.88 - lum * 5),
        clamp(b * 1.15 + lum * 15),
      ];
    },
  },
  {
    id: "vibrant-pop",
    name: "Vibrant Pop",
    category: "Creative",
    description: "Punchy colors, crisp shadows — social media ready",
    intensity: 100,
    data: (r, g, b) => {
      const [h, s, l] = rgbToHsl(r, g, b);
      const newS = Math.min(1, s * 1.35);
      const newL = l < 0.5 ? l * 0.92 : l * 1.05;
      const [nr, ng, nb] = hslToRgb(h, newS, clamp01(newL));
      return [clamp(nr), clamp(ng), clamp(nb)];
    },
  },
  {
    id: "cross-process",
    name: "Cross Process",
    category: "Creative",
    description: "Slide film developed in C-41 — dramatic color shifts",
    intensity: 100,
    data: (r, g, b) => {
      return [
        clamp(applyCurve(r, [[0,0.05],[0.5,0.6],[1,1]])),
        clamp(applyCurve(g, [[0,0],[0.4,0.35],[0.8,0.85],[1,0.9]])),
        clamp(applyCurve(b, [[0,0.1],[0.3,0.2],[0.7,0.8],[1,0.95]])),
      ];
    },
  },
  {
    id: "duotone-purple-gold",
    name: "Duotone Purple/Gold",
    category: "Creative",
    description: "Artistic two-tone from deep purple shadows to gold highlights",
    intensity: 100,
    data: (r, g, b) => {
      const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      // Shadow: purple (100, 0, 180) | Highlight: gold (255, 220, 50)
      return [
        clamp(lerp(100, 255, lum)),
        clamp(lerp(0, 220, lum)),
        clamp(lerp(180, 50, lum)),
      ];
    },
  },
  {
    id: "noir-silver",
    name: "Noir Silver",
    category: "Black & White",
    description: "Luminous silver-gelatin black & white with deep contrast",
    intensity: 100,
    data: (r, g, b) => {
      // Panchromatic film response (more sensitive to red)
      const lum = r * 0.42 + g * 0.52 + b * 0.06;
      const contrasted = applyCurve(lum, [[0,0],[0.2,0.12],[0.5,0.5],[0.8,0.88],[1,1]]);
      const v = clamp(contrasted);
      return [v, v, v];
    },
  },
  {
    id: "infrared",
    name: "Infrared",
    category: "Black & White",
    description: "Simulated infrared — glowing foliage, dark skies",
    intensity: 100,
    data: (r, g, b) => {
      // Infrared: high green channel weight, inverted blue
      const lum = r * 0.18 + g * 0.71 + b * 0.11;
      const blown = Math.min(255, lum * 1.4 + 20);
      const v = clamp(blown);
      return [v, v, v];
    },
  },
  {
    id: "hdr-natural",
    name: "HDR Natural",
    category: "Tone Mapping",
    description: "Natural-looking HDR with local contrast enhancement",
    intensity: 100,
    data: (r, g, b) => {
      const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      // Tone mapping: compress highlights, lift shadows
      const tonemapped = lum / (lum + 0.5);
      const ratio = lum > 0 ? tonemapped / lum : 1;
      return [
        clamp(r * ratio * 1.05),
        clamp(g * ratio),
        clamp(b * ratio * 0.98),
      ];
    },
  },
  {
    id: "hdr-cinematic",
    name: "HDR Cinematic",
    category: "Tone Mapping",
    description: "Dramatic HDR with cinematic tone curve",
    intensity: 100,
    data: (r, g, b) => {
      // Reinhard extended tone map
      const tonemapCh = (v: number) => {
        const x = v / 255;
        const W = 1.0;
        const mapped = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
        return clamp(clamp01(mapped / W) * 255);
      };
      return [tonemapCh(r), tonemapCh(g), tonemapCh(b)];
    },
  },
];

/**
 * Apply a LUT preset to an ImageData with adjustable intensity
 */
export function applyLUT(
  imageData: ImageData,
  preset: LUTPreset,
  intensity: number = 100
): void {
  const data = imageData.data;
  const alpha = intensity / 100;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    const [nr, ng, nb] = preset.data(r, g, b);
    data[i]   = Math.round(r + (nr - r) * alpha);
    data[i+1] = Math.round(g + (ng - g) * alpha);
    data[i+2] = Math.round(b + (nb - b) * alpha);
  }
}

/**
 * Parse a .cube LUT file into a lookup function
 * Returns a function that maps (r,g,b) -> (r,g,b)
 */
export function parseCubeLUT(cubeText: string): ((r: number, g: number, b: number) => [number, number, number]) | null {
  try {
    const lines = cubeText.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    let size = 0;
    const table: number[] = [];

    for (const line of lines) {
      if (line.startsWith('LUT_3D_SIZE')) {
        size = parseInt(line.split(/\s+/)[1]);
      } else {
        const parts = line.split(/\s+/).map(Number);
        if (parts.length === 3 && !isNaN(parts[0])) {
          table.push(...parts);
        }
      }
    }

    if (!size || table.length !== size * size * size * 3) return null;

    return (r: number, g: number, b: number): [number, number, number] => {
      const ri = clamp01(r / 255) * (size - 1);
      const gi = clamp01(g / 255) * (size - 1);
      const bi = clamp01(b / 255) * (size - 1);

      const r0 = Math.floor(ri), r1 = Math.min(r0 + 1, size - 1);
      const g0 = Math.floor(gi), g1 = Math.min(g0 + 1, size - 1);
      const b0 = Math.floor(bi), b1 = Math.min(b0 + 1, size - 1);

      const rt = ri - r0, gt = gi - g0, bt = bi - b0;

      function sample(rr: number, gg: number, bb: number) {
        const idx = (bb * size * size + gg * size + rr) * 3;
        return [table[idx], table[idx+1], table[idx+2]];
      }

      // Trilinear interpolation
      const c000 = sample(r0,g0,b0), c100 = sample(r1,g0,b0);
      const c010 = sample(r0,g1,b0), c110 = sample(r1,g1,b0);
      const c001 = sample(r0,g0,b1), c101 = sample(r1,g0,b1);
      const c011 = sample(r0,g1,b1), c111 = sample(r1,g1,b1);

      const out: [number, number, number] = [0, 0, 0];
      for (let ch = 0; ch < 3; ch++) {
        out[ch] = clamp(
          lerp(lerp(lerp(c000[ch], c100[ch], rt), lerp(c010[ch], c110[ch], rt), gt),
               lerp(lerp(c001[ch], c101[ch], rt), lerp(c011[ch], c111[ch], rt), gt), bt) * 255
        );
      }
      return out;
    };
  } catch {
    return null;
  }
}
