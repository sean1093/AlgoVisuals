import { describe, expect, it } from 'vitest';
import { add, createTable, find, hashOf, remove, resize, stats } from './logic';

const WORDS = ['cat', 'dog', 'owl', 'fox', 'bee', 'yak', 'emu', 'listen', 'silent', 'ant', 'eel', 'koi'];

describe('hash table', () => {
  it('hashes by summing letter codes', () => {
    const h = hashOf('cat', 8);
    expect(h.sum).toBe(99 + 97 + 116);
    expect(h.index).toBe(312 % 8);
  });

  it('anagrams always collide with this hash', () => {
    expect(hashOf('listen', 16).index).toBe(hashOf('silent', 16).index);
  });

  it('finds everything it stores and nothing else', () => {
    let table = createTable(8);
    for (const w of WORDS) table = add(table, w).table;
    for (const w of WORDS) expect(find(table, w).position).toBeGreaterThanOrEqual(0);
    expect(find(table, 'zebra').position).toBe(-1);
    expect(stats(table).items).toBe(WORDS.length);
  });

  it('ignores duplicates and reports collisions', () => {
    let table = createTable(8);
    table = add(table, 'listen').table;
    const again = add(table, 'listen');
    expect(again.existed).toBe(true);
    expect(again.table).toBe(table);
    expect(add(table, 'silent').collision).toBe(true);
  });

  it('removes keys without touching others', () => {
    let table = createTable(4);
    for (const w of WORDS) table = add(table, w).table;
    const { table: after, removed } = remove(table, 'fox');
    expect(removed).toBe(true);
    expect(find(after, 'fox').position).toBe(-1);
    expect(stats(after).items).toBe(WORDS.length - 1);
    expect(remove(after, 'fox').removed).toBe(false);
  });

  it('resizing keeps every key findable and lowers the load', () => {
    let table = createTable(4);
    for (const w of WORDS) table = add(table, w).table;
    const bigger = resize(table, 16);
    expect(stats(bigger).items).toBe(WORDS.length);
    expect(stats(bigger).load).toBeLessThan(stats(table).load);
    for (const w of WORDS) expect(find(bigger, w).position).toBeGreaterThanOrEqual(0);
  });
});
