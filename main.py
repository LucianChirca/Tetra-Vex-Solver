"""Entry point: pick a mode (play / solve), wire game + GUI + solver."""

import sys

from game import generate
from gui import App, PlayView, SolverView
from solvers import SOLVERS


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "play"
    n = 3

    tiles, solution = generate(n)
    app = App(n)

    if mode == "play":
        app.run(PlayView(app))
    elif mode == "solve":
        view = SolverView(app)
        solver = SOLVERS["backtracking"](tiles, n, on_event=view.on_event)
        # solver.solve() drives view via on_event; app.run renders it
        app.run(view)
    else:
        print(f"unknown mode: {mode!r} (use 'play' or 'solve')")


if __name__ == "__main__":
    main()
