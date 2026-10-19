/**
 * A stack and a queue fed the same items, so their difference is easy to see
 */

export interface Item {
  id: number;
  label: string;
}

export interface Pair {
  stack: Item[];
  queue: Item[];
}

/** Add to both: the stack's top and the queue's back are both the end of the array */
export function add(pair: Pair, item: Item): Pair {
  return { stack: [...pair.stack, item], queue: [...pair.queue, item] };
}

/** Remove from both: the stack gives back the newest item, the queue the oldest */
export function take(pair: Pair): { pair: Pair; fromStack?: Item; fromQueue?: Item } {
  return {
    pair: { stack: pair.stack.slice(0, -1), queue: pair.queue.slice(1) },
    fromStack: pair.stack[pair.stack.length - 1],
    fromQueue: pair.queue[0],
  };
}

/** Labels A, B, … Z, then AA, AB, … */
export function labelFor(n: number): string {
  let out = '';
  let k = n;
  do {
    out = String.fromCharCode(65 + (k % 26)) + out;
    k = Math.floor(k / 26) - 1;
  } while (k >= 0);
  return out;
}
