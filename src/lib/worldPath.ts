// Tap-to-walk path finding for the Neighborhood map.
// The map is a small grid (1% steps); a breadth-first search finds a way
// around buildings, so a child can tap a door instead of holding arrows.

export type Pt = { x: number; y: number };

const STEP = 0.01;
const N = Math.round(1 / STEP) + 1;
const at = (c: number, r: number): Pt => ({ x: c * STEP, y: r * STEP });

function nearestFree(p: Pt, blocked: (x: number, y: number) => boolean): [number, number] | null {
  const c0 = Math.round(p.x / STEP);
  const r0 = Math.round(p.y / STEP);
  for (let radius = 0; radius <= 25; radius++) {
    let best: [number, number] | null = null;
    let bestD = Infinity;
    for (let dc = -radius; dc <= radius; dc++) {
      for (let dr = -radius; dr <= radius; dr++) {
        if (Math.max(Math.abs(dc), Math.abs(dr)) !== radius) continue;
        const c = c0 + dc;
        const r = r0 + dr;
        if (c < 0 || r < 0 || c >= N || r >= N) continue;
        const q = at(c, r);
        if (blocked(q.x, q.y)) continue;
        const d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
        if (d < bestD) {
          bestD = d;
          best = [c, r];
        }
      }
    }
    if (best) return best;
  }
  return null;
}

/** Waypoints from `from` to the walkable spot nearest `to`; empty when there is no way. */
export function findPath(from: Pt, to: Pt, blocked: (x: number, y: number) => boolean): Pt[] {
  const start = nearestFree(from, blocked);
  const goal = nearestFree(to, blocked);
  if (!start || !goal) return [];
  const key = (c: number, r: number) => r * N + c;
  const goalKey = key(goal[0], goal[1]);
  const parent = new Int32Array(N * N).fill(-2);
  const queue: number[] = [key(start[0], start[1])];
  parent[queue[0]!] = -1;
  const free = (c: number, r: number) =>
    c >= 0 && r >= 0 && c < N && r < N && !blocked(c * STEP, r * STEP);
  for (let head = 0; head < queue.length; head++) {
    const k = queue[head]!;
    if (k === goalKey) break;
    const c = k % N;
    const r = (k - c) / N;
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (!dc && !dr) continue;
        const nc = c + dc;
        const nr = r + dr;
        if (!free(nc, nr)) continue;
        // No cutting corners between two blocked cells.
        if (dc && dr && (!free(c + dc, r) || !free(c, r + dr))) continue;
        const nk = key(nc, nr);
        if (parent[nk] !== -2) continue;
        parent[nk] = k;
        queue.push(nk);
      }
    }
  }
  if (parent[goalKey] === -2) return [];
  const cells: Pt[] = [];
  for (let k = goalKey; k !== -1; k = parent[k]!) {
    const c = k % N;
    cells.push(at(c, (k - c) / N));
  }
  cells.reverse();
  // Keep only the corners, so the walk is a few straight legs.
  const out: Pt[] = [];
  for (let i = 1; i < cells.length; i++) {
    const a = cells[i - 1]!;
    const b = cells[i]!;
    const n = cells[i + 1];
    const turn = !n || Math.abs((b.x - a.x) * (n.y - b.y) - (b.y - a.y) * (n.x - b.x)) > 1e-9;
    if (turn) out.push(b);
  }
  if (out.length && !blocked(to.x, to.y)) out[out.length - 1] = to;
  return out;
}
