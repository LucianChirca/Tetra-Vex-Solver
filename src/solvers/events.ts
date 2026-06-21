import type { Tile } from "../core";

// Solver output, expressed in domain terms. The GUI imports this; the solver
// imports nothing from the GUI.
export type SolverEvent =
  | { kind: "place"; row: number; col: number; tile: Tile }
  | { kind: "reject"; row: number; col: number; tile: Tile }
  | { kind: "backtrack"; row: number; col: number; tile: Tile };

export interface SolverStats {
  placements: number;
  rejections: number;
  backtracks: number;
}
