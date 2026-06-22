import { createRoot, type Root } from "react-dom/client";
import type { View } from "./view";
import type { Game } from "../../game";
import { PlayController } from "../controllers/playController";
import { PlayScreen } from "../components/PlayScreen";

// Adapter: bridges the View lifecycle to a React root rendering PlayScreen,
// backed by a PlayController that owns the move logic.
export class PlayView implements View {
  private root: Root | null = null;
  private readonly controller: PlayController;

  constructor(model: Game) {
    this.controller = new PlayController(model);
  }

  mount(parent: HTMLElement): void {
    this.root = createRoot(parent);
    this.root.render(<PlayScreen controller={this.controller} />);
  }

  destroy(): void {
    this.root?.unmount();
    this.root = null;
  }
}
