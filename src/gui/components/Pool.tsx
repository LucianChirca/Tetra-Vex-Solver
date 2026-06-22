import type { Tile as TileModel } from "../../core";
import { Tile } from "./Tile";
import { PANEL } from "./panel";

// Presentational tile pool: the draggable source tiles not yet placed.
export function Pool({ tiles }: { tiles: readonly TileModel[] }) {
  return (
    <div className={`flex flex-wrap max-w-[19.5rem] ${PANEL}`}>
      {tiles.map((t) => (
        <Tile key={t.id} tile={t} draggable />
      ))}
    </div>
  );
}
