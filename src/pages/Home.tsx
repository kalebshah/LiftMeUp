import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format, isSameDay } from 'date-fns';
import {
  Dumbbell,
  ChevronRight,
  Zap,
  Clock,
  TrendingUp,
  Sparkles,
  Calendar,
  Trash2,
  Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CalendarStrip } from '../components/CalendarStrip';
import { StreakFlame } from '../components/StreakFlame';
import { XPBar } from '../components/XPBar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { WORKOUTS, MOTIVATIONAL_QUOTES } from '../data/workouts';
import * as storage from '../utils/storage';
import {
  formatDate,
  formatDuration,
  formatVolume,
  getGreeting,
  getRandomItem
} from '../utils/helpers';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch, getSuggestedWorkout, getWeeklyStats, switchProfile } = useApp();
  const { user, workoutLogs } = state;
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
  const currentProfile = storage.getProfiles().find(p => p.id === storage.getCurrentProfileId());
  
  const suggestedWorkoutId = getSuggestedWorkout();
  const suggestedWorkout = WORKOUTS.find(w => w.id === suggestedWorkoutId)!;
  const weeklyStats = getWeeklyStats();
  
  // Get the most recent workout (completed or ongoing)
  const latestWorkout = workoutLogs
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  // Prioritize ongoing workout if it exists
  const ongoingWorkout = workoutLogs.find(log => !log.isComplete);
  const displayWorkout = ongoingWorkout || (latestWorkout?.isComplete ? latestWorkout : null);

  const todayHasWorkout = workoutLogs.some(
    log => log.isComplete && isSameDay(new Date(log.date), state.selectedDate)
  );
  
  const motivationalQuote = getRandomItem(MOTIVATIONAL_QUOTES.preWorkout);

  const handleDeleteWorkout = (workoutId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkoutToDelete(workoutId);
  };

  const confirmDeleteWorkout = () => {
    if (workoutToDelete) {
      dispatch({ type: 'DELETE_WORKOUT', payload: workoutToDelete });
      setWorkoutToDelete(null);
    }
  };

  if (state.isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Dumbbell className="w-12 h-12 text-primary-500" />
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-dark-950 bg-mesh pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark-950/80 backdrop-blur-lg border-b border-dark-800/50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30"
              >
                <Dumbbell className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold text-white">LiftMeUp</h1>
                <div className="flex items-center gap-2">
                  {currentProfile && (
                    <span className="text-2xl">{currentProfile.avatar}</span>
                  )}
                  <p className="text-xs text-dark-400">{getGreeting()}, {user.name}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={switchProfile}
                className="p-2 rounded-xl hover:bg-dark-800 transition-colors"
                title="Switch Profile"
              >
                <Users className="w-5 h-5 text-dark-400" />
              </button>
              <StreakFlame streak={user.currentStreak} size="sm" />
              <div className="flex items-center gap-1 text-accent-400">
                <Zap className="w-4 h-4" fill="currentColor" />
                <span className="text-sm font-bold">{user.xp}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="px-4 py-6 space-y-6">
        {/* Date display and XP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-dark-400" />
            <span className="text-dark-400 text-sm">
              {format(state.selectedDate, 'EEEE, MMMM d')}
            </span>
          </div>
          <XPBar xp={user.xp} showDetails />
        </motion.div>
        
        {/* Calendar strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CalendarStrip
            selectedDate={state.selectedDate}
            onSelectDate={(date) => dispatch({ type: 'SET_SELECTED_DATE', payload: date })}
          />
        </motion.div>
        
        {/* Weekly Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card variant="elevated" className="overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center p-3 border-r border-dark-700">
                <p className="text-2xl font-bold text-white">{weeklyStats.workouts}</p>
                <p className="text-xs text-dark-400">Workouts</p>
              </div>
              <div className="flex-1 text-center p-3 border-r border-dark-700">
                <p className="text-2xl font-bold text-white">{weeklyStats.sets}</p>
                <p className="text-xs text-dark-400">Sets</p>
              </div>
              <div className="flex-1 text-center p-3">
                <p className="text-2xl font-bold text-primary-400">{formatVolume(weeklyStats.volume)}</p>
                <p className="text-xs text-dark-400">Volume</p>
              </div>
            </div>
          </Card>
        </motion.div>
        
        {/* Suggested Workout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card 
            variant="elevated" 
            padding="none" 
            onClick={() => navigate('/workout/select')}
            className="overflow-hidden"
          >
            <div className={`bg-gradient-to-r ${suggestedWorkout.color} p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">{suggestedWorkout.icon}</span>
                  </div>
                  <div>
                    <Badge variant="success" size="sm" pulse>
                      <Sparkles className="w-3 h-3 mr-1" />
                      Suggested
                    </Badge>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {suggestedWorkout.name}
                    </h3>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-white/60" />
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-dark-300 mb-3">
                {suggestedWorkout.exercises.length} exercises • {suggestedWorkout.exercises.reduce((s, e) => s + e.sets, 0)} sets
              </p>
              <p className="text-xs text-dark-400 italic">
                "{motivationalQuote}"
              </p>
            </div>
          </Card>
          
          <Button
            variant="primary"
            size="xl"
            className="w-full mt-4"
            onClick={() => navigate('/workout/select')}
            leftIcon={<Dumbbell className="w-5 h-5" />}
          >
            {todayHasWorkout ? 'Start Another Workout' : "Start Today's Workout"}
          </Button>
        </motion.div>
        
        {/* Workout History - Show only latest or ongoing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white">Workout History</h2>
            <button
              onClick={() => navigate('/workout-history')}
              className="text-sm text-primary-400 font-medium"
            >
              View All
            </button>
          </div>

          {displayWorkout ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {(() => {
                const workoutDef = WORKOUTS.find(w => w.id === displayWorkout.workoutTypeId)!;
                const isOngoing = !displayWorkout.isComplete;

                return (
                  <Card
                    variant={isOngoing ? "elevated" : "default"}
                    padding="sm"
                    className={`relative group ${isOngoing ? 'border-2 border-primary-500/50' : ''}`}
                  >
                    {isOngoing && (
                      <Badge variant="primary" size="sm" className="absolute top-2 right-2" pulse>
                        In Progress
                      </Badge>
                    )}

                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${workoutDef.color} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-lg">{workoutDef.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white truncate">
                            {workoutDef.name}
                          </span>
                          <Badge variant="default" size="sm">#{displayWorkout.workoutTypeId}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-dark-400 mt-0.5">
                          <span>{formatDate(displayWorkout.date)}</span>
                          {isOngoing ? (
                            <>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {displayWorkout.setLogs.length} sets logged
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {formatVolume(displayWorkout.totalVolume)}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(displayWorkout.duration)}
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {formatVolume(displayWorkout.totalVolume)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {isOngoing ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            dispatch({ type: 'RESUME_WORKOUT', payload: displayWorkout });
                            navigate('/workout/active');
                          }}
                        >
                          Resume
                        </Button>
                      ) : (
                        <button
                          onClick={(e) => handleDeleteWorkout(displayWorkout.id, e)}
                          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })()}
            </motion.div>
          ) : (
            <Card variant="default" className="text-center py-8">
              <Dumbbell className="w-12 h-12 text-dark-600 mx-auto mb-3" />
              <p className="text-dark-400">No workouts yet</p>
              <p className="text-sm text-dark-500 mt-1">Start your first workout to see your history here!</p>
            </Card>
          )}
        </motion.div>
      </main>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={workoutToDelete !== null}
        onClose={() => setWorkoutToDelete(null)}
        title="Delete Workout?"
      >
        <p className="text-dark-300 mb-4">
          Are you sure you want to delete this workout? This will:
        </p>
        <ul className="text-dark-300 text-sm space-y-2 mb-4 list-disc list-inside">
          <li>Remove the workout from your history</li>
          <li>Recalculate your XP and level</li>
          <li>Recalculate your personal records</li>
          <li>Update your streak</li>
        </ul>
        <p className="text-yellow-400 text-sm mb-4">This action cannot be undone.</p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setWorkoutToDelete(null)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={confirmDeleteWorkout}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

