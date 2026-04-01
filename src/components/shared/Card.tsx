import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  hoverable?: boolean;
}

function Card({ children, onClick, className = '', hoverable = false }: CardProps) {
  const baseClasses = "bg-white rounded-2xl border border-borderGray shadow-soft p-8";
  const hoverClasses = hoverable ? "cursor-pointer hover:shadow-soft-lg hover:border-accentBlue/30 transition-all duration-300" : "";

  if (onClick) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`${baseClasses} ${hoverClasses} ${className}`}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`${baseClasses} ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default Card;
