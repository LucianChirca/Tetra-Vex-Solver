import type { PointerEvent } from "react";
import type { Tile as TileModel } from "../../core";
import { Tile } from "./Tile";
import { PANEL, track } from "./panel";

// Presentational n×n grid. cells[row*n + col] = placed tile, or null for empty.
// Reports which cell the pointer is over (onCellHover) so the view can resolve
// a drop; drag itself is the view's job.
export function Board({
  n,
  cells,
  draggingId,
  onTilePointerDown,
  onCellHover,
}: {
  n: number;
  cells: readonly (TileModel | null)[];
  draggingId?: number | null;
  onTilePointerDown?: (tileId: number, e: PointerEvent) => void;
  onCellHover?: (index: number | null) => void;
}) {
  return (
    <div
      className={`grid ${PANEL}`}
      style={{ gridTemplateColumns: track(n), gridTemplateRows: track(n) }}
      onPointerLeave={() => onCellHover?.(null)}
    >
      {cells.map((tile, i) => (
        <div key={i} className="bg-cell rounded" onPointerEnter={() => onCellHover?.(i)}>
          {tile && (
            <Tile
              tile={tile}
              dragging={draggingId === tile.id}
              onPointerDown={(e) => onTilePointerDown?.(tile.id, e)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
