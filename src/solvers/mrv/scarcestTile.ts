import { BacktrackingSolver } from "../base";
import { Side, type Puzzle, type Tile } from "../../core";
import type { SolverEvent } from "../events";
import { forcedSides } from "../rowMajor/borderFirst";

// Scarcest-tile-first — tile-driven, no fixed fill order. Each step picks the
// unplaced tile with the FEWEST possible cells and branches over those cells.
// "Possible" = empty, legal against placed neighbors, and none of the tile's
// forced-border sides (see forcedSides) pointing inward. Forced tiles have the
// scarcest homes — a {Top,Left} corner tile has exactly one — so the
// constrained tiles are placed first and the free ones fill in after.
// A tile with zero possible cells anywhere fails the branch immediately.
// Cells are pre-filtered legal, so it never emits a reject event.
export class ScarcestTileSolver extends BacktrackingSolver {
  override readonly name = "scarcest-tile";
  private readonly forced: Side[][];

  constructor(puzzle: Puzzle) {
    super(puzzle);
    this.forced = forcedSides(this.tiles);
  }

  private cellsFor(tile: Tile): [number, number][] {
    const last = this.size - 1;
    const cells: [number, number][] = [];
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const facesBorder = (s: Side) =>
          (s === Side.Top && row === 0) ||
          (s === Side.Bottom && row === last) ||
          (s === Side.Left && col === 0) ||
          (s === Side.Right && col === last);
        if (this.forced[tile.id]!.every(facesBorder) && this.model.isLegalMove(row, col, tile)) {
          cells.push([row, col]);
        }
      }
    }
    return cells;
  }

  override *solve(): Generator<SolverEvent, boolean, void> {
    return yield* this.search(0);
  }

  private *search(count: number): Generator<SolverEvent, boolean, void> {
    if (count === this.size * this.size) {
      return true; // every tile placed
    }

    // The most constrained tile: fewest possible cells right now.
    let best: { tile: Tile; cells: [number, number][] } | null = null;
    for (const tile of this.tiles) {
      if (this.placed[tile.id]) continue;
      const cells = this.cellsFor(tile);
      if (cells.length === 0) return false; // this tile has no home — fail the branch now
      if (!best || cells.length < best.cells.length) best = { tile, cells };
    }
    const { tile, cells } = best!; // count < size² guarantees an unplaced tile

    for (const [row, col] of cells) {
      yield { kind: "candidates", row, col, tiles: [tile] }; // GUI-only: ring the routed tile
      this.stats.placements++;
      this.model.place(row, col, tile);
      this.placed[tile.id] = true;
      yield { kind: "place", row, col, tile };

      if (yield* this.search(count + 1)) {
        return true;
      }

      this.stats.backtracks++;
      this.model.remove(row, col);
      this.placed[tile.id] = false;
      yield { kind: "backtrack", row, col, tile };
    }
    return false;
  }
}
