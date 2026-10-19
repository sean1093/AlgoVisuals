import { useEffect, useMemo, useState } from 'react';
import { Call, fib, plainCalls } from './fib';
import { usePlayer } from '../../components/player/usePlayer';
import PlayerControls from '../../components/player/PlayerControls';
import Narration from '../../components/player/Narration';
import Panel from '../../components/shared/Panel';
import Stat from '../../components/shared/Stat';
import Chips from '../../components/shared/Chips';
import Slider from '../../components/shared/Slider';
import Legend from '../../components/shared/Legend';
import GuideSteps from '../../components/shared/GuideSteps';
import IdeaSection from '../../components/shared/IdeaSection';
import TreeDiagram, { DiagramEdge, DiagramNode } from '../../components/shared/TreeDiagram';
import { getCategory } from '../../registry';
import { useI18n } from '../../i18n';

const { accent: ACCENT, soft: SOFT } = getCategory('dp').theme;
const REPEAT = 'var(--color-clay)';
const MEMO = 'var(--color-sage)';
const SPEEDS = [1100, 600, 250, 60];
const BIG = [10, 20, 30, 40];

/** Fixed x positions from the finished tree, so nodes don't jump as calls appear */
function positions(calls: Call[]) {
  const kids = new Map<number, number[]>();
  for (const c of calls) if (c.parent !== null) kids.set(c.parent, [...(kids.get(c.parent) ?? []), c.id]);
  const leaves: number[] = [];
  const walk = (id: number) => (kids.get(id) ? kids.get(id)!.forEach(walk) : leaves.push(id));
  walk(0);
  const x = new Map<number, number>();
  const place = (id: number): number => {
    const k = kids.get(id);
    const v = k ? k.map(place).reduce((a, b) => a + b, 0) / k.length : (leaves.indexOf(id) + 0.5) / leaves.length;
    x.set(id, v);
    return v;
  };
  place(0);
  return x;
}

function FibonacciVisualizer() {
  const { t } = useI18n();
  const tf = t.fibonacci;
  const [n, setN] = useState(5);
  const [memo, setMemo] = useState(false);
  const frames = useMemo(() => fib(n, memo, tf.notes), [n, memo, tf]);
  const input = useMemo(() => ({ n, memo }), [n, memo]);
  const player = usePlayer(frames.length, { resetKey: input, speeds: SPEEDS });
  const frame = frames[player.index];
  const x = useMemo(() => positions(frames[frames.length - 1].calls), [frames]);
  const [seen, setSeen] = useState({ plain: false, memo: false, bigger: false });

  useEffect(() => {
    if (player.atEnd) setSeen((s) => (memo ? { ...s, memo: true } : { ...s, plain: true }));
  }, [player.atEnd, memo]);

  const diagram = useMemo(() => {
    const nodes: DiagramNode[] = frame.calls.map((c) => {
      const here = c.id === frame.current && !player.atEnd;
      const colour = here ? ACCENT : c.memo ? MEMO : undefined;
      return {
        id: c.id,
        label: c.n,
        x: x.get(c.id)!,
        depth: c.depth,
        fill: colour ?? (c.value !== undefined ? SOFT : undefined),
        stroke: colour ?? (c.repeat ? REPEAT : c.value !== undefined ? ACCENT : undefined),
        text: colour ? 'var(--color-on-accent)' : c.repeat ? REPEAT : undefined,
        caption: c.value !== undefined ? `=${c.value}` : undefined,
      };
    });
    const edges: DiagramEdge[] = frame.calls
      .filter((c) => c.parent !== null)
      .map((c) => ({ from: c.parent!, to: c.id, highlight: c.id === frame.current }));
    return { nodes, edges };
  }, [frame, x, player.atEnd]);

  const done = [seen.plain, seen.memo, seen.bigger];
  const steps = tf.steps.map((s, i) => ({ ...s, done: done[i] }));
  const repeats = frame.calls.filter((c) => c.repeat || c.memo).length;

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4 px-1">
            <div className="flex gap-8">
              <Stat label={tf.calls} value={frame.calls.length} />
              <Stat label={memo ? tf.reused : tf.repeated} value={repeats} />
            </div>
            <Chips
              options={[
                { id: 'plain', label: tf.plain },
                { id: 'memo', label: tf.withMemo },
              ]}
              value={memo ? 'memo' : 'plain'}
              onChange={(v) => setMemo(v === 'memo')}
              accent={ACCENT}
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-line bg-paper/60 px-2 py-3">
            <div className={n >= 7 && !memo ? 'min-w-[44rem]' : 'min-w-[28rem]'}>
              <TreeDiagram nodes={diagram.nodes} edges={diagram.edges} accent={ACCENT} minDepth={n} label={t.algorithms.fibonacci.name} />
            </div>
          </div>

          {memo && (
            <div className="mt-4 px-1">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">{tf.memoTable}</p>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: n + 1 }, (_, k) => (
                  <div key={k} className="flex w-11 flex-col items-center">
                    <span
                      className="flex h-10 w-11 items-center justify-center rounded-lg border text-sm font-medium tabular-nums transition-colors"
                      style={k in frame.memo ? { backgroundColor: 'var(--color-sage-soft)', borderColor: 'transparent', color: MEMO } : { borderColor: 'var(--color-line)' }}
                    >
                      {frame.memo[k] ?? ''}
                    </span>
                    <span className="mt-1 font-mono text-[10px] text-ink-mute">{k}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Narration stepKey={`${n}-${memo}-${player.index}`} accent={ACCENT} className="mt-4">
            {frame.note}
          </Narration>
          <PlayerControls player={player} accent={ACCENT} className="mt-4" />
          <Legend
            className="mt-5 px-1"
            items={[
              { color: ACCENT, label: tf.legend.current, shape: 'dot' },
              { color: REPEAT, label: tf.legend.repeat, shape: 'dot' },
              { color: MEMO, label: tf.legend.memo, shape: 'dot' },
            ]}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <Panel eyebrow={t.common.tryThis} title={t.common.threeExperiments}>
            <GuideSteps steps={steps} accent={ACCENT} />
          </Panel>
          <Panel eyebrow={t.common.adjust}>
            <Slider
              label={tf.which}
              value={n}
              min={2}
              max={7}
              onChange={(v) => {
                setN(v);
                if (v >= 6) setSeen((s) => ({ ...s, bigger: true }));
              }}
              accent={ACCENT}
            />
            <table className="mt-5 w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.1em] text-ink-mute">
                  <th className="pb-2 font-semibold">n</th>
                  <th className="pb-2 text-right font-semibold">{tf.plain}</th>
                  <th className="pb-2 text-right font-semibold">{tf.withMemo}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {BIG.map((k) => (
                  <tr key={k}>
                    <td className="py-1.5 font-mono">{k}</td>
                    <td className="py-1.5 text-right font-mono" style={{ color: REPEAT }}>
                      {plainCalls(k).toLocaleString()}
                    </td>
                    <td className="py-1.5 text-right font-mono" style={{ color: MEMO }}>
                      {2 * k - 1}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-ink-mute">{tf.callsNote}</p>
          </Panel>
        </div>
      </div>

      <IdeaSection title={tf.ideaTitle} idea={tf.idea} callout={tf.callout} facts={tf.facts} soft={SOFT} />
    </div>
  );
}

export default FibonacciVisualizer;
