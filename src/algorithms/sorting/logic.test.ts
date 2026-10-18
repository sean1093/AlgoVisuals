import { describe, expect, it } from 'vitest';
import { INPUT_SHAPES, SORTERS, SortAlgorithm, makeInput } from './logic';

// Small deterministic PRNG so failures are reproducible
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const ALGORITHMS = Object.keys(SORTERS) as SortAlgorithm[];

describe('sorting algorithms', () => {
  for (const algo of ALGORITHMS) {
    describe(algo, () => {
      it('sorts every input shape and size', () => {
        const random = seeded(42);
        for (const id of INPUT_SHAPES) {
          for (const size of [1, 2, 3, 8, 25, 40]) {
            const input = makeInput(size, id, random);
            const frames = SORTERS[algo](input);
            const last = frames[frames.length - 1];
            expect(last.array).toEqual([...input].sort((a, b) => a - b));
            expect(last.sorted.length).toBe(size);
          }
        }
      });

      // Merge sort copies from a buffer, so mid-merge frames briefly repeat values
      it.skipIf(algo === 'merge')('never changes the multiset of values in any frame', () => {
        const input = makeInput(20, 'random', seeded(7));
        const expected = [...input].sort((a, b) => a - b);
        for (const frame of SORTERS[algo](input)) {
          expect([...frame.array].sort((a, b) => a - b)).toEqual(expected);
        }
      });

      it('does not mutate its input and counts monotonically', () => {
        const input = makeInput(15, 'reversed', seeded(1));
        const copy = [...input];
        const frames = SORTERS[algo](input);
        expect(input).toEqual(copy);
        for (let i = 1; i < frames.length; i++) {
          expect(frames[i].comparisons).toBeGreaterThanOrEqual(frames[i - 1].comparisons);
          expect(frames[i].writes).toBeGreaterThanOrEqual(frames[i - 1].writes);
          expect(frames[i].note.length).toBeGreaterThan(0);
        }
      });
    });
  }

  it('merge sort keeps the array length in every frame', () => {
    const input = makeInput(20, 'random', seeded(7));
    for (const frame of SORTERS.merge(input)) expect(frame.array).toHaveLength(20);
  });

  it('bubble sort stops early on already sorted input', () => {
    const sorted = [1, 2, 3, 4, 5, 6, 7, 8];
    const last = SORTERS.bubble(sorted)[SORTERS.bubble(sorted).length - 1];
    expect(last.comparisons).toBe(sorted.length - 1);
    expect(last.writes).toBe(0);
  });

  it('marks quick sort pivots as final only when they truly are', () => {
    const input = makeInput(30, 'random', seeded(3));
    const target = [...input].sort((a, b) => a - b);
    for (const frame of SORTERS.quick(input)) {
      for (const i of frame.sorted) expect(frame.array[i]).toBe(target[i]);
    }
  });
});
