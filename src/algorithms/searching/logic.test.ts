import { describe, expect, it } from 'vitest';
import { binarySearch, linearSearch, makeSortedList, shuffle } from './logic';

function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

describe('linear search', () => {
  it('finds every element at its index', () => {
    const list = shuffle(makeSortedList(20, seeded(1)), seeded(2));
    list.forEach((value, i) => {
      const last = linearSearch(list, value).at(-1)!;
      expect(last.found).toBe(i);
      expect(last.checks).toBe(i + 1);
    });
  });

  it('reports a missing value after checking everything', () => {
    const last = linearSearch([3, 1, 2], 9).at(-1)!;
    expect(last.missing).toBe(true);
    expect(last.checks).toBe(3);
  });
});

describe('binary search', () => {
  it('finds every element within ⌊log2 n⌋ + 1 checks', () => {
    for (const size of [1, 2, 7, 15, 31, 50]) {
      const list = makeSortedList(size, seeded(size));
      const limit = Math.floor(Math.log2(list.length)) + 1;
      list.forEach((value, i) => {
        const last = binarySearch(list, value).at(-1)!;
        expect(last.found).toBe(i);
        expect(last.checks).toBeLessThanOrEqual(limit);
      });
    }
  });

  it('reports missing values (below, between and above the list)', () => {
    const list = [10, 20, 30, 40, 50];
    for (const target of [5, 25, 55]) {
      const last = binarySearch(list, target).at(-1)!;
      expect(last.missing).toBe(true);
      expect(last.found).toBeUndefined();
    }
  });

  it('never eliminates the index that holds the target', () => {
    const list = makeSortedList(40, seeded(9));
    list.forEach((value, i) => {
      for (const frame of binarySearch(list, value)) expect(frame.eliminated).not.toContain(i);
    });
  });
});

describe('makeSortedList', () => {
  it('returns distinct, sorted values', () => {
    const list = makeSortedList(30, seeded(4));
    expect(list).toHaveLength(30);
    expect(new Set(list).size).toBe(30);
    expect([...list].sort((a, b) => a - b)).toEqual(list);
  });
});
