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
  className = "",
}: {
  tile: TileModel;
  onPointerDown?: (e: PointerEvent) => void;
  className?: string;
}) {
  const klass = ["tile", onPointerDown && "cursor-grab", className].filter(Boolean).join(" ");
  return (
    <div className={klass} onPointerDown={onPointerDown}>
      {SIDES.map((side) => (
        <Fragment key={side}>
          <div
            className={`tile__face tile__face--${side}`}
            style={{ background: `var(--color-digit-${tile[side]})` }}
          />
          <span className={`tile__digit tile__digit--${side}`}>{tile[side]}</span>
        </Fragment>
      ))}
    </div>
  );
}
