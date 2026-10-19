/**
 * Kruskal's minimum spanning tree: cheapest edges first, skipping any that close a loop
 */
import { GraphEdge, GraphNode } from '../../components/shared/GraphView';
import { LETTERS, rng } from './random';
import { findRoot, makeForest } from './unionfind';

export interface WeightedGraph {
  nodes: GraphNode[];
  edges: (GraphEdge & { weight: number })[];
}

export interface KruskalFrame {
  /** Edge indices in the order they're considered */
  sorted: number[];
  /** How many of `sorted` have been decided */
  decided: number;
  chosen: number[];
  rejected: number[];
  current?: number;
  /** Group (root) for each node, for colouring */
  group: number[];
  total: number;
  note: string;
}

/**
 * Plain-language step descriptions; English by default, swapped for a translation by the UI
 */
export const KRUSKAL_MESSAGES = {
  intro: 'Line up every road from cheapest to most expensive. Each town starts out on its own.',
  consider: (a: string, b: string, w: number) => `Next cheapest: ${a}–${b}, cost ${w}.`,
  take: (a: string, b: string) => `${a} and ${b} aren’t connected yet — build it. Their groups merge.`,
  skip: (a: string, b: string) => `${a} and ${b} are already connected. This road would only close a loop — skip it.`,
  done: (total: number, roads: number) => `Every town is connected with ${roads} roads for a total cost of ${total}. No cheaper network exists.`,
};

export type KruskalMessages = typeof KRUSKAL_MESSAGES;

/** Seven towns roughly on a ring, with a few cross roads */
const SPOTS: [number, number][] = [
  [12, 30], [30, 8], [32, 50], [55, 28], [72, 6], [76, 52], [92, 28],
];
const ROADS: [number, number][] = [
  [0, 1], [0, 2], [1, 2], [1, 3], [1, 4], [2, 3], [2, 5], [3, 4], [3, 5], [3, 6], [4, 6], [5, 6],
];

export function makeTowns(seed: number): WeightedGraph {
  const rand = rng(seed);
  const nodes = SPOTS.map(([x, y], id) => ({ id, label: LETTERS[id], x: x + Math.round((rand() - 0.5) * 4), y: y + Math.round((rand() - 0.5) * 4) }));
  const edges = ROADS.map(([from, to]) => ({ from, to, weight: 1 + Math.floor(rand() * 9) }));
  return { nodes, edges };
}

export function kruskal({ nodes, edges }: WeightedGraph, m: KruskalMessages = KRUSKAL_MESSAGES): KruskalFrame[] {
  const label = (v: number) => nodes[v].label;
  const sorted = edges.map((_, i) => i).sort((a, b) => edges[a].weight - edges[b].weight || a - b);
  const forest = makeForest(nodes.length);
  const chosen: number[] = [];
  const rejected: number[] = [];
  let total = 0;
  const groups = () => nodes.map((n) => findRoot(forest, n.id));
  const frames: KruskalFrame[] = [{ sorted, decided: 0, chosen: [], rejected: [], group: groups(), total: 0, note: m.intro }];
  for (let k = 0; k < sorted.length && chosen.length < nodes.length - 1; k++) {
    const i = sorted[k];
    const { from, to, weight } = edges[i];
    frames.push({ sorted, decided: k, chosen: [...chosen], rejected: [...rejected], current: i, group: groups(), total, note: m.consider(label(from), label(to), weight) });
    const ra = findRoot(forest, from);
    const rb = findRoot(forest, to);
    if (ra === rb) {
      rejected.push(i);
      frames.push({ sorted, decided: k + 1, chosen: [...chosen], rejected: [...rejected], current: i, group: groups(), total, note: m.skip(label(from), label(to)) });
    } else {
      forest.parent[ra] = rb;
      chosen.push(i);
      total += weight;
      frames.push({ sorted, decided: k + 1, chosen: [...chosen], rejected: [...rejected], current: i, group: groups(), total, note: m.take(label(from), label(to)) });
    }
  }
  const last = frames[frames.length - 1];
  frames.push({ ...last, current: undefined, note: m.done(total, chosen.length) });
  return frames;
}
