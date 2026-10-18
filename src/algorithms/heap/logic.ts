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

export const parent = (i: number) => Math.floor((i - 1) / 2);
export const leftChild = (i: number) => 2 * i + 1;

function siftUp(items: HeapItem[], start: number, frames: HeapFrame[], taken?: HeapItem) {
  let i = start;
  while (i > 0) {
    const p = parent(i);
    frames.push({ items: [...items], compare: [p, i], taken, note: `Is ${items[i].value} smaller than its parent ${items[p].value}?` });
    if (items[i].value >= items[p].value) break;
    [items[i], items[p]] = [items[p], items[i]];
    frames.push({ items: [...items], swap: [p, i], taken, note: `Yes — swap them, so the smaller one moves up.` });
    i = p;
  }
  return i;
}

function siftDown(items: HeapItem[], start: number, frames: HeapFrame[], taken?: HeapItem) {
  let i = start;
  for (;;) {
    const l = leftChild(i);
    const r = l + 1;
    if (l >= items.length) break;
    let smallest = l;
    if (r < items.length) {
      frames.push({ items: [...items], compare: [l, r], taken, note: `Which child is smaller: ${items[l].value} or ${items[r].value}?` });
      if (items[r].value < items[l].value) smallest = r;
    }
    frames.push({ items: [...items], compare: [i, smallest], taken, note: `Is ${items[i].value} bigger than its child ${items[smallest].value}?` });
    if (items[i].value <= items[smallest].value) break;
    [items[i], items[smallest]] = [items[smallest], items[i]];
    frames.push({ items: [...items], swap: [i, smallest], taken, note: `Yes — swap them, so the bigger one sinks.` });
    i = smallest;
  }
  return i;
}

export function push(heap: HeapItem[], value: number): HeapFrame[] {
  const items = [...heap, { id: nextId++, value }];
  const frames: HeapFrame[] = [
    { items: [...items], settled: undefined, compare: undefined, note: `Add ${value} at the next free spot — the end of the array.` },
  ];
  const at = siftUp(items, items.length - 1, frames);
  frames.push({ items: [...items], settled: at, note: at === 0 ? `${value} is the new smallest, so it sits at the top.` : `${value} has settled. Every parent is still smaller than its children.` });
  return frames;
}

export function pop(heap: HeapItem[]): HeapFrame[] {
  if (!heap.length) return [{ items: [], note: 'The heap is empty — nothing to take.' }];
  const items = [...heap];
  const taken = items[0];
  const frames: HeapFrame[] = [{ items: [...items], settled: 0, note: `The smallest value is always at the top: ${taken.value}. Take it out.` }];
  const last = items.pop()!;
  if (!items.length) {
    frames.push({ items: [], taken, note: `Took ${taken.value}. The heap is now empty.` });
    return frames;
  }
  items[0] = last;
  frames.push({ items: [...items], taken, compare: undefined, note: `Move the last item, ${last.value}, into the empty top spot.` });
  const at = siftDown(items, 0, frames, taken);
  frames.push({ items: [...items], settled: at, taken, note: `${last.value} has sunk into place. The new smallest, ${items[0].value}, is on top.` });
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
