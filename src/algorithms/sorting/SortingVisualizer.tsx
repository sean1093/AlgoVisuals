import { useEffect, useMemo, useState } from 'react';
import { Shuffle } from 'lucide-react';
import { INPUT_SHAPES, InputShape, SORTERS, SortAlgorithm, makeInput } from './logic';
import { SORT_INFO } from './content';
import Bars, { BAR_COLORS, LEGEND } from './Bars';
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

const { accent: ACCENT, soft: SOFT } = getCategory('sorting').theme;

function SortingVisualizer({ algorithm }: { algorithm: SortAlgorithm }) {
  const [size, setSize] = useState(12);
  const [shape, setShape] = useState<InputShape>('random');
  const [seed, setSeed] = useState(0);
  const [progress, setProgress] = useState({ played: false, stepped: false, shape: false });

  // `seed` forces a fresh shuffle when the user asks for one
  const input = useMemo(() => makeInput(size, shape), [size, shape, seed]);
  const frames = useMemo(() => SORTERS[algorithm](input), [algorithm, input]);
  const player = usePlayer(frames.length, { resetKey: frames });
  const frame = frames[player.index];
  const info = SORT_INFO[algorithm];

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

  const steps = [
    { title: 'Press play', detail: 'Watch the bars move. The sentence under the chart explains each step.', done: progress.played },
    { title: 'Go one step at a time', detail: 'Pause, then use the arrows (or ← → keys) to see exactly what happens.', done: progress.stepped },
    {
      title: 'Try a different starting order',
      detail: 'Pick “Nearly sorted” or “Reversed”. Watch how the number of comparisons changes.',
      done: progress.shape,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4 px-1">
            <div className="flex gap-8">
              <Stat label="Comparisons" value={frame.comparisons} />
              <Stat label={algorithm === 'merge' ? 'Writes' : 'Swaps'} value={frame.writes} />
            </div>
            <Button variant="secondary" size="sm" onClick={() => setSeed((s) => s + 1)} title="New random list">
              <Shuffle size={15} />
              New list
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
            items={LEGEND.map(({ key, label }) => ({ color: BAR_COLORS[key], label }))}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <Panel eyebrow="Try this" title="Three small experiments">
            <GuideSteps steps={steps} accent={ACCENT} />
          </Panel>
          <Panel eyebrow="Adjust">
            <div className="space-y-6">
              <Chips
                label="Starting order"
                options={INPUT_SHAPES}
                value={shape}
                onChange={(s) => {
                  setShape(s);
                  if (s !== 'random') setProgress((p) => ({ ...p, shape: true }));
                }}
                accent={ACCENT}
              />
              <Slider label="How many bars" value={size} min={5} max={40} onChange={setSize} accent={ACCENT} />
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <Panel eyebrow="The idea in a minute" title="How it works">
          <div className="space-y-3 leading-relaxed text-ink-soft">
            {info.idea.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl p-4 text-[13px] leading-relaxed" style={{ backgroundColor: SOFT }}>
              <p className="mb-1 font-semibold text-ink">Good at</p>
              <p className="text-ink-soft">{info.goodAt}</p>
            </div>
            <div className="rounded-2xl bg-paper-deep/70 p-4 text-[13px] leading-relaxed">
              <p className="mb-1 font-semibold text-ink">Struggles with</p>
              <p className="text-ink-soft">{info.badAt}</p>
            </div>
          </div>
        </Panel>
        <Panel eyebrow="At a glance" title="How fast, how much memory">
          <FactList
            facts={[
              { label: 'Best case', value: info.best },
              { label: 'Typical', value: info.average },
              { label: 'Worst case', value: info.worst },
              { label: 'Extra memory', value: info.space },
              { label: 'Stable', hint: 'Keeps equal items in their original order', value: info.stable ? 'Yes' : 'No' },
            ]}
          />
          <p className="mt-4 text-[13px] leading-relaxed text-ink-mute">
            n is the number of bars. O(n²) means doubling the list makes it about four times slower;
            O(n log n) only a bit more than twice.
          </p>
        </Panel>
      </div>
    </div>
  );
}

export default SortingVisualizer;
