// ==============================================================================
// Aura Offline-First Storage Engine & Seed Data
// Supports web localStorage & React Native AsyncStorage seamlessly
// ==============================================================================

import { Habit, TaskItem, TimeBlock, UserProfile, FocusSession, QuickNote } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'aura_profile_v1',
  HABITS: 'aura_habits_v1',
  TASKS: 'aura_tasks_v1',
  TIMEBLOCKS: 'aura_timeblocks_v1',
  FOCUS_SESSIONS: 'aura_focus_sessions_v1',
  WATER_CUPS: 'aura_water_cups_v1',
  QUICK_NOTES: 'aura_quick_notes_v1',
  SUPABASE_CONFIG: 'aura_supabase_config_v1',
};

// Safe web / mobile storage accessor
export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('Storage remove error:', e);
    }
  },
};

// Helper tanggal YYYY-MM-DD
export const getTodayKey = (dateOffset: number = 0): string => {
  const d = new Date();
  if (dateOffset !== 0) {
    d.setDate(d.getDate() + dateOffset);
  }
  return d.toISOString().split('T')[0];
};

// Default Realistic Seed Data
const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_default_001',
  full_name: 'Brok Ahmad',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  daily_water_target: 8,
};

const DEFAULT_HABITS: Habit[] = [
  {
    id: 'hbt-1',
    title: 'Tahajud & Subuh Berjamaah',
    category: 'Ibadah',
    icon: 'moon',
    color: '#10B981',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    logs: [getTodayKey(-4), getTodayKey(-3), getTodayKey(-2), getTodayKey(-1), getTodayKey(0)],
    currentStreak: 5,
    bestStreak: 12,
  },
  {
    id: 'hbt-2',
    title: 'Deep Work / Coding 2 Jam',
    category: 'Kerja',
    icon: 'code',
    color: '#3B82F6',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    logs: [getTodayKey(-3), getTodayKey(-2), getTodayKey(-1), getTodayKey(0)],
    currentStreak: 4,
    bestStreak: 8,
  },
  {
    id: 'hbt-3',
    title: 'Baca Buku / Riset Tech 30m',
    category: 'Belajar',
    icon: 'book-open',
    color: '#8B5CF6',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    logs: [getTodayKey(-5), getTodayKey(-4), getTodayKey(-2), getTodayKey(-1)],
    currentStreak: 2,
    bestStreak: 14,
  },
  {
    id: 'hbt-4',
    title: 'Workout & Push-up 50x',
    category: 'Kesehatan',
    icon: 'activity',
    color: '#F59E0B',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    logs: [getTodayKey(-2), getTodayKey(-1), getTodayKey(0)],
    currentStreak: 3,
    bestStreak: 6,
  },
  {
    id: 'hbt-5',
    title: 'Minum Air Mineral 2.5L',
    category: 'Kesehatan',
    icon: 'droplet',
    color: '#06B6D4',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    logs: [getTodayKey(-3), getTodayKey(-2), getTodayKey(-1), getTodayKey(0)],
    currentStreak: 4,
    bestStreak: 21,
  },
];

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 'tsk-1',
    title: 'Selesaikan MVP Aura Habit Tracker',
    description: 'Pastikan responsive UI 3-kolom desktop & bottom navigation mobile berjalan mulus.',
    priority_quadrant: 1, // Do First
    is_completed: false,
    due_date: `${getTodayKey(0)} 23:59`,
    urgency_tag: 'High',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tsk-2',
    title: 'Review Skema SQL Supabase & Test RLS',
    description: 'Pastikan auth.uid() valid dan foreign keys cascading delete siap.',
    priority_quadrant: 1, // Do First
    is_completed: true,
    due_date: `${getTodayKey(0)} 18:00`,
    urgency_tag: 'High',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tsk-3',
    title: 'Desain Sound Engine & Visualizer Pomodoro',
    description: 'Integrasi Web Audio synthesizer untuk audio Rain dan Binaural focus.',
    priority_quadrant: 2, // Schedule
    is_completed: true,
    due_date: `${getTodayKey(1)} 17:00`,
    urgency_tag: 'Medium',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tsk-4',
    title: 'Eksplorasi Algoritma Kalkulasi Focus Score',
    description: 'Formula bobot: 40% habits completed, 30% task ratio, 30% focus time.',
    priority_quadrant: 2, // Schedule
    is_completed: false,
    due_date: `${getTodayKey(2)} 20:00`,
    urgency_tag: 'Medium',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tsk-5',
    title: 'Follow-up sync kredensial Supabase',
    description: 'Masukkan URL dan Anon Key jika ingin cloud synchronization.',
    priority_quadrant: 3, // Delegate
    is_completed: false,
    due_date: `${getTodayKey(3)} 12:00`,
    urgency_tag: 'Low',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tsk-6',
    title: 'Balas pesan non-urgent & sortir inbox email',
    description: 'Sisihkan waktu 15 menit di akhir sore.',
    priority_quadrant: 3, // Delegate
    is_completed: true,
    due_date: `${getTodayKey(0)} 16:30`,
    urgency_tag: 'Low',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tsk-7',
    title: 'Doomscrolling medsos & video shorts saat jam kerja',
    description: 'Blokir aplikasi distraksi di smartphone selama sesi Pomodoro aktif.',
    priority_quadrant: 4, // Eliminate
    is_completed: false,
    urgency_tag: 'Low',
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_TIMEBLOCKS: TimeBlock[] = [
  {
    id: 'tb-1',
    title: 'Sholat Subuh & Tadarus Quran',
    start_time: '05:00',
    end_time: '06:15',
    category: 'Ibadah',
  },
  {
    id: 'tb-2',
    title: 'Sarapan Sehat & Morning Exercise',
    start_time: '06:30',
    end_time: '07:30',
    category: 'Istirahat',
  },
  {
    id: 'tb-3',
    title: 'Deep Work: Development Sprint 1',
    start_time: '08:30',
    end_time: '11:45',
    category: 'Kerja',
  },
  {
    id: 'tb-4',
    title: 'Sholat Dzuhur & Makan Siang Santai',
    start_time: '12:00',
    end_time: '13:00',
    category: 'Ibadah',
  },
  {
    id: 'tb-5',
    title: 'Core Development: UI/UX & Responsive Flow',
    start_time: '13:30',
    end_time: '16:00',
    category: 'Kerja',
  },
  {
    id: 'tb-6',
    title: 'Coffee Break & Ambient Lo-Fi Chill',
    start_time: '16:15',
    end_time: '17:00',
    category: 'Istirahat',
  },
  {
    id: 'tb-7',
    title: 'Tech Reading: Modern Architecture & Supabase',
    start_time: '19:30',
    end_time: '21:00',
    category: 'Belajar',
  },
];

