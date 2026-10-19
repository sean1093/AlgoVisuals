import { MouseEvent, useRef } from 'react';
import { BASE32, decode, encode } from './logic';
import { clampLat, sharedPrefix, wrapLng } from './format';
import { useI18n } from '../../i18n';

const ACCENT = 'var(--color-clay)';
const VIEW_W = 600;
const VIEW_H = 400;

interface CloseUpProps {
  geohash: string;
  lat: number;
  lng: number;
  showNeighbors: boolean;
  onPick: (lat: number, lng: number, isNeighbor: boolean) => void;
}

/**
 * Zoomed view: the current cell, its 8 neighbours, and the 32 smaller
 * cells the next character would choose between.
 */
function CloseUp({ geohash, lat, lng, showNeighbors, onPick }: CloseUpProps) {
  const { t } = useI18n();
  const svgRef = useRef<SVGSVGElement>(null);
  const precision = geohash.length;
  const { bounds } = decode(geohash);
  const latSpan = bounds.maxLat - bounds.minLat;
  const lngSpan = bounds.maxLng - bounds.minLng;

  // Fit a 3×3 block of cells, keeping each cell's true degree proportions
  const ratio = lngSpan / latSpan;
  const blockW = Math.min(VIEW_W, VIEW_H * ratio);
  const blockH = blockW / ratio;
  const cellW = blockW / 3;
  const cellH = blockH / 3;
  const originX = (VIEW_W - blockW) / 2;
  const originY = (VIEW_H - blockH) / 2;

  // Map lat/lng (relative to the centre cell) into view coordinates
  const toXY = (pLat: number, pLng: number) => {
    let dLng = pLng - bounds.minLng;
    if (dLng > 180) dLng -= 360;
    if (dLng < -180) dLng += 360;
    return {
      x: originX + cellW + (dLng / lngSpan) * cellW,
      y: originY + cellH + ((bounds.maxLat - pLat) / latSpan) * cellH,
    };
  };

  const cells: { dx: number; dy: number; code: string }[] = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const cLat = (bounds.minLat + bounds.maxLat) / 2 - dy * latSpan;
      if (cLat > 90 || cLat < -90) continue;
      const cLng = wrapLng((bounds.minLng + bounds.maxLng) / 2 + dx * lngSpan);
      cells.push({ dx, dy, code: encode(cLat, cLng, precision) });
    }
  }

  const nextChar = encode(lat, lng, precision + 1).slice(-1);
  const subCells = BASE32.split('').map((char) => {
    const b = decode(geohash + char).bounds;
    const a = toXY(b.maxLat, b.minLng);
    const z = toXY(b.minLat, b.maxLng);
    return { char, x: a.x, y: a.y, w: z.x - a.x, h: z.y - a.y };
  });

  const pin = toXY(lat, lng);

  const handleClick = (e: MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * VIEW_W;
    const y = ((e.clientY - rect.top) / rect.height) * VIEW_H;
    const pLng = bounds.minLng + ((x - originX - cellW) / cellW) * lngSpan;
    const pLat = bounds.maxLat - ((y - originY - cellH) / cellH) * latSpan;
    const insideCentre = x >= originX + cellW && x < originX + 2 * cellW && y >= originY + cellH && y < originY + 2 * cellH;
    onPick(clampLat(pLat), wrapLng(pLng), !insideCentre);
  };

  const labelSize = Math.max(11, Math.min(15, cellW / 9));

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="block w-full cursor-pointer touch-manipulation"
      onClick={handleClick}
      role="img"
      aria-label={t.geohash.closeUpLabel}
    >
      {/* Neighbours */}
      {cells.map(({ dx, dy, code }) => {
        const centre = dx === 0 && dy === 0;
        if (!centre && !showNeighbors) return null;
        const x = originX + (dx + 1) * cellW;
        const y = originY + (dy + 1) * cellH;
        const shared = sharedPrefix(code, geohash);
        return (
          <g key={`${dx}-${dy}`}>
            <rect
              x={x}
              y={y}
              width={cellW}
              height={cellH}
              fill={centre ? ACCENT : 'var(--color-ink)'}
              fillOpacity={centre ? 0.07 : 0.025}
              stroke={centre ? ACCENT : 'var(--color-ink)'}
              strokeOpacity={centre ? 1 : 0.18}
              strokeWidth={centre ? 2 : 1}
              className={centre ? '' : 'transition-all hover:[fill-opacity:0.08]'}
            />
            {!centre && (
              <text
                x={x + cellW / 2}
                y={y + cellH / 2 + labelSize / 3}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize={labelSize}
                letterSpacing={1}
                pointerEvents="none"
              >
                <tspan fill="var(--color-ink)" fillOpacity={0.35}>{code.slice(0, shared)}</tspan>
                <tspan fill={ACCENT} fontWeight={600}>{code.slice(shared)}</tspan>
              </text>
            )}
          </g>
        );
      })}

      {/* Next-level cells inside the centre */}
      {subCells.map(({ char, x, y, w, h }) => {
        const active = char === nextChar;
        return (
          <g key={char} pointerEvents="none">
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              fill={ACCENT}
              fillOpacity={active ? 0.22 : 0}
              stroke={ACCENT}
              strokeOpacity={0.22}
              strokeWidth={0.75}
            />
            {Math.min(w, h) > 14 && (
              <text
                x={x + w / 2}
                y={y + h / 2 + 3.5}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize={Math.min(11, w / 2.2)}
                fill={active ? ACCENT : 'var(--color-ink)'}
                fillOpacity={active ? 1 : 0.3}
                fontWeight={active ? 700 : 500}
              >
                {char}
              </text>
            )}
          </g>
        );
      })}

      {/* Centre label */}
      <g pointerEvents="none">
        <rect
          x={originX + cellW + 6}
          y={originY + cellH + 6}
          rx={6}
          width={geohash.length * 9 + 14}
          height={22}
          fill={ACCENT}
        />
        <text
          x={originX + cellW + 13}
          y={originY + cellH + 21.5}
          fontFamily="JetBrains Mono, monospace"
          fontSize={13}
          fontWeight={600}
          fill="var(--color-card)"
        >
          {geohash}
        </text>
      </g>

      {/* Pin */}
      <circle cx={pin.x} cy={pin.y} r={7} fill={ACCENT} stroke="var(--color-card)" strokeWidth={2.5} pointerEvents="none" />
    </svg>
  );
}

export default CloseUp;
