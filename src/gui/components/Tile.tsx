import { Fragment } from "react";
import type { PointerEvent } from "react";
import type { Tile as TileModel } from "../../core";

const SIDES = ["top", "right", "bottom", "left"] as const;

// Presentational tile: per side, a colored triangle face + its digit. Geometry
// (clip-paths, positions) lives in style.css; colors come from --color-digit-N.
// Interactive when given onPointerDown (custom drag — no native image ghost).
export function Tile({
  tile,
  onPointerDown,
  onDoubleClick,
  dragging = false,
}: {
  tile: TileModel;
  onPointerDown?: (e: PointerEvent) => void;
  onDoubleClick?: () => void;
  dragging?: boolean;
}) {
  const klass = ["tile", onPointerDown && "cursor-grab", dragging && "opacity-30"]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={klass} onPointerDown={onPointerDown} onDoubleClick={onDoubleClick}>
      {SIDES.map((side) => (
        <Fragment key={side}>
          <div
            className={`face face-${side}`}
            style={{ background: `var(--color-digit-${tile[side]})` }}
          />
          <span className={`digit digit-${side}`}>{tile[side]}</span>
        </Fragment>
      ))}
    </div>
  );
}
