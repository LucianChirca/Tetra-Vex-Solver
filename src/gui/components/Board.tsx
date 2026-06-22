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
  // Solver feedback: a candidate the solver just tried in an (empty) cell. A
  // reject is drawn in place with a red outline then discarded on the next tick;
  // a backtrack shows the tile being pulled back out.
  flash?: { index: number; kind: "reject" | "backtrack"; tile: TileModel } | null;
  solved?: boolean;
  onTilePointerDown?: (tileId: number, e: PointerEvent) => void;
  onCellHover?: (index: number | null) => void;
}) {
  const glow = solved ? "ring-2 ring-emerald-400/80" : "";
  const attemptClass =
    flash?.kind === "reject"
      ? "animate-[tryout_240ms_ease-out] opacity-90 ring-2 ring-red-500"
      : "animate-[tryout_240ms_ease-out] opacity-50 ring-2 ring-amber-400";
  return (
    <div
      className={`panel grid grid-cols-[repeat(var(--size),var(--tile))] grid-rows-[repeat(var(--size),var(--tile))] ${glow} transition-shadow`}
      style={{ "--size": size } as CSSProperties}
      onPointerLeave={() => onCellHover?.(null)}
    >
      {cells.map((tile, i) => (
        <div
          key={i}
          className={`bg-cell rounded ${hoverIndex === i ? "ring-accent ring-2" : ""}`}
          onPointerEnter={() => onCellHover?.(i)}
        >
          {tile ? (
            <Tile
              tile={tile}
              className={`animate-[settle_150ms_ease-out] ${draggingId === tile.id ? "opacity-30" : ""}`}
              onPointerDown={onTilePointerDown ? (e) => onTilePointerDown(tile.id, e) : undefined}
            />
          ) : (
            // a tried-and-rejected (or backtracked) candidate, shown then dropped
            flash?.index === i && <Tile tile={flash.tile} className={attemptClass} />
          )}
        </div>
      ))}
    </div>
  );
}
