import { memo, MouseEvent, useRef } from 'react';
import { motion } from 'framer-motion';
import { encode, GeoBounds } from './logic';
import { LAND_ROWS } from './worldLand';

export const MAP_WIDTH = 720;
export const MAP_HEIGHT = 360;
const ACCENT = '#c0553a';

export function latLngToXY(lat: number, lng: number) {
  return {
    x: ((lng + 180) / 360) * MAP_WIDTH,
    y: ((90 - lat) / 180) * MAP_HEIGHT,
  };
}

function xyToLatLng(x: number, y: number) {
  return {
    lat: 90 - (y / MAP_HEIGHT) * 180,
    lng: (x / MAP_WIDTH) * 360 - 180,
  };
}

/**
 * All land dots as a single path (much cheaper than thousands of circles)
 */
const LandDots = memo(function LandDots() {
  const cols = LAND_ROWS[0].length * 4;
  const step = MAP_WIDTH / cols;
  const r = step * 0.3;
  let d = '';
  LAND_ROWS.forEach((row, rowIndex) => {
    for (let col = 0; col < cols; col++) {
      const nibble = parseInt(row[col >> 2], 16);
      if (nibble & (8 >> (col & 3))) {
        const cx = (col + 0.5) * step;
        const cy = (rowIndex + 0.5) * step;
        d += `M${(cx - r).toFixed(1)} ${cy.toFixed(1)}a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(2 * r).toFixed(2)} 0a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(-2 * r).toFixed(2)} 0`;
      }
    }
  });
  return <path d={d} fill="#1f1d1a" fillOpacity={0.2} />;
});

/**
 * The 32 first-level GeoHash cells (8 columns × 4 rows of 45°)
 */
const FIRST_LEVEL = Array.from({ length: 32 }, (_, i) => {
  const col = i % 8;
  const row = Math.floor(i / 8);
  const lng = -180 + col * 45 + 22.5;
  const lat = 90 - row * 45 - 22.5;
  return { col, row, char: encode(lat, lng, 1) };
});

interface WorldMapProps {
  lat: number;
  lng: number;
  bounds: GeoBounds;
  firstChar: string;
  onPick: (lat: number, lng: number) => void;
}

function WorldMap({ lat, lng, bounds, firstChar, onPick }: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const cellW = MAP_WIDTH / 8;
  const cellH = MAP_HEIGHT / 4;

  const handleClick = (e: MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * MAP_WIDTH;
    const y = ((e.clientY - rect.top) / rect.height) * MAP_HEIGHT;
    const p = xyToLatLng(x, y);
    onPick(p.lat, p.lng);
  };

  const pos = latLngToXY(lat, lng);
  const tl = latLngToXY(bounds.maxLat, bounds.minLng);
  const br = latLngToXY(bounds.minLat, bounds.maxLng);
  const w = br.x - tl.x;
  const h = br.y - tl.y;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      className="block w-full cursor-crosshair touch-manipulation"
      onClick={handleClick}
      role="img"
      aria-label="World map. Click to choose a place."
    >
      <LandDots />

      {/* First-level cells */}
      {FIRST_LEVEL.map(({ col, row, char }) => {
        const active = char === firstChar;
        return (
          <g key={char}>
            <rect
              x={col * cellW}
              y={row * cellH}
              width={cellW}
              height={cellH}
              fill={active ? ACCENT : 'transparent'}
              fillOpacity={active ? 0.08 : 0}
              stroke="#1f1d1a"
              strokeOpacity={0.08}
            />
            <text
              x={col * cellW + 8}
              y={row * cellH + 18}
              fontFamily="JetBrains Mono, monospace"
              fontSize={12}
              fill={active ? ACCENT : '#1f1d1a'}
              fillOpacity={active ? 1 : 0.28}
              fontWeight={active ? 600 : 500}
            >
              {char}
            </text>
          </g>
        );
      })}

      {/* Crosshair so the spot is easy to find even when the cell is tiny */}
      <line x1={0} x2={MAP_WIDTH} y1={pos.y} y2={pos.y} stroke={ACCENT} strokeOpacity={0.25} strokeDasharray="3 4" />
      <line y1={0} y2={MAP_HEIGHT} x1={pos.x} x2={pos.x} stroke={ACCENT} strokeOpacity={0.25} strokeDasharray="3 4" />

      {/* Current cell */}
      {w > 3 && (
        <rect x={tl.x} y={tl.y} width={w} height={h} fill={ACCENT} fillOpacity={0.18} stroke={ACCENT} strokeWidth={1.5} />
      )}

      {/* Pin */}
      <motion.circle
        key={`${lat}-${lng}`}
        cx={pos.x}
        cy={pos.y}
        fill="none"
        stroke={ACCENT}
        initial={{ r: 4, opacity: 0.8 }}
        animate={{ r: 18, opacity: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      <circle cx={pos.x} cy={pos.y} r={6} fill={ACCENT} stroke="#fffdf8" strokeWidth={2.5} />
    </svg>
  );
}

export default WorldMap;
