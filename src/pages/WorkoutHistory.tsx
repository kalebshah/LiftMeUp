import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Dumbbell,
  Clock,
  TrendingUp,
  Trash2,
  Edit3,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { WORKOUTS } from '../data/workouts';
import { formatDuration, formatVolume } from '../utils/helpers';

export const WorkoutHistory: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { workoutLogs } = state;
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);

  const sortedWorkouts = [...workoutLogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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

  const handleResumeWorkout = (workoutId: string) => {
    // Check if this workout is already the active workout
    if (state.activeWorkout?.workoutLog.id === workoutId) {
      navigate('/workout/active');
    } else {
      // Need to set this as the active workout
      // For now, just navigate to active workout page if there's an active workout
      navigate('/workout/active');
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 bg-mesh pb-24">
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
            <h1 className="text-lg font-bold text-white">Workout History</h1>
            <p className="text-xs text-dark-400">
              {workoutLogs.length} workout{workoutLogs.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {sortedWorkouts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="default" className="text-center py-12">
              <Dumbbell className="w-16 h-16 text-dark-600 mx-auto mb-4" />
              <p className="text-lg text-dark-400 mb-2">No workouts yet</p>
              <p className="text-sm text-dark-500 mb-6">
                Start your first workout to see your history here!
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/workout/select')}
                leftIcon={<Dumbbell className="w-4 h-4" />}
              >
                Start Workout
              </Button>
            </Card>
          </motion.div>
        ) : (
          <>
            {sortedWorkouts.map((workout, index) => {
              const workoutDef = WORKOUTS.find(w => w.id === workout.workoutTypeId)!;
              const isOngoing = !workout.isComplete;
              const totalSets = workoutDef.exercises.reduce((sum, ex) => sum + ex.sets, 0);
              const completedSets = workout.setLogs.length;

              return (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    variant={isOngoing ? "elevated" : "default"}
                    padding="none"
                    className={`overflow-hidden ${isOngoing ? 'border-2 border-primary-500/50' : ''}`}
                  >
                    {/* Header */}
                    <div className={`bg-gradient-to-r ${workoutDef.color} p-4`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{workoutDef.icon}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-white">
                                {workoutDef.name}
                              </h3>
                              {isOngoing && (
                                <Badge variant="success" size="sm" pulse>
                                  In Progress
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/80">
                              <Calendar className="w-3 h-3" />
                              <span>{format(new Date(workout.date), 'MMM d, yyyy')}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="default" size="sm" className="bg-white/20">
                          #{workout.workoutTypeId}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-dark-400" />
                          {isOngoing ? (
                            <span className="text-dark-300">
                              {completedSets}/{totalSets} sets
                            </span>
                          ) : (
                            <span className="text-dark-300">
                              {formatDuration(workout.duration)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-dark-400" />
                          <span className="text-dark-300">
                            {formatVolume(workout.totalVolume)}
                          </span>
                        </div>
                        {!isOngoing && (
                          <div className="flex items-center gap-2 text-sm">
                            <Dumbbell className="w-4 h-4 text-dark-400" />
                            <span className="text-dark-300">
                              {completedSets} sets
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Progress bar for ongoing workouts */}
                      {isOngoing && (
                        <div className="mb-4">
                          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-primary-500 to-primary-400"
                              initial={{ width: 0 }}
                              animate={{ width: `${(completedSets / totalSets) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-dark-400 mt-1">
                            {Math.round((completedSets / totalSets) * 100)}% complete
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        {isOngoing ? (
                          <>
                            <Button
                              variant="primary"
                              className="flex-1"
                              onClick={() => handleResumeWorkout(workout.id)}
                              leftIcon={<Edit3 className="w-4 h-4" />}
                            >
                              Resume Workout
                            </Button>
                            <Button
                              variant="danger"
                              size="md"
                              onClick={(e) => handleDeleteWorkout(workout.id, e)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="danger"
                            className="w-full"
                            onClick={(e) => handleDeleteWorkout(workout.id, e)}
                            leftIcon={<Trash2 className="w-4 h-4" />}
                          >
                            Delete Workout
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </>
        )}
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
