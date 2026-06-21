import { generate } from "./core";
import { App } from "./gui/app";
import { PlayView } from "./gui/playView";
import { SolverView } from "./gui/solverView";
import { SOLVERS, type SolverName } from "./solvers";

function main(): void {
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode") ?? "play";
  const n = 3;

  const mount = document.getElementById("app")!;
  const puzzle = generate(n);
  const app = new App(mount, n);

  if (mode === "solve") {
    const name = (params.get("solver") ?? "indexed") as SolverName;
    const solver = new SOLVERS[name](puzzle.tiles, n);
    const view = new SolverView(solver, n);
    view.start();
    app.run(view);
  } else {
    app.run(new PlayView(puzzle));
  }
}

main();
