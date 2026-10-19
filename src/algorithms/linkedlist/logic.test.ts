import { describe, expect, it } from 'vitest';
import { fromValues, insertEnd, insertFront, remove, reverse, search } from './logic';

const values = (frames: { nodes: { value: number }[] }[]) => frames[frames.length - 1].nodes.map((n) => n.value);

describe('linked list', () => {
  it('adds to the front in constant steps', () => {
    const list = fromValues([1, 2, 3, 4, 5]);
    const frames = insertFront(list, 9);
    expect(values(frames)).toEqual([9, 1, 2, 3, 4, 5]);
    expect(frames).toHaveLength(2);
  });

  it('walks to the end before appending', () => {
    const frames = insertEnd(fromValues([1, 2, 3]), 4);
    expect(values(frames)).toEqual([1, 2, 3, 4]);
    expect(frames[frames.length - 1].hops).toBe(2);
    expect(values(insertEnd([], 7))).toEqual([7]);
  });

  it('finds a value or reports it missing', () => {
    const list = fromValues([4, 8, 15]);
    expect(search(list, 15).at(-1)!.found).toBe(2);
    expect(search(list, 16).at(-1)!.found).toBeUndefined();
  });

  it('removes the first match only', () => {
    const list = fromValues([4, 8, 4, 15]);
    expect(values(remove(list, 4))).toEqual([8, 4, 15]);
    expect(values(remove(list, 8))).toEqual([4, 4, 15]);
    expect(values(remove(list, 99))).toEqual([4, 8, 4, 15]);
  });

  it('reverses and keeps the node ids', () => {
    const list = fromValues([1, 2, 3, 4]);
    const last = reverse(list).at(-1)!;
    expect(last.nodes.map((n) => n.value)).toEqual([4, 3, 2, 1]);
    expect(last.nodes.map((n) => n.id)).toEqual(list.map((n) => n.id).reverse());
    expect(reverse(fromValues([1]))).toHaveLength(1);
  });
});
