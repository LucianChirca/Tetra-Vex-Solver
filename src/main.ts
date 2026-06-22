import "./gui/style.css";
import { Game, generate } from "./game";
import { PlayView, SolverView, PlayController, type View } from "./gui";
import { SOLVERS, type SolverName } from "./solvers";

type Mode = "play" | "solve";

const BOARD_SIZE = 3;
const DEFAULT_MODE: Mode = "play";
const DEFAULT_SOLVER: SolverName = "indexed";

function main(): void {
  const params = new URLSearchParams(location.search);
  const mode: Mode = params.get("mode") === "solve" ? "solve" : DEFAULT_MODE;
  const mount = document.getElementById("app")!;

  let view: View;
  if (mode === "solve") {
    const raw = params.get("solver");
    const name: SolverName = raw && raw in SOLVERS ? (raw as SolverName) : DEFAULT_SOLVER;
    const puzzle = generate(BOARD_SIZE);
    view = new SolverView(new Game(puzzle), new SOLVERS[name](puzzle));
  } else {
    // Composition root owns the wiring: hand the play view a factory that
    // deals a fresh, solvable board on demand (initial render + "New").
    view = new PlayView(() => new PlayController(new Game(generate(BOARD_SIZE))));
  }
  view.mount(mount);
}

main();
