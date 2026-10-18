interface LegendProps {
  items: { color: string; label: string; shape?: 'dot' | 'square' }[];
  className?: string;
}

/**
 * Small colour key
 */
function Legend({ items, className = '' }: LegendProps) {
  return (
    <ul className={`flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink-soft ${className}`}>
      {items.map(({ color, label, shape = 'square' }) => (
        <li key={label} className="flex items-center gap-1.5">
          <span
            className={`h-2.5 w-2.5 ${shape === 'dot' ? 'rounded-full' : 'rounded-[3px]'}`}
            style={{ backgroundColor: color }}
          />
          {label}
        </li>
      ))}
    </ul>
  );
}

export default Legend;
