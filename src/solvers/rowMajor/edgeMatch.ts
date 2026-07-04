import { BacktrackingSolver } from "./base";
import type { Tile } from "../../core";

// Level 1: only tiles whose top/left match the neighbors (linear scan).
// Uses seamAgrees() from game/rules — same edge rule the model enforces.
export class EdgeMatchSolver extends BacktrackingSolver {
  override readonly name = "edge-match";

  protected candidatesFor(row: number, col: number): Iterable<Tile> {
    return this.tiles.filter((t) => !this.placed[t.id] && this.model.isLegalMove(row, col, t));
  }
}
