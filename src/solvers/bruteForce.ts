import { BacktrackingSolver } from "./base";
import type { Tile } from "../core";

// Level 0: no pruning — every unused tile. Baseline.
export class BruteForceSolver extends BacktrackingSolver {
  override readonly name = "brute-force";

  protected candidatesFor(_row: number, _col: number): Iterable<Tile> {
    // Return all unplaced tiles
    return this.tiles.filter((t) => !this.placed[t.id]);
  }
}
