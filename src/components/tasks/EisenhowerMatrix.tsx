// ==============================================================================
// Eisenhower Priority Matrix Component (PRD 3.2)
// 4 Kuadran Produktivitas: Do First, Schedule, Delegate, Eliminate
// ==============================================================================

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';
import { TaskItem, TaskQuadrant } from '../../types';
import { QUADRANTS_CONFIG } from '../../styles/theme';

interface EisenhowerMatrixProps {
  tasks: TaskItem[];
  onToggleTask: (taskId: string) => void;
  onMoveQuadrant: (taskId: string, newQuadrant: TaskQuadrant) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenAddModal: (defaultQuadrant?: TaskQuadrant) => void;
}

export const EisenhowerMatrix: React.FC<EisenhowerMatrixProps> = ({
  tasks,
  onToggleTask,
  onMoveQuadrant,
  onDeleteTask,
  onOpenAddModal,
}) => {
  const [filterCompleted, setFilterCompleted] = useState<boolean>(false);

  const quadrants: TaskQuadrant[] = [1, 2, 3, 4];

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'High':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar Matrix */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111424]/70 p-4 rounded-2xl border border-white/[0.08] backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
              <Icons.ListTodo size={18} />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">Matriks Prioritas Eisenhower</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Alokasikan energi pada yang berdampak besar dan singkirkan distraksi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setFilterCompleted(!filterCompleted)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              filterCompleted
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-white/[0.03] text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            {filterCompleted ? 'Tampilkan Semua' : 'Sembunyikan Selesai'}
          </button>

          <Button
            variant="aura"
            size="sm"
            icon={<Icons.Plus size={16} />}
            onClick={() => onOpenAddModal(1)}
          >
            Tambah Tugas
          </Button>
        </div>
      </div>

      {/* 4 Quadrants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrants.map(qId => {
          const config = QUADRANTS_CONFIG[qId];
          const qTasks = tasks.filter(t => {
            if (t.priority_quadrant !== qId) return false;
            if (filterCompleted && t.is_completed) return false;
            return true;
          });

          return (
            <Card
              key={qId}
              bordered
              className="p-4 flex flex-col justify-between min-h-[290px] relative overflow-hidden"
              style={{
                borderColor: config.borderAccent,
                background: `linear-gradient(145deg, #121526 0%, #15192E 100%)`,
              }}
            >
              {/* Subtle top quadrant accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: config.color }}
              />

              {/* Quadrant Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black text-white shadow-sm"
                      style={{ backgroundColor: config.color }}
                    >
                      Q{qId}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">{config.title}</h3>
                      <span className="text-[11px] font-medium" style={{ color: config.color }}>
                        {config.subtitle}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300">
                    {qTasks.length} Tugas
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mb-3 border-b border-white/[0.05] pb-2">
                  {config.description}
                </p>

                {/* Task List Inside Quadrant */}
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {qTasks.length === 0 ? (
                    <div className="py-7 text-center border border-dashed border-white/10 rounded-xl">
                      <p className="text-xs text-slate-500">Tidak ada tugas di kuadran ini.</p>
                      <button
                        onClick={() => onOpenAddModal(qId)}
                        className="text-xs text-cyan-400 hover:underline mt-1 font-medium cursor-pointer"
                      >
                        + Tambah ke {config.title}
                      </button>
                    </div>
                  ) : (
                    qTasks.map(task => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-xl border transition-all duration-200 group ${
                          task.is_completed
                            ? 'bg-slate-900/40 border-white/[0.03] opacity-60'
                            : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.07]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Checkbox */}
                          <button
                            onClick={() => onToggleTask(task.id)}
                            className={`mt-0.5 w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                              task.is_completed
                                ? 'bg-emerald-500 text-white'
                                : 'border border-slate-500 hover:border-cyan-400'
                            }`}
                          >
                            {task.is_completed && <Icons.Check size={12} strokeWidth={3} />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs font-semibold leading-snug break-words ${
                                task.is_completed ? 'line-through text-slate-500' : 'text-slate-100'
                              }`}
                            >
                              {task.title}
                            </p>

                            {task.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                                {task.description}
                              </p>
                            )}

                            {/* Bottom Info & Quick Actions Row */}
                            <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-white/[0.04]">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getUrgencyBadge(
                                    task.urgency_tag
                                  )}`}
                                >
                                  {task.urgency_tag}
                                </span>
                                {task.due_date && (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {task.due_date.split(' ')[0]}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <select
                                  value={task.priority_quadrant}
                                  onChange={e =>
                                    onMoveQuadrant(task.id, parseInt(e.target.value, 10) as TaskQuadrant)
                                  }
                                  className="text-[10px] bg-slate-900 border border-white/10 text-slate-300 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                                  title="Pindah Kuadran"
                                >
                                  <option value={1}>Ke Q1</option>
                                  <option value={2}>Ke Q2</option>
                                  <option value={3}>Ke Q3</option>
                                  <option value={4}>Ke Q4</option>
                                </select>

                                <button
                                  onClick={() => onDeleteTask(task.id)}
                                  className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                                  title="Hapus tugas"
                                >
                                  <Icons.Trash size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Quick Add to this Quadrant */}
              <div className="pt-2 mt-2 border-t border-white/[0.04]">
                <button
                  onClick={() => onOpenAddModal(qId)}
                  className="w-full py-1.5 text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <Icons.Plus size={13} />
                  <span>Tambah ke {config.title}</span>
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
