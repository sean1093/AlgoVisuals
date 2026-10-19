import { useEffect, useMemo, useState } from 'react';
import { Check, Shuffle, X } from 'lucide-react';
import { kruskal, makeTowns } from './kruskal';
import { usePlayer } from '../../components/player/usePlayer';
import PlayerControls from '../../components/player/PlayerControls';
import Narration from '../../components/player/Narration';
import Button from '../../components/shared/Button';
import Panel from '../../components/shared/Panel';
import Stat from '../../components/shared/Stat';
import Legend from '../../components/shared/Legend';
import GuideSteps from '../../components/shared/GuideSteps';
import IdeaSection from '../../components/shared/IdeaSection';
import GraphView from '../../components/shared/GraphView';
import { getCategory } from '../../registry';
import { useI18n } from '../../i18n';

const { accent: ACCENT, soft: SOFT } = getCategory('graphs').theme;
const CURRENT = 'var(--color-clay)';
const SPEEDS = [1300, 750, 350, 120];

function MSTVisualizer() {
  const { t } = useI18n();
  const tm = t.mst;
  const [seed, setSeed] = useState(5);
  const towns = useMemo(() => makeTowns(seed), [seed]);
  const frames = useMemo(() => kruskal(towns, tm.notes), [towns, tm]);
  const player = usePlayer(frames.length, { resetKey: towns, speeds: SPEEDS });
  const frame = frames[player.index];
  const [progress, setProgress] = useState({ skip: false, finish: false, shuffle: false });
  const label = (v: number) => towns.nodes[v].label;

  useEffect(() => {
    if (frame.rejected.length) setProgress((p) => ({ ...p, skip: true }));
    if (player.atEnd) setProgress((p) => ({ ...p, finish: true }));
  }, [frame, player.atEnd]);

  const done = [progress.skip, progress.finish, progress.shuffle];
  const steps = tm.steps.map((s, i) => ({ ...s, done: done[i] }));
  const chosen = new Set(frame.chosen);
  const rejected = new Set(frame.rejected);
  const sizes = frame.group.map((g) => frame.group.filter((h) => h === g).length);
  const current = frame.current !== undefined ? towns.edges[frame.current] : undefined;
  const everything = towns.edges.reduce((s, e) => s + e.weight, 0);

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4 px-1">
            <div className="flex gap-8">
              <Stat label={tm.built} value={`${frame.chosen.length} / ${towns.nodes.length - 1}`} />
              <Stat label={tm.cost} value={frame.total} />
              <Stat label={tm.allRoads} value={everything} />
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSeed((s) => s + 1);
                setProgress((p) => ({ ...p, shuffle: true }));
              }}
            >
              <Shuffle size={15} />
              {tm.newCosts}
            </Button>
          </div>

          <div className="rounded-2xl border border-line bg-paper/60 p-2 md:p-4">
            <GraphView
              label={t.algorithms['minimum-spanning-tree'].name}
              nodes={towns.nodes}
              edges={towns.edges}
              nodeLook={(id) => {
                const touched = current && (current.from === id || current.to === id);
                if (sizes[id] > 1) return { fill: SOFT, stroke: ACCENT, text: ACCENT, ring: touched };
                return { ring: touched, stroke: touched ? CURRENT : undefined };
              }}
              edgeLook={(i) => {
                if (i === frame.current && !chosen.has(i) && !rejected.has(i)) return { color: CURRENT, width: 1.4 };
                if (chosen.has(i)) return { color: ACCENT, width: 1.6 };
                if (rejected.has(i)) return { dashed: true, opacity: 0.45 };
                return {};
              }}
            />
          </div>

          <Narration stepKey={`${seed}-${player.index}`} accent={ACCENT} className="mt-4">
            {frame.note}
          </Narration>
          <PlayerControls player={player} accent={ACCENT} className="mt-4" />
          <Legend
            className="mt-5 px-1"
            items={[
              { color: CURRENT, label: tm.legend.considering },
              { color: ACCENT, label: tm.legend.built },
              { color: 'var(--color-line-strong)', label: tm.legend.skipped },
            ]}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <Panel eyebrow={t.common.tryThis} title={t.common.threeExperiments}>
            <GuideSteps steps={steps} accent={ACCENT} />
          </Panel>
          <Panel eyebrow={tm.cheapestFirst}>
            <ol className="grid grid-cols-2 gap-1.5">
              {frame.sorted.map((i, k) => {
                const e = towns.edges[i];
                const state = chosen.has(i) ? 'built' : rejected.has(i) ? 'skipped' : i === frame.current ? 'current' : k < frame.decided ? 'skipped' : 'waiting';
                const unused = state === 'waiting' && player.atEnd;
                return (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-sm transition-colors"
                    style={{
                      borderColor: state === 'current' ? CURRENT : state === 'built' ? 'transparent' : 'var(--color-line)',
                      backgroundColor: state === 'built' ? SOFT : 'transparent',
                      opacity: state === 'skipped' || unused ? 0.45 : 1,
                    }}
                  >
                    <span className={state === 'skipped' ? 'line-through' : ''}>
                      {label(e.from)}–{label(e.to)}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[13px] text-ink-soft">
                      {e.weight}
                      {state === 'built' && <Check size={13} style={{ color: ACCENT }} />}
                      {state === 'skipped' && <X size={13} />}
                    </span>
                  </li>
                );
              })}
            </ol>
          </Panel>
        </div>
      </div>

      <IdeaSection title={tm.ideaTitle} idea={tm.idea} callout={tm.callout} facts={tm.facts} soft={SOFT} />
    </div>
  );
}

export default MSTVisualizer;
