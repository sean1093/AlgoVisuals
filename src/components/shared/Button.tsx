import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
}

function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = ''
}: ButtonProps) {
  const baseClasses = "px-5 py-2.5 rounded-xl border font-medium transition-all duration-300 text-sm";

  const variantClasses = {
    primary: "bg-accentBlue text-white border-accentBlue hover:bg-accentBlue/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft",
    secondary: "bg-white text-textPrimary border-borderGray hover:border-accentBlue/30 hover:bg-pastelBlue/30 disabled:opacity-50 disabled:cursor-not-allowed",
  };

  return (
    <motion.button
      whileHover={!disabled ? { y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}

export default Button;
