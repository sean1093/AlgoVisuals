/**
 * GeoHash encode/decode implementation
 * Converts latitude/longitude to Base32 strings
 */

// Base32 character set (excludes a, i, l, o to avoid confusion)
const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeoBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/**
 * Encode latitude/longitude to GeoHash
 */
export function encode(lat: number, lng: number, precision: number = 9): string {
  let geohash = '';
  let evenBit = true;
  let bit = 0;
  let ch = 0;

  let latMin = -90;
  let latMax = 90;
  let lngMin = -180;
  let lngMax = 180;

  while (geohash.length < precision) {
    if (evenBit) {
      // Process longitude
      const mid = (lngMin + lngMax) / 2;
      if (lng > mid) {
        ch |= (1 << (4 - bit));
        lngMin = mid;
      } else {
        lngMax = mid;
      }
    } else {
      // Process latitude
      const mid = (latMin + latMax) / 2;
      if (lat > mid) {
        ch |= (1 << (4 - bit));
        latMin = mid;
      } else {
        latMax = mid;
      }
    }

    evenBit = !evenBit;

    if (bit < 4) {
      bit++;
    } else {
      geohash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }

  return geohash;
}

/**
 * Decode GeoHash to latitude/longitude and bounds
 */
export function decode(geohash: string): { point: GeoPoint; bounds: GeoBounds } {
  let evenBit = true;
  let latMin = -90;
  let latMax = 90;
  let lngMin = -180;
  let lngMax = 180;

  for (let i = 0; i < geohash.length; i++) {
    const chr = geohash[i];
    const idx = BASE32.indexOf(chr);

    if (idx === -1) {
      throw new Error(`Invalid geohash character: ${chr}`);
    }

    for (let n = 4; n >= 0; n--) {
      const bitN = (idx >> n) & 1;

      if (evenBit) {
        // Longitude
        const mid = (lngMin + lngMax) / 2;
        if (bitN === 1) {
          lngMin = mid;
        } else {
          lngMax = mid;
        }
      } else {
        // Latitude
        const mid = (latMin + latMax) / 2;
        if (bitN === 1) {
          latMin = mid;
        } else {
          latMax = mid;
        }
      }

      evenBit = !evenBit;
    }
  }

  const lat = (latMin + latMax) / 2;
  const lng = (lngMin + lngMax) / 2;

  return {
    point: { lat, lng },
    bounds: { minLat: latMin, maxLat: latMax, minLng: lngMin, maxLng: lngMax },
  };
}

/**
 * Get the 8 neighboring GeoHashes
 */
export function getNeighbors(geohash: string): {
  n: string;
  ne: string;
  e: string;
  se: string;
  s: string;
  sw: string;
  w: string;
  nw: string;
} {
  const { bounds } = decode(geohash);

  const latDiff = bounds.maxLat - bounds.minLat;
  const lngDiff = bounds.maxLng - bounds.minLng;

  const centerLat = (bounds.minLat + bounds.maxLat) / 2;
  const centerLng = (bounds.minLng + bounds.maxLng) / 2;

  const precision = geohash.length;

  return {
    n: encode(centerLat + latDiff, centerLng, precision),
    ne: encode(centerLat + latDiff, centerLng + lngDiff, precision),
    e: encode(centerLat, centerLng + lngDiff, precision),
    se: encode(centerLat - latDiff, centerLng + lngDiff, precision),
    s: encode(centerLat - latDiff, centerLng, precision),
    sw: encode(centerLat - latDiff, centerLng - lngDiff, precision),
    w: encode(centerLat, centerLng - lngDiff, precision),
    nw: encode(centerLat + latDiff, centerLng - lngDiff, precision),
  };
}

/**
 * Get encoding steps (for visualization)
 */
export function getEncodingSteps(lat: number, lng: number, precision: number = 5): {
  step: number;
  bit: number;
  isLng: boolean;
  value: number;
  min: number;
  max: number;
  mid: number;
  char?: string;
}[] {
  const steps: {
    step: number;
    bit: number;
    isLng: boolean;
    value: number;
    min: number;
    max: number;
    mid: number;
    char?: string;
  }[] = [];

  let evenBit = true;
  let bit = 0;
  let ch = 0;

  let latMin = -90;
  let latMax = 90;
  let lngMin = -180;
  let lngMax = 180;

  let stepCount = 0;
  let geohash = '';

  while (geohash.length < precision) {
    if (evenBit) {
      // Process longitude
      const mid = (lngMin + lngMax) / 2;
      const bitValue = lng > mid ? 1 : 0;

      steps.push({
        step: stepCount++,
        bit,
        isLng: true,
        value: lng,
        min: lngMin,
        max: lngMax,
        mid,
      });

      if (bitValue === 1) {
        ch |= (1 << (4 - bit));
        lngMin = mid;
      } else {
        lngMax = mid;
      }
    } else {
      // Process latitude
      const mid = (latMin + latMax) / 2;
      const bitValue = lat > mid ? 1 : 0;

      steps.push({
        step: stepCount++,
        bit,
        isLng: false,
        value: lat,
        min: latMin,
        max: latMax,
        mid,
      });

      if (bitValue === 1) {
        ch |= (1 << (4 - bit));
        latMin = mid;
      } else {
        latMax = mid;
      }
    }

    evenBit = !evenBit;

    if (bit < 4) {
      bit++;
    } else {
      const char = BASE32[ch];
      geohash += char;
      steps[steps.length - 1].char = char;
      bit = 0;
      ch = 0;
    }
  }

  return steps;
}
