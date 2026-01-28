import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, SkipForward } from 'lucide-react';
import { formatRestTime, vibrate, playSound } from '../utils/helpers';
import { ProgressRing } from './ui/ProgressRing';
import { Button } from './ui/Button';

interface RestTimerProps {
  timeRemaining: number;
  totalTime: number;
  onSkip: () => void;
  onTick: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  timeRemaining,
  totalTime,
  onSkip,
  onTick,
}) => {
  const progress = ((totalTime - timeRemaining) / totalTime) * 100;
  
  useEffect(() => {
    if (timeRemaining <= 0) {
      vibrate([100, 50, 100]);
      playSound('complete');
      return;
    }
    
    const timer = setInterval(() => {
      onTick();
      if (timeRemaining <= 4 && timeRemaining > 0) {
        playSound('tick');
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, onTick]);
  
  const isAlmostDone = timeRemaining <= 5;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-8"
    >
      <p className="text-dark-400 text-sm font-medium mb-4">Rest Time</p>
      
      <ProgressRing
        progress={progress}
        size={180}
        strokeWidth={10}
        color={isAlmostDone ? '#10b981' : '#f97316'}
      >
        <div className="flex flex-col items-center">
          <motion.span
            key={timeRemaining}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-5xl font-bold font-mono ${
              isAlmostDone ? 'text-success-400' : 'text-white'
            }`}
          >
            {formatRestTime(timeRemaining)}
          </motion.span>
          <span className="text-dark-400 text-sm mt-1">remaining</span>
        </div>
      </ProgressRing>
      
      <div className="flex gap-3 mt-8">
        <Button
          variant="secondary"
          size="lg"
          onClick={onSkip}
          leftIcon={<SkipForward className="w-5 h-5" />}
        >
          Skip Rest
        </Button>
        {timeRemaining <= 0 && (
          <Button
            variant="success"
            size="lg"
            onClick={onSkip}
            leftIcon={<Play className="w-5 h-5" />}
          >
            Continue
          </Button>
        )}
      </div>
      
      <p className="text-dark-500 text-xs mt-4 text-center max-w-[250px]">
        {timeRemaining > 30
          ? 'Take your time. Proper rest = better gains 💪'
          : timeRemaining > 0
          ? 'Almost there! Get ready for your next set'
          : "Rest complete! Let's crush that next set!"}
      </p>
    </motion.div>
  );
};

