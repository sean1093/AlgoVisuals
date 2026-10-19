import { useMemo, useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { TrieFrame, findPrefix, insert, layout, prefixes } from './logic';
import { usePlayer } from '../../components/player/usePlayer';
import PlayerControls from '../../components/player/PlayerControls';
import Narration from '../../components/player/Narration';
import Button from '../../components/shared/Button';
import Panel from '../../components/shared/Panel';
import Stat from '../../components/shared/Stat';
import Legend from '../../components/shared/Legend';
import GuideSteps from '../../components/shared/GuideSteps';
import IdeaSection from '../../components/shared/IdeaSection';
import TreeDiagram, { DiagramEdge, DiagramNode } from '../../components/shared/TreeDiagram';
import { getCategory } from '../../registry';
import { useI18n } from '../../i18n';

const { accent: ACCENT, soft: SOFT } = getCategory('trees').theme;
const NEW = 'var(--color-clay)';
const MATCH = 'var(--color-sage)';
const START = ['car', 'card', 'care', 'cat', 'do', 'dog', 'dot'];
const MAX_WORDS = 12;
const SPEEDS = [1200, 700, 320, 100];

type Scene = { kind: 'intro'; words: string[] } | { kind: 'add' | 'find'; words: string[]; word: string };

function TrieVisualizer() {
  const { t } = useI18n();
  const tt = t.trie;
  const [scene, setScene] = useState<Scene>({ kind: 'intro', words: START });
  const frames = useMemo<TrieFrame[]>(() => {
    if (scene.kind === 'add') return insert(scene.words, scene.word, tt.notes);
    if (scene.kind === 'find') return findPrefix(scene.words, scene.word, tt.notes);
    return [{ words: scene.words, note: scene.words.length ? tt.intro : tt.emptyIntro }];
  }, [scene, tt]);
  const words = frames[frames.length - 1].words;
  const player = usePlayer(frames.length, { resetKey: scene, autoPlay: frames.length > 1, speeds: SPEEDS });
  const frame = frames[player.index];
  const [input, setInput] = useState('');
  const [progress, setProgress] = useState({ shared: false, find: false, fresh: false });

  const word = input.trim().toLowerCase();
  const valid = /^[a-z]{1,7}$/.test(word);

  const diagram = useMemo(() => {
    const set = prefixes(frame.words, frame.partial);
    const ends = new Set(frame.words);
    const path = new Set<string>();
    if (frame.at !== undefined) for (let i = 0; i <= frame.at.length; i++) path.add(frame.at.slice(0, i));
    const matched = new Set(frame.matches ? [...prefixes(frame.matches)].filter((p) => p.startsWith(frame.at ?? '')) : []);
    const nodes: DiagramNode[] = layout(set).map(({ prefix, depth, x }) => {
      const here = prefix === frame.at;
      const colour = prefix === frame.created ? NEW : here ? ACCENT : matched.has(prefix) ? MATCH : undefined;
      return {
        id: prefix || '·',
        label: prefix ? prefix[prefix.length - 1] : '·',
        x,
        depth,
        fill: colour ?? (ends.has(prefix) ? SOFT : undefined),
        stroke: colour ?? (ends.has(prefix) ? ACCENT : undefined),
        text: colour ? 'var(--color-on-accent)' : ends.has(prefix) ? ACCENT : undefined,
        caption: ends.has(prefix) && (here || matched.has(prefix) || set.size <= 24) ? prefix : undefined,
      };
    });
    const edges: DiagramEdge[] = [...set]
      .filter(Boolean)
      .map((p) => ({ from: p.slice(0, -1) || '·', to: p, highlight: path.has(p) || matched.has(p) }));
    return { nodes, edges };
  }, [frame]);

  const run = (kind: 'add' | 'find') => {
    if (!valid) return;
    if (kind === 'add') {
      if (words.length >= MAX_WORDS && !words.includes(word)) return;
      const existing = prefixes(words);
      const sharesStart = existing.has(word[0]);
      setProgress((p) => ({ ...p, shared: p.shared || (sharesStart && !words.includes(word)), fresh: p.fresh || !sharesStart }));
    } else {
      setProgress((p) => ({ ...p, find: true }));
    }
    setScene({ kind, words, word });
    setInput('');
  };

  const done = [progress.shared, progress.find, progress.fresh];
  const steps = tt.steps.map((s, i) => ({ ...s, done: done[i] }));
  const nodeCount = prefixes(words).size - 1;
  const letters = words.reduce((sum, w) => sum + w.length, 0);

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
          <div className="mb-5 flex gap-8 px-1">
            <Stat label={tt.words} value={words.length} />
            <Stat label={tt.nodes} value={nodeCount} />
            <Stat label={tt.lettersSaved} value={letters - nodeCount} />
          </div>

          <form
            className="mb-4 flex flex-wrap items-center gap-2 px-1"
            onSubmit={(e) => {
              e.preventDefault();
              run('add');
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 7))}
              placeholder={tt.placeholder}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="h-10 w-32 rounded-xl border border-line bg-paper/50 px-3 text-sm text-ink focus:border-ink focus:outline-none"
              aria-label={tt.word}
            />
            <Button size="sm" className="h-10" type="submit" disabled={!valid || (words.length >= MAX_WORDS && !words.includes(word))}>
              <Plus size={15} />
              {tt.add}
            </Button>
            <Button variant="secondary" size="sm" className="h-10" onClick={() => run('find')} disabled={!valid}>
              <Search size={15} />
              {tt.find}
            </Button>
          </form>

          <div className="overflow-x-auto rounded-2xl border border-line bg-paper/60 px-2 py-3">
            <div className="min-w-[30rem]">
              <TreeDiagram nodes={diagram.nodes} edges={diagram.edges} accent={ACCENT} minDepth={4} label={t.algorithms.trie.name} />
            </div>
          </div>

          <Narration stepKey={`${frames.length}-${player.index}`} accent={ACCENT} className="mt-4">
            {frame.note}
          </Narration>
          <PlayerControls player={player} accent={ACCENT} keyboard={false} className="mt-4" />
          <Legend
            className="mt-5 px-1"
            items={[
              { color: ACCENT, label: tt.legend.here, shape: 'dot' },
              { color: NEW, label: tt.legend.created, shape: 'dot' },
              { color: SOFT, label: tt.legend.wordEnd, shape: 'dot' },
              { color: MATCH, label: tt.legend.match, shape: 'dot' },
            ]}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <Panel eyebrow={t.common.tryThis} title={t.common.threeExperiments}>
            <GuideSteps steps={steps} accent={ACCENT} />
          </Panel>
          <Panel eyebrow={frame.matches ? tt.suggestions : tt.allWords}>
            <div className="flex flex-wrap gap-1.5">
              {(frame.matches ?? words).map((w) => (
                <span key={w} className="rounded-lg px-2.5 py-1 text-sm" style={{ backgroundColor: frame.matches ? 'var(--color-sage-soft)' : SOFT, color: frame.matches ? MATCH : ACCENT }}>
                  {w}
                </span>
              ))}
              {(frame.matches ?? words).length === 0 && <span className="text-sm text-ink-mute">{tt.none}</span>}
            </div>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => setScene({ kind: 'intro', words: START })}
                className="rounded-full border border-line px-3 py-1.5 text-[13px] text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
              >
                {tt.sample}
              </button>
              <button
                type="button"
                onClick={() => setScene({ kind: 'intro', words: [] })}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line-strong px-3 py-1.5 text-[13px] text-ink-soft hover:text-ink"
              >
                <Trash2 size={13} />
                {t.common.empty}
              </button>
            </div>
          </Panel>
        </div>
      </div>

      <IdeaSection title={tt.ideaTitle} idea={tt.idea} callout={tt.callout} facts={tt.facts} soft={SOFT} />
    </div>
  );
}

export default TrieVisualizer;
