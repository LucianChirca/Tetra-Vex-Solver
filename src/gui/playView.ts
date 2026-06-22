import type { View } from "./view";
import type { Game } from "../game";

// Dumb DOM view: builds a board + pool, drags tiles via native HTML5
// drag-and-drop, asks the model what's legal. No rules, no animation loop.
// mount() builds .board (n×n .cell grid) + .pool of .tile; drop → isLegalMove
// → place → re-render. style.css targets these classes.
export class PlayView implements View {
  private root: HTMLElement | null = null;

  constructor(private readonly model: Game) {}

  mount(parent: HTMLElement): void {}

  destroy(): void {}
}
