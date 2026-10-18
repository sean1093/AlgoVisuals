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
import { useI18n } from '../../i18n';
import Rich from '../../components/shared/Rich';

const { accent: ACCENT, soft: SOFT } = getCategory('structures').theme;
const SWAP = '#c0553a';
const SETTLED = '#3f6b5c';
const START = [12, 30, 18, 45, 37, 25, 60];
const SPEEDS = [1400, 800, 380, 120];

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

/** What the frames show: an operation on a heap, or just a heap with an intro line */
type Scene =
  | { kind: 'push'; base: HeapItem[]; value: number }
  | { kind: 'pop'; base: HeapItem[] }
  | { kind: 'intro' | 'empty'; base: HeapItem[] }
  | { kind: 'built'; base: HeapItem[]; values: number[] };

function HeapVisualizer() {
  const { t } = useI18n();
  const th = t.heap;
  const [scene, setScene] = useState<Scene>(() => ({ kind: 'intro', base: fromValues(START) }));
  // Frames are derived from the scene so a language switch re-narrates them
  const frames = useMemo<HeapFrame[]>(() => {
    if (scene.kind === 'push') return push(scene.base, scene.value, th.notes);
    if (scene.kind === 'pop') return pop(scene.base, th.notes);
    const note = scene.kind === 'built' ? th.built(scene.values.join(', ')) : scene.kind === 'empty' ? th.emptyIntro : th.intro;
    return [{ items: scene.base, note }];
  }, [scene, th]);
  const [taken, setTaken] = useState<number[]>([]);
  // The heap after the latest operation; earlier frames are just for playback
  const heap = frames[frames.length - 1].items;
  const [input, setInput] = useState('');
  const [progress, setProgress] = useState({ push: false, pop: false, drain: false });
  const player = usePlayer(frames.length, { resetKey: frames, autoPlay: frames.length > 1, speeds: SPEEDS });
  const frame = frames[player.index];
  const diagram = useMemo(() => heapToDiagram(frame), [frame]);

  const parsed = Number(input);
  const valid = input.trim() !== '' && Number.isInteger(parsed) && parsed >= 0 && parsed <= 999;

  const doPush = (value: number) => {
    if (heap.length >= 31) return;
    setScene({ kind: 'push', base: heap, value });
    setProgress((p) => ({ ...p, push: true }));
  };

  const doPop = () => {
    if (!heap.length) return;
    setScene({ kind: 'pop', base: heap });
    const updated = [...taken, heap[0].value];
    setTaken(updated);
    setProgress((p) => ({ ...p, pop: true, drain: p.drain || updated.length >= 4 }));
  };

  const reset = (values: number[]) => {
    setTaken([]);
    setScene(values.length ? { kind: 'built', base: fromValues(values), values } : { kind: 'empty', base: [] });
  };

  const done = [progress.push, progress.pop, progress.drain];
  const steps = th.steps.map((s, i) => ({ ...s, done: done[i] }));

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4 px-1">
            <div className="flex gap-8">
              <Stat label={th.items} value={heap.length} />
              <Stat label={th.smallest} value={heap[0]?.value ?? '–'} />
              <Stat label={th.levels} value={heap.length ? Math.floor(Math.log2(heap.length)) + 1 : 0} />
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
              placeholder={th.placeholder}
              className="h-10 w-24 rounded-xl border border-line bg-paper/50 px-3 text-sm text-ink focus:border-ink focus:outline-none"
              aria-label={th.value}
            />
            <Button size="sm" className="h-10" type="submit" disabled={!valid || heap.length >= 31}>
              <Plus size={15} />
              {th.push}
            </Button>
            <Button variant="secondary" size="sm" className="h-10" onClick={doPop} disabled={!heap.length}>
              <ArrowUpFromLine size={15} />
              {th.takeSmallest}
            </Button>
            <Button variant="ghost" size="sm" className="h-10" onClick={() => doPush(1 + Math.floor(Math.random() * 99))} disabled={heap.length >= 31}>
              <Dices size={15} />
              <span className="hidden sm:inline">{t.common.random}</span>
            </Button>
          </form>

          <div className="rounded-2xl border border-line bg-paper/60 px-2 py-3">
            <TreeDiagram nodes={diagram.nodes} edges={diagram.edges} accent={ACCENT} minDepth={4} emptyText={th.emptyHeap} label={t.algorithms['binary-heap'].name} />
          </div>

          {/* The same heap as it is really stored: a plain array */}
          <div className="mt-4 px-1">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">{th.storedAsArray}</p>
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
              { color: ACCENT, label: th.legend.compare, shape: 'dot' },
              { color: SWAP, label: th.legend.swap, shape: 'dot' },
              { color: SETTLED, label: th.legend.settled, shape: 'dot' },
            ]}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <Panel eyebrow={t.common.tryThis} title={t.common.threeExperiments}>
            <GuideSteps steps={steps} accent={ACCENT} />
          </Panel>
          <Panel eyebrow={th.takenSoFar}>
            {taken.length ? (
              <div className="flex flex-wrap gap-1.5">
                {taken.map((v, i) => (
                  <span key={i} className="rounded-lg px-2.5 py-1 text-sm tabular-nums" style={{ backgroundColor: SOFT, color: ACCENT }}>
                    {v}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-mute">{th.nothingTaken}</p>
            )}
            <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => reset(Array.from({ length: 10 }, () => 1 + Math.floor(Math.random() * 99)))}
                className="rounded-full border border-line px-3 py-1.5 text-[13px] text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
              >
                {th.random10}
              </button>
              <button
                type="button"
                onClick={() => reset([])}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line-strong px-3 py-1.5 text-[13px] text-ink-soft hover:text-ink"
              >
                <Trash2 size={13} />
                {t.common.empty}
              </button>
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <Panel eyebrow={t.common.ideaInAMinute} title={th.ideaTitle}>
          <div className="space-y-3 leading-relaxed text-ink-soft">
            {th.idea.map((p) => (
              <p key={p}>
                <Rich text={p} />
              </p>
            ))}
          </div>
          <div className="mt-5 rounded-2xl p-4 text-[13px] leading-relaxed text-ink-soft" style={{ backgroundColor: SOFT }}>
            <Rich text={th.callout} />
          </div>
        </Panel>
        <Panel eyebrow={t.common.atAGlance} title={t.common.howFast}>
          <FactList facts={th.facts} />
        </Panel>
      </div>
    </div>
  );
}

export default HeapVisualizer;
