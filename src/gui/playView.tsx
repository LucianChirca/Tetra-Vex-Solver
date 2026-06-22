import { createRoot, type Root } from "react-dom/client";
import type { View } from "./view";
import type { Game } from "../game";
import type { CSSProperties } from "react";
import type { Tile as TileModel } from "../core";
import { DIGIT_COLORS } from "./theme";

const SIDES = ["top", "right", "bottom", "left"] as const;

// Adapter: bridges the View lifecycle to a React root. The component is the
// dumb part — reads the model, renders, asks the model what's legal.
export class PlayView implements View {
  private root: Root | null = null;

  constructor(private readonly model: Game) {}

  mount(parent: HTMLElement): void {
    this.root = createRoot(parent);
    this.root.render(<PlayBoard model={this.model} />);
  }

  destroy(): void {
    this.root?.unmount();
    this.root = null;
  }
}

// One tile: 4 triangle faces (colored per edge) + a digit per side.
function Tile({ tile }: { tile: TileModel }) {
  return (
    <div className="tile" draggable>
      {SIDES.map((s) => (
        <div key={s} className={`face ${s}`} style={{ background: DIGIT_COLORS[tile[s]] }} />
      ))}
      {SIDES.map((s) => (
        <span key={s} className={`digit ${s}`}>{tile[s]}</span>
      ))}
    </div>
  );
}

// The play screen: empty n×n board + the tile pool. Drag/drop + win wiring TODO.
function PlayBoard({ model }: { model: Game }) {
  const cells = Array.from({ length: model.n * model.n });
  return (
    <>
      <div className="board" style={{ "--n": model.n } as CSSProperties}>
        {cells.map((_, i) => (
          <div key={i} className="cell" />
        ))}
      </div>
      <div className="pool">{/* model.pool().map((t) => <Tile key={t.id} tile={t} />) */}</div>
    </>
  );
}
