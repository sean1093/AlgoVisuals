/**
 * Small decorative illustrations for algorithm cards
 */
import { getCategory } from '../registry';

type PreviewProps = { className?: string };

const SORT = getCategory('sorting').theme.accent;
const SEARCH = getCategory('searching').theme.accent;
const GRAPH = getCategory('paths').theme.accent;
const STRUCT = getCategory('trees').theme.accent;
const INDEX = getCategory('indexes').theme.accent;
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
            <rect width="24" height="12" rx="3" fill={row === 2 && i === 1 ? ACTION : row === 5 ? INDEX : 'var(--color-card)'} fillOpacity={row === 5 ? 0.85 : 1} stroke="currentColor" strokeOpacity={row === 2 && i === 1 ? 0 : 0.25} />
            <text x="12" y="9" textAnchor="middle" fontSize="7.5" fill={row === 5 || (row === 2 && i === 1) ? 'var(--color-on-accent)' : 'currentColor'}>
              {w}
            </text>
          </g>
        ))}
      </g>
    ))}
  </svg>
);

const LISTS = getCategory('lists').theme.accent;
const GRAPHS = getCategory('graphs').theme.accent;
const DP = getCategory('dp').theme.accent;

export const LinkedListPreview = ({ className = '' }: PreviewProps) => (
  <svg viewBox="-2 -2 104 104" className={className} aria-hidden="true">
    {[3, 7, 12, 5].map((v, i) => {
      const x = (i % 2) * 52 + 2;
      const y = Math.floor(i / 2) * 44 + 18;
      return (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect width="30" height="20" rx="4" fill={i === 2 ? LISTS : 'var(--color-card)'} stroke={i === 2 ? LISTS : 'currentColor'} strokeOpacity={i === 2 ? 1 : 0.35} />
          <line x1="22" y1="0" x2="22" y2="20" stroke={i === 2 ? 'var(--color-on-accent)' : 'currentColor'} strokeOpacity="0.3" />
          <text x="11" y="14" textAnchor="middle" fontSize="10" fontWeight="600" fill={i === 2 ? 'var(--color-on-accent)' : 'currentColor'}>
            {v}
          </text>
        </g>
      );
    })}
    <path d="M28 28H52M28 28" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" />
    <path d="M49 25L53 28L49 31" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" />
    <path d="M80 28C96 28 96 50 70 56C40 62 20 52 18 62" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" />
    <path d="M28 72H52" stroke={LISTS} strokeWidth="1.5" />
    <path d="M49 69L53 72L49 75" fill="none" stroke={LISTS} strokeWidth="1.5" />
    <text x="86" y="76" fontSize="9" fill="currentColor" fillOpacity="0.5">∅</text>
  </svg>
);

export const StackQueuePreview = ({ className = '' }: PreviewProps) => (
  <svg viewBox="-2 -2 104 104" className={className} aria-hidden="true">
    <path d="M6 18V92H38V18" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
    {['A', 'B', 'C', 'D'].map((l, i) => (
      <g key={l} transform={`translate(10 ${74 - i * 18})`}>
        <rect width="24" height="15" rx="3" fill={i === 3 ? LISTS : 'var(--color-card)'} stroke={i === 3 ? LISTS : 'currentColor'} strokeOpacity={i === 3 ? 1 : 0.3} />
        <text x="12" y="11" textAnchor="middle" fontSize="8" fontWeight="600" fill={i === 3 ? 'var(--color-on-accent)' : 'currentColor'}>
          {l}
        </text>
      </g>
    ))}
    <path d="M50 44H100M50 64H100" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
    {['A', 'B', 'C'].map((l, i) => (
      <g key={l} transform={`translate(${52 + i * 16} 47)`}>
        <rect width="14" height="14" rx="3" fill={i === 0 ? DONE : 'var(--color-card)'} stroke={i === 0 ? DONE : 'currentColor'} strokeOpacity={i === 0 ? 1 : 0.3} />
        <text x="7" y="10" textAnchor="middle" fontSize="7.5" fontWeight="600" fill={i === 0 ? 'var(--color-on-accent)' : 'currentColor'}>
          {l}
        </text>
      </g>
    ))}
  </svg>
);

