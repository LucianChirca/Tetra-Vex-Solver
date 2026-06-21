import type { View } from "./app";
import { Board } from "../core";
import type { BacktrackingSolver, SolverEvent } from "../solvers";

// Triggers a solver and renders its game state; pulls one event per frame.
export class SolverView implements View {
  readonly board: Board;
  protected steps: Generator<SolverEvent, Board | null> | null = null;

  constructor(
    private readonly solver: BacktrackingSolver,
    n: number,
  ) {
    this.board = new Board(n);
  }

  start(): void {
    this.steps = this.solver.solve();
  }

  update(_dt: number): void {}
  draw(_ctx: CanvasRenderingContext2D): void {}
}
