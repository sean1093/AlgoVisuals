import { describe, expect, it } from 'vitest';
import { fib, plainCalls } from './fib';
import { editDistance } from './editDistance';
import { attackerOf, solveQueens } from './queens';

describe('fibonacci', () => {
  it('computes the right value both ways', () => {
    const values = [0, 1, 1, 2, 3, 5, 8, 13];
    for (let n = 0; n < values.length; n++) {
      expect(fib(n, false).at(-1)!.calls[0].value).toBe(values[n]);
      expect(fib(n, true).at(-1)!.calls[0].value).toBe(values[n]);
    }
  });

  it('memo makes far fewer calls', () => {
    expect(fib(6, false).at(-1)!.calls).toHaveLength(plainCalls(6));
    expect(plainCalls(6)).toBe(25);
    expect(fib(6, true).at(-1)!.calls).toHaveLength(11); // 2n - 1
  });

  it('marks repeated work in plain recursion', () => {
    const calls = fib(5, false).at(-1)!.calls;
    expect(calls.some((c) => c.repeat)).toBe(true);
    expect(fib(5, true).at(-1)!.calls.some((c) => c.memo)).toBe(true);
  });
});

describe('edit distance', () => {
  const cases: [string, string, number][] = [
    ['kitten', 'sitting', 3],
    ['flaw', 'lawn', 2],
    ['', 'abc', 3],
    ['same', 'same', 0],
    ['horse', 'ros', 3],
  ];
  it.each(cases)('%s → %s = %i', (a, b, want) => {
    const last = editDistance(a, b).at(-1)!;
    expect(last.table[a.length][b.length]).toBe(want);
    const ops = last.ops!;
    expect(ops.filter((o) => o.op !== 'keep')).toHaveLength(want);
    // Applying the script really turns a into b
    expect(ops.filter((o) => o.op !== 'delete').map((o) => o.b).join('')).toBe(b);
    expect(ops.filter((o) => o.op !== 'insert').map((o) => o.a).join('')).toBe(a);
  });
});

describe('n-queens', () => {
  it.each([4, 5, 6, 7, 8])('solves %i queens', (n) => {
    const last = solveQueens(n).at(-1)!;
    expect(last.solved).toBe(true);
    expect(last.queens).toHaveLength(n);
    last.queens.forEach((c, r) => expect(attackerOf(last.queens.slice(0, r), r, c)).toBeUndefined());
  });

  it('reports when no solution exists', () => {
    expect(solveQueens(3).at(-1)!.solved).toBeUndefined();
  });

  it('backtracks on the way', () => {
    expect(solveQueens(6).at(-1)!.backtracks).toBeGreaterThan(0);
  });
});
