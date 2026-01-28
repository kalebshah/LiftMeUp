import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakFlameProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const StreakFlame: React.FC<StreakFlameProps> = ({
  streak,
  size = 'md',
  showLabel = true,
}) => {
  const sizeStyles = {
    sm: { icon: 'w-5 h-5', text: 'text-sm', container: 'gap-1' },
    md: { icon: 'w-6 h-6', text: 'text-base', container: 'gap-1.5' },
    lg: { icon: 'w-8 h-8', text: 'text-lg', container: 'gap-2' },
  };
  
  const styles = sizeStyles[size];
  const isActive = streak > 0;
  
  return (
    <div className={`flex items-center ${styles.container}`}>
      <motion.div
        animate={isActive ? {
          scale: [1, 1.1, 1],
          rotate: [-2, 2, -2],
        } : {}}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        className="relative"
      >
        <Flame
          className={`${styles.icon} ${
            isActive ? 'text-orange-500 flame-icon' : 'text-dark-500'
          }`}
          fill={isActive ? '#f97316' : 'none'}
        />
        {isActive && (
          <motion.div
            className="absolute inset-0 blur-md"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Flame
              className={`${styles.icon} text-orange-500`}
              fill="#f97316"
            />
          </motion.div>
        )}
      </motion.div>
      <div className="flex flex-col">
        <span className={`font-bold ${styles.text} ${isActive ? 'text-orange-400' : 'text-dark-400'}`}>
          {streak}
        </span>
        {showLabel && (
          <span className="text-xs text-dark-400 -mt-0.5">
            {streak === 1 ? 'day' : 'days'}
          </span>
        )}
      </div>
    </div>
  );
};

