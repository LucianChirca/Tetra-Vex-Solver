import { Side } from "../core";
import type { Puzzle, Tile } from "../core";
import { seamAgrees } from "./rules";

// The MODEL: holds game state (grid + remaining pool) and the rules.
// The only thing that mutates state. Views call this; they never reason about rules.
export class Game {
  readonly size: number; // side length: an n×n board has size n
  private readonly grid: (Tile | null)[]; // row-major, length size*size
  private readonly remaining: Tile[]; // tiles not yet placed (the pool)

  // Takes a solution-free Puzzle: the model never needs the answer key, and the
  // solver builds its own Game from a Puzzle — so it can't peek at the solution.
  constructor(puzzle: Puzzle) {
    this.size = puzzle.size;
    this.grid = new Array(puzzle.size * puzzle.size).fill(null);
    this.remaining = [...puzzle.tiles];
  }

  at(row: number, col: number): Tile | null {
    return this.grid[row * this.size + col] ?? null;
  }

  pool(): readonly Tile[] {
    return this.remaining;
  }

  // In bounds, empty, and matching every present neighbor — you can only place
  // a tile where its edges agree (seamAgrees, from ./rules). `side` is the
  // direction from this cell to the neighbor.
  isLegalMove(row: number, col: number, tile: Tile): boolean {
    if (row < 0 || col < 0 || row >= this.size || col >= this.size) return false;
    if (this.at(row, col) !== null) return false;
    const neighbors: [Side, number, number][] = [
      [Side.Top, row - 1, col],
      [Side.Right, row, col + 1],
      [Side.Bottom, row + 1, col],
      [Side.Left, row, col - 1],
    ];
    for (const [side, nr, nc] of neighbors) {
      const nb = nr < 0 || nc < 0 || nr >= this.size || nc >= this.size ? null : this.at(nr, nc);
      if (nb && !seamAgrees(tile, side, nb)) return false;
    }
    return true;
  }

  place(row: number, col: number, tile: Tile): void {
    if (!this.isLegalMove(row, col, tile)) throw new Error("illegal move");
    const i = this.remaining.findIndex((t) => t.id === tile.id);
    if (i === -1) throw new Error("tile not in pool");
    this.remaining.splice(i, 1);
    this.grid[row * this.size + col] = tile;
  }

  remove(row: number, col: number): void {
    const tile = this.at(row, col);
    if (!tile) return;
    this.grid[row * this.size + col] = null;
    this.remaining.push(tile);
  }

  // Structural check: grid full + every seam agrees. No answer-key compare —
  // a valid TetraVex layout is correct by construction.
  isSolved(): boolean {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const tile = this.at(row, col);
        if (!tile) return false;
        const right = col + 1 < this.size ? this.at(row, col + 1) : null;
        if (right && !seamAgrees(tile, Side.Right, right)) return false;
        const below = row + 1 < this.size ? this.at(row + 1, col) : null;
        if (below && !seamAgrees(tile, Side.Bottom, below)) return false;
      }
    }
    return true;
  }
}
