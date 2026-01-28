-- LiftMeUp Database Schema for Supabase

-- Profiles table (with password protection)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  avatar VARCHAR(10) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  is_public BOOLEAN DEFAULT true -- Allow others to view progress
);

-- Users table (workout data per profile)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_workout_date TIMESTAMPTZ,
  streak_freeze_available BOOLEAN DEFAULT true,
  streak_freeze_last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Workouts table
CREATE TABLE custom_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10) DEFAULT '💪',
  color VARCHAR(50) DEFAULT 'from-primary-500 to-primary-600',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Exercises table
CREATE TABLE custom_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES custom_workouts(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  sets INTEGER NOT NULL,
  rep_range_min INTEGER NOT NULL,
  rep_range_max INTEGER NOT NULL,
  weight_range_min INTEGER NOT NULL,
  weight_range_max INTEGER NOT NULL,
  unit VARCHAR(20) DEFAULT 'lbs',
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout Logs table
CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  workout_type_id INTEGER, -- NULL for custom workouts
  custom_workout_id UUID REFERENCES custom_workouts(id) ON DELETE SET NULL,
  date TIMESTAMPTZ NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER DEFAULT 0,
  total_volume INTEGER DEFAULT 0,
  notes TEXT,
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set Logs table
CREATE TABLE set_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id UUID REFERENCES workout_logs(id) ON DELETE CASCADE,
  exercise_id VARCHAR(100) NOT NULL,
  set_number INTEGER NOT NULL,
  actual_reps INTEGER NOT NULL,
  weight DECIMAL(10, 2) NOT NULL,
  difficulty VARCHAR(10),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Personal Records table
CREATE TABLE personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id VARCHAR(100) NOT NULL,
  exercise_name VARCHAR(100) NOT NULL,
  weight DECIMAL(10, 2) NOT NULL,
  reps INTEGER NOT NULL,
  estimated_1rm DECIMAL(10, 2) NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, exercise_id)
);

-- Badges table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id VARCHAR(50) NOT NULL,
  earned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quests table
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL,
  target INTEGER NOT NULL,
  current INTEGER DEFAULT 0,
  xp_reward INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_profiles_name ON profiles(name);
CREATE INDEX idx_users_profile_id ON users(profile_id);
CREATE INDEX idx_workout_logs_profile_id ON workout_logs(profile_id);
CREATE INDEX idx_workout_logs_date ON workout_logs(date);
CREATE INDEX idx_set_logs_workout_log_id ON set_logs(workout_log_id);
CREATE INDEX idx_personal_records_profile_id ON personal_records(profile_id);
CREATE INDEX idx_custom_workouts_profile_id ON custom_workouts(profile_id);
CREATE INDEX idx_custom_exercises_workout_id ON custom_exercises(workout_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

-- Public can read all profiles (for viewing progress)
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (is_public = true);

-- Public can read user data for public profiles
CREATE POLICY "Public user data is viewable"
  ON users FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE is_public = true));

-- Public can read workout logs for public profiles
CREATE POLICY "Public workout logs are viewable"
  ON workout_logs FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE is_public = true));

-- Public can read personal records for public profiles
CREATE POLICY "Public PRs are viewable"
  ON personal_records FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE is_public = true));

-- Note: For authenticated write operations, we'll handle authentication in the app
-- since we're using password-based auth (not Supabase Auth)
