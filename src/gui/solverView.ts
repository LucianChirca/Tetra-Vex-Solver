import type { View } from "./app";
import type { Game } from "../game";
import type { BacktrackingSolver, SolverEvent } from "../solvers";

// Triggers a solver and renders the model as it replays the solver's events.
export class SolverView implements View {
  protected steps: Generator<SolverEvent, Game | null> | null = null;

  constructor(
    protected readonly model: Game,
    protected readonly solver: BacktrackingSolver,
  ) {}

  start(): void {
    this.steps = this.solver.solve();
  }

  update(_dt: number): void {}
  draw(_ctx: CanvasRenderingContext2D): void {}
}
