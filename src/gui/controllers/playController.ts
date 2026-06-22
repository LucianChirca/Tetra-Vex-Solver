import type { Game } from "../../game";
import type { Tile } from "../../core";

// Drives the play interactions on top of the model. Pure logic, no DOM and no
// drag mechanism — the view calls these by tile id + target, so it's testable
// on its own and independent of how dragging is wired.
//
// Pool layout is fixed: a tile's home slot is its id (generate() numbers tiles
// 0..n²-1 in pool order). A tile is either in its home slot or on a board cell;
// returning to the pool always lands in that same slot.
export class PlayController {
  private readonly lastBoardCell = new Map<number, number>(); // tileId -> last cell index
  private readonly byId = new Map<number, Tile>();

  constructor(private readonly model: Game) {
    for (const t of model.pool()) this.byId.set(t.id, t);
  }

  get n(): number {
    return this.model.n;
  }

  tile(id: number): Tile | null {
    return this.byId.get(id) ?? null;
  }

  private rc(index: number): [number, number] {
    return [Math.floor(index / this.model.n), index % this.model.n];
  }

  // Board cells, row-major. null = empty.
  boardCells(): (Tile | null)[] {
    const n = this.model.n;
    return Array.from({ length: n * n }, (_, i) => this.model.at(...this.rc(i)));
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

  // Drop a tile (from pool or another cell) onto a board cell. If the target is
  // occupied: a board→board drop swaps the two tiles; a pool→cell drop sends the
  // occupant back to its pool home. Returns success.
  placeOnCell(tileId: number, cellIndex: number): boolean {
    const tile = this.byId.get(tileId);
    if (!tile) return false;
    const from = this.boardIndexOf(tileId);
    if (from === cellIndex) return true; // dropped on its own cell — no-op

    const occupant = this.boardCells()[cellIndex];
    if (from !== -1) this.model.remove(...this.rc(from)); // lift dragged tile off the board
    if (occupant) {
      this.model.remove(...this.rc(cellIndex)); // occupant → pool
      if (from !== -1) {
        this.model.place(...this.rc(from), occupant); // swap into the vacated cell
        this.lastBoardCell.set(occupant.id, from);
      }
    }
    this.model.place(...this.rc(cellIndex), tile);
    this.lastBoardCell.set(tileId, cellIndex);
    return true;
  }

  // Return a tile to the pool (drag back, or dropped outside). Its home slot is
  // fixed, so no position to choose. No-op if it's already in the pool.
  returnToPool(tileId: number): void {
    const from = this.boardIndexOf(tileId);
    if (from !== -1) this.model.remove(...this.rc(from));
  }

  // Double-click a pooled tile: send it back to the cell it last occupied, if
  // that cell is free. Returns whether it moved.
  recallToBoard(tileId: number): boolean {
    if (this.boardIndexOf(tileId) !== -1) return false; // already placed
    const last = this.lastBoardCell.get(tileId);
    if (last == null || this.boardCells()[last] != null) return false;
    return this.placeOnCell(tileId, last);
  }

  isSolved(): boolean {
    return this.model.isSolved();
  }
}
