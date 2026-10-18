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

class Recorder {
  a: number[];
  frames: SortFrame[] = [];
  comparisons = 0;
  writes = 0;
  sorted = new Set<number>();

  constructor(input: number[]) {
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
    this.snap('All done — every bar is in its place.');
    return this.frames;
  }
}

function bubbleSort(input: number[]): SortFrame[] {
  const r = new Recorder(input);
  const n = r.a.length;
  r.snap('Walk through the list, swapping any neighbours that are out of order.');
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      r.snap(`Compare ${r.a[j]} and ${r.a[j + 1]}.`, { compare: [j, j + 1], range: [0, n - 1 - i] });
      if (r.greater(j, j + 1)) {
        r.swap(j, j + 1);
        swapped = true;
        r.snap(`${r.a[j + 1]} is bigger, so it bubbles to the right.`, { swap: [j, j + 1], range: [0, n - 1 - i] });
      }
    }
    r.markSorted(n - 1 - i);
    if (!swapped) {
      r.snap('A whole pass with no swaps — the list is already in order.');
      break;
    }
    r.snap(`${r.a[n - 1 - i]} has bubbled up to its final spot.`);
  }
  return r.finish();
}

function selectionSort(input: number[]): SortFrame[] {
  const r = new Recorder(input);
  const n = r.a.length;
  r.snap('Repeatedly find the smallest remaining bar and move it to the front.');
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    r.snap(`Look for the smallest bar from position ${i + 1} onwards.`, { pivot: min, range: [i, n - 1] });
    for (let j = i + 1; j < n; j++) {
      r.snap(`Is ${r.a[j]} smaller than ${r.a[min]}?`, { compare: [min, j], pivot: min, range: [i, n - 1] });
      if (r.greater(min, j)) {
        min = j;
        r.snap(`Yes — ${r.a[min]} is the smallest so far.`, { pivot: min, range: [i, n - 1] });
      }
    }
    if (min !== i) {
      r.swap(i, min);
      r.snap(`Swap ${r.a[i]} into position ${i + 1}.`, { swap: [i, min] });
    }
    r.markSorted(i);
  }
  return r.finish();
}

function insertionSort(input: number[]): SortFrame[] {
  const r = new Recorder(input);
  const n = r.a.length;
  r.snap('Grow a sorted section on the left, slotting each new bar into place.');
  for (let i = 1; i < n; i++) {
    r.snap(`Pick up ${r.a[i]} and slide it left until it fits.`, { pivot: i, range: [0, i] });
    let j = i;
    while (j > 0) {
      r.snap(`Compare ${r.a[j - 1]} and ${r.a[j]}.`, { compare: [j - 1, j], pivot: j, range: [0, i] });
      if (!r.greater(j - 1, j)) {
        r.snap(`${r.a[j]} fits here.`, { pivot: j, range: [0, i] });
        break;
      }
      r.swap(j - 1, j);
      j--;
      r.snap(`${r.a[j + 1]} is bigger, so ${r.a[j]} moves left past it.`, { swap: [j, j + 1], pivot: j, range: [0, i] });
    }
  }
  return r.finish();
}

function mergeSort(input: number[]): SortFrame[] {
  const r = new Recorder(input);
  const n = r.a.length;
  r.snap('Split the list in half again and again, then merge the sorted halves back together.');

  const sort = (lo: number, hi: number) => {
    if (hi - lo < 1) return;
    const mid = Math.floor((lo + hi) / 2);
    sort(lo, mid);
    sort(mid + 1, hi);

    const left = r.a.slice(lo, mid + 1);
    const right = r.a.slice(mid + 1, hi + 1);
    r.snap(`Merge two sorted halves: ${left.length} + ${right.length} bars.`, { range: [lo, hi] });
    let i = 0;
    let j = 0;
    let k = lo;
    while (i < left.length && j < right.length) {
      r.comparisons++;
      const takeLeft = left[i] <= right[j];
      const value = takeLeft ? left[i++] : right[j++];
      r.a[k] = value;
      r.writes++;
      r.snap(`${takeLeft ? left[i - 1] : right[j - 1]} is the smaller front bar — place it next.`, { write: k, range: [lo, hi] });
      k++;
    }
    while (i < left.length) {
      r.a[k] = left[i++];
      r.writes++;
      r.snap(`Copy the leftover ${r.a[k]}.`, { write: k, range: [lo, hi] });
      k++;
    }
    while (j < right.length) {
      r.a[k] = right[j++];
      r.writes++;
      r.snap(`Copy the leftover ${r.a[k]}.`, { write: k, range: [lo, hi] });
      k++;
    }
    if (lo === 0 && hi === n - 1) r.markSorted(...r.a.map((_, idx) => idx));
  };

  sort(0, n - 1);
  return r.finish();
}

