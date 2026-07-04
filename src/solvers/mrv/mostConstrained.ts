import { BacktrackingSolver } from "../rowMajor/base";
import type { Tile } from "../../core";
import type { SolverEvent } from "../events";

// Most-constrained-cell-first (MRV, "fail first") — no fixed fill order.
// Each step scans the empty cells, computes every cell's legal candidates, and
// recurses into the cell with the FEWEST. Two wins over row-major:
//   - a cell with 0 candidates anywhere on the board aborts the branch
//     immediately (row-major only notices when it eventually reaches it);
//   - branching happens where the tree is narrowest, so wrong turns are cheap.
// Candidates are legal by construction, so it never emits a reject event.
export class MostConstrainedSolver extends BacktrackingSolver {
  override readonly name = "most-constrained";

  protected candidatesFor(row: number, col: number): Iterable<Tile> {
    return this.tiles.filter((t) => !this.placed[t.id] && this.model.isLegalMove(row, col, t));
  }

  override *solve(): Generator<SolverEvent, boolean, void> {
    return yield* this.search(0);
  }

  private *search(count: number): Generator<SolverEvent, boolean, void> {
    if (count === this.size * this.size) {
      return true; // every cell filled
    }

    // MRV: find the empty cell with the fewest legal candidates.
    let best: { row: number; col: number; cand: Tile[] } | null = null;
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.model.at(row, col)) continue;
        const cand = [...this.candidatesFor(row, col)];
        if (cand.length === 0) return false; // some cell is unfillable — fail the whole branch now
        if (!best || cand.length < best.cand.length) best = { row, col, cand };
      }
    }
    const { row, col, cand } = best!; // count < size² guarantees an empty cell

    yield { kind: "candidates", row, col, tiles: cand }; // GUI-only: pool highlighting
    for (const [i, tile] of cand.entries()) {
      this.stats.placements++;
      this.model.place(row, col, tile);
      this.placed[tile.id] = true;
      yield { kind: "place", row, col, tile };

      if (yield* this.search(count + 1)) {
        return true;
      }

      this.stats.backtracks++;
      this.model.remove(row, col);
      this.placed[tile.id] = false;
      yield { kind: "backtrack", row, col, tile };
      // GUI-only: re-announce the untried remainder after the deeper cell's
      // candidates overwrote the highlight set.
      yield { kind: "candidates", row, col, tiles: cand.slice(i + 1) };
    }
    return false;
  }
}
