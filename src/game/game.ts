import type { Puzzle, Tile } from "../core";

// The MODEL: holds game state (grid + remaining pool) and the rules.
// The only thing that mutates state. Views call this; they never reason about rules.
export class Game {
  readonly n: number;

  constructor(puzzle: Puzzle) {
    this.n = puzzle.n;
  }

  at(_row: number, _col: number): Tile | null {
    throw new Error("not implemented");
  }

  pool(): readonly Tile[] {
    throw new Error("not implemented");
  }

  // Is placing this tile here allowed? (in bounds, empty, edges match neighbors)
  isLegalMove(_row: number, _col: number, _tile: Tile): boolean {
    throw new Error("not implemented");
  }

  place(_row: number, _col: number, _tile: Tile): void {}

  remove(_row: number, _col: number): void {}

  isSolved(): boolean {
    throw new Error("not implemented");
  }
}
