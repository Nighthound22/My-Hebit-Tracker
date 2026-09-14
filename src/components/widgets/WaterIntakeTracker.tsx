// ==============================================================================
// Water Intake Tracker Widget (PRD 3.6)
// Penghitung konsumsi air minum harian (target 8 gelas/hari) dengan tombol cepat +1 Cup
// ==============================================================================

import React from 'react';
import { Card } from '../ui/Card';
import { Icons } from '../ui/Icons';

interface WaterIntakeTrackerProps {
  cups: number;
  target: number;
  onAddCup: () => void;
  onRemoveCup: () => void;
  onReset: () => void;
}

export const WaterIntakeTracker: React.FC<WaterIntakeTrackerProps> = ({
  cups,
  target,
  onAddCup,
  onRemoveCup,
  onReset,
}) => {
  const percent = Math.min(100, Math.round((cups / target) * 100));
  const isTargetAchieved = cups >= target;

  return (
    <Card glow="cyan" className="p-5 relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
            <Icons.Droplet size={18} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Water Intake Tracker</h3>
            <p className="text-[11px] text-slate-400">Hidrasi optimal untuk stamina kerja</p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
          title="Reset hitungan hari ini"
        >
          Reset
        </button>
      </div>

      {/* Main Glass Visual & Stats */}
      <div className="flex items-center justify-between gap-4 my-3">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white font-mono">{cups}</span>
            <span className="text-sm text-slate-400 font-semibold">/ {target} Gelas</span>
          </div>
          <p className="text-xs text-cyan-400 font-medium mt-0.5">
            {isTargetAchieved ? '🎉 Target Hidrasi Tercapai!' : `${target - cups} gelas lagi untuk target harian`}
          </p>
        </div>

        {/* 8-Dot Visual Cups representation */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: target }).map((_, idx) => {
            const isFilled = idx < cups;
            return (
              <div
                key={idx}
                className={`w-3.5 h-8 rounded-full border transition-all duration-300 ${
                  isFilled
                    ? 'bg-gradient-to-t from-cyan-500 to-blue-400 border-cyan-300 shadow-[0_0_8px_#06B6D4]'
                    : 'bg-slate-800/80 border-white/10'
                }`}
                title={`Gelas ke-${idx + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden my-3">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500 shadow-[0_0_10px_#06B6D4]"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={onRemoveCup}
          disabled={cups <= 0}
          className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          title="Kurangi 1 Gelas"
        >
          <Icons.Minus size={16} />
        </button>

        <button
          onClick={onAddCup}
          className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-cyan-500/25 cursor-pointer"
        >
          <Icons.Plus size={16} color="#020617" />
          <span>+1 Cup Minum Air</span>
        </button>
      </div>
    </Card>
  );
};
