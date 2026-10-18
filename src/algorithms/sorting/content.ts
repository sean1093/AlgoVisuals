import { SortAlgorithm } from './logic';

export interface SortInfo {
  /** Short paragraphs explaining the idea in plain language */
  idea: string[];
  best: string;
  average: string;
  worst: string;
  space: string;
  stable: boolean;
  goodAt: string;
  badAt: string;
}

export const SORT_INFO: Record<SortAlgorithm, SortInfo> = {
  bubble: {
    idea: [
      'Walk along the list comparing each pair of neighbours. Whenever the left one is bigger, swap them.',
      'After one full pass, the biggest bar has “bubbled” all the way to the right. Repeat on the rest until a pass makes no swaps.',
    ],
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: true,
    goodAt: 'Tiny lists and teaching. It can stop early when the list is already in order.',
    badAt: 'Anything large — it does far more swaps than any other method here.',
  },
  selection: {
    idea: [
      'Scan the unsorted part to find the smallest bar, then swap it to the front. Now the front bar is done.',
      'Repeat with what’s left. It always does the same number of comparisons, no matter how the list starts.',
    ],
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: false,
    goodAt: 'Situations where moving data is expensive — it makes at most n − 1 swaps.',
    badAt: 'Already-sorted lists: it still checks everything.',
  },
  insertion: {
    idea: [
      'Like sorting playing cards in your hand: take the next card and slide it left until it sits in the right spot.',
      'The left side is always sorted. On nearly-sorted input each card only moves a little, which makes it very fast.',
    ],
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: true,
    goodAt: 'Small or nearly-sorted lists. Real libraries use it for the tiny pieces inside bigger sorts.',
    badAt: 'Reversed lists — every card has to travel all the way to the front.',
  },
  merge: {
    idea: [
      'Split the list in half, sort each half, then zip the two sorted halves together by repeatedly taking the smaller front bar.',
      'Splitting continues until pieces have one bar, which is sorted by definition. The work is the merging on the way back up.',
    ],
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(n)',
    stable: true,
    goodAt: 'Predictable speed on any input, and sorting data that doesn’t fit in memory.',
    badAt: 'Memory: it needs extra space as big as the list itself.',
  },
  quick: {
    idea: [
      'Pick a pivot. Move every smaller bar to its left and every bigger bar to its right — now the pivot is in its final spot.',
      'Do the same to the left group and the right group. Each round shrinks the problem, usually by about half.',
    ],
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n²)',
    space: 'O(log n)',
    stable: false,
    goodAt: 'General-purpose sorting. It’s usually the fastest in practice and sorts in place.',
    badAt: 'Unlucky pivots. Try “Reversed”: always picking the last bar makes it slow.',
  },
  heap: {
    idea: [
      'First arrange the bars into a heap — a tree hidden inside the list where each parent is bigger than its two children.',
      'The biggest bar is now at the front. Swap it to the end, repair the heap, and repeat.',
    ],
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(1)',
    stable: false,
    goodAt: 'Guaranteed O(n log n) without extra memory.',
    badAt: 'Real-world speed: it jumps around the list, which computers find slow.',
  },
};
