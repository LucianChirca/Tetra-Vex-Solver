// Shared chrome for the board + pool panels.
export const PANEL = "gap-1.5 p-1.5 bg-panel border border-panel-border rounded-lg";

// Grid track for an n-wide tile layout (board and pool share it, so they align).
export const track = (n: number) => `repeat(${n}, 6rem)`;