export const TriePreview = ({ className = '' }: PreviewProps) => {
  const nodes: [string, number, number, boolean][] = [
    ['', 50, 10, false], ['c', 30, 36, true], ['d', 74, 36, false], ['a', 30, 62, true], ['o', 74, 62, false], ['r', 14, 88, true], ['t', 44, 88, false], ['g', 66, 88, false], ['t', 88, 88, false],
  ];
  const edges = [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [3, 6], [4, 7], [4, 8]];
  return (
    <svg viewBox="-2 -2 104 104" className={className} aria-hidden="true">
      {edges.map(([a, b]) => (
        <line key={b} x1={nodes[a][1]} y1={nodes[a][2]} x2={nodes[b][1]} y2={nodes[b][2]} stroke={nodes[b][3] ? STRUCT : 'currentColor'} strokeOpacity={nodes[b][3] ? 1 : 0.3} strokeWidth={nodes[b][3] ? 1.8 : 1} />
      ))}
      {nodes.map(([l, x, y, hot], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="8" fill={hot ? STRUCT : 'var(--color-card)'} stroke={hot ? STRUCT : 'currentColor'} strokeOpacity={hot ? 1 : 0.35} />
          <text x={x} y={y + 3} textAnchor="middle" fontSize="8.5" fontWeight="600" fill={hot ? 'var(--color-on-accent)' : 'currentColor'}>
            {l}
          </text>
        </g>
      ))}
    </svg>
  );
};

function graphPreview(
  nodes: [number, number][],
  edges: [number, number, number?][],
  look: { node?: Record<number, string>; edge?: Record<number, string>; directed?: boolean; faint?: number[] }
) {
  return function GraphPreview({ className = '' }: PreviewProps) {
    return (
      <svg viewBox="-2 -2 104 104" className={className} aria-hidden="true">
        {edges.map(([a, b, w], i) => {
          const [x1, y1] = nodes[a];
          const [x2, y2] = nodes[b];
          const len = Math.hypot(x2 - x1, y2 - y1);
          const ux = (x2 - x1) / len;
          const uy = (y2 - y1) / len;
          const colour = look.edge?.[i];
          const tx = x2 - ux * 9;
          const ty = y2 - uy * 9;
          return (
            <g key={i} opacity={look.faint?.includes(i) ? 0.35 : 1}>
              <line x1={x1 + ux * 9} y1={y1 + uy * 9} x2={tx - ux * (look.directed ? 3 : 0)} y2={ty - uy * (look.directed ? 3 : 0)} stroke={colour ?? 'currentColor'} strokeOpacity={colour ? 1 : 0.35} strokeWidth={colour ? 2.2 : 1.2} strokeDasharray={look.faint?.includes(i) ? '3 3' : undefined} />
              {look.directed && (
                <polygon points={`${tx},${ty} ${tx - ux * 5 - uy * 3},${ty - uy * 5 + ux * 3} ${tx - ux * 5 + uy * 3},${ty - uy * 5 - ux * 3}`} fill={colour ?? 'currentColor'} fillOpacity={colour ? 1 : 0.45} />
              )}
              {w !== undefined && (
                <text x={(x1 + x2) / 2 + uy * 6} y={(y1 + y2) / 2 - ux * 6 + 3} textAnchor="middle" fontSize="8" fill={colour ?? 'currentColor'} fillOpacity={colour ? 1 : 0.55}>
                  {w}
                </text>
              )}
            </g>
          );
        })}
        {nodes.map(([x, y], i) => {
          const colour = look.node?.[i];
          return <circle key={i} cx={x} cy={y} r="8" fill={colour ?? 'var(--color-card)'} stroke={colour ?? 'currentColor'} strokeOpacity={colour ? 1 : 0.35} />;
        })}
      </svg>
    );
  };
}

export const TopoPreview = graphPreview(
  [[12, 22], [12, 78], [46, 50], [50, 12], [86, 30], [86, 82]],
  [[0, 3], [0, 2], [1, 2], [3, 4], [2, 4], [2, 5]],
  { directed: true, node: { 0: DONE, 1: DONE, 2: GRAPHS }, edge: { 1: GRAPHS, 2: GRAPHS }, faint: [] }
);

export const MSTPreview = graphPreview(
  [[12, 50], [38, 14], [38, 86], [66, 46], [90, 14], [90, 84]],
  [[0, 1, 4], [0, 2, 2], [1, 2, 6], [1, 3, 3], [2, 3, 5], [3, 4, 1], [3, 5, 2], [4, 5, 7]],
  { node: {}, edge: { 0: GRAPHS, 1: GRAPHS, 3: GRAPHS, 5: GRAPHS, 6: GRAPHS }, faint: [2, 7] }
);

