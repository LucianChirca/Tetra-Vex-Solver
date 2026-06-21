import type { View } from "./app";
import type { Game } from "../game";
import type { BacktrackingSolver, SolverEvent } from "../solvers";

// Triggers a solver and renders its progress. `model` is the replay target:
// the solver emits SolverEvents (its own internal model stays private) and the
// view applies them to `model`, which is the single source of what's drawn.
export class SolverView implements View {
  private steps: Generator<SolverEvent, boolean, void> | null = null;

  constructor(
    private readonly model: Game,
    private readonly solver: BacktrackingSolver,
  ) {}

  start(): void {
    // kick off the solver generator: this.steps = this.solver.solve();
    throw new Error("not implemented");
  }

  update(dt: number): void {}
  draw(ctx: CanvasRenderingContext2D): void {}
}
