import type { User, WorkoutLog, Badge, Quest, PersonalRecord, Profile } from '../types';
import { BADGES, WORKOUTS } from '../data/workouts';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  PROFILES: 'liftmeup_profiles',
  CURRENT_PROFILE: 'liftmeup_current_profile_id',
};

const getProfileKey = (profileId: string, key: string) => `liftmeup_profile_${profileId}_${key}`;

// Profile Management
export const getProfiles = (): Profile[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
  return data ? JSON.parse(data) : [];
};

export const saveProfiles = (profiles: Profile[]): void => {
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
};

export const getCurrentProfileId = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE);
};

export const setCurrentProfileId = (profileId: string): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE, profileId);
};

export const createProfile = (name: string, avatar: string): Profile => {
  const profile: Profile = {
    id: uuidv4(),
    name,
    avatar,
    createdAt: new Date().toISOString(),
    lastAccessedAt: new Date().toISOString(),
  };

  const profiles = getProfiles();
  profiles.push(profile);
  saveProfiles(profiles);

  // Create default user for this profile
  const user = createDefaultUser();
  saveUser(user, profile.id);

  return profile;
};

export const updateProfile = (profileId: string, updates: Partial<Profile>): void => {
  const profiles = getProfiles();
  const index = profiles.findIndex(p => p.id === profileId);
  if (index !== -1) {
    profiles[index] = { ...profiles[index], ...updates };
    saveProfiles(profiles);
  }
};

export const deleteProfile = (profileId: string): void => {
  // Remove profile from list
  const profiles = getProfiles().filter(p => p.id !== profileId);
  saveProfiles(profiles);

  // Remove all profile data
  const keysToRemove = [
    'user',
    'workout_logs',
    'badges',
    'quests',
    'prs',
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(getProfileKey(profileId, key));
  });

  // If this was the current profile, clear it
  if (getCurrentProfileId() === profileId) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PROFILE);
  }
};

// User
export const getUser = (profileId?: string): User | null => {
  const id = profileId || getCurrentProfileId();
  if (!id) return null;

  const data = localStorage.getItem(getProfileKey(id, 'user'));
  return data ? JSON.parse(data) : null;
};

export const saveUser = (user: User, profileId?: string): void => {
  const id = profileId || getCurrentProfileId();
  if (!id) return;

  localStorage.setItem(getProfileKey(id, 'user'), JSON.stringify(user));
};

export const createDefaultUser = (): User => {
  const profiles = getProfiles();
  const currentProfile = profiles.find(p => p.id === getCurrentProfileId());

  const user: User = {
    id: uuidv4(),
    name: currentProfile?.name || 'Athlete',
    createdAt: new Date().toISOString(),
    xp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
    streakFreezeAvailable: true,
    streakFreezeLastUsed: null,
  };
  return user;
};

// Workout Logs
export const getWorkoutLogs = (profileId?: string): WorkoutLog[] => {
  const id = profileId || getCurrentProfileId();
  if (!id) return [];

  const data = localStorage.getItem(getProfileKey(id, 'workout_logs'));
  return data ? JSON.parse(data) : [];
};

export const saveWorkoutLogs = (logs: WorkoutLog[], profileId?: string): void => {
  const id = profileId || getCurrentProfileId();
  if (!id) return;

  localStorage.setItem(getProfileKey(id, 'workout_logs'), JSON.stringify(logs));
};

export const addWorkoutLog = (log: WorkoutLog): void => {
  const logs = getWorkoutLogs();
  logs.push(log);
  saveWorkoutLogs(logs);
};

export const updateWorkoutLog = (log: WorkoutLog): void => {
  const logs = getWorkoutLogs();
  const index = logs.findIndex(l => l.id === log.id);
  if (index !== -1) {
    logs[index] = log;
    saveWorkoutLogs(logs);
  }
};

export const getLastWorkouts = (count: number = 7): WorkoutLog[] => {
  const logs = getWorkoutLogs();
  return logs
    .filter(log => log.isComplete)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
};

