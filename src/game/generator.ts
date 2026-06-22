import type { Digit, Puzzle, Tile } from "../core";

const rndDigit = () => Math.floor(Math.random() * 10) as Digit;

// ponytail: display-only random tiles, NOT a solvable puzzle yet. The real
// generator (build a valid board, then shuffle the pool) is a roadmap item;
// this just fills the pool so the UI has something to render.
export function generate(n: number, _seed?: number): Puzzle {
  const tiles: Tile[] = Array.from({ length: n * n }, (_, id) => ({
    id,
    top: rndDigit(),
    right: rndDigit(),
    bottom: rndDigit(),
    left: rndDigit(),
  }));
  return { n, tiles };
}
