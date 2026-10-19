/**
 * Topological sort with Kahn's algorithm: repeatedly take a task nothing is waiting on
 */
import { GraphEdge, GraphNode } from '../../components/shared/GraphView';
import { LETTERS, rng, shuffle } from './random';

export interface Dag {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface TopoFrame {
  indegree: number[];
  queue: number[];
  order: number[];
  /** Edges already crossed off */
  crossed: number[];
  focus?: number;
  edge?: number;
  /** Nodes left over because they wait on each other */
  stuck?: number[];
  note: string;
}

/**
 * Plain-language step descriptions; English by default, swapped for a translation by the UI
 */
export const TOPO_MESSAGES = {
  intro: 'Each badge counts the arrows pointing in: how many tasks must happen first.',
  start: (list: string) => `Nothing is waiting on ${list} — they can start right away. Put them in the queue.`,
  noStart: 'Every task waits on another one. There’s nowhere to start!',
  take: (v: string) => `Take ${v} from the queue and add it to the order.`,
  cross: (from: string, to: string, left: number) => `Cross off ${from} → ${to}. ${to} still waits on ${left}.`,
  ready: (from: string, to: string) => `Cross off ${from} → ${to}. ${to} has nothing left to wait for — into the queue.`,
  done: 'Every task is placed, and every arrow points forward in the order.',
  stuck: (count: number) => `The queue is empty but ${count} tasks are left. They wait on each other in a loop, so no order works.`,
};

export type TopoMessages = typeof TOPO_MESSAGES;

const COLUMNS = [12, 37, 63, 88];

export function makeDag(seed: number, withCycle = false): Dag {
  const rand = rng(seed);
  const labels = shuffle(LETTERS.slice(0, 8).split(''), rand);
  const nodes: GraphNode[] = labels.map((label, id) => {
    const col = Math.floor(id / 2);
    const row = id % 2;
    return { id, label, x: COLUMNS[col], y: (row ? 46 : 14) + (col % 2 ? 4 : -4) + Math.round((rand() - 0.5) * 6) };
  });
  const edges: GraphEdge[] = [];
  const has = (a: number, b: number) => edges.some((e) => e.from === a && e.to === b);
  for (let id = 2; id < 8; id++) {
    const col = Math.floor(id / 2);
    // One parent from the column just before, sometimes another. Extra parents are either the other
    // node of that column or the opposite row two columns back, so no arrow runs through a node.
    const first = (col - 1) * 2 + Math.floor(rand() * 2);
    edges.push({ from: first, to: id, directed: true });
    if (rand() < 0.6) {
      const from = col >= 2 && rand() < 0.4 ? (col - 2) * 2 + (1 - (id % 2)) : (col - 1) * 2 + (1 - (first % 2));
      if (!has(from, id)) edges.push({ from, to: id, directed: true });
    }
  }
  if (withCycle) {
    // Close a loop: the last task points back at one of its own ancestors
    const last = 6 + Math.floor(rand() * 2);
    const ancestors = new Set<number>();
    const stack = [last];
    while (stack.length) {
      const v = stack.pop()!;
      for (const e of edges) if (e.to === v && !ancestors.has(e.from)) ancestors.add(e.from), stack.push(e.from);
    }
    const target = [...ancestors].filter((a) => a >= 2).sort((a, b) => a - b)[0] ?? [...ancestors][0];
    edges.push({ from: last, to: target, directed: true });
  }
  return { nodes, edges };
}

export function kahn({ nodes, edges }: Dag, m: TopoMessages = TOPO_MESSAGES, sep = ', '): TopoFrame[] {
  const label = (v: number) => nodes[v].label;
  const indegree = nodes.map((n) => edges.filter((e) => e.to === n.id).length);
  const crossed: number[] = [];
  const order: number[] = [];
  const frames: TopoFrame[] = [{ indegree: [...indegree], queue: [], order: [], crossed: [], note: m.intro }];
  const queue = nodes.filter((n) => indegree[n.id] === 0).map((n) => n.id);
  const snap = (extra: Partial<TopoFrame> & { note: string }) =>
    frames.push({ indegree: [...indegree], queue: [...queue], order: [...order], crossed: [...crossed], ...extra });

  snap({ note: queue.length ? m.start(queue.map(label).join(sep)) : m.noStart });
  while (queue.length) {
    const u = queue.shift()!;
    order.push(u);
    snap({ focus: u, note: m.take(label(u)) });
    edges.forEach((e, i) => {
      if (e.from !== u) return;
      crossed.push(i);
      indegree[e.to]--;
      if (indegree[e.to] === 0) queue.push(e.to);
      snap({ focus: u, edge: i, note: indegree[e.to] === 0 ? m.ready(label(u), label(e.to)) : m.cross(label(u), label(e.to), indegree[e.to]) });
    });
  }
  const left = nodes.filter((n) => !order.includes(n.id)).map((n) => n.id);
  snap(left.length ? { stuck: left, note: m.stuck(left.length) } : { note: m.done });
  return frames;
}

/** True when every edge goes from earlier to later in `order` */
export function respects(order: number[], edges: GraphEdge[]) {
  const pos = new Map(order.map((v, i) => [v, i]));
  return edges.every((e) => (pos.get(e.from) ?? Infinity) < (pos.get(e.to) ?? -Infinity));
}
