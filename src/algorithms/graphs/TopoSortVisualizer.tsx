import { useEffect, useMemo, useState } from 'react';
import { Shuffle } from 'lucide-react';
import { kahn, makeDag } from './topo';
import Chain from './Chain';
import { usePlayer } from '../../components/player/usePlayer';
import PlayerControls from '../../components/player/PlayerControls';
import Narration from '../../components/player/Narration';
import Button from '../../components/shared/Button';
import Panel from '../../components/shared/Panel';
import Chips from '../../components/shared/Chips';
import Legend from '../../components/shared/Legend';
import GuideSteps from '../../components/shared/GuideSteps';
import IdeaSection from '../../components/shared/IdeaSection';
import GraphView from '../../components/shared/GraphView';
import { getCategory } from '../../registry';
import { useI18n } from '../../i18n';

const { accent: ACCENT, soft: SOFT } = getCategory('graphs').theme;
const PLACED = 'var(--color-sage)';
const ACTIVE = 'var(--color-clay)';
const SPEEDS = [1300, 750, 350, 120];

function TopoSortVisualizer() {
  const { t } = useI18n();
  const tt = t.topo;
  const [seed, setSeed] = useState(3);
  const [cycle, setCycle] = useState(false);
  const dag = useMemo(() => makeDag(seed, cycle), [seed, cycle]);
  const frames = useMemo(() => kahn(dag, tt.notes, t.common.listSeparator), [dag, tt, t.common.listSeparator]);
  const player = usePlayer(frames.length, { resetKey: dag, speeds: SPEEDS });
  const frame = frames[player.index];
  const [progress, setProgress] = useState({ finish: false, shuffle: false, cycle: false });
  const label = (v: number) => dag.nodes[v].label;

  useEffect(() => {
    if (player.atEnd) setProgress((p) => (cycle ? { ...p, cycle: true } : { ...p, finish: true }));
  }, [player.atEnd, cycle]);

  const done = [progress.finish, progress.shuffle, progress.cycle];
  const steps = tt.steps.map((s, i) => ({ ...s, done: done[i] }));
  const placed = new Set(frame.order);
  const queued = new Set(frame.queue);
  const stuck = new Set(frame.stuck ?? []);

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
            <Chips
              options={[
                { id: 'dag', label: tt.noLoop },
                { id: 'cycle', label: tt.withLoop },
              ]}
              value={cycle ? 'cycle' : 'dag'}
              onChange={(v) => setCycle(v === 'cycle')}
              accent={ACCENT}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSeed((s) => s + 1);
                setProgress((p) => ({ ...p, shuffle: true }));
              }}
            >
              <Shuffle size={15} />
              {tt.newTasks}
            </Button>
          </div>

          <div className="rounded-2xl border border-line bg-paper/60 p-2 md:p-4">
            <GraphView
              label={t.algorithms['topological-sort'].name}
              nodes={dag.nodes}
              edges={dag.edges}
              nodeLook={(id) => {
                if (stuck.has(id)) return { fill: 'var(--color-clay-soft)', stroke: ACTIVE, text: ACTIVE, badge: frame.indegree[id] };
                if (id === frame.focus) return { fill: ACCENT, stroke: ACCENT, text: 'var(--color-on-accent)' };
                if (placed.has(id)) return { fill: PLACED, stroke: PLACED, text: 'var(--color-on-accent)' };
                if (queued.has(id)) return { fill: SOFT, stroke: ACCENT, text: ACCENT, ring: true, badge: frame.indegree[id] };
                return { badge: frame.indegree[id] };
              }}
              edgeLook={(i) => {
                if (i === frame.edge) return { color: ACTIVE, width: 1 };
                if (frame.crossed.includes(i)) return { opacity: 0.18 };
                return { color: 'var(--color-ink-mute)' };
              }}
            />
          </div>

          <div className="mt-4 grid gap-4 px-1 sm:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)]">
            <Chain label={tt.queue} items={frame.queue.map(label)} color={ACCENT} soft={SOFT} empty={tt.emptyQueue} />
            <Chain label={tt.order} items={frame.order.map(label)} color={PLACED} soft="var(--color-sage-soft)" empty={tt.emptyQueue} arrows />
          </div>

          <Narration stepKey={`${seed}-${cycle}-${player.index}`} accent={ACCENT} className="mt-4">
            {frame.note}
          </Narration>
          <PlayerControls player={player} accent={ACCENT} className="mt-4" />
          <Legend
            className="mt-5 px-1"
            items={[
              { color: 'var(--color-ink)', label: tt.legend.waiting, shape: 'dot' },
              { color: ACCENT, label: tt.legend.ready, shape: 'dot' },
              { color: PLACED, label: tt.legend.placed, shape: 'dot' },
              { color: ACTIVE, label: tt.legend.stuck, shape: 'dot' },
            ]}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <Panel eyebrow={t.common.tryThis} title={t.common.threeExperiments}>
            <GuideSteps steps={steps} accent={ACCENT} />
          </Panel>
          <Panel eyebrow={tt.readingTitle}>
            <p className="text-sm leading-relaxed text-ink-soft">{tt.reading}</p>
          </Panel>
        </div>
      </div>

      <IdeaSection title={tt.ideaTitle} idea={tt.idea} callout={tt.callout} facts={tt.facts} soft={SOFT} />
    </div>
  );
}

export default TopoSortVisualizer;
