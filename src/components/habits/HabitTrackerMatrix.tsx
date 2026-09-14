// ==============================================================================
// Habit Tracker Matrix (Cyber-Obsidian Edition)
// Weekly Matrix, Completion Velocity Metric, Golden Streak Badges, & Search Filter
// ==============================================================================

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';
import { Habit } from '../../types';
import { getTodayKey } from '../../lib/storage';

interface HabitTrackerMatrixProps {
  habits: Habit[];
  onToggleHabitDay: (habitId: string, dateStr: string) => void;
  onOpenAddModal: () => void;
  onDeleteHabit: (habitId: string) => void;
}

export const HabitTrackerMatrix: React.FC<HabitTrackerMatrixProps> = ({
  habits,
  onToggleHabitDay,
  onOpenAddModal,
  onDeleteHabit,
}) => {
  const getWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);

    const labels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === getTodayKey();

      days.push({
        label: labels[i],
        dayNumber: d.getDate(),
        dateStr,
        isToday,
      });
    }
    return days;
  };

  const weekDays = getWeekDays();
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['Semua', ...Array.from(new Set(habits.map(h => h.category)))];

  // Hitung completion velocity mingguan
  const totalSlots = habits.length * 7;
  let completedSlots = 0;
  habits.forEach(h => {
    weekDays.forEach(d => {
      if (h.logs.includes(d.dateStr)) completedSlots++;
    });
  });
  const weeklyVelocity = totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0;

  const filteredHabits = habits.filter(h => {
    const matchCat = activeCategory === 'Semua' || h.category === activeCategory;
    const matchSearch = h.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <Card glow="violet" className="p-5 relative overflow-hidden">
      {/* Header section with Weekly Velocity Metric */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-violet-500/15 text-violet-400">
              <Icons.Sparkles size={18} />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">Pelacak Kebiasaan (Habit Matrix)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Konsistensi mingguan & perhitungan streak beruntun harian.
          </p>
        </div>

        {/* Weekly Velocity Metric Pill */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Weekly Velocity
            </span>
            <span className="text-xs font-mono font-bold text-violet-300">
              {weeklyVelocity}% Terpenuhi
            </span>
          </div>

          <Button
            variant="aura"
            size="sm"
            icon={<Icons.Plus size={16} />}
            onClick={onOpenAddModal}
          >
            Tambah Kebiasaan
          </Button>
        </div>
      </div>

      {/* Category Pills & Quick Filter Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[150px]">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari kebiasaan..."
            className="w-full pl-3 pr-3 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-violet-500/50"
          />
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="py-2.5 px-3 text-xs font-semibold text-slate-400">Kebiasaan & Kategori</th>
              <th className="py-2.5 px-2 text-center text-xs font-semibold text-slate-400">Streak</th>
              {weekDays.map(d => (
                <th key={d.dateStr} className="py-2.5 px-1.5 text-center">
                  <div className={`flex flex-col items-center justify-center p-1 rounded-lg transition-colors ${
                    d.isToday ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
                  }`}>
                    <span className="text-[10px] uppercase font-bold tracking-wider">{d.label}</span>
                    <span className="text-xs font-mono font-semibold">{d.dayNumber}</span>
                  </div>
                </th>
              ))}
              <th className="py-2.5 px-2 text-center text-xs font-semibold text-slate-400">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredHabits.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-500 text-sm">
                  Tidak ada kebiasaan yang cocok. Klik "Tambah Kebiasaan" di atas!
                </td>
              </tr>
            ) : (
              filteredHabits.map(habit => {
                const habitDoneThisWeek = weekDays.filter(d => habit.logs.includes(d.dateStr)).length;
                const habitWeekRate = Math.round((habitDoneThisWeek / 7) * 100);

                return (
                  <tr key={habit.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Title & Category with mini progress */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: habit.color || '#8B5CF6' }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                            {habit.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-semibold text-slate-400 bg-white/[0.05] px-1.5 py-0.2 rounded">
                              {habit.category}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">
                              {habitWeekRate}% Minggu Ini
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Streak Count with Flame */}
                    <td className="py-3 px-2 text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/40 text-amber-300 text-xs font-black font-mono shadow-sm">
                        <Icons.Flame size={12} color="#F59E0B" />
                        <span>{habit.currentStreak}d</span>
                      </div>
                    </td>

                    {/* 7-day checkboxes */}
                    {weekDays.map(day => {
                      const isCompleted = habit.logs.includes(day.dateStr);

                      return (
                        <td key={day.dateStr} className="py-3 px-1.5 text-center">
                          <button
                            onClick={() => onToggleHabitDay(habit.id, day.dateStr)}
                            title={`${habit.title}: ${day.label} (${isCompleted ? 'Selesai' : 'Belum'})`}
                            className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                              isCompleted
                                ? 'shadow-md scale-105'
                                : 'bg-slate-800/60 hover:bg-slate-700/80 border border-white/10'
                            }`}
                            style={{
                              backgroundColor: isCompleted ? (habit.color || '#8B5CF6') : undefined,
                              boxShadow: isCompleted ? `0 0 12px ${habit.color || '#8B5CF6'}90` : undefined,
                            }}
                          >
                            {isCompleted ? (
                              <Icons.Check size={14} color="#FFFFFF" strokeWidth={3} />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                            )}
                          </button>
                        </td>
                      );
                    })}

                    {/* Delete Action */}
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => onDeleteHabit(habit.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-60 group-hover:opacity-100"
                        title="Hapus kebiasaan"
                      >
                        <Icons.Trash size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
