"""Common solver interface. Strategies subclass this."""


class Solver:
    """Takes a set of tiles + board size, yields/returns a solved board.

    Optional `on_event` callback lets the GUI watch decisions as they happen.
    """

    name = "base"

    def __init__(self, tiles, n, on_event=None):
        self.tiles = tiles
        self.n = n
        self.on_event = on_event

    def solve(self):
        """Return a solved Board, or None if unsolvable."""
        raise NotImplementedError
