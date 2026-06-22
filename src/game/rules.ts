import { Side } from "../core";
import type { Digit, Tile } from "../core";

// Pure edge-matching rules — no state, no grid. The single source of truth for
// "do two tiles agree on their shared seam?". Shared by the Game model
// (isLegalMove) and the solvers (candidate pruning) so the constraint is never
// written twice.

const OPPOSITE: Record<Side, Side> = {
  [Side.Top]: Side.Bottom,
  [Side.Right]: Side.Left,
  [Side.Bottom]: Side.Top,
  [Side.Left]: Side.Right,
};

// The side of a neighbor that touches `side` of the current cell.
export function opposite(side: Side): Side {
  return OPPOSITE[side];
}

// A tile's digit on the given side.
export function edge(tile: Tile, side: Side): Digit {
  switch (side) {
    case Side.Top:
      return tile.top;
    case Side.Right:
      return tile.right;
    case Side.Bottom:
      return tile.bottom;
    case Side.Left:
      return tile.left;
  }
}

// Does `tile` agree with the `neighbor` sitting on its `side`?
export function seamAgrees(tile: Tile, side: Side, neighbor: Tile): boolean {
  return edge(tile, side) === edge(neighbor, opposite(side));
}
