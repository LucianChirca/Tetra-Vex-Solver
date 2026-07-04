/* eslint-disable react-hooks/refs -- SolverScreen runs an imperative animation
   clock: the engine (a mutable Game plus the live solver generator) lives in a
   ref and we bump() to repaint right after each mutation, so reads during render
   always see the just-applied state. */
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { View } from "./view";
import { Game, generate } from "../../game";
import type { Tile } from "../../core";
import { SOLVERS, type SolverEvent, type SolverName } from "../../solvers";
import type { CSSProperties } from "react";
import { Board, Pool, StatsDialog, StatusRow } from "../components";
import { fmtDuration } from "../format";

// Hosts SolverScreen, which animates a solver's SolverEvent stream onto its own
// model. The solver clock (play/pause/step/speed) lives in the component.
export class SolverView implements View {
  private root: Root | null = null;

  constructor(
    private readonly size: number,
    private readonly onBack: () => void,
  ) {}

  mount(parent: HTMLElement): void {
    this.root = createRoot(parent);
    this.root.render(<SolverScreen size={this.size} onBack={this.onBack} />);
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
  candidateIds: Set<number>; // pool tiles the solver is about to try at the current cell
  ticks: number; // events applied so far — also the flash key, so each attempt re-animates
  done: boolean;
  solved: boolean;
  stats: { placements: number; rejections: number; backtracks: number };
  startedAt: number | null; // performance.now() at the first event
  elapsedMs: number; // wall time first event → finish (pauses included)
}

// Human-friendly labels for the dropdown (registry keys stay machine-ish).
const SOLVER_LABELS: Record<SolverName, string> = {
  "brute-force": "Brute force",
  "edge-match": "Edge matching",
  indexed: "Indexed lookup",
};
// Only implemented solvers; re-add as they land.
const SOLVER_NAMES: SolverName[] = ["brute-force", "edge-match" /* , "indexed" */];
// Slider 0..100 → delay ms (right = faster). Linear in events/sec (0.5..25.5),
// so each notch adds the same speed. 0 → 2000ms, 50 → ~77ms, 100 → ~39ms.
const delayFor = (speed: number) => 1000 / (0.5 + speed / 4);

function SolverScreen({ size, onBack }: { size: number; onBack: () => void }) {
  // One puzzle per size; stable across re-runs so solvers can be compared.
  const puzzle = useMemo(() => generate(size), [size]);
  const [name, setName] = useState<SolverName>("brute-force");
  const [speed, setSpeed] = useState(70);
  const [running, setRunning] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false); // final-stats modal, opened on solve
  const [, bump] = useReducer((v) => v + 1, 0);

  const fresh = (solverName: SolverName = name): Engine => ({
    model: new Game(puzzle),
    gen: new SOLVERS[solverName](puzzle).solve(),
    last: null,
    candidateIds: new Set(),
    ticks: 0,
    done: false,
    solved: false,
    stats: { placements: 0, rejections: 0, backtracks: 0 },
    startedAt: null,
    elapsedMs: 0,
  });
  // Lazy init: fresh() builds a Game + solver + generator, too heavy to
  // rebuild-and-discard on every render.
  const eng = useRef<Engine | null>(null);
  eng.current ??= fresh();

  const reset = () => {
    eng.current = fresh();
    setRunning(false);
    setStatsOpen(false);
    bump();
  };

