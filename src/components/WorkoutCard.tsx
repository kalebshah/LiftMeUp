import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, AlertTriangle, Clock, TrendingUp, Dumbbell } from 'lucide-react';
import type { WorkoutDefinition, WorkoutLog } from '../types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { formatDate, formatVolume, formatDuration } from '../utils/helpers';

interface WorkoutCardProps {
  workout: WorkoutDefinition;
  lastWorkout: WorkoutLog | null;
  isRecommended?: boolean;
  isBackToBack?: boolean;
  onClick: () => void;
  delay?: number;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  lastWorkout,
  isRecommended = false,
  isBackToBack = false,
  onClick,
  delay = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsExpanded(!isExpanded);
  };

  const handleCardClick = () => {
    onClick();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card
        variant="elevated"
        padding="none"
        className="overflow-hidden"
      >
        {/* Header with gradient - clickable to start workout */}
        <div
          className={`bg-gradient-to-r ${workout.color} p-4 cursor-pointer hover:opacity-90 transition-opacity`}
          onClick={handleCardClick}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{workout.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    Workout {workout.id}
                  </h3>
                  {isRecommended && (
                    <Badge variant="success" size="sm">
                      Suggested
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-white/80">{workout.name}</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-white/60" />
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {/* Description - clickable */}
          <p
            className="text-sm text-dark-300 mb-3 cursor-pointer hover:text-dark-200 transition-colors"
            onClick={handleCardClick}
          >
            {workout.description}
          </p>

          {/* Exercise count with dropdown toggle */}
          <div className="flex items-center justify-between mb-3">
            <div
              className="flex items-center gap-4 text-sm text-dark-400 cursor-pointer hover:text-dark-300 transition-colors"
              onClick={handleCardClick}
            >
              <span>{workout.exercises.length} exercises</span>
              <span>•</span>
              <span>{workout.exercises.reduce((sum, ex) => sum + ex.sets, 0)} sets</span>
            </div>
            <button
              onClick={handleToggleExpand}
              className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors z-10"
            >
              <span>{isExpanded ? 'Hide' : 'View'} exercises</span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </button>
          </div>

          {/* Expandable exercise list */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-3 overflow-hidden"
              >
                <div className="bg-dark-800/50 rounded-xl p-3 space-y-2">
                  {workout.exercises.map((exercise, idx) => (
                    <motion.div
                      key={exercise.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Dumbbell className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-dark-200 font-medium">{exercise.name}</p>
                        <p className="text-dark-400 text-xs">
                          {exercise.sets} sets × {exercise.repRange[0]}-{exercise.repRange[1]} reps • {exercise.weightRange[0]}-{exercise.weightRange[1]} {exercise.unit}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Last workout info - clickable */}
          {lastWorkout && (
            <div
              className="bg-dark-800/50 rounded-xl p-3 space-y-2 cursor-pointer hover:bg-dark-800/70 transition-colors"
              onClick={handleCardClick}
            >
              <div className="flex items-center gap-2 text-xs text-dark-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Last: {formatDate(lastWorkout.date)}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-success-400" />
                  <span className="text-sm font-medium text-dark-200">
                    {formatVolume(lastWorkout.totalVolume)}
                  </span>
                </div>
                <span className="text-sm text-dark-400">
                  {formatDuration(lastWorkout.duration)}
                </span>
              </div>
            </div>
          )}

          {/* Warning for back-to-back - clickable */}
          {isBackToBack && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg cursor-pointer hover:bg-yellow-500/15 transition-colors"
              onClick={handleCardClick}
            >
              <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <span className="text-xs text-yellow-400">
                You did this workout last time. Consider switching it up!
              </span>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

