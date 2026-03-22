/**
 * Liquify (mesh warp) engine
 * Implements real forward/backward mesh-based warping for liquify tools
 */

export type LiquifyTool = "push" | "pull" | "pinch" | "bloat" | "rotate" | "freeze" | "reconstruct";

export interface LiquifyMesh {
  width: number;
  height: number;
  cellSize: number;
  cols: number;
  rows: number;
  // Displacement for each mesh point [dx, dy]
  displacements: Float32Array;
}

export function createLiquifyMesh(width: number, height: number, cellSize = 32): LiquifyMesh {
  const cols = Math.ceil(width / cellSize) + 1;
  const rows = Math.ceil(height / cellSize) + 1;
  const displacements = new Float32Array(cols * rows * 2);
  return { width, height, cellSize, cols, rows, displacements };
}

function getMeshIndex(mesh: LiquifyMesh, col: number, row: number): number {
  return (row * mesh.cols + col) * 2;
}

/**
 * Apply a liquify stroke at position (cx, cy) with given radius and strength
 */
export function applyLiquifyStroke(
  mesh: LiquifyMesh,
  cx: number,
  cy: number,
  dx: number,
  dy: number,
  radius: number,
  strength: number,
  tool: LiquifyTool
): void {
  const { cellSize, cols, rows } = mesh;

  // Determine affected mesh region
  const minCol = Math.max(0, Math.floor((cx - radius) / cellSize));
  const maxCol = Math.min(cols - 1, Math.ceil((cx + radius) / cellSize));
  const minRow = Math.max(0, Math.floor((cy - radius) / cellSize));
  const maxRow = Math.min(rows - 1, Math.ceil((cy + radius) / cellSize));

  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      const px = col * cellSize;
      const py = row * cellSize;
      const distX = px - cx;
      const distY = py - cy;
      const dist = Math.sqrt(distX * distX + distY * distY);

      if (dist >= radius) continue;

      // Smooth falloff (cosine)
      const falloff = Math.pow(Math.cos((dist / radius) * (Math.PI / 2)), 2);
      const idx = getMeshIndex(mesh, col, row);

      switch (tool) {
        case "push":
        case "pull": {
          const scale = falloff * strength * (tool === "pull" ? -0.05 : 0.05);
          mesh.displacements[idx]     += dx * scale;
          mesh.displacements[idx + 1] += dy * scale;
          break;
        }
        case "pinch": {
          // Pull toward center
          const scale = falloff * strength * 0.03;
          mesh.displacements[idx]     += -distX * scale;
          mesh.displacements[idx + 1] += -distY * scale;
          break;
        }
        case "bloat": {
          // Push away from center
          const scale = falloff * strength * 0.03;
          mesh.displacements[idx]     += distX * scale;
          mesh.displacements[idx + 1] += distY * scale;
          break;
        }
        case "rotate": {
          // Rotate around center
          const scale = falloff * strength * 0.02;
          mesh.displacements[idx]     += -distY * scale;
          mesh.displacements[idx + 1] += distX * scale;
          break;
        }
        case "reconstruct": {
          // Reduce displacements (reconstruct toward original)
          const factor = 1 - falloff * strength * 0.05;
          mesh.displacements[idx]     *= factor;
          mesh.displacements[idx + 1] *= factor;
          break;
        }
        // freeze: do nothing (no displacement change)
      }
    }
  }
}

/**
 * Apply the mesh warp to an ImageData using backward mapping
 */
export function applyLiquifyMesh(
  src: ImageData,
  dst: ImageData,
  mesh: LiquifyMesh
): void {
  const { width, height, cellSize, cols } = mesh;
  const srcData = src.data;
  const dstData = dst.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Find mesh cell
      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);
      const col1 = Math.min(col + 1, cols - 1);
      const row1 = Math.min(row + 1, mesh.rows - 1);

      // Bilinear interpolation of displacement
      const tx = (x % cellSize) / cellSize;
      const ty = (y % cellSize) / cellSize;

      const i00 = getMeshIndex(mesh, col, row);
      const i10 = getMeshIndex(mesh, col1, row);
      const i01 = getMeshIndex(mesh, col, row1);
      const i11 = getMeshIndex(mesh, col1, row1);

      const disp = mesh.displacements;
      const dxInterp = (1-tx)*(1-ty)*disp[i00] + tx*(1-ty)*disp[i10] +
                       (1-tx)*ty*disp[i01] + tx*ty*disp[i11];
      const dyInterp = (1-tx)*(1-ty)*disp[i00+1] + tx*(1-ty)*disp[i10+1] +
                       (1-tx)*ty*disp[i01+1] + tx*ty*disp[i11+1];

      // Source pixel coordinates (backward mapping)
      const srcX = Math.round(x - dxInterp);
      const srcY = Math.round(y - dyInterp);

      const dstIdx = (y * width + x) * 4;

      if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
        const srcIdx = (srcY * width + srcX) * 4;
        dstData[dstIdx]     = srcData[srcIdx];
        dstData[dstIdx + 1] = srcData[srcIdx + 1];
        dstData[dstIdx + 2] = srcData[srcIdx + 2];
        dstData[dstIdx + 3] = srcData[srcIdx + 3];
      } else {
        dstData[dstIdx]     = 0;
        dstData[dstIdx + 1] = 0;
        dstData[dstIdx + 2] = 0;
        dstData[dstIdx + 3] = 0;
      }
    }
  }
}

/**
 * Reset (reconstruct) entire mesh toward neutral
 */
export function reconstructMesh(mesh: LiquifyMesh, amount: number = 0.1): void {
  for (let i = 0; i < mesh.displacements.length; i++) {
    mesh.displacements[i] *= (1 - amount);
  }
}

/**
 * Reset mesh to neutral (no warp)
 */
export function resetMesh(mesh: LiquifyMesh): void {
  mesh.displacements.fill(0);
}
