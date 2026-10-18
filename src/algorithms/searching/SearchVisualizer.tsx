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
import { useI18n } from '../../i18n';

const { accent: ACCENT, soft: SOFT } = getCategory('searching').theme;
const FOUND = 'var(--color-sage)';
const SPEEDS = [1300, 700, 300, 80];

function pickMissing(list: number[]) {
  const present = new Set(list);
  const options = Array.from({ length: 99 }, (_, i) => i + 1).filter((v) => !present.has(v));
  return options[Math.floor(Math.random() * options.length)] ?? 100;
}

function SearchVisualizer({ algorithm }: { algorithm: SearchAlgorithm }) {
  const { t } = useI18n();
  const ts = t.searching;
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
    () => (algorithm === 'linear' ? linearSearch(list, target, ts.notes) : binarySearch(list, target, ts.notes)),
    [algorithm, list, target, ts.notes]
  );
  // Rewind on a new search only; a language switch re-narrates the same frames in place
  const searchKey = useMemo(() => ({}), [algorithm, list, target]);
  const player = usePlayer(frames.length, { resetKey: searchKey, speeds: SPEEDS });
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

  const done = [progress.played, progress.picked, progress.missing];
  const steps = ts.steps.map((s, i) => ({ title: s.title, detail: s.detail(target), done: done[i] }));

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4 px-1">
            <div className="flex items-end gap-8">
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">{ts.lookingFor}</p>
                <span
                  className="inline-flex h-12 min-w-12 items-center justify-center rounded-xl px-3 font-display text-3xl"
                  style={{ backgroundColor: SOFT, color: ACCENT }}
                >
                  {target}
                </span>
              </div>
              <Stat label={ts.checksSoFar} value={frame.checks} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button variant="secondary" size="sm" onClick={() => pickTarget(list[Math.floor(Math.random() * list.length)], 'picked')}>
                <Dices size={15} />
                {ts.randomTarget}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => pickTarget(pickMissing(list), 'missing')}>
                <HelpCircle size={15} />
                {ts.notInList}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setData(newData(size))} title={t.common.newList}>
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
                          ? { backgroundColor: FOUND, borderColor: FOUND, color: 'var(--color-on-accent)' }
                          : isCurrent
                            ? { borderColor: ACCENT, borderWidth: 2, color: ACCENT, backgroundColor: SOFT }
                            : !faded
                              ? { borderColor: value === target ? ACCENT : undefined }
                              : undefined
                      }
                      aria-label={ts.searchFor(value)}
                    >
                      {value}
                    </motion.button>
                    <span className="h-4 text-[10px] font-semibold uppercase tracking-wide" style={{ color: ACCENT }}>
                      {algorithm === 'binary' && !frame.missing
                        ? [frame.low === i && ts.low, isCurrent && ts.mid, frame.high === i && ts.high].filter(Boolean).join(' · ')
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
              { color: ACCENT, label: ts.legend.checking },
              { color: 'var(--bar-idle)', label: ts.legend.ruledOut },
              { color: FOUND, label: ts.legend.found },
            ]}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <Panel eyebrow={t.common.tryThis} title={t.common.threeExperiments}>
            <GuideSteps steps={steps} accent={ACCENT} />
          </Panel>
          <Panel eyebrow={t.common.adjust}>
            <Slider label={ts.howManyBoxes} value={size} min={5} max={63} onChange={(n) => setData(newData(n))} accent={ACCENT} />
          </Panel>
          <Panel eyebrow={ts.headToHead} title={ts.finding(target)}>
            <div className="space-y-3">
              {[
                { label: ts.linear, value: linearChecks, color: algorithm === 'linear' ? ACCENT : 'var(--color-line-strong)' },
                { label: ts.binary, value: binaryChecks, color: algorithm === 'binary' ? ACCENT : 'var(--color-line-strong)' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-[13px]">
                  <div className="mb-1 flex justify-between">
                    <span className="text-ink-soft">{label}</span>
                    <span className="tabular-nums text-ink">{ts.checks(value)}</span>
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
        <Panel eyebrow={t.common.ideaInAMinute} title={ts.content[algorithm].title}>
          <div className="space-y-3 leading-relaxed text-ink-soft">
            {ts.content[algorithm].idea.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {algorithm === 'binary' && <GuessingGame />}
        </Panel>
        <Panel eyebrow={t.common.atAGlance} title={t.common.howFast}>
          <FactList facts={ts.content[algorithm].facts} />
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
  const tg = useI18n().t.searching.game;
  const [secret, setSecret] = useState(() => 1 + Math.floor(Math.random() * 100));
  const [guess, setGuess] = useState('');
  const [history, setHistory] = useState<{ value: number; hint: 'win' | 'higher' | 'lower' }[]>([]);
  const won = history.some((h) => h.value === secret);

  const submit = () => {
    const value = Number(guess);
    if (!Number.isInteger(value) || value < 1 || value > 100 || won) return;
    const hint = value === secret ? 'win' : value < secret ? 'higher' : 'lower';
    setHistory((h) => [...h, { value, hint }]);
    setGuess('');
  };

  return (
    <div className="mt-6 rounded-2xl border border-line bg-paper/60 p-5">
      <p className="font-display text-lg text-ink">{tg.title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{tg.intro}</p>
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
          aria-label={tg.yourGuess}
        />
        <Button size="sm" onClick={submit} disabled={won || guess === ''} className="h-10">
          {tg.guess}
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
            {tg.newGame}
          </Button>
        )}
      </div>
      {history.length > 0 && (
        <ol className="mt-4 flex flex-wrap gap-2">
          {history.map((h, i) => (
            <li
              key={i}
              className="rounded-full px-3 py-1 text-xs"
              style={h.hint === 'win' ? { backgroundColor: FOUND, color: 'var(--color-on-accent)' } : { backgroundColor: SOFT, color: ACCENT }}
            >
              {h.value} · {h.hint === 'win' ? tg.gotIt : h.hint === 'higher' ? tg.higher : tg.lower}
            </li>
          ))}
        </ol>
      )}
      {won && (
        <p className="mt-3 text-[13px] text-ink-soft">
          {history.length <= 7 ? tg.winGood(history.length) : tg.winSlow(history.length)}
        </p>
      )}
    </div>
  );
}

export default SearchVisualizer;
