import { BruteForceSolver } from "./bruteForce";
import { EdgeMatchSolver } from "./edgeMatch";
import { IndexedSolver } from "./indexed";

export { BacktrackingSolver } from "./base";
export type { SolverEvent, SolverStats } from "./events";

export const SOLVERS = {
  "brute-force": BruteForceSolver,
  "edge-match": EdgeMatchSolver,
  indexed: IndexedSolver,
} as const;

export type SolverName = keyof typeof SOLVERS;
