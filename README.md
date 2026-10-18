# Algorithm Canvas 🎨

[![Deploy to GitHub Pages](https://github.com/sean1093/AlgoVisuals/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)](https://github.com/sean1093/AlgoVisuals/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> An interactive algorithm visualization platform built with React, TypeScript, and Framer Motion

Explore data structures and algorithms through beautiful, interactive visualizations. Algorithm Canvas transforms abstract concepts into intuitive, animated demonstrations that make learning algorithms engaging and accessible.

🌐 **[Live Demo](https://sean1093.github.io/AlgoVisuals/)**

## ✨ Features

- 🎯 **Interactive Visualizations** - Click, drag, and interact with algorithms in real-time
- 🎨 **Beautiful Design** - Clean, modern UI with smooth spring-physics animations
- 📱 **Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- ⚡ **High Performance** - Built with Vite for lightning-fast development and production builds
- 🧩 **Extensible Architecture** - Registry pattern makes adding new algorithms simple
- 🎓 **Educational** - Perfect for students, educators, and algorithm enthusiasts

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ or 22.12+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/sean1093/AlgoVisuals.git
cd AlgoVisuals

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173/AlgoVisuals/` to see the app in action!

### Building for Production

```bash
npm run build
npm run preview  # Preview production build locally
```

## 📚 Algorithms

18 interactive demos across five topics. Every step-by-step demo has play / pause, step forward and back (← → keys),
a scrubber, four speeds, and a one-sentence explanation of the current step.

| Topic | Demos |
|-------|-------|
| **Sorting** | Bubble, Selection, Insertion, Merge, Quick, Heap sort, plus a **Sorting Race** that runs all six on the same list |
| **Searching** | Linear search, Binary search (with a "guess my number" game) |
| **Graphs & paths** | BFS, DFS, Dijkstra, A* on a drawable grid (walls, mud, mazes) that is shared between the four pages |
| **Data structures** | Binary Search Tree (insert / search / delete), Binary Heap, Hash Table (chaining, resize) |
| **Spatial & maps** | QuadTree, GeoHash |

## 🏗️ Architecture

### Registry Pattern

Each algorithm is registered once with its category; the landing page, the Browse menu and routes are generated from it:

```tsx
// src/algorithms/index.tsx
registerAlgorithm({
  id: 'quick-sort',
  name: 'Quick Sort',
  category: 'sorting',
  tagline: 'Pick a pivot, split into smaller and bigger, repeat.',
  description: 'Partition around a pivot, then sort each side.',
  usedIn: ['Standard libraries'],
  facts: [{ label: 'Typical', value: 'O(n log n)' }],
  icon: Shuffle,
  component: () => <SortingVisualizer algorithm="quick" />,
  preview: barsPreview([30, 18, 42, 25]),
});
```

### Step playback

Algorithms are written as pure functions that **record frames** (a snapshot plus a plain-language note per step).
`usePlayer` + `PlayerControls` (in `src/components/player/`) play those frames back, so the logic stays testable and the UI
gets stepping, scrubbing and rewinding for free.

### Project Structure

```
src/
├── algorithms/
│   ├── sorting/        # 6 sorts as frame recorders, bars view, race
│   ├── searching/      # linear + binary search
│   ├── pathfinding/    # BFS, DFS, Dijkstra, A*, maze generation
│   ├── bst/ heap/ hashtable/
│   ├── quadtree/ geohash/
│   ├── previews.tsx    # card illustrations
│   └── index.tsx       # registrations
├── components/
│   ├── layout/         # header with Browse menu, footer
│   ├── player/         # usePlayer, PlayerControls, Narration
│   └── shared/         # Panel, Slider, Chips, TreeDiagram, …
├── pages/              # Landing + demo page
└── registry.ts         # categories + algorithm registry
```

## 🎨 Design System

A warm "paper and ink" look: off-white paper (`#f6f3ec`), ink text (`#1f1d1a`), Fraunces for headings and Inter for text.
Each topic has one accent colour (defined in `CATEGORIES` in `src/registry.ts`); design tokens live in `@theme` in
`src/index.css` (Tailwind v4).

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **React Router v7** | Client-side routing |
| **Vitest** | Unit tests |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animation library |
| **Lucide React** | Icon library |

## 🧪 Adding New Algorithms

1. Create `src/algorithms/your-algorithm/logic.ts` with pure logic. For step-by-step demos, return an array of frames
   (`{ ...state, note: 'What just happened, in plain words' }`).
2. Add `logic.test.ts` next to it and run `npm test`.
3. Build the visualizer with the shared pieces (`usePlayer`, `PlayerControls`, `Narration`, `Panel`, `GuideSteps`, …).
4. Register it in `src/algorithms/index.tsx` with a `category` and a `preview`.

That's it — the landing page, Browse menu and routes update automatically.

## ✅ Tests

```bash
npm test        # Vitest unit tests for every algorithm's logic
npm run build   # Type-check + production build
```

Both run on every pull request (`.github/workflows/ci.yml`).

## 🚀 Deployment

### GitHub Pages (Automated)

The project includes a GitHub Actions workflow that automatically deploys to GitHub Pages on every push to `main`/`master`.

**Setup:**
1. Go to repository Settings → Pages
2. Source: Select "GitHub Actions"
3. Push to main branch - deployment happens automatically

**Access your site at:**
```
https://sean1093.github.io/AlgoVisuals/
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. 🐛 **Report bugs** - Open an issue with detailed reproduction steps
2. 💡 **Suggest features** - Share your ideas for new algorithms or improvements
3. 🔧 **Submit PRs** - Fix bugs or add new algorithms
4. 📖 **Improve docs** - Help make the documentation better

### Development Guidelines

- Follow the existing code style (ESLint configured)
- Keep logic and UI layers separate
- Write clean, self-documenting code
- Test your changes locally before submitting
- Update README if adding new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components inspired by modern design systems
- Animation powered by [Framer Motion](https://www.framer.com/motion/)
- Icons from [Lucide](https://lucide.dev/)

## 📧 Contact

Have questions or suggestions? Feel free to open an issue or reach out!

---

<div align="center">
  Made with ❤️ using React, TypeScript, and Framer Motion
  <br />
  <sub>Star ⭐ this repo if you find it helpful!</sub>
</div>
