import { SortFrame } from './logic';

export const BAR_COLORS = {
  idle: 'var(--bar-idle)',
  range: 'var(--bar-range)',
  compare: 'var(--accent-sorting)',
  swap: 'var(--color-clay)',
  pivot: 'var(--accent-searching)',
  sorted: 'var(--color-sage)',
};

/** Colours shown in the legend, in order (labels come from the dictionary) */
export const LEGEND_KEYS = ['compare', 'swap', 'pivot', 'sorted'] as const;

export function barColor(frame: SortFrame, i: number, sorted: Set<number>) {
  if (frame.swap?.includes(i) || frame.write === i) return BAR_COLORS.swap;
  if (frame.compare?.includes(i)) return BAR_COLORS.compare;
  if (frame.pivot === i) return BAR_COLORS.pivot;
  if (sorted.has(i)) return BAR_COLORS.sorted;
  if (frame.range && i >= frame.range[0] && i <= frame.range[1]) return BAR_COLORS.range;
  return BAR_COLORS.idle;
}

interface BarsProps {
  frame: SortFrame;
  max?: number;
  showValues?: boolean;
  className?: string;
}

/**
 * Bar chart of one sorting frame
 */
function Bars({ frame, max = 100, showValues = false, className = '' }: BarsProps) {
  const sorted = new Set(frame.sorted);
  const n = frame.array.length;
  const gap = n > 30 ? 2 : n > 16 ? 4 : 6;

  return (
    <div className={`flex items-end ${showValues ? 'pt-6' : ''} ${className}`} style={{ gap }}>
      {frame.array.map((value, i) => {
        const color = barColor(frame, i, sorted);
        return (
          <div key={i} className="flex h-full min-w-0 flex-1 flex-col justify-end">
            <div
              className="relative rounded-t-md transition-[height,background-color] duration-150 ease-out"
              style={{ height: `${(value / max) * 100}%`, backgroundColor: color }}
            >
              {showValues && (
                <span className="absolute inset-x-0 -top-5 text-center text-[11px] tabular-nums text-ink-mute">{value}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Bars;
