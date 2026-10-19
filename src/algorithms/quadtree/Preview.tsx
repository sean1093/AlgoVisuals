/**
 * Decorative QuadTree illustration for cards and the hero
 */
const LINES = [
  'M0 50H100', 'M50 0V100',
  'M50 25H100', 'M75 0V50',
  'M75 12.5H100', 'M87.5 0V25',
  'M0 75H50', 'M25 50V100',
  'M25 87.5H50', 'M37.5 75V100',
];

const POINTS = [
  [80, 6], [93, 18], [82, 19], [94, 7], [62, 14], [60, 38], [88, 40],
  [30, 92], [44, 82], [42, 95], [12, 60], [36, 60], [15, 20], [70, 78],
];

function QuadTreePreview({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="-2 -2 104 104" className={className} aria-hidden="true">
      <rect x="0" y="0" width="100" height="100" rx="3" fill="none" stroke="currentColor" strokeOpacity="0.35" />
      <rect x="75" y="0" width="25" height="25" fill="var(--color-sage)" fillOpacity="0.12" />
      {LINES.map((d) => (
        <path key={d} d={d} stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.8" />
      ))}
      {POINTS.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" fill="var(--color-sage)" />
      ))}
    </svg>
  );
}

export default QuadTreePreview;
