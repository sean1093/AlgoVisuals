import { useEffect, useMemo, useState } from 'react';
import { Shuffle } from 'lucide-react';
import { INPUT_SHAPES, InputShape, SORTERS, SortAlgorithm, makeInput } from './logic';
import { SORT_COMPLEXITY } from './content';
import Bars, { BAR_COLORS, LEGEND_KEYS } from './Bars';
import { usePlayer } from '../../components/player/usePlayer';
import PlayerControls from '../../components/player/PlayerControls';
import Narration from '../../components/player/Narration';
import Button from '../../components/shared/Button';
import Slider from '../../components/shared/Slider';
import Panel from '../../components/shared/Panel';
import Stat from '../../components/shared/Stat';
import Chips from '../../components/shared/Chips';
import Legend from '../../components/shared/Legend';
import FactList from '../../components/shared/FactList';
import GuideSteps from '../../components/shared/GuideSteps';
import { getCategory } from '../../registry';
import { useI18n } from '../../i18n';

const { accent: ACCENT, soft: SOFT } = getCategory('sorting').theme;

function SortingVisualizer({ algorithm }: { algorithm: SortAlgorithm }) {
  const { t } = useI18n();
  const ts = t.sorting;
  const [size, setSize] = useState(12);
  const [shape, setShape] = useState<InputShape>('random');
  const [seed, setSeed] = useState(0);
  const [progress, setProgress] = useState({ played: false, stepped: false, shape: false });

  // `seed` forces a fresh shuffle when the user asks for one
  const input = useMemo(() => makeInput(size, shape), [size, shape, seed]);
  const frames = useMemo(() => SORTERS[algorithm](input, ts.notes), [algorithm, input, ts.notes]);
  // Rewind on new input only; a language switch re-narrates the same frames in place
  const player = usePlayer(frames.length, { resetKey: input });
  const frame = frames[player.index];
  const info = ts.info[algorithm];
  const complexity = SORT_COMPLEXITY[algorithm];

  useEffect(() => {
    if (player.playing) setProgress((p) => (p.played ? p : { ...p, played: true }));
  }, [player.playing]);

  const markStepped = () => setProgress((p) => (p.stepped ? p : { ...p, stepped: true }));
  const controls = {
    ...player,
    stepForward: () => {
      markStepped();
      player.stepForward();
    },
    stepBack: () => {
      markStepped();
      player.stepBack();
    },
    seek: (i: number) => {
      markStepped();
      player.seek(i);
    },
  };

  const done = [progress.played, progress.stepped, progress.shape];
  const steps = ts.steps.map((s, i) => ({ ...s, done: done[i] }));

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4 px-1">
            <div className="flex gap-8">
              <Stat label={ts.comparisons} value={frame.comparisons} />
              <Stat label={algorithm === 'merge' ? ts.writes : ts.swaps} value={frame.writes} />
            </div>
            <Button variant="secondary" size="sm" onClick={() => setSeed((s) => s + 1)} title={ts.newListTitle}>
              <Shuffle size={15} />
              {t.common.newList}
            </Button>
          </div>

          <div className="rounded-2xl border border-line bg-paper/60 px-3 pb-0 pt-4 md:px-5">
            <Bars frame={frame} showValues={size <= 20} className="h-64 md:h-80" />
          </div>

          <Narration stepKey={player.index} accent={ACCENT} className="mt-4">
            {frame.note}
          </Narration>
          <PlayerControls player={controls} accent={ACCENT} className="mt-4" />
          <Legend
            className="mt-5 px-1"
            items={LEGEND_KEYS.map((key) => ({ color: BAR_COLORS[key], label: ts.legend[key] }))}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <Panel eyebrow={t.common.tryThis} title={t.common.threeExperiments}>
            <GuideSteps steps={steps} accent={ACCENT} />
          </Panel>
          <Panel eyebrow={t.common.adjust}>
            <div className="space-y-6">
              <Chips
                label={ts.startingOrder}
                options={INPUT_SHAPES.map((id) => ({ id, label: ts.shapes[id] }))}
                value={shape}
                onChange={(s) => {
                  setShape(s);
                  if (s !== 'random') setProgress((p) => ({ ...p, shape: true }));
                }}
                accent={ACCENT}
              />
              <Slider label={ts.howManyBars} value={size} min={5} max={40} onChange={setSize} accent={ACCENT} />
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <Panel eyebrow={t.common.ideaInAMinute} title={t.common.howItWorks}>
          <div className="space-y-3 leading-relaxed text-ink-soft">
            {info.idea.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl p-4 text-[13px] leading-relaxed" style={{ backgroundColor: SOFT }}>
              <p className="mb-1 font-semibold text-ink">{t.common.goodAt}</p>
              <p className="text-ink-soft">{info.goodAt}</p>
            </div>
            <div className="rounded-2xl bg-paper-deep/70 p-4 text-[13px] leading-relaxed">
              <p className="mb-1 font-semibold text-ink">{t.common.strugglesWith}</p>
              <p className="text-ink-soft">{info.badAt}</p>
            </div>
          </div>
        </Panel>
        <Panel eyebrow={t.common.atAGlance} title={t.common.howFast}>
          <FactList
            facts={[
              { label: ts.bestCase, value: complexity.best },
              { label: ts.typical, value: complexity.average },
              { label: ts.worstCase, value: complexity.worst },
              { label: ts.extraMemory, value: complexity.space },
              { label: ts.stable, hint: ts.stableHint, value: complexity.stable ? t.common.yes : t.common.no },
            ]}
          />
          <p className="mt-4 text-[13px] leading-relaxed text-ink-mute">{ts.complexityNote}</p>
        </Panel>
      </div>
    </div>
  );
}

export default SortingVisualizer;
