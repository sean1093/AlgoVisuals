/**
 * N-Queens by backtracking: one queen per row, undo when a row has no safe square
 */

export interface QueensFrame {
  /** Column of the queen in each row placed so far */
  queens: number[];
  /** Square being tried */
  trying?: [number, number];
  /** The queen that attacks the tried square */
  attacker?: [number, number];
  solved?: boolean;
  placed: number;
  backtracks: number;
  note: string;
}

/**
 * Plain-language step descriptions; English by default, swapped for a translation by the UI.
 * Rows and columns are counted from 1 in the text.
 */
export const QUEENS_MESSAGES = {
  start: (n: number) => `Place ${n} queens so none can attack another. Start with the first row.`,
  attacked: (row: number, col: number) => `Attacked by the queen in row ${row}, column ${col}. Try the next square.`,
  place: (row: number, col: number) => `Row ${row}, column ${col} is safe — place a queen and move to the next row.`,
  backtrack: (row: number) => `No safe square left in row ${row}. Back up and move the queen above.`,
  solved: (n: number) => `All ${n} queens placed — no two share a row, column or diagonal!`,
  impossible: (n: number) => `Every option was tried: ${n} queens can’t fit on this board.`,
};

export type QueensMessages = typeof QUEENS_MESSAGES;

export function attackerOf(queens: number[], row: number, col: number): [number, number] | undefined {
  for (let r = 0; r < queens.length && r < row; r++) {
    const c = queens[r];
    if (c === col || Math.abs(c - col) === row - r) return [r, c];
  }
  return undefined;
}

export function solveQueens(n: number, m: QueensMessages = QUEENS_MESSAGES, limit = 4000): QueensFrame[] {
  const queens: number[] = [];
  let placed = 0;
  let backtracks = 0;
  const frames: QueensFrame[] = [{ queens: [], placed, backtracks, note: m.start(n) }];
  const snap = (f: Omit<QueensFrame, 'queens' | 'placed' | 'backtracks'>) => frames.push({ queens: [...queens], placed, backtracks, ...f });

  const solve = (row: number): boolean => {
    if (row === n) return true;
    for (let col = 0; col < n; col++) {
      if (frames.length > limit) return false;
      const hit = attackerOf(queens, row, col);
      if (hit) {
        snap({ trying: [row, col], attacker: hit, note: m.attacked(hit[0] + 1, hit[1] + 1) });
        continue;
      }
      queens.push(col);
      placed++;
      snap({ trying: [row, col], note: m.place(row + 1, col + 1) });
      if (solve(row + 1)) return true;
      queens.pop();
      backtracks++;
    }
    if (row > 0) snap({ note: m.backtrack(row + 1) });
    return false;
  };
  const ok = solve(0);
  snap(ok ? { solved: true, note: m.solved(n) } : { note: m.impossible(n) });
  return frames;
}
