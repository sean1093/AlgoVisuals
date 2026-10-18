/**
 * Sorting algorithms that record every step as a frame for playback
 */

export interface SortFrame {
  array: number[];
  /** Indices being compared */
  compare?: [number, number];
  /** Indices just swapped */
  swap?: [number, number];
  /** Index just overwritten (merge sort) */
  write?: number;
  pivot?: number;
  /** Sub-array currently being worked on */
  range?: [number, number];
  /** Indices that hold their final value */
  sorted: number[];
  note: string;
  comparisons: number;
  writes: number;
}

export type SortAlgorithm = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'heap';

/**
 * Plain-language step descriptions; English by default, swapped for a translation by the UI
 */
export const SORT_MESSAGES = {
  done: 'All done — every bar is in its place.',
  compare: (a: number, b: number) => `Compare ${a} and ${b}.`,
  bubbleIntro: 'Walk through the list, swapping any neighbours that are out of order.',
  bubbleSwap: (bigger: number) => `${bigger} is bigger, so it bubbles to the right.`,
  bubbleNoSwaps: 'A whole pass with no swaps — the list is already in order.',
  bubbleFinal: (v: number) => `${v} has bubbled up to its final spot.`,
  selectionIntro: 'Repeatedly find the smallest remaining bar and move it to the front.',
  selectionScan: (position: number) => `Look for the smallest bar from position ${position} onwards.`,
  selectionCompare: (a: number, min: number) => `Is ${a} smaller than ${min}?`,
  selectionNewMin: (v: number) => `Yes — ${v} is the smallest so far.`,
  selectionSwap: (v: number, position: number) => `Swap ${v} into position ${position}.`,
  insertionIntro: 'Grow a sorted section on the left, slotting each new bar into place.',
  insertionPick: (v: number) => `Pick up ${v} and slide it left until it fits.`,
  insertionFits: (v: number) => `${v} fits here.`,
  insertionShift: (bigger: number, v: number) => `${bigger} is bigger, so ${v} moves left past it.`,
  mergeIntro: 'Split the list in half again and again, then merge the sorted halves back together.',
  mergeHalves: (left: number, right: number) => `Merge two sorted halves: ${left} + ${right} bars.`,
  mergeTake: (v: number) => `${v} is the smaller front bar — place it next.`,
  mergeLeftover: (v: number) => `Copy the leftover ${v}.`,
  quickIntro: 'Pick a pivot, put smaller bars to its left and bigger ones to its right, then repeat on each side.',
  quickSingle: (v: number) => `${v} is on its own, so it’s already in place.`,
  quickPivot: (v: number) => `Use ${v} (the last bar) as the pivot.`,
  quickCompare: (v: number, pivot: number) => `Is ${v} smaller than the pivot ${pivot}?`,
  quickMove: (v: number) => `Yes — move ${v} into the “smaller” group.`,
  quickPlace: (pivot: number) => `Drop the pivot ${pivot} between the two groups — that’s its final spot.`,
  heapIntro: 'Arrange the bars into a “heap” where every parent is bigger than its children.',
  heapWhichChild: (a: number, b: number) => `Which child is bigger: ${a} or ${b}?`,
  heapParent: (parent: number, child: number) => `Is the parent ${parent} smaller than its child ${child}?`,
  heapSwap: 'Yes — swap them so the bigger one rises.',
  heapBuilt: (v: number) => `The heap is built: the biggest bar, ${v}, sits at the front.`,
  heapExtract: (v: number) => `Move the biggest, ${v}, to the end. Then repair the heap.`,
};

export type SortMessages = typeof SORT_MESSAGES;

class Recorder {
  a: number[];
  frames: SortFrame[] = [];
  comparisons = 0;
  writes = 0;
  sorted = new Set<number>();

  constructor(input: number[], readonly m: SortMessages) {
    this.a = [...input];
  }

  snap(note: string, extra: Partial<Omit<SortFrame, 'array' | 'sorted' | 'note' | 'comparisons' | 'writes'>> = {}) {
    this.frames.push({
      array: [...this.a],
      sorted: [...this.sorted],
      note,
      comparisons: this.comparisons,
      writes: this.writes,
      ...extra,
    });
  }

  /** Count a comparison and return a[i] > a[j] */
  greater(i: number, j: number) {
    this.comparisons++;
    return this.a[i] > this.a[j];
  }

