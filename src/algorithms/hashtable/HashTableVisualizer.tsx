import { useState } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import { Expand, Plus, Search, Sparkles, Trash2, X } from 'lucide-react';
import { Table, add, createTable, find, hashOf, remove, resize, stats } from './logic';
import Button from '../../components/shared/Button';
import Panel from '../../components/shared/Panel';
import Stat from '../../components/shared/Stat';
import FactList from '../../components/shared/FactList';
import GuideSteps from '../../components/shared/GuideSteps';
import Narration from '../../components/player/Narration';
import { getCategory } from '../../registry';
import { Messages, useI18n } from '../../i18n';
import Rich from '../../components/shared/Rich';

const { accent: ACCENT, soft: SOFT } = getCategory('structures').theme;
const FOUND = '#3f6b5c';
const CLASH = '#c0553a';

const STARTER = ['cat', 'dog', 'owl', 'fox', 'bee'];
const MORE = ['yak', 'emu', 'ant', 'eel', 'koi', 'cow', 'pig', 'hen', 'ram', 'elk', 'bat', 'ape', 'gnu', 'cod', 'jay'];

interface Highlight {
  bucket: number;
  key?: string;
  kind: 'add' | 'clash' | 'found' | 'missing' | 'removed';
}

function buildTable(words: string[], buckets: number): Table {
  let table = createTable(buckets);
  for (const w of words) table = add(table, w).table;
  return table;
}

/** Narration is stored as a function of the dictionary so it follows language switches */
type Note = (m: Messages['hash']) => string;

