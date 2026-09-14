-- ==============================================================================
-- Aura Habit & Productivity Tracker (v1.0 MVP)
-- Database Schema for Supabase (PostgreSQL)
-- ==============================================================================

-- 1. Table Users Profile
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  daily_water_target INT DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Table Habits
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Personal',
  icon TEXT DEFAULT 'sparkles',
  color TEXT DEFAULT '#8B5CF6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for habits
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own habits"
  ON public.habits FOR ALL
  USING (auth.uid() = user_id);

-- 3. Table Habit Logs (Tracking Harian)
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, completed_date)
);

-- Enable RLS for habit_logs
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD habit logs through habit ownership"
  ON public.habit_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.habits
      WHERE public.habits.id = habit_logs.habit_id
      AND public.habits.user_id = auth.uid()
    )
  );

-- 4. Table Tasks & Priority Matrix (Eisenhower Matrix)
-- priority_quadrant:
-- 1: Do First (Urgent & Important)
-- 2: Schedule (Not Urgent & Important)
-- 3: Delegate (Urgent & Not Important)
-- 4: Eliminate (Not Urgent & Not Important)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority_quadrant INT CHECK (priority_quadrant BETWEEN 1 AND 4) DEFAULT 1,
  is_completed BOOLEAN DEFAULT FALSE,
  due_date TIMESTAMP WITH TIME ZONE,
  urgency_tag TEXT DEFAULT 'Medium', -- 'High', 'Medium', 'Low'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own tasks"
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id);

-- 5. Table Focus Sessions (Pomodoro Log)
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  duration_minutes INT NOT NULL,
  session_type TEXT DEFAULT 'focus', -- 'focus', 'short_break', 'long_break'
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for focus_sessions
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own focus sessions"
  ON public.focus_sessions FOR ALL
  USING (auth.uid() = user_id);

-- 6. Table Schedule & Timeline (Time Blocking)
CREATE TABLE IF NOT EXISTS public.time_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time TIME NOT NULL, -- e.g. '08:00:00'
  end_time TIME NOT NULL,   -- e.g. '10:00:00'
  category TEXT NOT NULL CHECK (category IN ('Kerja', 'Ibadah', 'Istirahat', 'Belajar')),
  day_of_week INT DEFAULT EXTRACT(ISODOW FROM CURRENT_DATE), -- 1=Monday .. 7=Sunday
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own time blocks"
  ON public.time_blocks FOR ALL
  USING (auth.uid() = user_id);

-- 7. Table Quick Notes (Inbox / Scratchpad)
CREATE TABLE IF NOT EXISTS public.quick_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own quick notes"
  ON public.quick_notes FOR ALL
  USING (auth.uid() = user_id);

-- 8. Trigger untuk auto-create profile saat user sign up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, daily_water_target)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Sobat Produktif'),
    8
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indeks performa
CREATE INDEX IF NOT EXISTS idx_habits_user ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON public.habit_logs(completed_date);
CREATE INDEX IF NOT EXISTS idx_tasks_quadrant ON public.tasks(user_id, priority_quadrant, is_completed);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user ON public.focus_sessions(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_time_blocks_user ON public.time_blocks(user_id);
