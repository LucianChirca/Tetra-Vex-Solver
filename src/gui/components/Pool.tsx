import type { PointerEvent } from "react";
import type { Tile as TileModel } from "../../core";
import { Tile } from "./Tile";
import { PANEL, track } from "./panel";

// Presentational tile pool: a fixed n×n grid of home slots. slots[i] = the tile
// whose home is slot i, or null when that tile is on the board. Tiles never
// rearrange here — each returns to its own slot. Reports pointer hover so the
// view can drop a dragged tile back.
export function Pool({
  n,
  slots,
  draggingId,
  onTilePointerDown,
  onTileDoubleClick,
  onHoverChange,
}: {
  n: number;
  slots: readonly (TileModel | null)[];
  draggingId?: number | null;
  onTilePointerDown?: (tileId: number, e: PointerEvent) => void;
  onTileDoubleClick?: (tileId: number) => void;
  onHoverChange?: (over: boolean) => void;
}) {
  return (
    <div
      className={`grid ${PANEL}`}
      style={{ gridTemplateColumns: track(n) }}
      onPointerEnter={() => onHoverChange?.(true)}
      onPointerLeave={() => onHoverChange?.(false)}
    >
      {slots.map((tile, i) =>
        tile ? (
          <Tile
            key={i}
            tile={tile}
            dragging={draggingId === tile.id}
            onPointerDown={(e) => onTilePointerDown?.(tile.id, e)}
            onDoubleClick={() => onTileDoubleClick?.(tile.id)}
          />
        ) : (
          <div key={i} className="bg-cell h-24 w-24 rounded" />
        ),
      )}
    </div>
  );
}
