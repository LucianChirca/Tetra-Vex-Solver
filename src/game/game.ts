import { Side } from "../core";
import type { Puzzle, Tile } from "../core";
import { seamAgrees } from "./rules";

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
    return this.grid[row * this.n + col] ?? null;
  }

  pool(): readonly Tile[] {
    return this.remaining;
  }

  // Free placement: TetraVex lets you drop a tile in any empty cell. Edge
  // matching is the *win* condition (see isSolved), not a placement rule — the
  // solver enforces matching itself via its candidate pruning.
  isLegalMove(row: number, col: number, _tile: Tile): boolean {
    if (row < 0 || col < 0 || row >= this.n || col >= this.n) return false;
    return this.at(row, col) === null;
  }

  place(row: number, col: number, tile: Tile): void {
    if (!this.isLegalMove(row, col, tile)) throw new Error("illegal move");
    const i = this.remaining.findIndex((t) => t.id === tile.id);
    if (i === -1) throw new Error("tile not in pool");
    this.remaining.splice(i, 1);
    this.grid[row * this.n + col] = tile;
  }

  remove(row: number, col: number): void {
    const tile = this.at(row, col);
    if (!tile) return;
    this.grid[row * this.n + col] = null;
    this.remaining.push(tile);
  }

  // Structural check: grid full + every seam agrees. No answer-key compare —
  // a valid TetraVex layout is correct by construction.
  isSolved(): boolean {
    for (let row = 0; row < this.n; row++) {
      for (let col = 0; col < this.n; col++) {
        const tile = this.at(row, col);
        if (!tile) return false;
        const right = col + 1 < this.n ? this.at(row, col + 1) : null;
        if (right && !seamAgrees(tile, Side.Right, right)) return false;
        const below = row + 1 < this.n ? this.at(row + 1, col) : null;
        if (below && !seamAgrees(tile, Side.Bottom, below)) return false;
      }
    }
    return true;
  }
}
