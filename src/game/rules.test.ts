import { describe, it, expect } from "vitest";
import { Side } from "../core";
import type { Tile } from "../core";
import { opposite, edge, seamAgrees } from "./rules";

const tile: Tile = { id: 0, top: 1, right: 2, bottom: 3, left: 4 };

describe("opposite", () => {
  it("pairs each side with the one that touches it", () => {
    expect(opposite(Side.Top)).toBe(Side.Bottom);
    expect(opposite(Side.Bottom)).toBe(Side.Top);
    expect(opposite(Side.Left)).toBe(Side.Right);
    expect(opposite(Side.Right)).toBe(Side.Left);
  });

  it("is its own inverse", () => {
    for (const s of [Side.Top, Side.Right, Side.Bottom, Side.Left]) {
      expect(opposite(opposite(s))).toBe(s);
    }
  });
});

describe("edge", () => {
  it("reads the digit on each side", () => {
    expect(edge(tile, Side.Top)).toBe(1);
    expect(edge(tile, Side.Right)).toBe(2);
    expect(edge(tile, Side.Bottom)).toBe(3);
    expect(edge(tile, Side.Left)).toBe(4);
  });
});

describe("seamAgrees", () => {
  // A neighbor to the RIGHT touches with its left edge.
  const rightMatch: Tile = { id: 1, top: 0, right: 0, bottom: 0, left: 2 }; // left === tile.right
  const rightClash: Tile = { id: 2, top: 0, right: 0, bottom: 0, left: 9 };

  it("is true when the shared edges carry the same digit", () => {
    expect(seamAgrees(tile, Side.Right, rightMatch)).toBe(true);
  });

  it("is false when the shared edges differ", () => {
    expect(seamAgrees(tile, Side.Right, rightClash)).toBe(false);
  });

  it("is symmetric across the seam", () => {
    // tile's right meets rightMatch's left, and vice versa.
    expect(seamAgrees(tile, Side.Right, rightMatch)).toBe(
      seamAgrees(rightMatch, Side.Left, tile),
    );
  });
});
