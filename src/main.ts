import { Game, generate } from "./game";
import { App, PlayView, SolverView } from "./gui";
import { SOLVERS, type SolverName } from "./solvers";

type Mode = "play" | "solve";

const BOARD_SIZE = 3;
const DEFAULT_MODE: Mode = "play";
const DEFAULT_SOLVER: SolverName = "indexed";

function main(): void {
  const params = new URLSearchParams(location.search);
  const mode: Mode = params.get("mode") === "solve" ? "solve" : DEFAULT_MODE;

  const mount = document.getElementById("app")!;
  const puzzle = generate(BOARD_SIZE);
  const model = new Game(puzzle);
  const app = new App(mount, BOARD_SIZE);

  if (mode === "solve") {
    const raw = params.get("solver");
    const name: SolverName = raw && raw in SOLVERS ? (raw as SolverName) : DEFAULT_SOLVER;
    const solver = new SOLVERS[name](puzzle);
    app.run(new SolverView(model, solver));
  } else {
    app.run(new PlayView(model));
  }
}

main();
