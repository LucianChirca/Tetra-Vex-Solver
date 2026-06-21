<h1 align="center">🧩 TetraVex Solver</h1>

<p align="center">
  <em>Play the TetraVex edge-matching puzzle — and watch a backtracking solver crack it, one decision at a time.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/python-3.10+-3776AB?logo=python&logoColor=white" alt="Python 3.10+">
  <img src="https://img.shields.io/badge/pygame--ce-2.x-00AA00" alt="pygame-ce">
  <img src="https://img.shields.io/badge/status-WIP-orange" alt="Status: WIP">
</p>

---

## What is TetraVex?

TetraVex is an `n×n` grid puzzle. You're given `n²` square tiles, each with a
digit on all four edges. Place every tile so that **touching edges show the
same digit** — every internal seam must agree.

> Each digit `0–9` is drawn on its own colored triangle, so a correct solution
> is also a clean, continuous color pattern. Tiles **never rotate** — only their
> position changes.

<p align="center">
  <img src="assets/tetravex-app.png" alt="The original TetraVex puzzle (Game Nest app)" width="320">
  <br>
  <sub>The puzzle that started it — a 3×3 board with its tile pool (Game Nest app).</sub>
</p>

---

## Why this project

A learning playground for **search and constraint satisfaction**, with a UI good
enough to actually feel the algorithms:

- **Play it** — interactive board, drag tiles from the pool, smooth snap.
- **Watch it solve** — a side view renders the solver's every move: placements,
  rejections, and backtracks, live.
- **Compare strategies** — naive → pruned → optimized backtracking, swappable.

<!-- TODO: drop real captures once the views are built -->
<p align="center">
  <img src="assets/play-view.png" alt="Interactive play view" width="45%">
  &nbsp;&nbsp;
  <img src="assets/solver-view.png" alt="Solver stepping through states" width="45%">
  <br>
  <sub>Left: play mode. Right: solver mode. <em>(captures coming soon)</em></sub>
</p>

---

## How it works

DFS with backtracking, filling the grid from the top-left corner,
left→right then top→bottom. Three strategies, each a strict improvement:

| Strategy | Idea | Worst case |
| --- | --- | --- |
| **Naive** | Try every permutation of tiles, validate the full grid at the end. | `O(n²!)` |
| **Pruned** | Same DFS, but only place a tile whose left/top edges already match its neighbors — dead branches die early. | far below `n²!` in practice |
| **Backtracking (optimized)** | Pruned DFS plus a `(side, digit) → tiles` hash map for instant candidate lookup, and a `placed[]` array to unwind cleanly on backtrack. | fastest of the three |

The point isn't just *a* solver — it's seeing **why** each refinement prunes the
search tree, watching the rejected branches disappear in the solver view.

---

## Project layout

```
tetra_vex_solver/
├── main.py              entry point — picks play/solve mode, wires it together
├── game.py              puzzle rules: Tile, Board, edge matching, validation, generate()
├── gui.py               pygame-ce rendering: App loop, PlayView, SolverView, draw_tile
├── solvers/
│   ├── __init__.py      SOLVERS registry
│   ├── base.py          Solver interface + on_event hook for the GUI
│   ├── naive.py         strategy 1
│   ├── pruned.py        strategy 2
│   └── backtracking.py  strategy 3
├── assets/              screenshots
└── requirements.txt
```

The solver and the GUI are decoupled: a solver emits decision events through an
`on_event` callback, and the `SolverView` just renders whatever it's handed.

---

## Getting started

```bash
git clone https://github.com/<you>/tetra_vex_solver.git
cd tetra_vex_solver

python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

python main.py play     # play it yourself
python main.py solve    # watch the solver
```

> Requires Python 3.10+. Rendering uses **pygame-ce** (SDL2) — no GPU/Metal
> setup needed; the render load is tiny.

---

## Roadmap

- [ ] `game.generate()` — random *solvable* puzzles (build a valid board, shuffle the pool)
- [ ] `PlayView` — drag-and-drop with snap + win detection
- [ ] `SolverView` — animated place / reject / backtrack
- [ ] The three solver strategies
- [ ] Side-by-side strategy comparison (steps, time, branches pruned)
- [ ] Larger boards (`4×4`, `5×5`)
