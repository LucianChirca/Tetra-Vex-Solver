import type { ReactNode } from "react";

// The strip between board and pool: idle content until solved, then a pulsing
// SOLVED banner plus a Stats button aligned to the panels' right edge.
// Geometry (.status-row height, .panel-w width) lives in style.css next to the
// tile-sizing formula that subtracts it.
export function StatusRow({
  solved,
  onStats,
  children,
}: {
  solved: boolean;
  onStats?: () => void; // omit to hide the Stats button
  children: ReactNode; // idle content, shown until solved
}) {
  return (
    <div className="status-row panel-w relative flex items-center justify-center">
      {solved ? (
        <>
          <span className="animate-pulse text-sm font-bold tracking-[0.3em] text-emerald-400">
            SOLVED 🎉
          </span>
          {onStats && (
            <button onClick={onStats} className="btn absolute right-0 px-2 py-0.5 text-xs">
              Stats
            </button>
          )}
        </>
      ) : (
        children
      )}
    </div>
  );
}
