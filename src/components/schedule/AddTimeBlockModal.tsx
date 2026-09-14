// ==============================================================================
// Modal Tambah Blok Waktu (Schedule & Time Blocking)
// ==============================================================================

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TimeBlock, TimeBlockCategory } from '../../types';
import { TIMEBLOCK_CATEGORIES } from '../../styles/theme';

interface AddTimeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTimeBlock: (block: Omit<TimeBlock, 'id'>) => void;
}

export const AddTimeBlockModal: React.FC<AddTimeBlockModalProps> = ({
  isOpen,
  onClose,
  onAddTimeBlock,
}) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [category, setCategory] = useState<TimeBlockCategory>('Kerja');

  const categories: TimeBlockCategory[] = ['Kerja', 'Ibadah', 'Istirahat', 'Belajar'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTimeBlock({
      title: title.trim(),
      start_time: startTime,
      end_time: endTime,
      category,
    });

    setTitle('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Blok Waktu (Time Block)"
      subtitle="Alokasikan jam harian untuk fokus tanpa distraksi"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Nama Aktivitas / Blok
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Contoh: Sesi Deep Work / Sholat Maghrib & Dzikir"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
            autoFocus
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Jam Mulai (HH:mm)
            </label>
            <input
              type="text"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              placeholder="09:00"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Jam Selesai (HH:mm)
            </label>
            <input
              type="text"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              placeholder="11:00"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none font-mono"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Kategori Aktivitas
          </label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(cat => {
              const cfg = TIMEBLOCK_CATEGORIES[cat];
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    category === cat
                      ? 'border-cyan-500 bg-cyan-600/20 text-white shadow-sm'
                      : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cfg.color }}
                    />
                    <span className="text-xs font-bold text-white">{cfg.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="aura" size="sm">
            Simpan Blok Jadwal
          </Button>
        </div>
      </form>
    </Modal>
  );
};
