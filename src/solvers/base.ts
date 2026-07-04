import { Game } from "../game";
import type { Puzzle, Tile } from "../core";
import type { SolverEvent, SolverStats } from "./events";

// Shared solver plumbing: private working model, tile pool, bookkeeping and
// stats. Input = Puzzle; output = a stream of domain events the GUI can
// replay. Each family (rowMajor/, mrv/, …) implements solve() as its own
// SolverEvent generator; the solver's model stays private — the view replays
// the events onto its own model.
export abstract class BacktrackingSolver {
  readonly name: string = "base";
  readonly stats: SolverStats = { placements: 0, rejections: 0, backtracks: 0 };
  // protected: the concrete strategies read these while picking candidates.
  protected readonly tiles: readonly Tile[];
  protected readonly size: number;
  protected readonly model: Game; // own private working model — never exposed
  protected readonly placed: boolean[]; // placed[tile.id]

  constructor(puzzle: Puzzle) {
    this.tiles = puzzle.tiles;
    this.size = puzzle.size;
    this.model = new Game(puzzle);
    this.placed = [];
  }

  // Yields a SolverEvent per decision; returns true once solved.
  abstract solve(): Generator<SolverEvent, boolean, void>;
}
