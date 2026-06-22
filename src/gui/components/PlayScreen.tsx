import { useEffect, useReducer, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Board } from "./Board";
import { Pool } from "./Pool";
import { Tile } from "./Tile";
import { SnapBack } from "./SnapBack";
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
export function PlayScreen({ newController }: { newController: () => PlayController }) {
  const [, rerender] = useReducer((v) => v + 1, 0);
  const [controller, setController] = useState(newController);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [hover, setHover] = useState<Hover>(null);
  const [returning, setReturning] = useState<Returning | null>(null);

  const startDrag = (tileId: number, e: ReactPointerEvent) => {
    e.preventDefault();
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
  const reset = () => {
    controller.reset();
    clearDrag();
    rerender();
  };
  const newBoard = () => {
    setController(newController);
    clearDrag();
  };

  return (
    <div className="flex w-[min(92vw,24rem)] flex-col items-center gap-5">
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
      <div className="flex h-5 items-center">
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

      {/* fixed-height footer so Play and Solve occupy the same space — toggling
          modes swaps the content without shifting the chrome above */}
      <div className="flex min-h-20 flex-col items-center justify-start">
        <div className="flex gap-3">
          <button onClick={newBoard} className="btn">
            New
          </button>
          <button onClick={reset} className="btn">
            Reset
          </button>
        </div>
      </div>

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
    </div>
  );
}
