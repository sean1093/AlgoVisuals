import { CSSProperties, ReactNode, useId } from 'react';

interface SliderProps {
  label: string;
  /** Optional helper line under the label */
  hint?: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** Text at each end of the track, e.g. "Coarse" / "Precise" */
  minLabel?: string;
  maxLabel?: string;
  accent?: string;
  className?: string;
}

function Slider({
  label,
  hint,
  value,
  min,
  max,
  step = 1,
  onChange,
  minLabel,
  maxLabel,
  accent = '#1f1d1a',
  className = ''
}: SliderProps) {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">{label}</label>
        <span
          className="font-display text-2xl leading-none tabular-nums"
          style={{ color: accent }}
        >
          {value}
        </span>
      </div>
      {hint && <p className="text-[13px] leading-snug text-ink-mute">{hint}</p>}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range mt-1"
        style={{ '--fill': `${fill}%`, '--accent': accent } as CSSProperties}
      />
      <div className="flex justify-between text-xs text-ink-mute">
        <span>{minLabel ?? min}</span>
        <span>{maxLabel ?? max}</span>
      </div>
    </div>
  );
}

export default Slider;