function quickSort(input: number[]): SortFrame[] {
  const r = new Recorder(input);
  r.snap('Pick a pivot, put smaller bars to its left and bigger ones to its right, then repeat on each side.');

  const sort = (lo: number, hi: number) => {
    if (lo > hi) return;
    if (lo === hi) {
      r.markSorted(lo);
      r.snap(`${r.a[lo]} is on its own, so it’s already in place.`);
      return;
    }
    const pivotValue = r.a[hi];
    r.snap(`Use ${pivotValue} (the last bar) as the pivot.`, { pivot: hi, range: [lo, hi] });
    let i = lo;
    for (let j = lo; j < hi; j++) {
      r.snap(`Is ${r.a[j]} smaller than the pivot ${pivotValue}?`, { compare: [j, hi], pivot: hi, range: [lo, hi] });
      if (r.greater(hi, j)) {
        if (i !== j) {
          r.swap(i, j);
          r.snap(`Yes — move ${r.a[i]} into the “smaller” group.`, { swap: [i, j], pivot: hi, range: [lo, hi] });
        }
        i++;
      }
    }
    if (i !== hi) r.swap(i, hi);
    r.markSorted(i);
    r.snap(`Drop the pivot ${pivotValue} between the two groups — that’s its final spot.`, { swap: i !== hi ? [i, hi] : undefined, range: [lo, hi] });
    sort(lo, i - 1);
    sort(i + 1, hi);
  };

  sort(0, r.a.length - 1);
  return r.finish();
}

function heapSort(input: number[]): SortFrame[] {
  const r = new Recorder(input);
  const n = r.a.length;
  r.snap('Arrange the bars into a “heap” where every parent is bigger than its children.');

  const siftDown = (start: number, end: number) => {
    let root = start;
    for (;;) {
      const left = 2 * root + 1;
      if (left >= end) return;
      let child = left;
      if (left + 1 < end) {
        r.snap(`Which child is bigger: ${r.a[left]} or ${r.a[left + 1]}?`, { compare: [left, left + 1], range: [0, end - 1] });
        if (r.greater(left + 1, left)) child = left + 1;
      }
      r.snap(`Is the parent ${r.a[root]} smaller than its child ${r.a[child]}?`, { compare: [root, child], range: [0, end - 1] });
      if (!r.greater(child, root)) return;
      r.swap(root, child);
      r.snap(`Yes — swap them so the bigger one rises.`, { swap: [root, child], range: [0, end - 1] });
      root = child;
    }
  };

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(i, n);
  r.snap(`The heap is built: the biggest bar, ${r.a[0]}, sits at the front.`, { pivot: 0 });

  for (let end = n - 1; end > 0; end--) {
    r.swap(0, end);
    r.markSorted(end);
    r.snap(`Move the biggest, ${r.a[end]}, to the end. Then repair the heap.`, { swap: [0, end], range: [0, end - 1] });
    siftDown(0, end);
  }
  return r.finish();
}

export const SORTERS: Record<SortAlgorithm, (input: number[]) => SortFrame[]> = {
  bubble: bubbleSort,
  selection: selectionSort,
  insertion: insertionSort,
  merge: mergeSort,
  quick: quickSort,
  heap: heapSort,
};

export const SORT_NAMES: Record<SortAlgorithm, string> = {
  bubble: 'Bubble Sort',
  selection: 'Selection Sort',
  insertion: 'Insertion Sort',
  merge: 'Merge Sort',
  quick: 'Quick Sort',
  heap: 'Heap Sort',
};

export type InputShape = 'random' | 'nearly' | 'reversed' | 'few';

export const INPUT_SHAPES: { id: InputShape; label: string }[] = [
  { id: 'random', label: 'Shuffled' },
  { id: 'nearly', label: 'Nearly sorted' },
  { id: 'reversed', label: 'Reversed' },
  { id: 'few', label: 'Few unique' },
];

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
