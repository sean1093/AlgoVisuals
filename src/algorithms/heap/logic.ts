/**
 * Binary min-heap stored in an array, with push/pop recorded as frames
 */

export interface HeapItem {
  id: number;
  value: number;
}

export interface HeapFrame {
  items: HeapItem[];
  /** Indices being compared */
  compare?: [number, number];
  /** Indices just swapped */
  swap?: [number, number];
  /** Index that has settled */
  settled?: number;
  /** Item that was just taken out (pop) */
  taken?: HeapItem;
  note: string;
}

let nextId = 1;

/**
 * Plain-language step descriptions; English by default, swapped for a translation by the UI
 */
export const HEAP_MESSAGES = {
  upCompare: (v: number, parent: number) => `Is ${v} smaller than its parent ${parent}?`,
  upSwap: 'Yes — swap them, so the smaller one moves up.',
  whichChild: (a: number, b: number) => `Which child is smaller: ${a} or ${b}?`,
  downCompare: (v: number, child: number) => `Is ${v} bigger than its child ${child}?`,
  downSwap: 'Yes — swap them, so the bigger one sinks.',
  pushIntro: (v: number) => `Add ${v} at the next free spot — the end of the array.`,
  pushTop: (v: number) => `${v} is the new smallest, so it sits at the top.`,
  pushSettled: (v: number) => `${v} has settled. Every parent is still smaller than its children.`,
  popEmpty: 'The heap is empty — nothing to take.',
  popIntro: (v: number) => `The smallest value is always at the top: ${v}. Take it out.`,
  popLast: (v: number) => `Took ${v}. The heap is now empty.`,
  popMoveLast: (v: number) => `Move the last item, ${v}, into the empty top spot.`,
  popSettled: (v: number, top: number) => `${v} has sunk into place. The new smallest, ${top}, is on top.`,
};

export type HeapMessages = typeof HEAP_MESSAGES;

export const parent = (i: number) => Math.floor((i - 1) / 2);
export const leftChild = (i: number) => 2 * i + 1;

function siftUp(items: HeapItem[], start: number, frames: HeapFrame[], m: HeapMessages, taken?: HeapItem) {
  let i = start;
  while (i > 0) {
    const p = parent(i);
    frames.push({ items: [...items], compare: [p, i], taken, note: m.upCompare(items[i].value, items[p].value) });
    if (items[i].value >= items[p].value) break;
    [items[i], items[p]] = [items[p], items[i]];
    frames.push({ items: [...items], swap: [p, i], taken, note: m.upSwap });
    i = p;
  }
  return i;
}

function siftDown(items: HeapItem[], start: number, frames: HeapFrame[], m: HeapMessages, taken?: HeapItem) {
  let i = start;
  for (;;) {
    const l = leftChild(i);
    const r = l + 1;
    if (l >= items.length) break;
    let smallest = l;
    if (r < items.length) {
      frames.push({ items: [...items], compare: [l, r], taken, note: m.whichChild(items[l].value, items[r].value) });
      if (items[r].value < items[l].value) smallest = r;
    }
    frames.push({ items: [...items], compare: [i, smallest], taken, note: m.downCompare(items[i].value, items[smallest].value) });
    if (items[i].value <= items[smallest].value) break;
    [items[i], items[smallest]] = [items[smallest], items[i]];
    frames.push({ items: [...items], swap: [i, smallest], taken, note: m.downSwap });
    i = smallest;
  }
  return i;
}

export function push(heap: HeapItem[], value: number, m: HeapMessages = HEAP_MESSAGES): HeapFrame[] {
  const items = [...heap, { id: nextId++, value }];
  const frames: HeapFrame[] = [
    { items: [...items], settled: undefined, compare: undefined, note: m.pushIntro(value) },
  ];
  const at = siftUp(items, items.length - 1, frames, m);
  frames.push({ items: [...items], settled: at, note: at === 0 ? m.pushTop(value) : m.pushSettled(value) });
  return frames;
}

export function pop(heap: HeapItem[], m: HeapMessages = HEAP_MESSAGES): HeapFrame[] {
  if (!heap.length) return [{ items: [], note: m.popEmpty }];
  const items = [...heap];
  const taken = items[0];
  const frames: HeapFrame[] = [{ items: [...items], settled: 0, note: m.popIntro(taken.value) }];
  const last = items.pop()!;
  if (!items.length) {
    frames.push({ items: [], taken, note: m.popLast(taken.value) });
    return frames;
  }
  items[0] = last;
  frames.push({ items: [...items], taken, compare: undefined, note: m.popMoveLast(last.value) });
  const at = siftDown(items, 0, frames, m, taken);
  frames.push({ items: [...items], settled: at, taken, note: m.popSettled(last.value, items[0].value) });
  return frames;
}

export function fromValues(values: number[]): HeapItem[] {
  let heap: HeapItem[] = [];
  for (const v of values) heap = push(heap, v).at(-1)!.items;
  return heap;
}

export function isHeap(items: HeapItem[]) {
  return items.every((item, i) => i === 0 || items[parent(i)].value <= item.value);
}
