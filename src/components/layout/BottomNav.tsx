// ==============================================================================
// Floating Glass Bottom Navigation Bar untuk Layar HP (< 768px) - PRD Bagian 2
// 5 Tab Inti dengan haptic visual micro-animation dan glowing aura indicator
// ==============================================================================

import React, { useState } from 'react';
import { Icons } from '../ui/Icons';
import { NavigationTab } from '../../types';

interface BottomNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const [isHidden, setIsHidden] = useState(false);

  const tabs = [
    { id: 'dashboard' as NavigationTab, label: 'Home', icon: Icons.Grid },
    { id: 'habits' as NavigationTab, label: 'Habits', icon: Icons.Sparkles },
    { id: 'matrix' as NavigationTab, label: 'Matriks', icon: Icons.ListTodo },
    { id: 'schedule' as NavigationTab, label: 'Jadwal', icon: Icons.Calendar },
    { id: 'timer' as NavigationTab, label: 'Fokus', icon: Icons.Clock },
  ];

  if (isHidden) {
    return (
      <button
        onClick={() => setIsHidden(false)}
        className="fixed bottom-3 right-3 z-40 md:hidden p-3 rounded-2xl bg-[#111424]/90 backdrop-blur-2xl border border-violet-500/40 text-cyan-400 shadow-[0_10px_30px_rgba(0,0,0,0.8)] cursor-pointer active:scale-95 transition-all animate-in fade-in"
        title="Tampilkan Menu Navigasi"
      >
        <Icons.PanelLeftOpen size={18} />
      </button>
    );
  }

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-40 md:hidden transition-all duration-300">
      <div className="bg-[#111424]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center justify-around relative">
        {tabs.map(tab => {
          const isActive = currentTab === tab.id;
          const IconComponent = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 relative flex-1 cursor-pointer ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Glowing Background Capsule for Active Tab */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-violet-600/30 to-cyan-500/10 rounded-xl border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
              )}

              <span className={`relative z-10 transition-transform ${isActive ? 'scale-110 text-cyan-400' : ''}`}>
                <IconComponent size={20} />
              </span>
              <span
                className={`relative z-10 text-[10px] mt-1 font-medium tracking-tight ${
                  isActive ? 'font-bold text-white' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Minimal Hide Button for Immersive Fullscreen HP */}
        <button
          onClick={() => setIsHidden(true)}
          className="p-1.5 ml-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
          title="Sembunyikan Menu"
        >
          <Icons.EyeOff size={14} />
        </button>
      </div>
    </nav>
  );
};
