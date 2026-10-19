import { Fragment, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, ArrowRight, ArrowLeft, ArrowLeftToLine, ArrowRightToLine, Search, Trash2 } from 'lucide-react';
import { ListFrame, ListNode, fromValues, insertEnd, insertFront, newNodeId, remove, reverse, search } from './logic';
import { usePlayer } from '../../components/player/usePlayer';
import PlayerControls from '../../components/player/PlayerControls';
import Narration from '../../components/player/Narration';
import Button from '../../components/shared/Button';
import Panel from '../../components/shared/Panel';
import Stat from '../../components/shared/Stat';
import Legend from '../../components/shared/Legend';
import GuideSteps from '../../components/shared/GuideSteps';
import IdeaSection from '../../components/shared/IdeaSection';
import { getCategory } from '../../registry';
import { useI18n } from '../../i18n';

const { accent: ACCENT, soft: SOFT } = getCategory('lists').theme;
const FOUND = 'var(--color-sage)';
const GONE = 'var(--color-clay)';
const START = [3, 7, 12, 5];
const MAX = 10;
const SPEEDS = [1300, 750, 350, 120];

type Scene =
  | { kind: 'intro'; base: ListNode[] }
  | { kind: 'front' | 'end'; base: ListNode[]; value: number; id: number }
  | { kind: 'find' | 'delete'; base: ListNode[]; value: number }
  | { kind: 'reverse'; base: ListNode[] };

function NullMark() {
  return <span className="font-mono text-xs text-ink-mute">∅</span>;
}

