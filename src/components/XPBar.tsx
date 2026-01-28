import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap } from 'lucide-react';
import { getLevelInfo } from '../utils/helpers';

interface XPBarProps {
  xp: number;
  showDetails?: boolean;
}

export const XPBar: React.FC<XPBarProps> = ({ xp, showDetails = false }) => {
  const levelInfo = getLevelInfo(xp);
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 shadow-lg shadow-accent-500/30">
            <Star className="w-4 h-4 text-white" fill="white" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">
              Level {levelInfo.level}
            </span>
            <span className="text-xs text-dark-400 ml-1.5">
              {levelInfo.title}
            </span>
          </div>
        </div>
        {showDetails && (
          <div className="flex items-center gap-1 text-accent-400">
            <Zap className="w-4 h-4" fill="currentColor" />
            <span className="text-sm font-semibold">{xp.toLocaleString()} XP</span>
          </div>
        )}
      </div>
      
      <div className="relative h-3 bg-dark-700 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-500 to-accent-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${levelInfo.progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${levelInfo.progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      
      {showDetails && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-dark-400">
            {levelInfo.currentXP.toLocaleString()} / {levelInfo.nextLevelXP.toLocaleString()} XP
          </span>
          <span className="text-xs text-dark-400">
            {Math.round(levelInfo.progress)}%
          </span>
        </div>
      )}
    </div>
  );
};

