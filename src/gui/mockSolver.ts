import { Game, generateWithSolution } from "../game";
import type { Puzzle, Tile } from "../core";
import type { SolverEvent } from "../solvers";

// TEMPORARY MOCK so the solver view can be built and animated before the real
// solvers exist. It reuses the real board generator (which hands it the
// solution) and scripts a believable backtracking run toward that solution — it
// does NOT actually search. Once the real BacktrackingSolvers are implemented,
// swap mockSolverRun() for:
//   const solver = new SOLVERS[name](puzzle);
//   return { puzzle, run: () => solver.solve() };
// The view only depends on the SolverEvent stream, so nothing else changes.

export interface MockRun {
  puzzle: Puzzle;
  run: () => Generator<SolverEvent, boolean, void>; // fresh generator per call
}

export function mockSolverRun(size: number): MockRun {
  const { puzzle, solution } = generateWithSolution(size);

  function* run(): Generator<SolverEvent, boolean, void> {
    // A mirror model so scripted placements stay legal and decoys are real.
    const model = new Game(puzzle);

    for (let cell = 0; cell < solution.length; cell++) {
      const row = Math.floor(cell / size);
      const col = cell % size;
      const correct = solution[cell]!;

      // Candidates that don't fit here — tried and rejected.
      for (const decoy of illegalTiles(model, row, col, 2)) {
        yield { kind: "reject", row, col, tile: decoy };
      }

      // Occasionally take a wrong-but-legal turn, fail to extend into the next
      // cell, then backtrack out of it — that's what real backtracking looks
      // like: undo the most recent placement once it leads to a dead end.
      const wrong = legalButWrong(model, row, col, correct);
      if (wrong && col + 1 < size && Math.random() < 0.4) {
        model.place(row, col, wrong);
        yield { kind: "place", row, col, tile: wrong };
        for (const decoy of illegalTiles(model, row, col + 1, 3)) {
          yield { kind: "reject", row, col: col + 1, tile: decoy };
        }
        model.remove(row, col);
        yield { kind: "backtrack", row, col, tile: wrong };
      }

      model.place(row, col, correct);
      yield { kind: "place", row, col, tile: correct };
    }
    return true; // solved
  }

  return { puzzle, run };
}

// Up to `max` pooled tiles that can't legally sit at (row,col).
function illegalTiles(model: Game, row: number, col: number, max: number): Tile[] {
  const out: Tile[] = [];
  for (const t of model.pool()) {
    if (!model.isLegalMove(row, col, t)) {
      out.push(t);
      if (out.length === max) break;
    }
  }
  return out;
}

// A pooled tile that fits (row,col) by its edges but isn't the solution tile —
// the locally-valid wrong turn that later forces a backtrack.
function legalButWrong(model: Game, row: number, col: number, correct: Tile): Tile | null {
  for (const t of model.pool()) {
    if (t.id !== correct.id && model.isLegalMove(row, col, t)) return t;
  }
  return null;
}
