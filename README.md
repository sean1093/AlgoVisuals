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

### QuadTree
**Spatial partitioning tree for efficient 2D spatial queries and collision detection**

- **Features:**
  - Click canvas to add points
  - Adjustable capacity threshold
  - Real-time subdivision visualization
  - Hover to highlight regions

- **Use Cases:**
  - Game development (collision detection)
  - Geographic information systems
  - Image processing
  - Database indexing

### GeoHash
**Geolocation encoding system that converts lat/lng to short strings**

- **Features:**
  - Click map or input coordinates
  - Adjustable precision (1-8 characters)
  - Neighbor cell visualization
  - Real-time encoding/decoding

- **Use Cases:**
  - Location-based search
  - Database sharding by geography
  - URL-friendly location sharing
  - Proximity queries

## 🏗️ Architecture

### Registry Pattern

Algorithm Canvas uses a centralized registry system for algorithm management:

```typescript
// src/algorithms/index.ts
registerAlgorithm({
  id: 'quadtree',
  name: 'QuadTree',
  description: 'Spatial partitioning tree...',
  icon: Grid3x3,
  component: QuadTreeVisualizer,
});
```

**Benefits:**
- Automatic route generation
- Auto-populated landing page cards
- Clean separation of concerns
- Easy to add new algorithms

### Project Structure

```
src/
├── algorithms/           # Algorithm implementations
│   ├── quadtree/
│   │   ├── logic.ts     # Pure algorithm logic
│   │   └── QuadTreeVisualizer.tsx
│   └── geohash/
│       ├── logic.ts
│       └── GeoHashVisualizer.tsx
├── components/
│   ├── layout/          # Layout components
│   └── shared/          # Reusable UI components
├── pages/               # Route pages
├── registry.ts          # Algorithm registry
└── App.tsx             # Main app with routing
```

## 🎨 Design System

### Color Palette
- **Background**: Warm white (#FAFAFA)
- **Pastels**: Blue (#A8D8EA), Green (#AAE3A8), Orange (#FFCBA4)
- **Borders**: Dark gray (#4A5568), Dark blue (#2C5F7C)

### UI Guidelines
- **Borders**: 2px solid with rounded corners (0.75rem)
- **Shadows**: Soft, subtle drop shadows
- **Animations**: Spring physics (no linear easing)
- **Typography**: Round sans-serif fonts

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **React Router v6** | Client-side routing |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animation library |
| **Lucide React** | Icon library |

## 🧪 Adding New Algorithms

1. **Create algorithm directory:**
   ```bash
   mkdir -p src/algorithms/your-algorithm
   ```

2. **Implement logic layer** (`logic.ts`):
   ```typescript
   export class YourAlgorithm {
     // Pure algorithm logic, no UI dependencies
   }
   ```

3. **Create visualizer** (`YourAlgorithmVisualizer.tsx`):
   ```typescript
   function YourAlgorithmVisualizer() {
     // Interactive visualization using shared components
     return <div>...</div>;
   }
   ```

4. **Register in `src/algorithms/index.ts`:**
   ```typescript
   registerAlgorithm({
     id: 'your-algorithm',
     name: 'Your Algorithm',
     description: 'Brief description...',
     icon: YourIcon,
     component: YourAlgorithmVisualizer,
   });
   ```

That's it! The landing page and routes update automatically.

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
