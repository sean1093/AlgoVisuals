import {
  ArrowDownUp,
  BarChart3,
  Binary,
  Flag,
  GitBranch,
  Grid2x2,
  Hash,
  Layers,
  ListOrdered,
  MapPin,
  Network,
  Route,
  ScanSearch,
  Search,
  Shuffle,
  Spline,
  Trophy,
} from 'lucide-react';
import { getCategory, registerAlgorithm } from '../registry';
import QuadTreeVisualizer from './quadtree/QuadTreeVisualizer';
import QuadTreePreview from './quadtree/Preview';
import GeoHashVisualizer from './geohash/GeoHashVisualizer';
import GeoHashPreview from './geohash/Preview';
import SortingVisualizer from './sorting/SortingVisualizer';
import SortingRace from './sorting/SortingRace';
import { SortAlgorithm } from './sorting/logic';
import { SORT_INFO } from './sorting/content';
import SearchVisualizer from './searching/SearchVisualizer';
import PathfindingVisualizer from './pathfinding/PathfindingVisualizer';
import BSTVisualizer from './bst/BSTVisualizer';
import HeapVisualizer from './heap/HeapVisualizer';
import HashTableVisualizer from './hashtable/HashTableVisualizer';
import {
  BSTPreview,
  HashPreview,
  HeapPreview,
  SortRacePreview,
  barsPreview,
  boxesPreview,
  gridPreview,
} from './previews';

const SORT_ACCENT = getCategory('sorting').theme.accent;
const PIVOT = getCategory('searching').theme.accent;
const DONE = '#3f6b5c';
const MOVE = '#c0553a';

function sortFacts(id: SortAlgorithm) {
  const info = SORT_INFO[id];
  return [
    { label: 'Typical', value: info.average },
    { label: 'Worst', value: info.worst },
    { label: 'Memory', value: info.space },
  ];
}

/**
 * Register all algorithms
 * Simply add registration here, and Landing Page and routes will auto-update
 */
