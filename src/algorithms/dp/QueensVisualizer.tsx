import { useEffect, useMemo, useState } from 'react';
import { Crown } from 'lucide-react';
import { solveQueens } from './queens';
import { usePlayer } from '../../components/player/usePlayer';
import PlayerControls from '../../components/player/PlayerControls';
import Narration from '../../components/player/Narration';
import Panel from '../../components/shared/Panel';
import Stat from '../../components/shared/Stat';
import Slider from '../../components/shared/Slider';
import Legend from '../../components/shared/Legend';
import GuideSteps from '../../components/shared/GuideSteps';
import IdeaSection from '../../components/shared/IdeaSection';
import { getCategory } from '../../registry';
import { useI18n } from '../../i18n';

const { accent: ACCENT, soft: SOFT } = getCategory('dp').theme;
const CLASH = 'var(--color-clay)';
const SAFE = 'var(--color-sage)';
const SPEEDS = [900, 380, 110, 15];

function QueensVisualizer() {
  const { t } = useI18n();
  const tq = t.queens;
  const [n, setN] = useState(4);
  const frames = useMemo(() => solveQueens(n, tq.notes), [n, tq]);
  const player = usePlayer(frames.length, { resetKey: n, speeds: SPEEDS });
  const frame = frames[player.index];
  const [seen, setSeen] = useState({ backtrack: false, solve: false, eight: false });

  useEffect(() => {
    if (frame.backtracks > 0) setSeen((s) => ({ ...s, backtrack: true }));
    if (frame.solved) setSeen((s) => ({ ...s, solve: true, eight: s.eight || n === 8 }));
  }, [frame, n]);

  const done = [seen.backtrack, seen.solve, seen.eight];
  const steps = tq.steps.map((s, i) => ({ ...s, done: done[i] }));
  const row = frame.queens.length;

  // Squares under attack by the queens placed so far, for the faint hatching
  const attacked = (r: number, c: number) => frame.queens.some((qc, qr) => qr !== r && (qc === c || Math.abs(qc - c) === Math.abs(qr - r)));
  const between = (r: number, c: number) => {
    if (!frame.attacker || !frame.trying) return false;
    const [ar, ac] = frame.attacker;
    const [tr, tc] = frame.trying;
    const dr = Math.sign(tr - ar);
    const dc = Math.sign(tc - ac);
    for (let k = 1; ar + k * dr !== tr || ac + k * dc !== tc; k++) if (ar + k * dr === r && ac + k * dc === c) return true;
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
          <div className="mb-5 flex gap-8 px-1">
            <Stat label={tq.queensPlaced} value={`${row} / ${n}`} />
            <Stat label={tq.tries} value={frame.placed} />
            <Stat label={tq.backtracks} value={frame.backtracks} />
          </div>

          <div className="mx-auto w-full max-w-[26rem]">
            <div className="grid overflow-hidden rounded-2xl border border-line" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
              {Array.from({ length: n * n }, (_, k) => {
                const r = Math.floor(k / n);
                const c = k % n;
                const queen = frame.queens[r] === c;
                const trying = frame.trying?.[0] === r && frame.trying?.[1] === c;
                const attacker = frame.attacker?.[0] === r && frame.attacker?.[1] === c;
                const dark = (r + c) % 2 === 1;
                let bg = dark ? 'var(--color-paper-deep)' : 'var(--color-card)';
                if (between(r, c)) bg = 'var(--color-clay-soft)';
                if (trying && frame.attacker) bg = CLASH;
                else if (trying) bg = SAFE;
                else if (r === row && !frame.solved) bg = dark ? SOFT : `color-mix(in srgb, ${SOFT} 60%, var(--color-card))`;
                return (
                  <div key={k} className="relative flex aspect-square items-center justify-center transition-colors duration-150" style={{ backgroundColor: bg }}>
                    {!queen && !trying && attacked(r, c) && <span className="h-1 w-1 rounded-full bg-ink-mute/40" />}
                    {(queen || (trying && !frame.attacker)) && (
                      <Crown
                        className="h-[55%] w-[55%]"
                        strokeWidth={2}
                        style={{ color: trying ? 'var(--color-on-accent)' : attacker ? CLASH : frame.solved ? SAFE : ACCENT }}
                        fill="currentColor"
                        fillOpacity={0.2}
                      />
                    )}
                    {trying && frame.attacker && <span className="text-lg font-semibold text-on-accent">×</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <Narration stepKey={`${n}-${player.index}`} accent={ACCENT} className="mt-5">
            {frame.note}
          </Narration>
          <PlayerControls player={player} accent={ACCENT} className="mt-4" />
          <Legend
            className="mt-5 px-1"
            items={[
              { color: SOFT, label: tq.legend.row },
              { color: SAFE, label: tq.legend.safe },
              { color: CLASH, label: tq.legend.attacked },
            ]}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <Panel eyebrow={t.common.tryThis} title={t.common.threeExperiments}>
            <GuideSteps steps={steps} accent={ACCENT} />
          </Panel>
          <Panel eyebrow={t.common.adjust}>
            <Slider label={tq.boardSize} value={n} min={4} max={8} onChange={setN} accent={ACCENT} hint={tq.boardHint} />
          </Panel>
        </div>
      </div>

      <IdeaSection title={tq.ideaTitle} idea={tq.idea} callout={tq.callout} facts={tq.facts} soft={SOFT} />
    </div>
  );
}

export default QueensVisualizer;
