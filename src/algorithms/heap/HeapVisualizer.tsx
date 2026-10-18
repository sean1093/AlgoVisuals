import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpFromLine, Dices, Plus, Trash2 } from 'lucide-react';
import { HeapFrame, HeapItem, fromValues, parent, pop, push } from './logic';
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
const SWAP = '#c0553a';
const SETTLED = '#3f6b5c';
const START = [12, 30, 18, 45, 37, 25, 60];

function colourFor(frame: HeapFrame, i: number) {
  if (frame.swap?.includes(i)) return SWAP;
  if (frame.compare?.includes(i)) return ACCENT;
  if (frame.settled === i) return SETTLED;
  return undefined;
}

function heapToDiagram(frame: HeapFrame) {
  const nodes: DiagramNode[] = frame.items.map((item, i) => {
    const level = Math.floor(Math.log2(i + 1));
    const pos = i - (2 ** level - 1);
    const colour = colourFor(frame, i);
    return {
      id: item.id,
      label: item.value,
      x: (pos + 0.5) / 2 ** level,
      depth: level,
      fill: colour,
      stroke: colour,
      text: colour ? '#fff' : undefined,
      caption: `[${i}]`,
    };
  });
  const edges: DiagramEdge[] = frame.items.slice(1).map((item, k) => {
    const i = k + 1;
    const p = parent(i);
    const pair = frame.swap ?? frame.compare;
    return { from: frame.items[p].id, to: item.id, highlight: !!pair && pair.includes(i) && pair.includes(p) };
  });
  return { nodes, edges };
}

