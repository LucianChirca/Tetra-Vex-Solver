import { useEffect, useReducer, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Board } from "./Board";
import { Pool } from "./Pool";
import { Tile } from "./Tile";
import type { PlayController } from "../controllers/playController";

// Cursor position + the grab offset, so the floating tile tracks the mouse from
// wherever it was picked up.
type Drag = { tileId: number; x: number; y: number; offX: number; offY: number };
// Which drop target the pointer is currently over, reported by Board/Pool.
type Hover = { kind: "cell"; index: number } | { kind: "pool" } | null;

// Composes Board + Pool and owns the human's input: a custom pointer drag (the
// tile follows the cursor — no native drag image) plus double-click recall.
// Board/Pool report hover; on release we resolve against the controller, which
// owns all the move semantics (place, swap, return, recall).
export function PlayScreen({ controller }: { controller: PlayController }) {
  const [, rerender] = useReducer((v) => v + 1, 0);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [hover, setHover] = useState<Hover>(null);

  const startDrag = (tileId: number, e: ReactPointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    setDrag({
      tileId,
      x: e.clientX,
      y: e.clientY,
      offX: e.clientX - r.left,
      offY: e.clientY - r.top,
    });
  };

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) =>
      setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
    const drop = () => {
      if (hover?.kind === "cell") controller.placeOnCell(drag.tileId, hover.index);
      else controller.returnToPool(drag.tileId); // pool, or released outside
      setDrag(null);
      setHover(null);
      rerender();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", drop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", drop);
    };
  }, [drag, hover, controller]);

  const draggingId = drag?.tileId ?? null;
  const dragTile = drag ? controller.tile(drag.tileId) : null;

  return (
    <div className="flex flex-col items-center gap-5">
      <Board
        n={controller.n}
        cells={controller.boardCells()}
        draggingId={draggingId}
        onTilePointerDown={startDrag}
        onCellHover={(index) => setHover(index === null ? null : { kind: "cell", index })}
      />
      <span className="text-xs font-semibold tracking-[0.25em] text-neutral-500">TILE POOL</span>
      <Pool
        n={controller.n}
        slots={controller.poolSlots()}
        draggingId={draggingId}
        onTilePointerDown={startDrag}
        onTileDoubleClick={(id) => {
          controller.recallToBoard(id);
          rerender();
        }}
        onHoverChange={(over) => setHover(over ? { kind: "pool" } : null)}
      />
      {drag && dragTile && (
        <div
          className="pointer-events-none fixed z-50"
          style={{ left: drag.x - drag.offX, top: drag.y - drag.offY }}
        >
          <Tile tile={dragTile} />
        </div>
      )}
    </div>
  );
}
