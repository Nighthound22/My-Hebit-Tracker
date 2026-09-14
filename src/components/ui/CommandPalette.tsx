// ==============================================================================
// Command Palette Modal (Ctrl+K / ⌘K) — Raycast / Linear Style Quick Actions
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { NavigationTab } from '../../types';

export interface CommandItem {
  id: string;
  category: 'Navigasi' | 'Aksi Cepat' | 'Fokus & Audio';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenAddHabit: () => void;
  onOpenAddTask: () => void;
  onOpenAddTimeBlock: () => void;
  onAddWater: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenAddHabit,
  onOpenAddTask,
  onOpenAddTimeBlock,
  onAddWater,
  onOpenSettings,
  onToggleSound,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    // Navigasi
    {
      id: 'nav-dashboard',
      category: 'Navigasi',
      title: 'Buka Dashboard Utama',
      subtitle: 'Ringkasan harian, 3-kolom grid & metrik',
      icon: <Icons.Grid size={16} color="#8B5CF6" />,
      shortcut: 'G D',
      action: () => {
        onSelectTab('dashboard');
        onClose();
      },
    },
    {
      id: 'nav-habits',
      category: 'Navigasi',
      title: 'Buka Habit Tracker',
      subtitle: 'Matriks mingguan & konsistensi kebiasaan',
      icon: <Icons.Sparkles size={16} color="#06B6D4" />,
      shortcut: 'G H',
      action: () => {
        onSelectTab('habits');
        onClose();
      },
    },
    {
      id: 'nav-matrix',
      category: 'Navigasi',
      title: 'Buka Matriks Eisenhower',
      subtitle: 'Manajemen prioritas tugas 4 kuadran',
      icon: <Icons.ListTodo size={16} color="#10B981" />,
      shortcut: 'G M',
      action: () => {
        onSelectTab('matrix');
        onClose();
      },
    },
    {
      id: 'nav-schedule',
      category: 'Navigasi',
      title: 'Buka Jadwal & Lini Waktu',
      subtitle: 'Time blocking visual 24 jam',
      icon: <Icons.Calendar size={16} color="#F59E0B" />,
      shortcut: 'G S',
      action: () => {
        onSelectTab('schedule');
        onClose();
      },
    },
    {
      id: 'nav-timer',
      category: 'Navigasi',
      title: 'Buka Pomodoro & Ambient Studio',
      subtitle: 'Ruang fokus timer & synthesizer suara',
      icon: <Icons.Clock size={16} color="#EC4899" />,
      shortcut: 'G T',
      action: () => {
        onSelectTab('timer');
        onClose();
      },
    },
    {
      id: 'nav-analytics',
      category: 'Navigasi',
      title: 'Buka Analisis & Tren',
      subtitle: 'Grafik performa & distribusi waktu',
      icon: <Icons.BarChart3 size={16} color="#3B82F6" />,
      shortcut: 'G A',
      action: () => {
        onSelectTab('analytics');
        onClose();
      },
    },

    // Aksi Cepat
    {
      id: 'act-add-habit',
      category: 'Aksi Cepat',
      title: 'Tambah Kebiasaan Baru',
      subtitle: 'Buat target kebiasaan harian baru',
      icon: <Icons.Plus size={16} color="#8B5CF6" />,
      shortcut: 'N H',
      action: () => {
        onClose();
        onOpenAddHabit();
      },
    },
    {
      id: 'act-add-task',
      category: 'Aksi Cepat',
      title: 'Tambah Tugas Baru ke Matriks',
      subtitle: 'Input tugas ke kuadran Eisenhower',
      icon: <Icons.Plus size={16} color="#10B981" />,
      shortcut: 'N T',
      action: () => {
        onClose();
        onOpenAddTask();
      },
    },
    {
      id: 'act-add-timeblock',
      category: 'Aksi Cepat',
      title: 'Tambah Blok Jadwal (Time Block)',
      subtitle: 'Alokasikan jam fokus baru',
      icon: <Icons.Calendar size={16} color="#F59E0B" />,
      shortcut: 'N B',
      action: () => {
        onClose();
        onOpenAddTimeBlock();
      },
    },
    {
      id: 'act-add-water',
      category: 'Aksi Cepat',
      title: 'Catat +1 Gelas Air Minum',
      subtitle: 'Tingkatkan counter hidrasi harian',
      icon: <Icons.Droplet size={16} color="#06B6D4" />,
      shortcut: 'W',
      action: () => {
        onAddWater();
        onClose();
      },
    },
    {
      id: 'act-settings',
      category: 'Aksi Cepat',
      title: 'Buka Pengaturan Supabase & Profil',
      subtitle: 'Sinkronisasi database & konfigurasi akun',
      icon: <Icons.Settings size={16} color="#94A3B8" />,
      shortcut: ',',
      action: () => {
        onClose();
        onOpenSettings();
      },
    },

    // Fokus & Audio
    {
      id: 'act-toggle-sound',
      category: 'Fokus & Audio',
      title: 'Putar / Hentikan Ambient Audio',
      subtitle: 'Nyalakan simulator suara hujan & binaural',
      icon: <Icons.Headphones size={16} color="#22D3EE" />,
      shortcut: 'M',
      action: () => {
        onToggleSound();
        onClose();
      },
    },
  ];

  // Filter commands by query
  const filtered = commands.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    (c.subtitle && c.subtitle.toLowerCase().includes(query.toLowerCase())) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-xl rounded-2xl bg-[#0D101D] border border-white/10 shadow-2xl overflow-hidden z-10"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(139, 92, 246, 0.2)',
        }}
      >
        {/* Top Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-[#111425]/60">
          <span className="text-violet-400">
            <Icons.Sparkles size={18} />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ketik perintah atau cari fitur... (misal: 'habits', 'tugas', 'hujan')"
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-white/[0.08] text-[11px] font-mono text-slate-400 border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-transparent">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Tidak ada perintah yang cocok dengan "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-violet-600/30 to-cyan-500/15 text-white border border-violet-500/40 shadow-sm'
                      : 'text-slate-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="p-1.5 rounded-lg bg-white/[0.05] shrink-0">
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-[10px] text-slate-400 truncate">{item.subtitle}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] font-mono text-slate-400 border border-white/10">
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Footer Navigation Hint */}
        <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-t border-white/[0.05] text-[10px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono text-slate-300">↑↓</kbd> Navigasi
            </span>
            <span>
              <kbd className="font-mono text-slate-300">↵</kbd> Jalankan
            </span>
          </div>
          <span className="text-slate-500">Aura Command System</span>
        </div>
      </div>
    </div>
  );
};
