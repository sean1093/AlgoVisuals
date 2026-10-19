import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Forest, UnionFrame, findRoot, groupCount, makeForest, union } from './unionfind';
import { LETTERS } from './random';
import { usePlayer } from '../../components/player/usePlayer';
import PlayerControls from '../../components/player/PlayerControls';
import Narration from '../../components/player/Narration';
import Button from '../../components/shared/Button';
import Panel from '../../components/shared/Panel';
import Stat from '../../components/shared/Stat';
import Legend from '../../components/shared/Legend';
import GuideSteps from '../../components/shared/GuideSteps';
import IdeaSection from '../../components/shared/IdeaSection';
import GraphView from '../../components/shared/GraphView';
import TreeDiagram, { DiagramEdge, DiagramNode } from '../../components/shared/TreeDiagram';
import { getCategory } from '../../registry';
import { useI18n } from '../../i18n';

const { accent: ACCENT, soft: SOFT } = getCategory('graphs').theme;
const CLIMB = 'var(--color-clay)';
const N = 8;
const SPEEDS = [1300, 750, 350, 120];
/** One colour per group, picked by the group's leader */
const PALETTE = [
  'var(--accent-sorting)',
  'var(--accent-searching)',
  'var(--accent-paths)',
  'var(--accent-trees)',
  'var(--accent-lists)',
  'var(--accent-graphs)',
  'var(--accent-dp)',
  'var(--color-sage)',
];
const label = (v: number) => LETTERS[v];
// People sit around a circle
const PEOPLE = Array.from({ length: N }, (_, id) => {
  const a = (id / N) * Math.PI * 2 - Math.PI / 2;
  return { id, label: label(id), x: 50 + Math.cos(a) * 40, y: 30 + Math.sin(a) * 25 };
});

type Scene = { kind: 'intro'; forest: Forest } | { kind: 'union'; forest: Forest; a: number; b: number };

/** Lay the forest out as trees side by side */
function forestDiagram(f: Forest, frame: UnionFrame) {
  const kids = new Map<number, number[]>();
  f.parent.forEach((p, v) => p !== v && kids.set(p, [...(kids.get(p) ?? []), v]));
  const leaves = (v: number): number => (kids.get(v) ?? []).reduce((s, c) => s + leaves(c), 0) || 1;
  const roots = f.parent.map((p, v) => (p === v ? v : -1)).filter((v) => v >= 0);
  const width = roots.reduce((s, r) => s + leaves(r), 0);
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];
  const place = (v: number, left: number, depth: number) => {
    const span = leaves(v);
    const isRoot = f.parent[v] === v;
    const colour = frame.roots.includes(v) ? ACCENT : frame.path.includes(v) ? CLIMB : undefined;
    nodes.push({
      id: v,
      label: label(v),
      x: (left + span / 2) / width,
      depth,
      fill: colour,
      stroke: colour ?? (isRoot ? 'var(--color-ink)' : undefined),
      text: colour ? 'var(--color-on-accent)' : undefined,
    });
    let x = left;
    for (const c of kids.get(v) ?? []) {
      edges.push({ from: v, to: c, highlight: frame.link?.[0] === c || (frame.path.includes(c) && frame.path.includes(v)) });
      place(c, x, depth + 1);
      x += leaves(c);
    }
  };
  let left = 0;
  for (const r of roots) {
    place(r, left, 0);
    left += leaves(r);
  }
  return { nodes, edges };
}

