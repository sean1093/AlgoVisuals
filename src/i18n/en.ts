import { SORT_MESSAGES } from '../algorithms/sorting/logic';
import { SEARCH_MESSAGES } from '../algorithms/searching/logic';
import { BST_MESSAGES } from '../algorithms/bst/logic';
import { HEAP_MESSAGES } from '../algorithms/heap/logic';

/**
 * English UI text — the source of truth. Other languages must match this shape exactly
 * (TypeScript fails the build if a key is missing).
 */
const en = {
  meta: {
    title: 'AlgoVisuals — See how algorithms think',
    demoTitle: (name: string) => `${name} — AlgoVisuals`,
  },

  common: {
    play: 'Play',
    pause: 'Pause',
    replay: 'Replay',
    backToStart: 'Back to start',
    previousStep: 'Previous step',
    nextStep: 'Next step',
    scrub: 'Scrub through steps',
    speed: 'Speed',
    speeds: ['Slow', 'Normal', 'Fast', 'Turbo'],
    tryThis: 'Try this',
    threeExperiments: 'Three small experiments',
    gotIt: 'You’ve got it!',
    adjust: 'Adjust',
    ideaInAMinute: 'The idea in a minute',
    atAGlance: 'At a glance',
    howFast: 'How fast, how much memory',
    howItWorks: 'How it works',
    goodAt: 'Good at',
    strugglesWith: 'Struggles with',
    yes: 'Yes',
    no: 'No',
    newList: 'New list',
    random: 'Random',
    empty: 'Empty',
    clear: 'Clear',
    undo: 'Undo',
    copy: 'Copy',
    whereUsed: 'Where it’s used',
    language: 'Language',
  },

  nav: {
    home: 'Home',
    browse: 'Browse',
    homeLabel: 'AlgoVisuals home',
    github: 'Source on GitHub',
    footerTagline: 'Learn by touching, not by reading code.',
    openSource: 'Open source on GitHub',
  },

  landing: {
    badge: (demos: number, topics: number) => `${demos} interactive demos · ${topics} topics · free`,
    titleStart: 'See how algorithms',
    titleEmphasis: 'think.',
    intro:
      'No code, no formulas. Press play, step through slowly, and watch an idea take shape in front of you — each one takes about two minutes to get.',
    start: (name: string) => `Start with ${name}`,
    browseCollection: 'Browse the collection',
    heroCaption: 'Sorting a fresh list, over and over',
    live: 'Live',
    topics: 'Topics',
    topicNumber: (n: string) => `Topic ${n}`,
    openDemo: 'Open the demo',
    builtFor: 'Built for curious people, not just engineers.',
    steps: [
      { title: 'Pick an idea', body: 'Each page is one idea, explained in a sentence you can actually remember.' },
      {
        title: 'Play with it',
        body: 'Press play, step through slowly, or change the input. The picture reacts instantly — nothing to install, no code to read.',
      },
      {
        title: 'See it click',
        body: 'A short checklist guides you to the “aha” moment, then tells you where it shows up in real life.',
      },
    ],
  },

  demo: {
    collection: 'Collection',
    breadcrumb: 'Breadcrumb',
    notFound: 'Not found',
    notFoundTitle: 'We couldn’t find that one',
    notFoundBody: (id: string) => `There’s no demo called “${id}” yet.`,
    backToCollection: 'Back to the collection',
    moreIn: (topic: string) => `More in ${topic}`,
    upNext: 'Up next',
  },

  categories: {
    sorting: {
      name: 'Sorting',
      blurb: 'Different strategies for putting things in order — and why some are dramatically faster.',
    },
    searching: {
      name: 'Searching',
      blurb: 'Finding one thing among many, and how a little order makes it almost instant.',
    },
    graphs: {
      name: 'Graphs & paths',
      blurb: 'Exploring a maze of connections to find the way from here to there.',
    },
    structures: {
      name: 'Data structures',
      blurb: 'Clever ways to arrange data so the questions you ask most are cheap to answer.',
    },
    spatial: {
      name: 'Spatial & maps',
      blurb: 'Organising points on a plane or a planet so “what’s nearby?” is quick.',
    },
  },

  /** Facts: [label, value] pairs shown as chips */
  algorithms: {
    'bubble-sort': {
      name: 'Bubble Sort',
      tagline: 'Swap neighbours that are out of order until the big ones bubble to the end.',
      usedIn: ['Teaching', 'Tiny lists'],
      facts: [['Typical', 'O(n²)'], ['Worst', 'O(n²)'], ['Memory', 'O(1)']],
    },
    'selection-sort': {
      name: 'Selection Sort',
      tagline: 'Find the smallest, put it first. Then the next smallest. And so on.',
      usedIn: ['Few-swap situations', 'Teaching'],
      facts: [['Typical', 'O(n²)'], ['Worst', 'O(n²)'], ['Memory', 'O(1)']],
    },
    'insertion-sort': {
      name: 'Insertion Sort',
      tagline: 'Sort like a hand of cards: slide each new card left until it fits.',
      usedIn: ['Nearly-sorted data', 'Inside faster sorts'],
      facts: [['Typical', 'O(n²)'], ['Worst', 'O(n²)'], ['Memory', 'O(1)']],
    },
    'merge-sort': {
      name: 'Merge Sort',
      tagline: 'Split the list in half until it’s trivial, then zip the sorted halves together.',
      usedIn: ['Huge files', 'Stable sorting'],
      facts: [['Typical', 'O(n log n)'], ['Worst', 'O(n log n)'], ['Memory', 'O(n)']],
    },
    'quick-sort': {
      name: 'Quick Sort',
      tagline: 'Pick a pivot, split into smaller and bigger, repeat. Usually the fastest in practice.',
      usedIn: ['Standard libraries', 'General sorting'],
      facts: [['Typical', 'O(n log n)'], ['Worst', 'O(n²)'], ['Memory', 'O(log n)']],
    },
    'heap-sort': {
      name: 'Heap Sort',
      tagline: 'Build a heap so the biggest is always on top, then peel it off one by one.',
      usedIn: ['Guaranteed speed', 'Low memory'],
      facts: [['Typical', 'O(n log n)'], ['Worst', 'O(n log n)'], ['Memory', 'O(1)']],
    },
    'sorting-race': {
      name: 'Sorting Race',
      tagline: 'Six sorting strategies, one list, side by side. Who finishes first?',
      usedIn: ['Comparing', 'Building intuition'],
      facts: [],
    },
    'linear-search': {
      name: 'Linear Search',
      tagline: 'Check every box, one after another, until you find it.',
      usedIn: ['Unsorted data', 'Short lists'],
      facts: [['Worst', 'O(n)'], ['Needs sorting', 'No']],
    },
    'binary-search': {
      name: 'Binary Search',
      tagline: 'Look in the middle, throw away half, repeat. A million items in 20 steps.',
      usedIn: ['Dictionaries', 'Databases', 'git bisect'],
      facts: [['Worst', 'O(log n)'], ['Needs sorting', 'Yes']],
    },
    bfs: {
      name: 'Breadth-First Search',
      tagline: 'Explore outward in rings, so the first route you find has the fewest steps.',
      usedIn: ['Social networks', 'Puzzle solving', 'Web crawlers'],
      facts: [['Shortest', 'Fewest steps'], ['Time', 'O(V + E)']],
    },
    dfs: {
      name: 'Depth-First Search',
      tagline: 'Follow one corridor as deep as it goes, then back up and try the next.',
      usedIn: ['Maze generation', 'Detecting cycles', 'Solving puzzles'],
      facts: [['Shortest', 'No'], ['Time', 'O(V + E)']],
    },
    dijkstra: {
      name: 'Dijkstra',
      tagline: 'Always continue from the cheapest place so far. Finds the best route, even through mud.',
      usedIn: ['Route planners', 'Network routing'],
      facts: [['Shortest', 'Cheapest'], ['Time', 'O((V+E) log V)']],
    },
    astar: {
      name: 'A* Search',
      tagline: 'Dijkstra with a sense of direction: head towards the goal and skip the detours.',
      usedIn: ['Video games', 'Maps', 'Robotics'],
      facts: [['Shortest', 'Cheapest'], ['Explores', 'Fewer cells']],
    },
    'binary-search-tree': {
      name: 'Binary Search Tree',
      tagline: 'Smaller to the left, bigger to the right — so every step down halves the search.',
      usedIn: ['Ordered maps', 'Databases', 'File systems'],
      facts: [['Typical', 'O(log n)'], ['Worst', 'O(n)']],
    },
    'binary-heap': {
      name: 'Binary Heap',
      tagline: 'A tree that always keeps the smallest item on top — the perfect “what’s next?” list.',
      usedIn: ['Task schedulers', 'Dijkstra', 'Top-k lists'],
      facts: [['Peek', 'O(1)'], ['Push / pop', 'O(log n)']],
    },
    'hash-table': {
      name: 'Hash Table',
      tagline: 'Turn a key into a bucket number, so finding it is one jump instead of a search.',
      usedIn: ['Dictionaries', 'Caches', 'Database indexes'],
      facts: [['Typical', 'O(1)'], ['Worst', 'O(n)']],
    },
    quadtree: {
      name: 'QuadTree',
      tagline: 'Split space into boxes, so finding what’s nearby takes a glance instead of a search.',
      usedIn: ['Game collisions', 'Map markers', 'Image compression'],
      facts: [],
    },
    geohash: {
      name: 'GeoHash',
      tagline: 'Turn any place on Earth into a short code — the longer the code, the smaller the area.',
      usedIn: ['Ride-hailing', 'Nearby search', 'Location databases'],
      facts: [],
    },
  } as Record<string, { name: string; tagline: string; usedIn: string[]; facts: [string, string][] }>,

  sorting: {
    notes: SORT_MESSAGES,
    names: {
      bubble: 'Bubble Sort',
      selection: 'Selection Sort',
      insertion: 'Insertion Sort',
      merge: 'Merge Sort',
      quick: 'Quick Sort',
      heap: 'Heap Sort',
    },
    shapes: { random: 'Shuffled', nearly: 'Nearly sorted', reversed: 'Reversed', few: 'Few unique' },
    comparisons: 'Comparisons',
    swaps: 'Swaps',
    writes: 'Writes',
    newListTitle: 'New random list',
    startingOrder: 'Starting order',
    howManyBars: 'How many bars',
    bars: 'Bars',
    legend: { compare: 'Comparing', swap: 'Moving', pivot: 'Pivot / current', sorted: 'In final place' },
    steps: [
      { title: 'Press play', detail: 'Watch the bars move. The sentence under the chart explains each step.' },
      { title: 'Go one step at a time', detail: 'Pause, then use the arrows (or ← → keys) to see exactly what happens.' },
      {
        title: 'Try a different starting order',
        detail: 'Pick “Nearly sorted” or “Reversed”. Watch how the number of comparisons changes.',
      },
    ],
    bestCase: 'Best case',
    typical: 'Typical',
    worstCase: 'Worst case',
    extraMemory: 'Extra memory',
    stable: 'Stable',
    stableHint: 'Keeps equal items in their original order',
    complexityNote:
      'n is the number of bars. O(n²) means doubling the list makes it about four times slower; O(n log n) only a bit more than twice.',
    info: {
      bubble: {
        idea: [
          'Walk along the list comparing each pair of neighbours. Whenever the left one is bigger, swap them.',
          'After one full pass, the biggest bar has “bubbled” all the way to the right. Repeat on the rest until a pass makes no swaps.',
        ],
        goodAt: 'Tiny lists and teaching. It can stop early when the list is already in order.',
        badAt: 'Anything large — it does far more swaps than any other method here.',
      },
      selection: {
        idea: [
          'Scan the unsorted part to find the smallest bar, then swap it to the front. Now the front bar is done.',
          'Repeat with what’s left. It always does the same number of comparisons, no matter how the list starts.',
        ],
        goodAt: 'Situations where moving data is expensive — it makes at most n − 1 swaps.',
        badAt: 'Already-sorted lists: it still checks everything.',
      },
      insertion: {
        idea: [
          'Like sorting playing cards in your hand: take the next card and slide it left until it sits in the right spot.',
          'The left side is always sorted. On nearly-sorted input each card only moves a little, which makes it very fast.',
        ],
        goodAt: 'Small or nearly-sorted lists. Real libraries use it for the tiny pieces inside bigger sorts.',
        badAt: 'Reversed lists — every card has to travel all the way to the front.',
      },
      merge: {
        idea: [
          'Split the list in half, sort each half, then zip the two sorted halves together by repeatedly taking the smaller front bar.',
          'Splitting continues until pieces have one bar, which is sorted by definition. The work is the merging on the way back up.',
        ],
        goodAt: 'Predictable speed on any input, and sorting data that doesn’t fit in memory.',
        badAt: 'Memory: it needs extra space as big as the list itself.',
      },
      quick: {
        idea: [
          'Pick a pivot. Move every smaller bar to its left and every bigger bar to its right — now the pivot is in its final spot.',
          'Do the same to the left group and the right group. Each round shrinks the problem, usually by about half.',
        ],
        goodAt: 'General-purpose sorting. It’s usually the fastest in practice and sorts in place.',
        badAt: 'Unlucky pivots. Try “Reversed”: always picking the last bar makes it slow.',
      },
      heap: {
        idea: [
          'First arrange the bars into a heap — a tree hidden inside the list where each parent is bigger than its two children.',
          'The biggest bar is now at the front. Swap it to the end, repair the heap, and repeat.',
        ],
        goodAt: 'Guaranteed O(n log n) without extra memory.',
        badAt: 'Real-world speed: it jumps around the list, which computers find slow.',
      },
    },
    race: {
      lookFor: 'What to look for',
      sameList: 'Same list, six strategies',
      explain1:
        'Every lane starts from exactly the same list and takes one step per tick. The faster ones finish while the slow ones are still shuffling.',
      explain2:
        'Try **Nearly sorted**: insertion and bubble sort suddenly look brilliant. Then try **Reversed** and watch quick sort stumble on its unlucky pivots.',
      finalScores: 'Final scores',
      stepsToFinish: 'Steps to finish',
      waiting: 'Press play — the scoreboard appears when the last lane finishes.',
      ordinals: ['1st', '2nd', '3rd', '4th', '5th', '6th'],
      comparisons: 'comparisons',
      swaps: 'swaps',
      writes: 'writes',
    },
  },

  searching: {
    notes: SEARCH_MESSAGES,
    lookingFor: 'Looking for',
    checksSoFar: 'Checks so far',
    randomTarget: 'Random target',
    notInList: 'Not in list',
    searchFor: (value: number) => `Search for ${value}`,
    legend: { checking: 'Checking now', ruledOut: 'Ruled out', found: 'Found' },
    howManyBoxes: 'How many boxes',
    headToHead: 'Head to head',
    finding: (target: number) => `Finding ${target}`,
    linear: 'Linear search',
    binary: 'Binary search',
    checks: (n: number) => `${n} checks`,
    low: 'low',
    mid: 'mid',
    high: 'high',
    steps: [
      { title: 'Press play', detail: (target: number) => `Watch how it hunts for ${target}. The sentence below explains every check.` },
      { title: 'Search for something else', detail: () => 'Click any box to make its number the new target.' },
      { title: 'Look for a number that isn’t there', detail: () => 'Press “Not in list”. How many checks does it take to be sure?' },
    ],
    content: {
      linear: {
        title: 'One by one',
        idea: [
          'Start at the first box and check each one in turn until you find what you’re looking for — or run out of boxes.',
          'It’s the only option when the list is in no particular order. The catch: if the list doubles, so does the work.',
        ],
        facts: [
          { label: 'Best case', value: 'O(1)', hint: 'It’s in the first box' },
          { label: 'Worst case', value: 'O(n)', hint: 'Last box, or not there at all' },
          { label: 'Needs a sorted list', value: 'No' },
          { label: 'Extra memory', value: 'O(1)' },
        ],
      },
      binary: {
        title: 'Halve it, every time',
        idea: [
          'Look at the middle box. If your number is bigger, it can only be in the right half; if smaller, the left half. Throw the other half away.',
          'Each check halves what’s left, so even a million sorted items need only about 20 checks. That’s the power of keeping things in order.',
        ],
        facts: [
          { label: 'Best case', value: 'O(1)', hint: 'It’s right in the middle' },
          { label: 'Worst case', value: 'O(log n)', hint: 'About 20 checks for a million items' },
          { label: 'Needs a sorted list', value: 'Yes' },
          { label: 'Extra memory', value: 'O(1)' },
        ],
      },
    } as Record<'linear' | 'binary', { title: string; idea: string[]; facts: { label: string; value: string; hint?: string }[] }>,
    game: {
      title: 'Play: guess my number',
      intro: 'I’m thinking of a number from 1 to 100. Binary search always gets it in 7 guesses or fewer — can you?',
      yourGuess: 'Your guess',
      guess: 'Guess',
      newGame: 'New game',
      higher: 'Higher',
      lower: 'Lower',
      gotIt: 'Got it!',
      winGood: (n: number) => `Nice — ${n} guess${n > 1 ? 'es' : ''}. You searched like a computer.`,
      winSlow: (n: number) => `${n} guesses. Try always guessing the middle of what’s left — that’s binary search.`,
    },
  },

  pathfinding: {
    tools: { wall: 'Walls', mud: 'Mud', erase: 'Eraser' },
    drawingTool: 'Drawing tool',
    maze: 'Maze',
    scatter: 'Scatter',
    cellsExplored: 'Cells explored',
    pathSteps: 'Path steps',
    pathCost: 'Path cost',
    gridLabel: 'Grid. Drag to draw walls or mud; drag the start dot or flag to move them.',
    dragHint: 'Drag to draw. Drag the green dot or the flag to move them.',
    noteIdle: 'Press play to start exploring from the green dot.',
    noteExploring: (exploring: string, n: number) => `${exploring} ${n} cell${n === 1 ? '' : 's'} explored.`,
    noteFound: (steps: number, cost: number, explored: number) =>
      `Found a way: ${steps} steps, costing ${cost}. Explored ${explored} cells to get here.`,
    noteBlocked: (explored: number) => `No way through — the flag is walled off. Explored all ${explored} reachable cells.`,
    legend: {
      current: 'Exploring now',
      explored: 'Explored',
      frontier: 'Waiting in line',
      path: 'Path',
      mud: 'Mud (costs 5)',
      wall: 'Wall',
    },
    steps: [
      { title: 'Press play', detail: 'Watch how it explores from the green dot until it reaches the flag.' },
      { title: 'Change the map', detail: 'Drag on the grid to draw walls or mud, or drag the dot and flag. Try a maze, too.' },
      { title: 'Compare on the same map', detail: 'Open another algorithm below — your map comes with you.' },
    ],
    compareEyebrow: 'Same map, four algorithms',
    compareTitle: 'How they compare',
    compareRow: (explored: number, cost: number | null) =>
      cost === null ? `**${explored}** explored · no path` : `**${explored}** explored · cost **${cost}**`,
    compareNote: 'Fewer explored cells means less work. Lower cost means a better route.',
    info: {
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
    } as Record<
      'bfs' | 'dfs' | 'dijkstra' | 'astar',
      { short: string; title: string; idea: string[]; exploring: string; facts: { label: string; value: string; hint?: string }[] }
    >,
  },

  bst: {
    notes: BST_MESSAGES,
    intro: 'Type a number and insert, search for or delete it.',
    built: (values: string) => `Built a tree by inserting ${values} in that order.`,
    emptyIntro: 'Empty tree. Insert a number to plant the root.',
    presets: { bushy: 'Bushy', sorted: 'Sorted 1–9', random: 'Random' },
    nodes: 'Nodes',
    height: 'Height',
    bestHeight: 'Best possible height',
    value: 'Value',
    placeholder: 'e.g. 42',
    insert: 'Insert',
    search: 'Search',
    delete: 'Delete',
    insertRandom: 'Insert a random number',
    emptyTree: 'Empty tree — insert a number',
    tip: (inOrder: string) => `Tip: click a node to put its number in the box. Reading left to right: ${inOrder}`,
    legend: { looking: 'Looking at', path: 'Path so far', found: 'Found / added', removing: 'Being removed' },
    startFrom: 'Start from',
    heightNote: (h: number, n: number, best: number) =>
      `Height decides speed: a search takes at most one step per level. This tree is **${h}** level${h === 1 ? '' : 's'} tall; the best possible for ${n} nodes is **${best}**.`,
    steps: [
      { title: 'Insert a number', detail: 'Type a number and press Insert. Watch it go left or right at each node.' },
      { title: 'Search for a number', detail: 'Each step down rules out a whole branch — that’s why lookups are fast.' },
      { title: 'Build from sorted numbers', detail: 'Pick “Sorted 1–9”. The tree turns into a long chain — and loses its speed.' },
    ],
    ideaTitle: 'Smaller to the left, bigger to the right',
    idea: [
      'Every node has at most two children. Everything in its left branch is smaller, everything in its right branch is bigger. That one rule means you can always tell which way to go.',
      'Searching, inserting and deleting all walk one path from the top, so their cost depends on the tree’s height. Feed it numbers in sorted order, though, and it becomes a long chain — which is why real systems use self-balancing versions like red-black trees.',
    ],
    callout:
      '**Deleting a node with two children** is the clever bit: swap in the next-bigger value (the leftmost node on the right side), which keeps every rule intact.',
    facts: [
      { label: 'Search / insert / delete', hint: 'When the tree is bushy', value: 'O(log n)' },
      { label: 'Worst case', hint: 'When it degrades into a chain', value: 'O(n)' },
      { label: 'List in sorted order', value: 'O(n)' },
      { label: 'Memory', value: 'O(n)' },
    ] as { label: string; value: string; hint?: string }[],
  },

  heap: {
    notes: HEAP_MESSAGES,
    intro: 'The smallest value always sits at the top. Push a number or take the smallest.',
    built: (values: string) => `Built a heap from ${values}.`,
    emptyIntro: 'Empty heap. Push some numbers.',
    items: 'Items',
    smallest: 'Smallest',
    levels: 'Levels',
    value: 'Value',
    placeholder: 'e.g. 7',
    push: 'Push',
    takeSmallest: 'Take smallest',
    emptyHeap: 'Empty heap',
    storedAsArray: 'Stored as an array',
    legend: { compare: 'Comparing', swap: 'Swapping', settled: 'Settled' },
    takenSoFar: 'Taken out so far',
    nothingTaken: 'Nothing yet. Press “Take smallest”.',
    random10: 'Random 10',
    steps: [
      { title: 'Push a number', detail: 'It starts at the bottom and swaps upward while it’s smaller than its parent.' },
      { title: 'Take the smallest', detail: 'Press “Take smallest”. The last item jumps to the top and sinks back down.' },
      { title: 'Keep taking', detail: 'Take four or more. Notice they come out in sorted order — that’s heap sort.' },
    ],
    ideaTitle: 'A to-do list that always knows what’s next',
    idea: [
      'A heap only promises one thing: every parent is smaller than its children. It doesn’t keep everything sorted — just enough that the smallest item is always on top.',
      'That makes it the perfect **priority queue**: hospitals triaging patients, your computer deciding which task runs next, and Dijkstra’s route finder all use one.',
    ],
    callout: '**No pointers needed.** The tree lives inside a plain array: the children of position i are at 2i + 1 and 2i + 2.',
    facts: [
      { label: 'Peek at smallest', value: 'O(1)' },
      { label: 'Push', value: 'O(log n)' },
      { label: 'Take smallest', value: 'O(log n)' },
      { label: 'Memory', value: 'O(n)', hint: 'Just an array' },
    ] as { label: string; value: string; hint?: string }[],
  },

  hash: {
    intro: 'Each word is turned into a number, and that number picks its bucket. Try adding one.',
    exists: (word: string, bucket: number) => `“${word}” is already in bucket ${bucket}. A hash table stores each key only once.`,
    collision: (bucket: number, existing: string, word: string) =>
      `Collision! Bucket ${bucket} already had ${existing}. “${word}” joins the chain.`,
    added: (word: string, bucket: number) => `“${word}” goes straight into empty bucket ${bucket}. One step, no searching.`,
    found: (bucket: number, word: string, checked: number, total: number) =>
      `Jumped straight to bucket ${bucket} and found “${word}” after checking ${checked} item${checked > 1 ? 's' : ''} — out of ${total}.`,
    notFound: (word: string, bucket: number, checked: number) =>
      checked
        ? `“${word}” would live in bucket ${bucket}. Checked its ${checked} item${checked > 1 ? 's' : ''}: it isn’t here.`
        : `“${word}” would live in bucket ${bucket}. It’s empty, so it isn’t here.`,
    removed: (word: string, bucket: number) => `Removed “${word}” from bucket ${bucket}.`,
    notInTable: (word: string) => `“${word}” isn’t in the table.`,
    grown: (buckets: number) => `Doubled to ${buckets} buckets. Every word was re-hashed and moved — chains got shorter.`,
    addedMany: (words: string) => `Added ${words}. Watch the chains grow as the table fills up.`,
    allIn: 'All the sample animals are already in.',
    emptied: 'Empty table with 8 buckets.',
    items: 'Items',
    buckets: 'Buckets',
    perBucket: 'Items per bucket',
    longest: 'Longest chain',
    word: 'Word',
    placeholder: 'e.g. tiger',
    lettersOnly: 'Letters a–z only',
    add: 'Add',
    find: 'Find',
    remove: 'Remove',
    emptyBucket: 'empty',
    addFive: 'Add 5 animals',
    double: 'Double buckets',
    workedOut: 'The hash, worked out',
    sum: 'sum',
    workedNote: 'Each letter has a number. Add them up, take the remainder after dividing by the number of buckets — that’s the bucket.',
    steps: [
      { title: 'Add a word', detail: 'Type an animal and press Add. See which bucket its letters send it to.' },
      { title: 'Find a word', detail: 'Search jumps straight to one bucket instead of checking everything.' },
      { title: 'Fill it up, then grow', detail: 'Add more animals until chains get long, then press “Double buckets”.' },
    ],
    ideaTitle: 'Know exactly where to look',
    idea: [
      'A hash function turns a key — a word, a name, an ID — into a number. That number says which bucket to use. To find the key again, compute the same number and look in just that one bucket.',
      'Sometimes two keys land in the same bucket: a **collision**. Here they simply line up in a chain. Keep chains short by adding buckets as the table fills, and lookups stay almost instant.',
    ],
    callout:
      '**Try “listen” and “silent”.** Same letters, same sum, same bucket — a sign this hash is too simple. Real hash functions mix the letters’ positions in too.',
    facts: [
      { label: 'Add / find / remove', hint: 'With short chains', value: 'O(1)' },
      { label: 'Worst case', hint: 'Everything in one bucket', value: 'O(n)' },
      { label: 'Kept in order', value: 'No' },
      { label: 'Memory', value: 'O(n)' },
    ] as { label: string; value: string; hint?: string }[],
    everyday: 'You meet these every day: dictionaries in Python, objects in JavaScript, database indexes and caches.',
  },

  quadtree: {
    points: 'Points',
    boxes: 'Boxes',
    levelsDeep: 'Levels deep',
    scatter: 'Scatter',
    scatterTitle: 'Add 12 random points',
    undoTitle: 'Remove the last point',
    clearTitle: 'Remove all points',
    canvasLabel: 'QuadTree canvas. Click to add points.',
    emptyTitle: 'Click anywhere to drop a point',
    emptyHint: 'or press Scatter to add a handful at once',
    hoverReadout: (level: number, used: number, capacity: number) => `Level **${level}** box · **${used}** of ${capacity} spots used`,
    steps: [
      {
        title: 'Fill a box until it splits',
        detail: (capacity: number) =>
          `A box holds up to **${capacity}** points. Click the canvas to add more — or press **Scatter** — and watch it break into four.`,
      },
      {
        title: 'Hover over a region',
        detail: () => 'Move your cursor around. The highlighted box is where that spot “lives” in the tree.',
      },
      {
        title: 'Change how much a box can hold',
        detail: () => 'Drag the slider. A smaller limit means more, tinier boxes; a bigger limit means fewer.',
      },
    ],
    allDone: 'That’s the whole trick. To find what’s near a point, you only look inside its own box — not at every point on the canvas.',
    pointsPerBox: 'Points per box',
    pointsPerBoxHint: 'How many points a box can hold before it splits',
    splitOften: '1 · split often',
    splitRarely: '10 · split rarely',
    ideaTitle: 'Divide only where it’s crowded',
    idea: [
      'Start with one big box. When it gets too full, cut it into four equal quarters and hand each point to the quarter it falls in. Keep doing that, but only where things are crowded.',
      'Empty areas stay as big boxes; busy areas become a fine mesh. The shape of the tree ends up mirroring the shape of your data.',
    ],
    whyFast: 'Why it’s fast',
    whyFastTitle: 'Look in one box, not everywhere',
    whyFastBody: (total: number, avg: string) =>
      `To find neighbours of a point without a QuadTree, you’d compare it with **every one of the ${total} points**. With the tree, you only check its own box — about **${avg}** points on average right now.`,
    checkEverything: 'Check everything',
    checkOneBox: 'Check one box',
  },

  geohash: {
    places: {
      taipei: 'Taipei',
      tokyo: 'Tokyo',
      paris: 'Paris',
      newYork: 'New York',
      saoPaulo: 'São Paulo',
      sydney: 'Sydney',
    },
    sizes: {
      continent: 'a continent',
      largeCountry: 'a large country',
      smallCountry: 'a small country',
      city: 'a city',
      neighbourhood: 'a neighbourhood',
      streets: 'a few streets',
      block: 'a city block',
      house: 'a house',
    },
    yourCode: 'Your code',
    copyCode: 'Copy code',
    covers: (w: string, h: string) => `Covers about **${w}** × **${h}**`,
    roughly: (thing: string) => `roughly the size of ${thing}`,
    worldNote: 'The world is first cut into 32 big tiles — the faint letters. Your code always starts with the tile you’re in.',
    worldLabel: 'World map. Click to choose a place.',
    closeUp: 'Close-up',
    closeUpTitle: 'Your box and its neighbours',
    closeUpLabel: 'Close-up of the current GeoHash cell and its neighbours',
    closeUpNote:
      'Grey letters are shared with your code; **orange** ones differ. The small letters inside your box are the choices for the next character.',
    steps: [
      { title: 'Pick a place', detail: 'Click anywhere on the map, or choose one of the cities below.' },
      { title: 'Make the code longer', detail: 'Drag “Code length” to 6 or more. Each extra letter zooms in about 32 times.' },
      { title: 'Step into a neighbour', detail: 'In the close-up, click a box next to yours. Notice how its code starts the same way.' },
    ],
    allDone:
      'Close places usually share a beginning. So “find everything near me” becomes “find codes that start with these letters” — something databases are very fast at.',
    codeLength: 'Code length',
    codeLengthHint: 'More letters, smaller area',
    minLabel: '1 · continent',
    maxLabel: '8 · a house',
    jumpTo: 'Jump to',
    whereIAm: 'Where I am',
    showNeighbours: 'Show neighbours',
    exactCoordinates: 'Exact coordinates',
    latitude: 'Latitude',
    longitude: 'Longitude',
    letterByLetter: 'Read it letter by letter',
    everyLetter: 'Every letter zooms in',
    lettersNote: 'Behind the scenes, each letter packs five yes/no answers: “east or west half?”, “north or south half?” — over and over.',
    ideaTitle: 'Halve, halve, halve again',
    idea: [
      'Ask: is the place in the east or west half of the world? Then: north or south half of that? Keep alternating. Every answer is a 0 or a 1.',
      'Group the answers five at a time and write each group as one letter. That string of letters is the GeoHash — a nested address, from “this part of the planet” down to “this doorstep”.',
    ],
    usedTitle: '“What’s near me?” in one lookup',
    used: 'Ride-hailing apps, delivery services and nearby-search features store each location’s code. To find what’s close, they look up everything that starts with the same few letters — plus the 8 neighbours, because a place right on the edge of a box may have a different code.',
    usedNote: 'That’s why the close-up shows the neighbours: they’re the boxes you’d search too.',
  },
};

export type Messages = typeof en;
export default en;
