import { describe, expect, it } from 'vitest';
import { findPrefix, insert, layout, prefixes } from './logic';

describe('trie', () => {
  it('shares prefixes between words', () => {
    expect(prefixes(['car', 'cat']).size).toBe(5); // '', c, ca, car, cat
  });

  it('inserts a word, creating only the missing nodes', () => {
    const frames = insert(['car'], 'cart');
    expect(frames.filter((f) => f.created)).toHaveLength(1);
    expect(frames.at(-1)!.words).toEqual(['car', 'cart']);
  });

  it('marks a word hidden inside another without growing', () => {
    const frames = insert(['cart'], 'car');
    expect(frames.some((f) => f.created)).toBe(false);
    expect(frames.at(-1)!.words).toEqual(['car', 'cart']);
  });

  it('does not duplicate an existing word', () => {
    expect(insert(['car'], 'car').at(-1)!.words).toEqual(['car']);
  });

  it('finds every word under a prefix', () => {
    const words = ['car', 'cart', 'cat', 'dog'];
    expect(findPrefix(words, 'ca').at(-1)!.matches).toEqual(['car', 'cart', 'cat']);
    expect(findPrefix(words, 'cow').at(-1)!.missing).toBe('co');
  });

  it('lays the root out over its children', () => {
    const nodes = layout(prefixes(['ab', 'b']));
    const root = nodes.find((n) => n.prefix === '')!;
    expect(root.x).toBeCloseTo(0.5);
    expect(nodes.every((n) => n.x > 0 && n.x < 1)).toBe(true);
  });
});
