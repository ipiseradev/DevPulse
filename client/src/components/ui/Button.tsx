'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { ReactNode, MouseEvent } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

const variantClasses = {
  primary: `
    bg-blue-500 text-white
    hover:bg-blue-600
    border border-transparent
  `,
  secondary: `
    bg-zinc-800 text-white 
    border border-zinc-700
    hover:bg-zinc-700 hover:border-zinc-600
  `,
  danger: `
    bg-red-500/10 text-red-400 
    border border-red-500/20
    hover:bg-red-500/20
  `,
  ghost: `
    bg-transparent text-zinc-400
    hover:bg-zinc-800 hover:text-white
    border border-transparent
  `,
  outline: `
    bg-transparent text-zinc-300
    border border-zinc-700
    hover:bg-zinc-800 hover:border-zinc-600
  `,
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 rounded-lg gap-2',
  lg: 'px-6 py-3 rounded-lg gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  type = 'button',
  onClick,
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`
        inline-flex items-center justify-center font-medium
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </motion.button>
  );
}
