// ==============================================================================
// Hook Manajemen Data Terpusat: Habit, Task, Timeblock, Water, Focus Timer
// Menghitung Otomatis Focus Score & Metrik Produktivitas PRD 3.1
// ==============================================================================

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Habit, TaskItem, TimeBlock, FocusSession, QuickNote, UserProfile, DailyMetrics, TaskQuadrant } from '../types';
import { LocalStorageService, getTodayKey } from '../lib/storage';
import { neonSyncService } from '../lib/neonSync';
import { supabaseService } from '../lib/supabase';
import { supabaseSyncService, AppSyncData } from '../lib/supabaseSync';
import { googleAuthService } from '../lib/auth';

export const DAILY_QUOTES = [
  { text: "Kebiasaan kecil yang konsisten mengalahkan motivasi besar yang sesaat.", author: "James Clear (Atomic Habits)" },
  { text: "Disiplin hari ini adalah kebebasan di masa depan.", author: "Jocko Willink" },
  { text: "Jangan hitung hari, buat setiap hari bermakna dan penuh fokus.", author: "Muhammad Ali" },
  { text: "Apa yang kita lakukan berulang kali menentukan siapa diri kita sesungguhnya.", author: "Aristoteles" },
  { text: "Fokus bukan hanya mengatakan ya untuk pekerjaan penting, tapi berani berkata tidak untuk ratusan hal baik lainnya.", author: "Steve Jobs" },
  { text: "Waktu tidak bisa diatur, yang bisa kita atur adalah prioritas energi kita.", author: "Aura Productivity" },
];

