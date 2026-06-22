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
  onTilePointerDown,
  onHoverChange,
}: {
  size: number;
  slots: readonly (TileModel | null)[];
  draggingId?: number | null;
  onTilePointerDown?: (tileId: number, e: PointerEvent) => void;
  onHoverChange?: (over: boolean) => void;
}) {
  return (
    <div
      className="panel grid grid-cols-[repeat(var(--size),var(--tile))] auto-rows-[var(--tile)]"
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
              className={draggingId === tile.id ? "opacity-30" : "hover:scale-105"}
              onPointerDown={(e) => onTilePointerDown?.(tile.id, e)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
