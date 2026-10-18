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

/**
 * Plain-language step descriptions; English by default, swapped for a translation by the UI
 */
export const SEARCH_MESSAGES = {
  linearIntro: (target: number) => `Look for ${target} by checking every box from left to right.`,
  linearFound: (box: number, target: number, checks: number) =>
    `Box ${box} holds ${target} — found it after ${checks} check${checks > 1 ? 's' : ''}.`,
  linearMiss: (box: number, value: number) => `Box ${box} holds ${value}. Not it — move on.`,
  linearMissing: (count: number, target: number) => `Checked all ${count} boxes: ${target} isn’t in the list.`,
  binaryIntro: 'The list is sorted, so start in the middle and throw away half each time.',
  binaryFound: (target: number, checks: number) =>
    `The middle box holds ${target} — found it in ${checks} check${checks > 1 ? 's' : ''}.`,
  binaryGoRight: (middle: number, target: number) => `Middle is ${middle}, which is smaller than ${target}. So it must be to the right.`,
  binaryGoLeft: (middle: number, target: number) => `Middle is ${middle}, which is bigger than ${target}. So it must be to the left.`,
  binaryLeft: (remaining: number) => `Cross out that half. ${remaining} box${remaining === 1 ? '' : 'es'} left to search.`,
  binaryNothingLeft: 'Nothing left to search.',
  binaryMissing: (target: number, checks: number) => `${target} isn’t in the list — and we only needed ${checks} checks to be sure.`,
};

export type SearchMessages = typeof SEARCH_MESSAGES;

export function linearSearch(list: number[], target: number, m: SearchMessages = SEARCH_MESSAGES): SearchFrame[] {
  const frames: SearchFrame[] = [{ eliminated: [], note: m.linearIntro(target), checks: 0 }];
  const eliminated: number[] = [];
  for (let i = 0; i < list.length; i++) {
    const checks = i + 1;
    if (list[i] === target) {
      frames.push({ index: i, eliminated: [...eliminated], found: i, note: m.linearFound(i + 1, target, checks), checks });
      return frames;
    }
    frames.push({ index: i, eliminated: [...eliminated], note: m.linearMiss(i + 1, list[i]), checks });
    eliminated.push(i);
  }
  frames.push({ eliminated: [...eliminated], missing: true, note: m.linearMissing(list.length, target), checks: list.length });
  return frames;
}

/**
 * Binary search; `list` must be sorted ascending
 */
export function binarySearch(list: number[], target: number, m: SearchMessages = SEARCH_MESSAGES): SearchFrame[] {
  const frames: SearchFrame[] = [
    { low: 0, high: list.length - 1, eliminated: [], note: m.binaryIntro, checks: 0 },
  ];
  const eliminated = new Set<number>();
  let low = 0;
  let high = list.length - 1;
  let checks = 0;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    checks++;
    if (list[mid] === target) {
      frames.push({ index: mid, low, high, eliminated: [...eliminated], found: mid, note: m.binaryFound(target, checks), checks });
      return frames;
    }
    const goRight = list[mid] < target;
    frames.push({
      index: mid,
      low,
      high,
      eliminated: [...eliminated],
      note: goRight ? m.binaryGoRight(list[mid], target) : m.binaryGoLeft(list[mid], target),
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
      note: low <= high ? m.binaryLeft(high - low + 1) : m.binaryNothingLeft,
      checks,
    });
  }
  frames.push({ eliminated: [...eliminated], missing: true, note: m.binaryMissing(target, checks), checks });
  return frames;
}

export const SEARCHERS: Record<SearchAlgorithm, (list: number[], target: number, m?: SearchMessages) => SearchFrame[]> = {
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
