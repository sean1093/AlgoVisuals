import { Grid2x2, MapPin } from 'lucide-react';
import { registerAlgorithm } from '../registry';
import QuadTreeVisualizer from './quadtree/QuadTreeVisualizer';
import QuadTreePreview from './quadtree/Preview';
import GeoHashVisualizer from './geohash/GeoHashVisualizer';
import GeoHashPreview from './geohash/Preview';

/**
 * Register all algorithms
 * Simply add registration here, and Landing Page and routes will auto-update
 */
export function registerAllAlgorithms() {
  registerAlgorithm({
    id: 'quadtree',
    name: 'QuadTree',
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
