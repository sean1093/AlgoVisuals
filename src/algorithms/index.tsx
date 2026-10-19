import {
  ArrowDownUp,
  ArrowRightLeft,
  Calculator,
  Crown,
  Link2,
  ListTree,
  Merge,
  PencilLine,
  Workflow,
  Cable,
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
import SearchVisualizer from './searching/SearchVisualizer';
import PathfindingVisualizer from './pathfinding/PathfindingVisualizer';
import BSTVisualizer from './bst/BSTVisualizer';
import HeapVisualizer from './heap/HeapVisualizer';
import HashTableVisualizer from './hashtable/HashTableVisualizer';
import LinkedListVisualizer from './linkedlist/LinkedListVisualizer';
import StackQueueVisualizer from './stackqueue/StackQueueVisualizer';
import TrieVisualizer from './trie/TrieVisualizer';
import TopoSortVisualizer from './graphs/TopoSortVisualizer';
import MSTVisualizer from './graphs/MSTVisualizer';
import UnionFindVisualizer from './graphs/UnionFindVisualizer';
import FibonacciVisualizer from './dp/FibonacciVisualizer';
import EditDistanceVisualizer from './dp/EditDistanceVisualizer';
import QueensVisualizer from './dp/QueensVisualizer';
import {
  BSTPreview,
  EditDistancePreview,
  FibPreview,
  HashPreview,
  HeapPreview,
  LinkedListPreview,
  MSTPreview,
  QueensPreview,
  StackQueuePreview,
  TopoPreview,
  TriePreview,
  UnionFindPreview,
  SortRacePreview,
  barsPreview,
  boxesPreview,
  gridPreview,
} from './previews';

const SORT_ACCENT = getCategory('sorting').theme.accent;
const PIVOT = getCategory('searching').theme.accent;
const DONE = 'var(--color-sage)';
const MOVE = 'var(--color-clay)';

/**
 * Register all algorithms
 * Simply add registration here, and Landing Page and routes will auto-update
 */
export function registerAllAlgorithms() {
  // Lists, stacks & queues
  registerAlgorithm({
    id: 'linked-list',
    category: 'lists',
    icon: Link2,
    component: LinkedListVisualizer,
    preview: LinkedListPreview,
  });
  registerAlgorithm({
    id: 'stack-queue',
    category: 'lists',
    icon: ArrowRightLeft,
    component: StackQueueVisualizer,
    preview: StackQueuePreview,
  });

  // Sorting
  registerAlgorithm({
    id: 'bubble-sort',
    category: 'sorting',
    icon: ArrowDownUp,
    component: () => <SortingVisualizer algorithm="bubble" />,
    preview: barsPreview([20, 35, 15, 50, 45, 65, 80, 92], { 2: SORT_ACCENT, 3: SORT_ACCENT, 6: DONE, 7: DONE }),
  });
  registerAlgorithm({
    id: 'selection-sort',
    category: 'sorting',
    icon: ListOrdered,
    component: () => <SortingVisualizer algorithm="selection" />,
    preview: barsPreview([12, 25, 38, 80, 55, 20, 92, 66], { 0: DONE, 1: DONE, 2: DONE, 5: PIVOT }),
  });
  registerAlgorithm({
    id: 'insertion-sort',
    category: 'sorting',
    icon: Layers,
    component: () => <SortingVisualizer algorithm="insertion" />,
    preview: barsPreview([18, 30, 52, 70, 40, 88, 24, 60], { 4: PIVOT, 3: SORT_ACCENT }),
  });
  registerAlgorithm({
    id: 'merge-sort',
    category: 'sorting',
    icon: GitBranch,
    component: () => <SortingVisualizer algorithm="merge" />,
    preview: barsPreview([22, 48, 70, 90, 15, 35, 60, 82], { 0: MOVE }),
  });
  registerAlgorithm({
    id: 'quick-sort',
    category: 'sorting',
    icon: Shuffle,
    component: () => <SortingVisualizer algorithm="quick" />,
    preview: barsPreview([30, 18, 42, 25, 55, 88, 70, 95], { 4: PIVOT }),
  });
  registerAlgorithm({
    id: 'heap-sort',
    category: 'sorting',
    icon: BarChart3,
    component: () => <SortingVisualizer algorithm="heap" />,
    preview: barsPreview([80, 62, 70, 30, 45, 20, 88, 95], { 0: SORT_ACCENT, 6: DONE, 7: DONE }),
  });
  registerAlgorithm({
    id: 'sorting-race',
    category: 'sorting',
    icon: Trophy,
    component: SortingRace,
    preview: SortRacePreview,
  });

  // Searching
  registerAlgorithm({
    id: 'linear-search',
    category: 'searching',
    icon: ScanSearch,
    component: () => <SearchVisualizer algorithm="linear" />,
    preview: boxesPreview('linear'),
  });
  registerAlgorithm({
    id: 'binary-search',
    category: 'searching',
    icon: Search,
    component: () => <SearchVisualizer algorithm="binary" />,
    preview: boxesPreview('binary'),
  });

  // Paths & mazes
  registerAlgorithm({
    id: 'bfs',
    category: 'paths',
    icon: Network,
    component: () => <PathfindingVisualizer algorithm="bfs" />,
    preview: gridPreview('bfs'),
  });
  registerAlgorithm({
    id: 'dfs',
    category: 'paths',
    icon: Spline,
    component: () => <PathfindingVisualizer algorithm="dfs" />,
    preview: gridPreview('dfs'),
  });
  registerAlgorithm({
    id: 'dijkstra',
    category: 'paths',
    icon: Route,
    component: () => <PathfindingVisualizer algorithm="dijkstra" />,
    preview: gridPreview('dijkstra'),
  });
  registerAlgorithm({
    id: 'astar',
    category: 'paths',
    icon: Flag,
    component: () => <PathfindingVisualizer algorithm="astar" />,
    preview: gridPreview('astar'),
  });

  // Trees & heaps
  registerAlgorithm({
    id: 'binary-search-tree',
    category: 'trees',
    icon: Binary,
    component: BSTVisualizer,
    preview: BSTPreview,
  });
  registerAlgorithm({
    id: 'binary-heap',
    category: 'trees',
    icon: Layers,
    component: HeapVisualizer,
    preview: HeapPreview,
  });
  registerAlgorithm({
    id: 'trie',
    category: 'trees',
    icon: ListTree,
    component: TrieVisualizer,
    preview: TriePreview,
  });
  registerAlgorithm({
    id: 'hash-table',
    category: 'indexes',
    icon: Hash,
    component: HashTableVisualizer,
    preview: HashPreview,
  });

  // Hashing & spatial indexes
  registerAlgorithm({
    id: 'quadtree',
    category: 'indexes',
    icon: Grid2x2,
    theme: { accent: 'var(--color-sage)', soft: 'var(--color-sage-soft)' },
    component: QuadTreeVisualizer,
    preview: QuadTreePreview,
  });

  registerAlgorithm({
    id: 'geohash',
    category: 'indexes',
    icon: MapPin,
    theme: { accent: 'var(--color-clay)', soft: 'var(--color-clay-soft)' },
    component: GeoHashVisualizer,
    preview: GeoHashPreview,
  });

  // Graph problems
  registerAlgorithm({
    id: 'topological-sort',
    category: 'graphs',
    icon: Workflow,
    component: TopoSortVisualizer,
    preview: TopoPreview,
  });
  registerAlgorithm({
    id: 'minimum-spanning-tree',
    category: 'graphs',
    icon: Cable,
    component: MSTVisualizer,
    preview: MSTPreview,
  });
  registerAlgorithm({
    id: 'union-find',
    category: 'graphs',
    icon: Merge,
    component: UnionFindVisualizer,
    preview: UnionFindPreview,
  });

  // Recursion & dynamic programming
  registerAlgorithm({
    id: 'fibonacci',
    category: 'dp',
    icon: Calculator,
    component: FibonacciVisualizer,
    preview: FibPreview,
  });
  registerAlgorithm({
    id: 'edit-distance',
    category: 'dp',
    icon: PencilLine,
    component: EditDistanceVisualizer,
    preview: EditDistancePreview,
  });
  registerAlgorithm({
    id: 'n-queens',
    category: 'dp',
    icon: Crown,
    component: QueensVisualizer,
    preview: QueensPreview,
  });
}
