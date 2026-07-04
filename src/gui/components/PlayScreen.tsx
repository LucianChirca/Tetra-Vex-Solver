import { useEffect, useReducer, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Board } from "./Board";
import { Pool } from "./Pool";
import { Tile } from "./Tile";
import { SnapBack } from "./SnapBack";
import { StatsDialog } from "./StatsDialog";
import { fmtClock, fmtDuration } from "../format";
import type { PlayController } from "../controllers/playController";

// Cursor position + grab offset + the tile's home position (where it sits in the
// pool), so a rejected drag can glide back there.
type Drag = {
  tileId: number;
  x: number;
  y: number;
  offX: number;
  offY: number;
  homeX: number;
  homeY: number;
  fromPool: boolean;
};
type Hover = { kind: "cell"; index: number } | { kind: "pool" } | null;
type Returning = { tileId: number; from: { x: number; y: number }; to: { x: number; y: number } };

// Screen position of a pool home slot — the slot cell (data-slot) stays in the
// DOM whether full or empty, so a returned tile can glide back to it.
function slotRect(tileId: number): { x: number; y: number } | null {
  const el = document.querySelector(`[data-slot="${tileId}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top };
}

// Composes Board + Pool and owns the human's input: a custom pointer drag (the
// tile follows the cursor — no native drag image). Board/Pool report hover; on
// release we resolve against the controller (place / swap / return). A rejected
// pool drag glides back to its slot instead of vanishing. `newController`
// mints a fresh board (Reset clears the current one; New deals another).
// Live clock pill for the top bar. Ticks once a second while running; shows
// the frozen time once solved. Owns its own tick so PlayScreen doesn't rerender.
function Timer({ startedAt, frozenMs }: { startedAt: number | null; frozenMs: number | null }) {
  const [nowMs, setNowMs] = useState(0); // elapsed at the last tick — render stays pure
  useEffect(() => {
    if (startedAt === null || frozenMs !== null) return;
    const id = window.setInterval(() => setNowMs(performance.now() - startedAt), 1000);
    return () => window.clearInterval(id);
  }, [startedAt, frozenMs]);
  const ms = frozenMs ?? (startedAt === null ? 0 : nowMs);
  return (
    <span className="border-panel-border bg-panel flex h-10 items-center gap-1.5 rounded-full border px-3 font-mono text-sm text-neutral-300">
      <span aria-hidden>🕒</span>
      {fmtClock(ms)}
    </span>
  );
}

export function PlayScreen({
  newController,
  onBack,
}: {
  newController: () => PlayController;
  onBack: () => void;
}) {
  const [, rerender] = useReducer((v) => v + 1, 0);
  const [controller, setController] = useState(newController);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [hover, setHover] = useState<Hover>(null);
  const [returning, setReturning] = useState<Returning | null>(null);
  // Run stats: clock starts at the first grab, a move = any drop that changed
  // the board (place/swap or sending a placed tile home).
  const run = useRef({ moves: 0, startedAt: null as number | null });
  // Snapshot taken at the winning drop; also gates the "Stats" button.
  const [finalStats, setFinalStats] = useState<{ moves: number; elapsedMs: number } | null>(null);
  const [statsOpen, setStatsOpen] = useState(false);
  // Mirrors run.current.startedAt for the Timer (refs can't be read in render).
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const startDrag = (tileId: number, e: ReactPointerEvent) => {
    e.preventDefault();
    run.current.startedAt ??= performance.now();
    setStartedAt(run.current.startedAt);
    // iOS implicitly captures the pointer to this tile on touch, which stops
    // pointerenter firing on the cells we drag over — release it so hover works.
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const r = e.currentTarget.getBoundingClientRect();
    const fromPool = !controller.boardCells().some((t) => t?.id === tileId);
    setDrag({
      tileId,
      x: e.clientX,
      y: e.clientY,
      offX: e.clientX - r.left,
      offY: e.clientY - r.top,
      homeX: r.left,
      homeY: r.top,
      fromPool,
    });
  };

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) =>
      setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
    const settle = () => {
      // A tap (no real movement) on a placed tile sends it home to the pool.
      const moved =
        Math.hypot(drag.x - (drag.homeX + drag.offX), drag.y - (drag.homeY + drag.offY)) > 6;

      // A real drag onto a legal cell commits — nothing to animate.
      if (moved && hover?.kind === "cell" && controller.placeOnCell(drag.tileId, hover.index)) {
        run.current.moves++;
        // Solved by this drop? Freeze the clock and pop the stats.
        if (controller.isSolved()) {
          setFinalStats({
            moves: run.current.moves,
            elapsedMs: performance.now() - (run.current.startedAt ?? performance.now()),
          });
          setStatsOpen(true);
        }
        setDrag(null);
        setHover(null);
        rerender();
        return;
      }

      // Otherwise the tile glides back to where it belongs:
      //  - to its pool slot if it's a pool tile, was dropped on the pool, or was
      //    a tap on a placed tile ("send home");
      //  - back to its original board cell if a board tile's move was rejected.
      const toPool = !moved || drag.fromPool || hover?.kind === "pool";
      if (toPool && !drag.fromPool) run.current.moves++; // a placed tile went home
      if (toPool) controller.returnToPool(drag.tileId);
      const slot = toPool ? slotRect(drag.tileId) : null;
      setReturning({
        tileId: drag.tileId,
        from: { x: drag.x - drag.offX, y: drag.y - drag.offY },
        to: slot ?? { x: drag.homeX, y: drag.homeY },
      });
      setDrag(null);
      setHover(null);
      rerender();
    };
    const drop = () => settle();
    const cancel = () => settle();
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", drop);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", drop);
      window.removeEventListener("pointercancel", cancel);
    };
  }, [drag, hover, controller]);

  // Hide the in-flight tile's pool slot while it's dragging or gliding back.
  const inFlightId = drag?.tileId ?? returning?.tileId ?? null;
  const dragTile = drag ? controller.tile(drag.tileId) : null;
  const hoverIndex = hover?.kind === "cell" ? hover.index : null;
  const solved = controller.isSolved();

  const clearDrag = () => {
    setDrag(null);
    setHover(null);
    setReturning(null);
  };
  const clearRun = () => {
    run.current = { moves: 0, startedAt: null };
    setStartedAt(null);
    setFinalStats(null);
    setStatsOpen(false);
  };
  // Reset clears the board but NOT the clock/moves — same attempt continues.
  const reset = () => {
    controller.reset();
    clearDrag();
    setFinalStats(null);
    setStatsOpen(false);
    rerender();
  };
  const newBoard = () => {
    setController(newController);
    clearDrag();
    clearRun();
  };

  return (
    // Full height (minus the body's p-4): the bar pins to the top and the game
    // centers in what's left, so bar→board space always equals pool→bottom
    // space (each = half the slack + 1rem of padding; mt-4 mirrors the body's
    // bottom padding).
    <div className="flex h-[calc(100dvh-2rem)] w-[min(92vw,24rem)] flex-col items-center">
      {/* top bar: back / timer / reset / new — in flow, so it can never overlap the board */}
      <div className="flex w-full items-center gap-2">
        <button onClick={onBack} className="btn-round" aria-label="Back to menu" title="Menu">
          ←
        </button>
        {/* keyed by run start so a new run remounts it back to 0:00 */}
        <Timer
          key={startedAt ?? -1}
          startedAt={startedAt}
          frozenMs={finalStats?.elapsedMs ?? null}
        />
        <button onClick={reset} className="btn-round" aria-label="Reset board" title="Reset board">
          ↺
        </button>
        <button onClick={newBoard} className="btn-round" aria-label="New puzzle" title="New puzzle">
          🎲
        </button>
      </div>

      {/* the game centers in the measured space below the bar */}
      <div className="game-area mt-4 w-full flex-1">
        <div className="game-inner flex h-full w-full flex-col items-center justify-center gap-3">
          <Board
            size={controller.size}
            cells={controller.boardCells()}
            draggingId={inFlightId}
            hoverIndex={hoverIndex}
            solved={solved}
            onTilePointerDown={startDrag}
            onCellHover={(index) => setHover(index === null ? null : { kind: "cell", index })}
          />

          {/* fixed height so swapping the label never nudges the board */}
          {/* width matches the board/pool panels so the button aligns with their right edge */}
          <div
            className="relative flex h-5 items-center justify-center"
            style={{
              width: `calc(var(--tile) * ${controller.size} + var(--gap) * ${controller.size + 1})`,
            }}
          >
            {solved && finalStats && (
              <button
                onClick={() => setStatsOpen(true)}
                className="btn absolute right-0 px-2 py-0.5 text-xs"
              >
                Stats
              </button>
            )}
            {solved ? (
              <span className="animate-pulse text-sm font-bold tracking-[0.3em] text-emerald-400">
                SOLVED 🎉
              </span>
            ) : (
              <span className="text-xs font-semibold tracking-[0.25em] text-neutral-500">
                TILE POOL
              </span>
            )}
          </div>

          <Pool
            size={controller.size}
            slots={controller.poolSlots()}
            draggingId={inFlightId}
            onTilePointerDown={startDrag}
            onHoverChange={(over) => setHover(over ? { kind: "pool" } : null)}
          />

          {drag && dragTile && (
            <div
              className="pointer-events-none fixed z-50"
              style={{ left: drag.x - drag.offX, top: drag.y - drag.offY }}
            >
              <Tile tile={dragTile} className="scale-105 shadow-2xl" />
            </div>
          )}

          {returning && controller.tile(returning.tileId) && (
            <SnapBack
              tile={controller.tile(returning.tileId)!}
              from={returning.from}
              to={returning.to}
              onDone={() => setReturning(null)}
            />
          )}

          <StatsDialog
            open={statsOpen && finalStats !== null}
            onClose={() => setStatsOpen(false)}
            rows={[
              ["Moves", finalStats?.moves ?? 0],
              ["Time", fmtDuration(finalStats?.elapsedMs ?? 0)],
            ]}
          />
        </div>
      </div>
    </div>
  );
}
