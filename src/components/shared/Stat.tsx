import { ReactNode } from 'react';

interface StatProps {
  label: string;
  value: ReactNode;
  className?: string;
}

/**
 * Compact number with a quiet label beneath it
 */
function Stat({ label, value, className = '' }: StatProps) {
  return (
    <div className={className}>
      <div className="font-display text-3xl leading-none text-ink tabular-nums">{value}</div>
      <div className="mt-1.5 text-xs text-ink-mute">{label}</div>
    </div>
  );
}

export default Stat;
