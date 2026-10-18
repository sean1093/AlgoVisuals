import { useMemo, useState } from 'react';
import { Dices, Plus, Search, Trash2, X } from 'lucide-react';
import { BSTNode, TreeFrame, build, contains, height, inOrder, insert, layout, remove, search, size } from './logic';
import { usePlayer } from '../../components/player/usePlayer';
import PlayerControls from '../../components/player/PlayerControls';
import Narration from '../../components/player/Narration';
import Button from '../../components/shared/Button';
import Panel from '../../components/shared/Panel';
import Stat from '../../components/shared/Stat';
import Legend from '../../components/shared/Legend';
import FactList from '../../components/shared/FactList';
import GuideSteps from '../../components/shared/GuideSteps';
import TreeDiagram, { DiagramEdge, DiagramNode } from '../../components/shared/TreeDiagram';
import { getCategory } from '../../registry';
import { useI18n } from '../../i18n';
import Rich from '../../components/shared/Rich';

const { accent: ACCENT, soft: SOFT } = getCategory('structures').theme;
const FOUND = '#3f6b5c';
const DOOMED = '#c0553a';
const START = [50, 30, 70, 20, 40, 60, 80, 35, 65];
const SPEEDS = [1400, 800, 380, 120];

const PRESETS = [
  { id: 'bushy', values: START },
  { id: 'sorted', values: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { id: 'random', values: [] as number[] },
] as const;

/** What the frames show: an operation on a tree, or just a tree with an intro line */
type Scene =
  | { kind: 'op'; op: 'insert' | 'search' | 'remove'; base: BSTNode | null; value: number }
  | { kind: 'intro' | 'empty'; base: BSTNode | null }
  | { kind: 'built'; base: BSTNode | null; values: number[] };

function randomValues(count: number) {
  const set = new Set<number>();
  while (set.size < count) set.add(1 + Math.floor(Math.random() * 99));
  return [...set];
}

function treeToDiagram(frame: TreeFrame) {
  const positions = layout(frame.root);
  const count = Math.max(positions.size, 1);
  const trail = new Set(frame.trail);
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];
  positions.forEach(({ x, depth, node }) => {
    const isDone = frame.done === node.id;
    const isActive = frame.active === node.id;
    const isDoomed = frame.doomed === node.id;
    nodes.push({
      id: node.id,
      label: node.value,
      x: (x + 0.5) / count,
      depth,
      fill: isDone ? FOUND : isDoomed ? DOOMED : isActive ? ACCENT : trail.has(node.id) ? SOFT : undefined,
      stroke: isDone ? FOUND : isDoomed ? DOOMED : trail.has(node.id) || isActive ? ACCENT : undefined,
      text: isDone || isDoomed || isActive ? '#fff' : undefined,
    });
    for (const child of [node.left, node.right]) {
      if (child) edges.push({ from: node.id, to: child.id, highlight: trail.has(node.id) && trail.has(child.id) });
    }
  });
  return { nodes, edges };
}

