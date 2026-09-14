// ==============================================================================
// Sidebar Navigasi Desktop Permanen (> 1024px) - PRD Bagian 2
// Glassmorphic border, active indicators, live water shortcut, & status Supabase
// ==============================================================================

import React from 'react';
import { Icons } from '../ui/Icons';
import { NavigationTab, UserProfile } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  profile: UserProfile;
  waterCups: number;
  waterTarget: number;
  onAddWater: () => void;
  onOpenSettings: () => void;
  isCloudConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  profile,
  waterCups,
  waterTarget,
  onAddWater,
  onOpenSettings,
  isCloudConnected,
}) => {
  const { user } = useAuth();
  const displayName = user?.name || profile.full_name;
  const displayAvatar = user?.picture || profile.avatar_url;
  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: Icons.Grid, badge: null },
    { id: 'habits' as NavigationTab, label: 'Habit Tracker', icon: Icons.Sparkles, badge: '5 Aktif' },
    { id: 'matrix' as NavigationTab, label: 'Matriks Tugas', icon: Icons.ListTodo, badge: null },
    { id: 'schedule' as NavigationTab, label: 'Jadwal & Lini Waktu', icon: Icons.Calendar, badge: null },
    { id: 'timer' as NavigationTab, label: 'Fokus & Pomodoro', icon: Icons.Clock, badge: 'Sound' },
    { id: 'analytics' as NavigationTab, label: 'Analitik & Tren', icon: Icons.BarChart3, badge: null },
  ];

  return (
    <aside className="w-64 h-screen sticky top-0 bg-[#0E111D]/90 border-r border-white/[0.08] backdrop-blur-2xl flex flex-col justify-between p-4 select-none shrink-0 z-30">
      {/* Top Header: Brand Identity */}
      <div>
        <div className="flex items-center gap-3 px-3 py-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-600/30 text-white">
            <Icons.Sparkles size={22} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg text-white tracking-tight">AURA</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
                MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Habit & Productivity</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            const IconComponent = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/25 to-cyan-500/10 text-white border border-violet-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <IconComponent size={19} />
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Active Neon Aura Bar */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-violet-400 to-cyan-400 rounded-r-full shadow-[0_0_10px_#06B6D4]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Middle/Bottom: Water Intake Quick Widget & Supabase Status */}
      <div className="space-y-3 pt-4 border-t border-white/[0.07]">
        {/* Quick Water Widget */}
        <div className="bg-[#141727]/90 p-3 rounded-xl border border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <Icons.Droplet size={14} />
              <span>Water Intake</span>
            </div>
            <span className="text-xs font-bold text-white font-mono">
              {waterCups}/{waterTarget} Cup
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-2.5">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_#06B6D4]"
              style={{ width: `${Math.min(100, (waterCups / waterTarget) * 100)}%` }}
            />
          </div>

          <button
            onClick={onAddWater}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition-all active:scale-95 cursor-pointer"
          >
            <Icons.Plus size={13} />
            <span>+1 Gelas Cepat</span>
          </button>
        </div>

        {/* Database Sync Status */}
        <div
          onClick={onOpenSettings}
          className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-colors cursor-pointer"
          title="Klik untuk konfigurasi Supabase Sync"
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isCloudConnected ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]' : 'bg-cyan-400 shadow-[0_0_8px_#06B6D4]'
              }`}
            />
            <span className="text-xs text-slate-300">
              {isCloudConnected ? 'Supabase Sync' : 'Offline Mode'}
            </span>
          </div>
          <Icons.Settings size={14} color="#94A3B8" />
        </div>

        {/* User Snapshot Profile */}
        <div className="flex items-center gap-3 px-1 py-1">
          <img
            src={displayAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={displayName}
            className="w-9 h-9 rounded-xl object-cover border border-violet-500/30"
          />
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{displayName}</p>
            <p className="text-[10px] text-emerald-400 truncate font-medium">
              {user ? '✓ Google Verified' : 'Aura Pro Member'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
