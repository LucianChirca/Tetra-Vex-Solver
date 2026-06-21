"""Registry of available solver strategies."""

from .naive import NaiveSolver
from .pruned import PrunedSolver
from .backtracking import BacktrackingSolver

SOLVERS = {
    "naive": NaiveSolver,
    "pruned": PrunedSolver,
    "backtracking": BacktrackingSolver,
}
