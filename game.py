"""Puzzle rules + tile generation: tile model, edge matching, validation.

No solving strategy here — only what defines a *legal* TetraVex board and how
to produce a fresh solvable one.

Observed from the app: each tile edge shows a DIGIT (0-9) drawn on a colored
triangle. The color is just a visual encoding of the digit, so edges match
when their digits are equal. COLORS maps digit -> display color.
"""

from dataclasses import dataclass
from enum import IntEnum

# digit -> display color (eyeball from screenshot, refine against pixels later).
COLORS = {
    0: "#C0392B",  # red
    1: "#2E86DE",  # blue
    2: "#27AE60",  # green
    3: "#E67E22",  # orange
    4: "#7D3C98",  # purple
    5: "#16A085",  # teal
    6: "#1ABC9C",  # cyan
    7: "#C2185B",  # magenta
    8: "#5D4037",  # brown
    9: "#566573",  # slate
}

Digit = int  # 0-9


class Side(IntEnum):
    """Index into a tile's edge tuple."""
    TOP = 0
    RIGHT = 1
    BOTTOM = 2
    LEFT = 3


@dataclass(frozen=True)
class Tile:
    """One square; edges are digits ordered (top, right, bottom, left)."""
    top: Digit
    right: Digit
    bottom: Digit
    left: Digit


class Board:
    """An n×n placement of tiles. Holds state, not strategy."""

    def __init__(self, n: int):
        ...

    def place(self, row: int, col: int, tile: Tile) -> None:
        ...

    def remove(self, row: int, col: int) -> None:
        ...

    def fits(self, row: int, col: int, tile: Tile) -> bool:
        """True if tile's left/top digits match already-placed neighbors."""
        ...

    def is_solved(self) -> bool:
        """True if full and every shared edge has equal digits."""
        ...


def generate(n: int, seed: int | None = None) -> tuple[list[Tile], Board]:
    """Make a random *solvable* puzzle.

    Build a consistent solved board first (interior edges shared between
    neighbors), then return its tiles shuffled as the pool plus the solution
    board (for verifying the solver). Guarantees at least one solution.
    """
    ...