function HeapVisualizer() {
  const [heap, setHeap] = useState<HeapItem[]>(() => fromValues(START));
  const [frames, setFrames] = useState<HeapFrame[]>(() => [{ items: heap, note: 'The smallest value always sits at the top. Push a number or take the smallest.' }]);
  const [taken, setTaken] = useState<number[]>([]);
  const [input, setInput] = useState('');
  const [progress, setProgress] = useState({ push: false, pop: false, drain: false });
  const player = usePlayer(frames.length, { resetKey: frames, autoPlay: frames.length > 1, speeds: [1400, 800, 380, 120] });
  const frame = frames[player.index];
  const diagram = useMemo(() => heapToDiagram(frame), [frame]);

  const parsed = Number(input);
  const valid = input.trim() !== '' && Number.isInteger(parsed) && parsed >= 0 && parsed <= 999;

  const doPush = (value: number) => {
    if (heap.length >= 31) return;
    const next = push(heap, value);
    setFrames(next);
    setHeap(next[next.length - 1].items);
    setProgress((p) => ({ ...p, push: true }));
  };

  const doPop = () => {
    const next = pop(heap);
    const last = next[next.length - 1];
    setFrames(next);
    setHeap(last.items);
    if (last.taken) {
      const updated = [...taken, last.taken.value];
      setTaken(updated);
      setProgress((p) => ({ ...p, pop: true, drain: p.drain || updated.length >= 4 }));
    }
  };

  const reset = (values: number[]) => {
    const items = fromValues(values);
    setHeap(items);
    setTaken([]);
    setFrames([{ items, note: values.length ? `Built a heap from ${values.join(', ')}.` : 'Empty heap. Push some numbers.' }]);
  };

  const steps = [
    { title: 'Push a number', detail: 'It starts at the bottom and swaps upward while it’s smaller than its parent.', done: progress.push },
    { title: 'Take the smallest', detail: 'Press “Take smallest”. The last item jumps to the top and sinks back down.', done: progress.pop },
    { title: 'Keep taking', detail: 'Take four or more. Notice they come out in sorted order — that’s heap sort.', done: progress.drain },
  ];

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4 px-1">
            <div className="flex gap-8">
              <Stat label="Items" value={heap.length} />
              <Stat label="Smallest" value={heap[0]?.value ?? '–'} />
              <Stat label="Levels" value={heap.length ? Math.floor(Math.log2(heap.length)) + 1 : 0} />
            </div>
          </div>

          <form
            className="mb-4 flex flex-wrap items-center gap-2 px-1"
            onSubmit={(e) => {
              e.preventDefault();
              if (valid) {
                doPush(parsed);
                setInput('');
              }
            }}
          >
            <input
              type="number"
              inputMode="numeric"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 7"
              className="h-10 w-24 rounded-xl border border-line bg-paper/50 px-3 text-sm text-ink focus:border-ink focus:outline-none"
              aria-label="Value"
            />
            <Button size="sm" className="h-10" type="submit" disabled={!valid || heap.length >= 31}>
              <Plus size={15} />
              Push
            </Button>
            <Button variant="secondary" size="sm" className="h-10" onClick={doPop} disabled={!heap.length}>
              <ArrowUpFromLine size={15} />
              Take smallest
            </Button>
            <Button variant="ghost" size="sm" className="h-10" onClick={() => doPush(1 + Math.floor(Math.random() * 99))} disabled={heap.length >= 31}>
              <Dices size={15} />
              <span className="hidden sm:inline">Random</span>
            </Button>
          </form>

          <div className="rounded-2xl border border-line bg-paper/60 px-2 py-3">
            <TreeDiagram nodes={diagram.nodes} edges={diagram.edges} accent={ACCENT} minDepth={4} emptyText="Empty heap" />
          </div>

          {/* The same heap as it is really stored: a plain array */}
          <div className="mt-4 px-1">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">Stored as an array</p>
            <div className="flex flex-wrap gap-1.5">
              {frame.items.map((item, i) => {
                const colour = colourFor(frame, i);
                return (
                  <motion.div
                    layout
                    key={item.id}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    className="flex w-10 flex-col items-center"
                  >
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium tabular-nums"
                      style={colour ? { backgroundColor: colour, borderColor: colour, color: '#fff' } : { borderColor: '#e3ddd0', backgroundColor: '#fffdf8' }}
                    >
                      {item.value}
                    </span>
                    <span className="mt-1 font-mono text-[10px] text-ink-mute">{i}</span>
                  </motion.div>
                );
              })}
              {frame.items.length === 0 && <span className="text-sm text-ink-mute">[ ]</span>}
            </div>
          </div>

          <Narration stepKey={`${frames.length}-${player.index}`} accent={ACCENT} className="mt-4">
            {frame.note}
          </Narration>
          <PlayerControls player={player} accent={ACCENT} keyboard={false} className="mt-4" />
          <Legend
            className="mt-5 px-1"
            items={[
              { color: ACCENT, label: 'Comparing', shape: 'dot' },
              { color: SWAP, label: 'Swapping', shape: 'dot' },
              { color: SETTLED, label: 'Settled', shape: 'dot' },
            ]}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <Panel eyebrow="Try this" title="Three small experiments">
            <GuideSteps steps={steps} accent={ACCENT} />
          </Panel>
          <Panel eyebrow="Taken out so far">
            {taken.length ? (
              <div className="flex flex-wrap gap-1.5">
                {taken.map((v, i) => (
                  <span key={i} className="rounded-lg px-2.5 py-1 text-sm tabular-nums" style={{ backgroundColor: SOFT, color: ACCENT }}>
                    {v}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-mute">Nothing yet. Press “Take smallest”.</p>
            )}
            <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => reset(Array.from({ length: 10 }, () => 1 + Math.floor(Math.random() * 99)))}
                className="rounded-full border border-line px-3 py-1.5 text-[13px] text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
              >
                Random 10
              </button>
              <button
                type="button"
                onClick={() => reset([])}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line-strong px-3 py-1.5 text-[13px] text-ink-soft hover:text-ink"
              >
                <Trash2 size={13} />
                Empty
              </button>
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <Panel eyebrow="The idea in a minute" title="A to-do list that always knows what’s next">
          <div className="space-y-3 leading-relaxed text-ink-soft">
            <p>
              A heap only promises one thing: every parent is smaller than its children. It doesn’t keep everything sorted — just
              enough that the smallest item is always on top.
            </p>
            <p>
              That makes it the perfect <b className="text-ink">priority queue</b>: hospitals triaging patients, your computer
              deciding which task runs next, and Dijkstra’s route finder all use one.
            </p>
          </div>
          <div className="mt-5 rounded-2xl p-4 text-[13px] leading-relaxed text-ink-soft" style={{ backgroundColor: SOFT }}>
            <b className="text-ink">No pointers needed.</b> The tree lives inside a plain array: the children of position{' '}
            <span className="font-mono">i</span> are at <span className="font-mono">2i + 1</span> and{' '}
            <span className="font-mono">2i + 2</span>.
          </div>
        </Panel>
        <Panel eyebrow="At a glance" title="How fast, how much memory">
          <FactList
            facts={[
              { label: 'Peek at smallest', value: 'O(1)' },
              { label: 'Push', value: 'O(log n)' },
              { label: 'Take smallest', value: 'O(log n)' },
              { label: 'Memory', value: 'O(n)', hint: 'Just an array' },
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}

export default HeapVisualizer;
