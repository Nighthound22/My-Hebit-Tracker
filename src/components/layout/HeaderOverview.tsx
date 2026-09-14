// ==============================================================================
// Header & Daily Overview Bar (Cyber-Obsidian Edition)
// Live Clock, Dynamic Greeting, ⌘K Command Trigger, & Sparkline-Enriched Bento Cards
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Icons } from '../ui/Icons';
import { DailyMetrics, UserProfile } from '../../types';

interface HeaderOverviewProps {
  profile: UserProfile;
  metrics: DailyMetrics;
  quote: { text: string; author: string };
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
}

export const HeaderOverview: React.FC<HeaderOverviewProps> = ({
  profile,
  metrics,
  quote,
  onOpenSettings,
  onOpenCommandPalette,
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const [quoteAnim, setQuoteAnim] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour >= 4 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const formattedDate = time.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = time.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const focusHours = Math.floor(metrics.focusMinutesToday / 60);
  const focusMinutes = metrics.focusMinutesToday % 60;
  const focusDurationString = focusHours > 0 ? `${focusHours}j ${focusMinutes}m` : `${focusMinutes}m`;

  const getScoreBadge = (score: number) => {
    if (score >= 8.5) return { label: 'Optimal Focus', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
    if (score >= 7.0) return { label: 'Productive', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' };
    if (score >= 5.0) return { label: 'Steady Pace', color: 'bg-violet-500/20 text-violet-400 border-violet-500/40' };
    return { label: 'Needs Focus', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
  };

  const scoreBadge = getScoreBadge(metrics.focusScore);

  return (
    <div className="space-y-4 mb-6">
      {/* Top Cybernetic Command Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#121528]/95 via-[#0E111F]/95 to-[#151226]/95 p-5 rounded-2xl border border-white/[0.08] backdrop-blur-2xl relative overflow-hidden shadow-2xl">
        {/* Ambient Radial Lights */}
        <div className="absolute -top-16 -left-16 w-56 h-56 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="relative group">
            <img
              src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={profile.full_name}
              className="w-13 h-13 rounded-2xl object-cover border-2 border-violet-500/40 shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform"
            />
            {/* Live radar pulse on status dot */}
            <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0E111F]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                {getGreeting()},{' '}
                <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                  {profile.full_name}
                </span>
                !
              </h1>
              <span className="text-xl animate-pulse">⚡</span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5 flex items-center gap-2">
              <span>{formattedDate}</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span className="text-cyan-300 font-mono font-bold tracking-wider">{formattedTime} WIB</span>
            </p>
          </div>
        </div>

        {/* Command Palette Pill Trigger & Actions */}
        <div className="relative z-10 flex items-center gap-3">
          {/* Linear / Raycast Style Command Button */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-violet-500/40 text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer group"
            title="Buka Command Palette (Ctrl+K)"
          >
            <Icons.Sparkles size={15} color="#A78BFA" />
            <span className="text-xs font-medium text-slate-300 group-hover:text-white">Cari / Perintah...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-mono text-slate-400 border border-white/10 group-hover:border-violet-500/50">
              ⌘K
            </kbd>
          </button>

          {/* Quote Insight Pill */}
          <div className="hidden xl:flex items-center gap-2 max-w-sm bg-white/[0.03] hover:bg-white/[0.06] transition-colors px-3 py-1.5 rounded-xl border border-white/[0.06]">
            <span className="text-amber-400 shrink-0">
              <Icons.Sparkles size={14} />
            </span>
            <p className="text-[11px] text-slate-300 italic truncate" title={`"${quote.text}" — ${quote.author}`}>
              "{quote.text}"
            </p>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95 shrink-0"
            title="Pengaturan Supabase & Profil"
          >
            <Icons.Settings size={18} />
          </button>
        </div>
      </div>

      {/* 4 Daily Bento Metric Cards with Micro Sparklines */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Metric 1: Focus Score */}
        <Card glow="violet" className="p-4 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Focus Score</span>
            <span className="p-1.5 rounded-lg bg-violet-500/15 text-violet-400 group-hover:scale-110 transition-transform">
              <Icons.Target size={16} />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-white font-mono tracking-tight">
              {metrics.focusScore.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-semibold font-mono">/ 10.0</span>
          </div>

          {/* Micro Sparkline Visual SVG */}
          <div className="my-2 h-5 w-full flex items-center">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path
                d="M0 15 Q20 5, 40 12 T80 4 T100 8"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scoreBadge.color}`}>
              {scoreBadge.label}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">MVP Formula</span>
          </div>
        </Card>

        {/* Metric 2: Tasks Completed */}
        <Card glow="cyan" className="p-4 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tugas Selesai</span>
            <span className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 group-hover:scale-110 transition-transform">
              <Icons.CheckCircle2 size={16} />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-white font-mono tracking-tight">
              {metrics.tasksCompleted}
            </span>
            <span className="text-xs text-slate-500 font-semibold font-mono">/ {metrics.totalTasks} Total</span>
          </div>

          {/* Progress Bar with glowing edge */}
          <div className="my-3">
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#06B6D4]"
                style={{
                  width: `${metrics.totalTasks > 0 ? (metrics.tasksCompleted / metrics.totalTasks) * 100 : 100}%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Matriks Prioritas</span>
            <span className="text-cyan-400 font-mono font-semibold">
              {metrics.totalTasks > 0 ? Math.round((metrics.tasksCompleted / metrics.totalTasks) * 100) : 100}% Selesai
            </span>
          </div>
        </Card>

        {/* Metric 3: Focus Time */}
        <Card glow="amber" className="p-4 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Waktu Fokus</span>
            <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
              <Icons.Clock size={16} />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-white font-mono tracking-tight">
              {focusDurationString}
            </span>
          </div>

          {/* Mini pulse bars */}
          <div className="my-2 h-5 flex items-end gap-1">
            {[30, 60, 45, 80, 50, 90, 70, 100].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-amber-500/30 rounded-t-sm transition-all group-hover:bg-amber-400"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Sesi Pomodoro</span>
            <span className="text-amber-400 font-mono font-medium">Target 1j 40m</span>
          </div>
        </Card>

        {/* Metric 4: Productivity % */}
        <Card glow="emerald" className="p-4 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Produktivitas</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:scale-110 transition-transform">
              <Icons.TrendingUp size={16} />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-emerald-400 font-mono tracking-tight">
              {metrics.productivityPercent}%
            </span>
            <span className="text-xs text-slate-500 font-semibold">Tercapai</span>
          </div>

          {/* Sparkline Visual SVG */}
          <div className="my-2 h-5 w-full flex items-center">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path
                d="M0 16 Q25 14, 45 8 T75 6 T100 2"
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-medium">
            <Icons.Flame size={12} color="#10B981" />
            <span>Ritme harian luar biasa!</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
