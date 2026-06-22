/* eslint-disable react-hooks/refs -- SolverScreen runs an imperative animation
   clock: the engine (a mutable Game plus the live solver generator) lives in a
   ref and we bump() to repaint right after each mutation, so reads during render
   always see the just-applied state. */
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { View } from "./view";
import { Game } from "../../game";
import type { Tile } from "../../core";
import { SOLVERS, type SolverEvent, type SolverName } from "../../solvers";
import { Board, Pool } from "../components";
import { mockSolverRun } from "../mockSolver";

// Hosts SolverScreen, which animates a solver's SolverEvent stream onto its own
// model. The solver clock (play/pause/step/speed) lives in the component.
export class SolverView implements View {
  private root: Root | null = null;

  constructor(private readonly size: number) {}

  mount(parent: HTMLElement): void {
    this.root = createRoot(parent);
    this.root.render(<SolverScreen size={this.size} />);
  }

  destroy(): void {
    this.root?.unmount();
    this.root = null;
  }
}

// One run's mutable state: the model the events are replayed onto, the live
// generator, the last event (for flash), and counters. Held in a ref so ticking
// doesn't churn React state — we bump() to repaint.
interface Engine {
  model: Game;
  gen: Generator<SolverEvent, boolean, void>;
  last: SolverEvent | null;
  done: boolean;
  solved: boolean;
  stats: { placements: number; rejections: number; backtracks: number };
}

// Human-friendly labels for the dropdown (registry keys stay machine-ish).
const SOLVER_LABELS: Record<SolverName, string> = {
  "brute-force": "Brute force",
  "edge-match": "Edge matching",
  indexed: "Indexed lookup",
};
const SOLVER_NAMES = Object.keys(SOLVERS) as SolverName[];
// Slider 0..100 → delay ms (right = faster). 100 → ~10ms, 0 → ~310ms.
const delayFor = (speed: number) => 10 + (100 - speed) * 3;

function SolverScreen({ size }: { size: number }) {
  // The mock owns the puzzle (it needs the answer key); stable across re-runs.
  const mock = useMemo(() => mockSolverRun(size), [size]);
  const [name, setName] = useState<SolverName>("brute-force");
  const [speed, setSpeed] = useState(70);
  const [running, setRunning] = useState(false);
  const [, bump] = useReducer((v) => v + 1, 0);

  const fresh = (): Engine => ({
    model: new Game(mock.puzzle),
    gen: mock.run(),
    last: null,
    done: false,
    solved: false,
    stats: { placements: 0, rejections: 0, backtracks: 0 },
  });
  const eng = useRef<Engine>(fresh());

  const reset = () => {
    eng.current = fresh();
    setRunning(false);
    bump();
  };

  // Pull one event, apply it to the model, repaint. Returns false when finished.
  const step = (): boolean => {
    const e = eng.current;
    if (e.done) return false;
    const r = e.gen.next();
    if (r.done) {
      e.done = true;
      e.solved = r.value === true;
      setRunning(false);
      bump();
      return false;
    }
    const ev = r.value;
    if (ev.kind === "place") {
      e.model.place(ev.row, ev.col, ev.tile);
      e.stats.placements++;
    } else if (ev.kind === "backtrack") {
      e.model.remove(ev.row, ev.col);
      e.stats.backtracks++;
    } else {
      e.stats.rejections++;
    }
    e.last = ev;
    bump();
    return true;
  };

  // The clock: while running, tick at the chosen interval; stop when finished.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      if (!step()) window.clearInterval(id);
    }, delayFor(speed));
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, speed]);

  const e = eng.current;
  const cells: (Tile | null)[] = Array.from({ length: size * size }, (_, i) =>
    e.model.at(Math.floor(i / size), i % size),
  );
  const slots: (Tile | null)[] = Array.from({ length: size * size }, () => null);
  for (const t of e.model.pool()) slots[t.id] = t;

  // Flash the cell the last reject/backtrack touched (not once we're solved).
  const flash =
    !e.solved && e.last && e.last.kind !== "place"
      ? { index: e.last.row * size + e.last.col, kind: e.last.kind }
      : null;

  const changeSolver = (next: SolverName) => {
    setName(next);
    eng.current = fresh();
    setRunning(false);
    bump();
  };

  return (
    <div className="flex w-[min(92vw,24rem)] flex-col items-center gap-5">
      <Board size={size} cells={cells} flash={flash} solved={e.solved} />

      <div className="flex h-5 items-center">
        {e.solved ? (
          <span className="animate-pulse text-sm font-bold tracking-[0.3em] text-emerald-400">
            SOLVED 🎉
          </span>
        ) : (
          <span className="font-mono text-xs tracking-wider text-neutral-500">
            {e.stats.placements} placed · {e.stats.rejections} rejected · {e.stats.backtracks}{" "}
            backtracked
          </span>
        )}
      </div>

      <Pool size={size} slots={slots} />

      <div className="flex min-h-20 flex-col items-center justify-start gap-3">
        <div className="flex items-center gap-3">
          <select
            value={name}
            onChange={(ev) => changeSolver(ev.target.value as SolverName)}
            className="btn cursor-pointer"
          >
            {SOLVER_NAMES.map((s) => (
              <option key={s} value={s}>
                {SOLVER_LABELS[s]}
              </option>
            ))}
          </select>
          <button
            onClick={() => (e.done ? reset() : setRunning((r) => !r))}
            className="btn min-w-20"
          >
            {e.done ? "Restart" : running ? "Pause" : "Solve"}
          </button>
          <button onClick={step} disabled={running || e.done} className="btn disabled:opacity-40">
            Step
          </button>
          <button onClick={reset} className="btn">
            Reset
          </button>
        </div>

        <label className="flex items-center gap-2 text-xs tracking-wider text-neutral-500 uppercase">
          Slow
          <input
            type="range"
            min={0}
            max={100}
            value={speed}
            onChange={(ev) => setSpeed(Number(ev.target.value))}
            className="accent-accent w-40"
          />
          Fast
        </label>
      </div>
    </div>
  );
}
