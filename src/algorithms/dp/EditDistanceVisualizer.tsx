import { useEffect, useMemo, useState } from 'react';
import { editDistance, Op } from './editDistance';
import { usePlayer } from '../../components/player/usePlayer';
import PlayerControls from '../../components/player/PlayerControls';
import Narration from '../../components/player/Narration';
import Panel from '../../components/shared/Panel';
import Legend from '../../components/shared/Legend';
import GuideSteps from '../../components/shared/GuideSteps';
import IdeaSection from '../../components/shared/IdeaSection';
import { getCategory } from '../../registry';
import { useI18n } from '../../i18n';

const { accent: ACCENT, soft: SOFT } = getCategory('dp').theme;
const FROM = 'var(--color-clay)';
const PATH = 'var(--color-sage)';
const SPEEDS = [1000, 520, 200, 50];
const PAIRS: [string, string][] = [
  ['kitten', 'sitting'],
  ['horse', 'ros'],
  ['sunday', 'saturday'],
  ['flaw', 'lawn'],
];
const OP_COLOUR: Record<Op, string> = { keep: 'var(--color-ink-mute)', replace: 'var(--accent-searching)', insert: 'var(--color-sage)', delete: 'var(--color-clay)' };

const clean = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '').slice(0, 8);

function EditDistanceVisualizer() {
  const { t } = useI18n();
  const te = t.editDistance;
  const [a, setA] = useState('kitten');
  const [b, setB] = useState('sitting');
  const pair = useMemo(() => ({ a, b }), [a, b]);
  const frames = useMemo(() => editDistance(a, b, te.notes), [a, b, te]);
  const player = usePlayer(frames.length, { resetKey: pair, speeds: SPEEDS, initialSpeed: 2 });
  const frame = frames[player.index];
  const [seen, setSeen] = useState({ fill: false, trace: false, own: false });

  useEffect(() => {
    if (frame.ops) setSeen((s) => ({ ...s, fill: true }));
    if (player.atEnd) setSeen((s) => ({ ...s, fill: true, trace: true }));
  }, [frame, player.atEnd]);

  const done = [seen.fill, seen.trace, seen.own];
  const steps = te.steps.map((s, i) => ({ ...s, done: done[i] }));
  const isFrom = (i: number, j: number) => frame.from?.some(([r, c]) => r === i && c === j);
  const onPath = (i: number, j: number) => frame.path?.some(([r, c]) => r === i && c === j);
  const answer = frames[frames.length - 1].table[a.length][b.length];

  const cellStyle = (i: number, j: number) => {
    if (frame.cell?.[0] === i && frame.cell?.[1] === j && !frame.path) return { backgroundColor: ACCENT, color: 'var(--color-on-accent)' };
    if (onPath(i, j)) return { backgroundColor: PATH, color: 'var(--color-on-accent)' };
    if (isFrom(i, j)) return { backgroundColor: 'var(--color-clay-soft)', color: FROM, boxShadow: `inset 0 0 0 2px ${FROM}` };
    if (frame.cell && (frame.cell[0] === i || frame.cell[1] === j) && !frame.path) return { backgroundColor: SOFT };
    return undefined;
  };

  const field = (value: string, set: (v: string) => void, label: string) => (
    <label className="flex flex-col gap-1 text-[13px] text-ink-soft">
      {label}
      <input
        value={value}
        onChange={(e) => {
          set(clean(e.target.value));
          setSeen((s) => ({ ...s, own: true }));
        }}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className="h-10 w-36 rounded-xl border border-line bg-paper/50 px-3 text-sm text-ink focus:border-ink focus:outline-none"
      />
    </label>
  );

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
          <div className="mb-5 flex flex-wrap items-end gap-3 px-1">
            {field(a, setA, te.from)}
            <span className="pb-2.5 text-ink-mute">→</span>
            {field(b, setB, te.to)}
            <div className="ml-auto text-right">
              <div className="font-display text-3xl leading-none tabular-nums text-ink">{frame.ops ? answer : '…'}</div>
              <div className="mt-1.5 text-xs text-ink-mute">{te.edits}</div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-line bg-paper/60 p-3">
            <table className="mx-auto border-separate border-spacing-1 font-mono text-sm">
              <thead>
                <tr>
                  <th />
                  <th className="h-8 w-9 text-ink-mute">ε</th>
                  {b.split('').map((ch, j) => (
                    <th key={j} className="h-8 w-9 font-semibold" style={{ color: frame.cell?.[1] === j + 1 && !frame.path ? ACCENT : undefined }}>
                      {ch}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {frame.table.map((row, i) => (
                  <tr key={i}>
                    <th className="w-8 font-semibold" style={{ color: frame.cell?.[0] === i && i > 0 && !frame.path ? ACCENT : i === 0 ? 'var(--color-ink-mute)' : undefined }}>
                      {i === 0 ? 'ε' : a[i - 1]}
                    </th>
                    {row.map((v, j) => (
                      <td
                        key={j}
                        className="h-9 w-9 rounded-lg border border-line text-center tabular-nums transition-colors"
                        style={cellStyle(i, j) ?? { backgroundColor: v === null ? 'transparent' : 'var(--color-card)' }}
                      >
                        {v ?? ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {frame.ops && frame.ops.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5 px-1">
              {frame.ops.map((o, k) => (
                <span key={k} className="flex flex-col items-center rounded-lg border border-line px-2 py-1 text-center">
                  <span className="font-mono text-sm text-ink">
                    {o.op === 'keep' ? o.a : o.op === 'replace' ? `${o.a}→${o.b}` : o.op === 'insert' ? `+${o.b}` : `−${o.a}`}
                  </span>
                  <span className="text-[10px]" style={{ color: OP_COLOUR[o.op] }}>
                    {te.ops[o.op]}
                  </span>
                </span>
              ))}
            </div>
          )}

          <Narration stepKey={`${a}-${b}-${player.index}`} accent={ACCENT} className="mt-4">
            {frame.note}
          </Narration>
          <PlayerControls player={player} accent={ACCENT} className="mt-4" />
          <Legend
            className="mt-5 px-1"
            items={[
              { color: ACCENT, label: te.legend.filling },
              { color: FROM, label: te.legend.from },
              { color: PATH, label: te.legend.path },
            ]}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <Panel eyebrow={t.common.tryThis} title={t.common.threeExperiments}>
            <GuideSteps steps={steps} accent={ACCENT} />
          </Panel>
          <Panel eyebrow={te.examples}>
            <div className="flex flex-wrap gap-2">
              {PAIRS.map(([x, y]) => (
                <button
                  key={x}
                  type="button"
                  onClick={() => {
                    setA(x);
                    setB(y);
                  }}
                  className="rounded-full border border-line px-3 py-1.5 text-[13px] text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
                >
                  {x} → {y}
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <IdeaSection title={te.ideaTitle} idea={te.idea} callout={te.callout} facts={te.facts} soft={SOFT} />
    </div>
  );
}

export default EditDistanceVisualizer;
