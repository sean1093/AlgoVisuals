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
  const baseClasses = "px-4 py-2 rounded-xl border-2 font-medium transition-all duration-200";

  const variantClasses = {
    primary: "bg-pastelBlue border-borderBlue hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-white border-borderGray hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}

export default Button;
