interface ChipsProps<T extends string> {
  options: { id: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  accent: string;
  label?: string;
  className?: string;
}

/**
 * A row of pill buttons where one option is selected
 */
function Chips<T extends string>({ options, value, onChange, accent, label, className = '' }: ChipsProps<T>) {
  return (
    <div className={className}>
      {label && <p className="mb-2.5 text-sm font-medium text-ink">{label}</p>}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const active = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.id)}
              className={`rounded-full border px-3 py-1.5 text-[13px] transition-colors ${
                active ? 'border-transparent text-on-accent' : 'border-line text-ink-soft hover:border-line-strong hover:text-ink'
              }`}
              style={active ? { backgroundColor: accent } : undefined}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Chips;
