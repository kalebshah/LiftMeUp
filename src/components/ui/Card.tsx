import React from 'react';
import { motion } from 'framer-motion';
import { classNames } from '../../utils/helpers';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  animate?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  onClick,
  animate = false,
}) => {
  const variantStyles = {
    default: 'bg-dark-900/80 backdrop-blur-sm border border-dark-700/50',
    elevated: 'bg-dark-800/90 backdrop-blur-sm border border-dark-600/50 shadow-xl',
    glass: 'bg-dark-900/40 backdrop-blur-md border border-dark-700/30',
  };
  
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  const Component = animate ? motion.div : 'div';
  const animateProps = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  } : {};
  
  return (
    <Component
      className={classNames(
        'rounded-2xl',
        variantStyles[variant],
        paddingStyles[padding],
        onClick && 'cursor-pointer hover:bg-dark-800/90 active:scale-[0.98] transition-all duration-200',
        className
      )}
      onClick={onClick}
      {...animateProps}
    >
      {children}
    </Component>
  );
};

