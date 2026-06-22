import type { PointerEvent } from "react";
import type { Tile as TileModel } from "../../core";
import { Tile } from "./Tile";
import { track } from "./panel";

// Presentational n×n grid. cells[row*n + col] = placed tile, or null for empty.
// Reports which cell the pointer is over (onCellHover) so the view can resolve
// a drop, highlights the hovered cell, and glows when solved.
export function Board({
  n,
  cells,
  draggingId,
  hoverIndex,
  solved = false,
  onTilePointerDown,
  onCellHover,
}: {
  n: number;
  cells: readonly (TileModel | null)[];
  draggingId?: number | null;
  hoverIndex?: number | null;
  solved?: boolean;
  onTilePointerDown?: (tileId: number, e: PointerEvent) => void;
  onCellHover?: (index: number | null) => void;
}) {
  const glow = solved ? "ring-2 ring-emerald-400/80" : "";
  return (
    <div
      className={`panel grid ${glow} transition-shadow`}
      style={{ gridTemplateColumns: track(n), gridTemplateRows: track(n) }}
      onPointerLeave={() => onCellHover?.(null)}
    >
      {cells.map((tile, i) => (
        <div
          key={i}
          className={`bg-cell rounded ${hoverIndex === i ? "ring-accent ring-2" : ""}`}
          onPointerEnter={() => onCellHover?.(i)}
        >
          {tile && (
            <Tile
              tile={tile}
              className={`animate-[settle_140ms_ease-out] ${draggingId === tile.id ? "opacity-30" : ""}`}
              onPointerDown={(e) => onTilePointerDown?.(tile.id, e)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
