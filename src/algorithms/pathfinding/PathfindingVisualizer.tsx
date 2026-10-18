import { PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brush, Eraser, Grid3x3, Shuffle, Trash2, Waves } from 'lucide-react';
import { Grid, PathAlgorithm, emptyGrid, findPath, mazeGrid, scatterGrid, starterGrid, toRowCol } from './logic';
import { usePlayer } from '../../components/player/usePlayer';
import PlayerControls from '../../components/player/PlayerControls';
import Narration from '../../components/player/Narration';
import Button from '../../components/shared/Button';
import Panel from '../../components/shared/Panel';
import Stat from '../../components/shared/Stat';
import Legend from '../../components/shared/Legend';
import FactList from '../../components/shared/FactList';
import GuideSteps from '../../components/shared/GuideSteps';
import { getCategory } from '../../registry';
import { useI18n } from '../../i18n';
import Rich from '../../components/shared/Rich';

const { accent: ACCENT, soft: SOFT } = getCategory('graphs').theme;
const ROWS = 17;
const COLS = 31;
const CELL = 20;
const PATH_SPEEDS = [220, 80, 25, 6];

const COLORS = {
  empty: '#fffdf8',
  wall: '#2f2b27',
  mud: '#d9c7a1',
  explored: '#dcc8e1',
  frontier: '#f1e7f3',
  current: ACCENT,
  path: '#e8b04b',
  start: '#3f6b5c',
  end: '#c0553a',
};

const ALGORITHMS: PathAlgorithm[] = ['bfs', 'dfs', 'dijkstra', 'astar'];

type Tool = 'wall' | 'mud' | 'erase';
const TOOLS: Tool[] = ['wall', 'mud', 'erase'];

// Shared across the four pathfinding pages so you can compare on the same grid
let savedGrid: Grid | null = null;
const pagesSeen = new Set<PathAlgorithm>();