  swap(i: number, j: number) {
    [this.a[i], this.a[j]] = [this.a[j], this.a[i]];
    this.writes++;
  }

  markSorted(...indices: number[]) {
    indices.forEach((i) => this.sorted.add(i));
  }

  finish() {
    this.a.forEach((_, i) => this.sorted.add(i));
    this.snap(this.m.done);
    return this.frames;
  }
}

function bubbleSort(input: number[], m: SortMessages = SORT_MESSAGES): SortFrame[] {
  const r = new Recorder(input, m);
  const n = r.a.length;
  r.snap(r.m.bubbleIntro);
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      r.snap(r.m.compare(r.a[j], r.a[j + 1]), { compare: [j, j + 1], range: [0, n - 1 - i] });
      if (r.greater(j, j + 1)) {
        r.swap(j, j + 1);
        swapped = true;
        r.snap(r.m.bubbleSwap(r.a[j + 1]), { swap: [j, j + 1], range: [0, n - 1 - i] });
      }
    }
    r.markSorted(n - 1 - i);
    if (!swapped) {
      r.snap(r.m.bubbleNoSwaps);
      break;
    }
    r.snap(r.m.bubbleFinal(r.a[n - 1 - i]));
  }
  return r.finish();
}

function selectionSort(input: number[], m: SortMessages = SORT_MESSAGES): SortFrame[] {
  const r = new Recorder(input, m);
  const n = r.a.length;
  r.snap(r.m.selectionIntro);
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    r.snap(r.m.selectionScan(i + 1), { pivot: min, range: [i, n - 1] });
    for (let j = i + 1; j < n; j++) {
      r.snap(r.m.selectionCompare(r.a[j], r.a[min]), { compare: [min, j], pivot: min, range: [i, n - 1] });
      if (r.greater(min, j)) {
        min = j;
        r.snap(r.m.selectionNewMin(r.a[min]), { pivot: min, range: [i, n - 1] });
      }
    }
    if (min !== i) {
      r.swap(i, min);
      r.snap(r.m.selectionSwap(r.a[i], i + 1), { swap: [i, min] });
    }
    r.markSorted(i);
  }
  return r.finish();
}

function insertionSort(input: number[], m: SortMessages = SORT_MESSAGES): SortFrame[] {
  const r = new Recorder(input, m);
  const n = r.a.length;
  r.snap(r.m.insertionIntro);
  for (let i = 1; i < n; i++) {
    r.snap(r.m.insertionPick(r.a[i]), { pivot: i, range: [0, i] });
    let j = i;
    while (j > 0) {
      r.snap(r.m.compare(r.a[j - 1], r.a[j]), { compare: [j - 1, j], pivot: j, range: [0, i] });
      if (!r.greater(j - 1, j)) {
        r.snap(r.m.insertionFits(r.a[j]), { pivot: j, range: [0, i] });
        break;
      }
      r.swap(j - 1, j);
      j--;
      r.snap(r.m.insertionShift(r.a[j + 1], r.a[j]), { swap: [j, j + 1], pivot: j, range: [0, i] });
    }
  }
  return r.finish();
}

function mergeSort(input: number[], m: SortMessages = SORT_MESSAGES): SortFrame[] {
  const r = new Recorder(input, m);
  const n = r.a.length;
  r.snap(r.m.mergeIntro);

  const sort = (lo: number, hi: number) => {
    if (hi - lo < 1) return;
    const mid = Math.floor((lo + hi) / 2);
    sort(lo, mid);
    sort(mid + 1, hi);

    const left = r.a.slice(lo, mid + 1);
    const right = r.a.slice(mid + 1, hi + 1);
    r.snap(r.m.mergeHalves(left.length, right.length), { range: [lo, hi] });
    let i = 0;
    let j = 0;
    let k = lo;
    while (i < left.length && j < right.length) {
      r.comparisons++;
      const takeLeft = left[i] <= right[j];
      const value = takeLeft ? left[i++] : right[j++];
      r.a[k] = value;
      r.writes++;
      r.snap(r.m.mergeTake(takeLeft ? left[i - 1] : right[j - 1]), { write: k, range: [lo, hi] });
      k++;
    }
    while (i < left.length) {
      r.a[k] = left[i++];
      r.writes++;
      r.snap(r.m.mergeLeftover(r.a[k]), { write: k, range: [lo, hi] });
      k++;
    }
    while (j < right.length) {
      r.a[k] = right[j++];
      r.writes++;
      r.snap(r.m.mergeLeftover(r.a[k]), { write: k, range: [lo, hi] });
      k++;
    }
    if (lo === 0 && hi === n - 1) r.markSorted(...r.a.map((_, idx) => idx));
  };

  sort(0, n - 1);
  return r.finish();
}

