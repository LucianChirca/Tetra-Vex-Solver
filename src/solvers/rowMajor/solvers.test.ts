import { describe, expect, it } from "vitest";
import { generate } from "../../game";
import { SOLVERS } from "..";

const IMPLEMENTED = ["brute-force", "edge-match", "border-first"] as const;

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
