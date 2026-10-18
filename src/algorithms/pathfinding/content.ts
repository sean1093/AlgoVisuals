import { PathAlgorithm } from './logic';

export const PATH_NAMES: Record<PathAlgorithm, string> = {
  bfs: 'Breadth-First Search',
  dfs: 'Depth-First Search',
  dijkstra: 'Dijkstra',
  astar: 'A* Search',
};

export const PATH_INFO: Record<
  PathAlgorithm,
  { short: string; title: string; idea: string[]; exploring: string; facts: { label: string; value: string; hint?: string }[] }
> = {
  bfs: {
    short: 'BFS',
    title: 'Spread out like a ripple',
    idea: [
      'Explore every cell one step away, then every cell two steps away, and so on — like ripples in a pond.',
      'Because it goes ring by ring, the first time it reaches the flag is guaranteed to be by the fewest steps. It doesn’t notice mud, though: every step counts the same.',
    ],
    exploring: 'BFS explores in rings — everything 1 step away, then 2, then 3…',
    facts: [
      { label: 'Shortest path', value: 'Yes', hint: 'Fewest steps, ignoring mud' },
      { label: 'Understands mud', value: 'No' },
      { label: 'Time', value: 'O(V + E)', hint: 'V cells, E connections' },
      { label: 'Uses', value: 'Queue' },
    ],
  },
  dfs: {
    short: 'DFS',
    title: 'Follow one path as far as it goes',
    idea: [
      'Pick a direction and keep going until you hit a dead end, then back up to the last junction and try the next way.',
      'It uses very little memory and is great for exploring every corner — but the route it finds is often wildly longer than it needs to be.',
    ],
    exploring: 'DFS dives down one corridor as deep as it can before backing up.',
    facts: [
      { label: 'Shortest path', value: 'No' },
      { label: 'Understands mud', value: 'No' },
      { label: 'Time', value: 'O(V + E)' },
      { label: 'Uses', value: 'Stack' },
    ],
  },
  dijkstra: {
    short: 'Dijkstra',
    title: 'Always expand the cheapest place so far',
    idea: [
      'Keep a list of places you can reach and how much it cost to get there. Always continue from the cheapest one.',
      'Mud costs 5 instead of 1, so Dijkstra happily walks around a muddy patch when that’s cheaper. It’s the classic algorithm behind route planners.',
    ],
    exploring: 'Dijkstra grows outward by cost, so it spreads slower through mud.',
    facts: [
      { label: 'Shortest path', value: 'Yes', hint: 'Cheapest, counting mud' },
      { label: 'Understands mud', value: 'Yes' },
      { label: 'Time', value: 'O((V + E) log V)' },
      { label: 'Uses', value: 'Priority queue' },
    ],
  },
  astar: {
    short: 'A*',
    title: 'Dijkstra with a sense of direction',
    idea: [
      'Like Dijkstra, but each place is scored by cost so far plus a guess of the distance still to go. Places that point towards the flag get explored first.',
      'As long as the guess never overestimates, A* still finds the cheapest path — usually after exploring far fewer cells. Games and maps use it everywhere.',
    ],
    exploring: 'A* leans towards the flag, skipping places that lead the wrong way.',
    facts: [
      { label: 'Shortest path', value: 'Yes', hint: 'With an honest distance guess' },
      { label: 'Understands mud', value: 'Yes' },
      { label: 'Time', value: 'O((V + E) log V)', hint: 'Often far less in practice' },
      { label: 'Uses', value: 'Priority queue + heuristic' },
    ],
  },
};
