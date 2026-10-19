import { ReactNode, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { Item, Pair, add, labelFor, take } from './logic';
import Narration from '../../components/player/Narration';
import Button from '../../components/shared/Button';
import Panel from '../../components/shared/Panel';
import Stat from '../../components/shared/Stat';
import GuideSteps from '../../components/shared/GuideSteps';
import IdeaSection from '../../components/shared/IdeaSection';
import { getCategory } from '../../registry';
import { useI18n } from '../../i18n';

const { accent: ACCENT, soft: SOFT } = getCategory('lists').theme;
const QUEUE = 'var(--color-sage)';
const QUEUE_SOFT = 'var(--color-sage-soft)';
const MAX = 6;
const START = 3;

const startPair = (): Pair => {
  let pair: Pair = { stack: [], queue: [] };
  for (let i = 0; i < START; i++) pair = add(pair, { id: i, label: labelFor(i) });
  return pair;
};

function Tile({ item, accent, soft, hot }: { item: Item; accent: string; soft: string; hot: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border-2 text-sm font-semibold"
      style={hot ? { backgroundColor: accent, borderColor: accent, color: 'var(--color-on-accent)' } : { backgroundColor: soft, borderColor: 'transparent', color: accent }}
    >
      {item.label}
    </motion.div>
  );
}

function Column({ title, rule, children, accent, out, outLabel }: { title: string; rule: string; children: ReactNode; accent: string; out: Item[]; outLabel: string }) {
  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-line bg-paper/60 p-4">
      <p className="font-display text-xl text-ink">{title}</p>
      <p className="mb-4 text-[13px] text-ink-mute">{rule}</p>
      <div className="flex flex-1 flex-col justify-center">{children}</div>
      <div className="mt-4 border-t border-line pt-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">{outLabel}</p>
        <div className="flex min-h-[1.75rem] flex-wrap gap-1">
          {out.map((item, i) => (
            <span key={i} className="rounded-md px-2 py-0.5 text-[13px] font-semibold" style={{ color: accent, backgroundColor: 'var(--color-card)' }}>
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StackQueueVisualizer() {
  const { t } = useI18n();
  const ts = t.stackQueue;
  const [pair, setPair] = useState<Pair>(startPair);
  const [count, setCount] = useState(START);
  const [note, setNote] = useState<string>(ts.intro);
  const [stackOut, setStackOut] = useState<Item[]>([]);
  const [queueOut, setQueueOut] = useState<Item[]>([]);
  const [progress, setProgress] = useState({ add: false, take: false, drain: false });

  const n = pair.stack.length;
  const doAdd = () => {
    if (n >= MAX) return;
    const item = { id: count, label: labelFor(count) };
    setPair(add(pair, item));
    setCount(count + 1);
    setNote(ts.added(item.label));
    setProgress((p) => ({ ...p, add: true }));
  };
  const doTake = () => {
    if (!n) return;
    const out = take(pair);
    setPair(out.pair);
    setStackOut([...stackOut, out.fromStack!]);
    setQueueOut([...queueOut, out.fromQueue!]);
    setNote(out.fromStack!.id === out.fromQueue!.id ? ts.same(out.fromStack!.label) : ts.took(out.fromStack!.label, out.fromQueue!.label));
    setProgress((p) => ({ ...p, take: true, drain: p.drain || out.pair.stack.length === 0 }));
  };
  const reset = () => {
    setPair(startPair());
    setCount(START);
    setStackOut([]);
    setQueueOut([]);
    setNote(ts.intro);
  };

  const done = [progress.add, progress.take, progress.drain];
  const steps = ts.steps.map((s, i) => ({ ...s, done: done[i] }));
  const newest = pair.stack[n - 1]?.id;
  const oldest = pair.queue[0]?.id;

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4 px-1">
            <Stat label={ts.items} value={n} />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="h-10" onClick={doAdd} disabled={n >= MAX}>
                <Plus size={15} />
                {ts.add(labelFor(count))}
              </Button>
              <Button variant="secondary" size="sm" className="h-10" onClick={doTake} disabled={!n}>
                <Minus size={15} />
                {ts.take}
              </Button>
              <Button variant="ghost" size="sm" className="h-10" onClick={reset}>
                <RotateCcw size={15} />
                <span className="hidden sm:inline">{t.common.clear}</span>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
            <Column title={ts.stack} rule={ts.stackRule} accent={ACCENT} out={stackOut} outLabel={ts.cameOut}>
              {/* A pile: newest on top */}
              <div className="mx-auto flex min-h-[19.5rem] w-24 flex-col-reverse items-center gap-1.5 rounded-b-2xl border-x-2 border-b-2 border-line-strong px-2 pb-2">
                <AnimatePresence initial={false}>
                  {pair.stack.map((item) => (
                    <Tile key={item.id} item={item} accent={ACCENT} soft={SOFT} hot={item.id === newest} />
                  ))}
                </AnimatePresence>
              </div>
              <p className="mt-2 text-center text-xs text-ink-mute">↑ {ts.inOutTop}</p>
            </Column>
            <Column title={ts.queue} rule={ts.queueRule} accent={QUEUE} out={queueOut} outLabel={ts.cameOut}>
              {/* A line: oldest at the front */}
              <div className="flex min-h-[3.75rem] flex-wrap items-center gap-1.5 rounded-2xl border-y-2 border-line-strong px-2 py-2">
                <AnimatePresence initial={false}>
                  {pair.queue.map((item) => (
                    <Tile key={item.id} item={item} accent={QUEUE} soft={QUEUE_SOFT} hot={item.id === oldest} />
                  ))}
                </AnimatePresence>
              </div>
              <div className="mt-2 flex justify-between text-xs text-ink-mute">
                <span>← {ts.outFront}</span>
                <span>{ts.inBack} ←</span>
              </div>
            </Column>
          </div>

          <Narration stepKey={note} accent={ACCENT} className="mt-4">
            {note}
          </Narration>
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <Panel eyebrow={t.common.tryThis} title={t.common.threeExperiments}>
            <GuideSteps steps={steps} accent={ACCENT} />
          </Panel>
          <Panel eyebrow={t.common.whereUsed}>
            <ul className="space-y-3 text-sm leading-relaxed text-ink-soft">
              <li>
                <b className="font-semibold" style={{ color: ACCENT }}>{ts.stack}</b> · {ts.stackUses}
              </li>
              <li>
                <b className="font-semibold" style={{ color: QUEUE }}>{ts.queue}</b> · {ts.queueUses}
              </li>
            </ul>
          </Panel>
        </div>
      </div>

      <IdeaSection title={ts.ideaTitle} idea={ts.idea} callout={ts.callout} facts={ts.facts} soft={SOFT} />
    </div>
  );
}

export default StackQueueVisualizer;
