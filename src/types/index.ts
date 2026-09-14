// ==============================================================================
// Aura Habit & Productivity Tracker - TypeScript Data Contracts
// ==============================================================================

export type TaskQuadrant = 1 | 2 | 3 | 4;

export interface QuadrantMeta {
  id: TaskQuadrant;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  bgGlass: string;
  borderAccent: string;
  badgeColor: string;
}

export type UrgencyTag = 'High' | 'Medium' | 'Low';

export interface TaskItem {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  priority_quadrant: TaskQuadrant;
  is_completed: boolean;
  due_date?: string; // ISO String or YYYY-MM-DD HH:mm
  urgency_tag: UrgencyTag;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id?: string;
  title: string;
  category: string;
  icon: string;
  color: string;
  created_at: string;
  // Computed & logged fields
  logs: string[]; // array of completed 'YYYY-MM-DD'
  currentStreak: number;
  bestStreak: number;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  completed_date: string; // 'YYYY-MM-DD'
}

export type FocusSessionType = 'focus' | 'short_break' | 'long_break';

export interface FocusSession {
  id: string;
  user_id?: string;
  duration_minutes: number;
  session_type: FocusSessionType;
  completed_at: string;
}

export type TimeBlockCategory = 'Kerja' | 'Ibadah' | 'Istirahat' | 'Belajar';

export interface TimeBlock {
  id: string;
  user_id?: string;
  title: string;
  start_time: string; // '08:00'
  end_time: string;   // '10:00'
  category: TimeBlockCategory;
  day_of_week?: number; // 1-7
  notes?: string;
  isGoogleEvent?: boolean;
  sourceLink?: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  avatar_url?: string;
  daily_water_target: number;
  created_at?: string;
}

export interface AuthUser {
  id: string; // Google sub ID
  email: string;
  name: string;
  picture?: string;
  accessToken?: string;
  expiresAt?: number;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  htmlLink?: string;
}

export interface QuickNote {
  id: string;
  content: string;
  updated_at: string;
}

export interface DailyMetrics {
  focusScore: number; // 1.0 - 10.0
  tasksCompleted: number;
  totalTasks: number;
  focusMinutesToday: number;
  productivityPercent: number; // 0 - 100
}

export type AudioPreset = 'rain' | 'binaural' | 'whitenoise' | 'lofi';

export type NavigationTab = 'dashboard' | 'habits' | 'matrix' | 'schedule' | 'timer' | 'analytics';
