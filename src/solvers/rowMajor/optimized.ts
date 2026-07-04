import { BacktrackingSolver } from "./base";
import { Side, type Puzzle, type Tile } from "../../core";
import { forcedSides } from "./borderFirst";

// Level 4: everything at once. Row-major fill means a cell can only ever have
// two placed neighbors — above and left — so candidates come from digit-keyed
// maps in O(matches) instead of scanning the pool: byTopLeft for interior
// cells, byTop/byLeft along the first column/row, the whole pool only at
// (0,0). Every candidate matches by construction (zero reject events), and
// border-first pruning/ordering (see borderFirst.ts) is layered on top.
export class OptimizedSolver extends BacktrackingSolver {
  override readonly name = "optimized";
  private readonly byTopLeft = new Map<number, Tile[]>(); // key: top*10 + left
  private readonly byTop: Tile[][] = Array.from({ length: 10 }, () => []);
  private readonly byLeft: Tile[][] = Array.from({ length: 10 }, () => []);
  private readonly forced: Side[][];

  constructor(puzzle: Puzzle) {
    super(puzzle);
    this.forced = forcedSides(this.tiles);
    for (const t of this.tiles) {
      this.byTop[t.top]!.push(t);
      this.byLeft[t.left]!.push(t);
      const key = t.top * 10 + t.left;
      const bucket = this.byTopLeft.get(key);
      if (bucket) bucket.push(t);
      else this.byTopLeft.set(key, [t]);
    }
  }

  protected candidatesFor(row: number, col: number): Iterable<Tile> {
    const above = row > 0 ? this.model.at(row - 1, col) : null;
    const left = col > 0 ? this.model.at(row, col - 1) : null;
    const pool =
      above && left
        ? (this.byTopLeft.get(above.bottom * 10 + left.right) ?? [])
        : above
          ? this.byTop[above.bottom]!
          : left
            ? this.byLeft[left.right]!
            : this.tiles;

    const last = this.size - 1;
    const facesBorder = (s: Side) =>
      (s === Side.Top && row === 0) ||
      (s === Side.Bottom && row === last) ||
      (s === Side.Left && col === 0) ||
      (s === Side.Right && col === last);

    return pool
      .filter((t) => !this.placed[t.id] && this.forced[t.id]!.every(facesBorder))
      .sort((a, b) => this.forced[b.id]!.length - this.forced[a.id]!.length);
  }
}