export function registerAllAlgorithms() {
  // Sorting
  registerAlgorithm({
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'sorting',
    tagline: 'Swap neighbours that are out of order until the big ones bubble to the end.',
    description: 'The simplest sort: compare each pair of neighbours and swap them if needed.',
    usedIn: ['Teaching', 'Tiny lists'],
    facts: sortFacts('bubble'),
    icon: ArrowDownUp,
    component: () => <SortingVisualizer algorithm="bubble" />,
    preview: barsPreview([20, 35, 15, 50, 45, 65, 80, 92], { 2: SORT_ACCENT, 3: SORT_ACCENT, 6: DONE, 7: DONE }),
  });
  registerAlgorithm({
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'sorting',
    tagline: 'Find the smallest, put it first. Then the next smallest. And so on.',
    description: 'Repeatedly selects the minimum of the unsorted part.',
    usedIn: ['Few-swap situations', 'Teaching'],
    facts: sortFacts('selection'),
    icon: ListOrdered,
    component: () => <SortingVisualizer algorithm="selection" />,
    preview: barsPreview([12, 25, 38, 80, 55, 20, 92, 66], { 0: DONE, 1: DONE, 2: DONE, 5: PIVOT }),
  });
  registerAlgorithm({
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'sorting',
    tagline: 'Sort like a hand of cards: slide each new card left until it fits.',
    description: 'Builds a sorted section one item at a time.',
    usedIn: ['Nearly-sorted data', 'Inside faster sorts'],
    facts: sortFacts('insertion'),
    icon: Layers,
    component: () => <SortingVisualizer algorithm="insertion" />,
    preview: barsPreview([18, 30, 52, 70, 40, 88, 24, 60], { 4: PIVOT, 3: SORT_ACCENT }),
  });
  registerAlgorithm({
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'sorting',
    tagline: 'Split the list in half until it’s trivial, then zip the sorted halves together.',
    description: 'Divide and conquer with guaranteed O(n log n).',
    usedIn: ['Huge files', 'Stable sorting'],
    facts: sortFacts('merge'),
    icon: GitBranch,
    component: () => <SortingVisualizer algorithm="merge" />,
    preview: barsPreview([22, 48, 70, 90, 15, 35, 60, 82], { 0: MOVE }),
  });
  registerAlgorithm({
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'sorting',
    tagline: 'Pick a pivot, split into smaller and bigger, repeat. Usually the fastest in practice.',
    description: 'Partition around a pivot, then sort each side.',
    usedIn: ['Standard libraries', 'General sorting'],
    facts: sortFacts('quick'),
    icon: Shuffle,
    component: () => <SortingVisualizer algorithm="quick" />,
    preview: barsPreview([30, 18, 42, 25, 55, 88, 70, 95], { 4: PIVOT }),
  });
  registerAlgorithm({
    id: 'heap-sort',
    name: 'Heap Sort',
    category: 'sorting',
    tagline: 'Build a heap so the biggest is always on top, then peel it off one by one.',
    description: 'Uses a binary heap to sort in place.',
    usedIn: ['Guaranteed speed', 'Low memory'],
    facts: sortFacts('heap'),
    icon: BarChart3,
    component: () => <SortingVisualizer algorithm="heap" />,
    preview: barsPreview([80, 62, 70, 30, 45, 20, 88, 95], { 0: SORT_ACCENT, 6: DONE, 7: DONE }),
  });
  registerAlgorithm({
    id: 'sorting-race',
    name: 'Sorting Race',
    category: 'sorting',
    tagline: 'Six sorting strategies, one list, side by side. Who finishes first?',
    description: 'Compare all sorting algorithms on the same input.',
    usedIn: ['Comparing', 'Building intuition'],
    icon: Trophy,
    component: SortingRace,
    preview: SortRacePreview,
  });

  // Searching
  registerAlgorithm({
    id: 'linear-search',
    name: 'Linear Search',
    category: 'searching',
    tagline: 'Check every box, one after another, until you find it.',
    description: 'The straightforward way to search any list.',
    usedIn: ['Unsorted data', 'Short lists'],
    facts: [
      { label: 'Worst', value: 'O(n)' },
      { label: 'Needs sorting', value: 'No' },
    ],
    icon: ScanSearch,
    component: () => <SearchVisualizer algorithm="linear" />,
    preview: boxesPreview('linear'),
  });
  registerAlgorithm({
    id: 'binary-search',
    name: 'Binary Search',
    category: 'searching',
    tagline: 'Look in the middle, throw away half, repeat. A million items in 20 steps.',
    description: 'Search a sorted list by halving the range each time.',
    usedIn: ['Dictionaries', 'Databases', 'git bisect'],
    facts: [
      { label: 'Worst', value: 'O(log n)' },
      { label: 'Needs sorting', value: 'Yes' },
    ],
    icon: Search,
    component: () => <SearchVisualizer algorithm="binary" />,
    preview: boxesPreview('binary'),
  });

  // Graphs & paths
  registerAlgorithm({
    id: 'bfs',
    name: 'Breadth-First Search',
    category: 'graphs',
    tagline: 'Explore outward in rings, so the first route you find has the fewest steps.',
    description: 'Visits neighbours level by level using a queue.',
    usedIn: ['Social networks', 'Puzzle solving', 'Web crawlers'],
    facts: [
      { label: 'Shortest', value: 'Fewest steps' },
      { label: 'Time', value: 'O(V + E)' },
    ],
    icon: Network,
    component: () => <PathfindingVisualizer algorithm="bfs" />,
    preview: gridPreview('bfs'),
  });
  registerAlgorithm({
    id: 'dfs',
    name: 'Depth-First Search',
    category: 'graphs',
    tagline: 'Follow one corridor as deep as it goes, then back up and try the next.',
    description: 'Explores as far as possible along each branch using a stack.',
    usedIn: ['Maze generation', 'Detecting cycles', 'Solving puzzles'],
    facts: [
      { label: 'Shortest', value: 'No' },
      { label: 'Time', value: 'O(V + E)' },
    ],
    icon: Spline,
    component: () => <PathfindingVisualizer algorithm="dfs" />,
    preview: gridPreview('dfs'),
  });
  registerAlgorithm({
    id: 'dijkstra',
    name: 'Dijkstra',
    category: 'graphs',
    tagline: 'Always continue from the cheapest place so far. Finds the best route, even through mud.',
    description: 'Shortest paths with weighted edges using a priority queue.',
    usedIn: ['Route planners', 'Network routing'],
    facts: [
      { label: 'Shortest', value: 'Cheapest' },
      { label: 'Time', value: 'O((V+E) log V)' },
    ],
    icon: Route,
    component: () => <PathfindingVisualizer algorithm="dijkstra" />,
    preview: gridPreview('dijkstra'),
  });
  registerAlgorithm({
    id: 'astar',
    name: 'A* Search',
    category: 'graphs',
    tagline: 'Dijkstra with a sense of direction: head towards the goal and skip the detours.',
    description: 'Best-first search guided by a distance estimate.',
    usedIn: ['Video games', 'Maps', 'Robotics'],
    facts: [
      { label: 'Shortest', value: 'Cheapest' },
      { label: 'Explores', value: 'Fewer cells' },
    ],
    icon: Flag,
    component: () => <PathfindingVisualizer algorithm="astar" />,
    preview: gridPreview('astar'),
  });

  // Data structures
  registerAlgorithm({
    id: 'binary-search-tree',
    name: 'Binary Search Tree',
    category: 'structures',
    tagline: 'Smaller to the left, bigger to the right — so every step down halves the search.',
    description: 'An ordered tree supporting fast search, insert and delete.',
    usedIn: ['Ordered maps', 'Databases', 'File systems'],
    facts: [
      { label: 'Typical', value: 'O(log n)' },
      { label: 'Worst', value: 'O(n)' },
    ],
    icon: Binary,
    component: BSTVisualizer,
    preview: BSTPreview,
  });
  registerAlgorithm({
    id: 'binary-heap',
    name: 'Binary Heap',
    category: 'structures',
    tagline: 'A tree that always keeps the smallest item on top — the perfect “what’s next?” list.',
    description: 'A priority queue stored in a plain array.',
    usedIn: ['Task schedulers', 'Dijkstra', 'Top-k lists'],
    facts: [
      { label: 'Peek', value: 'O(1)' },
      { label: 'Push / pop', value: 'O(log n)' },
    ],
    icon: Layers,
    component: HeapVisualizer,
    preview: HeapPreview,
  });
  registerAlgorithm({
    id: 'hash-table',
    name: 'Hash Table',
    category: 'structures',
    tagline: 'Turn a key into a bucket number, so finding it is one jump instead of a search.',
    description: 'Key lookup in constant time using a hash function and buckets.',
    usedIn: ['Dictionaries', 'Caches', 'Database indexes'],
    facts: [
      { label: 'Typical', value: 'O(1)' },
      { label: 'Worst', value: 'O(n)' },
    ],
    icon: Hash,
    component: HashTableVisualizer,
    preview: HashPreview,
  });

  // Spatial & maps
  registerAlgorithm({
    id: 'quadtree',
    name: 'QuadTree',
    category: 'spatial',
    tagline: 'Split space into boxes, so finding what’s nearby takes a glance instead of a search.',
    description:
      'A QuadTree keeps cutting a crowded area into four smaller boxes until each box holds only a handful of things.',
    usedIn: ['Game collisions', 'Map markers', 'Image compression'],
    icon: Grid2x2,
    theme: { accent: '#3f6b5c', soft: '#e2ebe4' },
    component: QuadTreeVisualizer,
    preview: QuadTreePreview,
  });

  registerAlgorithm({
    id: 'geohash',
    name: 'GeoHash',
    category: 'spatial',
    tagline: 'Turn any place on Earth into a short code — the longer the code, the smaller the area.',
    description:
      'GeoHash folds latitude and longitude into a few letters, so places that are close together usually share the same beginning.',
    usedIn: ['Ride-hailing', 'Nearby search', 'Location databases'],
    icon: MapPin,
    theme: { accent: '#c0553a', soft: '#f5e1d8' },
    component: GeoHashVisualizer,
    preview: GeoHashPreview,
  });
}
