import type { View } from "./view";
import type { Game } from "../game";
import type { BacktrackingSolver, SolverEvent } from "../solvers";

// Runs a solver, renders its progress as DOM. The solver yields SolverEvents;
// a timer pulls one per tick and applies it to `model` (the draw source).
// GUI owns the clock: play/pause = timer on/off, speed = interval, step = one
// tick. CSS transitions animate each place/reject/backtrack.
export class SolverView implements View {
  private root: HTMLElement | null = null;
  private steps: Generator<SolverEvent, boolean, void> | null = null;
  private timer: number | null = null;

  constructor(
    private readonly model: Game,
    private readonly solver: BacktrackingSolver,
  ) {}

  mount(parent: HTMLElement): void {
    // build DOM, then kick off: this.steps = this.solver.solve();
  }

  destroy(): void {}

  // Pull one decision and render it; stop when the generator is done.
  private tick(): void {}
}
