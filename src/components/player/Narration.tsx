import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface NarrationProps {
  /** Changing this key fades the new text in */
  stepKey: string | number;
  children: ReactNode;
  accent: string;
  className?: string;
}

/**
 * One plain-language sentence describing the current step
 */
function Narration({ stepKey, children, accent, className = '' }: NarrationProps) {
  return (
    <div className={`flex min-h-[3.25rem] items-center gap-3 rounded-2xl bg-paper/70 px-4 py-3 ${className}`} aria-live="polite">
      <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: accent }} />
      <motion.p
        key={stepKey}
        initial={{ opacity: 0.35 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="text-[15px] leading-snug text-ink"
      >
        {children}
      </motion.p>
    </div>
  );
}

export default Narration;
