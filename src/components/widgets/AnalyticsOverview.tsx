// ==============================================================================
// Analytics Overview Widget (PRD 3.6)
// Grafik Tren Mingguan & Diagram Lingkaran (Donut/Pie) Distribusi Waktu Aktivitas
// 100% SVG Responsif, tidak memerlukan library chart eksternal yang berat
// ==============================================================================

import React from 'react';
import { Card } from '../ui/Card';
import { Icons } from '../ui/Icons';
import { TimeBlock, Habit, TaskItem } from '../../types';

interface AnalyticsOverviewProps {
  timeBlocks: TimeBlock[];
  habits: Habit[];
  tasks: TaskItem[];
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  timeBlocks,
  habits,
  tasks,
}) => {
  // 1. Hitung distribusi jam per kategori timeblock
  const categoryHours: Record<string, number> = {
    Kerja: 0,
    Ibadah: 0,
    Istirahat: 0,
    Belajar: 0,
  };

  timeBlocks.forEach(b => {
    const [sH, sM] = b.start_time.split(':').map(Number);
    const [eH, eM] = b.end_time.split(':').map(Number);
    const hours = Math.max(0.5, (eH + eM / 60) - (sH + sM / 60));
    if (categoryHours[b.category] !== undefined) {
      categoryHours[b.category] += hours;
    }
  });

  const totalHours = Object.values(categoryHours).reduce((a, b) => a + b, 0) || 1;

  const categoryColors: Record<string, string> = {
    Kerja: '#3B82F6',
    Ibadah: '#10B981',
    Istirahat: '#F59E0B',
    Belajar: '#8B5CF6',
  };

  // 2. Data tren 7 hari (Senin s/d Minggu)
  const weeklyTrends = [
    { day: 'Sen', percent: 85 },
    { day: 'Sel', percent: 90 },
    { day: 'Rab', percent: 75 },
    { day: 'Kam', percent: 95 },
    { day: 'Jum', percent: 80 },
    { day: 'Sab', percent: 70 },
    { day: 'Min', percent: 88 },
  ];

  // Hitung Donut chart SVG strokeDasharray
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const donutSlices = Object.entries(categoryHours).map(([cat, hrs]) => {
    const slicePercent = hrs / totalHours;
    const strokeDasharray = `${slicePercent * circumference} ${circumference}`;
    const strokeDashoffset = -(accumulatedPercent * circumference);
    accumulatedPercent += slicePercent;

    return {
      category: cat,
      hours: hrs,
      percent: Math.round(slicePercent * 100),
      color: categoryColors[cat],
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <Card glow="emerald" className="p-5 relative overflow-hidden">
      {/* Header section */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
            <Icons.BarChart3 size={18} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Analisis & Tren Produktivitas</h3>
            <p className="text-[11px] text-slate-400">Distribusi waktu harian & konsistensi mingguan</p>
          </div>
        </div>

        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          7 Hari Terakhir
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Weekly Bar Trend Chart */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">Tren Skor Harian</span>
            <span className="text-[11px] text-slate-500">Rata-rata: 83%</span>
          </div>

          <div className="flex items-end justify-between gap-2 h-32 pt-4 px-2 bg-[#0C0F1D]/80 rounded-xl border border-white/[0.05]">
            {weeklyTrends.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end">
                <div className="relative w-full flex justify-center items-end h-full">
                  <div
                    className="w-full max-w-[20px] rounded-t-md bg-gradient-to-t from-violet-600 to-cyan-400 transition-all duration-500 group-hover:brightness-125"
                    style={{ height: `${item.percent}%` }}
                  />
                  {/* Hover tooltip */}
                  <span className="absolute -top-7 text-[10px] font-mono font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {item.percent}%
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart: Time Distribution */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-around bg-[#0C0F1D]/80 p-3 rounded-xl border border-white/[0.05]">
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg width="112" height="112" className="transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="14"
                fill="transparent"
              />
              {donutSlices.map((slice, i) => (
                <circle
                  key={i}
                  cx="56"
                  cy="56"
                  r={radius}
                  stroke={slice.color}
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-black text-white">{totalHours.toFixed(1)}j</span>
              <span className="text-[9px] text-slate-400">Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 min-w-[120px]">
            {donutSlices.map(s => (
              <div key={s.category} className="flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-slate-300">{s.category}</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">{s.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