const DEFAULT_FOCUS_SESSIONS: FocusSession[] = [
  {
    id: 'fs-1',
    duration_minutes: 25,
    session_type: 'focus',
    completed_at: `${getTodayKey(0)}T09:15:00.000Z`,
  },
  {
    id: 'fs-2',
    duration_minutes: 25,
    session_type: 'focus',
    completed_at: `${getTodayKey(0)}T10:00:00.000Z`,
  },
  {
    id: 'fs-3',
    duration_minutes: 25,
    session_type: 'focus',
    completed_at: `${getTodayKey(0)}T11:00:00.000Z`,
  },
  {
    id: 'fs-4',
    duration_minutes: 25,
    session_type: 'focus',
    completed_at: `${getTodayKey(0)}T14:30:00.000Z`,
  },
];

const DEFAULT_NOTES: QuickNote[] = [
  {
    id: 'note-1',
    content: '💡 Ide Fitur v1.1: Tambahkan widget soundscape Hujan Hutan Tropis & integrasi notifikasi adzan otomatis.',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'note-2',
    content: '📌 Target Minggu Ini: Kuasai habit membaca buku 30 menit tanpa terdistraksi notifikasi smartphone.',
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Local Storage Service
export const LocalStorageService = {
  getProfile: (): UserProfile => {
    const raw = safeStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      safeStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_PROFILE;
    }
  },
  saveProfile: (p: UserProfile) => {
    safeStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(p));
  },

  getHabits: (): Habit[] => {
    const raw = safeStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) {
      safeStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(DEFAULT_HABITS));
      return DEFAULT_HABITS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_HABITS;
    }
  },
  saveHabits: (habits: Habit[]) => {
    safeStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  },

  getTasks: (): TaskItem[] => {
    const raw = safeStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      safeStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
      return DEFAULT_TASKS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_TASKS;
    }
  },
  saveTasks: (tasks: TaskItem[]) => {
    safeStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  getTimeBlocks: (): TimeBlock[] => {
    const raw = safeStorage.getItem(STORAGE_KEYS.TIMEBLOCKS);
    if (!raw) {
      safeStorage.setItem(STORAGE_KEYS.TIMEBLOCKS, JSON.stringify(DEFAULT_TIMEBLOCKS));
      return DEFAULT_TIMEBLOCKS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_TIMEBLOCKS;
    }
  },
  saveTimeBlocks: (blocks: TimeBlock[]) => {
    safeStorage.setItem(STORAGE_KEYS.TIMEBLOCKS, JSON.stringify(blocks));
  },

  getFocusSessions: (): FocusSession[] => {
    const raw = safeStorage.getItem(STORAGE_KEYS.FOCUS_SESSIONS);
    if (!raw) {
      safeStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(DEFAULT_FOCUS_SESSIONS));
      return DEFAULT_FOCUS_SESSIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_FOCUS_SESSIONS;
    }
  },
  saveFocusSessions: (sessions: FocusSession[]) => {
    safeStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(sessions));
  },

  getWaterCupsToday: (): number => {
    const key = `${STORAGE_KEYS.WATER_CUPS}_${getTodayKey()}`;
    const raw = safeStorage.getItem(key);
    if (raw === null) {
      safeStorage.setItem(key, '5'); // Seed: 5 cups
      return 5;
    }
    return parseInt(raw, 10) || 0;
  },
  saveWaterCupsToday: (count: number) => {
    const key = `${STORAGE_KEYS.WATER_CUPS}_${getTodayKey()}`;
    safeStorage.setItem(key, count.toString());
  },

  getQuickNotes: (): QuickNote[] => {
    const raw = safeStorage.getItem(STORAGE_KEYS.QUICK_NOTES);
    if (!raw) {
      safeStorage.setItem(STORAGE_KEYS.QUICK_NOTES, JSON.stringify(DEFAULT_NOTES));
      return DEFAULT_NOTES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_NOTES;
    }
  },
  saveQuickNotes: (notes: QuickNote[]) => {
    safeStorage.setItem(STORAGE_KEYS.QUICK_NOTES, JSON.stringify(notes));
  },

  getSupabaseConfig: () => {
    const raw = safeStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
    if (!raw) return { url: '', anonKey: '', isEnabled: false };
    try {
      return JSON.parse(raw);
    } catch {
      return { url: '', anonKey: '', isEnabled: false };
    }
  },
  saveSupabaseConfig: (config: { url: string; anonKey: string; isEnabled: boolean }) => {
    safeStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(config));
  },

  resetAllData: () => {
    safeStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
    safeStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(DEFAULT_HABITS));
    safeStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
    safeStorage.setItem(STORAGE_KEYS.TIMEBLOCKS, JSON.stringify(DEFAULT_TIMEBLOCKS));
    safeStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(DEFAULT_FOCUS_SESSIONS));
    safeStorage.setItem(`${STORAGE_KEYS.WATER_CUPS}_${getTodayKey()}`, '5');
    safeStorage.setItem(STORAGE_KEYS.QUICK_NOTES, JSON.stringify(DEFAULT_NOTES));
  }
};