function UnionFindVisualizer() {
  const { t } = useI18n();
  const tu = t.unionFind;
  const [scene, setScene] = useState<Scene>({ kind: 'intro', forest: makeForest(N) });
  const frames = useMemo<UnionFrame[]>(
    () => (scene.kind === 'union' ? union(scene.forest, scene.a, scene.b, label, tu.notes) : [{ forest: scene.forest, path: [], roots: [], note: tu.intro }]),
    [scene, tu]
  );
  const forest = frames[frames.length - 1].forest;
  const player = usePlayer(frames.length, { resetKey: scene, autoPlay: frames.length > 1, speeds: SPEEDS });
  const frame = frames[player.index];
  const [picked, setPicked] = useState<number | null>(null);
  const [progress, setProgress] = useState({ pair: false, groups: false, same: false });
  const diagram = useMemo(() => forestDiagram(frame.forest, frame), [frame]);

  const sizeOf = (f: Forest, v: number) => f.parent.filter((_, u) => findRoot(f, u) === findRoot(f, v)).length;

  const click = (v: number) => {
    if (picked === null) return setPicked(v);
    if (picked === v) return setPicked(null);
    const same = findRoot(forest, picked) === findRoot(forest, v);
    const bothGroups = !same && sizeOf(forest, picked) > 1 && sizeOf(forest, v) > 1;
    setProgress((p) => ({ pair: p.pair || !same, groups: p.groups || bothGroups, same: p.same || same }));
    setScene({ kind: 'union', forest, a: picked, b: v });
    setPicked(null);
  };

  const done = [progress.pair, progress.groups, progress.same];
  const steps = tu.steps.map((s, i) => ({ ...s, done: done[i] }));
  const colourOf = (v: number) => PALETTE[findRoot(frame.forest, v)];
  const largest = Math.max(...forest.parent.map((_, v) => sizeOf(forest, v)));
  const note = picked !== null ? tu.pickSecond(label(picked)) : frame.note;

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4 px-1">
            <div className="flex gap-8">
              <Stat label={tu.groups} value={groupCount(forest)} />
              <Stat label={tu.largest} value={largest} />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPicked(null);
                setScene({ kind: 'intro', forest: makeForest(N) });
              }}
            >
              <RotateCcw size={15} />
              {tu.reset}
            </Button>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-line bg-paper/60 p-2">
              <p className="px-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">{tu.people}</p>
              <GraphView
                label={tu.people}
                className="mx-auto max-w-md"
                nodes={PEOPLE}
                edges={[]}
                onNodeClick={click}
                nodeLook={(id) => {
                  const c = colourOf(id);
                  const alone = frame.forest.parent.every((_, u) => u === id || findRoot(frame.forest, u) !== findRoot(frame.forest, id));
                  if (id === picked) return { fill: 'var(--color-ink)', stroke: 'var(--color-ink)', text: 'var(--color-paper)', ring: true };
                  return alone ? {} : { fill: c, stroke: c, text: 'var(--color-on-accent)' };
                }}
              />
            </div>
            <div className="rounded-2xl border border-line bg-paper/60 p-2">
              <p className="px-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">{tu.forest}</p>
              <TreeDiagram nodes={diagram.nodes} edges={diagram.edges} accent={ACCENT} minDepth={3} label={tu.forest} onNodeClick={(n) => click(n.id as number)} />
            </div>
          </div>

          <Narration stepKey={picked !== null ? `pick-${picked}` : `${frames.length}-${player.index}`} accent={ACCENT} className="mt-4">
            {note}
          </Narration>
          <PlayerControls player={player} accent={ACCENT} keyboard={false} className="mt-4" />
          <Legend
            className="mt-5 px-1"
            items={[
              { color: 'var(--color-ink)', label: tu.legend.picked, shape: 'dot' },
              { color: CLIMB, label: tu.legend.climbing, shape: 'dot' },
              { color: ACCENT, label: tu.legend.leader, shape: 'dot' },
            ]}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <Panel eyebrow={t.common.tryThis} title={t.common.threeExperiments}>
            <GuideSteps steps={steps} accent={ACCENT} />
          </Panel>
        </div>
      </div>

      <IdeaSection title={tu.ideaTitle} idea={tu.idea} callout={tu.callout} facts={tu.facts} soft={SOFT} />
    </div>
  );
}

export default UnionFindVisualizer;