function LinkedListVisualizer() {
  const { t } = useI18n();
  const tl = t.linkedList;
  const [scene, setScene] = useState<Scene>(() => ({ kind: 'intro', base: fromValues(START) }));
  const frames = useMemo<ListFrame[]>(() => {
    switch (scene.kind) {
      case 'front':
        return insertFront(scene.base, scene.value, tl.notes, scene.id);
      case 'end':
        return insertEnd(scene.base, scene.value, tl.notes, scene.id);
      case 'find':
        return search(scene.base, scene.value, tl.notes);
      case 'delete':
        return remove(scene.base, scene.value, tl.notes);
      case 'reverse':
        return reverse(scene.base, tl.notes);
      default:
        return [{ nodes: scene.base, hops: 0, note: scene.base.length ? tl.intro : tl.notes.empty }];
    }
  }, [scene, tl]);
  const list = frames[frames.length - 1].nodes;
  const player = usePlayer(frames.length, { resetKey: scene, autoPlay: frames.length > 1, speeds: SPEEDS });
  const frame = frames[player.index];
  const [input, setInput] = useState('');
  const [progress, setProgress] = useState({ front: false, end: false, reverse: false });

  const parsed = Number(input);
  const valid = input.trim() !== '' && Number.isInteger(parsed) && parsed >= 0 && parsed <= 99;
  const full = list.length >= MAX;
  const value = valid ? parsed : 1 + Math.floor(Math.random() * 99);

  const run = (kind: Scene['kind']) => {
    if (kind === 'front' || kind === 'end') {
      if (full) return;
      setScene({ kind, base: list, value, id: newNodeId() });
      setProgress((p) => ({ ...p, [kind]: true }));
    } else if (kind === 'find' || kind === 'delete') {
      if (!valid) return;
      setScene({ kind, base: list, value: parsed });
    } else if (kind === 'reverse') {
      setScene({ kind, base: list });
      if (list.length > 1) setProgress((p) => ({ ...p, reverse: true }));
    }
    setInput('');
  };

  const done = [progress.front, progress.end, progress.reverse];
  const steps = tl.steps.map((s, i) => ({ ...s, done: done[i] }));
  const head = frame.head ?? 0;
  const n = frame.nodes.length;
  const flipped = frame.flipped;

  // Arrow between node i and i + 1: forward, backward (mid-reversal) or cut
  const arrow = (i: number) => {
    if (flipped === undefined || i >= flipped) return 'right';
    if (i + 1 < flipped) return 'left';
    return 'none';
  };

  const tags = (i: number) => {
    const out: string[] = [];
    if (i === head) out.push(tl.head);
    if (frame.prev === i) out.push('prev');
    if (frame.cur === i) out.push('cur');
    if (frame.next === i) out.push('next');
    return out;
  };

  const look = (i: number) => {
    if (frame.doomed === i) return { borderColor: GONE, color: GONE, opacity: 0.55, borderStyle: 'dashed' as const };
    if (frame.found === i) return { backgroundColor: FOUND, borderColor: FOUND, color: 'var(--color-on-accent)' };
    if (frame.cur === i) return { backgroundColor: ACCENT, borderColor: ACCENT, color: 'var(--color-on-accent)' };
    if (frame.fresh === i) return { backgroundColor: SOFT, borderColor: ACCENT, color: ACCENT };
    return { backgroundColor: 'var(--color-card)', borderColor: 'var(--color-line-strong)' };
  };

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
          <div className="mb-5 flex gap-8 px-1">
            <Stat label={tl.length} value={list.length} />
            <Stat label={tl.hops} value={frame.hops} />
          </div>

          <form
            className="mb-4 flex flex-wrap items-center gap-2 px-1"
            onSubmit={(e) => {
              e.preventDefault();
              run('end');
            }}
          >
            <input
              type="number"
              inputMode="numeric"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={tl.placeholder}
              className="h-10 w-24 rounded-xl border border-line bg-paper/50 px-3 text-sm text-ink focus:border-ink focus:outline-none"
              aria-label={tl.value}
            />
            <Button size="sm" className="h-10" onClick={() => run('front')} disabled={full}>
              <ArrowLeftToLine size={15} />
              {tl.addFront}
            </Button>
            <Button size="sm" className="h-10" type="submit" disabled={full}>
              <ArrowRightToLine size={15} />
              {tl.addEnd}
            </Button>
            <Button variant="secondary" size="sm" className="h-10" onClick={() => run('find')} disabled={!valid} title={valid ? undefined : tl.typeFirst}>
              <Search size={15} />
              {tl.find}
            </Button>
            <Button variant="secondary" size="sm" className="h-10" onClick={() => run('delete')} disabled={!valid} title={valid ? undefined : tl.typeFirst}>
              <Trash2 size={15} />
              {tl.remove}
            </Button>
            <Button variant="secondary" size="sm" className="h-10" onClick={() => run('reverse')} disabled={list.length < 2}>
              <ArrowLeftRight size={15} />
              {tl.reverse}
            </Button>
          </form>

          <div className="flex min-h-[9rem] flex-wrap items-center gap-y-8 rounded-2xl border border-line bg-paper/60 px-4 pb-6 pt-10">
            {n === 0 && <span className="mx-auto font-display text-xl text-ink-mute">{tl.emptyList}</span>}
            {n > 0 && flipped !== undefined && flipped > 0 && (
              <span className="mr-1 flex items-center gap-1 text-ink-mute">
                <NullMark />
                <ArrowLeft size={16} />
              </span>
            )}
            {frame.nodes.map((node, i) => (
              <Fragment key={node.id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className="relative flex items-center"
                >
                  <div className="absolute -top-7 left-0 flex gap-1">
                    {tags(i).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none"
                        style={tag === tl.head ? { backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' } : { backgroundColor: SOFT, color: ACCENT }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex h-12 overflow-hidden rounded-xl border-2 transition-colors" style={look(i)}>
                    <span className="flex w-11 items-center justify-center text-base font-semibold tabular-nums">{node.value}</span>
                    <span className="w-4 border-l opacity-40" style={{ borderLeftColor: 'currentColor' }} />
                  </div>
                </motion.div>
                <motion.span layout className="mx-1 flex w-7 items-center justify-center text-ink-mute">
                  {i === n - 1 ? (
                    flipped === n ? null : (
                      <span className="flex items-center gap-1">
                        <ArrowRight size={16} />
                        <NullMark />
                      </span>
                    )
                  ) : frame.doomed !== undefined && (i === frame.doomed - 1 || i === frame.doomed) ? (
                    <ArrowRight size={16} style={{ color: GONE }} />
                  ) : arrow(i) === 'right' ? (
                    <ArrowRight size={16} />
                  ) : arrow(i) === 'left' ? (
                    <ArrowLeft size={16} style={{ color: ACCENT }} />
                  ) : (
                    <span className="h-px w-4 border-t border-dashed border-line-strong" />
                  )}
                </motion.span>
              </Fragment>
            ))}
          </div>

          <Narration stepKey={`${frames.length}-${player.index}`} accent={ACCENT} className="mt-4">
            {frame.note}
          </Narration>
          <PlayerControls player={player} accent={ACCENT} keyboard={false} className="mt-4" />
          <Legend
            className="mt-5 px-1"
            items={[
              { color: ACCENT, label: tl.legend.current, shape: 'dot' },
              { color: FOUND, label: tl.legend.found, shape: 'dot' },
              { color: GONE, label: tl.legend.removing, shape: 'dot' },
            ]}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <Panel eyebrow={t.common.tryThis} title={t.common.threeExperiments}>
            <GuideSteps steps={steps} accent={ACCENT} />
          </Panel>
          <Panel eyebrow={tl.compareTitle}>
            <p className="text-sm leading-relaxed text-ink-soft">{tl.compare}</p>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => setScene({ kind: 'intro', base: fromValues(Array.from({ length: 6 }, () => 1 + Math.floor(Math.random() * 99))) })}
                className="rounded-full border border-line px-3 py-1.5 text-[13px] text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
              >
                {tl.random6}
              </button>
              <button
                type="button"
                onClick={() => setScene({ kind: 'intro', base: [] })}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line-strong px-3 py-1.5 text-[13px] text-ink-soft hover:text-ink"
              >
                <Trash2 size={13} />
                {t.common.empty}
              </button>
            </div>
          </Panel>
        </div>
      </div>

      <IdeaSection title={tl.ideaTitle} idea={tl.idea} callout={tl.callout} facts={tl.facts} soft={SOFT} />
    </div>
  );
}

export default LinkedListVisualizer;
