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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`bg-white rounded-xl border-2 border-borderGray shadow-soft p-6 ${className}`}
    >
      {title && (
        <h3 className="text-lg font-bold mb-4 pb-2 border-b-2 border-gray-200">
          {title}
        </h3>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </motion.div>
  );
}

export default ControlPanel;
