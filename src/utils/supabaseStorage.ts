import { supabase } from '../lib/supabase';
import type {
  User,
  WorkoutLog,
  Badge,
  Quest,
  PersonalRecord,
  Profile,
  CustomWorkoutDefinition,
  CustomExerciseDefinition
} from '../types';
import { BADGES, WORKOUTS } from '../data/workouts';
import bcrypt from 'bcryptjs';

// ============================================
// PROFILE MANAGEMENT WITH PASSWORD
// ============================================

export const createProfile = async (
  name: string,
  avatar: string,
  password: string
): Promise<Profile | null> => {
  try {
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        name,
        avatar,
        password_hash: passwordHash,
        last_accessed_at: new Date().toISOString(),
        is_public: true,
      })
      .select()
      .single();

    if (error) throw error;

    // Create default user for this profile
    await supabase.from('users').insert({
      profile_id: data.id,
      name,
      xp: 0,
      level: 1,
      current_streak: 0,
      longest_streak: 0,
    });

    // Initialize badges
    const badgesToInsert = BADGES.map(badge => ({
      profile_id: data.id,
      badge_id: badge.id,
      earned_at: null,
    }));
    await supabase.from('badges').insert(badgesToInsert);

    return {
      id: data.id,
      name: data.name,
      avatar: data.avatar,
      createdAt: data.created_at,
      lastAccessedAt: data.last_accessed_at,
      isPublic: data.is_public,
    };
  } catch (error) {
    console.error('Error creating profile:', error);
    return null;
  }
};

export const verifyPassword = async (
  profileId: string,
  password: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('password_hash')
      .eq('id', profileId)
      .single();

    if (error || !data) return false;

    return await bcrypt.compare(password, data.password_hash);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
};

export const getProfiles = async (): Promise<Profile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('last_accessed_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      createdAt: p.created_at,
      lastAccessedAt: p.last_accessed_at,
      isPublic: p.is_public,
    }));
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
};

export const updateProfileAccess = async (profileId: string): Promise<void> => {
  try {
    await supabase
      .from('profiles')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', profileId);
  } catch (error) {
    console.error('Error updating profile access:', error);
  }
};

export const deleteProfile = async (profileId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting profile:', error);
    return false;
  }
};

export const toggleProfileVisibility = async (
  profileId: string,
  isPublic: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_public: isPublic })
      .eq('id', profileId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error toggling visibility:', error);
    return false;
  }
};

// ============================================
// USER DATA
// ============================================

