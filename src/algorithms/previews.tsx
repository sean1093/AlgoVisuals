/**
 * Small decorative illustrations for algorithm cards
 */
import { getCategory } from '../registry';

type PreviewProps = { className?: string };

const SORT = getCategory('sorting').theme.accent;
const SEARCH = getCategory('searching').theme.accent;
const GRAPH = getCategory('graphs').theme.accent;
const STRUCT = getCategory('structures').theme.accent;
const DONE = 'var(--color-sage)';
const ACTION = 'var(--color-clay)';

/**
 * Bar chart preview; `marks` maps bar index → colour
 */
export function barsPreview(values: number[], marks: Record<number, string> = {}) {
  return function BarsPreview({ className = '' }: PreviewProps) {
    const w = 100 / values.length;
    return (
      <svg viewBox="-2 -2 104 104" className={className} aria-hidden="true">
        <path d="M0 100H100" stroke="currentColor" strokeOpacity="0.3" />
        {values.map((v, i) => (
          <rect key={i} x={i * w + w * 0.15} y={100 - v} width={w * 0.7} height={v} rx="1.5" fill={marks[i] ?? SORT} fillOpacity={marks[i] ? 1 : 0.28} />
        ))}
      </svg>
    );
  };
}

export const SortRacePreview = ({ className = '' }: PreviewProps) => (
  <svg viewBox="-2 -2 104 104" className={className} aria-hidden="true">
    {[0, 1, 2].map((lane) => (
      <g key={lane} transform={`translate(0 ${lane * 34})`}>
        {[22, 8, 16, 26, 12, 4, 18, 28].map((v, i) => {
          const sortedUpTo = [8, 5, 2][lane];
          const value = i < sortedUpTo ? 4 + i * 3.4 : v;
          return <rect key={i} x={i * 12.5 + 1.5} y={30 - value} width="9.5" height={value} rx="1" fill={i < sortedUpTo ? DONE : SORT} fillOpacity={i < sortedUpTo ? 0.85 : 0.3} />;
        })}
      </g>
    ))}
  </svg>
);

