// Profile (for multi-user support)
export interface Profile {
  id: string;
  name: string;
  avatar: string; // emoji or icon
  createdAt: string;
  lastAccessedAt: string;
}

// User profile
export interface User {
  id: string;
  name: string;
  createdAt: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
  streakFreezeAvailable: boolean;
  streakFreezeLastUsed: string | null;
}

// Workout type definitions
export type WorkoutTypeId = 1 | 2 | 3;

export interface ExerciseDefinition {
  id: string;
  name: string;
  sets: number;
  repRange: [number, number];
  weightRange: [number, number];
  unit: string;
}

export interface WorkoutDefinition {
  id: WorkoutTypeId;
  name: string;
  description: string;
  icon: string;
  color: string;
  exercises: ExerciseDefinition[];
}

// Logged workout data
export interface SetLog {
  id: string;
  exerciseId: string;
  setNumber: number;
  targetReps: [number, number];
  actualReps: number;
  weight: number;
  difficulty: 'easy' | 'ok' | 'hard' | null;
  timestamp: string;
}

export interface CheckIn {
  fatigue: number;
  difficulty: number;
  recovery: number;
  sleepQuality: number;
  motivation: number;
  pain: 'none' | 'knee' | 'shoulder' | 'back' | 'other';
  notes: string;
}

export interface WorkoutLog {
  id: string;
  date: string;
  workoutTypeId: WorkoutTypeId;
  startTime: string;
  endTime: string | null;
  duration: number;
  totalVolume: number;
  notes: string;
  isComplete: boolean;
  setLogs: SetLog[];
  checkIn: CheckIn | null;
}

// Gamification
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  earnedAt: string | null;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  xpReward: number;
  startDate: string;
  endDate: string;
  isComplete: boolean;
  type: 'workouts' | 'sets' | 'volume' | 'streak' | 'variety';
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
  estimated1RM: number;
}

// Active workout state
export interface ActiveWorkoutState {
  workoutLog: WorkoutLog;
  currentExerciseIndex: number;
  currentSetIndex: number;
  isResting: boolean;
  restTimeRemaining: number;
}

// XP rewards configuration
export interface XPReward {
  action: string;
  xp: number;
}

// Level thresholds
export interface LevelThreshold {
  level: number;
  xpRequired: number;
  title: string;
}
