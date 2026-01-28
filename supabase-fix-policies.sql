-- Drop old restrictive policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Public user data is viewable" ON users;
DROP POLICY IF EXISTS "Public workout logs are viewable" ON workout_logs;
DROP POLICY IF EXISTS "Public PRs are viewable" ON personal_records;

-- Create permissive policies (auth is handled in app)
CREATE POLICY "Enable all operations for anon users"
  ON profiles FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all operations for users"
  ON users FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all operations for custom_workouts"
  ON custom_workouts FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all operations for custom_exercises"
  ON custom_exercises FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all operations for workout_logs"
  ON workout_logs FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all operations for set_logs"
  ON set_logs FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all operations for personal_records"
  ON personal_records FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all operations for badges"
  ON badges FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all operations for quests"
  ON quests FOR ALL
  USING (true)
  WITH CHECK (true);
