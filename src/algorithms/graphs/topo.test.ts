import { describe, expect, it } from 'vitest';
import { kahn, makeDag, respects } from './topo';

describe('topological sort', () => {
  it('orders every task so arrows point forward', () => {
    for (let seed = 1; seed < 40; seed++) {
      const dag = makeDag(seed);
      const last = kahn(dag).at(-1)!;
      expect(last.order).toHaveLength(dag.nodes.length);
      expect(respects(last.order, dag.edges)).toBe(true);
      expect(last.stuck).toBeUndefined();
    }
  });

  it('gets stuck on a cycle', () => {
    for (let seed = 1; seed < 40; seed++) {
      const last = kahn(makeDag(seed, true)).at(-1)!;
      expect(last.stuck?.length).toBeGreaterThan(1);
      expect(last.order.length + last.stuck!.length).toBe(8);
    }
  });

  it('every node but the first two has a prerequisite', () => {
    const dag = makeDag(7);
    for (let id = 2; id < 8; id++) expect(dag.edges.some((e) => e.to === id)).toBe(true);
  });
});
