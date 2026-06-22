import type { Digit, Puzzle, Tile } from "../core";

const rnd = () => Math.floor(Math.random() * 10) as Digit;

// Lay out a valid size×size board — every shared seam matches by construction
// (each tile inherits its top/left from the neighbors above/left) — then shuffle
// the tiles into a pool. Returns the Puzzle plus the solution it was built from:
// solution[row*size + col] is the tile (carrying its pool id) that belongs in
// that cell.
export function generateWithSolution(size: number): { puzzle: Puzzle; solution: Tile[] } {
  const faces: Omit<Tile, "id">[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const top = r === 0 ? rnd() : faces[(r - 1) * size + c]!.bottom;
      const left = c === 0 ? rnd() : faces[r * size + (c - 1)]!.right;
      faces.push({ top, left, right: rnd(), bottom: rnd() });
    }
  }
  // Fisher–Yates: hand each solved cell a shuffled pool id (= its home slot).
  const ids = faces.map((_, i) => i);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  }
  const solution: Tile[] = faces.map((f, cell) => ({ id: ids[cell]!, ...f }));
  const tiles = [...solution].sort((a, b) => a.id - b.id); // pool order, by id
  return { puzzle: { size, tiles }, solution };
}

// The game only needs the Puzzle: wins are checked structurally, so the answer
// key is dropped here.
export function generate(size: number, _seed?: number): Puzzle {
  return generateWithSolution(size).puzzle;
}
