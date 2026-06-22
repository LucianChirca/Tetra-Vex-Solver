import { useEffect, useRef, useState } from "react";
import { Game, generate } from "../game";
import { PlayController } from "./controllers/playController";
import { PlayView, SolverView, type View } from "./views";

type Mode = "play" | "solve";
const BOARD_SIZE = 3;

// App chrome: a Player/Solver toggle above whichever view is active. Each mode
// gets a FRESH view instance; switching destroys the old one and mounts a new
// one, so toggling always resets to a clean board.
export function App() {
  const [mode, setMode] = useState<Mode>("play");
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const view: View =
      mode === "solve"
        ? new SolverView(BOARD_SIZE)
        : new PlayView(() => new PlayController(new Game(generate(BOARD_SIZE))));
    view.mount(host.current!);
    return () => view.destroy();
  }, [mode]);

  return (
    <div className="flex flex-col items-center gap-3">
      <h1 className="text-xl font-bold tracking-tight text-neutral-100">TetraVex</h1>
      <div className="bg-panel border-panel-border flex gap-1 rounded-lg border p-1">
        {(["play", "solve"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-md px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
              mode === m ? "bg-accent text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            {m === "play" ? "Play" : "Solve"}
          </button>
        ))}
      </div>
      <div ref={host} />
    </div>
  );
}
