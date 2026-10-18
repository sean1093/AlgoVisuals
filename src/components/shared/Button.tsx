import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  disabled?: boolean;
  title?: string;
  type?: 'button' | 'submit';
  className?: string;
}

function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  title,
  type = 'button',
  className = ''
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 select-none ' +
    'disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]';

  const sizeClasses = {
    sm: 'h-9 px-3.5 text-[13px]',
    md: 'h-11 px-5 text-sm',
  };

  const variantClasses = {
    primary: 'bg-ink text-paper hover:bg-ink/85 shadow-card',
    secondary: 'bg-card text-ink border border-line hover:border-line-strong hover:bg-paper',
    ghost: 'text-ink-soft hover:text-ink hover:bg-paper-deep',
  };

  return (
    <button
      type={type}
      title={title}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
