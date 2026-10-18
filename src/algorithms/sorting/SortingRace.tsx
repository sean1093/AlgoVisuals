import { useMemo, useState } from 'react';
import { Shuffle, Trophy } from 'lucide-react';
import { INPUT_SHAPES, InputShape, SORTERS, SortAlgorithm, makeInput } from './logic';
import Bars, { BAR_COLORS, LEGEND_KEYS } from './Bars';
import { usePlayer } from '../../components/player/usePlayer';
import PlayerControls from '../../components/player/PlayerControls';
import Button from '../../components/shared/Button';
import Slider from '../../components/shared/Slider';
import Panel from '../../components/shared/Panel';
import Chips from '../../components/shared/Chips';
import Legend from '../../components/shared/Legend';
import { getCategory } from '../../registry';
import { useI18n } from '../../i18n';
import Rich from '../../components/shared/Rich';

const { accent: ACCENT, soft: SOFT } = getCategory('sorting').theme;
const RACE_SPEEDS = [160, 60, 20, 6];
const ALGORITHMS = Object.keys(SORTERS) as SortAlgorithm[];

function SortingRace() {
  const { t } = useI18n();
  const ts = t.sorting;
  const tr = ts.race;
  const ordinal = (n: number) => tr.ordinals[n] ?? String(n + 1);
  const [size, setSize] = useState(30);
  const [shape, setShape] = useState<InputShape>('random');
  const [seed, setSeed] = useState(0);

  const input = useMemo(() => makeInput(size, shape), [size, shape, seed]);
  const lanes = useMemo(
    () => ALGORITHMS.map((id) => ({ id, frames: SORTERS[id](input, ts.notes) })),
    [input, ts.notes]
  );
  const longest = Math.max(...lanes.map((l) => l.frames.length));
  const player = usePlayer(longest, { resetKey: lanes, speeds: RACE_SPEEDS, initialSpeed: 1 });
  const tick = player.index;

  // Finishing order: fewest steps wins
  const ranking = [...lanes].sort((a, b) => a.frames.length - b.frames.length).map((l) => l.id);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
        <div className="mb-5 flex flex-col gap-5 px-1 md:flex-row md:items-end md:justify-between">
          <Chips label={ts.startingOrder} options={INPUT_SHAPES.map((id) => ({ id, label: ts.shapes[id] }))} value={shape} onChange={setShape} accent={ACCENT} />
          <div className="flex items-end gap-4">
            <Slider label={ts.bars} value={size} min={10} max={60} onChange={setSize} accent={ACCENT} className="w-48" />
            <Button variant="secondary" size="sm" onClick={() => setSeed((s) => s + 1)}>
              <Shuffle size={15} />
              {t.common.newList}
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lanes.map(({ id, frames }) => {
            const frame = frames[Math.min(tick, frames.length - 1)];
            const done = tick >= frames.length - 1;
            const place = ranking.indexOf(id);
            return (
              <div key={id} className="rounded-2xl border border-line bg-paper/60 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="font-display text-lg text-ink">{ts.names[id]}</p>
                  {done ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={place === 0 ? { backgroundColor: ACCENT, color: '#fff' } : { backgroundColor: SOFT, color: ACCENT }}
                    >
                      {place === 0 && <Trophy size={12} />}
                      {ordinal(place)}
                    </span>
                  ) : (
                    <span className="text-xs tabular-nums text-ink-mute">
                      {Math.round((tick / (frames.length - 1)) * 100)}%
                    </span>
                  )}
                </div>
                <Bars frame={frame} className="h-28" />
                <div className="mt-3 flex justify-between text-xs text-ink-mute">
                  <span>
                    <b className="tabular-nums text-ink">{frame.comparisons}</b> {tr.comparisons}
                  </span>
                  <span>
                    <b className="tabular-nums text-ink">{frame.writes}</b> {id === 'merge' ? tr.writes : tr.swaps}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <PlayerControls player={player} accent={ACCENT} className="mt-5" />
        <Legend className="mt-5 px-1" items={LEGEND_KEYS.map((key) => ({ color: BAR_COLORS[key], label: ts.legend[key] }))} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel eyebrow={tr.lookFor} title={tr.sameList}>
          <div className="space-y-3 leading-relaxed text-ink-soft">
            <p>{tr.explain1}</p>
            <p>
              <Rich text={tr.explain2} />
            </p>
          </div>
        </Panel>
        <Panel eyebrow={tr.finalScores} title={tr.stepsToFinish}>
          {!player.atEnd ? (
            <p className="leading-relaxed text-ink-mute">{tr.waiting}</p>
          ) : (
          <ol className="space-y-2.5">
            {ranking.map((id, i) => {
              const steps = lanes.find((l) => l.id === id)!.frames.length;
              return (
                <li key={id} className="flex items-center gap-3 text-sm">
                  <span className="min-w-8 flex-shrink-0 text-ink-mute">{ordinal(i)}</span>
                  <span className="w-28 text-ink">{ts.names[id]}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-deep">
                    <div className="h-full rounded-full" style={{ width: `${(steps / longest) * 100}%`, backgroundColor: ACCENT, opacity: 0.75 }} />
                  </div>
                  <span className="w-12 text-right tabular-nums text-ink-soft">{steps}</span>
                </li>
              );
            })}
          </ol>
          )}
        </Panel>
      </div>
    </div>
  );
}

export default SortingRace;
