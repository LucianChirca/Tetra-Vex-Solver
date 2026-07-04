import { BacktrackingSolver } from "./base";
import { Side, type Puzzle, type Tile } from "../../core";
import { edge, opposite } from "../../game";

// Level 3: unpaired-edge analysis. A side whose digit has no counterpart on any
// other tile's opposite side can never get a neighbor — it MUST face the board
// border. Tiles with such sides are pruned from cells where the side would face
// inward, and tried first where it faces the border (they're the scarcest fit).
export class BorderFirstSolver extends BacktrackingSolver {
  override readonly name = "border-first";
  // forced[tile.id] = sides that must face the board border.
  private readonly forced: Side[][];

  constructor(puzzle: Puzzle) {
    super(puzzle);
    this.forced = this.tiles.map((t) =>
      [Side.Top, Side.Right, Side.Bottom, Side.Left].filter(
        (s) => !this.tiles.some((o) => o.id !== t.id && edge(o, opposite(s)) === edge(t, s)),
      ),
    );
  }

  protected candidatesFor(row: number, col: number): Iterable<Tile> {
    const last = this.size - 1;
    const facesBorder = (s: Side) =>
      (s === Side.Top && row === 0) ||
      (s === Side.Bottom && row === last) ||
      (s === Side.Left && col === 0) ||
      (s === Side.Right && col === last);

    return this.tiles
      .filter(
        (t) =>
          !this.placed[t.id] &&
          this.model.isLegalMove(row, col, t) &&
          this.forced[t.id]!.every(facesBorder), // never point a dead edge inward
      )
      .sort((a, b) => this.forced[b.id]!.length - this.forced[a.id]!.length);
  }
}
