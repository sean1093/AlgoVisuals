import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Dices, HelpCircle, Shuffle } from 'lucide-react';
import { SearchAlgorithm, binarySearch, linearSearch, makeSortedList, shuffle } from './logic';
import { usePlayer } from '../../components/player/usePlayer';
import PlayerControls from '../../components/player/PlayerControls';
import Narration from '../../components/player/Narration';
import Button from '../../components/shared/Button';
import Slider from '../../components/shared/Slider';
import Panel from '../../components/shared/Panel';
import Stat from '../../components/shared/Stat';
import Legend from '../../components/shared/Legend';
import FactList from '../../components/shared/FactList';
import GuideSteps from '../../components/shared/GuideSteps';
import { getCategory } from '../../registry';

const { accent: ACCENT, soft: SOFT } = getCategory('searching').theme;
const FOUND = '#3f6b5c';
const SPEEDS = [1300, 700, 300, 80];

const CONTENT: Record<SearchAlgorithm, { idea: string[]; facts: { label: string; value: string; hint?: string }[] }> = {
  linear: {
    idea: [
      'Start at the first box and check each one in turn until you find what you’re looking for — or run out of boxes.',
      'It’s the only option when the list is in no particular order. The catch: if the list doubles, so does the work.',
    ],
    facts: [
      { label: 'Best case', value: 'O(1)', hint: 'It’s in the first box' },
      { label: 'Worst case', value: 'O(n)', hint: 'Last box, or not there at all' },
      { label: 'Needs a sorted list', value: 'No' },
      { label: 'Extra memory', value: 'O(1)' },
    ],
  },
  binary: {
    idea: [
      'Look at the middle box. If your number is bigger, it can only be in the right half; if smaller, the left half. Throw the other half away.',
      'Each check halves what’s left, so even a million sorted items need only about 20 checks. That’s the power of keeping things in order.',
    ],
    facts: [
      { label: 'Best case', value: 'O(1)', hint: 'It’s right in the middle' },
      { label: 'Worst case', value: 'O(log n)', hint: 'About 20 checks for a million items' },
      { label: 'Needs a sorted list', value: 'Yes' },
      { label: 'Extra memory', value: 'O(1)' },
    ],
  },
};

function pickMissing(list: number[]) {
  const present = new Set(list);
  const options = Array.from({ length: 99 }, (_, i) => i + 1).filter((v) => !present.has(v));
  return options[Math.floor(Math.random() * options.length)] ?? 100;
}

