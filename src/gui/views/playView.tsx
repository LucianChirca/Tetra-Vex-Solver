import { createRoot, type Root } from "react-dom/client";
import type { View } from "./view";
import type { Game } from "../../game";
import type { Tile } from "../../core";
import { Board, Pool } from "../components";

// Composes Board + Pool from the model and owns the human's input (drag-and-
// drop, win tracking — TODO). The model decides what's legal; the view asks.
export class PlayView implements View {
  private root: Root | null = null;

  constructor(private readonly model: Game) {}

  mount(parent: HTMLElement): void {
    this.root = createRoot(parent);
    this.render();
  }

  destroy(): void {
    this.root?.unmount();
    this.root = null;
  }

  private render(): void {
    this.root?.render(<PlayScreen model={this.model} />);
  }
}

function PlayScreen({ model }: { model: Game }) {
  // TODO: read placed tiles / remaining pool from the model once at()/pool()
  // are implemented. Placeholders keep the layout renderable meanwhile.
  const cells: (Tile | null)[] = Array.from({ length: model.n * model.n }, () => null);
  const pool: readonly Tile[] = [];
  return (
    <>
      <Board n={model.n} cells={cells} />
      <Pool tiles={pool} />
    </>
  );
}
