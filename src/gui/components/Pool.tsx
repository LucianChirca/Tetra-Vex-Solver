import type { CSSProperties, PointerEvent } from "react";
import type { Tile as TileModel } from "../../core";
import { Tile } from "./Tile";

// Presentational tile pool: a fixed size×size grid of home slots. slots[i] = the
// tile whose home is slot i, or null when that tile is on the board. Tiles never
// rearrange here — each returns to its own slot. Reports pointer hover so the
// view can drop a dragged tile back.
export function Pool({
  size,
  slots,
  draggingId,
  highlightIds,
  onTilePointerDown,
  onHoverChange,
}: {
  size: number;
  slots: readonly (TileModel | null)[];
  draggingId?: number | null;
  // Solver feedback: tiles the solver is currently considering (ringed).
  highlightIds?: ReadonlySet<number>;
  onTilePointerDown?: (tileId: number, e: PointerEvent) => void;
  onHoverChange?: (over: boolean) => void;
}) {
  return (
    <div
      className="panel panel-grid grid auto-rows-[var(--tile)] grid-cols-[repeat(var(--size),var(--tile))]"
      style={{ "--size": size } as CSSProperties}
      onPointerEnter={() => onHoverChange?.(true)}
      onPointerLeave={() => onHoverChange?.(false)}
    >
      {/* data-slot anchors each home slot so a returned tile can glide back to it */}
      {slots.map((tile, i) => (
        <div key={i} data-slot={i} className="bg-cell rounded">
          {tile && (
            <Tile
              tile={tile}
              className={`${
                draggingId === tile.id ? "opacity-30" : onTilePointerDown ? "hover:scale-105" : ""
              } ${highlightIds?.has(tile.id) ? "ring-accent ring-2 ring-inset" : ""}`}
              onPointerDown={onTilePointerDown ? (e) => onTilePointerDown(tile.id, e) : undefined}
            />
          )}
        </div>
      ))}
    </div>
  );
}