export function boxesPreview(kind: 'linear' | 'binary') {
  return function BoxesPreview({ className = '' }: PreviewProps) {
    const values = [3, 8, 12, 19, 24, 31, 40, 47, 55];
    return (
      <svg viewBox="-2 -2 104 104" className={className} aria-hidden="true">
        {values.map((v, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const out = kind === 'binary' ? i < 4 : i < 5;
          const current = kind === 'binary' ? i === 6 : i === 5;
          return (
            <g key={v} transform={`translate(${col * 34 + 2} ${row * 34 + 2})`}>
              <rect width="28" height="28" rx="6" fill={current ? SEARCH : 'var(--color-card)'} fillOpacity={current ? 1 : out ? 0.4 : 1} stroke={current ? SEARCH : 'currentColor'} strokeOpacity={current ? 1 : 0.25} />
              <text x="14" y="18.5" textAnchor="middle" fontSize="11" fontWeight="600" fill={current ? 'var(--color-on-accent)' : 'currentColor'} fillOpacity={out ? 0.3 : 0.8}>
                {v}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };
}

export function gridPreview(kind: 'bfs' | 'dfs' | 'dijkstra' | 'astar') {
  const n = 8;
  const start = [1, 6];
  const end = [6, 1];
  const walls = new Set(['3,2', '3,3', '3,4', '3,5', '4,5']);
  const visited = (r: number, c: number) => {
    const d = Math.abs(r - start[0]) + Math.abs(c - start[1]);
    if (kind === 'bfs') return d <= 4;
    if (kind === 'dijkstra') return d <= 4 && !(r < 3 && c > 5);
    if (kind === 'astar') return d + Math.abs(r - end[0]) + Math.abs(c - end[1]) <= 12 && d <= 6 && c <= 6;
    return c === 6 || (r === 1 && c <= 6) || (c === 0 && r <= 3);
  };
  const path = new Set(['1,6', '1,5', '2,5', '2,4', '2,3', '2,2', '2,1', '3,1', '4,1', '5,1', '6,1']);
  return function GridPreview({ className = '' }: PreviewProps) {
    const s = 100 / n;
    return (
      <svg viewBox="-2 -2 104 104" className={className} aria-hidden="true">
        {Array.from({ length: n * n }, (_, i) => {
          const c = i % n;
          const r = Math.floor(i / n);
          const key = `${r},${c}`;
          const fill = walls.has(key) ? 'var(--path-wall)' : path.has(key) ? 'var(--path-route)' : visited(r, c) ? GRAPH : 'var(--color-card)';
          const opacity = walls.has(key) || path.has(key) ? 1 : visited(r, c) ? 0.25 : 1;
          return <rect key={i} x={c * s} y={r * s} width={s} height={s} fill={fill} fillOpacity={opacity} stroke="currentColor" strokeOpacity="0.12" strokeWidth="0.6" />;
        })}
        <circle cx={start[1] * s + s / 2} cy={start[0] * s + s / 2} r={s * 0.32} fill={DONE} />
        <circle cx={end[1] * s + s / 2} cy={end[0] * s + s / 2} r={s * 0.32} fill={ACTION} />
      </svg>
    );
  };
}

function treePreview(labels: (number | null)[], marks: Record<number, string>) {
  return function TreePreview({ className = '' }: PreviewProps) {
    const pos = (i: number) => {
      const level = Math.floor(Math.log2(i + 1));
      const p = i - (2 ** level - 1);
      return { x: ((p + 0.5) / 2 ** level) * 100, y: 12 + level * 30 };
    };
    return (
      <svg viewBox="-2 -2 104 104" className={className} aria-hidden="true">
        {labels.map((l, i) => {
          if (l === null || i === 0) return null;
          const a = pos(Math.floor((i - 1) / 2));
          const b = pos(i);
          return <line key={`e${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="currentColor" strokeOpacity="0.3" />;
        })}
        {labels.map((l, i) => {
          if (l === null) return null;
          const { x, y } = pos(i);
          const mark = marks[i];
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="8.5" fill={mark ?? 'var(--color-card)'} stroke={mark ?? 'currentColor'} strokeOpacity={mark ? 1 : 0.35} />
              <text x={x} y={y + 3.5} textAnchor="middle" fontSize="9" fontWeight="600" fill={mark ? 'var(--color-on-accent)' : 'currentColor'}>
                {l}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };
}

export const BSTPreview = treePreview([50, 30, 70, 20, 40, 60, 80, null, null, 35], { 0: STRUCT, 1: STRUCT, 4: DONE });
export const HeapPreview = treePreview([3, 9, 5, 14, 10, 8, 12, 20], { 0: DONE, 3: ACTION, 1: STRUCT });

export const HashPreview = ({ className = '' }: PreviewProps) => (
  <svg viewBox="-2 -2 104 104" className={className} aria-hidden="true">
    {[['cat'], [], ['owl', 'fox'], ['bee'], [], ['dog', 'yak', 'emu']].map((chain, row) => (
      <g key={row} transform={`translate(0 ${row * 17})`}>
        <text x="4" y="11" fontSize="8" fontFamily="JetBrains Mono, monospace" fill="currentColor" fillOpacity="0.5">
          {row}
        </text>
        <line x1="13" y1="0" x2="13" y2="15" stroke="currentColor" strokeOpacity="0.2" />
        {chain.map((w, i) => (
          <g key={w} transform={`translate(${17 + i * 28} 1.5)`}>
            <rect width="24" height="12" rx="3" fill={row === 2 && i === 1 ? ACTION : row === 5 ? STRUCT : 'var(--color-card)'} fillOpacity={row === 5 ? 0.85 : 1} stroke="currentColor" strokeOpacity={row === 2 && i === 1 ? 0 : 0.25} />
            <text x="12" y="9" textAnchor="middle" fontSize="7.5" fill={row === 5 || (row === 2 && i === 1) ? 'var(--color-on-accent)' : 'currentColor'}>
              {w}
            </text>
          </g>
        ))}
      </g>
    ))}
  </svg>
);
