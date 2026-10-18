/**
 * Linear and binary search, recorded step by step
 */

export interface SearchFrame {
  /** Index being looked at */
  index?: number;
  low?: number;
  high?: number;
  /** Indices ruled out so far */
  eliminated: number[];
  found?: number;
  /** True on the last frame when the target isn't in the list */
  missing?: boolean;
  note: string;
  checks: number;
}

export type SearchAlgorithm = 'linear' | 'binary';

export function linearSearch(list: number[], target: number): SearchFrame[] {
  const frames: SearchFrame[] = [{ eliminated: [], note: `Look for ${target} by checking every box from left to right.`, checks: 0 }];
  const eliminated: number[] = [];
  for (let i = 0; i < list.length; i++) {
    const checks = i + 1;
    if (list[i] === target) {
      frames.push({ index: i, eliminated: [...eliminated], found: i, note: `Box ${i + 1} holds ${target} — found it after ${checks} check${checks > 1 ? 's' : ''}.`, checks });
      return frames;
    }
    frames.push({ index: i, eliminated: [...eliminated], note: `Box ${i + 1} holds ${list[i]}. Not it — move on.`, checks });
    eliminated.push(i);
  }
  frames.push({ eliminated: [...eliminated], missing: true, note: `Checked all ${list.length} boxes: ${target} isn’t in the list.`, checks: list.length });
  return frames;
}

/**
 * Binary search; `list` must be sorted ascending
 */
export function binarySearch(list: number[], target: number): SearchFrame[] {
  const frames: SearchFrame[] = [
    { low: 0, high: list.length - 1, eliminated: [], note: `The list is sorted, so start in the middle and throw away half each time.`, checks: 0 },
  ];
  const eliminated = new Set<number>();
  let low = 0;
  let high = list.length - 1;
  let checks = 0;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    checks++;
    if (list[mid] === target) {
      frames.push({ index: mid, low, high, eliminated: [...eliminated], found: mid, note: `The middle box holds ${target} — found it in ${checks} check${checks > 1 ? 's' : ''}.`, checks });
      return frames;
    }
    const goRight = list[mid] < target;
    frames.push({
      index: mid,
      low,
      high,
      eliminated: [...eliminated],
      note: `Middle is ${list[mid]}, which is ${goRight ? 'smaller' : 'bigger'} than ${target}. So it must be to the ${goRight ? 'right' : 'left'}.`,
      checks,
    });
    const [from, to] = goRight ? [low, mid] : [mid, high];
    for (let i = from; i <= to; i++) eliminated.add(i);
    if (goRight) low = mid + 1;
    else high = mid - 1;
    frames.push({
      low,
      high,
      eliminated: [...eliminated],
      note: low <= high ? `Cross out that half. ${high - low + 1} box${high - low ? 'es' : ''} left to search.` : `Nothing left to search.`,
      checks,
    });
  }
  frames.push({ eliminated: [...eliminated], missing: true, note: `${target} isn’t in the list — and we only needed ${checks} checks to be sure.`, checks });
  return frames;
}

export const SEARCHERS: Record<SearchAlgorithm, (list: number[], target: number) => SearchFrame[]> = {
  linear: linearSearch,
  binary: binarySearch,
};

/**
 * Sorted list of distinct values between 1 and 99
 */
export function makeSortedList(size: number, random: () => number = Math.random): number[] {
  const values = new Set<number>();
  while (values.size < Math.min(size, 99)) values.add(1 + Math.floor(random() * 99));
  return [...values].sort((a, b) => a - b);
}

export function shuffle<T>(list: T[], random: () => number = Math.random): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
