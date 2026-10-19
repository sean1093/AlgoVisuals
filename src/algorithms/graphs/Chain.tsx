import { motion } from 'framer-motion';

interface ChainProps {
  label: string;
  items: string[];
  color: string;
  soft: string;
  empty: string;
  /** Draw arrows between items */
  arrows?: boolean;
}

/**
 * A labelled row of small tiles, e.g. a queue or an output order
 */
function Chain({ label, items, color, soft, empty, arrows = false }: ChainProps) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">{label}</p>
      <div className="flex min-h-9 flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <motion.span
            layout
            key={item}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5"
          >
            {arrows && i > 0 && <span className="text-xs text-ink-mute">→</span>}
            <span className="flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-semibold" style={{ backgroundColor: soft, color }}>
              {item}
            </span>
          </motion.span>
        ))}
        {items.length === 0 && <span className="text-sm text-ink-mute">{empty}</span>}
      </div>
    </div>
  );
}

export default Chain;
