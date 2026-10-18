import { ReactNode } from 'react';

interface PanelProps {
  /** Small caps label above the content */
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Soft card used for side panels and info blocks
 */
function Panel({ eyebrow, title, children, className = '' }: PanelProps) {
  return (
    <section className={`rounded-3xl border border-line bg-card p-6 shadow-card ${className}`}>
      {eyebrow && (
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">{eyebrow}</p>
      )}
      {title && <h3 className="mb-4 font-display text-xl text-ink">{title}</h3>}
      {children}
    </section>
  );
}

export default Panel;
