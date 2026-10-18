/**
 * Grid pathfinding: BFS, DFS, Dijkstra and A*, recording the order cells are explored
 */

export type PathAlgorithm = 'bfs' | 'dfs' | 'dijkstra' | 'astar';

export const MUD_COST = 5;

export interface Grid {
  rows: number;
  cols: number;
  walls: Set<number>;
  /** Cells that cost MUD_COST to enter instead of 1 */
  mud: Set<number>;
  start: number;
  end: number;
}

export interface PathResult {
  /** Cells in the order they were explored (taken off the queue) */
  order: number[];
  /** Step at which each cell was first discovered (-1 if never) */
  discovered: Int32Array;
  /** Step at which each cell was explored (-1 if never) */
  explored: Int32Array;
  /** Start → end, empty if unreachable */
  path: number[];
  /** Total cost of the path (mud counts as MUD_COST) */
  cost: number;
}

export const toIndex = (grid: Pick<Grid, 'cols'>, row: number, col: number) => row * grid.cols + col;
export const toRowCol = (grid: Pick<Grid, 'cols'>, index: number) => [Math.floor(index / grid.cols), index % grid.cols] as const;

export function neighbours(grid: Grid, index: number): number[] {
  const [r, c] = toRowCol(grid, index);
  const out: number[] = [];
  // Up, right, down, left
  if (r > 0) out.push(index - grid.cols);
  if (c < grid.cols - 1) out.push(index + 1);
  if (r < grid.rows - 1) out.push(index + grid.cols);
  if (c > 0) out.push(index - 1);
  return out.filter((n) => !grid.walls.has(n));
}

export const stepCost = (grid: Grid, index: number) => (grid.mud.has(index) ? MUD_COST : 1);

function manhattan(grid: Grid, a: number, b: number) {
  const [ar, ac] = toRowCol(grid, a);
  const [br, bc] = toRowCol(grid, b);
  return Math.abs(ar - br) + Math.abs(ac - bc);
}

/**
 * Minimal binary heap keyed by [priority, tiebreak]
 */
class MinHeap {
  private items: { key: [number, number]; value: number }[] = [];

  get size() {
    return this.items.length;
  }

  private less(i: number, j: number) {
    const [a1, a2] = this.items[i].key;
    const [b1, b2] = this.items[j].key;
    return a1 < b1 || (a1 === b1 && a2 < b2);
  }

  push(value: number, key: [number, number]) {
    this.items.push({ key, value });
    let i = this.items.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.less(i, p)) break;
      [this.items[i], this.items[p]] = [this.items[p], this.items[i]];
      i = p;
    }
  }

  pop(): number | undefined {
    if (!this.items.length) return undefined;
    const top = this.items[0].value;
    const last = this.items.pop()!;
    if (this.items.length) {
      this.items[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < this.items.length && this.less(l, m)) m = l;
        if (r < this.items.length && this.less(r, m)) m = r;
        if (m === i) break;
        [this.items[i], this.items[m]] = [this.items[m], this.items[i]];
        i = m;
      }
    }
    return top;
  }
}

