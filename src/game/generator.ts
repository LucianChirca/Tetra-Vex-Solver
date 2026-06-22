import type { Digit, Puzzle, Tile } from "../core";

const rnd = () => Math.floor(Math.random() * 10) as Digit;

// Build a guaranteed-solvable puzzle: lay out a valid n×n board where every
// shared seam already matches (each tile inherits its top/left from the
// neighbors above/left), then shuffle those tiles into the pool. The solution
// isn't stored — isSolved checks it structurally.
export function generate(n: number, _seed?: number): Puzzle {
  const grid: Omit<Tile, "id">[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const top = r === 0 ? rnd() : grid[(r - 1) * n + c]!.bottom;
      const left = c === 0 ? rnd() : grid[r * n + (c - 1)]!.right;
      grid.push({ top, left, right: rnd(), bottom: rnd() });
    }
  }
  // Fisher–Yates shuffle, then number tiles 0..n²-1 = their pool home slots.
  for (let i = grid.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = grid[i]!;
    grid[i] = grid[j]!;
    grid[j] = tmp;
  }
  const tiles: Tile[] = grid.map((t, id) => ({ id, ...t }));
  return { n, tiles };
}
