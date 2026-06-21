import type { View } from "./app";
import { Board } from "../core";
import type { Puzzle } from "../core";

// Interactive game: drag pool tiles into the grid. Wins when board.isSolved().
export class PlayView implements View {
  readonly board: Board;

  constructor(puzzle: Puzzle) {
    this.board = new Board(puzzle.n);
  }

  handlePointer(_e: PointerEvent): void {}
  update(_dt: number): void {}
  draw(_ctx: CanvasRenderingContext2D): void {}
}
