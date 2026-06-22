import { describe, it, expect } from "vitest";
import { Game } from "./game";
import type { Puzzle, Tile } from "../core";

// A hand-built solvable 2×2: tiles A,B,C,D match in row-major order.
//   A B      A.right=B.left=2   A.bottom=C.top=3
//   C D      B.bottom=D.top=7   C.right=D.left=8
const A: Tile = { id: 0, top: 1, right: 2, bottom: 3, left: 4 };
const B: Tile = { id: 1, top: 5, right: 6, bottom: 7, left: 2 };
const C: Tile = { id: 2, top: 3, right: 8, bottom: 9, left: 0 };
const D: Tile = { id: 3, top: 7, right: 1, bottom: 2, left: 8 };
const puzzle: Puzzle = { size: 2, tiles: [A, B, C, D] };

describe("Game rules", () => {
  it("allows placing on an empty cell with no neighbors", () => {
    const g = new Game(puzzle);
    expect(g.isLegalMove(0, 0, A)).toBe(true);
  });

  it("allows a placement whose edges match the neighbor", () => {
    const g = new Game(puzzle);
    g.place(0, 0, A);
    expect(g.isLegalMove(0, 1, B)).toBe(true); // B.left(2) === A.right(2)
  });

  it("rejects a placement whose edges clash", () => {
    const g = new Game(puzzle);
    g.place(0, 0, A);
    expect(g.isLegalMove(0, 1, C)).toBe(false); // C.left(0) !== A.right(2)
  });

  it("rejects an occupied or out-of-bounds cell", () => {
    const g = new Game(puzzle);
    g.place(0, 0, A);
    expect(g.isLegalMove(0, 0, B)).toBe(false); // occupied
    expect(g.isLegalMove(2, 0, B)).toBe(false); // out of bounds
  });

  it("place() removes from the pool; remove() returns it", () => {
    const g = new Game(puzzle);
    g.place(0, 0, A);
    expect(g.at(0, 0)).toBe(A);
    expect(g.pool().some((t) => t.id === A.id)).toBe(false);
    g.remove(0, 0);
    expect(g.at(0, 0)).toBeNull();
    expect(g.pool().some((t) => t.id === A.id)).toBe(true);
  });

  it("place() throws on an illegal move", () => {
    const g = new Game(puzzle);
    g.place(0, 0, A);
    expect(() => g.place(0, 1, C)).toThrow();
  });
});

describe("Game.isSolved", () => {
  it("is false until the grid is full", () => {
    const g = new Game(puzzle);
    expect(g.isSolved()).toBe(false);
    g.place(0, 0, A);
    expect(g.isSolved()).toBe(false);
  });

  it("is true for a correctly matched full board", () => {
    const g = new Game(puzzle);
    g.place(0, 0, A);
    g.place(0, 1, B);
    g.place(1, 0, C);
    g.place(1, 1, D);
    expect(g.isSolved()).toBe(true);
  });
});
