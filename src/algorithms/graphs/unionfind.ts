/**
 * Union-find (disjoint sets) with union by size and path compression
 */

export interface Forest {
  parent: number[];
  size: number[];
}

export interface UnionFrame {
  forest: Forest;
  /** Nodes on the path being walked */
  path: number[];
  /** Roots found */
  roots: number[];
  /** Child → parent link just made */
  link?: [number, number];
  note: string;
}

/**
 * Plain-language step descriptions; English by default, swapped for a translation by the UI
 */
export const UNION_MESSAGES = {
  climb: (from: string, to: string) => `${from} isn’t a leader — follow its arrow up to ${to}.`,
  leader: (who: string, leader: string) => `${who}’s group leader is ${leader}.`,
  same: (a: string, b: string) => `${a} and ${b} have the same leader — they’re already in one group.`,
  link: (small: string, big: string) => `Different leaders. Point ${small} at ${big}, so the smaller group joins the bigger one.`,
  compress: (count: number) => `Shortcut: point the ${count} node(s) we climbed straight at the leader, so next time is faster.`,
  merged: (groups: number) => `Merged. ${groups} group(s) left.`,
};

export type UnionMessages = typeof UNION_MESSAGES;

export const makeForest = (n: number): Forest => ({ parent: Array.from({ length: n }, (_, i) => i), size: Array(n).fill(1) });

const clone = (f: Forest): Forest => ({ parent: [...f.parent], size: [...f.size] });

export function findRoot(f: Forest, x: number) {
  let r = x;
  while (f.parent[r] !== r) r = f.parent[r];
  return r;
}

export const groupCount = (f: Forest) => f.parent.filter((p, i) => p === i).length;

/** Find with path compression, recording frames */
function find(f: Forest, x: number, label: (v: number) => string, frames: UnionFrame[], m: UnionMessages, roots: number[]) {
  const path = [x];
  let r = x;
  while (f.parent[r] !== r) {
    frames.push({ forest: clone(f), path: [...path], roots: [...roots], note: m.climb(label(r), label(f.parent[r])) });
    r = f.parent[r];
    path.push(r);
  }
  frames.push({ forest: clone(f), path: [...path], roots: [...roots, r], note: m.leader(label(x), label(r)) });
  // Compress: everything below the leader's direct children points to the root
  const far = path.slice(0, -2);
  if (far.length) {
    for (const v of far) f.parent[v] = r;
    frames.push({ forest: clone(f), path: [...path], roots: [...roots, r], note: m.compress(far.length) });
  }
  return r;
}

export function union(forest: Forest, a: number, b: number, label: (v: number) => string, m: UnionMessages = UNION_MESSAGES): UnionFrame[] {
  const f = clone(forest);
  const frames: UnionFrame[] = [];
  const ra = find(f, a, label, frames, m, []);
  const rb = find(f, b, label, frames, m, [ra]);
  if (ra === rb) {
    frames.push({ forest: clone(f), path: [], roots: [ra], note: m.same(label(a), label(b)) });
    return frames;
  }
  const [small, big] = f.size[ra] < f.size[rb] ? [ra, rb] : [rb, ra];
  f.parent[small] = big;
  f.size[big] += f.size[small];
  frames.push({ forest: clone(f), path: [], roots: [big], link: [small, big], note: m.link(label(small), label(big)) });
  frames.push({ forest: clone(f), path: [], roots: [big], note: m.merged(groupCount(f)) });
  return frames;
}
