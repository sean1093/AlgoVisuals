import { describe, expect, it } from 'vitest';
import { BSTNode, build, contains, height, inOrder, insert, remove, search, size } from './logic';

function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function isBST(node: BSTNode | null, lo = -Infinity, hi = Infinity): boolean {
  if (!node) return true;
  return node.value > lo && node.value < hi && isBST(node.left, lo, node.value) && isBST(node.right, node.value, hi);
}

describe('binary search tree', () => {
  it('insert keeps order and ignores duplicates', () => {
    const root = build([50, 30, 70, 20, 40, 60, 80, 30]);
    expect(inOrder(root)).toEqual([20, 30, 40, 50, 60, 70, 80]);
    expect(isBST(root)).toBe(true);
    expect(height(root)).toBe(3);
  });

  it('sorted input makes a tall, list-like tree', () => {
    const root = build([1, 2, 3, 4, 5, 6, 7]);
    expect(height(root)).toBe(7);
  });

  it('search finds present values and reports the trail', () => {
    const root = build([50, 30, 70, 20, 40]);
    const last = search(root, 40).at(-1)!;
    expect(last.done).toBeDefined();
    expect(last.trail).toHaveLength(3);
    expect(search(root, 45).at(-1)!.done).toBeUndefined();
  });

  it('remove handles leaves, one child and two children on random trees', () => {
    const random = seeded(11);
    for (let t = 0; t < 30; t++) {
      const values = Array.from({ length: 20 }, () => 1 + Math.floor(random() * 99));
      let root = build(values);
      const expected = new Set(values);
      for (const v of values.slice(0, 12)) {
        const frames = remove(root, v);
        root = frames.at(-1)!.root;
        expected.delete(v);
        expect(isBST(root)).toBe(true);
        expect(contains(root, v)).toBe(false);
        expect(inOrder(root)).toEqual([...expected].sort((a, b) => a - b));
        // Earlier frames are untouched snapshots
        for (const f of frames) expect(isBST(f.root)).toBe(true);
      }
      expect(size(root)).toBe(expected.size);
    }
  });

  it('removing a missing value changes nothing', () => {
    const root = build([5, 3, 8]);
    expect(inOrder(remove(root, 42).at(-1)!.root)).toEqual([3, 5, 8]);
  });

  it('inserting does not mutate the previous tree', () => {
    const root = build([5, 3, 8]);
    insert(root, 4);
    expect(inOrder(root)).toEqual([3, 5, 8]);
  });
});
