import { GeoBounds } from './logic';

const KM_PER_DEGREE = 111.32;

/**
 * Approximate width/height of a GeoHash cell in kilometres
 */
export function cellSizeKm(b: GeoBounds): { width: number; height: number } {
  const midLat = (b.minLat + b.maxLat) / 2;
  return {
    width: (b.maxLng - b.minLng) * KM_PER_DEGREE * Math.cos((midLat * Math.PI) / 180),
    height: (b.maxLat - b.minLat) * KM_PER_DEGREE,
  };
}

/**
 * Human friendly distance: "4,992 km", "39.1 km", "610 m"
 */
export function formatDistance(km: number): string {
  if (km >= 100) return `${Math.round(km).toLocaleString('en-US')} km`;
  if (km >= 1) return `${km.toFixed(1)} km`;
  return `${Math.max(1, Math.round(km * 1000))} m`;
}

/**
 * Something familiar of roughly the same size as the cell
 */
export type SizeKey = 'continent' | 'largeCountry' | 'smallCountry' | 'city' | 'neighbourhood' | 'streets' | 'block' | 'house';

export function sizeComparison(km: number): SizeKey {
  if (km > 2000) return 'continent';
  if (km > 400) return 'largeCountry';
  if (km > 80) return 'smallCountry';
  if (km > 15) return 'city';
  if (km > 3) return 'neighbourhood';
  if (km > 0.4) return 'streets';
  if (km > 0.08) return 'block';
  return 'house';
}

/**
 * Wrap a longitude into [-180, 180)
 */
export function wrapLng(lng: number): number {
  return ((((lng + 180) % 360) + 360) % 360) - 180;
}

export function clampLat(lat: number): number {
  return Math.max(-89.9999, Math.min(89.9999, lat));
}

/**
 * Number of leading characters two codes have in common
 */
export function sharedPrefix(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}
