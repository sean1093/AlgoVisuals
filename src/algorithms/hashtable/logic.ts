/**
 * A tiny hash table with separate chaining and a deliberately simple hash:
 * the sum of the letter codes, modulo the number of buckets.
 */

export type Table = string[][];

export interface HashBreakdown {
  codes: { char: string; code: number }[];
  sum: number;
  index: number;
}

export function hashOf(key: string, buckets: number): HashBreakdown {
  const codes = [...key].map((char) => ({ char, code: char.charCodeAt(0) }));
  const sum = codes.reduce((s, c) => s + c.code, 0);
  return { codes, sum, index: sum % buckets };
}

export function createTable(buckets: number): Table {
  return Array.from({ length: buckets }, () => []);
}

export function add(table: Table, key: string): { table: Table; bucket: number; existed: boolean; collision: boolean } {
  const bucket = hashOf(key, table.length).index;
  if (table[bucket].includes(key)) return { table, bucket, existed: true, collision: false };
  const next = table.map((chain, i) => (i === bucket ? [...chain, key] : chain));
  return { table: next, bucket, existed: false, collision: table[bucket].length > 0 };
}

export function find(table: Table, key: string): { bucket: number; position: number; checked: number } {
  const bucket = hashOf(key, table.length).index;
  const position = table[bucket].indexOf(key);
  return { bucket, position, checked: position === -1 ? table[bucket].length : position + 1 };
}

export function remove(table: Table, key: string): { table: Table; bucket: number; removed: boolean } {
  const { bucket, position } = find(table, key);
  if (position === -1) return { table, bucket, removed: false };
  return { table: table.map((chain, i) => (i === bucket ? chain.filter((k) => k !== key) : chain)), bucket, removed: true };
}

/**
 * Move every key into a table with a different number of buckets
 */
export function resize(table: Table, buckets: number): Table {
  let next = createTable(buckets);
  for (const chain of table) for (const key of chain) next = add(next, key).table;
  return next;
}

export function stats(table: Table) {
  const items = table.reduce((s, c) => s + c.length, 0);
  return {
    items,
    buckets: table.length,
    load: items / table.length,
    longest: Math.max(0, ...table.map((c) => c.length)),
    empty: table.filter((c) => c.length === 0).length,
  };
}
