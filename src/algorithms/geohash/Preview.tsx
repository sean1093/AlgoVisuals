/**
 * Decorative GeoHash illustration: nested cells zooming into a pin
 */
function GeoHashPreview({ className = '' }: { className?: string }) {
  const cells = [0, 1, 2, 3];
  return (
    <svg viewBox="-2 -2 104 104" className={className} aria-hidden="true">
      {cells.map((r) =>
        cells.map((c) => (
          <rect
            key={`${r}-${c}`}
            x={c * 25}
            y={r * 25}
            width="25"
            height="25"
            fill={r === 1 && c === 2 ? 'var(--color-clay)' : 'none'}
            fillOpacity="0.12"
            stroke="currentColor"
            strokeOpacity="0.3"
            strokeWidth="0.8"
          />
        ))
      )}
      <rect x="50" y="25" width="12.5" height="12.5" fill="var(--color-clay)" fillOpacity="0.18" stroke="var(--color-clay)" strokeWidth="1" />
      <rect x="56.25" y="31.25" width="6.25" height="6.25" fill="var(--color-clay)" fillOpacity="0.35" />
      <circle cx="59" cy="34" r="2.6" fill="var(--color-clay)" stroke="var(--color-card)" strokeWidth="1.2" />
      <text x="50" y="88" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="currentColor" fillOpacity="0.7" letterSpacing="2">
        wsqq
      </text>
    </svg>
  );
}

export default GeoHashPreview;
