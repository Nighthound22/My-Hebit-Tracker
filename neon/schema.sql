-- ==============================================================================
-- Aura Habit & Productivity Tracker (v1.0 MVP)
-- Database Schema khusus untuk Neon Serverless PostgreSQL (neon.tech)
-- Project: proud-base-70292180
-- ==============================================================================

-- 1. Table Users Profile
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT 'Brok Ahmad',
  email TEXT UNIQUE,
  avatar_url TEXT,
  daily_water_target INT DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed user pertama
INSERT INTO public.users (id, full_name, daily_water_target)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Brok Ahmad', 8)
ON CONFLICT (id) DO NOTHING;

-- 2. Table Habits
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Personal',
  icon TEXT DEFAULT 'sparkles',
  color TEXT DEFAULT '#8B5CF6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table Habit Logs (Tracking Harian)
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, completed_date)
);

-- 4. Table Tasks & Priority Matrix (Eisenhower Matrix)
-- priority_quadrant: 1: Do First, 2: Schedule, 3: Delegate, 4: Eliminate
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority_quadrant INT CHECK (priority_quadrant BETWEEN 1 AND 4) DEFAULT 1,
  is_completed BOOLEAN DEFAULT FALSE,
  due_date TIMESTAMP WITH TIME ZONE,
  urgency_tag TEXT DEFAULT 'Medium', -- 'High', 'Medium', 'Low'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table Focus Sessions (Pomodoro Log)
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  duration_minutes INT NOT NULL,
  session_type TEXT DEFAULT 'focus', -- 'focus', 'short_break', 'long_break'
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table Schedule & Timeline (Time Blocking)
CREATE TABLE IF NOT EXISTS public.time_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Kerja', 'Ibadah', 'Istirahat', 'Belajar')),
  day_of_week INT DEFAULT EXTRACT(ISODOW FROM CURRENT_DATE),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table Quick Notes (Inbox / Scratchpad)
CREATE TABLE IF NOT EXISTS public.quick_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Indeks Performa
CREATE INDEX IF NOT EXISTS idx_neon_habits_user ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_neon_habit_logs_date ON public.habit_logs(completed_date);
CREATE INDEX IF NOT EXISTS idx_neon_tasks_quadrant ON public.tasks(user_id, priority_quadrant, is_completed);
CREATE INDEX IF NOT EXISTS idx_neon_focus_sessions_user ON public.focus_sessions(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_neon_time_blocks_user ON public.time_blocks(user_id);

-- 9. Table User Sync Data (Sinkronisasi Multi-Perangkat Laptop & HP)
CREATE TABLE IF NOT EXISTS public.user_sync_data (
  email TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
