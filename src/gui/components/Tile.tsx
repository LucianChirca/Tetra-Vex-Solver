import { Fragment } from "react";
import type { Tile as TileModel } from "../../core";

const SIDES = ["top", "right", "bottom", "left"] as const;

// Triangle face per side (point meets center) + where its digit sits.
const FACE_CLIP = {
  top: "[clip-path:polygon(0_0,100%_0,50%_50%)]",
  right: "[clip-path:polygon(100%_0,100%_100%,50%_50%)]",
  bottom: "[clip-path:polygon(100%_100%,0_100%,50%_50%)]",
  left: "[clip-path:polygon(0_100%,0_0,50%_50%)]",
} as const;
const DIGIT_POS = {
  top: "left-1/2 top-[18%]",
  right: "left-[82%] top-1/2",
  bottom: "left-1/2 top-[82%]",
  left: "left-[18%] top-1/2",
} as const;

// Presentational tile: per side, a colored triangle face + its digit (digits
// ride on top via z-10, so face paint order doesn't matter). Colors come from
// --color-digit-N in style.css.
export function Tile({ tile, draggable = false }: { tile: TileModel; draggable?: boolean }) {
  return (
    <div
      className="relative h-24 w-24 overflow-hidden rounded transition-transform"
      draggable={draggable}
    >
      {SIDES.map((s) => (
        <Fragment key={s}>
          <div
            className={`absolute inset-0 ${FACE_CLIP[s]}`}
            style={{ background: `var(--color-digit-${tile[s]})` }}
          />
          <span
            className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 font-bold text-white ${DIGIT_POS[s]}`}
          >
            {tile[s]}
          </span>
        </Fragment>
      ))}
    </div>
  );
}