export function findPath(grid: Grid, algorithm: PathAlgorithm): PathResult {
  const total = grid.rows * grid.cols;
  const discovered = new Int32Array(total).fill(-1);
  const explored = new Int32Array(total).fill(-1);
  const parent = new Int32Array(total).fill(-1);
  const order: number[] = [];
  let found = false;

  const explore = (cell: number) => {
    explored[cell] = order.length;
    order.push(cell);
  };

  if (algorithm === 'bfs' || algorithm === 'dfs') {
    // BFS uses a queue, DFS a stack; both ignore mud
    const pending = [grid.start];
    let head = 0; // BFS reads from the front without shifting the array
    discovered[grid.start] = 0;
    while (head < pending.length) {
      const cell = algorithm === 'bfs' ? pending[head++] : pending.pop()!;
      if (explored[cell] !== -1) continue;
      explore(cell);
      if (cell === grid.end) {
        found = true;
        break;
      }
      const next = neighbours(grid, cell);
      // Reverse for DFS so it tries "up" first, matching BFS's visual order
      for (const n of algorithm === 'dfs' ? next.reverse() : next) {
        if (algorithm === 'bfs' && discovered[n] !== -1) continue;
        if (explored[n] !== -1) continue;
        if (discovered[n] === -1) discovered[n] = order.length;
        parent[n] = cell;
        pending.push(n);
      }
    }
  } else {
    const dist = new Float64Array(total).fill(Infinity);
    const heap = new MinHeap();
    dist[grid.start] = 0;
    discovered[grid.start] = 0;
    const h = (cell: number) => (algorithm === 'astar' ? manhattan(grid, cell, grid.end) : 0);
    heap.push(grid.start, [h(grid.start), h(grid.start)]);
    while (heap.size) {
      const cell = heap.pop()!;
      if (explored[cell] !== -1) continue;
      explore(cell);
      if (cell === grid.end) {
        found = true;
        break;
      }
      for (const n of neighbours(grid, cell)) {
        if (explored[n] !== -1) continue;
        const d = dist[cell] + stepCost(grid, n);
        if (d < dist[n]) {
          dist[n] = d;
          parent[n] = cell;
          if (discovered[n] === -1) discovered[n] = order.length;
          heap.push(n, [d + h(n), h(n)]);
        }
      }
    }
  }

  const path: number[] = [];
  if (found) {
    for (let c = grid.end; c !== -1; c = parent[c]) path.unshift(c);
  }
  const cost = path.slice(1).reduce((sum, c) => sum + stepCost(grid, c), 0);
  return { order, discovered, explored, path, cost };
}

export function emptyGrid(rows: number, cols: number): Grid {
  const mid = Math.floor(rows / 2);
  return {
    rows,
    cols,
    walls: new Set(),
    mud: new Set(),
    start: toIndex({ cols }, mid, Math.floor(cols / 6)),
    end: toIndex({ cols }, mid, cols - 1 - Math.floor(cols / 6)),
  };
}

/**
 * Perfect maze via randomised depth-first carving (needs odd rows/cols)
 */
export function mazeGrid(rows: number, cols: number, random: () => number = Math.random): Grid {
  const walls = new Set<number>();
  for (let i = 0; i < rows * cols; i++) walls.add(i);
  const carve = (r: number, c: number) => walls.delete(r * cols + c);
  const stack: [number, number][] = [[1, 1]];
  carve(1, 1);
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const options = ([[-2, 0], [0, 2], [2, 0], [0, -2]] as const).filter(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      return nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && walls.has(nr * cols + nc);
    });
    if (!options.length) {
      stack.pop();
      continue;
    }
    const [dr, dc] = options[Math.floor(random() * options.length)];
    carve(r + dr / 2, c + dc / 2);
    carve(r + dr, c + dc);
    stack.push([r + dr, c + dc]);
  }
  // Knock out a few extra walls so there is more than one route
  for (let k = 0; k < Math.floor((rows * cols) / 30); k++) {
    const r = 1 + Math.floor(random() * (rows - 2));
    const c = 1 + Math.floor(random() * (cols - 2));
    if ((r + c) % 2 === 1) walls.delete(r * cols + c);
  }
  return { rows, cols, walls, mud: new Set(), start: toIndex({ cols }, 1, 1), end: toIndex({ cols }, rows - 2, cols - 2) };
}

/**
 * Random walls and mud patches, keeping start and end clear
 */
export function scatterGrid(grid: Grid, random: () => number = Math.random): Grid {
  const walls = new Set<number>();
  const mud = new Set<number>();
  for (let i = 0; i < grid.rows * grid.cols; i++) {
    if (i === grid.start || i === grid.end) continue;
    const roll = random();
    if (roll < 0.22) walls.add(i);
    else if (roll < 0.34) mud.add(i);
  }
  return { ...grid, walls, mud };
}

/**
 * A friendly first grid: a wall to walk around and a mud pond to avoid
 */
export function starterGrid(rows: number, cols: number): Grid {
  const grid = emptyGrid(rows, cols);
  const wallCol = Math.floor(cols / 2);
  for (let r = 2; r < rows; r++) grid.walls.add(toIndex(grid, r, wallCol));
  for (let r = 1; r < 6; r++) {
    for (let c = wallCol - 5; c < wallCol - 1; c++) grid.mud.add(toIndex(grid, r, c));
  }
  return grid;
}
