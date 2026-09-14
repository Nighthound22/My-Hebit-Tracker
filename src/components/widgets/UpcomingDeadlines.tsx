// ==============================================================================
// Upcoming Deadlines Widget (PRD 3.6)
// Daftar tugas mendatang lengkap dengan tag tingkat urgensi (High, Medium, Low)
// ==============================================================================

import React from 'react';
import { Card } from '../ui/Card';
import { Icons } from '../ui/Icons';
import { TaskItem } from '../../types';

interface UpcomingDeadlinesProps {
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  onOpenMatrixTab: () => void;
}

export const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({
  tasks,
  onToggleTask,
  onOpenMatrixTab,
}) => {
  // Ambil tugas yang belum selesai dan memiliki due_date
  const upcomingTasks = tasks
    .filter(t => !t.is_completed)
    .sort((a, b) => {
      // Prioritaskan High urgency dan due date
      const urgencyOrder: Record<string, number> = { High: 1, Medium: 2, Low: 3 };
      const urgDiff = (urgencyOrder[a.urgency_tag] || 2) - (urgencyOrder[b.urgency_tag] || 2);
      if (urgDiff !== 0) return urgDiff;
      return (a.due_date || '').localeCompare(b.due_date || '');
    })
    .slice(0, 5);

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'High':
        return { text: 'High', style: 'bg-red-500/20 text-red-400 border-red-500/30' };
      case 'Medium':
        return { text: 'Medium', style: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      default:
        return { text: 'Low', style: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
    }
  };

  return (
    <Card glow="red" className="p-5 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-red-500/15 text-red-400">
            <Icons.AlertTriangle size={18} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Upcoming Deadlines</h3>
            <p className="text-[11px] text-slate-400">Prioritas tenggat waktu terdekat</p>
          </div>
        </div>

        <button
          onClick={onOpenMatrixTab}
          className="text-xs text-cyan-400 hover:underline font-medium cursor-pointer"
        >
          Lihat Semua
        </button>
      </div>

      <div className="space-y-2.5">
        {upcomingTasks.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">
            🎉 Tidak ada deadline mendesak saat ini!
          </p>
        ) : (
          upcomingTasks.map(task => {
            const badge = getUrgencyBadge(task.urgency_tag);

            return (
              <div
                key={task.id}
                className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] flex items-center justify-between gap-3 transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="w-4.5 h-4.5 rounded-md border border-slate-600 hover:border-cyan-400 flex items-center justify-center shrink-0 cursor-pointer"
                    title="Tandai selesai"
                  >
                    {task.is_completed && <Icons.Check size={12} />}
                  </button>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{task.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      {task.due_date && (
                        <span className="flex items-center gap-1 font-mono">
                          <Icons.Clock size={10} />
                          {task.due_date}
                        </span>
                      )}
                      <span>Q{task.priority_quadrant}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${badge.style}`}
                >
                  {badge.text}
                </span>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