export const getLastWorkoutOfType = (workoutTypeId: number): WorkoutLog | null => {
  const logs = getWorkoutLogs();
  return logs
    .filter(log => log.isComplete && log.workoutTypeId === workoutTypeId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null;
};

export const getWorkoutsInDateRange = (startDate: Date, endDate: Date): WorkoutLog[] => {
  const logs = getWorkoutLogs();
  return logs.filter(log => {
    const logDate = new Date(log.date);
    return log.isComplete && logDate >= startDate && logDate <= endDate;
  });
};

// Badges
export const getBadges = (profileId?: string): Badge[] => {
  const id = profileId || getCurrentProfileId();
  if (!id) return [...BADGES];

  const data = localStorage.getItem(getProfileKey(id, 'badges'));
  if (data) {
    return JSON.parse(data);
  }
  // Initialize with default badges
  const freshBadges = [...BADGES];
  saveBadges(freshBadges, id);
  return freshBadges;
};

export const saveBadges = (badges: Badge[], profileId?: string): void => {
  const id = profileId || getCurrentProfileId();
  if (!id) return;

  localStorage.setItem(getProfileKey(id, 'badges'), JSON.stringify(badges));
};

export const earnBadge = (badgeId: string): Badge | null => {
  const badges = getBadges();
  const badge = badges.find(b => b.id === badgeId);
  if (badge && !badge.earnedAt) {
    badge.earnedAt = new Date().toISOString();
    saveBadges(badges);
    return badge;
  }
  return null;
};

// Quests
export const getQuests = (profileId?: string): Quest[] => {
  const id = profileId || getCurrentProfileId();
  if (!id) return [];

  const data = localStorage.getItem(getProfileKey(id, 'quests'));
  return data ? JSON.parse(data) : [];
};

export const saveQuests = (quests: Quest[], profileId?: string): void => {
  const id = profileId || getCurrentProfileId();
  if (!id) return;

  localStorage.setItem(getProfileKey(id, 'quests'), JSON.stringify(quests));
};

export const updateQuest = (quest: Quest): void => {
  const quests = getQuests();
  const index = quests.findIndex(q => q.id === quest.id);
  if (index !== -1) {
    quests[index] = quest;
    saveQuests(quests);
  }
};

// Personal Records
export const getPersonalRecords = (profileId?: string): PersonalRecord[] => {
  const id = profileId || getCurrentProfileId();
  if (!id) return [];

  const data = localStorage.getItem(getProfileKey(id, 'prs'));
  return data ? JSON.parse(data) : [];
};

export const savePersonalRecords = (records: PersonalRecord[], profileId?: string): void => {
  const id = profileId || getCurrentProfileId();
  if (!id) return;

  localStorage.setItem(getProfileKey(id, 'prs'), JSON.stringify(records));
};

export const checkAndSavePR = (
  exerciseId: string,
  exerciseName: string,
  weight: number,
  reps: number
): PersonalRecord | null => {
  const records = getPersonalRecords();
  const estimated1RM = weight * (1 + reps / 30); // Epley formula
  
  const existingPR = records.find(r => r.exerciseId === exerciseId);
  
  if (!existingPR || estimated1RM > existingPR.estimated1RM) {
    const newPR: PersonalRecord = {
      exerciseId,
      exerciseName,
      weight,
      reps,
      date: new Date().toISOString(),
      estimated1RM,
    };
    
    if (existingPR) {
      const index = records.findIndex(r => r.exerciseId === exerciseId);
      records[index] = newPR;
    } else {
      records.push(newPR);
    }
    
    savePersonalRecords(records);
    return newPR;
  }
  
  return null;
};

// Delete a single workout
export const deleteWorkoutLog = (workoutId: string): void => {
  const logs = getWorkoutLogs();
  const updatedLogs = logs.filter(log => log.id !== workoutId);
  saveWorkoutLogs(updatedLogs);
};

// Recalculate all PRs from scratch based on remaining workouts
export const recalculateAllPRs = (workoutLogs: WorkoutLog[]): PersonalRecord[] => {
  const prMap = new Map<string, PersonalRecord>();

  // Create a map of exercise IDs to names from WORKOUTS
  const exerciseNameMap = new Map<string, string>();
  WORKOUTS.forEach(workout => {
    workout.exercises.forEach(exercise => {
      exerciseNameMap.set(exercise.id, exercise.name);
    });
  });

  // Go through all set logs and find the best for each exercise
  workoutLogs.forEach(workout => {
    if (!workout.isComplete) return;

    workout.setLogs.forEach(set => {
      const estimated1RM = set.weight * (1 + set.actualReps / 30); // Epley formula
      const existing = prMap.get(set.exerciseId);

      if (!existing || estimated1RM > existing.estimated1RM) {
        prMap.set(set.exerciseId, {
          exerciseId: set.exerciseId,
          exerciseName: exerciseNameMap.get(set.exerciseId) || set.exerciseId,
          weight: set.weight,
          reps: set.actualReps,
          date: workout.date,
          estimated1RM,
        });
      }
    });
  });

  return Array.from(prMap.values());
};

// Calculate total XP from workout logs
export const calculateTotalXPFromWorkouts = (workoutLogs: WorkoutLog[]): number => {
  let totalXP = 0;

  workoutLogs.forEach(workout => {
    if (!workout.isComplete) return;

    // XP for completing sets (10 XP per set)
    totalXP += workout.setLogs.length * 10;

    // XP for completing exercises (assume each exercise is completed)
    // Count unique exercises
    const uniqueExercises = new Set(workout.setLogs.map(s => s.exerciseId));
    totalXP += uniqueExercises.size * 25;

    // XP for completing workout (100 XP)
    totalXP += 100;
  });

  return totalXP;
};

// Utility functions
export const clearAllData = (profileId?: string): void => {
  const id = profileId || getCurrentProfileId();
  if (!id) return;

  const keysToRemove = [
    'user',
    'workout_logs',
    'badges',
    'quests',
    'prs',
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(getProfileKey(id, key));
  });
};

export const exportData = (): string => {
  const data = {
    user: getUser(),
    workoutLogs: getWorkoutLogs(),
    badges: getBadges(),
    quests: getQuests(),
    personalRecords: getPersonalRecords(),
  };
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.user) saveUser(data.user);
    if (data.workoutLogs) saveWorkoutLogs(data.workoutLogs);
    if (data.badges) saveBadges(data.badges);
    if (data.quests) saveQuests(data.quests);
    if (data.personalRecords) savePersonalRecords(data.personalRecords);
    return true;
  } catch {
    return false;
  }
};

