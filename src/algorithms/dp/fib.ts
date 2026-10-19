/**
 * Fibonacci by plain recursion vs. with a memo, recorded as a growing call tree
 */

export interface Call {
  id: number;
  n: number;
  parent: number | null;
  depth: number;
  /** Set once the call has returned */
  value?: number;
  /** Answered from the memo, no further calls */
  memo?: boolean;
  /** Plain recursion only: this n was already worked out earlier */
  repeat?: boolean;
}

export interface FibFrame {
  calls: Call[];
  current: number;
  memo: Record<number, number>;
  note: string;
}

/**
 * Plain-language step descriptions; English by default, swapped for a translation by the UI
 */
export const FIB_MESSAGES = {
  call: (n: number) => `fib(${n}) needs fib(${n - 1}) and fib(${n - 2}). Ask for them.`,
  repeat: (n: number) => `fib(${n}) again! Plain recursion has no memory, so it works it out from scratch.`,
  base: (n: number) => `fib(${n}) is a starting value: ${n}. No more calls needed.`,
  hit: (n: number, v: number) => `fib(${n}) is already in the memo: ${v}. Reuse it instead of recomputing.`,
  ret: (n: number, v: number) => `Both answers are back, so fib(${n}) = ${v}. Hand it up.`,
  done: (n: number, v: number, calls: number) => `fib(${n}) = ${v}, using ${calls} calls.`,
};

export type FibMessages = typeof FIB_MESSAGES;

export function fib(n: number, useMemo: boolean, m: FibMessages = FIB_MESSAGES): FibFrame[] {
  const calls: Call[] = [];
  const memo: Record<number, number> = {};
  const seen = new Set<number>();
  const frames: FibFrame[] = [];
  const snap = (current: number, note: string) => frames.push({ calls: calls.map((c) => ({ ...c })), current, memo: { ...memo }, note });

  const run = (k: number, parent: number | null, depth: number): number => {
    const call: Call = { id: calls.length, n: k, parent, depth };
    calls.push(call);
    if (useMemo && k in memo) {
      call.value = memo[k];
      call.memo = true;
      snap(call.id, m.hit(k, memo[k]));
      return memo[k];
    }
    if (k < 2) {
      call.value = k;
      memo[k] = k;
      snap(call.id, m.base(k));
      return k;
    }
    call.repeat = !useMemo && seen.has(k);
    snap(call.id, call.repeat ? m.repeat(k) : m.call(k));
    const v = run(k - 1, call.id, depth + 1) + run(k - 2, call.id, depth + 1);
    call.value = v;
    memo[k] = v;
    seen.add(k);
    snap(call.id, m.ret(k, v));
    return v;
  };
  const v = run(n, null, 0);
  frames.push({ ...frames[frames.length - 1], current: 0, note: m.done(n, v, calls.length) });
  return frames;
}

/** Number of calls plain recursion makes for fib(n): 2·fib(n + 1) − 1 */
export function plainCalls(n: number): number {
  let [a, b] = [0, 1];
  for (let i = 0; i < n + 1; i++) [a, b] = [b, a + b];
  return 2 * a - 1;
}
