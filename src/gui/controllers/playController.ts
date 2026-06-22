import type { Game } from "../../game";
import type { Tile } from "../../core";

// Drives the play interactions on top of the model. Pure logic, no DOM and no
// drag mechanism — the view calls these by tile id + target, so it's testable
// on its own and independent of how dragging is wired.
//
// Pool layout is fixed: a tile's home slot is its id (generate() numbers tiles
// 0..size²-1 in pool order). A tile is either in its home slot or on a board cell;
// returning to the pool always lands in that same slot.
export class PlayController {
  private readonly byId = new Map<number, Tile>();

  constructor(private readonly model: Game) {
    for (const t of model.pool()) this.byId.set(t.id, t);
  }

  get size(): number {
    return this.model.size;
  }

  tile(id: number): Tile | null {
    return this.byId.get(id) ?? null;
  }

  private rc(index: number): [number, number] {
    return [Math.floor(index / this.model.size), index % this.model.size];
  }

  // Board cells, row-major. null = empty.
  boardCells(): (Tile | null)[] {
    const size = this.model.size;
    return Array.from({ length: size * size }, (_, i) => this.model.at(...this.rc(i)));
  }

  // Pool slots, indexed by home slot (= tile id). null = that tile is on the board.
  poolSlots(): (Tile | null)[] {
    const slots: (Tile | null)[] = Array.from({ length: this.byId.size }, () => null);
    for (const tile of this.model.pool()) slots[tile.id] = tile;
    return slots;
  }

  private boardIndexOf(tileId: number): number {
    return this.boardCells().findIndex((t) => t?.id === tileId);
  }

  // Drop a tile (from pool or another cell) onto a board cell. Placement is
  // strict: a move only commits if every affected tile still matches its
  // neighbors. If the target is occupied, a board→board drop attempts a swap and
  // a pool→cell drop sends the occupant home — but if the result wouldn't match,
  // the whole move is rejected and the board is left untouched. Returns success.
  placeOnCell(tileId: number, cellIndex: number): boolean {
    const tile = this.byId.get(tileId);
    if (!tile) return false;
    const from = this.boardIndexOf(tileId);
    if (from === cellIndex) return true; // dropped on its own cell — no-op
    const occupant = this.boardCells()[cellIndex] ?? null;
    const target = this.rc(cellIndex);
    const source = from === -1 ? null : this.rc(from);

    // Lift both tiles off the board (restoring them is always legal — the board
    // was valid and we only removed constraints).
    if (source) this.model.remove(...source);
    if (occupant) this.model.remove(...target);
    const putBack = () => {
      if (source) this.model.place(...source, tile);
      if (occupant) this.model.place(...target, occupant);
    };

    if (!this.model.isLegalMove(...target, tile)) {
      putBack();
      return false;
    }
    this.model.place(...target, tile);

    if (occupant && source) {
      // Swap: the occupant must also fit the cell the dragged tile vacated.
      if (!this.model.isLegalMove(...source, occupant)) {
        this.model.remove(...target);
        putBack();
        return false;
      }
      this.model.place(...source, occupant);
    }
    return true;
  }

  // Move every placed tile back to the pool (each to its own home slot).
  reset(): void {
    const size = this.model.size;
    for (let i = 0; i < size * size; i++) {
      if (this.model.at(...this.rc(i))) this.model.remove(...this.rc(i));
    }
  }

  // Return a tile to the pool (drag back, or dropped outside). Its home slot is
  // fixed, so no position to choose. No-op if it's already in the pool.
  returnToPool(tileId: number): void {
    const from = this.boardIndexOf(tileId);
    if (from !== -1) this.model.remove(...this.rc(from));
  }

  isSolved(): boolean {
    return this.model.isSolved();
  }
}