export const useHabitData = () => {
  const [profile, setProfile] = useState<UserProfile>(LocalStorageService.getProfile);
  const [habits, setHabits] = useState<Habit[]>(LocalStorageService.getHabits);
  const [tasks, setTasks] = useState<TaskItem[]>(LocalStorageService.getTasks);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(LocalStorageService.getTimeBlocks);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(LocalStorageService.getFocusSessions);
  const [waterCups, setWaterCups] = useState<number>(LocalStorageService.getWaterCupsToday);
  const [notes, setNotes] = useState<QuickNote[]>(LocalStorageService.getQuickNotes);

  // Status Sinkronisasi Cloud Supabase
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const isInitialPullDone = useRef<boolean>(false);
  const isSyncingRef = useRef<boolean>(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Quote harian dinamis berdasarkan hari dalam tahun
  const dailyQuote = useMemo(() => {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
  }, []);

  // Simpan ke storage saat ada perubahan state
  useEffect(() => {
    LocalStorageService.saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    LocalStorageService.saveHabits(habits);
  }, [habits]);

  useEffect(() => {
    LocalStorageService.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    LocalStorageService.saveTimeBlocks(timeBlocks);
  }, [timeBlocks]);

  useEffect(() => {
    LocalStorageService.saveFocusSessions(focusSessions);
  }, [focusSessions]);

  useEffect(() => {
    LocalStorageService.saveWaterCupsToday(waterCups);
  }, [waterCups]);

  useEffect(() => {
    LocalStorageService.saveQuickNotes(notes);
  }, [notes]);

  // Email aktif pengguna untuk partitioning data cloud
  const getUserEmail = useCallback(() => {
    const googleUser = googleAuthService.getUser();
    if (googleUser?.email) return googleUser.email.trim().toLowerCase();
    if (profile.email) return profile.email.trim().toLowerCase();
    return 'achmadali220102@gmail.com';
  }, [profile.email]);

  // Penerapan data dari cloud ke local state & storage cache
  const applyCloudData = useCallback((cloudData: AppSyncData) => {
    isSyncingRef.current = true;

    if (cloudData.profile) {
      setProfile(prev => ({ ...prev, ...cloudData.profile }));
      LocalStorageService.saveProfile({ ...profile, ...cloudData.profile });
    }
    if (Array.isArray(cloudData.habits)) {
      setHabits(cloudData.habits);
      LocalStorageService.saveHabits(cloudData.habits);
    }
    if (Array.isArray(cloudData.tasks)) {
      setTasks(cloudData.tasks);
      LocalStorageService.saveTasks(cloudData.tasks);
    }
    if (Array.isArray(cloudData.timeBlocks)) {
      setTimeBlocks(cloudData.timeBlocks);
      LocalStorageService.saveTimeBlocks(cloudData.timeBlocks);
    }
    if (Array.isArray(cloudData.focusSessions)) {
      setFocusSessions(cloudData.focusSessions);
      LocalStorageService.saveFocusSessions(cloudData.focusSessions);
    }
    if (typeof cloudData.waterCups === 'number') {
      setWaterCups(cloudData.waterCups);
      LocalStorageService.saveWaterCupsToday(cloudData.waterCups);
    }
    if (Array.isArray(cloudData.notes)) {
      setNotes(cloudData.notes);
      LocalStorageService.saveQuickNotes(cloudData.notes);
    }

    setLastSyncedAt(new Date(cloudData.updatedAt || Date.now()));

    setTimeout(() => {
      isSyncingRef.current = false;
    }, 600);
  }, [profile]);

  // --- Mesin Dorong Cloud (Push ke Neon Console atau Supabase) ---
  const pushToCloud = useCallback(async () => {
    const isNeon = neonSyncService.isConfigured();
    const isSupabase = supabaseService.isConfigured();
    if (!isNeon && !isSupabase) return false;

    const email = getUserEmail();
    if (!email) return false;

    try {
      setIsCloudSyncing(true);
      const payload: AppSyncData = {
        profile,
        habits,
        tasks,
        timeBlocks,
        focusSessions,
        waterCups,
        notes,
        updatedAt: new Date().toISOString(),
      };

      let ok = false;
      const targetName = isNeon ? 'Neon Console' : 'Supabase';

      if (isNeon) {
        ok = await neonSyncService.pushData(email, payload);
      } else if (isSupabase) {
        ok = await supabaseSyncService.pushData(email, payload);
      }

      if (ok) {
        setLastSyncedAt(new Date());
        setCloudSyncError(null);
      } else {
        setCloudSyncError(`Gagal menyimpan ke ${targetName}`);
      }
      return ok;
    } catch (err) {
      console.warn('Push cloud error:', err);
      setCloudSyncError('Koneksi terputus saat menyimpan ke cloud');
      return false;
    } finally {
      setIsCloudSyncing(false);
    }
  }, [getUserEmail, profile, habits, tasks, timeBlocks, focusSessions, waterCups, notes]);

  // --- Mesin Tarik Cloud (Pull dari Neon Console atau Supabase) ---
  const pullFromCloud = useCallback(async (isManual = false) => {
    const isNeon = neonSyncService.isConfigured();
    const isSupabase = supabaseService.isConfigured();
    if (!isNeon && !isSupabase) return false;

    const email = getUserEmail();
    if (!email) return false;

    try {
      setIsCloudSyncing(true);
      setCloudSyncError(null);

      let cloudData: AppSyncData | null = null;
      if (isNeon) {
        cloudData = await neonSyncService.pullData(email);
      } else if (isSupabase) {
        cloudData = await supabaseSyncService.pullData(email);
      }

      if (cloudData) {
        applyCloudData(cloudData);
        return true;
      } else if (isManual) {
        // Jika manual pull dan di cloud belum ada baris untuk email ini, dorong data lokal saat ini
        await pushToCloud();
      }
      return false;
    } catch (err) {
      console.warn('Pull cloud error:', err);
      setCloudSyncError('Gagal sinkronisasi data dari cloud');
      return false;
    } finally {
      setIsCloudSyncing(false);
      isInitialPullDone.current = true;
    }
  }, [getUserEmail, applyCloudData, pushToCloud]);

  // Sync saat pertama kali buka app, saat auth login berubah, dan saat tab browser aktif kembali (Laptop <-> HP)
  useEffect(() => {
    // Tarik data saat aplikasi pertama kali dibuka
    pullFromCloud();

    // Dengarkan perubahan login Google
    const unsubscribe = googleAuthService.subscribe((user) => {
      if (user?.email) {
        pullFromCloud();
      }
    });

    // Otomatis tarik data saat pengguna kembali membuka tab browser (Laptop <-> HP real-time feel)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        pullFromCloud();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pullFromCloud]);

  // Auto-push dengan Debounce (1.5 detik setelah user selesai input / ubah data)
  useEffect(() => {
    if (!isInitialPullDone.current) return;
    if (isSyncingRef.current) return;
    if (!neonSyncService.isConfigured() && !supabaseService.isConfigured()) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      pushToCloud();
    }, 1500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [profile, habits, tasks, timeBlocks, focusSessions, waterCups, notes, pushToCloud]);

  // Pemicu Sinkronisasi Manual (Bisa dipanggil dari Header / Tombol Sync)
  const syncWithCloud = useCallback(async (forcePull = false) => {
    if (forcePull) {
      return await pullFromCloud(true);
    } else {
      return await pushToCloud();
    }
  }, [pullFromCloud, pushToCloud]);

  // --- Operasi Habit ---
  const toggleHabitDay = useCallback((habitId: string, dateStr: string) => {
    setHabits(prev =>
      prev.map(h => {
        if (h.id !== habitId) return h;
        const exists = h.logs.includes(dateStr);
        const newLogs = exists ? h.logs.filter(d => d !== dateStr) : [...h.logs, dateStr];

        // Hitung streak beruntun mundur dari hari ini
        let streak = 0;
        let checkDate = new Date();
        // Cek jika hari ini belum dicentang, kita cek apakah kemarin ada streak aktif
        const todayStr = getTodayKey();
        if (!newLogs.includes(todayStr)) {
          checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
          const key = checkDate.toISOString().split('T')[0];
          if (newLogs.includes(key)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        const bestStreak = Math.max(h.bestStreak || 0, streak);

        return {
          ...h,
          logs: newLogs,
          currentStreak: streak,
          bestStreak,
        };
      })
    );
  }, []);

  const addHabit = useCallback((title: string, category: string, icon: string, color: string) => {
    const newHabit: Habit = {
      id: `hbt-${Date.now()}`,
      title,
      category,
      icon,
      color,
      created_at: new Date().toISOString(),
      logs: [getTodayKey()], // langsung centang hari pertama buat motivasi
      currentStreak: 1,
      bestStreak: 1,
    };
    setHabits(prev => [newHabit, ...prev]);
  }, []);

  const deleteHabit = useCallback((habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
  }, []);

  // --- Operasi Task & Eisenhower Matrix ---
  const toggleTask = useCallback((taskId: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, is_completed: !t.is_completed } : t))
    );
  }, []);

  const moveTaskQuadrant = useCallback((taskId: string, newQuadrant: TaskQuadrant) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, priority_quadrant: newQuadrant } : t))
    );
  }, []);

  const addTask = useCallback((task: Omit<TaskItem, 'id' | 'created_at'>) => {
    const newTask: TaskItem = {
      ...task,
      id: `tsk-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  // --- Operasi TimeBlock ---
  const addTimeBlock = useCallback((block: Omit<TimeBlock, 'id'>) => {
    const newBlock: TimeBlock = {
      ...block,
      id: `tb-${Date.now()}`,
    };
    setTimeBlocks(prev => [...prev, newBlock].sort((a, b) => a.start_time.localeCompare(b.start_time)));
  }, []);

  const deleteTimeBlock = useCallback((blockId: string) => {
    setTimeBlocks(prev => prev.filter(b => b.id !== blockId));
  }, []);

  const mergeGoogleTimeBlocks = useCallback((googleBlocks: TimeBlock[]) => {
    setTimeBlocks(prev => {
      const nonGoogle = prev.filter(b => !b.isGoogleEvent);
      return [...nonGoogle, ...googleBlocks].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });
  }, []);

  // --- Operasi Focus Session ---
  const logFocusSession = useCallback((minutes: number, type: 'focus' | 'short_break' | 'long_break') => {
    const newSession: FocusSession = {
      id: `fs-${Date.now()}`,
      duration_minutes: minutes,
      session_type: type,
      completed_at: new Date().toISOString(),
    };
    setFocusSessions(prev => [newSession, ...prev]);
  }, []);

  // --- Operasi Water Intake ---
  const addWaterCup = useCallback(() => {
    setWaterCups(prev => Math.min(20, prev + 1));
  }, []);

  const removeWaterCup = useCallback(() => {
    setWaterCups(prev => Math.max(0, prev - 1));
  }, []);

  const resetWaterCups = useCallback(() => {
    setWaterCups(0);
  }, []);

  // --- Operasi Quick Notes ---
  const addNote = useCallback((content: string) => {
    if (!content.trim()) return;
    const newNote: QuickNote = {
      id: `note-${Date.now()}`,
      content: content.trim(),
      updated_at: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
  }, []);

  const updateNote = useCallback((id: string, content: string) => {
    setNotes(prev =>
      prev.map(n => (n.id === id ? { ...n, content, updated_at: new Date().toISOString() } : n))
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  // --- Reset All Data ---
  const resetAllData = useCallback(() => {
    LocalStorageService.resetAllData();
    setProfile(LocalStorageService.getProfile());
    setHabits(LocalStorageService.getHabits());
    setTasks(LocalStorageService.getTasks());
    setTimeBlocks(LocalStorageService.getTimeBlocks());
    setFocusSessions(LocalStorageService.getFocusSessions());
    setWaterCups(LocalStorageService.getWaterCupsToday());
    setNotes(LocalStorageService.getQuickNotes());
  }, []);

  // --- PRD 3.1: Kalkulasi Daily Metrics & Focus Score ---
  const metrics: DailyMetrics = useMemo(() => {
    const today = getTodayKey();

    // 1. Habits ratio today
    const totalHabits = habits.length;
    const completedHabitsToday = habits.filter(h => h.logs.includes(today)).length;
    const habitRatio = totalHabits > 0 ? completedHabitsToday / totalHabits : 1;

    // 2. Tasks ratio
    const totalTasks = tasks.length;
    const tasksCompleted = tasks.filter(t => t.is_completed).length;
    const taskRatio = totalTasks > 0 ? tasksCompleted / totalTasks : 1;

    // 3. Focus minutes today
    const todaySessions = focusSessions.filter(s => {
      return s.completed_at.startsWith(today) && s.session_type === 'focus';
    });
    const focusMinutesToday = todaySessions.reduce((acc, s) => acc + s.duration_minutes, 0);

    // Target focus: 100 menit (4 sesi Pomodoro)
    const targetFocusMinutes = 100;
    const focusRatio = Math.min(1, focusMinutesToday / targetFocusMinutes);

    // 4. Focus Score formula (Skala 1.0 - 10.0)
    // Bobot: 40% habit completion, 35% task completion, 25% focus time
    const rawScore = 1 + (habitRatio * 3.6 + taskRatio * 3.15 + focusRatio * 2.25);
    const focusScore = Math.min(10.0, Math.max(1.0, parseFloat(rawScore.toFixed(1))));

    // 5. Productivity %
    const productivityPercent = Math.min(
      100,
      Math.round((habitRatio * 0.4 + taskRatio * 0.35 + focusRatio * 0.25) * 100)
    );

    return {
      focusScore,
      tasksCompleted,
      totalTasks,
      focusMinutesToday,
      productivityPercent,
    };
  }, [habits, tasks, focusSessions]);

  return {
    profile,
    setProfile,
    habits,
    tasks,
    timeBlocks,
    focusSessions,
    waterCups,
    notes,
    dailyQuote,
    metrics,
    // Cloud Sync State & Actions
    isCloudSyncing,
    cloudSyncError,
    lastSyncedAt,
    isCloudConfigured: neonSyncService.isConfigured() || supabaseService.isConfigured(),
    cloudProvider: neonSyncService.isConfigured() ? 'neon' : (supabaseService.isConfigured() ? 'supabase' : 'offline'),
    isSupabaseConfigured: supabaseService.isConfigured(),
    isNeonConfigured: neonSyncService.isConfigured(),
    syncWithCloud,
    pushToCloud,
    pullFromCloud,
    // Methods
    toggleHabitDay,
    addHabit,
    deleteHabit,
    toggleTask,
    moveTaskQuadrant,
    addTask,
    deleteTask,
    addTimeBlock,
    deleteTimeBlock,
    mergeGoogleTimeBlocks,
    logFocusSession,
    addWaterCup,
    removeWaterCup,
    resetWaterCups,
    addNote,
    updateNote,
    deleteNote,
    resetAllData,
  };
};
