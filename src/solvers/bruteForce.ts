import { BacktrackingSolver } from "./base";
import type { Tile } from "../core";

// Level 0: no pruning — every unused tile. Baseline.
export class BruteForceSolver extends BacktrackingSolver {
  override readonly name = "brute-force";

  protected candidatesFor(row: number, col: number): Iterable<Tile> {
    throw new Error("not implemented");
  }
}
