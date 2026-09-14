// ==============================================================================
// Penjadwalan & Lini Waktu (Cyber-Obsidian Edition)
// Smart Active Banner ("Sedang Berlangsung"), Radar Pulse Needle, & 4-Category Timeblocks
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';
import { TimeBlock } from '../../types';
import { TIMEBLOCK_CATEGORIES } from '../../styles/theme';

interface ScheduleTimelineProps {
  timeBlocks: TimeBlock[];
  onOpenAddModal: () => void;
  onDeleteTimeBlock: (id: string) => void;
}

export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({
  timeBlocks,
  onOpenAddModal,
  onDeleteTimeBlock,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const currentHourFloat = currentTime.getHours() + currentTime.getMinutes() / 60;

  // Temukan blok jadwal yang sedang aktif sekarang
  const activeBlock = timeBlocks.find(b => {
    const [sH, sM] = b.start_time.split(':').map(Number);
    const [eH, eM] = b.end_time.split(':').map(Number);
    const startMin = sH * 60 + sM;
    const endMin = eH * 60 + eM;
    return currentMinutes >= startMin && currentMinutes < endMin;
  });

  // Hitung sisa menit pada blok aktif
  const getRemainingMinutes = (block: TimeBlock) => {
    const [eH, eM] = block.end_time.split(':').map(Number);
    const endMin = eH * 60 + eM;
    return Math.max(0, endMin - currentMinutes);
  };

  const startHour = 5;
  const endHour = 23;
  const totalTimelineHours = endHour - startHour; // 18 jam

  const clampedHour = Math.max(startHour, Math.min(endHour, currentHourFloat));
  const currentPositionPercent = ((clampedHour - startHour) / totalTimelineHours) * 100;

  const calculateBlockPosition = (startTimeStr: string, endTimeStr: string) => {
    const [sH, sM] = startTimeStr.split(':').map(Number);
    const [eH, eM] = endTimeStr.split(':').map(Number);

    const startVal = sH + sM / 60;
    const endVal = eH + eM / 60;

    const left = Math.max(0, ((startVal - startHour) / totalTimelineHours) * 100);
    const width = Math.max(3.5, ((endVal - startVal) / totalTimelineHours) * 100);

    return { left: `${left}%`, width: `${width}%` };
  };

  const hoursArray = [];
  for (let h = startHour; h <= endHour; h += 2) {
    hoursArray.push(`${h.toString().padStart(2, '0')}:00`);
  }

  const activeCategoryCfg = activeBlock
    ? TIMEBLOCK_CATEGORIES[activeBlock.category] || TIMEBLOCK_CATEGORIES.Kerja
    : null;

  return (
    <Card glow="cyan" className="p-5 relative overflow-hidden">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
              <Icons.Calendar size={18} />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">Penjadwalan & Lini Waktu</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual Time Blocking 24 Jam dengan deteksi jadwal aktif dan penanda jam real-time.
          </p>
        </div>

        <Button
          variant="aura"
          size="sm"
          icon={<Icons.Plus size={16} />}
          onClick={onOpenAddModal}
        >
          Tambah Blok Jadwal
        </Button>
      </div>

      {/* Smart Active Status Banner */}
      {activeBlock && activeCategoryCfg ? (
        <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-violet-950/30 border border-cyan-500/30 flex items-center justify-between gap-3 shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-3">
            {/* Radar Pulse Beacon */}
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-xl bg-cyan-400 opacity-30" />
              <Icons.Clock size={16} color="#22D3EE" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Sedang Berlangsung Sekarang
                </span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  {activeBlock.start_time} - {activeBlock.end_time}
                </span>
              </div>
              <p className="text-sm font-bold text-white mt-0.5">{activeBlock.title}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-mono font-black text-cyan-400 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
              {getRemainingMinutes(activeBlock)}m Tersisa
            </span>
          </div>
        </div>
      ) : (
        <div className="mb-5 p-3 rounded-xl bg-slate-900/40 border border-white/[0.05] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>Tidak ada jadwal khusus saat ini — Waktu Fleksibel</span>
          </div>
          <span className="text-[11px] text-cyan-400 cursor-pointer font-medium" onClick={onOpenAddModal}>
            + Buat Blok Baru
          </span>
        </div>
      )}

      {/* Category Legend */}
      <div className="flex items-center gap-4 flex-wrap mb-5 pb-3 border-b border-white/[0.05]">
        {Object.entries(TIMEBLOCK_CATEGORIES).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shadow-sm"
              style={{ backgroundColor: cfg.color }}
            />
            <span className="text-xs font-medium text-slate-300">{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Visual Horizontal Timeline Track (Desktop & Tablet) */}
      <div className="hidden md:block mb-6 relative pt-4 pb-2 bg-[#0C0F1D]/80 rounded-2xl p-4 border border-white/[0.06]">
        {/* Hour markers on top */}
        <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-2 px-1">
          {hoursArray.map(h => (
            <span key={h}>{h}</span>
          ))}
        </div>

        {/* Timeline Bar Track */}
        <div className="relative h-14 bg-slate-900/90 rounded-xl border border-white/[0.08] overflow-hidden">
          {/* Vertical hour grid lines */}
          {hoursArray.map((_, idx) => (
            <div
              key={idx}
              className="absolute top-0 bottom-0 border-l border-white/[0.04]"
              style={{ left: `${(idx / (hoursArray.length - 1)) * 100}%` }}
            />
          ))}

          {/* Time Blocks on the track */}
          {timeBlocks.map(block => {
            const cfg = TIMEBLOCK_CATEGORIES[block.category] || TIMEBLOCK_CATEGORIES.Kerja;
            const { left, width } = calculateBlockPosition(block.start_time, block.end_time);

            return (
              <div
                key={block.id}
                className="absolute top-1.5 bottom-1.5 rounded-lg px-2 flex items-center justify-between overflow-hidden shadow-sm transition-transform hover:scale-[1.01] group z-10 cursor-pointer"
                style={{
                  left,
                  width,
                  backgroundColor: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  color: cfg.text,
                }}
                title={`${block.title} (${block.start_time} - ${block.end_time})`}
              >
                <span className="text-xs font-bold truncate">{block.title}</span>
                <span className="text-[10px] font-mono opacity-80 shrink-0 ml-1 hidden lg:inline">
                  {block.start_time}
                </span>
              </div>
            );
          })}

          {/* Real-time Current Time Indicator Line with Radar Ping */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 shadow-[0_0_12px_#EF4444] transition-all duration-500"
            style={{ left: `${currentPositionPercent}%` }}
          >
            <div className="relative">
              <span className="animate-ping absolute -left-1.5 -top-1.5 inline-flex h-4 w-4 rounded-full bg-red-400 opacity-60" />
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1 -top-1 absolute shadow-[0_0_10px_#EF4444]" />
            </div>
            <div className="text-[9px] font-mono font-bold text-red-300 bg-red-950/80 px-1.5 py-0.5 rounded absolute -top-5 -left-4 whitespace-nowrap border border-red-500/40 shadow-sm">
              Sekarang
            </div>
          </div>
        </div>
      </div>

      {/* List of Time Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {timeBlocks.map(block => {
          const cfg = TIMEBLOCK_CATEGORIES[block.category] || TIMEBLOCK_CATEGORIES.Kerja;

          return (
            <div
              key={block.id}
              className="p-3 rounded-xl border transition-all hover:bg-white/[0.04] group flex items-center justify-between gap-2"
              style={{
                backgroundColor: cfg.bg,
                borderColor: cfg.border,
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2 h-8 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: cfg.color }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{block.title}</p>
                  <p className="text-[11px] font-mono text-slate-300">
                    {block.start_time} - {block.end_time}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-md font-semibold"
                  style={{
                    backgroundColor: `${cfg.color}25`,
                    color: cfg.color,
                  }}
                >
                  {block.category}
                </span>

                <button
                  onClick={() => onDeleteTimeBlock(block.id)}
                  className="p-1 text-slate-400 hover:text-red-400 rounded opacity-60 group-hover:opacity-100 transition-colors"
                  title="Hapus blok jadwal"
                >
                  <Icons.Trash size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
