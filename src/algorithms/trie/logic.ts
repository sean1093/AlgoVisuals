/**
 * A trie (prefix tree) built from a set of words; nodes are identified by their prefix
 */

export interface TrieFrame {
  words: string[];
  /** A prefix whose nodes exist even if no word uses it yet (mid-insert) */
  partial?: string;
  /** The prefix we're standing on */
  at?: string;
  /** The node just created */
  created?: string;
  /** Words found under a searched prefix */
  matches?: string[];
  /** The search ran off the tree here */
  missing?: string;
  note: string;
}

/**
 * Plain-language step descriptions; English by default, swapped for a translation by the UI
 */
export const TRIE_MESSAGES = {
  start: 'Start at the root, the empty prefix.',
  follow: (letter: string) => `There’s already a branch for “${letter}” — follow it, no new node needed.`,
  create: (letter: string) => `No branch for “${letter}” yet, so grow one.`,
  marked: (word: string) => `Mark the last node: “${word}” is a whole word.`,
  already: (word: string) => `“${word}” was already marked. Nothing to add.`,
  sharedAll: (word: string) => `“${word}” used only existing branches — it was hiding inside a longer word.`,
  look: (letter: string) => `Is there a branch for “${letter}”?`,
  dead: (prefix: string) => `No branch — no word starts with “${prefix}”.`,
  matches: (prefix: string, count: number) => `Everything below this node starts with “${prefix}”: ${count} word(s).`,
};

export type TrieMessages = typeof TRIE_MESSAGES;

export function prefixes(words: string[], partial?: string): Set<string> {
  const set = new Set<string>(['']);
  for (const w of partial ? [...words, partial] : words) for (let i = 1; i <= w.length; i++) set.add(w.slice(0, i));
  return set;
}

export function insert(words: string[], word: string, m: TrieMessages = TRIE_MESSAGES): TrieFrame[] {
  const existing = prefixes(words);
  const frames: TrieFrame[] = [{ words, at: '', note: m.start }];
  let grew = false;
  for (let i = 1; i <= word.length; i++) {
    const p = word.slice(0, i);
    const letter = word[i - 1];
    if (existing.has(p)) frames.push({ words, partial: p, at: p, note: m.follow(letter) });
    else {
      grew = true;
      frames.push({ words, partial: p, at: p, created: p, note: m.create(letter) });
    }
  }
  if (words.includes(word)) {
    frames.push({ words, at: word, note: m.already(word) });
    return frames;
  }
  const next = [...words, word].sort();
  frames.push({ words: next, at: word, note: grew ? m.marked(word) : m.sharedAll(word) });
  return frames;
}

export function findPrefix(words: string[], prefix: string, m: TrieMessages = TRIE_MESSAGES): TrieFrame[] {
  const existing = prefixes(words);
  const frames: TrieFrame[] = [{ words, at: '', note: m.start }];
  for (let i = 1; i <= prefix.length; i++) {
    const p = prefix.slice(0, i);
    frames.push({ words, at: p.slice(0, -1), note: m.look(p[i - 1]) });
    if (!existing.has(p)) {
      frames.push({ words, at: p.slice(0, -1), missing: p, note: m.dead(p) });
      return frames;
    }
  }
  const matches = words.filter((w) => w.startsWith(prefix));
  frames.push({ words, at: prefix, matches, note: m.matches(prefix, matches.length) });
  return frames;
}

export interface TrieLayoutNode {
  prefix: string;
  depth: number;
  /** 0–1 */
  x: number;
}

/** Leaves are spread evenly; each parent sits above the middle of its children */
export function layout(nodes: Set<string>): TrieLayoutNode[] {
  const children = new Map<string, string[]>();
  for (const p of nodes) {
    if (!p) continue;
    const parent = p.slice(0, -1);
    children.set(parent, [...(children.get(parent) ?? []), p]);
  }
  for (const list of children.values()) list.sort();
  const leaves: string[] = [];
  const walk = (p: string) => {
    const kids = children.get(p);
    if (!kids) leaves.push(p);
    else kids.forEach(walk);
  };
  walk('');
  const x = new Map<string, number>();
  const place = (p: string): number => {
    const kids = children.get(p);
    const v = kids ? kids.map(place).reduce((a, b) => a + b, 0) / kids.length : (leaves.indexOf(p) + 0.5) / leaves.length;
    x.set(p, v);
    return v;
  };
  place('');
  return [...nodes].map((p) => ({ prefix: p, depth: p.length, x: x.get(p)! }));
}
