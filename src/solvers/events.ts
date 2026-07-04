import type { Tile } from "../core";

// Solver output, expressed in domain terms. The GUI imports this; the solver
// imports nothing from the GUI.
export type SolverEvent =
  // Purely for the GUI (pool highlighting) — carries no search logic. The tiles
  // the strategy is about to try at (row,col).
  | { kind: "candidates"; row: number; col: number; tiles: Tile[] }
  | { kind: "place"; row: number; col: number; tile: Tile }
  | { kind: "reject"; row: number; col: number; tile: Tile }
  | { kind: "backtrack"; row: number; col: number; tile: Tile };

export interface SolverStats {
  placements: number;
  rejections: number;
  backtracks: number;
}
