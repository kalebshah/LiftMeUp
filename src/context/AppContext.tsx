import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, WorkoutLog, Badge, Quest, PersonalRecord, ActiveWorkoutState, WorkoutTypeId } from '../types';
import { WORKOUTS, LEVEL_THRESHOLDS, QUEST_TEMPLATES } from '../data/workouts';
import * as storage from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';
import { startOfWeek, endOfWeek, differenceInDays, parseISO, startOfDay } from 'date-fns';

// State
interface AppState {
  user: User | null;
  workoutLogs: WorkoutLog[];
  badges: Badge[];
  quests: Quest[];
  personalRecords: PersonalRecord[];
  activeWorkout: ActiveWorkoutState | null;
  selectedDate: Date;
  isLoading: boolean;
}

// Actions
type AppAction =
  | { type: 'INIT_DATA'; payload: Omit<AppState, 'activeWorkout' | 'selectedDate' | 'isLoading'> & { activeWorkout?: ActiveWorkoutState | null } }
  | { type: 'SET_SELECTED_DATE'; payload: Date }
  | { type: 'START_WORKOUT'; payload: { workoutTypeId: WorkoutTypeId; date: Date } }
  | { type: 'RESUME_WORKOUT'; payload: WorkoutLog }
  | { type: 'LOG_SET'; payload: { exerciseId: string; setNumber: number; reps: number; weight: number; difficulty: 'easy' | 'ok' | 'hard' | null } }
  | { type: 'EDIT_SET'; payload: { setId: string; reps: number; weight: number; difficulty: 'easy' | 'ok' | 'hard' | null } }
  | { type: 'DELETE_SET'; payload: string }
  | { type: 'NEXT_SET' }
  | { type: 'JUMP_TO_EXERCISE'; payload: { exerciseIndex: number; setIndex: number } }
  | { type: 'START_REST'; payload: number }
  | { type: 'TICK_REST' }
  | { type: 'SKIP_REST' }
  | { type: 'COMPLETE_WORKOUT'; payload: { checkIn: WorkoutLog['checkIn']; notes: string } }
  | { type: 'PAUSE_WORKOUT' }
  | { type: 'DISCARD_WORKOUT' }
  | { type: 'DELETE_WORKOUT'; payload: string }
  | { type: 'RESET_ALL_DATA' }
  | { type: 'EARN_XP'; payload: number }
  | { type: 'EARN_BADGE'; payload: string }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'UPDATE_QUEST'; payload: Quest }
  | { type: 'ADD_PR'; payload: PersonalRecord };

// Initial state
const initialState: AppState = {
  user: null,
  workoutLogs: [],
  badges: [],
  quests: [],
  personalRecords: [],
  activeWorkout: null,
  selectedDate: new Date(),
  isLoading: true,
};

// Helper functions
const calculateLevel = (xp: number): number => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xpRequired) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }
  return 1;
};

const calculateStreak = (workoutLogs: WorkoutLog[], lastWorkoutDate: string | null): { current: number; longest: number; isActive: boolean } => {
  if (!lastWorkoutDate) return { current: 0, longest: 0, isActive: false };
  
  const today = startOfDay(new Date());
  const lastDate = startOfDay(parseISO(lastWorkoutDate));
  const daysDiff = differenceInDays(today, lastDate);
  
  // Streak is broken if more than 1 day has passed
  if (daysDiff > 1) {
    return { current: 0, longest: 0, isActive: false };
  }
  
  // Count streak
  const sortedLogs = workoutLogs
    .filter(log => log.isComplete)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  let streak = 0;
  let currentDate = daysDiff === 0 ? today : lastDate;
  
  for (const log of sortedLogs) {
    const logDate = startOfDay(parseISO(log.date));
    const diff = differenceInDays(currentDate, logDate);
    
    if (diff === 0) {
      if (streak === 0) streak = 1;
      continue;
    } else if (diff === 1) {
      streak++;
      currentDate = logDate;
    } else {
      break;
    }
  }
  
  return { current: streak, longest: streak, isActive: daysDiff <= 1 };
};

