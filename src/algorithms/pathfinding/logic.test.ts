import { describe, expect, it } from 'vitest';
import { Grid, MUD_COST, PathAlgorithm, emptyGrid, findPath, mazeGrid, neighbours, scatterGrid, stepCost } from './logic';

function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const ALL: PathAlgorithm[] = ['bfs', 'dfs', 'dijkstra', 'astar'];

function isValidPath(grid: Grid, path: number[]) {
  if (path[0] !== grid.start || path[path.length - 1] !== grid.end) return false;
  return path.every((cell, i) => !grid.walls.has(cell) && (i === 0 || neighbours(grid, path[i - 1]).includes(cell)));
}

// Reference shortest-path cost (Bellman-Ford style relaxation) for cross-checking
function referenceCost(grid: Grid): number {
  const dist = new Array(grid.rows * grid.cols).fill(Infinity);
  dist[grid.start] = 0;
  for (let changed = true; changed; ) {
    changed = false;
    for (let c = 0; c < dist.length; c++) {
      if (dist[c] === Infinity || grid.walls.has(c)) continue;
      for (const n of neighbours(grid, c)) {
        if (dist[c] + stepCost(grid, n) < dist[n]) {
          dist[n] = dist[c] + stepCost(grid, n);
          changed = true;
        }
      }
    }
  }
  return dist[grid.end];
}

describe('pathfinding', () => {
  it('every algorithm finds a valid path on random grids', () => {
    for (let s = 1; s <= 25; s++) {
      const grid = scatterGrid(emptyGrid(15, 25), seeded(s));
      const reachable = referenceCost(grid) !== Infinity;
      for (const algo of ALL) {
        const result = findPath(grid, algo);
        if (reachable) expect(isValidPath(grid, result.path)).toBe(true);
        else expect(result.path).toEqual([]);
      }
    }
  });

  it('Dijkstra and A* find the cheapest path through mud', () => {
    for (let s = 1; s <= 25; s++) {
      const grid = scatterGrid(emptyGrid(15, 25), seeded(100 + s));
      const best = referenceCost(grid);
      if (best === Infinity) continue;
      expect(findPath(grid, 'dijkstra').cost).toBe(best);
      expect(findPath(grid, 'astar').cost).toBe(best);
    }
  });

  it('BFS finds the fewest steps when there is no mud', () => {
    for (let s = 1; s <= 10; s++) {
      const grid = { ...scatterGrid(emptyGrid(15, 25), seeded(200 + s)), mud: new Set<number>() };
      const best = referenceCost(grid);
      if (best === Infinity) continue;
      expect(findPath(grid, 'bfs').path.length - 1).toBe(best);
    }
  });

  it('A* explores no more cells than Dijkstra on an open grid', () => {
    const grid = emptyGrid(17, 31);
    expect(findPath(grid, 'astar').order.length).toBeLessThan(findPath(grid, 'dijkstra').order.length);
  });

  it('explores each cell at most once and records consistent steps', () => {
    const grid = mazeGrid(17, 31, seeded(5));
    for (const algo of ALL) {
      const { order, explored, discovered } = findPath(grid, algo);
      expect(new Set(order).size).toBe(order.length);
      order.forEach((cell, step) => {
        expect(explored[cell]).toBe(step);
        expect(discovered[cell]).toBeLessThanOrEqual(step);
      });
    }
  });

  it('mazes are solvable and keep start and end open', () => {
    for (let s = 1; s <= 10; s++) {
      const grid = mazeGrid(17, 31, seeded(s));
      expect(grid.walls.has(grid.start)).toBe(false);
      expect(grid.walls.has(grid.end)).toBe(false);
      expect(findPath(grid, 'bfs').path.length).toBeGreaterThan(0);
    }
  });

  it('counts mud in the path cost', () => {
    const grid = emptyGrid(1, 5);
    grid.start = 0;
    grid.end = 4;
    grid.mud = new Set([2]);
    expect(findPath(grid, 'bfs').cost).toBe(3 + MUD_COST);
  });
});