export const UnionFindPreview = ({ className = '' }: PreviewProps) => {
  const trees: [number, number, number | null, string][] = [
    [26, 18, null, GRAPHS], [12, 50, 0, GRAPHS], [40, 50, 0, GRAPHS], [40, 82, 2, GRAPHS],
    [76, 18, null, DONE], [64, 50, 4, DONE], [88, 50, 4, DONE],
  ];
  return (
    <svg viewBox="-2 -2 104 104" className={className} aria-hidden="true">
      {trees.map(([x, y, p], i) =>
        p === null ? null : <line key={`e${i}`} x1={x} y1={y} x2={trees[p][0]} y2={trees[p][1]} stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.2" />
      )}
      {trees.map(([x, y, p, colour], i) => (
        <circle key={i} cx={x} cy={y} r="8" fill={p === null ? colour : 'var(--color-card)'} stroke={colour} strokeWidth="1.6" />
      ))}
    </svg>
  );
};

export const FibPreview = ({ className = '' }: PreviewProps) => {
  // fib(4) call tree; repeated calls outlined in the action colour
  const calls: [number, number, number, number | null, boolean][] = [
    [4, 50, 10, null, false], [3, 28, 38, 0, false], [2, 76, 38, 0, true], [2, 14, 66, 1, false], [1, 42, 66, 1, false],
    [1, 64, 66, 2, true], [0, 88, 66, 2, true], [1, 6, 92, 3, false], [0, 22, 92, 3, false],
  ];
  return (
    <svg viewBox="-2 -2 104 104" className={className} aria-hidden="true">
      {calls.map(([, x, y, p], i) => (p === null ? null : <line key={`e${i}`} x1={x} y1={y} x2={calls[p][1]} y2={calls[p][2]} stroke="currentColor" strokeOpacity="0.3" />))}
      {calls.map(([n, x, y, , repeat], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="7.5" fill={i === 0 ? DP : 'var(--color-card)'} stroke={repeat ? ACTION : i === 0 ? DP : 'currentColor'} strokeOpacity={repeat || i === 0 ? 1 : 0.35} strokeWidth={repeat ? 1.6 : 1} />
          <text x={x} y={y + 3} textAnchor="middle" fontSize="8" fontWeight="600" fill={i === 0 ? 'var(--color-on-accent)' : repeat ? ACTION : 'currentColor'}>
            {n}
          </text>
        </g>
      ))}
    </svg>
  );
};

export const EditDistancePreview = ({ className = '' }: PreviewProps) => {
  const rows = [
    [0, 1, 2, 3, 4],
    [1, 1, 2, 3, 4],
    [2, 2, 1, 2, 3],
    [3, 3, 2, 1, 2],
  ];
  const path = new Set(['0,0', '1,1', '2,2', '3,3', '3,4']);
  return (
    <svg viewBox="-2 -2 104 104" className={className} aria-hidden="true">
      {rows.map((row, i) =>
        row.map((v, j) => {
          const on = path.has(`${i},${j}`);
          return (
            <g key={`${i}-${j}`} transform={`translate(${j * 20 + 1} ${i * 20 + 12})`}>
              <rect width="17" height="17" rx="3" fill={on ? DP : 'var(--color-card)'} fillOpacity={on ? 0.9 : 1} stroke="currentColor" strokeOpacity={on ? 0 : 0.25} />
              <text x="8.5" y="12" textAnchor="middle" fontSize="8" fontWeight="600" fill={on ? 'var(--color-on-accent)' : 'currentColor'} fillOpacity={on ? 1 : 0.6}>
                {v}
              </text>
            </g>
          );
        })
      )}
    </svg>
  );
};

export const QueensPreview = ({ className = '' }: PreviewProps) => {
  const queens = [1, 3, 0, 2];
  return (
    <svg viewBox="-2 -2 104 104" className={className} aria-hidden="true">
      {Array.from({ length: 16 }, (_, k) => {
        const r = Math.floor(k / 4);
        const c = k % 4;
        return <rect key={k} x={c * 25} y={r * 25} width="25" height="25" fill={(r + c) % 2 ? 'currentColor' : 'var(--color-card)'} fillOpacity={(r + c) % 2 ? 0.1 : 1} />;
      })}
      <rect width="100" height="100" fill="none" stroke="currentColor" strokeOpacity="0.3" />
      {queens.map((c, r) => (
        <circle key={r} cx={c * 25 + 12.5} cy={r * 25 + 12.5} r="7" fill={r === 3 ? ACTION : DP} />
      ))}
    </svg>
  );
};
