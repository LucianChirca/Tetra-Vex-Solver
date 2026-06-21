import { BacktrackingSolver } from "./base";
import type { Tile } from "../core";

// Level 1: only tiles whose top/left match the neighbors (linear scan).
export class EdgeMatchSolver extends BacktrackingSolver {
  override readonly name = "edge-match";

  protected candidatesFor(_row: number, _col: number): Iterable<Tile> {
    throw new Error("not implemented");
  }
}
