import { describe, expect, it } from "vitest";
import { generate } from "../../game";
import { SOLVERS } from "..";

const IMPLEMENTED = [
  "brute-force",
  "edge-match",
  "border-first",
  "optimized",
  "most-constrained",
] as const;

describe.each(IMPLEMENTED)("%s", (name) => {
  it("solves a generated 3x3 (events drained, returns true)", () => {
    const solver = new SOLVERS[name](generate(3));
    const gen = solver.solve();
    let r = gen.next();
    while (!r.done) r = gen.next();
    expect(r.value).toBe(true);
    expect(solver.stats.placements).toBeGreaterThanOrEqual(9);
  });
});

it.each(["optimized", "most-constrained"] as const)(
  "%s solves a 5x5 with zero rejects (candidates exact by construction)",
  (name) => {
    const solver = new SOLVERS[name](generate(5));
    const gen = solver.solve();
    let r = gen.next();
    while (!r.done) r = gen.next();
    expect(r.value).toBe(true);
    expect(solver.stats.rejections).toBe(0);
  },
);
