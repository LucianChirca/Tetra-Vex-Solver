import type { Tile } from "./types";

export class Board {
  readonly n: number;

  constructor(n: number) {
    this.n = n;
  }

  at(_row: number, _col: number): Tile | null {
    throw new Error("not implemented");
  }

  place(_row: number, _col: number, _tile: Tile): void {}

  remove(_row: number, _col: number): void {}

  // Top/left neighbors only — right/bottom are empty under row-major fill.
  fits(_row: number, _col: number, _tile: Tile): boolean {
    throw new Error("not implemented");
  }

  isSolved(): boolean {
    throw new Error("not implemented");
  }
}
