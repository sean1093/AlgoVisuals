interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  className = ''
}: SliderProps) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-textPrimary">{label}</label>
        <span className="text-sm font-semibold text-accentBlue bg-pastelBlue px-2.5 py-0.5 rounded-lg">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-borderGray/20 rounded-full appearance-none cursor-pointer accent-accentBlue"
      />
      <div className="flex justify-between text-xs text-textSecondary font-light">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export default Slider;
