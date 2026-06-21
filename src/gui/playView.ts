import type { View } from "./app";
import type { Game } from "../game";

// Dumb view: renders the model, forwards input, asks the model what's legal.
// Holds no rules and never mutates state except through the model's methods.
export class PlayView implements View {
  constructor(protected readonly model: Game) {}

  handlePointer(_e: PointerEvent): void {}
  update(_dt: number): void {}
  draw(_ctx: CanvasRenderingContext2D): void {}
}
