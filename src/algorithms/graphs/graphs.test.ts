import { describe, expect, it } from 'vitest';
import { kruskal, makeTowns } from './kruskal';
import { findRoot, groupCount, makeForest, union } from './unionfind';

/** Brute force: cheapest spanning tree by trying every subset of n-1 edges */
function bruteMst(n: number, edges: { from: number; to: number; weight: number }[]) {
  let best = Infinity;
  const pick = (start: number, chosen: number[]) => {
    if (chosen.length === n - 1) {
      const f = makeForest(n);
      for (const i of chosen) {
        const a = findRoot(f, edges[i].from);
        const b = findRoot(f, edges[i].to);
        if (a === b) return;
        f.parent[a] = b;
      }
      best = Math.min(best, chosen.reduce((s, i) => s + edges[i].weight, 0));
      return;
    }
    for (let i = start; i < edges.length; i++) pick(i + 1, [...chosen, i]);
  };
  pick(0, []);
  return best;
}

describe('kruskal', () => {
  it('finds the cheapest spanning tree', () => {
    for (let seed = 1; seed < 15; seed++) {
      const towns = makeTowns(seed);
      const last = kruskal(towns).at(-1)!;
      expect(last.chosen).toHaveLength(towns.nodes.length - 1);
      expect(last.total).toBe(bruteMst(towns.nodes.length, towns.edges));
      expect(new Set(last.group).size).toBe(1);
    }
  });
});

describe('union-find', () => {
  const label = (v: number) => String(v);

  it('merges groups and keeps the smaller under the bigger', () => {
    let f = makeForest(6);
    f = union(f, 0, 1, label).at(-1)!.forest;
    f = union(f, 2, 0, label).at(-1)!.forest;
    expect(groupCount(f)).toBe(4);
    expect(findRoot(f, 2)).toBe(findRoot(f, 1));
    // The single node 2 joined the pair, not the other way round
    expect(f.parent[2]).toBe(findRoot(f, 0));
  });

  it('reports when two are already together', () => {
    let f = makeForest(3);
    f = union(f, 0, 1, label).at(-1)!.forest;
    const frames = union(f, 1, 0, label);
    expect(frames.at(-1)!.forest.parent).toEqual(f.parent);
    expect(frames.some((fr) => fr.link)).toBe(false);
  });

  it('compresses long paths', () => {
    // Build a chain 0 → 1 → 2 → 3 by hand
    const f = { parent: [1, 2, 3, 3, 4], size: [1, 2, 3, 4, 1] };
    const after = union(f, 0, 4, label).at(-1)!.forest;
    expect(after.parent[0]).toBe(3);
    expect(after.parent[1]).toBe(3);
  });
});
