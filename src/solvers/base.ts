import { Game } from "../game";
import type { Puzzle, Tile } from "../core";
import type { SolverEvent } from "./events";

// Shared row-major backtracking. Strategies override only candidatesFor.
// Input = Puzzle; output = a stream of domain events the GUI can replay.
export abstract class BacktrackingSolver {
  readonly name: string = "base";
  protected readonly tiles: readonly Tile[];
  protected readonly n: number;
  protected readonly model: Game; // own working model
  protected readonly placed: boolean[]; // placed[tile.id]

  constructor(puzzle: Puzzle) {
    this.tiles = puzzle.tiles;
    this.n = puzzle.n;
    this.model = new Game(puzzle);
    this.placed = [];
  }

  // The pruning hook: which unused tiles to try at (row,col), in what order.
  protected abstract candidatesFor(row: number, col: number): Iterable<Tile>;

  // Same traversal for every strategy. Yields a step per decision; pull to step.
  *solve(): Generator<SolverEvent, Game | null> {
    throw new Error("not implemented");
  }
}
