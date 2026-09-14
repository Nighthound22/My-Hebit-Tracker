// ==============================================================================
// Penjadwalan & Lini Waktu (Cyber-Obsidian Edition)
// Smart Active Banner, Google Calendar Two-Way Sync, & Real-Time Alarm Alerts
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';
import { TimeBlock } from '../../types';
import { TIMEBLOCK_CATEGORIES } from '../../styles/theme';
import { notificationService } from '../../lib/notificationService';

interface ScheduleTimelineProps {
  timeBlocks: TimeBlock[];
  onOpenAddModal: () => void;
  onDeleteTimeBlock: (id: string) => void;
  onSyncGoogleCalendar: () => Promise<void>;
  isSyncingCalendar?: boolean;
  calendarSyncError?: string | null;
  onOpenLoginModal: () => void;
  isAuthenticated?: boolean;
}

export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({
  timeBlocks,
  onOpenAddModal,
  onDeleteTimeBlock,
  onSyncGoogleCalendar,
  isSyncingCalendar = false,
  calendarSyncError = null,
  onOpenLoginModal,
  isAuthenticated = false,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [alarmFeedback, setAlarmFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Monitor waktu setiap 10 detik dan cek apakah ada alarm jadwal yang harus dibunyikan
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      notificationService.checkScheduledAlarms(timeBlocks);
    }, 10000);
    return () => clearInterval(timer);
  }, [timeBlocks]);

  const handleToggleAlarmPermission = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      setAlarmEnabled(true);
      notificationService.testAlarm();
      setAlarmFeedback('Alarm aktif! Perangkat akan berbunyi saat jadwal tiba.');
    } else {
      setAlarmFeedback('Izin notifikasi ditolak di pengaturan browser antum.');
    }
    setTimeout(() => setAlarmFeedback(null), 4000);
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
              <Icons.Calendar size={18} />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">Penjadwalan & Lini Waktu</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Time Blocking 24 Jam dengan integrasi Google Calendar & Alarm Real-Time.
          </p>
        </div>

        {/* Action Buttons: Google Calendar Sync, Alarm, Add Timeblock */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Google Calendar Sync Button */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                onOpenLoginModal();
              } else {
                onSyncGoogleCalendar();
              }
            }}
            disabled={isSyncingCalendar}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Tarik agenda Google Calendar hari ini"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSyncingCalendar ? 'Menyinkronkan...' : 'Sinkron Kalender'}</span>
          </button>

          {/* Alarm Permission Trigger Button */}
          <button
            onClick={handleToggleAlarmPermission}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            title="Aktifkan atau uji bunyi alarm jadwal"
          >
            <Icons.Clock size={14} color="#F59E0B" />
            <span>Alarm Jadwal</span>
          </button>

          <Button
            variant="aura"
            size="sm"
            icon={<Icons.Plus size={16} />}
            onClick={onOpenAddModal}
          >
            Tambah Blok
          </Button>
        </div>
      </div>

      {/* Alarm / Calendar Feedback Notice */}
      {alarmFeedback && (
        <div className="mb-4 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2 animate-in fade-in">
          <Icons.Clock size={15} />
          <span>{alarmFeedback}</span>
        </div>
      )}

      {calendarSyncError && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in">
          <Icons.AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p className="font-medium leading-relaxed">{calendarSyncError}</p>
            {calendarSyncError.includes('console.cloud.google.com') && (
              <a
                href="https://console.cloud.google.com/apis/library/calendar-json.googleapis.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs border border-cyan-500/40 transition-colors"
              >
                <span>Aktifkan Google Calendar API di Google Cloud ↗</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Smart Active Status Banner */}
      {activeBlock && activeCategoryCfg ? (
        <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-violet-950/30 border border-cyan-500/30 flex items-center justify-between gap-3 shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-xl bg-cyan-400 opacity-30" />
              <Icons.Clock size={16} color="#22D3EE" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Sedang Berlangsung Sekarang
                </span>
                {activeBlock.isGoogleEvent && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    Google Event
                  </span>
                )}
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
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
            Google
          </span>
          <span>Google Calendar Event</span>
        </div>
      </div>

      {/* Visual Horizontal Timeline Track (Desktop & Tablet) */}
      <div className="hidden md:block mb-6 relative pt-4 pb-2 bg-[#0C0F1D]/80 rounded-2xl p-4 border border-white/[0.06]">
        <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-2 px-1">
          {hoursArray.map(h => (
            <span key={h}>{h}</span>
          ))}
        </div>

        <div className="relative h-14 bg-slate-900/90 rounded-xl border border-white/[0.08] overflow-hidden">
          {hoursArray.map((_, idx) => (
            <div
              key={idx}
              className="absolute top-0 bottom-0 border-l border-white/[0.04]"
              style={{ left: `${(idx / (hoursArray.length - 1)) * 100}%` }}
            />
          ))}

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
                  backgroundColor: block.isGoogleEvent ? 'rgba(66, 133, 244, 0.2)' : cfg.bg,
                  border: block.isGoogleEvent ? '1px solid rgba(66, 133, 244, 0.6)' : `1px solid ${cfg.border}`,
                  color: block.isGoogleEvent ? '#93C5FD' : cfg.text,
                }}
                title={`${block.title} (${block.start_time} - ${block.end_time}) ${block.isGoogleEvent ? '[Google Calendar]' : ''}`}
              >
                <span className="text-xs font-bold truncate flex items-center gap-1">
                  {block.isGoogleEvent && <span className="text-[10px]">📅</span>}
                  {block.title}
                </span>
                <span className="text-[10px] font-mono opacity-80 shrink-0 ml-1 hidden lg:inline">
                  {block.start_time}
                </span>
              </div>
            );
          })}

          {/* Current Time Marker */}
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
                backgroundColor: block.isGoogleEvent ? 'rgba(66, 133, 244, 0.15)' : cfg.bg,
                borderColor: block.isGoogleEvent ? 'rgba(66, 133, 244, 0.4)' : cfg.border,
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2 h-8 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: block.isGoogleEvent ? '#4285F4' : cfg.color }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white truncate">{block.title}</p>
                    {block.isGoogleEvent && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold shrink-0">
                        Google
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-slate-300">
                    {block.start_time} - {block.end_time}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-md font-semibold"
                  style={{
                    backgroundColor: `${block.isGoogleEvent ? '#4285F4' : cfg.color}25`,
                    color: block.isGoogleEvent ? '#93C5FD' : cfg.color,
                  }}
                >
                  {block.category}
                </span>

                <button
                  onClick={() => onDeleteTimeBlock(block.id)}
                  className="p-1 text-slate-400 hover:text-red-400 rounded opacity-60 group-hover:opacity-100 transition-colors cursor-pointer"
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
