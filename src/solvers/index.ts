import { BruteForceSolver } from "./rowMajor/bruteForce";
import { EdgeMatchSolver } from "./rowMajor/edgeMatch";
import { IndexedSolver } from "./rowMajor/indexed";

export { BacktrackingSolver } from "./rowMajor/base";
export type { SolverEvent, SolverStats } from "./events";

export const SOLVERS = {
  "brute-force": BruteForceSolver,
  "edge-match": EdgeMatchSolver,
  indexed: IndexedSolver,
} as const;

export type SolverName = keyof typeof SOLVERS;
