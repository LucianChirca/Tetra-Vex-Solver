import { useEffect, useRef } from "react";

// End-of-run stats modal, shared by the play and solver screens. Native
// <dialog>: Esc closes, focus is trapped, ::backdrop dims the page.
export function StatsDialog({
  open,
  rows,
  onClose,
}: {
  open: boolean;
  rows: readonly (readonly [string, string | number])[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label="Final stats"
      // <dialog> doesn't inherit the page's text color — set it explicitly.
      className="panel m-auto w-[min(20rem,92vw)] text-neutral-200 shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      {/* padding lives here — the panel class's own p-1.5 can't be trusted to lose */}
      <div className="flex flex-col gap-6 p-6">
        <h2 className="text-center text-xl font-bold tracking-[0.3em] text-neutral-100">STATS</h2>
        <dl className="flex flex-col font-mono text-sm">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="border-panel-border flex items-baseline justify-between gap-6 border-b py-2.5 last:border-b-0"
            >
              <dt className="text-neutral-500">{label}</dt>
              <dd className="font-semibold text-neutral-100">{value}</dd>
            </div>
          ))}
        </dl>
        <button className="btn" onClick={onClose}>
          Close
        </button>
      </div>
    </dialog>
  );
}
