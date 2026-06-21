import type { View } from "./app";
import type { Game } from "../game";

// Dumb view: renders the model, forwards input, asks the model what's legal.
// Holds no rules and never mutates state except through the model's methods.
export class PlayView implements View {
  constructor(private readonly model: Game) {}

  handlePointer(e: PointerEvent): void {}
  update(dt: number): void {}
  draw(ctx: CanvasRenderingContext2D): void {}
}
