import { ReactNode } from 'react';

interface FactListProps {
  facts: { label: string; value: ReactNode; hint?: string }[];
}

/**
 * Two-column list of short facts (e.g. time and space complexity)
 */
function FactList({ facts }: FactListProps) {
  return (
    <dl className="divide-y divide-line">
      {facts.map(({ label, value, hint }) => (
        <div key={label} className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
          <dt className="text-sm text-ink-soft">
            {label}
            {hint && <span className="block text-xs text-ink-mute">{hint}</span>}
          </dt>
          <dd className="font-mono text-sm text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default FactList;