const generateWeeklyQuests = (): Quest[] => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  
  // Pick 2 random quests
  const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 2);
  
  return selected.map(template => ({
    ...template,
    id: uuidv4(),
    startDate: weekStart.toISOString(),
    endDate: weekEnd.toISOString(),
    current: 0,
    isComplete: false,
  }));
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'INIT_DATA':
      return {
        ...state,
        ...action.payload,
        activeWorkout: action.payload.activeWorkout !== undefined ? action.payload.activeWorkout : state.activeWorkout,
        isLoading: false,
      };
    
    case 'SET_SELECTED_DATE':
      return {
        ...state,
        selectedDate: action.payload,
      };
    
    case 'START_WORKOUT': {
      const newWorkoutLog: WorkoutLog = {
        id: uuidv4(),
        date: action.payload.date.toISOString(),
        workoutTypeId: action.payload.workoutTypeId,
        startTime: new Date().toISOString(),
        endTime: null,
        duration: 0,
        totalVolume: 0,
        notes: '',
        isComplete: false,
        setLogs: [],
        checkIn: null,
      };
      
      return {
        ...state,
        activeWorkout: {
          workoutLog: newWorkoutLog,
          currentExerciseIndex: 0,
          currentSetIndex: 0,
          isResting: false,
          restTimeRemaining: 0,
        },
        workoutLogs: [...state.workoutLogs, newWorkoutLog],
      };
    }
    
    case 'RESUME_WORKOUT': {
      const incompleteWorkout = action.payload;
      const workout = WORKOUTS.find(w => w.id === incompleteWorkout.workoutTypeId);
      
      if (!workout) return state;
      
      // Find current exercise and set based on completed sets
      let currentExerciseIndex = 0;
      let currentSetIndex = 0;

      for (let i = 0; i < workout.exercises.length; i++) {
        const exercise = workout.exercises[i];
        const completedSetsForExercise = incompleteWorkout.setLogs.filter(
          log => log.exerciseId === exercise.id
        ).length;

        if (completedSetsForExercise < exercise.sets) {
          currentExerciseIndex = i;
          currentSetIndex = completedSetsForExercise;
          break;
        } else if (i === workout.exercises.length - 1) {
          currentExerciseIndex = workout.exercises.length;
          currentSetIndex = 0;
        }
      }

      return {
        ...state,
        activeWorkout: {
          workoutLog: incompleteWorkout,
          currentExerciseIndex,
          currentSetIndex,
          isResting: false,
          restTimeRemaining: 0,
        },
      };
    }

    case 'LOG_SET': {
      if (!state.activeWorkout) return state;
      
      const { exerciseId, setNumber, reps, weight, difficulty } = action.payload;
      const setLog = {
        id: uuidv4(),
        exerciseId,
        setNumber,
        targetReps: [0, 0] as [number, number],
        actualReps: reps,
        weight,
        difficulty,
        timestamp: new Date().toISOString(),
      };
      
      const updatedWorkoutLog = {
        ...state.activeWorkout.workoutLog,
        setLogs: [...state.activeWorkout.workoutLog.setLogs, setLog],
        totalVolume: state.activeWorkout.workoutLog.totalVolume + (reps * weight),
      };
      
      // Update in workoutLogs array
      const updatedLogs = state.workoutLogs.map(log =>
        log.id === updatedWorkoutLog.id ? updatedWorkoutLog : log
      );
      
      // Save to storage
      storage.saveWorkoutLogs(updatedLogs);
      
      return {
        ...state,
        activeWorkout: {
          ...state.activeWorkout,
          workoutLog: updatedWorkoutLog,
        },
        workoutLogs: updatedLogs,
      };
    }

    case 'EDIT_SET': {
      if (!state.activeWorkout) return state;
      
      const { setId, reps, weight, difficulty } = action.payload;
      const oldSet = state.activeWorkout.workoutLog.setLogs.find(s => s.id === setId);
      if (!oldSet) return state;
      
      const oldVolume = oldSet.actualReps * oldSet.weight;
      const newVolume = reps * weight;
      
      const updatedSetLogs = state.activeWorkout.workoutLog.setLogs.map(s =>
        s.id === setId ? { ...s, actualReps: reps, weight, difficulty } : s
      );
      
      const updatedWorkoutLog = {
        ...state.activeWorkout.workoutLog,
        setLogs: updatedSetLogs,
        totalVolume: state.activeWorkout.workoutLog.totalVolume - oldVolume + newVolume,
      };
      
      const updatedLogs = state.workoutLogs.map(log =>
        log.id === updatedWorkoutLog.id ? updatedWorkoutLog : log
      );
      
      storage.saveWorkoutLogs(updatedLogs);
      
      return {
        ...state,
        activeWorkout: {
          ...state.activeWorkout,
          workoutLog: updatedWorkoutLog,
        },
        workoutLogs: updatedLogs,
      };
    }

    case 'DELETE_SET': {
      if (!state.activeWorkout) return state;
      
      const setToDelete = state.activeWorkout.workoutLog.setLogs.find(s => s.id === action.payload);
      if (!setToDelete) return state;
      
      const volumeToRemove = setToDelete.actualReps * setToDelete.weight;
      
      const updatedSetLogs = state.activeWorkout.workoutLog.setLogs.filter(s => s.id !== action.payload);
      
      const updatedWorkoutLog = {
        ...state.activeWorkout.workoutLog,
        setLogs: updatedSetLogs,
        totalVolume: state.activeWorkout.workoutLog.totalVolume - volumeToRemove,
      };
      
      // Recalculate current position
      const workout = WORKOUTS.find(w => w.id === updatedWorkoutLog.workoutTypeId)!;
      let currentExerciseIndex = 0;
      let currentSetIndex = 0;

      for (let i = 0; i < workout.exercises.length; i++) {
        const exercise = workout.exercises[i];
        const completedSetsForExercise = updatedSetLogs.filter(
          log => log.exerciseId === exercise.id
        ).length;

        if (completedSetsForExercise < exercise.sets) {
          currentExerciseIndex = i;
          currentSetIndex = completedSetsForExercise;
          break;
        } else if (i === workout.exercises.length - 1) {
          currentExerciseIndex = workout.exercises.length;
          currentSetIndex = 0;
        }
      }
      
      const updatedLogs = state.workoutLogs.map(log =>
        log.id === updatedWorkoutLog.id ? updatedWorkoutLog : log
      );
      
      storage.saveWorkoutLogs(updatedLogs);
      
      return {
        ...state,
        activeWorkout: {
          ...state.activeWorkout,
          workoutLog: updatedWorkoutLog,
          currentExerciseIndex,
          currentSetIndex,
          isResting: false,
          restTimeRemaining: 0,
        },
        workoutLogs: updatedLogs,
      };
    }
    
    case 'NEXT_SET': {
      if (!state.activeWorkout) return state;

      const workout = WORKOUTS.find(w => w.id === state.activeWorkout!.workoutLog.workoutTypeId)!;
      const currentExercise = workout.exercises[state.activeWorkout.currentExerciseIndex];

      let nextSetIndex = state.activeWorkout.currentSetIndex + 1;
      let nextExerciseIndex = state.activeWorkout.currentExerciseIndex;

      if (nextSetIndex >= currentExercise.sets) {
        nextSetIndex = 0;
        nextExerciseIndex++;
      }

      return {
        ...state,
        activeWorkout: {
          ...state.activeWorkout,
          currentExerciseIndex: nextExerciseIndex,
          currentSetIndex: nextSetIndex,
          isResting: false,
          restTimeRemaining: 0,
        },
      };
    }

    case 'JUMP_TO_EXERCISE': {
      if (!state.activeWorkout) return state;

      return {
        ...state,
        activeWorkout: {
          ...state.activeWorkout,
          currentExerciseIndex: action.payload.exerciseIndex,
          currentSetIndex: action.payload.setIndex,
          isResting: false,
          restTimeRemaining: 0,
        },
      };
    }

    case 'START_REST':
      if (!state.activeWorkout) return state;
      return {
        ...state,
        activeWorkout: {
          ...state.activeWorkout,
          isResting: true,
          restTimeRemaining: action.payload,
        },
      };
    
    case 'TICK_REST':
      if (!state.activeWorkout || !state.activeWorkout.isResting) return state;
      return {
        ...state,
        activeWorkout: {
          ...state.activeWorkout,
          restTimeRemaining: Math.max(0, state.activeWorkout.restTimeRemaining - 1),
        },
      };
    
    case 'SKIP_REST':
      if (!state.activeWorkout) return state;
      return {
        ...state,
        activeWorkout: {
          ...state.activeWorkout,
          isResting: false,
          restTimeRemaining: 0,
        },
      };
    
    case 'COMPLETE_WORKOUT': {
      if (!state.activeWorkout) return state;
      
      const endTime = new Date();
      const startTime = new Date(state.activeWorkout.workoutLog.startTime);
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
      
      const completedWorkout: WorkoutLog = {
        ...state.activeWorkout.workoutLog,
        endTime: endTime.toISOString(),
        duration,
        isComplete: true,
        checkIn: action.payload.checkIn,
        notes: action.payload.notes,
      };
      
      const updatedLogs = state.workoutLogs.map(log =>
        log.id === completedWorkout.id ? completedWorkout : log
      );
      
      // Update streak
      const newStreak = (state.user?.currentStreak || 0) + 1;
      const longestStreak = Math.max(newStreak, state.user?.longestStreak || 0);
      
      const updatedUser = state.user ? {
        ...state.user,
        currentStreak: newStreak,
        longestStreak,
        lastWorkoutDate: completedWorkout.date,
      } : null;
      
      // Save to storage
      storage.saveWorkoutLogs(updatedLogs);
      if (updatedUser) storage.saveUser(updatedUser);
      
      return {
        ...state,
        workoutLogs: updatedLogs,
        user: updatedUser,
        activeWorkout: null,
      };
    }
    
    case 'PAUSE_WORKOUT': {
      // Just clear the active workout state, keep the workout in logs
      // The workout is already saved in workoutLogs, so user can resume later
      if (!state.activeWorkout) return state;
      
      return {
        ...state,
        activeWorkout: null,
      };
    }

    case 'DISCARD_WORKOUT': {
      if (!state.activeWorkout) return state;
      
      // Remove the incomplete workout from logs entirely
      const updatedLogs = state.workoutLogs.filter(
        log => log.id !== state.activeWorkout!.workoutLog.id
      );
      
      storage.saveWorkoutLogs(updatedLogs);
      
      return {
        ...state,
        workoutLogs: updatedLogs,
        activeWorkout: null,
      };
    }
    
    case 'EARN_XP': {
      if (!state.user) return state;
      
      const newXP = state.user.xp + action.payload;
      const newLevel = calculateLevel(newXP);
      
      const updatedUser = {
        ...state.user,
        xp: newXP,
        level: newLevel,
      };
      
      storage.saveUser(updatedUser);
      
      return {
        ...state,
        user: updatedUser,
      };
    }
    
    case 'EARN_BADGE': {
      const updatedBadges = state.badges.map(badge =>
        badge.id === action.payload && !badge.earnedAt
          ? { ...badge, earnedAt: new Date().toISOString() }
          : badge
      );
      
      storage.saveBadges(updatedBadges);
      
      return {
        ...state,
        badges: updatedBadges,
      };
    }
    
    case 'UPDATE_USER': {
      if (!state.user) return state;
      
      const updatedUser = { ...state.user, ...action.payload };
      storage.saveUser(updatedUser);
      
      return {
        ...state,
        user: updatedUser,
      };
    }
    
    case 'UPDATE_QUEST': {
      const updatedQuests = state.quests.map(quest =>
        quest.id === action.payload.id ? action.payload : quest
      );
      
      storage.saveQuests(updatedQuests);
      
      return {
        ...state,
        quests: updatedQuests,
      };
    }
    
    case 'ADD_PR': {
      const updatedPRs = state.personalRecords.filter(
        pr => pr.exerciseId !== action.payload.exerciseId
      );
      updatedPRs.push(action.payload);

      storage.savePersonalRecords(updatedPRs);

      return {
        ...state,
        personalRecords: updatedPRs,
      };
    }

    case 'DELETE_WORKOUT': {
      // Remove the workout
      const updatedLogs = state.workoutLogs.filter(log => log.id !== action.payload);

      // Recalculate PRs from remaining workouts
      const recalculatedPRs = storage.recalculateAllPRs(updatedLogs);

      // Recalculate total XP from remaining workouts
      const totalXP = storage.calculateTotalXPFromWorkouts(updatedLogs);
      const newLevel = calculateLevel(totalXP);

      // Recalculate streak
      const completedLogs = updatedLogs.filter(l => l.isComplete);
      const lastWorkoutDate = completedLogs.length > 0
        ? completedLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
        : null;

      const streakData = calculateStreak(updatedLogs, lastWorkoutDate);

      const updatedUser = state.user ? {
        ...state.user,
        xp: totalXP,
        level: newLevel,
        currentStreak: streakData.current,
        longestStreak: Math.max(streakData.longest, state.user.longestStreak),
        lastWorkoutDate,
      } : null;

      // Save to storage
      storage.saveWorkoutLogs(updatedLogs);
      storage.savePersonalRecords(recalculatedPRs);
      if (updatedUser) storage.saveUser(updatedUser);

      return {
        ...state,
        workoutLogs: updatedLogs,
        personalRecords: recalculatedPRs,
        user: updatedUser,
      };
    }

    case 'RESET_ALL_DATA': {
      // Clear all storage
      storage.clearAllData();

      // Create fresh user
      const newUser = storage.createDefaultUser();

      // Initialize empty badges
      const freshBadges = storage.getBadges();

      return {
        ...state,
        user: newUser,
        workoutLogs: [],
        badges: freshBadges,
        quests: [],
        personalRecords: [],
        activeWorkout: null,
      };
    }

    default:
      return state;
  }
};

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  getSuggestedWorkout: () => WorkoutTypeId;
  getWorkoutById: (id: WorkoutTypeId) => typeof WORKOUTS[0];
  getLastWorkoutOfType: (typeId: WorkoutTypeId) => WorkoutLog | null;
  getWeeklyStats: () => { workouts: number; volume: number; sets: number };
  getTotalSets: () => number;
  switchProfile: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export const AppProvider: React.FC<{ children: ReactNode; onProfileSwitch: () => void }> = ({ children, onProfileSwitch }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Initialize data on mount
  useEffect(() => {
    const initializeApp = () => {
      let user = storage.getUser();
      if (!user) {
        user = storage.createDefaultUser();
      }
      
      const workoutLogs = storage.getWorkoutLogs();
      const badges = storage.getBadges();
      let quests = storage.getQuests();
      const personalRecords = storage.getPersonalRecords();
      
      // Check if we need new weekly quests
      const now = new Date();
      const weekEnd = quests[0]?.endDate ? new Date(quests[0].endDate) : null;
      
      if (!weekEnd || now > weekEnd || quests.length === 0) {
        quests = generateWeeklyQuests();
        storage.saveQuests(quests);
      }
      
      // Recalculate streak
      const streakInfo = calculateStreak(workoutLogs, user.lastWorkoutDate);
      if (streakInfo.current !== user.currentStreak) {
        user = {
          ...user,
          currentStreak: streakInfo.current,
          longestStreak: Math.max(streakInfo.longest, user.longestStreak),
        };
        storage.saveUser(user);
      }

      // Check for incomplete workout and restore it
      let activeWorkout: ActiveWorkoutState | null = null;
      const incompleteWorkout = workoutLogs.find(log => !log.isComplete);

      if (incompleteWorkout) {
        const workout = WORKOUTS.find(w => w.id === incompleteWorkout.workoutTypeId);
        if (workout) {
          // Find current exercise and set based on completed sets
          let currentExerciseIndex = 0;
          let currentSetIndex = 0;

          for (let i = 0; i < workout.exercises.length; i++) {
            const exercise = workout.exercises[i];
            const completedSetsForExercise = incompleteWorkout.setLogs.filter(
              log => log.exerciseId === exercise.id
            ).length;

            if (completedSetsForExercise < exercise.sets) {
              currentExerciseIndex = i;
              currentSetIndex = completedSetsForExercise;
              break;
            } else if (i === workout.exercises.length - 1) {
              // All exercises complete
              currentExerciseIndex = workout.exercises.length;
              currentSetIndex = 0;
            }
          }

          activeWorkout = {
            workoutLog: incompleteWorkout,
            currentExerciseIndex,
            currentSetIndex,
            isResting: false,
            restTimeRemaining: 0,
          };
        }
      }

      dispatch({
        type: 'INIT_DATA',
        payload: { user, workoutLogs, badges, quests, personalRecords, activeWorkout },
      });
    };
    
    initializeApp();
  }, []);
  
  // Helper functions
  const getSuggestedWorkout = (): WorkoutTypeId => {
    const lastWorkout = state.workoutLogs
      .filter(log => log.isComplete)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    if (!lastWorkout) return 1;
    
    // Recommend a different workout
    const lastType = lastWorkout.workoutTypeId;
    const options: WorkoutTypeId[] = [1, 2, 3].filter(id => id !== lastType) as WorkoutTypeId[];
    return options[Math.floor(Math.random() * options.length)];
  };
  
  const getWorkoutById = (id: WorkoutTypeId) => {
    return WORKOUTS.find(w => w.id === id)!;
  };
  
  const getLastWorkoutOfType = (typeId: WorkoutTypeId): WorkoutLog | null => {
    return state.workoutLogs
      .filter(log => log.isComplete && log.workoutTypeId === typeId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null;
  };
  
  const getWeeklyStats = () => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    
    const weekLogs = state.workoutLogs.filter(log => {
      const logDate = new Date(log.date);
      return log.isComplete && logDate >= weekStart && logDate <= weekEnd;
    });
    
    return {
      workouts: weekLogs.length,
      volume: weekLogs.reduce((sum, log) => sum + log.totalVolume, 0),
      sets: weekLogs.reduce((sum, log) => sum + log.setLogs.length, 0),
    };
  };
  
  const getTotalSets = () => {
    return state.workoutLogs
      .filter(log => log.isComplete)
      .reduce((sum, log) => sum + log.setLogs.length, 0);
  };

  const switchProfile = () => {
    onProfileSwitch();
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        getSuggestedWorkout,
        getWorkoutById,
        getLastWorkoutOfType,
        getWeeklyStats,
        getTotalSets,
        switchProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

