import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Check,
  RotateCcw,
  Timer,
  ChevronRight,
  Zap,
  ChevronDown,
  List,
  Circle,
  PlayCircle,
  CheckCircle,
  Edit2,
  Trash2,
  Save
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NumberInput } from '../components/ui/NumberInput';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { RestTimer } from '../components/RestTimer';
import { WORKOUTS, MOTIVATIONAL_QUOTES, XP_REWARDS } from '../data/workouts';
import { getRandomItem, vibrate, playSound, formatVolume } from '../utils/helpers';
import type { SetLog } from '../types';
import * as storage from '../utils/storage';

type Difficulty = 'easy' | 'ok' | 'hard' | null;
type ExerciseStatus = 'not-started' | 'in-progress' | 'completed';

export const ActiveWorkout: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch, getLastWorkoutOfType } = useApp();
  const { activeWorkout } = state;

  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [showCompletedSets, setShowCompletedSets] = useState(false);
  const [editingSet, setEditingSet] = useState<SetLog | null>(null);
  const [editReps, setEditReps] = useState(0);
  const [editWeight, setEditWeight] = useState(0);
  const [editDifficulty, setEditDifficulty] = useState<Difficulty>(null);
  
  const workout = activeWorkout 
    ? WORKOUTS.find(w => w.id === activeWorkout.workoutLog.workoutTypeId)!
    : null;
  
  const currentExercise = workout && activeWorkout
    ? workout.exercises[activeWorkout.currentExerciseIndex]
    : null;
  
  const isWorkoutComplete = workout && activeWorkout
    ? activeWorkout.currentExerciseIndex >= workout.exercises.length
    : false;

  const lastWorkoutOfType = workout
    ? getLastWorkoutOfType(workout.id)
    : null;

  const getExerciseStatus = (exerciseIndex: number): ExerciseStatus => {
    if (!activeWorkout || !workout) return 'not-started';

    const exercise = workout.exercises[exerciseIndex];
    const completedSetsForExercise = activeWorkout.workoutLog.setLogs.filter(
      log => log.exerciseId === exercise.id
    ).length;

    if (completedSetsForExercise === 0) return 'not-started';
    if (completedSetsForExercise < exercise.sets) return 'in-progress';
    return 'completed';
  };

  const handleSwitchExercise = (exerciseIndex: number) => {
    if (!activeWorkout || !workout) return;

    const exercise = workout.exercises[exerciseIndex];
    const completedSetsForExercise = activeWorkout.workoutLog.setLogs.filter(
      log => log.exerciseId === exercise.id
    ).length;

    dispatch({
      type: 'JUMP_TO_EXERCISE',
      payload: {
        exerciseIndex,
        setIndex: completedSetsForExercise,
      },
    });

    setShowExerciseList(false);
    vibrate(25);
  };
  
  const lastSetData = currentExercise && lastWorkoutOfType
    ? lastWorkoutOfType.setLogs.find(
        s => s.exerciseId === currentExercise.id && s.setNumber === (activeWorkout?.currentSetIndex || 0) + 1
      )
    : null;
  
  useEffect(() => {
    if (currentExercise) {
      if (lastSetData) {
        setWeight(lastSetData.weight);
        setReps(lastSetData.actualReps);
      } else {
        setWeight(Math.round((currentExercise.weightRange[0] + currentExercise.weightRange[1]) / 2));
        setReps(Math.round((currentExercise.repRange[0] + currentExercise.repRange[1]) / 2));
      }
      setDifficulty(null);
    }
  }, [currentExercise?.id, activeWorkout?.currentSetIndex, lastSetData]);
  
  useEffect(() => {
    if (isWorkoutComplete) {
      navigate('/workout/complete');
    }
  }, [isWorkoutComplete, navigate]);
  
  const handleLogSet = () => {
    if (!activeWorkout || !currentExercise) return;
    
    vibrate(50);
    playSound('success');
    setShowSuccessAnimation(true);
    
    dispatch({
      type: 'LOG_SET',
      payload: {
        exerciseId: currentExercise.id,
        setNumber: activeWorkout.currentSetIndex + 1,
        reps,
        weight,
        difficulty,
      },
    });
    
    dispatch({ type: 'EARN_XP', payload: XP_REWARDS.find(r => r.action === 'complete_set')!.xp });
    
    const newPR = storage.checkAndSavePR(currentExercise.id, currentExercise.name, weight, reps);
    if (newPR) {
      dispatch({ type: 'ADD_PR', payload: newPR });
      dispatch({ type: 'EARN_XP', payload: XP_REWARDS.find(r => r.action === 'new_pr')!.xp });
    }
    
    setTimeout(() => {
      setShowSuccessAnimation(false);
      
      const isLastSetOfExercise = activeWorkout.currentSetIndex + 1 >= currentExercise.sets;
      
      if (isLastSetOfExercise) {
        dispatch({ type: 'EARN_XP', payload: XP_REWARDS.find(r => r.action === 'complete_exercise')!.xp });
      }
      
      dispatch({ type: 'START_REST', payload: restDuration });
    }, 500);
  };
  
  const handleRepeatLastTime = () => {
    if (lastSetData) {
      setWeight(lastSetData.weight);
      setReps(lastSetData.actualReps);
      vibrate(25);
    }
  };
  
  const handleSkipRest = useCallback(() => {
    dispatch({ type: 'SKIP_REST' });
    dispatch({ type: 'NEXT_SET' });
  }, [dispatch]);
  
  const handleTickRest = useCallback(() => {
    dispatch({ type: 'TICK_REST' });
  }, [dispatch]);
  
  const handleSaveAndExit = () => {
    dispatch({ type: 'PAUSE_WORKOUT' });
    navigate('/');
  };

  const handleDiscardWorkout = () => {
    dispatch({ type: 'DISCARD_WORKOUT' });
    navigate('/');
  };

  // Edit set handlers
  const handleStartEdit = (set: SetLog) => {
    setEditingSet(set);
    setEditReps(set.actualReps);
    setEditWeight(set.weight);
    setEditDifficulty(set.difficulty);
  };

  const handleSaveEdit = () => {
    if (!editingSet) return;
    
    dispatch({
      type: 'EDIT_SET',
      payload: {
        setId: editingSet.id,
        reps: editReps,
        weight: editWeight,
        difficulty: editDifficulty,
      },
    });
    
    setEditingSet(null);
    vibrate(25);
  };

  const handleDeleteSet = (setId: string) => {
    dispatch({ type: 'DELETE_SET', payload: setId });
    vibrate(50);
  };

  // Get exercise name from ID
  const getExerciseName = (exerciseId: string): string => {
    if (!workout) return '';
    const exercise = workout.exercises.find(e => e.id === exerciseId);
    return exercise?.name || '';
  };
  
  if (!activeWorkout || !workout || !currentExercise) {
    return null;
  }
  
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completedSets = activeWorkout.workoutLog.setLogs.length;
  const progress = (completedSets / totalSets) * 100;

  // Group completed sets by exercise
  const completedSetsByExercise = activeWorkout.workoutLog.setLogs.reduce((acc, set) => {
    if (!acc[set.exerciseId]) {
      acc[set.exerciseId] = [];
    }
    acc[set.exerciseId].push(set);
    return acc;
  }, {} as Record<string, SetLog[]>);
  
  // If resting, show rest timer
  if (activeWorkout.isResting) {
    return (
      <div className="min-h-screen bg-dark-950 bg-mesh">
        <header className="sticky top-0 z-40 bg-dark-950/80 backdrop-blur-lg border-b border-dark-800/50">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-white">Rest Time</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkipRest}
              >
                Skip
              </Button>
            </div>
            <div className="mt-3 h-2 bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-400"
                initial={{ width: `${(completedSets / totalSets) * 100}%` }}
                animate={{ width: `${((completedSets + 1) / totalSets) * 100}%` }}
              />
            </div>
          </div>
        </header>
        
        <main className="px-4 py-6">
          <RestTimer
            timeRemaining={activeWorkout.restTimeRemaining}
            totalTime={restDuration}
            onSkip={handleSkipRest}
            onTick={handleTickRest}
          />
          
          <Card variant="glass" className="mt-8">
            <p className="text-xs text-dark-400 uppercase font-medium mb-2">Coming up</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <ChevronRight className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="font-semibold text-white">{currentExercise.name}</p>
                <p className="text-sm text-dark-400">
                  Set {activeWorkout.currentSetIndex + 2} of {currentExercise.sets}
                </p>
              </div>
            </div>
          </Card>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-dark-950 bg-mesh pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark-950/80 backdrop-blur-lg border-b border-dark-800/50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowExitModal(true)}
              className="p-2 rounded-xl hover:bg-dark-800 transition-colors"
            >
              <X className="w-6 h-6 text-dark-300" />
            </button>
            <div className="text-center">
              <h1 className="text-sm font-medium text-dark-300">{workout.name}</h1>
              <p className="text-xs text-dark-500">{completedSets}/{totalSets} sets</p>
            </div>
            <div className="flex items-center gap-1 text-primary-400">
              <Zap className="w-4 h-4" fill="currentColor" />
              <span className="text-sm font-bold">
                {formatVolume(activeWorkout.workoutLog.totalVolume)}
              </span>
            </div>
          </div>
          
          <div className="mt-3 h-2 bg-dark-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-400"
              style={{ width: `${progress}%` }}
              layout
            />
          </div>
        </div>
      </header>
      
      <main className="px-4 py-6 space-y-6">
        {/* Exercise info */}
        <motion.div
          key={currentExercise.id + activeWorkout.currentSetIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center"
        >
          <Badge variant="primary" size="lg" className="mb-3">
            Exercise {activeWorkout.currentExerciseIndex + 1} of {workout.exercises.length}
          </Badge>
          <h2 className="text-2xl font-bold text-white mb-1">
            {currentExercise.name}
          </h2>
          <p className="text-dark-400">
            {currentExercise.repRange[0]}–{currentExercise.repRange[1]} reps • {currentExercise.weightRange[0]}–{currentExercise.weightRange[1]} {currentExercise.unit}
          </p>
        </motion.div>

        {/* Exercise List Toggle */}
        <Card variant="glass" padding="sm">
          <button
            onClick={() => setShowExerciseList(!showExerciseList)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <List className="w-5 h-5 text-primary-400" />
              <span className="text-sm font-medium text-white">Exercise List</span>
            </div>
            <motion.div
              animate={{ rotate: showExerciseList ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-dark-400" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showExerciseList && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 space-y-2 overflow-hidden"
              >
                {workout.exercises.map((exercise, idx) => {
                  const status = getExerciseStatus(idx);
                  const isCurrent = idx === activeWorkout.currentExerciseIndex;
                  const exerciseCompletedSets = activeWorkout.workoutLog.setLogs.filter(
                    log => log.exerciseId === exercise.id
                  ).length;

                  return (
                    <motion.button
                      key={exercise.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleSwitchExercise(idx)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all ${
                        isCurrent
                          ? 'bg-primary-500/20 border-2 border-primary-500'
                          : 'bg-dark-800/50 hover:bg-dark-700/50'
                      }`}
                    >
                      <div className="mt-0.5">
                        {status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-success-400" />
                        ) : status === 'in-progress' ? (
                          <PlayCircle className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-dark-500" />
                        )}
                      </div>

                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium ${
                            isCurrent ? 'text-white' : 'text-dark-200'
                          }`}>
                            {exercise.name}
                          </p>
                          {isCurrent && (
                            <Badge variant="primary" size="sm">Current</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-dark-400">
                            {exerciseCompletedSets}/{exercise.sets} sets
                          </p>
                          <span className="text-dark-600">•</span>
                          <p className="text-xs text-dark-400">
                            {status === 'completed' ? 'Complete' : status === 'in-progress' ? 'In Progress' : 'Not Started'}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
        
        {/* Set counter */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: currentExercise.sets }, (_, i) => {
            const setNumber = i + 1;
            const isCompleted = activeWorkout.workoutLog.setLogs.some(
              s => s.exerciseId === currentExercise.id && s.setNumber === setNumber
            );
            const isCurrent = i === activeWorkout.currentSetIndex;
            
            return (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${
                  isCompleted
                    ? 'bg-success-500 text-white'
                    : isCurrent
                    ? 'bg-primary-500 text-white ring-2 ring-primary-400 ring-offset-2 ring-offset-dark-950'
                    : 'bg-dark-700 text-dark-400'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : setNumber}
              </motion.div>
            );
          })}
        </div>
        
        {/* Input card */}
        <AnimatePresence mode="wait">
          <motion.div
            key="input-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card variant="elevated" padding="lg">
              <div className="mb-6">
                <NumberInput
                  value={weight}
                  onChange={setWeight}
                  min={0}
                  max={500}
                  step={5}
                  label="Weight"
                  unit={currentExercise.unit}
                  size="lg"
                />
              </div>
              
              <div className="mb-6">
                <NumberInput
                  value={reps}
                  onChange={setReps}
                  min={0}
                  max={50}
                  step={1}
                  label="Reps"
                  size="lg"
                />
              </div>
              
              <div className="mb-6">
                <p className="text-center text-sm text-dark-400 mb-3">How did it feel?</p>
                <div className="flex justify-center gap-3">
                  {(['easy', 'ok', 'hard'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(difficulty === level ? null : level)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${
                        difficulty === level
                          ? level === 'easy'
                            ? 'bg-success-500 text-white'
                            : level === 'ok'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-red-500 text-white'
                          : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                      }`}
                    >
                      {level === 'easy' ? '😊 Easy' : level === 'ok' ? '😐 OK' : '😤 Hard'}
                    </button>
                  ))}
                </div>
              </div>
              
              {lastSetData && (
                <button
                  onClick={handleRepeatLastTime}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-dark-400 hover:text-dark-200 transition-colors mb-4"
                >
                  <RotateCcw className="w-4 h-4" />
                  Repeat last time ({lastSetData.weight} lbs × {lastSetData.actualReps} reps)
                </button>
              )}
              
              <Button
                variant="success"
                size="xl"
                className="w-full relative overflow-hidden"
                onClick={handleLogSet}
                disabled={reps === 0 || weight === 0}
              >
                <AnimatePresence>
                  {showSuccessAnimation && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 4, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white rounded-full"
                    />
                  )}
                </AnimatePresence>
                <Check className="w-5 h-5 mr-2" />
                Complete Set {activeWorkout.currentSetIndex + 1}
              </Button>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Completed Sets Panel */}
        {completedSets > 0 && (
          <Card variant="glass" padding="sm">
            <button
              onClick={() => setShowCompletedSets(!showCompletedSets)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success-400" />
                <span className="text-sm font-medium text-white">
                  Completed Sets ({completedSets})
                </span>
              </div>
              <motion.div
                animate={{ rotate: showCompletedSets ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-dark-400" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showCompletedSets && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 space-y-4 overflow-hidden"
                >
                  {Object.entries(completedSetsByExercise).map(([exerciseId, sets]) => (
                    <div key={exerciseId}>
                      <p className="text-xs font-medium text-dark-400 uppercase mb-2">
                        {getExerciseName(exerciseId)}
                      </p>
                      <div className="space-y-2">
                        {sets.map((set) => (
                          <div
                            key={set.id}
                            className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-success-500/20 flex items-center justify-center">
                                <span className="text-sm font-bold text-success-400">
                                  {set.setNumber}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {set.weight} lbs × {set.actualReps} reps
                                </p>
                                {set.difficulty && (
                                  <p className="text-xs text-dark-400 capitalize">
                                    Felt {set.difficulty}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleStartEdit(set)}
                                className="p-2 rounded-lg hover:bg-dark-700 transition-colors"
                              >
                                <Edit2 className="w-4 h-4 text-dark-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteSet(set.id)}
                                className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        )}
        
        {/* Rest timer setting */}
        <div className="flex items-center justify-center gap-4">
          <Timer className="w-4 h-4 text-dark-400" />
          <span className="text-sm text-dark-400">Rest timer:</span>
          <div className="flex gap-2">
            {[60, 90, 120].map((seconds) => (
              <button
                key={seconds}
                onClick={() => setRestDuration(seconds)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  restDuration === seconds
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                }`}
              >
                {seconds}s
              </button>
            ))}
          </div>
        </div>
        
        <p className="text-center text-sm text-dark-500 italic">
          "{getRandomItem(MOTIVATIONAL_QUOTES.duringWorkout)}"
        </p>
      </main>
      
      {/* Exit modal with Save & Exit option */}
      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Exit Workout?"
      >
        <p className="text-dark-300 mb-4">
          You have {completedSets} sets logged. What would you like to do?
        </p>
        <div className="space-y-3">
          <Button
            variant="primary"
            className="w-full"
            onClick={handleSaveAndExit}
            leftIcon={<Save className="w-5 h-5" />}
          >
            Save & Exit (Resume Later)
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setShowExitModal(false)}
            leftIcon={<PlayCircle className="w-5 h-5" />}
          >
            Keep Going
          </Button>
          <Button
            variant="ghost"
            className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={handleDiscardWorkout}
            leftIcon={<Trash2 className="w-5 h-5" />}
          >
            Discard Workout
          </Button>
        </div>
      </Modal>

      {/* Edit Set Modal */}
      <Modal
        isOpen={!!editingSet}
        onClose={() => setEditingSet(null)}
        title="Edit Set"
      >
        {editingSet && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-dark-400 mb-2 block">Weight (lbs)</label>
              <NumberInput
                value={editWeight}
                onChange={setEditWeight}
                min={0}
                max={500}
                step={5}
                size="md"
              />
            </div>
            
            <div>
              <label className="text-sm text-dark-400 mb-2 block">Reps</label>
              <NumberInput
                value={editReps}
                onChange={setEditReps}
                min={0}
                max={50}
                step={1}
                size="md"
              />
            </div>
            
            <div>
              <p className="text-sm text-dark-400 mb-2">Difficulty</p>
              <div className="flex justify-center gap-2">
                {(['easy', 'ok', 'hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setEditDifficulty(editDifficulty === level ? null : level)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      editDifficulty === level
                        ? level === 'easy'
                          ? 'bg-success-500 text-white'
                          : level === 'ok'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-red-500 text-white'
                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                    }`}
                  >
                    {level === 'easy' ? '😊' : level === 'ok' ? '😐' : '😤'}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setEditingSet(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSaveEdit}
                disabled={editReps === 0 || editWeight === 0}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
