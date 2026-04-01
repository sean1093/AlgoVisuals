import { Grid3x3, MapPin } from 'lucide-react';
import { registerAlgorithm } from '../registry';
import QuadTreeVisualizer from './quadtree/QuadTreeVisualizer';
import GeoHashVisualizer from './geohash/GeoHashVisualizer';

/**
 * Register all algorithms
 * Simply add registration here, and Landing Page and routes will auto-update
 */
export function registerAllAlgorithms() {
  registerAlgorithm({
    id: 'quadtree',
    name: 'QuadTree',
    description: 'Spatial partitioning tree for efficient 2D spatial queries and collision detection',
    icon: Grid3x3,
    component: QuadTreeVisualizer,
  });

  registerAlgorithm({
    id: 'geohash',
    name: 'GeoHash',
    description: 'Geolocation encoding system that converts lat/lng to short strings for indexing and search',
    icon: MapPin,
    component: GeoHashVisualizer,
  });
}
