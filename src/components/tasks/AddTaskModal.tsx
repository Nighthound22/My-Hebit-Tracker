// ==============================================================================
// Modal Tambah Tugas Baru (Eisenhower Matrix)
// ==============================================================================

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TaskQuadrant, UrgencyTag, TaskItem } from '../../types';
import { QUADRANTS_CONFIG } from '../../styles/theme';
import { getTodayKey } from '../../lib/storage';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<TaskItem, 'id' | 'created_at'>) => void;
  initialQuadrant?: TaskQuadrant;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  initialQuadrant = 1,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quadrant, setQuadrant] = useState<TaskQuadrant>(initialQuadrant);
  const [urgency, setUrgency] = useState<UrgencyTag>('High');
  const [dueDate, setDueDate] = useState(`${getTodayKey()} 18:00`);

  // Sinkronkan quadrant jika initialQuadrant berganti
  React.useEffect(() => {
    if (initialQuadrant) {
      setQuadrant(initialQuadrant);
    }
  }, [initialQuadrant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
      priority_quadrant: quadrant,
      urgency_tag: urgency,
      due_date: dueDate || undefined,
      is_completed: false,
    });

    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Tugas ke Matriks"
      subtitle="Tetapkan kuadran prioritas dan deadline tugas"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Judul Tugas
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Contoh: Selesaikan API endpoint sinkronisasi"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm"
            autoFocus
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Deskripsi Singkat (Opsional)
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder="Detail konteks atau instruksi tugas..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Pilih Kuadran Eisenhower
          </label>
          <div className="grid grid-cols-2 gap-2">
            {([1, 2, 3, 4] as TaskQuadrant[]).map(q => {
              const cfg = QUADRANTS_CONFIG[q];
              return (
                <button
                  type="button"
                  key={q}
                  onClick={() => setQuadrant(q)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    quadrant === q
                      ? 'border-violet-500 bg-violet-600/20 text-white shadow-sm'
                      : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded text-[10px] font-bold text-white flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cfg.color }}
                    >
                      Q{q}
                    </span>
                    <span className="text-xs font-bold text-white truncate">{cfg.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{cfg.subtitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tingkat Urgensi
            </label>
            <select
              value={urgency}
              onChange={e => setUrgency(e.target.value as UrgencyTag)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none"
            >
              <option value="High">Tinggi (High)</option>
              <option value="Medium">Sedang (Medium)</option>
              <option value="Low">Rendah (Low)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tenggat Waktu (Due Date)
            </label>
            <input
              type="text"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              placeholder="YYYY-MM-DD HH:mm"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="aura" size="sm">
            Simpan Tugas
          </Button>
        </div>
      </form>
    </Modal>
  );
};
