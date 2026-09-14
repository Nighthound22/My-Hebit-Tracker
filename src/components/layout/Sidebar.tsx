// ==============================================================================
// Sidebar Navigasi Desktop Permanen (> 1024px) — Cyber-Obsidian Edition
// Mendukung Mode Ganda: Full Expanded (256px) & Collapsed Cyber-Dock (80px)
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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { user, logout } = useAuth();
  const displayName = profile.full_name || user?.name || 'Aura User';
  const displayAvatar =
    profile.avatar_url && !profile.avatar_url.includes('photo-1534528741775-53994a69daeb')
      ? profile.avatar_url
      : user?.picture || profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: Icons.Grid, badge: null },
    { id: 'habits' as NavigationTab, label: 'Habit Tracker', icon: Icons.Sparkles, badge: '5 Aktif' },
    { id: 'matrix' as NavigationTab, label: 'Matriks Tugas', icon: Icons.ListTodo, badge: null },
    { id: 'schedule' as NavigationTab, label: 'Jadwal & Lini Waktu', icon: Icons.Calendar, badge: null },
    { id: 'timer' as NavigationTab, label: 'Fokus & Pomodoro', icon: Icons.Clock, badge: 'Sound' },
    { id: 'analytics' as NavigationTab, label: 'Analitik & Tren', icon: Icons.BarChart3, badge: null },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-[#0E111D]/95 border-r border-white/[0.08] backdrop-blur-2xl flex flex-col justify-between select-none shrink-0 z-30 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20 p-2.5 items-center' : 'w-64 p-4'
      }`}
    >
      {/* Top Header: Brand Identity & Toggle Button */}
      <div className="w-full">
        <div
          className={`flex items-center mb-6 px-1 py-2 ${
            isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-600/30 text-white shrink-0">
              <Icons.Sparkles size={22} />
            </div>
            {!isCollapsed && (
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg text-white tracking-tight">AURA</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    MVP
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Habit & Productivity</p>
              </div>
            )}
          </div>

          {/* Toggle Collapse/Expand Button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white border border-white/[0.08] transition-all cursor-pointer active:scale-95"
              title={isCollapsed ? 'Perluas Kolom Fitur' : 'Sembunyikan / Perkecil Kolom Fitur'}
            >
              {isCollapsed ? <Icons.PanelLeftOpen size={16} /> : <Icons.PanelLeftClose size={16} />}
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 w-full">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            const IconComponent = item.icon;

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center rounded-xl text-sm font-medium transition-all duration-200 relative cursor-pointer ${
                    isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'
                  } ${
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
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
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

                {/* Cyberpunk Floating Tooltip saat Collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl bg-[#111424] border border-white/10 shadow-2xl text-xs font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50">
                    <p>{item.label}</p>
                    {item.badge && <span className="text-[10px] text-cyan-300 font-normal">● {item.badge}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Middle/Bottom: Water Intake Quick Widget & Supabase Status */}
      <div className="space-y-3 pt-4 border-t border-white/[0.07] w-full">
        {/* Quick Water Widget */}
        {!isCollapsed ? (
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
        ) : (
          <button
            onClick={onAddWater}
            className="w-full py-2 flex flex-col items-center justify-center gap-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 cursor-pointer transition-all active:scale-95"
            title={`Water Intake: ${waterCups}/${waterTarget} Gelas (Klik untuk +1)`}
          >
            <Icons.Droplet size={16} />
            <span className="text-[10px] font-mono font-bold">{waterCups}</span>
          </button>
        )}

        {/* Database Sync Status */}
        <div
          onClick={onOpenSettings}
          className={`flex items-center rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center p-2' : 'justify-between p-2.5'
          }`}
          title="Klik untuk konfigurasi Database & Profil"
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isCloudConnected ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]' : 'bg-cyan-400 shadow-[0_0_8px_#06B6D4]'
              }`}
            />
            {!isCollapsed && (
              <span className="text-xs text-slate-300">
                {isCloudConnected ? 'Neon Sync' : 'Offline Mode'}
              </span>
            )}
          </div>
          {!isCollapsed && <Icons.Settings size={14} color="#94A3B8" />}
        </div>

        {/* User Snapshot Profile with Verified Status & Logout */}
        <div
          className={`flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div
            className={`flex items-center gap-2.5 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}
            title={`${displayName} (${user?.email || 'Google Verified'})`}
          >
            <div className="relative shrink-0">
              <img
                src={displayAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={displayName}
                className="w-9 h-9 rounded-xl object-cover border border-violet-500/40 shrink-0"
              />
              {user && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0E111D] rounded-full" />
              )}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{displayName}</p>
                <p className="text-[10px] text-emerald-400 truncate font-semibold flex items-center gap-1">
                  <span>✓</span>
                  <span>Google Verified</span>
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={() => {
                if (window.confirm('Apakah antum yakin ingin keluar dari akun ini?')) {
                  logout();
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/15 border border-transparent hover:border-red-500/30 transition-all cursor-pointer shrink-0"
              title="Keluar / Logout Akun"
            >
              <Icons.LogOut size={15} />
            </button>
          )}
        </div>

        {/* Collapsed Logout Icon Button */}
        {isCollapsed && (
          <button
            onClick={() => {
              if (window.confirm('Apakah antum yakin ingin keluar dari akun ini?')) {
                logout();
              }
            }}
            className="w-full py-2 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/15 border border-white/[0.06] hover:border-red-500/30 transition-all cursor-pointer"
            title="Keluar / Logout Akun"
          >
            <Icons.LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
};
