import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Clock, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WorkoutCard } from '../components/WorkoutCard';
import { Card } from '../components/ui/Card';
import { WORKOUTS } from '../data/workouts';
import { formatDate, formatTimeAgo } from '../utils/helpers';

export const WorkoutSelection: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch, getSuggestedWorkout, getLastWorkoutOfType } = useApp();
  const { selectedDate, workoutLogs } = state;
  
  const suggestedWorkoutId = getSuggestedWorkout();
  
  const lastWorkout = workoutLogs
    .filter(log => log.isComplete)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  
  const handleSelectWorkout = (workoutTypeId: 1 | 2 | 3) => {
    dispatch({
      type: 'START_WORKOUT',
      payload: { workoutTypeId, date: selectedDate },
    });
    navigate('/workout/active');
  };
  
  return (
    <div className="min-h-screen bg-dark-950 bg-mesh">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark-950/80 backdrop-blur-lg border-b border-dark-800/50">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-dark-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-dark-300" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Choose Workout</h1>
            <div className="flex items-center gap-1 text-xs text-dark-400">
              <Calendar className="w-3 h-3" />
              <span>{format(selectedDate, 'EEEE, MMMM d')}</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="px-4 py-6 space-y-6 pb-24">
        {/* Last training info */}
        {lastWorkout && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="glass" padding="sm" className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-dark-200">
                  Last training: <span className="text-white font-medium">{formatDate(lastWorkout.date)}</span> ({formatTimeAgo(lastWorkout.date)})
                </p>
                <p className="text-xs text-dark-400 mt-0.5">
                  Workout #{lastWorkout.workoutTypeId} • {WORKOUTS.find(w => w.id === lastWorkout.workoutTypeId)?.name}
                </p>
              </div>
            </Card>
          </motion.div>
        )}
        
        {/* Workout cards */}
        <div className="space-y-4">
          {WORKOUTS.map((workout, index) => {
            const lastOfType = getLastWorkoutOfType(workout.id);
            const isRecommended = workout.id === suggestedWorkoutId;
            const isBackToBack = lastWorkout?.workoutTypeId === workout.id;
            
            return (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                lastWorkout={lastOfType}
                isRecommended={isRecommended}
                isBackToBack={isBackToBack}
                onClick={() => handleSelectWorkout(workout.id)}
                delay={index * 0.1}
              />
            );
          })}
        </div>
        
        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="default" padding="sm" className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-dark-400 mt-0.5" />
            <div>
              <p className="text-sm text-dark-300">
                <span className="text-white font-medium">Pro tip:</span> Rotate between workouts for balanced muscle recovery
              </p>
              <p className="text-xs text-dark-500 mt-1">
                Each workout targets different muscle groups for optimal growth
              </p>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

