import { motion } from 'framer-motion';

export interface DiagramNode {
  id: number | string;
  label: string | number;
  /** Horizontal position from 0 to 1 */
  x: number;
  depth: number;
  fill?: string;
  stroke?: string;
  text?: string;
  /** Small caption under the node (e.g. an array index) */
  caption?: string;
}

export interface DiagramEdge {
  from: number | string;
  to: number | string;
  highlight?: boolean;
}

interface TreeDiagramProps {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  accent: string;
  /** Minimum number of levels to reserve space for */
  minDepth?: number;
  emptyText?: string;
  /** Accessible name for the whole diagram */
  label?: string;
  onNodeClick?: (node: DiagramNode) => void;
}

const WIDTH = 640;
const LEVEL = 72;
const R = 19;

/**
 * Animated node-link tree; nodes glide to new positions when the tree changes
 */
function TreeDiagram({ nodes, edges, accent, minDepth = 3, emptyText = '', label, onNodeClick }: TreeDiagramProps) {
  const depth = Math.max(minDepth, ...nodes.map((n) => n.depth + 1));
  const height = depth * LEVEL + 12;
  const pos = new Map(nodes.map((n) => [n.id, { x: 24 + n.x * (WIDTH - 48), y: 34 + n.depth * LEVEL }]));
  // Shrink nodes a little when a level gets crowded
  const crowded = Math.max(...nodes.map((n) => nodes.filter((m) => m.depth === n.depth).length), 1);
  const r = crowded > 12 ? 13 : crowded > 8 ? 16 : R;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${height}`} className="block w-full" role="img" aria-label={label}>
      {nodes.length === 0 && (
        <text x={WIDTH / 2} y={height / 2} textAnchor="middle" className="fill-ink-mute font-display" fontSize={20}>
          {emptyText}
        </text>
      )}
      {edges.map(({ from, to, highlight }) => {
        const a = pos.get(from);
        const b = pos.get(to);
        if (!a || !b) return null;
        return (
          <motion.line
            key={`${from}-${to}`}
            initial={false}
            animate={{ x1: a.x, y1: a.y, x2: b.x, y2: b.y }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            stroke={highlight ? accent : 'var(--color-line-strong)'}
            strokeWidth={highlight ? 2.5 : 1.5}
          />
        );
      })}
      {nodes.map((n) => {
        const p = pos.get(n.id)!;
        return (
          <motion.g
            key={n.id}
            initial={{ x: p.x, y: p.y - 12, opacity: 0 }}
            animate={{ x: p.x, y: p.y, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            onClick={onNodeClick ? () => onNodeClick(n) : undefined}
            style={onNodeClick ? { cursor: 'pointer' } : undefined}
          >
            <circle r={r} fill={n.fill ?? 'var(--color-card)'} stroke={n.stroke ?? 'var(--color-line-strong)'} strokeWidth={n.stroke ? 2.5 : 1.5} />
            <text textAnchor="middle" dy="0.35em" fontSize={r > 16 ? 14 : 12} fontWeight={600} fill={n.text ?? 'var(--color-ink)'} className="tabular-nums">
              {n.label}
            </text>
            {n.caption && (
              <text textAnchor="middle" y={r + 13} fontSize={10} fill="var(--color-ink-mute)" fontFamily="JetBrains Mono, monospace">
                {n.caption}
              </text>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}

export default TreeDiagram;
