import { Board } from "../core";
import type { Tile } from "../core";
import type { SolverEvent } from "./events";

// Shared row-major backtracking. Strategies override only candidatesFor.
export abstract class BacktrackingSolver {
  readonly name: string = "base";
  protected readonly tiles: readonly Tile[];
  protected readonly n: number;
  protected readonly board: Board;
  protected readonly placed: boolean[]; // placed[tile.id]

  constructor(tiles: readonly Tile[], n: number) {
    this.tiles = tiles;
    this.n = n;
    this.board = new Board(n);
    this.placed = [];
  }

  // The pruning hook: which unused tiles to try at (row,col), in what order.
  protected abstract candidatesFor(row: number, col: number): Iterable<Tile>;

  // Same traversal for every strategy. Yields a step per decision; pull to step.
  *solve(): Generator<SolverEvent, Board | null> {
    throw new Error("not implemented");
  }
}