function quickSort(input: number[], m: SortMessages = SORT_MESSAGES): SortFrame[] {
  const r = new Recorder(input, m);
  r.snap(r.m.quickIntro);

  const sort = (lo: number, hi: number) => {
    if (lo > hi) return;
    if (lo === hi) {
      r.markSorted(lo);
      r.snap(r.m.quickSingle(r.a[lo]));
      return;
    }
    const pivotValue = r.a[hi];
    r.snap(r.m.quickPivot(pivotValue), { pivot: hi, range: [lo, hi] });
    let i = lo;
    for (let j = lo; j < hi; j++) {
      r.snap(r.m.quickCompare(r.a[j], pivotValue), { compare: [j, hi], pivot: hi, range: [lo, hi] });
      if (r.greater(hi, j)) {
        if (i !== j) {
          r.swap(i, j);
          r.snap(r.m.quickMove(r.a[i]), { swap: [i, j], pivot: hi, range: [lo, hi] });
        }
        i++;
      }
    }
    if (i !== hi) r.swap(i, hi);
    r.markSorted(i);
    r.snap(r.m.quickPlace(pivotValue), { swap: i !== hi ? [i, hi] : undefined, range: [lo, hi] });
    sort(lo, i - 1);
    sort(i + 1, hi);
  };

  sort(0, r.a.length - 1);
  return r.finish();
}

function heapSort(input: number[], m: SortMessages = SORT_MESSAGES): SortFrame[] {
  const r = new Recorder(input, m);
  const n = r.a.length;
  r.snap(r.m.heapIntro);

  const siftDown = (start: number, end: number) => {
    let root = start;
    for (;;) {
      const left = 2 * root + 1;
      if (left >= end) return;
      let child = left;
      if (left + 1 < end) {
        r.snap(r.m.heapWhichChild(r.a[left], r.a[left + 1]), { compare: [left, left + 1], range: [0, end - 1] });
        if (r.greater(left + 1, left)) child = left + 1;
      }
      r.snap(r.m.heapParent(r.a[root], r.a[child]), { compare: [root, child], range: [0, end - 1] });
      if (!r.greater(child, root)) return;
      r.swap(root, child);
      r.snap(r.m.heapSwap, { swap: [root, child], range: [0, end - 1] });
      root = child;
    }
  };

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(i, n);
  r.snap(r.m.heapBuilt(r.a[0]), { pivot: 0 });

  for (let end = n - 1; end > 0; end--) {
    r.swap(0, end);
    r.markSorted(end);
    r.snap(r.m.heapExtract(r.a[end]), { swap: [0, end], range: [0, end - 1] });
    siftDown(0, end);
  }
  return r.finish();
}

export const SORTERS: Record<SortAlgorithm, (input: number[], m?: SortMessages) => SortFrame[]> = {
  bubble: bubbleSort,
  selection: selectionSort,
  insertion: insertionSort,
  merge: mergeSort,
  quick: quickSort,
  heap: heapSort,
};

export type InputShape = 'random' | 'nearly' | 'reversed' | 'few';

export const INPUT_SHAPES: InputShape[] = ['random', 'nearly', 'reversed', 'few'];

/**
 * Build an input array of `size` values between 5 and 100
 */
export function makeInput(size: number, shape: InputShape, random: () => number = Math.random): number[] {
  const value = () => 5 + Math.floor(random() * 96);
  switch (shape) {
    case 'nearly': {
      const a = Array.from({ length: size }, (_, i) => Math.round(5 + (95 * (i + 1)) / size));
      for (let k = 0; size > 1 && k < Math.max(1, Math.floor(size / 8)); k++) {
        const i = Math.floor(random() * (size - 1));
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
      }
      return a;
    }
    case 'reversed':
      return Array.from({ length: size }, (_, i) => Math.round(5 + (95 * (size - i)) / size));
    case 'few': {
      const levels = [20, 45, 70, 95];
      return Array.from({ length: size }, () => levels[Math.floor(random() * levels.length)]);
    }
    default:
      return Array.from({ length: size }, value);
  }
}
