import { useEffect, useRef, useState } from "react";
import { Game, generate } from "../game";
import { PlayController } from "./controllers/playController";
import { PlayView, SolverView, type View } from "./views";

type Mode = "menu" | "play" | "solve";
const SIZES = [3, 4, 5] as const;

// Landing menu (title + board size + Play/Solve), then the chosen view with no
// header — the game gets the vertical space. Each entry mounts a FRESH view;
// going back to the menu destroys it, so re-entering always deals clean.
export function App() {
  const [mode, setMode] = useState<Mode>("menu");
  const [size, setSize] = useState<number>(3);
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === "menu") return;
    // --tile (style.css) scales the board/pool off this
    document.documentElement.style.setProperty("--n", String(size));
    const back = () => setMode("menu");
    const view: View =
      mode === "solve"
        ? new SolverView(size, back)
        : new PlayView(() => new PlayController(new Game(generate(size))), back);
    view.mount(host.current!);
    return () => view.destroy();
  }, [mode, size]);

  if (mode === "menu") {
    return (
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-100">TetraVex</h1>
        <div className="bg-panel border-panel-border flex gap-1 rounded-lg border p-1">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`rounded-md px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                size === s ? "bg-accent text-black" : "text-neutral-400 hover:text-white"
              }`}
            >
              {s}×{s}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={() => setMode("play")} className="btn px-8 py-3 text-sm">
            Play
          </button>
          <button onClick={() => setMode("solve")} className="btn px-8 py-3 text-sm">
            Solve
          </button>
        </div>
      </div>
    );
  }

  return <div ref={host} />;
}
