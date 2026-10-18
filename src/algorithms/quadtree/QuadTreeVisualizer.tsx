import { useMemo, useRef, useState, MouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MousePointerClick, Shuffle, Undo2, Eraser } from 'lucide-react';
import { QuadTree, Point, Rectangle } from './logic';
import Button from '../../components/shared/Button';
import Slider from '../../components/shared/Slider';
import Panel from '../../components/shared/Panel';
import Stat from '../../components/shared/Stat';
import GuideSteps from '../../components/shared/GuideSteps';
import Rich from '../../components/shared/Rich';
import { useI18n } from '../../i18n';

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
  const { t } = useI18n();
  const tq = t.quadtree;
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
    const clamp = (v: number) => Math.min(CANVAS_SIZE - 0.01, Math.max(0, v));
    return {
      x: clamp(((e.clientX - rect.left) / rect.width) * CANVAS_SIZE),
      y: clamp(((e.clientY - rect.top) / rect.height) * CANVAS_SIZE),
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
  const done = [allNodes.length > 1, hasHovered, hasChangedCapacity];
  const steps = tq.steps.map((step, i) => ({ title: step.title, detail: <Rich text={step.detail(capacity)} />, done: done[i] }));
  const allDone = steps.every((s) => s.done);

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Canvas */}
        <div className="rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex gap-8">
              <Stat label={tq.points} value={points.length} />
              <Stat label={tq.boxes} value={leaves.length} />
              <Stat label={tq.levelsDeep} value={maxDepth} />
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="secondary" size="sm" onClick={handleScatter} title={tq.scatterTitle}>
                <Shuffle size={15} />
                {tq.scatter}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPoints((prev) => prev.slice(0, -1))}
                disabled={points.length === 0}
                title={tq.undoTitle}
              >
                <Undo2 size={15} />
                <span className="hidden sm:inline">{t.common.undo}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPoints([]);
                  setHoveredNode(null);
                }}
                disabled={points.length === 0}
                title={tq.clearTitle}
              >
                <Eraser size={15} />
                <span className="hidden sm:inline">{t.common.clear}</span>
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
              aria-label={tq.canvasLabel}
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
                  <p className="font-display text-2xl text-ink">{tq.emptyTitle}</p>
                  <p className="text-sm text-ink-mute">{tq.emptyHint}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hover readout */}
            {hoveredNode && points.length > 0 && (
              <div className="pointer-events-none absolute bottom-3 left-3 rounded-xl border border-line bg-card/95 px-3.5 py-2 text-[13px] text-ink-soft shadow-card backdrop-blur">
                <Rich text={tq.hoverReadout(depthOf(hoveredNode), hoveredPoints.length, capacity)} />
              </div>
            )}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-6 lg:sticky lg:top-20">
          <Panel eyebrow={t.common.tryThis} title={allDone ? t.common.gotIt : t.common.threeExperiments}>
            <GuideSteps steps={steps} accent={ACCENT} />
            {allDone && (
              <p className="mt-5 rounded-2xl p-4 text-[13px] leading-relaxed text-ink-soft" style={{ backgroundColor: SOFT }}>
                {tq.allDone}
              </p>
            )}
          </Panel>

          <Panel eyebrow={t.common.adjust}>
            <Slider
              label={tq.pointsPerBox}
              hint={tq.pointsPerBoxHint}
              value={capacity}
              min={1}
              max={10}
              onChange={handleCapacityChange}
              minLabel={tq.splitOften}
              maxLabel={tq.splitRarely}
              accent={ACCENT}
            />
          </Panel>
        </div>
      </div>

      {/* The idea */}
      <div className="grid gap-6 md:grid-cols-2">
        <Panel eyebrow={t.common.ideaInAMinute} title={tq.ideaTitle}>
          <div className="space-y-3 leading-relaxed text-ink-soft">
            {tq.idea.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Panel>
        <Panel eyebrow={tq.whyFast} title={tq.whyFastTitle}>
          <p className="leading-relaxed text-ink-soft">
            <Rich text={tq.whyFastBody(points.length, avgPerBox.toFixed(1))} />
          </p>
          <div className="mt-5 space-y-2.5">
            <Bar label={tq.checkEverything} value={points.length} max={Math.max(points.length, 1)} color="#cfc7b6" />
            <Bar label={tq.checkOneBox} value={avgPerBox} max={Math.max(points.length, 1)} color={ACCENT} />
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
