import type { PointerEvent } from "react";
import type { Tile as TileModel } from "../../core";
import { Tile } from "./Tile";
import { track } from "./panel";

// Presentational tile pool: a fixed n×n grid of home slots. slots[i] = the tile
// whose home is slot i, or null when that tile is on the board. Tiles never
// rearrange here — each returns to its own slot. Reports pointer hover so the
// view can drop a dragged tile back.
export function Pool({
  n,
  slots,
  draggingId,
  onTilePointerDown,
  onHoverChange,
}: {
  n: number;
  slots: readonly (TileModel | null)[];
  draggingId?: number | null;
  onTilePointerDown?: (tileId: number, e: PointerEvent) => void;
  onHoverChange?: (over: boolean) => void;
}) {
  return (
    <div
      className="panel grid"
      style={{ gridTemplateColumns: track(n), gridAutoRows: "var(--tile)" }}
      onPointerEnter={() => onHoverChange?.(true)}
      onPointerLeave={() => onHoverChange?.(false)}
    >
      {slots.map((tile, i) =>
        tile ? (
          <Tile
            key={i}
            tile={tile}
            className={draggingId === tile.id ? "opacity-30" : "hover:scale-105"}
            onPointerDown={(e) => onTilePointerDown?.(tile.id, e)}
          />
        ) : (
          <div key={i} className="bg-cell rounded" />
        ),
      )}
    </div>
  );
}
