import { describe, it, expect, beforeEach } from "vitest";
import { Game } from "../../game";
import type { Puzzle, Tile } from "../../core";
import { PlayController } from "./playController";

// A 2×2 puzzle with 4 tiles, ids 0..3 = their pool home slots. Digits are
// irrelevant here: placement is free (matching is the win condition, tested
// in the model), so these tests only exercise the move interactions.
function puzzle(n = 2): Puzzle {
  const tiles: Tile[] = Array.from({ length: n * n }, (_, id) => ({
    id,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }));
  return { n, tiles };
}

const ids = (cells: (Tile | null)[]) => cells.map((t) => t?.id ?? null);

describe("PlayController", () => {
  let c: PlayController;
  beforeEach(() => {
    c = new PlayController(new Game(puzzle()));
  });

  it("starts with every tile in its own pool slot, board empty", () => {
    expect(ids(c.poolSlots())).toEqual([0, 1, 2, 3]);
    expect(ids(c.boardCells())).toEqual([null, null, null, null]);
  });

  it("drags a tile from the pool onto the board", () => {
    expect(c.placeOnCell(2, 0)).toBe(true);
    expect(ids(c.boardCells())).toEqual([2, null, null, null]);
    expect(c.poolSlots()[2]).toBeNull(); // its pool slot is now empty
  });

  it("drags a placed tile back to the pool, into its own slot", () => {
    c.placeOnCell(2, 0);
    c.returnToPool(2);
    expect(ids(c.boardCells())).toEqual([null, null, null, null]);
    expect(c.poolSlots()[2]?.id).toBe(2); // back home, not slot 0
  });

  it("dropping a pool tile on an occupied cell sends the occupant home", () => {
    c.placeOnCell(0, 1); // tile 0 on cell 1
    expect(c.placeOnCell(3, 1)).toBe(true); // drop tile 3 on the same cell
    expect(c.boardCells()[1]?.id).toBe(3); // 3 takes the cell
    expect(c.poolSlots()[0]?.id).toBe(0); // 0 returned to its pool slot
  });

  it("swaps two tiles when one is dragged onto the other on the board", () => {
    c.placeOnCell(0, 0);
    c.placeOnCell(1, 1);
    expect(c.placeOnCell(0, 1)).toBe(true); // drag 0 onto 1
    expect(c.boardCells()[1]?.id).toBe(0);
    expect(c.boardCells()[0]?.id).toBe(1); // displaced occupant swaps in
  });

  it("double-click recalls a pooled tile to the cell it last occupied", () => {
    c.placeOnCell(1, 3);
    c.returnToPool(1);
    expect(c.recallToBoard(1)).toBe(true);
    expect(c.boardCells()[3]?.id).toBe(1);
  });

  it("does not recall when the original cell is taken", () => {
    c.placeOnCell(1, 3); // 1 remembers cell 3
    c.returnToPool(1);
    c.placeOnCell(2, 3); // someone else takes cell 3
    expect(c.recallToBoard(1)).toBe(false);
    expect(c.poolSlots()[1]?.id).toBe(1); // 1 stays in the pool
  });

  it("does not recall a tile that was never placed", () => {
    expect(c.recallToBoard(0)).toBe(false);
  });

  it("dropping a tile on its own cell is a no-op", () => {
    c.placeOnCell(0, 0);
    expect(c.placeOnCell(0, 0)).toBe(true);
    expect(c.boardCells()[0]?.id).toBe(0);
  });

  it("rejects an unknown tile id", () => {
    expect(c.placeOnCell(99, 0)).toBe(false);
  });
});
