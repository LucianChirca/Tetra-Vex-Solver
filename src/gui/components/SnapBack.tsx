import { useEffect, useState } from "react";
import { Tile } from "./Tile";
import type { Tile as TileModel } from "../../core";

// A rejected/returned tile gliding from the drop point back to its pool slot,
// then unmounting (onDone). Mounts at `from`, then transitions to `to`.
export function SnapBack({
  tile,
  from,
  to,
  onDone,
}: {
  tile: TileModel;
  from: { x: number; y: number };
  to: { x: number; y: number };
  onDone: () => void;
}) {
  const [pos, setPos] = useState(from);
  useEffect(() => {
    const id = requestAnimationFrame(() => setPos(to));
    return () => cancelAnimationFrame(id);
  }, [to]);
  return (
    <div
      className="pointer-events-none fixed z-50 transition-all duration-200 ease-out"
      style={{ left: pos.x, top: pos.y }}
      onTransitionEnd={onDone}
    >
      <Tile tile={tile} />
    </div>
  );
}
