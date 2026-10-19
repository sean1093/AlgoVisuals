/**
 * Edit distance (Levenshtein): fill a table where each cell is the cost of turning one prefix into another
 */

export type Op = 'keep' | 'replace' | 'insert' | 'delete';

export interface EditFrame {
  /** Cells filled so far, row by row; null = not yet */
  table: (number | null)[][];
  /** Cell being filled */
  cell?: [number, number];
  /** Neighbour the value came from */
  from?: [number, number][];
  /** Cells on the traced-back path */
  path?: [number, number][];
  /** Edit script found so far (traceback), in word order */
  ops?: { op: Op; a?: string; b?: string }[];
  note: string;
}

/**
 * Plain-language step descriptions; English by default, swapped for a translation by the UI
 */
export const EDIT_MESSAGES = {
  edges: 'First row and column: turning a word into nothing (or nothing into a word) takes one edit per letter.',
  match: (a: string, v: number) => `Both letters are “${a}”, so no edit is needed: copy the diagonal, ${v}.`,
  differ: (a: string, b: string, v: number) => `“${a}” vs “${b}”: one edit plus the cheapest neighbour (replace ↖, delete ↑, insert ←) = ${v}.`,
  filled: (v: number) => `The bottom-right corner holds the answer: ${v} edit(s). Now trace back how we got there.`,
  trace: 'Each step back follows the neighbour this cell was built from.',
  done: (v: number) => `Done: ${v} edit(s) turn one word into the other.`,
};

export type EditMessages = typeof EDIT_MESSAGES;

export function editDistance(a: string, b: string, m: EditMessages = EDIT_MESSAGES): EditFrame[] {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  const shown: (number | null)[][] = Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => (i === 0 || j === 0 ? d[i][j] : null)));
  const copy = () => shown.map((r) => [...r]);
  const frames: EditFrame[] = [{ table: copy(), note: m.edges }];

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      if (a[i - 1] === b[j - 1]) {
        d[i][j] = d[i - 1][j - 1];
        shown[i][j] = d[i][j];
        frames.push({ table: copy(), cell: [i, j], from: [[i - 1, j - 1]], note: m.match(a[i - 1], d[i][j]) });
      } else {
        const best = Math.min(d[i - 1][j - 1], d[i - 1][j], d[i][j - 1]);
        d[i][j] = best + 1;
        shown[i][j] = d[i][j];
        const from: [number, number][] = [
          [i - 1, j - 1],
          [i - 1, j],
          [i, j - 1],
        ];
        frames.push({ table: copy(), cell: [i, j], from: from.filter(([r, c]) => d[r][c] === best), note: m.differ(a[i - 1], b[j - 1], d[i][j]) });
      }
    }
  }
  const total = d[rows - 1][cols - 1];
  frames.push({ table: copy(), cell: [rows - 1, cols - 1], path: [[rows - 1, cols - 1]], ops: [], note: m.filled(total) });

  // Trace back, preferring keep/replace, then delete, then insert
  let i = rows - 1;
  let j = cols - 1;
  const path: [number, number][] = [[i, j]];
  const ops: { op: Op; a?: string; b?: string }[] = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && d[i][j] === d[i - 1][j - 1]) {
      ops.unshift({ op: 'keep', a: a[i - 1], b: b[j - 1] });
      i--;
      j--;
    } else if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + 1) {
      ops.unshift({ op: 'replace', a: a[i - 1], b: b[j - 1] });
      i--;
      j--;
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
      ops.unshift({ op: 'delete', a: a[i - 1] });
      i--;
    } else {
      ops.unshift({ op: 'insert', b: b[j - 1] });
      j--;
    }
    path.push([i, j]);
    frames.push({ table: copy(), path: [...path], ops: [...ops], note: m.trace });
  }
  frames.push({ table: copy(), path, ops, note: m.done(total) });
  return frames;
}
