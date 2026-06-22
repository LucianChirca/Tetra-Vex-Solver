import { createRoot, type Root } from "react-dom/client";
import type { View } from "./view";
import type { Game } from "../../game";
import type { Tile } from "../../core";
import type { BacktrackingSolver, SolverEvent } from "../../solvers";
import { Board } from "../components";

// Composes Board from the model and owns the solver's clock. The solver yields
// SolverEvents; a timer pulls one per tick, applies it to the model, re-renders.
// play/pause = timer on/off, speed = interval, step = one tick.
export class SolverView implements View {
  private root: Root | null = null;
  private steps: Generator<SolverEvent, boolean, void> | null = null;
  private timer: number | null = null;

  constructor(
    private readonly model: Game,
    private readonly solver: BacktrackingSolver,
  ) {}

  mount(parent: HTMLElement): void {
    this.root = createRoot(parent);
    this.render();
    // kick off: this.steps = this.solver.solve();
  }

  destroy(): void {
    if (this.timer !== null) clearInterval(this.timer);
    this.root?.unmount();
    this.root = null;
  }

  private render(): void {
    this.root?.render(<SolverScreen model={this.model} />);
  }

  // Pull one decision, apply to model, re-render; stop when done.
  private tick(): void {}
}

function SolverScreen({ model }: { model: Game }) {
  // TODO: read placed tiles from the model as events are applied.
  const cells: (Tile | null)[] = Array.from({ length: model.n * model.n }, () => null);
  return <Board n={model.n} cells={cells} />;
}
