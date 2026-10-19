/**
 * Singly linked list operations, recorded as frames
 */

export interface ListNode {
  id: number;
  value: number;
}

export interface ListFrame {
  nodes: ListNode[];
  /** Index the head pointer is on (defaults to 0) */
  head?: number;
  /** Pointer positions, as indices into `nodes` */
  cur?: number;
  prev?: number;
  next?: number;
  /** During a reversal, nodes before this index already point backwards */
  flipped?: number;
  /** Node just created */
  fresh?: number;
  /** Index that matched a search */
  found?: number;
  /** Index being unlinked */
  doomed?: number;
  /** Arrows followed so far */
  hops: number;
  note: string;
}

let nextId = 1;

/** A fresh node id; pass it to an insert so re-running it reuses the id */
export const newNodeId = () => nextId++;

/**
 * Plain-language step descriptions; English by default, swapped for a translation by the UI
 */
export const LIST_MESSAGES = {
  empty: 'The list is empty.',
  frontNew: (v: number) => `Make a new node ${v} and point its arrow at the current head.`,
  frontDone: (v: number) => `Move the head to ${v}. Done in one step, no matter how long the list is.`,
  endEmpty: (v: number) => `The list is empty, so ${v} simply becomes the head.`,
  walk: (v: number) => `At ${v}. Its arrow points onward, so follow it.`,
  endLast: (v: number) => `${v} points to nothing — it’s the last node.`,
  endDone: (v: number, hops: number) => `Hook ${v} onto the end. Getting here took ${hops} hops.`,
  check: (v: number, target: number) => `Is ${v} the ${target} we want?`,
  found: (target: number, hops: number) => `Found ${target} after ${hops} hops. A linked list can only be read from the front.`,
  missing: (target: number) => `Fell off the end — ${target} isn’t in the list.`,
  deleteHead: (v: number) => `${v} is the head, so just move the head to the next node.`,
  deleteSkip: (v: number) => `Found ${v}. Point the node before it straight past it.`,
  deleteDone: (v: number) => `${v} is unlinked. Nothing else had to move.`,
  reverseShort: 'With fewer than two nodes there’s nothing to reverse.',
  reverseIntro: 'Walk the list with three pointers: prev (nothing yet), cur and next.',
  reverseStep: (v: number) => `Remember the next node, turn ${v}’s arrow back towards prev, then step everything right.`,
  reverseDone: 'cur fell off the end, so prev is the new head. Every arrow now points the other way.',
};

export type ListMessages = typeof LIST_MESSAGES;

export function fromValues(values: number[]): ListNode[] {
  return values.map((value) => ({ id: newNodeId(), value }));
}

export function insertFront(list: ListNode[], value: number, m: ListMessages = LIST_MESSAGES, id = newNodeId()): ListFrame[] {
  const nodes = [{ id, value }, ...list];
  if (!list.length) return [{ nodes, fresh: 0, hops: 0, note: m.endEmpty(value) }];
  return [
    { nodes, head: 1, fresh: 0, hops: 0, note: m.frontNew(value) },
    { nodes, head: 0, fresh: 0, hops: 0, note: m.frontDone(value) },
  ];
}

export function insertEnd(list: ListNode[], value: number, m: ListMessages = LIST_MESSAGES, id = newNodeId()): ListFrame[] {
  if (!list.length) return [{ nodes: [{ id, value }], fresh: 0, hops: 0, note: m.endEmpty(value) }];
  const frames: ListFrame[] = [];
  for (let i = 0; i < list.length - 1; i++) frames.push({ nodes: list, cur: i, hops: i, note: m.walk(list[i].value) });
  const last = list.length - 1;
  frames.push({ nodes: list, cur: last, hops: last, note: m.endLast(list[last].value) });
  frames.push({ nodes: [...list, { id, value }], cur: last, fresh: list.length, hops: last, note: m.endDone(value, last) });
  return frames;
}

export function search(list: ListNode[], target: number, m: ListMessages = LIST_MESSAGES): ListFrame[] {
  if (!list.length) return [{ nodes: list, hops: 0, note: m.empty }];
  const frames: ListFrame[] = [];
  for (let i = 0; i < list.length; i++) {
    frames.push({ nodes: list, cur: i, hops: i, note: m.check(list[i].value, target) });
    if (list[i].value === target) {
      frames.push({ nodes: list, found: i, hops: i, note: m.found(target, i) });
      return frames;
    }
  }
  frames.push({ nodes: list, hops: list.length, note: m.missing(target) });
  return frames;
}

export function remove(list: ListNode[], target: number, m: ListMessages = LIST_MESSAGES): ListFrame[] {
  const frames = search(list, target, m);
  const at = frames[frames.length - 1].found;
  if (at === undefined) return frames;
  frames.pop();
  const rest = list.filter((_, i) => i !== at);
  const hops = at;
  if (at === 0) {
    frames.push({ nodes: list, doomed: 0, head: 1, hops, note: m.deleteHead(target) });
  } else {
    frames.push({ nodes: list, doomed: at, prev: at - 1, hops, note: m.deleteSkip(target) });
  }
  frames.push({ nodes: rest, hops, note: m.deleteDone(target) });
  return frames;
}

export function reverse(list: ListNode[], m: ListMessages = LIST_MESSAGES): ListFrame[] {
  if (list.length < 2) return [{ nodes: list, hops: 0, note: m.reverseShort }];
  const n = list.length;
  const frames: ListFrame[] = [{ nodes: list, cur: 0, next: 1, flipped: 0, hops: 0, note: m.reverseIntro }];
  for (let c = 0; c < n; c++) {
    frames.push({
      nodes: list,
      prev: c,
      cur: c + 1 < n ? c + 1 : undefined,
      next: c + 2 < n ? c + 2 : undefined,
      flipped: c + 1,
      hops: c + 1,
      note: m.reverseStep(list[c].value),
    });
  }
  frames.push({ nodes: [...list].reverse(), hops: n, note: m.reverseDone });
  return frames;
}
