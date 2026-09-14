// ==============================================================================
// Hook Manajemen Data Terpusat: Habit, Task, Timeblock, Water, Focus Timer
// Menghitung Otomatis Focus Score & Metrik Produktivitas PRD 3.1
// ==============================================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Habit, TaskItem, TimeBlock, FocusSession, QuickNote, UserProfile, DailyMetrics, TaskQuadrant } from '../types';
import { LocalStorageService, getTodayKey } from '../lib/storage';

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