function PathfindingVisualizer({ algorithm }: { algorithm: PathAlgorithm }) {
  const { t } = useI18n();
  const tp = t.pathfinding;
  const [grid, setGridState] = useState<Grid>(() => savedGrid ?? starterGrid(ROWS, COLS));
  const [tool, setTool] = useState<Tool>('wall');
  const [progress, setProgress] = useState({ played: false, edited: false });
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ mode: 'start' | 'end' | 'add' | 'remove'; last: number } | null>(null);

  useEffect(() => {
    pagesSeen.add(algorithm);
  }, [algorithm]);

  const setGrid = (update: Grid | ((g: Grid) => Grid)) => {
    setGridState((g) => {
      const next = typeof update === 'function' ? update(g) : update;
      savedGrid = next;
      return next;
    });
  };

  const result = useMemo(() => findPath(grid, algorithm), [grid, algorithm]);
  // One extra frame for the 'no way through' message when the flag can't be reached
  const total = 1 + result.order.length + Math.max(result.path.length, 1);
  const player = usePlayer(total, { speeds: PATH_SPEEDS, initialSpeed: 2 });
  const info = tp.info[algorithm];

  // After an edit: once a run has started, show the new result instantly; otherwise rewind
  const showFinished = useRef(false);
  useEffect(() => {
    if (showFinished.current) player.seek(total - 1);
    else player.restart();
  }, [result]); // only when the result changes

  useEffect(() => {
    if (player.playing) setProgress((p) => (p.played ? p : { ...p, played: true }));
  }, [player.playing]);

  const exploredCount = Math.min(player.index, result.order.length);
  const pathShown = Math.max(0, player.index - result.order.length);
  const pathSet = new Set(result.path.slice(0, pathShown));
  const current = exploredCount > 0 && pathShown === 0 ? result.order[exploredCount - 1] : -1;
  const reachedEnd = result.path.length > 0;

  let note: string;
  if (player.index === 0) note = tp.noteIdle;
  else if (pathShown === 0) note = tp.noteExploring(info.exploring, exploredCount);
  else if (reachedEnd) note = tp.noteFound(result.path.length - 1, result.cost, result.order.length);
  else note = tp.noteBlocked(result.order.length);

  // Compare all four on the current grid
  const comparison = useMemo(
    () => ALGORITHMS.map((a) => ({ id: a, ...(a === algorithm ? result : findPath(grid, a)) })),
    [grid, algorithm, result]
  );

  const cellAt = (e: PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const col = Math.floor(((e.clientX - rect.left) / rect.width) * COLS);
    const row = Math.floor(((e.clientY - rect.top) / rect.height) * ROWS);
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return -1;
    return row * COLS + col;
  };

  const paint = (cells: number[], mode: 'add' | 'remove') => {
    setGrid((g) => {
      const walls = new Set(g.walls);
      const mud = new Set(g.mud);
      for (const cell of cells) {
        if (cell === g.start || cell === g.end) continue;
        walls.delete(cell);
        mud.delete(cell);
        if (mode === 'add' && tool === 'wall') walls.add(cell);
        if (mode === 'add' && tool === 'mud') mud.add(cell);
      }
      return { ...g, walls, mud };
    });
  };

  // Every cell on the straight line between two cells, so fast drags leave no gaps
  const cellsBetween = (from: number, to: number) => {
    const [r0, c0] = toRowCol(grid, from);
    const [r1, c1] = toRowCol(grid, to);
    const steps = Math.max(Math.abs(r1 - r0), Math.abs(c1 - c0));
    return Array.from({ length: steps }, (_, i) => {
      const t = (i + 1) / steps;
      return Math.round(r0 + (r1 - r0) * t) * COLS + Math.round(c0 + (c1 - c0) * t);
    });
  };

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    const cell = cellAt(e);
    if (cell < 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    showFinished.current = player.index > 0;
    player.pause();
    setProgress((p) => ({ ...p, edited: true }));
    if (cell === grid.start || cell === grid.end) {
      drag.current = { mode: cell === grid.start ? 'start' : 'end', last: cell };
      return;
    }
    const has = tool === 'wall' ? grid.walls.has(cell) : tool === 'mud' ? grid.mud.has(cell) : true;
    const mode = tool === 'erase' || has ? 'remove' : 'add';
    drag.current = { mode, last: cell };
    paint([cell], mode);
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    const cell = cellAt(e);
    if (cell < 0 || cell === drag.current.last) return;
    const { mode, last } = drag.current;
    drag.current.last = cell;
    if (mode === 'start' || mode === 'end') {
      setGrid((g) => {
        const other = mode === 'start' ? g.end : g.start;
        return cell === other || g.walls.has(cell) ? g : { ...g, [mode]: cell };
      });
    } else {
      paint(cellsBetween(last, cell), mode);
    }
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  const replaceGrid = (next: Grid) => {
    showFinished.current = false;
    setProgress((p) => ({ ...p, edited: true }));
    setGrid(next);
  };

  const done = [progress.played, progress.edited, [...pagesSeen].some((a) => a !== algorithm)];
  const steps = tp.steps.map((s, i) => ({ ...s, done: done[i] }));

  const [startRow, startCol] = toRowCol(grid, grid.start);
  const [endRow, endCol] = toRowCol(grid, grid.end);

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4 px-1">
            <div className="flex gap-8">
              <Stat label={tp.cellsExplored} value={exploredCount} />
              <Stat label={tp.pathSteps} value={pathShown > 0 && reachedEnd ? result.path.length - 1 : '–'} />
              <Stat label={tp.pathCost} value={pathShown > 0 && reachedEnd ? result.cost : '–'} />
            </div>
          </div>

          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex rounded-full border border-line bg-paper/60 p-0.5" role="radiogroup" aria-label={tp.drawingTool}>
              {TOOLS.map((id) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={tool === id}
                  onClick={() => setTool(id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] transition-colors ${
                    tool === id ? 'bg-card text-ink shadow-card' : 'text-ink-mute hover:text-ink'
                  }`}
                >
                  {id === 'wall' ? <Brush size={13} /> : id === 'mud' ? <Waves size={13} /> : <Eraser size={13} />}
                  {tp.tools[id]}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button variant="secondary" size="sm" onClick={() => replaceGrid(mazeGrid(ROWS, COLS))}>
                <Grid3x3 size={15} />
                {tp.maze}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => replaceGrid(scatterGrid(grid))}>
                <Shuffle size={15} />
                {tp.scatter}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => replaceGrid({ ...emptyGrid(ROWS, COLS), start: grid.start, end: grid.end })}>
                <Trash2 size={15} />
                <span className="hidden sm:inline">{t.common.clear}</span>
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`}
              className="block w-full touch-none select-none"
              style={{ cursor: tool === 'erase' ? 'cell' : 'crosshair' }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              role="img"
              aria-label={tp.gridLabel}
            >
              {Array.from({ length: ROWS * COLS }, (_, i) => {
                const x = (i % COLS) * CELL;
                const y = Math.floor(i / COLS) * CELL;
                let fill = grid.mud.has(i) ? COLORS.mud : COLORS.empty;
                let overlay: string | null = null;
                if (grid.walls.has(i)) fill = COLORS.wall;
                else if (pathSet.has(i)) overlay = COLORS.path;
                else if (i === current) overlay = COLORS.current;
                else if (result.explored[i] !== -1 && result.explored[i] < exploredCount) overlay = COLORS.explored;
                else if (result.discovered[i] !== -1 && result.discovered[i] <= exploredCount && player.index > 0) overlay = COLORS.frontier;
                return (
                  <g key={i}>
                    <rect x={x} y={y} width={CELL} height={CELL} fill={fill} stroke="#ece6da" strokeWidth={0.6} />
                    {overlay && (
                      <rect
                        x={x + 0.5}
                        y={y + 0.5}
                        width={CELL - 1}
                        height={CELL - 1}
                        fill={overlay}
                        fillOpacity={grid.mud.has(i) && overlay !== COLORS.path ? 0.7 : 1}
                        rx={overlay === COLORS.path ? 4 : 1}
                      />
                    )}
                  </g>
                );
              })}
              {/* Start and end */}
              <circle cx={startCol * CELL + CELL / 2} cy={startRow * CELL + CELL / 2} r={CELL * 0.38} fill={COLORS.start} stroke="#fff" strokeWidth={2} />
              <g transform={`translate(${endCol * CELL + 4} ${endRow * CELL + 3})`}>
                <path d="M2 1v14" stroke={COLORS.end} strokeWidth={2} strokeLinecap="round" />
                <path d="M3 2h10l-3 3.5 3 3.5H3z" fill={COLORS.end} />
              </g>
            </svg>
          </div>
          <p className="mt-2 px-1 text-xs text-ink-mute">{tp.dragHint}</p>

          <Narration stepKey={pathShown > 0 ? 'path' : player.index === 0 ? 'idle' : 'explore'} accent={ACCENT} className="mt-4">
            {note}
          </Narration>
          <PlayerControls player={player} accent={ACCENT} className="mt-4" />
          <Legend
            className="mt-5 px-1"
            items={[
              { color: COLORS.current, label: tp.legend.current },
              { color: COLORS.explored, label: tp.legend.explored },
              { color: COLORS.frontier, label: tp.legend.frontier },
              { color: COLORS.path, label: tp.legend.path },
              { color: COLORS.mud, label: tp.legend.mud },
              { color: COLORS.wall, label: tp.legend.wall },
            ]}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <Panel eyebrow={t.common.tryThis} title={t.common.threeExperiments}>
            <GuideSteps steps={steps} accent={ACCENT} />
          </Panel>
          <Panel eyebrow={tp.compareEyebrow} title={tp.compareTitle}>
            <div className="space-y-1">
              {comparison.map((c) => {
                const active = c.id === algorithm;
                const found = c.path.length > 0;
                return (
                  <Link
                    key={c.id}
                    to={`/demo/${c.id}`}
                    className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      active ? '' : 'hover:bg-paper-deep/70'
                    }`}
                    style={active ? { backgroundColor: SOFT } : undefined}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span className={active ? 'font-medium text-ink' : 'text-ink-soft'}>{tp.info[c.id].short}</span>
                    <span className="text-right text-xs tabular-nums text-ink-mute">
                      <Rich text={tp.compareRow(c.order.length, found ? c.cost : null)} />
                    </span>
                  </Link>
                );
              })}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-mute">{tp.compareNote}</p>
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <Panel eyebrow={t.common.ideaInAMinute} title={info.title}>
          <div className="space-y-3 leading-relaxed text-ink-soft">
            {info.idea.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Panel>
        <Panel eyebrow={t.common.atAGlance} title={t.algorithms[algorithm].name}>
          <FactList facts={info.facts} />
        </Panel>
      </div>
    </div>
  );
}

export default PathfindingVisualizer;
