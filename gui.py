"""Visual rendering — mimics the Game Nest TetraVex UI (dark theme).

Backend: pygame-ce (SDL2). Immediate-mode redraw each frame — suits both the
interactive game and watching a solver step through states.

ponytail: no Metal/OpenGL. Render load is trivial (≤81 triangles); SDL2 is
plenty. Don't chase a GPU backend.

Tiles never rotate — orientation is fixed, only position changes.

Two views:
  - PlayView   : interactive game. Tile pool below, drag tiles into the n×n grid.
  - SolverView : watch a solver. Renders board + decision events (place /
                 reject / backtrack) streamed via on_event.

Tile drawing: 4 colored triangles meeting at center, a digit on each, matching
the screenshot. Color = game.COLORS[digit].
"""

import pygame

# --- theme (eyeballed from screenshot, refine later) -------------------------
BG = "#0A0A0A"
PANEL = "#161616"
PANEL_BORDER = "#2A2A2A"
TEXT = "#FFFFFF"
ACCENT = "#F1C40F"  # timer yellow

FPS = 60


class App:
    """Owns the window + clock; runs whichever view is active."""

    def __init__(self, n: int, title: str = "TetraVex"):
        self.n = n
        self.screen = None   # pygame.Surface, set in run()
        self.clock = None
        self.running = False

    def run(self, view) -> None:
        """Standard loop: poll events -> view.update -> view.draw -> flip."""
        ...


def draw_tile(surf, tile, x, y, size) -> None:
    """Draw one tile: 4 triangles (corner verts -> center) + digits."""
    ...


class PlayView:
    """Interactive game: n×n grid + tile pool, drag-and-drop. No rotation."""

    def __init__(self, app: "App"):
        ...

    def handle(self, event) -> None:
        """Mouse down/up/motion for drag-and-drop."""
        ...

    def update(self, dt) -> None:
        """Animate tile snap/ease."""
        ...

    def draw(self, surf) -> None:
        ...


class SolverView:
    """Visualizes a solver stepping through states."""

    def __init__(self, app: "App"):
        ...

    def on_event(self, event: str, row: int, col: int, tile) -> None:
        """Callback handed to a Solver; queues a decision to render."""
        ...

    def update(self, dt) -> None:
        ...

    def draw(self, surf) -> None:
        ...
