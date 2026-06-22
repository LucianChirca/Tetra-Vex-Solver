import { describe, it, expect, beforeEach } from "vitest";
import { Game } from "../../game";
import type { Digit, Puzzle, Tile } from "../../core";
import { PlayController } from "./playController";

// 2×2 of identical tiles (all edges equal) so every placement matches — lets
// these tests exercise the move mechanics without fighting the matching rule.
function uniform(size = 2): Puzzle {
  const tiles: Tile[] = Array.from({ length: size * size }, (_, id) => ({
    id,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }));
  return { size, tiles };
}

const ids = (cells: (Tile | null)[]) => cells.map((t) => t?.id ?? null);

describe("PlayController", () => {
  let c: PlayController;
  beforeEach(() => {
    c = new PlayController(new Game(uniform()));
  });

  it("starts with every tile in its own pool slot, board empty", () => {
    expect(ids(c.poolSlots())).toEqual([0, 1, 2, 3]);
    expect(ids(c.boardCells())).toEqual([null, null, null, null]);
  });

  it("drags a tile from the pool onto the board", () => {
    expect(c.placeOnCell(2, 0)).toBe(true);
    expect(ids(c.boardCells())).toEqual([2, null, null, null]);
    expect(c.poolSlots()[2]).toBeNull();
  });

  it("drags a placed tile back to the pool, into its own slot", () => {
    c.placeOnCell(2, 0);
    c.returnToPool(2);
    expect(ids(c.boardCells())).toEqual([null, null, null, null]);
    expect(c.poolSlots()[2]?.id).toBe(2);
  });

  it("dropping a pool tile on an occupied cell sends the occupant home", () => {
    c.placeOnCell(0, 1);
    expect(c.placeOnCell(3, 1)).toBe(true);
    expect(c.boardCells()[1]?.id).toBe(3);
    expect(c.poolSlots()[0]?.id).toBe(0);
  });

  it("swaps two tiles when one is dragged onto the other", () => {
    c.placeOnCell(0, 0);
    c.placeOnCell(1, 1);
    expect(c.placeOnCell(0, 1)).toBe(true);
    expect(c.boardCells()[1]?.id).toBe(0);
    expect(c.boardCells()[0]?.id).toBe(1);
  });

  it("reset() moves every placed tile back to the pool", () => {
    c.placeOnCell(0, 0);
    c.placeOnCell(1, 1);
    c.reset();
    expect(ids(c.boardCells())).toEqual([null, null, null, null]);
    expect(ids(c.poolSlots())).toEqual([0, 1, 2, 3]);
  });

  it("dropping on a tile's own cell is a no-op", () => {
    c.placeOnCell(0, 0);
    expect(c.placeOnCell(0, 0)).toBe(true);
    expect(c.boardCells()[0]?.id).toBe(0);
  });

  it("rejects an unknown tile id", () => {
    expect(c.placeOnCell(99, 0)).toBe(false);
  });

  it("rejects a placement that breaks the edge rule, leaving the board unchanged", () => {
    // tile 0's right edge (1) won't match tile 1's left edge (2).
    const tiles: Tile[] = [
      { id: 0, top: 0, right: 1 as Digit, bottom: 0, left: 0 },
      { id: 1, top: 0, right: 0, bottom: 0, left: 2 as Digit },
      { id: 2, top: 0, right: 0, bottom: 0, left: 0 },
      { id: 3, top: 0, right: 0, bottom: 0, left: 0 },
    ];
    const k = new PlayController(new Game({ size: 2, tiles }));
    expect(k.placeOnCell(0, 0)).toBe(true); // tile 0 at top-left
    expect(k.placeOnCell(1, 1)).toBe(false); // tile 1 to its right — edges clash
    expect(k.boardCells()[1]).toBeNull();
    expect(k.poolSlots()[1]?.id).toBe(1);
  });
});
