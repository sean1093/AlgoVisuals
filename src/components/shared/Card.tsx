import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  hoverable?: boolean;
}

function Card({ children, onClick, className = '', hoverable = false }: CardProps) {
  const baseClasses = "bg-white rounded-xl border-2 border-borderGray shadow-soft p-6";
  const hoverClasses = hoverable ? "cursor-pointer hover:shadow-soft-md transition-shadow duration-200" : "";

  if (onClick) {
    return (
      <motion.div
        whileHover={{ scale: 1.02, translateY: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`${baseClasses} ${hoverClasses} ${className}`}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`${baseClasses} ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default Card;