function BSTVisualizer() {
  const { t } = useI18n();
  const tb = t.bst;
  const [scene, setScene] = useState<Scene>(() => ({ kind: 'intro', base: build(START) }));
  // Frames are derived from the scene so a language switch re-narrates them
  const frames = useMemo<TreeFrame[]>(() => {
    if (scene.kind === 'op') {
      const fn = scene.op === 'insert' ? insert : scene.op === 'search' ? search : remove;
      return fn(scene.base, scene.value, tb.notes);
    }
    const note = scene.kind === 'built' ? tb.built(scene.values.join(', ')) : scene.kind === 'empty' ? tb.emptyIntro : tb.intro;
    return [{ root: scene.base, trail: [], note }];
  }, [scene, tb]);
  // The tree after the latest operation; earlier frames are just for playback
  const tree = frames[frames.length - 1].root;
  const [input, setInput] = useState('');
  const [progress, setProgress] = useState({ insert: false, search: false, degenerate: false });
  const player = usePlayer(frames.length, { resetKey: frames, autoPlay: frames.length > 1, speeds: SPEEDS });
  const frame = frames[player.index];
  const diagram = useMemo(() => treeToDiagram(frame), [frame]);

  const parsed = Number(input);
  const valid = input.trim() !== '' && Number.isInteger(parsed) && parsed >= 0 && parsed <= 999;

  const run = (op: 'insert' | 'search' | 'remove', value: number) => {
    setScene({ kind: 'op', op, base: tree, value });
    if (op === 'insert') setProgress((p) => ({ ...p, insert: true }));
    if (op === 'search') setProgress((p) => ({ ...p, search: true }));
  };

  const submit = (op: 'insert' | 'search' | 'remove') => {
    if (!valid) return;
    run(op, parsed);
    setInput('');
  };

  const loadPreset = (values: readonly number[], id: string) => {
    const vals = values.length ? [...values] : randomValues(10);
    setScene({ kind: 'built', base: build(vals), values: vals });
    if (id === 'sorted') setProgress((p) => ({ ...p, degenerate: true }));
  };

  const done = [progress.insert, progress.search, progress.degenerate];
  const steps = tb.steps.map((s, i) => ({ ...s, done: done[i] }));

  const n = size(tree);
  const h = height(tree);
  const best = n ? Math.ceil(Math.log2(n + 1)) : 0;

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4 px-1">
            <div className="flex gap-8">
              <Stat label={tb.nodes} value={n} />
              <Stat label={tb.height} value={h} />
              <Stat label={tb.bestHeight} value={best} />
            </div>
          </div>

          <form
            className="mb-4 flex flex-wrap items-center gap-2 px-1"
            onSubmit={(e) => {
              e.preventDefault();
              submit('insert');
            }}
          >
            <input
              type="number"
              inputMode="numeric"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={tb.placeholder}
              className="h-10 w-28 rounded-xl border border-line bg-paper/50 px-3 text-sm text-ink focus:border-ink focus:outline-none"
              aria-label={tb.value}
            />
            <Button size="sm" className="h-10" disabled={!valid} onClick={() => submit('insert')}>
              <Plus size={15} />
              {tb.insert}
            </Button>
            <Button variant="secondary" size="sm" className="h-10" disabled={!valid} onClick={() => submit('search')}>
              <Search size={15} />
              {tb.search}
            </Button>
            <Button variant="secondary" size="sm" className="h-10" disabled={!valid || !contains(tree, parsed)} onClick={() => submit('remove')}>
              <X size={15} />
              {tb.delete}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-10"
              title={tb.insertRandom}
              onClick={() => {
                let v = 1 + Math.floor(Math.random() * 99);
                while (contains(tree, v) && n < 99) v = 1 + Math.floor(Math.random() * 99);
                run('insert', v);
              }}
            >
              <Dices size={15} />
              <span className="hidden sm:inline">{t.common.random}</span>
            </Button>
          </form>

          <div className="rounded-2xl border border-line bg-paper/60 px-2 py-3">
            <TreeDiagram
              nodes={diagram.nodes}
              edges={diagram.edges}
              accent={ACCENT}
              minDepth={4}
              emptyText={tb.emptyTree}
              label={t.algorithms['binary-search-tree'].name}
              onNodeClick={(node) => setInput(String(node.label))}
            />
          </div>
          <p className="mt-2 px-1 text-xs text-ink-mute">
            {tb.tip(inOrder(frame.root).join(' · ') || '—')}
          </p>

          <Narration stepKey={`${frames.length}-${player.index}`} accent={ACCENT} className="mt-4">
            {frame.note}
          </Narration>
          <PlayerControls player={player} accent={ACCENT} keyboard={false} className="mt-4" />
          <Legend
            className="mt-5 px-1"
            items={[
              { color: ACCENT, label: tb.legend.looking, shape: 'dot' },
              { color: SOFT, label: tb.legend.path, shape: 'dot' },
              { color: FOUND, label: tb.legend.found, shape: 'dot' },
              { color: DOOMED, label: tb.legend.removing, shape: 'dot' },
            ]}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <Panel eyebrow={t.common.tryThis} title={t.common.threeExperiments}>
            <GuideSteps steps={steps} accent={ACCENT} />
          </Panel>
          <Panel eyebrow={tb.startFrom}>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(({ id, values }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => loadPreset(values, id)}
                  className="rounded-full border border-line px-3 py-1.5 text-[13px] text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
                >
                  {tb.presets[id]}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setScene({ kind: 'empty', base: null });
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line-strong px-3 py-1.5 text-[13px] text-ink-soft hover:text-ink"
              >
                <Trash2 size={13} />
                {t.common.empty}
              </button>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-ink-mute">
              <Rich text={tb.heightNote(h, n, best)} />
            </p>
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <Panel eyebrow={t.common.ideaInAMinute} title={tb.ideaTitle}>
          <div className="space-y-3 leading-relaxed text-ink-soft">
            {tb.idea.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="mt-5 rounded-2xl p-4 text-[13px] leading-relaxed text-ink-soft" style={{ backgroundColor: SOFT }}>
            <Rich text={tb.callout} />
          </div>
        </Panel>
        <Panel eyebrow={t.common.atAGlance} title={t.common.howFast}>
          <FactList facts={tb.facts} />
        </Panel>
      </div>
    </div>
  );
}

export default BSTVisualizer;
