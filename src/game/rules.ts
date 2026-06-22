import { Side } from "../core";
import type { Digit, Tile } from "../core";

// Pure edge-matching rules — no state, no grid. The single source of truth for
// "do two tiles agree on their shared seam?". Shared by the Game model
// (isLegalMove) and the solvers (candidate pruning) so the constraint is never
// written twice.

// The side of a neighbor that touches `side` of the current cell
// (e.g. my Right edge meets the neighbor's Left edge).
export function opposite(side: Side): Side {
  throw new Error("not implemented");
}

// A tile's digit on the given side.
export function edge(tile: Tile, side: Side): Digit {
  throw new Error("not implemented");
}

// Does `tile` agree with the `neighbor` sitting on its `side`?
// True iff edge(tile, side) === edge(neighbor, opposite(side)).
export function seamAgrees(tile: Tile, side: Side, neighbor: Tile): boolean {
  throw new Error("not implemented");
}
