import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ControlPanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

function ControlPanel({ title, children, className = '' }: ControlPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`bg-white rounded-2xl border border-borderGray shadow-soft p-7 ${className}`}
    >
      {title && (
        <h3 className="text-base font-semibold mb-5 pb-3 border-b border-borderGray/50 text-textPrimary">
          {title}
        </h3>
      )}
      <div className="space-y-5">
        {children}
      </div>
    </motion.div>
  );
}

export default ControlPanel;
