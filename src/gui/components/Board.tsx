import type { CSSProperties, PointerEvent } from "react";
import type { Tile as TileModel } from "../../core";
import { Tile } from "./Tile";

// Presentational size×size grid. cells[row*size + col] = placed tile, or null
// for empty. Reports which cell the pointer is over (onCellHover) so the view
// can resolve a drop, highlights the hovered cell, and glows when solved.
export function Board({
  size,
  cells,
  draggingId,
  hoverIndex,
  flash,
  solved = false,
  onTilePointerDown,
  onCellHover,
}: {
  size: number;
  cells: readonly (TileModel | null)[];
  draggingId?: number | null;
  hoverIndex?: number | null;
  // Solver feedback: briefly ring a cell when a candidate is rejected or undone.
  flash?: { index: number; kind: "reject" | "backtrack" } | null;
  solved?: boolean;
  onTilePointerDown?: (tileId: number, e: PointerEvent) => void;
  onCellHover?: (index: number | null) => void;
}) {
  const glow = solved ? "ring-2 ring-emerald-400/80" : "";
  const flashRing = (i: number) =>
    flash?.index === i
      ? flash.kind === "reject"
        ? "ring-2 ring-red-500 animate-[flash_300ms_ease-out]"
        : "ring-2 ring-amber-400 animate-[flash_300ms_ease-out]"
      : "";
  return (
    <div
      className={`panel grid grid-cols-[repeat(var(--size),var(--tile))] grid-rows-[repeat(var(--size),var(--tile))] ${glow} transition-shadow`}
      style={{ "--size": size } as CSSProperties}
      onPointerLeave={() => onCellHover?.(null)}
    >
      {cells.map((tile, i) => (
        <div
          key={i}
          className={`bg-cell rounded ${hoverIndex === i ? "ring-accent ring-2" : ""} ${flashRing(i)}`}
          onPointerEnter={() => onCellHover?.(i)}
        >
          {tile && (
            <Tile
              tile={tile}
              className={`animate-[settle_170ms_cubic-bezier(0.16,1,0.3,1)] ${draggingId === tile.id ? "opacity-30" : ""}`}
              onPointerDown={(e) => onTilePointerDown?.(tile.id, e)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
