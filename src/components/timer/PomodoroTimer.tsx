// ==============================================================================
// Cyber-HUD Pomodoro Timer (PRD 3.5)
// Dual-Ring Concentric HUD, Aura Sweep Particle, & Cybernetic Digital Readout
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';
import { FocusSessionType } from '../../types';
import { soundSynth } from '../../lib/audioSynth';

interface PomodoroTimerProps {
  onSessionCompleted: (minutes: number, type: FocusSessionType) => void;
}

const MODES: { id: FocusSessionType; label: string; duration: number; color: string; glow: string }[] = [
  { id: 'focus', label: 'Deep Focus', duration: 25 * 60, color: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.4)' },
  { id: 'short_break', label: 'Short Break', duration: 5 * 60, color: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' },
  { id: 'long_break', label: 'Long Break', duration: 15 * 60, color: '#06B6D4', glow: 'rgba(6, 182, 212, 0.4)' },
];

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onSessionCompleted }) => {
  const [activeMode, setActiveMode] = useState<FocusSessionType>('focus');
  const currentConfig = MODES.find(m => m.id === activeMode) || MODES[0];

  const [timeLeft, setTimeLeft] = useState<number>(currentConfig.duration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionCount, setSessionCount] = useState<number>(0);

  const initialDuration = currentConfig.duration;

  const switchMode = (mode: FocusSessionType) => {
    setIsRunning(false);
    setActiveMode(mode);
    const cfg = MODES.find(m => m.id === mode) || MODES[0];
    setTimeLeft(cfg.duration);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      soundSynth.playSessionEndChime();

      const completedMinutes = Math.round(initialDuration / 60);
      onSessionCompleted(completedMinutes, activeMode);

      if (activeMode === 'focus') {
        setSessionCount(prev => prev + 1);
        switchMode('short_break');
      } else {
        switchMode('focus');
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, activeMode, initialDuration, onSessionCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // SVG Geometry
  const size = 230;
  const strokeWidth = 9;
  const radius = (size - 30) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / initialDuration;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <Card glow="violet" className="p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
      {/* Background radial aura */}
      <div
        className="absolute w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: currentConfig.color }}
      />

      {/* Mode Selector Capsule */}
      <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/[0.08] mb-5 w-full max-w-xs relative z-10">
        {MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => switchMode(mode.id)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer truncate ${
              activeMode === mode.id
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Cyber-HUD Dual Ring */}
      <div className="relative w-[230px] h-[230px] flex items-center justify-center my-1 z-10">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Outer Decorative Dashed Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius + 10}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            fill="transparent"
          />

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Dynamic Glowing Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={currentConfig.color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
            style={{
              filter: `drop-shadow(0 0 12px ${currentConfig.glow})`,
            }}
          />
        </svg>

        {/* Center Digital HUD Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
          <span className="text-4xl font-black text-white font-mono tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            {formatTime(timeLeft)}
          </span>

          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className={`w-2 h-2 rounded-full ${isRunning ? 'animate-ping' : ''}`}
              style={{ backgroundColor: currentConfig.color }}
            />
            <span
              className="text-[11px] font-bold uppercase tracking-widest font-mono"
              style={{ color: currentConfig.color }}
            >
              {activeMode === 'focus' ? 'Fokus Aktif' : 'Rehat'}
            </span>
          </div>

          <div className="mt-2 text-[10px] text-slate-400 font-mono bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
            Sesi Fokus: <strong className="text-white">{sessionCount}</strong>
          </div>
        </div>
      </div>

      {/* Control Actions Bar */}
      <div className="flex items-center gap-3 mt-5 z-10 w-full justify-center">
        <Button
          variant="secondary"
          size="md"
          icon={<Icons.RotateCcw size={15} />}
          onClick={() => {
            setIsRunning(false);
            setTimeLeft(currentConfig.duration);
          }}
          title="Reset Waktu"
        >
          Reset
        </Button>

        <Button
          variant="aura"
          size="lg"
          icon={isRunning ? <Icons.Pause size={18} /> : <Icons.Play size={18} />}
          onClick={() => setIsRunning(!isRunning)}
          className="px-7 shadow-lg shadow-violet-600/30"
        >
          {isRunning ? 'Jeda' : 'Mulai Fokus'}
        </Button>

        <Button
          variant="ghost"
          size="md"
          onClick={() => setTimeLeft(0)}
          title="Tandai Selesai"
        >
          Lewati
        </Button>
      </div>
    </Card>
  );
};