export const getUser = async (profileId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('profile_id', profileId)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      createdAt: data.created_at,
      xp: data.xp,
      level: data.level,
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      lastWorkoutDate: data.last_workout_date,
      streakFreezeAvailable: data.streak_freeze_available,
      streakFreezeLastUsed: data.streak_freeze_last_used,
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const saveUser = async (user: User, profileId: string): Promise<void> => {
  try {
    await supabase
      .from('users')
      .update({
        name: user.name,
        xp: user.xp,
        level: user.level,
        current_streak: user.currentStreak,
        longest_streak: user.longestStreak,
        last_workout_date: user.lastWorkoutDate,
        streak_freeze_available: user.streakFreezeAvailable,
        streak_freeze_last_used: user.streakFreezeLastUsed,
      })
      .eq('profile_id', profileId);
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

// ============================================
// CUSTOM WORKOUTS
// ============================================

export const getCustomWorkouts = async (
  profileId: string
): Promise<CustomWorkoutDefinition[]> => {
  try {
    const { data: workouts, error } = await supabase
      .from('custom_workouts')
      .select(`
        *,
        exercises:custom_exercises(*)
      `)
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (workouts || []).map(w => ({
      id: w.id,
      profileId: w.profile_id,
      name: w.name,
      description: w.description,
      icon: w.icon,
      color: w.color,
      createdAt: w.created_at,
      exercises: (w.exercises || [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((e: any) => ({
          id: e.id,
          workoutId: e.workout_id,
          name: e.name,
          sets: e.sets,
          repRange: [e.rep_range_min, e.rep_range_max] as [number, number],
          weightRange: [e.weight_range_min, e.weight_range_max] as [number, number],
          unit: e.unit,
          orderIndex: e.order_index,
        })),
    }));
  } catch (error) {
    console.error('Error fetching custom workouts:', error);
    return [];
  }
};

export const createCustomWorkout = async (
  profileId: string,
  workout: {
    name: string;
    description: string;
    icon: string;
    color: string;
    exercises: Array<{
      name: string;
      sets: number;
      repRange: [number, number];
      weightRange: [number, number];
      unit: string;
    }>;
  }
): Promise<CustomWorkoutDefinition | null> => {
  try {
    // Create workout
    const { data: workoutData, error: workoutError } = await supabase
      .from('custom_workouts')
      .insert({
        profile_id: profileId,
        name: workout.name,
        description: workout.description,
        icon: workout.icon,
        color: workout.color,
      })
      .select()
      .single();

    if (workoutError) throw workoutError;

    // Create exercises
    const exercises = workout.exercises.map((ex, index) => ({
      workout_id: workoutData.id,
      name: ex.name,
      sets: ex.sets,
      rep_range_min: ex.repRange[0],
      rep_range_max: ex.repRange[1],
      weight_range_min: ex.weightRange[0],
      weight_range_max: ex.weightRange[1],
      unit: ex.unit,
      order_index: index,
    }));

    const { data: exercisesData, error: exercisesError } = await supabase
      .from('custom_exercises')
      .insert(exercises)
      .select();

    if (exercisesError) throw exercisesError;

    return {
      id: workoutData.id,
      profileId: workoutData.profile_id,
      name: workoutData.name,
      description: workoutData.description,
      icon: workoutData.icon,
      color: workoutData.color,
      createdAt: workoutData.created_at,
      exercises: exercisesData.map((e, index) => ({
        id: e.id,
        workoutId: e.workout_id,
        name: e.name,
        sets: e.sets,
        repRange: [e.rep_range_min, e.rep_range_max] as [number, number],
        weightRange: [e.weight_range_min, e.weight_range_max] as [number, number],
        unit: e.unit,
        orderIndex: index,
      })),
    };
  } catch (error) {
    console.error('Error creating custom workout:', error);
    return null;
  }
};

export const deleteCustomWorkout = async (workoutId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('custom_workouts')
      .delete()
      .eq('id', workoutId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting custom workout:', error);
    return false;
  }
};

// ============================================
// WORKOUT LOGS (simplified - full implementation would be larger)
// ============================================

export const getWorkoutLogs = async (profileId: string): Promise<WorkoutLog[]> => {
  try {
    const { data, error } = await supabase
      .from('workout_logs')
      .select(`
        *,
        set_logs(*)
      `)
      .eq('profile_id', profileId)
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map(log => ({
      id: log.id,
      date: log.date,
      workoutTypeId: log.workout_type_id,
      startTime: log.start_time,
      endTime: log.end_time,
      duration: log.duration,
      totalVolume: log.total_volume,
      notes: log.notes,
      isComplete: log.is_complete,
      setLogs: (log.set_logs || []).map((s: any) => ({
        id: s.id,
        exerciseId: s.exercise_id,
        setNumber: s.set_number,
        targetReps: [0, 0] as [number, number],
        actualReps: s.actual_reps,
        weight: s.weight,
        difficulty: s.difficulty,
        timestamp: s.timestamp,
      })),
      checkIn: null,
    }));
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    return [];
  }
};

export const saveWorkoutLog = async (
  profileId: string,
  log: WorkoutLog
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('workout_logs')
      .upsert({
        id: log.id,
        profile_id: profileId,
        workout_type_id: log.workoutTypeId,
        date: log.date,
        start_time: log.startTime,
        end_time: log.endTime,
        duration: log.duration,
        total_volume: log.totalVolume,
        notes: log.notes,
        is_complete: log.isComplete,
      })
      .select()
      .single();

    if (error) throw error;

    // Delete existing set logs for this workout
    await supabase
      .from('set_logs')
      .delete()
      .eq('workout_log_id', log.id);

    // Insert new set logs
    if (log.setLogs.length > 0) {
      const setLogsData = log.setLogs.map(s => ({
        workout_log_id: log.id,
        exercise_id: s.exerciseId,
        set_number: s.setNumber,
        actual_reps: s.actualReps,
        weight: s.weight,
        difficulty: s.difficulty,
        timestamp: s.timestamp,
      }));

      await supabase.from('set_logs').insert(setLogsData);
    }

    return true;
  } catch (error) {
    console.error('Error saving workout log:', error);
    return false;
  }
};

export const deleteWorkoutLog = async (workoutId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('workout_logs')
      .delete()
      .eq('id', workoutId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting workout log:', error);
    return false;
  }
};

// ============================================
// BADGES
// ============================================

export const getBadges = async (profileId: string): Promise<Badge[]> => {
  try {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('profile_id', profileId);

    if (error) throw error;

    // Merge with BADGES definitions
    return BADGES.map(badge => {
      const earned = data?.find(d => d.badge_id === badge.id);
      return {
        ...badge,
        earnedAt: earned?.earned_at || null,
      };
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return BADGES;
  }
};

export const earnBadge = async (
  profileId: string,
  badgeId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('badges')
      .update({ earned_at: new Date().toISOString() })
      .eq('profile_id', profileId)
      .eq('badge_id', badgeId)
      .is('earned_at', null);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error earning badge:', error);
    return false;
  }
};

// ============================================
// QUESTS
// ============================================

export const getQuests = async (profileId: string): Promise<Quest[]> => {
  try {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .eq('profile_id', profileId)
      .order('end_date', { ascending: false });

    if (error) throw error;

    return (data || []).map(q => ({
      id: q.id,
      name: q.name,
      description: q.description,
      target: q.target,
      current: q.current,
      xpReward: q.xp_reward,
      startDate: q.start_date,
      endDate: q.end_date,
      isComplete: q.is_complete,
    }));
  } catch (error) {
    console.error('Error fetching quests:', error);
    return [];
  }
};

export const saveQuests = async (
  profileId: string,
  quests: Quest[]
): Promise<boolean> => {
  try {
    // Delete old quests
    await supabase.from('quests').delete().eq('profile_id', profileId);

    // Insert new quests
    const questsData = quests.map(q => ({
      profile_id: profileId,
      quest_id: q.id,
      name: q.name,
      description: q.description,
      target: q.target,
      current: q.current,
      xp_reward: q.xpReward,
      start_date: q.startDate,
      end_date: q.endDate,
      is_complete: q.isComplete,
    }));

    const { error } = await supabase.from('quests').insert(questsData);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving quests:', error);
    return false;
  }
};

export const updateQuest = async (
  profileId: string,
  quest: Quest
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('quests')
      .update({
        current: quest.current,
        is_complete: quest.isComplete,
      })
      .eq('profile_id', profileId)
      .eq('quest_id', quest.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating quest:', error);
    return false;
  }
};

// ============================================
// PERSONAL RECORDS
// ============================================

export const getPersonalRecords = async (
  profileId: string
): Promise<PersonalRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('personal_records')
      .select('*')
      .eq('profile_id', profileId)
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map(pr => ({
      exerciseId: pr.exercise_id,
      exerciseName: pr.exercise_name,
      weight: pr.weight,
      reps: pr.reps,
      date: pr.date,
      estimated1RM: pr.estimated_1rm,
    }));
  } catch (error) {
    console.error('Error fetching PRs:', error);
    return [];
  }
};

export const savePR = async (
  profileId: string,
  pr: PersonalRecord
): Promise<boolean> => {
  try {
    const { error } = await supabase.from('personal_records').upsert({
      profile_id: profileId,
      exercise_id: pr.exerciseId,
      exercise_name: pr.exerciseName,
      weight: pr.weight,
      reps: pr.reps,
      date: pr.date,
      estimated_1rm: pr.estimated1RM,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving PR:', error);
    return false;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

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

// ============================================
// MIGRATION HELPERS (for moving from localStorage)
// ============================================

export const migrateFromLocalStorage = async (profileId: string): Promise<boolean> => {
  try {
    // This would read from old localStorage and save to Supabase
    // Implementation depends on your old storage structure
    console.log('Migration helper available for profileId:', profileId);
    return true;
  } catch (error) {
    console.error('Error migrating data:', error);
    return false;
  }
};
