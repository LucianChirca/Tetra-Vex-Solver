import { BacktrackingSolver } from "../base";
import type { Tile } from "../../core";
import type { SolverEvent } from "../events";

// Shared row-major (left-to-right, top-to-bottom) backtracking recursion.
// Strategies override only candidatesFor.
export abstract class RowMajorSolver extends BacktrackingSolver {
  // The ONLY per-strategy override: which unused tiles to try at (row,col), in
  // what order. step() (the shared recursion driver below) calls into this.
  protected abstract candidatesFor(row: number, col: number): Iterable<Tile>;

  // Entry point. Same for every strategy: delegates the recursion to step(0).
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
    const candidates = [...this.candidatesFor(row, col)];
    yield { kind: "candidates", row, col, tiles: candidates }; // GUI-only: pool highlighting, no effect on the search
    for (const [i, tile] of candidates.entries()) {
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
      // GUI-only: re-announce the untried remainder — the highlight set was
      // overwritten by the deeper cell's candidates while we were down there.
      yield { kind: "candidates", row, col, tiles: candidates.slice(i + 1) };
    }

    return false; // no solution found in this branch
  }
}
