import type { Puzzle, Tile } from "../core";

// The MODEL: holds game state (grid + remaining pool) and the rules.
// The only thing that mutates state. Views call this; they never reason about rules.
export class Game {
  readonly n: number;
  private readonly grid: (Tile | null)[]; // row-major, length n*n
  private readonly remaining: Tile[]; // tiles not yet placed (the pool)

  // Takes a solution-free Puzzle: the model never needs the answer key, and the
  // solver builds its own Game from a Puzzle — so it can't peek at the solution.
  constructor(puzzle: Puzzle) {
    this.n = puzzle.n;
    this.grid = new Array(puzzle.n * puzzle.n).fill(null);
    this.remaining = [...puzzle.tiles];
  }

  at(row: number, col: number): Tile | null {
    throw new Error("not implemented");
  }

  pool(): readonly Tile[] {
    throw new Error("not implemented");
  }

  // Is placing this tile here allowed? In bounds, empty, and for each present
  // neighbor `seamAgrees(...)` (from ./rules — same check the solvers use).
  isLegalMove(row: number, col: number, tile: Tile): boolean {
    throw new Error("not implemented");
  }

  place(row: number, col: number, tile: Tile): void {
    throw new Error("not implemented");
  }

  remove(row: number, col: number): void {
    throw new Error("not implemented");
  }

  // Structural check: grid full + every seam agrees. No answer-key compare —
  // a valid TetraVex layout is correct by construction.
  isSolved(): boolean {
    throw new Error("not implemented");
  }
}
