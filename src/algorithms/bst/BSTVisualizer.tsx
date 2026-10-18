import { useMemo, useState } from 'react';
import { Dices, Plus, Search, Trash2, X } from 'lucide-react';
import { TreeFrame, build, contains, height, inOrder, insert, layout, remove, search, size } from './logic';
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

const { accent: ACCENT, soft: SOFT } = getCategory('structures').theme;
const FOUND = '#3f6b5c';
const DOOMED = '#c0553a';
const START = [50, 30, 70, 20, 40, 60, 80, 35, 65];
const SPEEDS = [1400, 800, 380, 120];

const PRESETS = [
  { label: 'Bushy', values: START },
  { label: 'Sorted 1–9', values: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { label: 'Random', values: [] as number[] },
];

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
  const [frames, setFrames] = useState<TreeFrame[]>(() => [{ root: build(START), trail: [], note: 'Type a number and insert, search for or delete it.' }]);
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
    const fn = op === 'insert' ? insert : op === 'search' ? search : remove;
    const next = fn(tree, value);
    setFrames(next);
    if (op === 'insert') setProgress((p) => ({ ...p, insert: true }));
    if (op === 'search') setProgress((p) => ({ ...p, search: true }));
  };

  const submit = (op: 'insert' | 'search' | 'remove') => {
    if (!valid) return;
    run(op, parsed);
    setInput('');
  };

  const loadPreset = (values: number[], label: string) => {
    const vals = values.length ? values : randomValues(10);
    const root = build(vals);
    setFrames([{ root, trail: [], note: `Built a tree by inserting ${vals.join(', ')} in that order.` }]);
    if (label.startsWith('Sorted')) setProgress((p) => ({ ...p, degenerate: true }));
  };

  const steps = [
    { title: 'Insert a number', detail: 'Type a number and press Insert. Watch it go left or right at each node.', done: progress.insert },
    { title: 'Search for a number', detail: 'Each step down rules out a whole branch — that’s why lookups are fast.', done: progress.search },
    { title: 'Build from sorted numbers', detail: 'Pick “Sorted 1–9”. The tree turns into a long chain — and loses its speed.', done: progress.degenerate },
  ];

  const n = size(tree);
  const h = height(tree);
  const best = n ? Math.ceil(Math.log2(n + 1)) : 0;

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4 px-1">
            <div className="flex gap-8">
              <Stat label="Nodes" value={n} />
              <Stat label="Height" value={h} />
              <Stat label="Best possible height" value={best} />
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
              placeholder="e.g. 42"
              className="h-10 w-28 rounded-xl border border-line bg-paper/50 px-3 text-sm text-ink focus:border-ink focus:outline-none"
              aria-label="Value"
            />
            <Button size="sm" className="h-10" disabled={!valid} onClick={() => submit('insert')}>
              <Plus size={15} />
              Insert
            </Button>
            <Button variant="secondary" size="sm" className="h-10" disabled={!valid} onClick={() => submit('search')}>
              <Search size={15} />
              Search
            </Button>
            <Button variant="secondary" size="sm" className="h-10" disabled={!valid || !contains(tree, parsed)} onClick={() => submit('remove')}>
              <X size={15} />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-10"
              title="Insert a random number"
              onClick={() => {
                let v = 1 + Math.floor(Math.random() * 99);
                while (contains(tree, v) && n < 99) v = 1 + Math.floor(Math.random() * 99);
                run('insert', v);
              }}
            >
              <Dices size={15} />
              <span className="hidden sm:inline">Random</span>
            </Button>
          </form>

          <div className="rounded-2xl border border-line bg-paper/60 px-2 py-3">
            <TreeDiagram
              nodes={diagram.nodes}
              edges={diagram.edges}
              accent={ACCENT}
              minDepth={4}
              emptyText="Empty tree — insert a number"
              onNodeClick={(node) => setInput(String(node.label))}
            />
          </div>
          <p className="mt-2 px-1 text-xs text-ink-mute">
            Tip: click a node to put its number in the box. Reading left to right: {inOrder(frame.root).join(' · ') || '—'}
          </p>

          <Narration stepKey={`${frames.length}-${player.index}`} accent={ACCENT} className="mt-4">
            {frame.note}
          </Narration>
          <PlayerControls player={player} accent={ACCENT} keyboard={false} className="mt-4" />
          <Legend
            className="mt-5 px-1"
            items={[
              { color: ACCENT, label: 'Looking at', shape: 'dot' },
              { color: SOFT, label: 'Path so far', shape: 'dot' },
              { color: FOUND, label: 'Found / added', shape: 'dot' },
              { color: DOOMED, label: 'Being removed', shape: 'dot' },
            ]}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <Panel eyebrow="Try this" title="Three small experiments">
            <GuideSteps steps={steps} accent={ACCENT} />
          </Panel>
          <Panel eyebrow="Start from">
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(({ label, values }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => loadPreset(values, label)}
                  className="rounded-full border border-line px-3 py-1.5 text-[13px] text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setFrames([{ root: null, trail: [], note: 'Empty tree. Insert a number to plant the root.' }]);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line-strong px-3 py-1.5 text-[13px] text-ink-soft hover:text-ink"
              >
                <Trash2 size={13} />
                Empty
              </button>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-ink-mute">
              Height decides speed: a search takes at most one step per level. This tree is{' '}
              <b className="text-ink">{h}</b> level{h === 1 ? '' : 's'} tall; the best possible for {n} nodes is{' '}
              <b className="text-ink">{best}</b>.
            </p>
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <Panel eyebrow="The idea in a minute" title="Smaller to the left, bigger to the right">
          <div className="space-y-3 leading-relaxed text-ink-soft">
            <p>
              Every node has at most two children. Everything in its left branch is smaller, everything in its right branch is bigger.
              That one rule means you can always tell which way to go.
            </p>
            <p>
              Searching, inserting and deleting all walk one path from the top, so their cost depends on the tree’s height. Feed it
              numbers in sorted order, though, and it becomes a long chain — which is why real systems use self-balancing versions
              like red-black trees.
            </p>
          </div>
          <div className="mt-5 rounded-2xl p-4 text-[13px] leading-relaxed text-ink-soft" style={{ backgroundColor: SOFT }}>
            <b className="text-ink">Deleting a node with two children</b> is the clever bit: swap in the next-bigger value (the
            leftmost node on the right side), which keeps every rule intact.
          </div>
        </Panel>
        <Panel eyebrow="At a glance" title="How fast, how much memory">
          <FactList
            facts={[
              { label: 'Search / insert / delete', hint: 'When the tree is bushy', value: 'O(log n)' },
              { label: 'Worst case', hint: 'When it degrades into a chain', value: 'O(n)' },
              { label: 'List in sorted order', value: 'O(n)' },
              { label: 'Memory', value: 'O(n)' },
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}

export default BSTVisualizer;
