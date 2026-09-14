// ==============================================================================
// Aura Habit & Productivity Tracker - Core Root Application (Cyber-Obsidian)
// Responsive Universal UI: Desktop 3-Column Bento, Mobile Nav, & Command Palette (Ctrl+K)
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useResponsive } from './hooks/useResponsive';
import { useHabitData } from './hooks/useHabitData';
import { useAuth } from './hooks/useAuth';
import { supabaseService } from './lib/supabase';
import { GoogleCalendarService } from './lib/googleCalendar';
import { notificationService } from './lib/notificationService';
import { soundSynth } from './lib/audioSynth';
import { NavigationTab, TaskQuadrant } from './types';

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { HeaderOverview } from './components/layout/HeaderOverview';
import { SettingsModal } from './components/layout/SettingsModal';
import { CommandPalette } from './components/ui/CommandPalette';
import { LoginModal } from './components/auth/LoginModal';
import { AuthGate } from './components/auth/AuthGate';

// Feature Components
import { HabitTrackerMatrix } from './components/habits/HabitTrackerMatrix';
import { AddHabitModal } from './components/habits/AddHabitModal';
import { EisenhowerMatrix } from './components/tasks/EisenhowerMatrix';
import { AddTaskModal } from './components/tasks/AddTaskModal';
import { ScheduleTimeline } from './components/schedule/ScheduleTimeline';
import { AddTimeBlockModal } from './components/schedule/AddTimeBlockModal';
import { PomodoroTimer } from './components/timer/PomodoroTimer';
import { AmbientSoundWidget } from './components/timer/AmbientSoundWidget';
import { WaterIntakeTracker } from './components/widgets/WaterIntakeTracker';
import { QuickNotesWidget } from './components/widgets/QuickNotesWidget';
import { UpcomingDeadlines } from './components/widgets/UpcomingDeadlines';
import { AnalyticsOverview } from './components/widgets/AnalyticsOverview';

