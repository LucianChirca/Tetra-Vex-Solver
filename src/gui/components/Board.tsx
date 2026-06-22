import type { Tile as TileModel } from "../../core";
import { Tile } from "./Tile";
import { PANEL } from "./panel";

// Presentational n×n grid. cells[row*n + col] = placed tile, or null for empty.
export function Board({ n, cells }: { n: number; cells: readonly (TileModel | null)[] }) {
  const track = `repeat(${n}, 6rem)`;
  return (
    <div className={`grid ${PANEL}`} style={{ gridTemplateColumns: track, gridTemplateRows: track }}>
      {cells.map((tile, i) => (
        <div key={i} className="bg-cell rounded">
          {tile && <Tile tile={tile} />}
        </div>
      ))}
    </div>
  );
}
