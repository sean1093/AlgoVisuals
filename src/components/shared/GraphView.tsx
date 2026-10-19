import { motion } from 'framer-motion';

export interface GraphNode {
  id: number;
  label: string;
  /** Position in a 0–100 × 0–60 space */
  x: number;
  y: number;
}

export interface GraphEdge {
  from: number;
  to: number;
  weight?: number;
  directed?: boolean;
}

export interface NodeLook {
  fill?: string;
  stroke?: string;
  text?: string;
  /** Small badge in the corner, e.g. an in-degree count */
  badge?: string | number;
  ring?: boolean;
}

export interface EdgeLook {
  color?: string;
  width?: number;
  dashed?: boolean;
  opacity?: number;
}

interface GraphViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  nodeLook?: (id: number) => NodeLook;
  edgeLook?: (index: number) => EdgeLook;
  onNodeClick?: (id: number) => void;
  label: string;
  className?: string;
}

const W = 100;
const H = 60;
const R = 4.2;

/**
 * Node-link diagram with optional weights and arrows
 */
function GraphView({ nodes, edges, nodeLook = () => ({}), edgeLook = () => ({}), onNodeClick, label, className = '' }: GraphViewProps) {
  const byId = new Map(nodes.map((n) => [n.id, n]));

  return (
    <svg viewBox={`-2 -2 ${W + 4} ${H + 4}`} className={`block w-full select-none ${className}`} role="img" aria-label={label}>
      {edges.map((e, i) => {
        const a = byId.get(e.from);
        const b = byId.get(e.to);
        if (!a || !b) return null;
        const look = edgeLook(i);
        // Stop the line at the node's edge so arrowheads stay visible
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        const x1 = a.x + ux * R;
        const y1 = a.y + uy * R;
        const x2 = b.x - ux * (R + (e.directed ? 1.6 : 0));
        const y2 = b.y - uy * (R + (e.directed ? 1.6 : 0));
        const color = look.color ?? 'var(--color-line-strong)';
        // Arrowhead drawn by hand (marker colours can't follow the line everywhere)
        const tipX = b.x - ux * R;
        const tipY = b.y - uy * R;
        const head = `${tipX},${tipY} ${tipX - ux * 2.2 - uy * 1.2},${tipY - uy * 2.2 + ux * 1.2} ${tipX - ux * 2.2 + uy * 1.2},${tipY - uy * 2.2 - ux * 1.2}`;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        return (
          <g key={i} opacity={look.opacity ?? 1}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth={look.width ?? 0.6}
              strokeDasharray={look.dashed ? '1.4 1.2' : undefined}
              style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
            />
            {e.directed && <polygon points={head} fill={color} style={{ transition: 'fill 0.2s' }} />}
            {e.weight !== undefined && (
              <g>
                <rect x={mx - 2.6} y={my - 2.1} width={5.2} height={4.2} rx={1.2} fill="var(--color-card)" stroke={look.color ?? 'var(--color-line)'} strokeWidth={0.3} />
                <text x={mx} y={my + 1.15} textAnchor="middle" fontSize={2.9} fontWeight={600} fill={look.color ?? 'var(--color-ink-soft)'}>
                  {e.weight}
                </text>
              </g>
            )}
          </g>
        );
      })}
      {nodes.map((n) => {
        const look = nodeLook(n.id);
        return (
          <motion.g
            key={n.id}
            initial={false}
            animate={{ x: n.x, y: n.y }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            onClick={onNodeClick ? () => onNodeClick(n.id) : undefined}
            style={onNodeClick ? { cursor: 'pointer' } : undefined}
          >
            {look.ring && <circle r={R + 1.3} fill="none" stroke={look.stroke ?? 'var(--color-ink)'} strokeWidth={0.5} strokeDasharray="1 0.8" />}
            <circle
              r={R}
              fill={look.fill ?? 'var(--color-card)'}
              stroke={look.stroke ?? 'var(--color-line-strong)'}
              strokeWidth={look.stroke ? 0.8 : 0.5}
              style={{ transition: 'fill 0.2s, stroke 0.2s' }}
            />
            <text textAnchor="middle" dy="0.35em" fontSize={n.label.length > 2 ? 2.4 : 3.2} fontWeight={600} fill={look.text ?? 'var(--color-ink)'}>
              {n.label}
            </text>
            {look.badge !== undefined && (
              <g transform={`translate(${R * 0.8} ${-R * 0.8})`}>
                <circle r={1.9} fill="var(--color-ink)" />
                <text textAnchor="middle" dy="0.35em" fontSize={2.2} fontWeight={700} fill="var(--color-paper)">
                  {look.badge}
                </text>
              </g>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}

export default GraphView;
