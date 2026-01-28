import React from 'react';
import { motion } from 'framer-motion';
import { classNames } from '../../utils/helpers';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  pulse = false,
  className,
}) => {
  const variantStyles = {
    default: 'bg-dark-700 text-dark-200',
    primary: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
    success: 'bg-success-500/20 text-success-400 border border-success-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    accent: 'bg-accent-500/20 text-accent-400 border border-accent-500/30',
  };
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };
  
  return (
    <motion.span
      className={classNames(
        'inline-flex items-center font-medium rounded-full',
        variantStyles[variant],
        sizeStyles[size],
        pulse && 'animate-pulse-fast',
        className
      )}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      {children}
    </motion.span>
  );
};

