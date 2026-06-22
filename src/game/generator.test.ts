import { describe, it, expect } from "vitest";
import { generate } from "./generator";
import { Game } from "./game";
import type { Tile } from "../core";

function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  return arr.flatMap((x, i) =>
    permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map((rest) => [x, ...rest]),
  );
}

// Place a permutation row-major; strict placement throws on a clash → that
// arrangement isn't a solution.
function solves(n: number, tiles: Tile[], order: Tile[]): boolean {
  const g = new Game({ n, tiles });
  try {
    order.forEach((tile, i) => g.place(Math.floor(i / n), i % n, tile));
  } catch {
    return false;
  }
  return g.isSolved();
}

describe("generate", () => {
  it("returns n² tiles with home-slot ids and valid digits", () => {
    const { tiles } = generate(2);
    expect(tiles).toHaveLength(4);
    expect(tiles.map((t) => t.id).sort()).toEqual([0, 1, 2, 3]);
    for (const t of tiles) {
      for (const d of [t.top, t.right, t.bottom, t.left]) {
        expect(d).toBeGreaterThanOrEqual(0);
        expect(d).toBeLessThanOrEqual(9);
      }
    }
  });

  it("produces a solvable puzzle (some arrangement wins)", () => {
    for (let run = 0; run < 20; run++) {
      const { n, tiles } = generate(2);
      const pool = [...tiles];
      const ok = permutations(pool).some((order) => solves(n, pool, order));
      expect(ok).toBe(true);
    }
  });
});
