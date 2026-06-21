export type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// Indexes a Tile's edges in the same top/right/bottom/left order as its fields.
export enum Side {
  Top = 0,
  Right = 1,
  Bottom = 2,
  Left = 3,
}

// Edges ordered top/right/bottom/left. Tiles never rotate. `id` tracks placement.
export interface Tile {
  readonly id: number;
  readonly top: Digit;
  readonly right: Digit;
  readonly bottom: Digit;
  readonly left: Digit;
}

// `solution` is for win-checking/tests only — never handed to a solver.
export interface Puzzle {
  readonly n: number;
  readonly tiles: readonly Tile[];
  readonly solution: readonly Tile[]; // index = row * n + col
}
