import { createRoot, type Root } from "react-dom/client";
import type { View } from "./view";
import type { PlayController } from "../controllers/playController";
import { PlayScreen } from "../components/PlayScreen";

// Adapter: bridges the View lifecycle to a React root rendering PlayScreen.
// The controller factory is injected by the composition root.
export class PlayView implements View {
  private root: Root | null = null;

  constructor(
    private readonly newController: () => PlayController,
    private readonly onBack: () => void,
  ) {}

  mount(parent: HTMLElement): void {
    this.root = createRoot(parent);
    this.root.render(<PlayScreen newController={this.newController} onBack={this.onBack} />);
  }

  destroy(): void {
    this.root?.unmount();
    this.root = null;
  }
}
