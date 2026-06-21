"""Strategy 2: incremental DFS, only place tiles matching left/top neighbors."""

from .base import Solver


class PrunedSolver(Solver):
    name = "pruned"

    def solve(self):
        ...