  // Pull one event, apply it to the model, repaint. Returns false when finished.
  const step = (): boolean => {
    const e = eng.current!;
    if (e.done) return false;
    e.startedAt ??= performance.now();
    const r = e.gen.next();
    if (r.done) {
      e.done = true;
      e.solved = r.value === true;
      e.elapsedMs = performance.now() - e.startedAt;
      setRunning(false);
      if (e.solved) setStatsOpen(true);
      bump();
      return false;
    }
    const ev = r.value;
    if (ev.kind === "candidates") {
      e.candidateIds = new Set(ev.tiles.map((t) => t.id));
    } else if (ev.kind === "place") {
      e.model.place(ev.row, ev.col, ev.tile);
      e.stats.placements++;
      e.candidateIds.delete(ev.tile.id);
    } else if (ev.kind === "backtrack") {
      e.model.remove(ev.row, ev.col);
      e.stats.backtracks++;
    } else {
      e.stats.rejections++;
      e.candidateIds.delete(ev.tile.id);
    }
    e.last = ev;
    e.ticks++;
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
  }, [running, speed]);

  const e = eng.current;
  const depth = e.stats.placements - e.stats.backtracks; // tiles currently on the board
  const cells: (Tile | null)[] = Array.from({ length: size * size }, (_, i) =>
    e.model.at(Math.floor(i / size), i % size),
  );
  const slots: (Tile | null)[] = Array.from({ length: size * size }, () => null);
  for (const t of e.model.pool()) slots[t.id] = t;

  // Show the candidate the solver last tried-and-dropped in its cell (reject) or
  // pulled back out (backtrack) — not once we're solved.
  const flash =
    !e.solved && e.last && (e.last.kind === "reject" || e.last.kind === "backtrack")
      ? {
          index: e.last.row * size + e.last.col,
          kind: e.last.kind,
          tile: e.last.tile,
          key: e.ticks,
        }
      : null;

  const changeSolver = (next: SolverName) => {
    setName(next);
    eng.current = fresh(next);
    setRunning(false);
    setStatsOpen(false);
    bump();
  };

  return (
    <div
      className="flex h-full w-[min(92vw,24rem)] flex-col items-center gap-3"
      style={{ "--n": size } as CSSProperties}
    >
      {/* fixed top bar: costs the game no vertical space */}
      <div className="fixed top-[max(0.75rem,env(safe-area-inset-top))] left-[max(0.75rem,env(safe-area-inset-left))] z-40">
        <button onClick={onBack} className="btn-round" aria-label="Back to menu">
          ←
        </button>
      </div>

      {/* the game centers in the measured space the footer leaves over */}
      <div className="game-area w-full flex-1">
        <div className="game-inner flex h-full w-full flex-col items-center justify-center">
          <Board size={size} cells={cells} flash={flash} solved={e.solved} />

          <StatusRow solved={e.solved} onStats={() => setStatsOpen(true)}>
            <span
              title="placed · rejected · backtracked · depth/board"
              className="font-mono text-xs tracking-wider whitespace-nowrap text-neutral-500"
            >
              {e.stats.placements} placed · {e.stats.rejections} rej · {e.stats.backtracks} back ·
              depth {depth}/{size * size}
            </span>
          </StatusRow>

          <Pool size={size} slots={slots} highlightIds={e.done ? undefined : e.candidateIds} />
        </div>
      </div>

      {/* compact footer: one row of controls + a thin speed slider underneath */}
      <div className="flex min-h-16 w-full flex-col justify-center gap-2">
        <div className="flex items-center gap-2">
          <select
            value={name}
            onChange={(ev) => changeSolver(ev.target.value as SolverName)}
            className="btn min-w-0 flex-1 cursor-pointer"
          >
            {SOLVER_NAMES.map((s) => (
              <option key={s} value={s}>
                {SOLVER_LABELS[s]}
              </option>
            ))}
          </select>
          <button onClick={step} disabled={running || e.done} className="btn disabled:opacity-40">
            Step
          </button>
          <button
            onClick={() => (e.done ? reset() : setRunning((r) => !r))}
            className="btn min-w-20"
          >
            {e.done ? "Restart" : running ? "Pause" : "Solve"}
          </button>
        </div>

        {/* speed — thin, full width, icon-flanked so it never clips */}
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <span aria-hidden>🐢</span>
          <input
            type="range"
            min={0}
            max={100}
            value={speed}
            onChange={(ev) => setSpeed(Number(ev.target.value))}
            aria-label="Solver speed"
            className="accent-accent h-1 flex-1 cursor-pointer"
          />
          <span aria-hidden>🐇</span>
        </div>
      </div>

      {/* only exists once solved — keeps the ~25Hz tick render free of dialog work */}
      {e.solved && (
        <StatsDialog
          open={statsOpen}
          onClose={() => setStatsOpen(false)}
          rows={[
            ["Placed", e.stats.placements],
            ["Rejected", e.stats.rejections],
            ["Backtracked", e.stats.backtracks],
            ["Total moves", e.stats.placements + e.stats.rejections + e.stats.backtracks],
            ["Time", fmtDuration(e.elapsedMs)],
          ]}
        />
      )}
    </div>
  );
}
