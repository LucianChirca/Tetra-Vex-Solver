import { BruteForceSolver } from "./rowMajor/bruteForce";
import { EdgeMatchSolver } from "./rowMajor/edgeMatch";
import { BorderFirstSolver } from "./rowMajor/borderFirst";
import { OptimizedSolver } from "./rowMajor/optimized";
import { ScarcestTileSolver } from "./mrv/scarcestTile";
import { IndexedSolver } from "./rowMajor/indexed";

export { BacktrackingSolver } from "./base";
export { RowMajorSolver } from "./rowMajor/base";
export type { SolverEvent, SolverStats } from "./events";

export const SOLVERS = {
  "brute-force": BruteForceSolver,
  "edge-match": EdgeMatchSolver,
  "border-first": BorderFirstSolver,
  optimized: OptimizedSolver,
  "scarcest-tile": ScarcestTileSolver,
  indexed: IndexedSolver,
} as const;

export type SolverName = keyof typeof SOLVERS;
