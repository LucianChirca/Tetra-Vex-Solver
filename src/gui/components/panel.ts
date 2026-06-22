// Grid track for an n-wide tile layout (board and pool share it, so they
// align). Uses the responsive --tile size from style.css.
export const track = (n: number) => `repeat(${n}, var(--tile))`;
