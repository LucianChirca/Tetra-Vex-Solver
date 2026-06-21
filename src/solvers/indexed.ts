import { BacktrackingSolver } from "./base";
import type { Tile } from "../core";

// Level 2: same constraint as edge-match, via a (side,digit)->tiles map.
export class IndexedSolver extends BacktrackingSolver {
  override readonly name = "indexed";

  protected candidatesFor(_row: number, _col: number): Iterable<Tile> {
    throw new Error("not implemented");
  }
}
