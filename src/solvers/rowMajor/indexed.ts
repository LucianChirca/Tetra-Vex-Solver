import { BacktrackingSolver } from "./base";
import type { Tile } from "../../core";

// Level 2: same constraint as edge-match, via a (side,digit)->tiles map.
// Built from edge()/opposite() in game/rules — the shared edge rule.
export class IndexedSolver extends BacktrackingSolver {
  override readonly name = "indexed";

  protected candidatesFor(row: number, col: number): Iterable<Tile> {
    throw new Error("not implemented");
  }
}
