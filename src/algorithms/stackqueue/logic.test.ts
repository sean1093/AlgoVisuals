import { describe, expect, it } from 'vitest';
import { add, labelFor, take } from './logic';

describe('stack and queue', () => {
  it('stack gives back the newest, queue the oldest', () => {
    let pair = { stack: [], queue: [] } as Parameters<typeof add>[0];
    for (const [id, label] of ['A', 'B', 'C'].entries()) pair = add(pair, { id, label });
    const out = take(pair);
    expect(out.fromStack?.label).toBe('C');
    expect(out.fromQueue?.label).toBe('A');
    expect(out.pair.stack.map((i) => i.label)).toEqual(['A', 'B']);
    expect(out.pair.queue.map((i) => i.label)).toEqual(['B', 'C']);
  });

  it('taking from empty gives nothing', () => {
    const out = take({ stack: [], queue: [] });
    expect(out.fromStack).toBeUndefined();
    expect(out.fromQueue).toBeUndefined();
  });

  it('labels items like spreadsheet columns', () => {
    expect([0, 1, 25, 26, 27].map(labelFor)).toEqual(['A', 'B', 'Z', 'AA', 'AB']);
  });
});