export default function App() {
  const { isDesktop, isMobile } = useResponsive();
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  // Otentikasi Google OAuth 2.0
  const { isAuthenticated } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [calendarSyncError, setCalendarSyncError] = useState<string | null>(null);
  const [calendarSyncSuccess, setCalendarSyncSuccess] = useState<string | null>(null);

  // Sidebar Collapsed / Dock Mode State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('aura_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('aura_sidebar_collapsed', String(next));
      } catch {
        // Safe storage fallback
      }
      return next;
    });
  };

  // Modals state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddTimeBlockOpen, setIsAddTimeBlockOpen] = useState(false);
  const [initialTaskQuadrant, setInitialTaskQuadrant] = useState<TaskQuadrant>(1);

  // Central Habit & Productivity State
  const {
    profile,
    setProfile,
    habits,
    tasks,
    timeBlocks,
    waterCups,
    notes,
    dailyQuote,
    metrics,
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
    deleteNote,
    resetAllData,
    // Supabase Cloud Sync
    isCloudSyncing,
    cloudSyncError,
    lastSyncedAt,
    isSupabaseConfigured,
    syncWithCloud,
  } = useHabitData();

  const isCloudConnected = isSupabaseConfigured;

  // Background Periodic Alarm & Notification Checker (Setiap 15 Detik)
  useEffect(() => {
    const interval = setInterval(() => {
      notificationService.checkScheduledAlarms(timeBlocks);
    }, 15000);
    return () => clearInterval(interval);
  }, [timeBlocks]);

  // Global Keyboard Shortcuts (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleOpenAddTask = (quadrant: TaskQuadrant = 1) => {
    setInitialTaskQuadrant(quadrant);
    setIsAddTaskOpen(true);
  };

  const handleToggleAmbientAudio = () => {
    if (soundSynth.getIsPlaying()) {
      soundSynth.stop();
    } else {
      soundSynth.play('rain');
    }
  };

  // Audio preview handler
  const handlePreviewAudio = (theme: 'rain' | 'waves' | 'bell' | 'off') => {
    if (theme === 'bell') {
      soundSynth.play('bell');
    } else if (theme === 'rain') {
      soundSynth.play('rain');
    }
  };

  // Handler Sinkronisasi Google Calendar Asli
  const handleSyncGoogleCalendar = async () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsSyncingCalendar(true);
    setCalendarSyncError(null);
    setCalendarSyncSuccess(null);

    try {
      const googleBlocks = await GoogleCalendarService.fetchTodayEvents();
      mergeGoogleTimeBlocks(googleBlocks);
      soundSynth.play('bell');
      setCalendarSyncSuccess(`Berhasil menyinkronkan ${googleBlocks.length} agenda Google Calendar ke lini waktu!`);
      setTimeout(() => setCalendarSyncSuccess(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyinkronkan Google Calendar.';
      setCalendarSyncError(msg);
      setTimeout(() => setCalendarSyncError(null), 6000);
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  // Jika Pengguna Belum Login dengan Akun Google Gmail, Tampilkan AuthGate Penuh Layar
  if (!isAuthenticated) {
    return <AuthGate />;
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-violet-500/30">
      {/* 1. Permanent Sidebar for Desktop (> 1024px) dengan Mode Collapsed / Expand */}
      {isDesktop && (
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          profile={profile}
          waterCups={waterCups}
          waterTarget={profile.daily_water_target}
          onAddWater={addWaterCup}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isCloudConnected={isCloudConnected}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto pb-24 md:pb-8 w-full">
        {/* Daily Overview Header (PRD 3.1) */}
        <HeaderOverview
          profile={profile}
          metrics={metrics}
          quote={dailyQuote}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isCloudSyncing={isCloudSyncing}
          cloudSyncError={cloudSyncError}
          lastSyncedAt={lastSyncedAt}
          isSupabaseConfigured={isSupabaseConfigured}
          onManualSync={() => syncWithCloud(false)}
        />

        {/* View Switcher based on Navigation Tab */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            {/* If Desktop: 3-Column Bento Grid Layout (PRD Bagian 2) */}
            {isDesktop ? (
              <div className="grid grid-cols-12 gap-5 items-start">
                {/* Kolom 1 (Kiri - 5 Kolom): Habit Matrix & Quick Notes */}
                <div className="col-span-12 xl:col-span-5 space-y-5">
                  <HabitTrackerMatrix
                    habits={habits}
                    onToggleHabitDay={toggleHabitDay}
                    onOpenAddModal={() => setIsAddHabitOpen(true)}
                    onDeleteHabit={deleteHabit}
                  />
                  <QuickNotesWidget
                    notes={notes}
                    onAddNote={addNote}
                    onDeleteNote={deleteNote}
                  />
                </div>

                {/* Kolom 2 (Tengah - 4 Kolom): Eisenhower Matrix & Deadlines */}
                <div className="col-span-12 xl:col-span-4 space-y-5">
                  <EisenhowerMatrix
                    tasks={tasks}
                    onToggleTask={toggleTask}
                    onMoveQuadrant={moveTaskQuadrant}
                    onDeleteTask={deleteTask}
                    onOpenAddModal={handleOpenAddTask}
                  />
                  <UpcomingDeadlines
                    tasks={tasks}
                    onToggleTask={toggleTask}
                    onOpenMatrixTab={() => setCurrentTab('matrix')}
                  />
                </div>

                {/* Kolom 3 (Kanan - 3 Kolom): Pomodoro, Sound, Water & Analytics */}
                <div className="col-span-12 xl:col-span-3 space-y-5">
                  <PomodoroTimer onSessionCompleted={logFocusSession} />
                  <AmbientSoundWidget />
                  <WaterIntakeTracker
                    cups={waterCups}
                    target={profile.daily_water_target}
                    onAddCup={addWaterCup}
                    onRemoveCup={removeWaterCup}
                    onReset={resetWaterCups}
                  />
                  <AnalyticsOverview
                    timeBlocks={timeBlocks}
                    habits={habits}
                    tasks={tasks}
                  />
                </div>
              </div>
            ) : (
              /* Mobile & Tablet Vertical Stack Layout */
              <div className="space-y-5">
                <HabitTrackerMatrix
                  habits={habits}
                  onToggleHabitDay={toggleHabitDay}
                  onOpenAddModal={() => setIsAddHabitOpen(true)}
                  onDeleteHabit={deleteHabit}
                />
                <EisenhowerMatrix
                  tasks={tasks}
                  onToggleTask={toggleTask}
                  onMoveQuadrant={moveTaskQuadrant}
                  onDeleteTask={deleteTask}
                  onOpenAddModal={handleOpenAddTask}
                />
                <ScheduleTimeline
                  timeBlocks={timeBlocks}
                  onOpenAddModal={() => setIsAddTimeBlockOpen(true)}
                  onDeleteTimeBlock={deleteTimeBlock}
                  onSyncGoogleCalendar={handleSyncGoogleCalendar}
                  isSyncingCalendar={isSyncingCalendar}
                  calendarSyncError={calendarSyncError}
                  calendarSyncSuccess={calendarSyncSuccess}
                  onOpenLoginModal={() => setIsLoginModalOpen(true)}
                  isAuthenticated={isAuthenticated}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PomodoroTimer onSessionCompleted={logFocusSession} />
                  <AmbientSoundWidget />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <WaterIntakeTracker
                    cups={waterCups}
                    target={profile.daily_water_target}
                    onAddCup={addWaterCup}
                    onRemoveCup={removeWaterCup}
                    onReset={resetWaterCups}
                  />
                  <QuickNotesWidget
                    notes={notes}
                    onAddNote={addNote}
                    onDeleteNote={deleteNote}
                  />
                </div>
                <UpcomingDeadlines
                  tasks={tasks}
                  onToggleTask={toggleTask}
                  onOpenMatrixTab={() => setCurrentTab('matrix')}
                />
                <AnalyticsOverview
                  timeBlocks={timeBlocks}
                  habits={habits}
                  tasks={tasks}
                />
              </div>
            )}

            {/* Always display Full Schedule & Time Blocking Bar on Desktop Dashboard */}
            {isDesktop && (
              <ScheduleTimeline
                timeBlocks={timeBlocks}
                onOpenAddModal={() => setIsAddTimeBlockOpen(true)}
                onDeleteTimeBlock={deleteTimeBlock}
                onSyncGoogleCalendar={handleSyncGoogleCalendar}
                isSyncingCalendar={isSyncingCalendar}
                calendarSyncError={calendarSyncError}
                calendarSyncSuccess={calendarSyncSuccess}
                onOpenLoginModal={() => setIsLoginModalOpen(true)}
                isAuthenticated={isAuthenticated}
              />
            )}
          </div>
        )}

        {/* Tab: Habits Only */}
        {currentTab === 'habits' && (
          <div className="space-y-6">
            <HabitTrackerMatrix
              habits={habits}
              onToggleHabitDay={toggleHabitDay}
              onOpenAddModal={() => setIsAddHabitOpen(true)}
              onDeleteHabit={deleteHabit}
            />
            <AnalyticsOverview
              timeBlocks={timeBlocks}
              habits={habits}
              tasks={tasks}
            />
          </div>
        )}

        {/* Tab: Eisenhower Matrix Only */}
        {currentTab === 'matrix' && (
          <div className="space-y-6">
            <EisenhowerMatrix
              tasks={tasks}
              onToggleTask={toggleTask}
              onMoveQuadrant={moveTaskQuadrant}
              onDeleteTask={deleteTask}
              onOpenAddModal={handleOpenAddTask}
            />
            <UpcomingDeadlines
              tasks={tasks}
              onToggleTask={toggleTask}
              onOpenMatrixTab={() => setCurrentTab('matrix')}
            />
          </div>
        )}

        {/* Tab: Schedule & Timeline Only */}
        {currentTab === 'schedule' && (
          <div className="space-y-6">
            <ScheduleTimeline
              timeBlocks={timeBlocks}
              onOpenAddModal={() => setIsAddTimeBlockOpen(true)}
              onDeleteTimeBlock={deleteTimeBlock}
              onSyncGoogleCalendar={handleSyncGoogleCalendar}
              isSyncingCalendar={isSyncingCalendar}
              calendarSyncError={calendarSyncError}
              calendarSyncSuccess={calendarSyncSuccess}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
              isAuthenticated={isAuthenticated}
            />
          </div>
        )}

        {/* Tab: Focus Pomodoro & Sound Only */}
        {currentTab === 'timer' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <PomodoroTimer onSessionCompleted={logFocusSession} />
            <AmbientSoundWidget />
            <WaterIntakeTracker
              cups={waterCups}
              target={profile.daily_water_target}
              onAddCup={addWaterCup}
              onRemoveCup={removeWaterCup}
              onReset={resetWaterCups}
            />
          </div>
        )}

        {/* Tab: Analytics Only */}
        {currentTab === 'analytics' && (
          <div className="space-y-6">
            <AnalyticsOverview
              timeBlocks={timeBlocks}
              habits={habits}
              tasks={tasks}
            />
          </div>
        )}
      </main>

      {/* 2. Floating Bottom Navigation Bar for Mobile (< 768px) */}
      {!isDesktop && (
        <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />
      )}

      {/* Raycast/Linear Style Universal Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setCurrentTab}
        onOpenAddHabit={() => setIsAddHabitOpen(true)}
        onOpenAddTask={() => setIsAddTaskOpen(true)}
        onOpenAddTimeBlock={() => setIsAddTimeBlockOpen(true)}
        onAddWater={addWaterCup}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSound={handleToggleAmbientAudio}
      />

      {/* Global Modals */}
      <AddHabitModal
        isOpen={isAddHabitOpen}
        onClose={() => setIsAddHabitOpen(false)}
        onAddHabit={addHabit}
      />

      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onAddTask={addTask}
        initialQuadrant={initialTaskQuadrant}
      />

      <AddTimeBlockModal
        isOpen={isAddTimeBlockOpen}
        onClose={() => setIsAddTimeBlockOpen(false)}
        onAddTimeBlock={addTimeBlock}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onUpdateProfile={setProfile}
        onResetAllData={resetAllData}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