function HashTableVisualizer() {
  const { t } = useI18n();
  const th = t.hash;
  const [table, setTable] = useState<Table>(() => buildTable(STARTER, 8));
  const [input, setInput] = useState('');
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const [note, setNoteFn] = useState<{ render: Note }>({ render: (m) => m.intro });
  const setNote = (render: Note) => setNoteFn({ render });
  const noteText = note.render(th);
  const [lastKey, setLastKey] = useState('cat');
  const [progress, setProgress] = useState({ add: false, find: false, grow: false });

  const key = input.trim().toLowerCase();
  const valid = /^[a-z]{1,12}$/.test(key);
  const s = stats(table);
  const breakdown = hashOf(lastKey, table.length);

  const doAdd = (word: string) => {
    const result = add(table, word);
    setLastKey(word);
    setTable(result.table);
    setProgress((p) => ({ ...p, add: true }));
    if (result.existed) {
      setHighlight({ bucket: result.bucket, key: word, kind: 'found' });
      setNote((m) => m.exists(word, result.bucket));
    } else if (result.collision) {
      setHighlight({ bucket: result.bucket, key: word, kind: 'clash' });
      const existing = table[result.bucket].map((k) => `“${k}”`).join(', ');
      setNote((m) => m.collision(result.bucket, existing, word));
    } else {
      setHighlight({ bucket: result.bucket, key: word, kind: 'add' });
      setNote((m) => m.added(word, result.bucket));
    }
  };

  const doFind = (word: string) => {
    const { bucket, position, checked } = find(table, word);
    setLastKey(word);
    setProgress((p) => ({ ...p, find: true }));
    if (position >= 0) {
      setHighlight({ bucket, key: word, kind: 'found' });
      const total = s.items;
      setNote((m) => m.found(bucket, word, checked, total));
    } else {
      setHighlight({ bucket, kind: 'missing' });
      setNote((m) => m.notFound(word, bucket, checked));
    }
  };

  const doRemove = (word: string) => {
    const result = remove(table, word);
    setLastKey(word);
    setTable(result.table);
    setHighlight({ bucket: result.bucket, kind: result.removed ? 'removed' : 'missing' });
    setNote((m) => (result.removed ? m.removed(word, result.bucket) : m.notInTable(word)));
  };

  const grow = () => {
    const next = resize(table, Math.min(table.length * 2, 32));
    setTable(next);
    setHighlight(null);
    setProgress((p) => ({ ...p, grow: true }));
    setNote((m) => m.grown(next.length));
  };

  const addMany = () => {
    let next = table;
    const fresh = MORE.filter((w) => find(table, w).position === -1).slice(0, 5);
    for (const w of fresh) next = add(next, w).table;
    setTable(next);
    setHighlight(null);
    setProgress((p) => ({ ...p, add: true }));
    setNote((m) => (fresh.length ? m.addedMany(fresh.join(', ')) : m.allIn));
  };

  const done = [progress.add, progress.find, progress.grow];
  const steps = th.steps.map((s, i) => ({ ...s, done: done[i] }));

  const colourFor = (bucket: number, word?: string) => {
    if (!highlight || highlight.bucket !== bucket) return null;
    if (word && highlight.key === word) {
      return highlight.kind === 'clash' ? CLASH : highlight.kind === 'found' ? FOUND : ACCENT;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
          <div className="mb-5 flex flex-wrap gap-8 px-1">
            <Stat label={th.items} value={s.items} />
            <Stat label={th.buckets} value={s.buckets} />
            <Stat label={th.perBucket} value={s.load.toFixed(2)} />
            <Stat label={th.longest} value={s.longest} />
          </div>

          <form
            className="mb-4 flex flex-wrap items-center gap-2 px-1"
            onSubmit={(e) => {
              e.preventDefault();
              if (valid) {
                doAdd(key);
                setInput('');
              }
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={th.placeholder}
              title={th.lettersOnly}
              maxLength={12}
              className="h-10 w-32 rounded-xl border border-line bg-paper/50 px-3 text-sm text-ink focus:border-ink focus:outline-none"
              aria-label={th.word}
            />
            <Button size="sm" className="h-10" type="submit" disabled={!valid}>
              <Plus size={15} />
              {th.add}
            </Button>
            <Button variant="secondary" size="sm" className="h-10" disabled={!valid} onClick={() => doFind(key)}>
              <Search size={15} />
              {th.find}
            </Button>
            <Button variant="secondary" size="sm" className="h-10" disabled={!valid} onClick={() => doRemove(key)}>
              <X size={15} />
              {th.remove}
            </Button>
          </form>

          <LayoutGroup>
            <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-paper/60">
              {table.map((chain, bucket) => {
                const active = highlight?.bucket === bucket;
                return (
                  <div
                    key={bucket}
                    className="flex min-h-12 items-center gap-3 px-3 py-1.5 transition-colors"
                    style={active ? { backgroundColor: highlight?.kind === 'clash' ? '#f5e1d8' : SOFT } : undefined}
                  >
                    <span
                      className="w-8 flex-shrink-0 text-right font-mono text-xs"
                      style={{ color: active ? ACCENT : '#8d867b', fontWeight: active ? 700 : 500 }}
                    >
                      {bucket}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {chain.length === 0 && <span className="text-xs text-ink-mute/60">{th.emptyBucket}</span>}
                      {chain.map((word, i) => {
                        const colour = colourFor(bucket, word);
                        return (
                          <motion.span key={word} layout layoutId={word} className="flex items-center gap-1.5" transition={{ type: 'spring', stiffness: 400, damping: 34 }}>
                            {i > 0 && <span className="text-xs text-ink-mute">→</span>}
                            <button
                              type="button"
                              onClick={() => setInput(word)}
                              className="rounded-lg border px-2.5 py-1 text-sm transition-colors"
                              style={colour ? { backgroundColor: colour, borderColor: colour, color: '#fff' } : { backgroundColor: '#fffdf8', borderColor: '#e3ddd0', color: '#1f1d1a' }}
                            >
                              {word}
                            </button>
                          </motion.span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </LayoutGroup>

          <Narration stepKey={noteText} accent={highlight?.kind === 'clash' ? CLASH : ACCENT} className="mt-4">
            {noteText}
          </Narration>

          <div className="mt-4 flex flex-wrap gap-2 px-1">
            <Button variant="secondary" size="sm" onClick={addMany}>
              <Sparkles size={15} />
              {th.addFive}
            </Button>
            <Button variant="secondary" size="sm" onClick={grow} disabled={table.length >= 32}>
              <Expand size={15} />
              {th.double}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTable(createTable(8));
                setHighlight(null);
                setNote((m) => m.emptied);
              }}
            >
              <Trash2 size={15} />
              {t.common.empty}
            </Button>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <Panel eyebrow={t.common.tryThis} title={t.common.threeExperiments}>
            <GuideSteps steps={steps} accent={ACCENT} />
          </Panel>
          <Panel eyebrow={th.workedOut} title={`“${lastKey}”`}>
            <div className="flex flex-wrap gap-1.5">
              {breakdown.codes.map(({ char, code }, i) => (
                <span key={i} className="flex flex-col items-center rounded-lg bg-paper-deep/70 px-2 py-1">
                  <span className="font-mono text-sm text-ink">{char}</span>
                  <span className="font-mono text-[10px] text-ink-mute">{code}</span>
                </span>
              ))}
            </div>
            <p className="mt-3 font-mono text-[13px] leading-relaxed text-ink-soft">
              {th.sum} = {breakdown.sum}
              <br />
              {breakdown.sum} mod {table.length} = <b style={{ color: ACCENT }}>{breakdown.index}</b>
            </p>
            <p className="mt-3 text-xs leading-relaxed text-ink-mute">{th.workedNote}</p>
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <Panel eyebrow={t.common.ideaInAMinute} title={th.ideaTitle}>
          <div className="space-y-3 leading-relaxed text-ink-soft">
            {th.idea.map((p) => (
              <p key={p}>
                <Rich text={p} />
              </p>
            ))}
          </div>
          <div className="mt-5 rounded-2xl p-4 text-[13px] leading-relaxed text-ink-soft" style={{ backgroundColor: SOFT }}>
            <Rich text={th.callout} />
          </div>
        </Panel>
        <Panel eyebrow={t.common.atAGlance} title={t.common.howFast}>
          <FactList facts={th.facts} />
          <p className="mt-4 text-[13px] leading-relaxed text-ink-mute">{th.everyday}</p>
        </Panel>
      </div>
    </div>
  );
}

export default HashTableVisualizer;
