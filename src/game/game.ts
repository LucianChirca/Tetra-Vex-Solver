import type { Puzzle, Tile } from "../core";

// The MODEL: holds game state (grid + remaining pool) and the rules.
// The only thing that mutates state. Views call this; they never reason about rules.
export class Game {
  readonly n: number;
  private readonly grid: (Tile | null)[]; // row-major, length n*n
  private readonly remaining: Tile[]; // tiles not yet placed (the pool)
  private readonly solution: readonly Tile[]; // for win-checking; never shown to a solver

  constructor(puzzle: Puzzle) {
    this.n = puzzle.n;
    this.grid = new Array(puzzle.n * puzzle.n).fill(null);
    this.remaining = [...puzzle.tiles];
    this.solution = puzzle.solution;
  }

  at(row: number, col: number): Tile | null {
    throw new Error("not implemented");
  }

  pool(): readonly Tile[] {
    throw new Error("not implemented");
  }

  // Is placing this tile here allowed? (in bounds, empty, edges match neighbors)
  isLegalMove(row: number, col: number, tile: Tile): boolean {
    throw new Error("not implemented");
  }

  place(row: number, col: number, tile: Tile): void {
    throw new Error("not implemented");
  }

  remove(row: number, col: number): void {
    throw new Error("not implemented");
  }

  isSolved(): boolean {
    throw new Error("not implemented");
  }
}
