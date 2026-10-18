import { describe, expect, it } from 'vitest';
import { fromValues, isHeap, pop, push } from './logic';

function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

describe('binary min-heap', () => {
  it('keeps the heap property after every push', () => {
    const random = seeded(3);
    let heap = fromValues([]);
    for (let i = 0; i < 50; i++) {
      heap = push(heap, Math.floor(random() * 100)).at(-1)!.items;
      expect(isHeap(heap)).toBe(true);
    }
  });

  it('pops values in ascending order (heap sort)', () => {
    const random = seeded(8);
    const values = Array.from({ length: 40 }, () => Math.floor(random() * 100));
    let heap = fromValues(values);
    const out: number[] = [];
    while (heap.length) {
      const frames = pop(heap);
      const last = frames.at(-1)!;
      out.push(last.taken!.value);
      heap = last.items;
      expect(isHeap(heap)).toBe(true);
    }
    expect(out).toEqual([...values].sort((a, b) => a - b));
  });

  it('handles popping from an empty or single-item heap', () => {
    expect(pop([]).at(-1)!.items).toEqual([]);
    const single = fromValues([7]);
    const last = pop(single).at(-1)!;
    expect(last.taken!.value).toBe(7);
    expect(last.items).toEqual([]);
  });

  it('does not mutate the input heap', () => {
    const heap = fromValues([5, 3, 8]);
    const copy = heap.map((h) => ({ ...h }));
    push(heap, 1);
    pop(heap);
    expect(heap).toEqual(copy);
  });
});
