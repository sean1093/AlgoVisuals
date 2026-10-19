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
const DONE = 'var(--color-sage)';
const MOVE = 'var(--color-clay)';

/**
 * Register all algorithms
 * Simply add registration here, and Landing Page and routes will auto-update
 */
export function registerAllAlgorithms() {
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

  // Graphs & paths
  registerAlgorithm({
    id: 'bfs',
    category: 'graphs',
    icon: Network,
    component: () => <PathfindingVisualizer algorithm="bfs" />,
    preview: gridPreview('bfs'),
  });
  registerAlgorithm({
    id: 'dfs',
    category: 'graphs',
    icon: Spline,
    component: () => <PathfindingVisualizer algorithm="dfs" />,
    preview: gridPreview('dfs'),
  });
  registerAlgorithm({
    id: 'dijkstra',
    category: 'graphs',
    icon: Route,
    component: () => <PathfindingVisualizer algorithm="dijkstra" />,
    preview: gridPreview('dijkstra'),
  });
  registerAlgorithm({
    id: 'astar',
    category: 'graphs',
    icon: Flag,
    component: () => <PathfindingVisualizer algorithm="astar" />,
    preview: gridPreview('astar'),
  });

  // Data structures
  registerAlgorithm({
    id: 'binary-search-tree',
    category: 'structures',
    icon: Binary,
    component: BSTVisualizer,
    preview: BSTPreview,
  });
  registerAlgorithm({
    id: 'binary-heap',
    category: 'structures',
    icon: Layers,
    component: HeapVisualizer,
    preview: HeapPreview,
  });
  registerAlgorithm({
    id: 'hash-table',
    category: 'structures',
    icon: Hash,
    component: HashTableVisualizer,
    preview: HashPreview,
  });

  // Spatial & maps
  registerAlgorithm({
    id: 'quadtree',
    category: 'spatial',
    icon: Grid2x2,
    theme: { accent: 'var(--color-sage)', soft: 'var(--color-sage-soft)' },
    component: QuadTreeVisualizer,
    preview: QuadTreePreview,
  });

  registerAlgorithm({
    id: 'geohash',
    category: 'spatial',
    icon: MapPin,
    theme: { accent: 'var(--color-clay)', soft: 'var(--color-clay-soft)' },
    component: GeoHashVisualizer,
    preview: GeoHashPreview,
  });
}
