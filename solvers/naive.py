"""Strategy 1: try every permutation of tiles, validate the full grid."""

from .base import Solver


class NaiveSolver(Solver):
    name = "naive"

    def solve(self):
        ...
