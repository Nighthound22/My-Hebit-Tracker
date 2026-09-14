// ==============================================================================
// Quick Notes / Inbox Widget (PRD 3.6)
// Catatan cepat sederhana untuk ide spontan & brain dump harian
// ==============================================================================

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Icons } from '../ui/Icons';
import { QuickNote } from '../../types';

interface QuickNotesWidgetProps {
  notes: QuickNote[];
  onAddNote: (content: string) => void;
  onDeleteNote: (id: string) => void;
}

export const QuickNotesWidget: React.FC<QuickNotesWidgetProps> = ({
  notes,
  onAddNote,
  onDeleteNote,
}) => {
  const [inputText, setInputText] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim()) {
        onAddNote(inputText.trim());
        setInputText('');
      }
    }
  };

  const handleAdd = () => {
    if (inputText.trim()) {
      onAddNote(inputText.trim());
      setInputText('');
    }
  };

  return (
    <Card glow="amber" className="p-5 flex flex-col justify-between relative overflow-hidden">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <Icons.FileText size={18} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Quick Notes & Inbox</h3>
              <p className="text-[11px] text-slate-400">Tangkap ide spontan seketika</p>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-mono">{notes.length} Catatan</span>
        </div>

        {/* Input box */}
        <div className="relative mb-3">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tulis ide cepat lalu tekan Enter..."
            className="w-full pl-3.5 pr-9 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500/60"
          />
          <button
            onClick={handleAdd}
            disabled={!inputText.trim()}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <Icons.Plus size={14} color="#020617" />
          </button>
        </div>

        {/* Note List */}
        <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
          {notes.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">Belum ada catatan spontan.</p>
          ) : (
            notes.map(note => (
              <div
                key={note.id}
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] flex items-start justify-between gap-2 group transition-all"
              >
                <p className="text-xs text-slate-200 break-words flex-1 leading-relaxed">
                  {note.content}
                </p>
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="text-slate-500 hover:text-red-400 p-1 opacity-60 group-hover:opacity-100 transition-colors shrink-0"
                  title="Hapus catatan"
                >
                  <Icons.Trash size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
};
