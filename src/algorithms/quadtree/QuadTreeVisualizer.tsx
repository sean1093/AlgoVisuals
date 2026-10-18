import { useMemo, useRef, useState, MouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MousePointerClick, Shuffle, Undo2, Eraser } from 'lucide-react';
import { QuadTree, Point, Rectangle } from './logic';
import Button from '../../components/shared/Button';
import Slider from '../../components/shared/Slider';
import Panel from '../../components/shared/Panel';
import Stat from '../../components/shared/Stat';
import GuideSteps from '../../components/shared/GuideSteps';

const CANVAS_SIZE = 600;
const ACCENT = '#3f6b5c';
const SOFT = '#e2ebe4';

interface Dot extends Point {
  id: number;
}

const BOUNDARY: Rectangle = { x: 0, y: 0, width: CANVAS_SIZE, height: CANVAS_SIZE };

function depthOf(node: Rectangle) {
  return Math.round(Math.log2(CANVAS_SIZE / node.width));
}

// Clustered random points look more like real data and show subdivision better
function scatter(count: number, startId: number): Dot[] {
  const cx = 80 + Math.random() * (CANVAS_SIZE - 160);
  const cy = 80 + Math.random() * (CANVAS_SIZE - 160);
  return Array.from({ length: count }, (_, i) => {
    const clustered = i < count * 0.7;
    const spread = clustered ? 70 : CANVAS_SIZE / 2;
    const x = clustered ? cx + (Math.random() + Math.random() - 1) * spread : Math.random() * CANVAS_SIZE;
    const y = clustered ? cy + (Math.random() + Math.random() - 1) * spread : Math.random() * CANVAS_SIZE;
    return {
      id: startId + i,
      x: Math.min(CANVAS_SIZE - 4, Math.max(4, x)),
      y: Math.min(CANVAS_SIZE - 4, Math.max(4, y)),
    };
  });
}

