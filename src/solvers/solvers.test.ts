import { describe, expect, it } from "vitest";
import { generate } from "../game";
import { Side, type Tile } from "../core";
import { SOLVERS } from ".";
import { forcedSides } from "./rowMajor/borderFirst";
import type { SolverEvent } from "./events";

const IMPLEMENTED = [
  "brute-force",
  "edge-match",
  "border-first",
  "optimized",
  "scarcest-tile",
] as const;

function drain(gen: Generator<SolverEvent, boolean, void>): boolean {
  let r = gen.next();
  while (!r.done) r = gen.next();
  return r.value;
}

describe.each(IMPLEMENTED)("%s", (name) => {
  it("solves a generated 3x3", () => {
    const solver = new SOLVERS[name](generate(3));
    expect(drain(solver.solve())).toBe(true);
    expect(solver.stats.placements).toBeGreaterThanOrEqual(9);
  });
});

it("optimized emits no rejects — candidates are exact by construction", () => {
  const solver = new SOLVERS.optimized(generate(3));
  drain(solver.solve());
  expect(solver.stats.rejections).toBe(0);
});

it("forcedSides marks exactly the unpairable sides", () => {
  const t = (id: number, top: number, right: number, bottom: number, left: number) =>
    ({ id, top, right, bottom, left }) as Tile;
  // Tile 0's top (9) has no partner bottom anywhere; tile 1's bottom (1) has
  // no partner top (tile 0's top is 9). Every other side pairs up.
  const tiles = [t(0, 9, 1, 1, 1), t(1, 1, 1, 1, 1)];
  const forced = forcedSides(tiles);
  expect(forced[0]).toEqual([Side.Top]);
  expect(forced[1]).toEqual([Side.Bottom]);
});
