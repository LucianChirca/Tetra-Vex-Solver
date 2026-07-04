import { Game } from "../game";
import type { Puzzle, Tile } from "../core";
import type { SolverEvent, SolverStats } from "./events";

// Shared row-major backtracking. Strategies override only candidatesFor.
// Input = Puzzle; output = a stream of domain events the GUI can replay.
export abstract class BacktrackingSolver {
  readonly name: string = "base";
  readonly stats: SolverStats = { placements: 0, rejections: 0, backtracks: 0 };
  // protected: the concrete strategies read these inside candidatesFor().
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

  // The ONLY per-strategy override: which unused tiles to try at (row,col), in
  // what order. step() (the shared recursion driver below) calls into this.
  protected abstract candidatesFor(row: number, col: number): Iterable<Tile>;

  // Entry point. Same for every strategy: delegates the recursion to step(0).
  // Yields a SolverEvent per decision; returns true once solved. The solver's
  // model stays private — the view replays the events onto its own model.
  *solve(): Generator<SolverEvent, boolean, void> {
    return yield* this.step(0);
  }

  // Recursion over cell index i (row = i / size, col = i % size): for each candidate,
  // yield place + recurse; on a dead end, yield backtrack and try the next.
  protected *step(index: number): Generator<SolverEvent, boolean, void> {
    /// Base cases
    if (index === this.size * this.size) {
      return true; // solved
    }

    // Branching - which moves to try
    const row = Math.floor(index / this.size);
    const col = index % this.size;
    const candidates = this.candidatesFor(row, col);
    for (const tile of candidates) {
      // Case 1: Candidate is wrong
      if (!this.model.isLegalMove(row, col, tile)) {
        // Skip move but show it in the GUI
        this.stats.rejections++;
        yield { kind: "reject", row, col, tile };
        continue; // next candidate
      }

      // Case 2: Candidate is correct
      this.stats.placements++;
      this.model.place(row, col, tile);
      this.placed[tile.id] = true;
      yield { kind: "place", row, col, tile }; // place tile

      if (yield* this.step(index + 1)) {
        return true; // solved down this branch - stop
      }

      this.stats.backtracks++;
      this.model.remove(row, col);
      this.placed[tile.id] = false;
      yield { kind: "backtrack", row, col, tile };
    }

    return false; // no solution found in this branch
  }
}