function SearchVisualizer({ algorithm }: { algorithm: SearchAlgorithm }) {
  // A new list always comes with a target that's in it
  const newData = (size: number) => {
    const sorted = makeSortedList(size);
    return { sorted, shuffled: shuffle(sorted), target: sorted[Math.floor(Math.random() * sorted.length)] };
  };
  const [{ sorted, shuffled, target }, setData] = useState(() => newData(15));
  const setTarget = (value: number) => setData((d) => ({ ...d, target: value }));
  const size = sorted.length;
  const list = algorithm === 'linear' ? shuffled : sorted;
  const [progress, setProgress] = useState({ played: false, picked: false, missing: false });

  const frames = useMemo(
    () => (algorithm === 'linear' ? linearSearch(list, target) : binarySearch(list, target)),
    [algorithm, list, target]
  );
  const player = usePlayer(frames.length, { resetKey: frames, speeds: SPEEDS });
  const frame = frames[player.index];

  useEffect(() => {
    if (player.playing) setProgress((p) => (p.played ? p : { ...p, played: true }));
  }, [player.playing]);

  const pickTarget = (value: number, how: 'picked' | 'missing') => {
    setTarget(value);
    setProgress((p) => ({ ...p, [how]: true }));
  };

  // Head to head: how many checks each method needs for this target
  const linearChecks = linearSearch(shuffled, target).at(-1)!.checks;
  const binaryChecks = binarySearch(sorted, target).at(-1)!.checks;
  const eliminated = new Set(frame.eliminated);

  const steps = [
    { title: 'Press play', detail: `Watch how it hunts for ${target}. The sentence below explains every check.`, done: progress.played },
    { title: 'Search for something else', detail: 'Click any box to make its number the new target.', done: progress.picked },
    { title: 'Look for a number that isn’t there', detail: 'Press “Not in list”. How many checks does it take to be sure?', done: progress.missing },
  ];

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4 px-1">
            <div className="flex items-end gap-8">
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">Looking for</p>
                <span
                  className="inline-flex h-12 min-w-12 items-center justify-center rounded-xl px-3 font-display text-3xl"
                  style={{ backgroundColor: SOFT, color: ACCENT }}
                >
                  {target}
                </span>
              </div>
              <Stat label="Checks so far" value={frame.checks} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button variant="secondary" size="sm" onClick={() => pickTarget(list[Math.floor(Math.random() * list.length)], 'picked')}>
                <Dices size={15} />
                Random target
              </Button>
              <Button variant="secondary" size="sm" onClick={() => pickTarget(pickMissing(list), 'missing')}>
                <HelpCircle size={15} />
                Not in list
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setData(newData(size))} title="New list">
                <Shuffle size={15} />
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-paper/60 p-3 md:p-5">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(3rem,1fr))] gap-2 md:gap-2.5">
              {list.map((value, i) => {
                const isCurrent = frame.index === i;
                const isFound = frame.found === i;
                const isOut = eliminated.has(i) && !isCurrent;
                const outside = frame.low !== undefined && frame.high !== undefined && (i < frame.low || i > frame.high);
                const faded = isOut || (algorithm === 'binary' && outside && !isCurrent);
                return (
                  <div key={`${i}-${value}`} className="flex flex-col items-center gap-1">
                    <motion.button
                      type="button"
                      onClick={() => pickTarget(value, 'picked')}
                      animate={{ y: isCurrent ? -6 : 0, scale: isCurrent ? 1.06 : 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                      className={`flex aspect-square w-full items-center justify-center rounded-xl border text-base font-medium tabular-nums transition-colors md:text-lg ${
                        faded ? 'border-line bg-paper text-ink-mute/50 line-through' : 'bg-card text-ink hover:border-line-strong'
                      }`}
                      style={
                        isFound
                          ? { backgroundColor: FOUND, borderColor: FOUND, color: '#fff' }
                          : isCurrent
                            ? { borderColor: ACCENT, borderWidth: 2, color: ACCENT, backgroundColor: SOFT }
                            : !faded
                              ? { borderColor: value === target ? ACCENT : undefined }
                              : undefined
                      }
                      aria-label={`Search for ${value}`}
                    >
                      {value}
                    </motion.button>
                    <span className="h-4 text-[10px] font-semibold uppercase tracking-wide" style={{ color: ACCENT }}>
                      {algorithm === 'binary' && !frame.missing
                        ? [frame.low === i && 'low', isCurrent && 'mid', frame.high === i && 'high'].filter(Boolean).join(' · ')
                        : isCurrent
                          ? '↑'
                          : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <Narration stepKey={player.index} accent={frame.found !== undefined ? FOUND : ACCENT} className="mt-4">
            {frame.note}
          </Narration>
          <PlayerControls player={player} accent={ACCENT} className="mt-4" />
          <Legend
            className="mt-5 px-1"
            items={[
              { color: ACCENT, label: 'Checking now' },
              { color: '#d9d3c5', label: 'Ruled out' },
              { color: FOUND, label: 'Found' },
            ]}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <Panel eyebrow="Try this" title="Three small experiments">
            <GuideSteps steps={steps} accent={ACCENT} />
          </Panel>
          <Panel eyebrow="Adjust">
            <Slider label="How many boxes" value={size} min={5} max={63} onChange={(n) => setData(newData(n))} accent={ACCENT} />
          </Panel>
          <Panel eyebrow="Head to head" title={`Finding ${target}`}>
            <div className="space-y-3">
              {[
                { label: 'Linear search', value: linearChecks, color: algorithm === 'linear' ? ACCENT : '#cfc7b6' },
                { label: 'Binary search', value: binaryChecks, color: algorithm === 'binary' ? ACCENT : '#cfc7b6' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-[13px]">
                  <div className="mb-1 flex justify-between">
                    <span className="text-ink-soft">{label}</span>
                    <span className="tabular-nums text-ink">{value} checks</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-paper-deep">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                      animate={{ width: `${(value / Math.max(list.length, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <Panel eyebrow="The idea in a minute" title={algorithm === 'linear' ? 'One by one' : 'Halve it, every time'}>
          <div className="space-y-3 leading-relaxed text-ink-soft">
            {CONTENT[algorithm].idea.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {algorithm === 'binary' && <GuessingGame />}
        </Panel>
        <Panel eyebrow="At a glance" title="How fast, how much memory">
          <FactList facts={CONTENT[algorithm].facts} />
        </Panel>
      </div>
    </div>
  );
}

/**
 * "I'm thinking of a number" — the computer always wins in ≤ 7 guesses,
 * and the player can try to do as well.
 */
function GuessingGame() {
  const [secret, setSecret] = useState(() => 1 + Math.floor(Math.random() * 100));
  const [guess, setGuess] = useState('');
  const [history, setHistory] = useState<{ value: number; hint: string }[]>([]);
  const won = history.some((h) => h.value === secret);

  const submit = () => {
    const value = Number(guess);
    if (!Number.isInteger(value) || value < 1 || value > 100 || won) return;
    const hint = value === secret ? 'Got it!' : value < secret ? 'Higher' : 'Lower';
    setHistory((h) => [...h, { value, hint }]);
    setGuess('');
  };

  return (
    <div className="mt-6 rounded-2xl border border-line bg-paper/60 p-5">
      <p className="font-display text-lg text-ink">Play: guess my number</p>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
        I’m thinking of a number from 1 to 100. Binary search always gets it in 7 guesses or fewer — can you?
      </p>
      <div className="mt-4 flex gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={100}
          value={guess}
          disabled={won}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="1 – 100"
          className="h-10 w-28 rounded-xl border border-line bg-card px-3 text-sm text-ink focus:border-ink focus:outline-none"
          aria-label="Your guess"
        />
        <Button size="sm" onClick={submit} disabled={won || guess === ''} className="h-10">
          Guess
        </Button>
        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-10"
            onClick={() => {
              setSecret(1 + Math.floor(Math.random() * 100));
              setHistory([]);
            }}
          >
            New game
          </Button>
        )}
      </div>
      {history.length > 0 && (
        <ol className="mt-4 flex flex-wrap gap-2">
          {history.map((h, i) => (
            <li
              key={i}
              className="rounded-full px-3 py-1 text-xs"
              style={h.hint === 'Got it!' ? { backgroundColor: FOUND, color: '#fff' } : { backgroundColor: SOFT, color: ACCENT }}
            >
              {h.value} · {h.hint}
            </li>
          ))}
        </ol>
      )}
      {won && (
        <p className="mt-3 text-[13px] text-ink-soft">
          {history.length <= 7
            ? `Nice — ${history.length} guess${history.length > 1 ? 'es' : ''}. You searched like a computer.`
            : `${history.length} guesses. Try always guessing the middle of what’s left — that’s binary search.`}
        </p>
      )}
    </div>
  );
}

export default SearchVisualizer;