function QuadTreeVisualizer() {
  const [capacity, setCapacity] = useState(4);
  const [points, setPoints] = useState<Dot[]>([]);
  const [hoveredNode, setHoveredNode] = useState<Rectangle | null>(null);
  const [hasHovered, setHasHovered] = useState(false);
  const [hasChangedCapacity, setHasChangedCapacity] = useState(false);
  const nextId = useRef(0);
  const svgRef = useRef<SVGSVGElement>(null);

  // Rebuild the tree whenever points or capacity change
  const quadTree = useMemo(() => {
    const tree = new QuadTree(BOUNDARY, capacity);
    points.forEach((p) => tree.insert(p));
    return tree;
  }, [points, capacity]);

  const allNodes = useMemo(() => quadTree.getAllNodes(), [quadTree]);
  const leaves = useMemo(() => {
    // A leaf is a node that no other node sits inside of
    return allNodes.filter(
      (node) => !allNodes.some((other) => other !== node && other.width < node.width &&
        QuadTree.contains(node, { x: other.x, y: other.y }))
    );
  }, [allNodes]);
  const maxDepth = allNodes.reduce((max, n) => Math.max(max, depthOf(n)), 0);
  const avgPerBox = leaves.length ? points.length / leaves.length : 0;

  // Convert screen coordinates to canvas coordinates (the SVG may be scaled)
  const toCanvas = (e: MouseEvent<SVGSVGElement>): Point | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE,
    };
  };

  const findLeaf = (point: Point) => {
    let smallest: Rectangle | null = null;
    for (const node of allNodes) {
      if (QuadTree.contains(node, point) && (!smallest || node.width < smallest.width)) {
        smallest = node;
      }
    }
    return smallest;
  };

  const handleCanvasClick = (e: MouseEvent<SVGSVGElement>) => {
    const p = toCanvas(e);
    if (!p) return;
    setPoints((prev) => [...prev, { ...p, id: nextId.current++ }]);
  };

  const handlePointerMove = (e: MouseEvent<SVGSVGElement>) => {
    const p = toCanvas(e);
    if (!p) return;
    const leaf = findLeaf(p);
    setHoveredNode(leaf);
    if (leaf && points.length > 0) setHasHovered(true);
  };

  const handleScatter = () => {
    const batch = scatter(12, nextId.current);
    nextId.current += batch.length;
    setPoints((prev) => [...prev, ...batch]);
  };

  const handleCapacityChange = (value: number) => {
    setCapacity(value);
    if (points.length > 0) setHasChangedCapacity(true);
  };

  const hoveredPoints = hoveredNode ? points.filter((p) => QuadTree.contains(hoveredNode, p)) : [];
  const steps = [
    {
      title: 'Fill a box until it splits',
      detail: (
        <>
          A box holds up to <b className="text-ink">{capacity}</b> points. Click the canvas to add more — or
          press <b className="text-ink">Scatter</b> — and watch it break into four.
        </>
      ),
      done: allNodes.length > 1,
    },
    {
      title: 'Hover over a region',
      detail: 'Move your cursor around. The highlighted box is where that spot “lives” in the tree.',
      done: hasHovered,
    },
    {
      title: 'Change how much a box can hold',
      detail: 'Drag the slider. A smaller limit means more, tinier boxes; a bigger limit means fewer.',
      done: hasChangedCapacity,
    },
  ];
  const allDone = steps.every((s) => s.done);

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Canvas */}
        <div className="rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex gap-8">
              <Stat label="Points" value={points.length} />
              <Stat label="Boxes" value={leaves.length} />
              <Stat label="Levels deep" value={maxDepth} />
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="secondary" size="sm" onClick={handleScatter} title="Add 12 random points">
                <Shuffle size={15} />
                Scatter
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPoints((prev) => prev.slice(0, -1))}
                disabled={points.length === 0}
                title="Remove the last point"
              >
                <Undo2 size={15} />
                <span className="hidden sm:inline">Undo</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPoints([]);
                  setHoveredNode(null);
                }}
                disabled={points.length === 0}
                title="Remove all points"
              >
                <Eraser size={15} />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-line bg-paper/60">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
              className="block aspect-square w-full cursor-crosshair touch-manipulation"
              onClick={handleCanvasClick}
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setHoveredNode(null)}
              role="img"
              aria-label="QuadTree canvas. Click to add points."
            >
              {/* Boxes, tinted a little deeper at each level */}
              {leaves.map((node) => (
                <rect
                  key={`${node.x}-${node.y}-${node.width}`}
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  fill={ACCENT}
                  fillOpacity={Math.min(depthOf(node) * 0.018, 0.09)}
                  stroke={ACCENT}
                  strokeOpacity={0.35}
                  strokeWidth={1}
                />
              ))}

              {/* Hovered box */}
              {hoveredNode && (
                <rect
                  x={hoveredNode.x + 1}
                  y={hoveredNode.y + 1}
                  width={hoveredNode.width - 2}
                  height={hoveredNode.height - 2}
                  fill={ACCENT}
                  fillOpacity={0.14}
                  stroke={ACCENT}
                  strokeWidth={2.5}
                  rx={2}
                  pointerEvents="none"
                />
              )}

              {/* Points */}
              {points.map((point) => {
                const inside = !hoveredNode || QuadTree.contains(hoveredNode, point);
                return (
                  <motion.circle
                    key={point.id}
                    cx={point.x}
                    cy={point.y}
                    initial={{ r: 0 }}
                    animate={{ r: inside && hoveredNode ? 8.5 : 6.5, opacity: inside ? 1 : 0.35 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                    fill={ACCENT}
                    stroke="#fffdf8"
                    strokeWidth={2}
                    pointerEvents="none"
                  />
                );
              })}
            </svg>

            {/* Empty state */}
            <AnimatePresence>
              {points.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-center"
                >
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ backgroundColor: SOFT, color: ACCENT }}
                  >
                    <MousePointerClick size={24} />
                  </span>
                  <p className="font-display text-2xl text-ink">Click anywhere to drop a point</p>
                  <p className="text-sm text-ink-mute">or press Scatter to add a handful at once</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hover readout */}
            {hoveredNode && points.length > 0 && (
              <div className="pointer-events-none absolute bottom-3 left-3 rounded-xl border border-line bg-card/95 px-3.5 py-2 text-[13px] text-ink-soft shadow-card backdrop-blur">
                Level <b className="text-ink">{depthOf(hoveredNode)}</b> box ·{' '}
                <b className="text-ink">{hoveredPoints.length}</b> of {capacity} spots used
              </div>
            )}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-6 lg:sticky lg:top-20">
          <Panel eyebrow="Try this" title={allDone ? 'You’ve got it!' : 'Three small experiments'}>
            <GuideSteps steps={steps} accent={ACCENT} />
            {allDone && (
              <p className="mt-5 rounded-2xl p-4 text-[13px] leading-relaxed text-ink-soft" style={{ backgroundColor: SOFT }}>
                That’s the whole trick. To find what’s near a point, you only look inside its own box —
                not at every point on the canvas.
              </p>
            )}
          </Panel>

          <Panel eyebrow="Adjust">
            <Slider
              label="Points per box"
              hint="How many points a box can hold before it splits"
              value={capacity}
              min={1}
              max={10}
              onChange={handleCapacityChange}
              minLabel="1 · split often"
              maxLabel="10 · split rarely"
              accent={ACCENT}
            />
          </Panel>
        </div>
      </div>

      {/* The idea */}
      <div className="grid gap-6 md:grid-cols-2">
        <Panel eyebrow="The idea in a minute" title="Divide only where it’s crowded">
          <div className="space-y-3 leading-relaxed text-ink-soft">
            <p>
              Start with one big box. When it gets too full, cut it into four equal quarters and hand each
              point to the quarter it falls in. Keep doing that, but only where things are crowded.
            </p>
            <p>
              Empty areas stay as big boxes; busy areas become a fine mesh. The shape of the tree ends up
              mirroring the shape of your data.
            </p>
          </div>
        </Panel>
        <Panel eyebrow="Why it’s fast" title="Look in one box, not everywhere">
          <p className="leading-relaxed text-ink-soft">
            To find neighbours of a point without a QuadTree, you’d compare it with{' '}
            <b className="text-ink">every one of the {points.length} points</b>. With the tree, you only check
            its own box — about <b className="text-ink">{avgPerBox.toFixed(1)}</b> points on average right now.
          </p>
          <div className="mt-5 space-y-2.5">
            <Bar label="Check everything" value={points.length} max={Math.max(points.length, 1)} color="#cfc7b6" />
            <Bar label="Check one box" value={avgPerBox} max={Math.max(points.length, 1)} color={ACCENT} />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-3 text-[13px]">
      <span className="w-32 flex-shrink-0 text-ink-mute">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-deep">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        />
      </div>
      <span className="w-10 text-right tabular-nums text-ink">{Number.isInteger(value) ? value : value.toFixed(1)}</span>
    </div>
  );
}

export default QuadTreeVisualizer;
