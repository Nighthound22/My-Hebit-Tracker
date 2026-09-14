// ==============================================================================
// Ambient Sound Widget (PRD 3.5)
// Lo-Fi & Focus Beats Synthesizer: Rain, Binaural 432Hz Alpha, White Noise, Lo-Fi Pulse
// Zero-external dependencies, 100% offline-ready & smooth
// ==============================================================================

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Icons } from '../ui/Icons';
import { soundSynth } from '../../lib/audioSynth';
import { AudioPreset } from '../../types';

export const AmbientSoundWidget: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(soundSynth.getIsPlaying());
  const [activePreset, setActivePreset] = useState<AudioPreset>('rain');
  const [volume, setVolume] = useState<number>(soundSynth.getVolume());

  const presets: { id: AudioPreset; name: string; desc: string; icon: string }[] = [
    { id: 'rain', name: 'Suara Hujan', desc: 'Rain & Pink Noise', icon: '🌧️' },
    { id: 'binaural', name: 'Binaural 432Hz', desc: 'Alpha Wave Focus', icon: '🧠' },
    { id: 'whitenoise', name: 'White Noise', desc: 'Isolasi Distraksi', icon: '📻' },
    { id: 'lofi', name: 'Lo-Fi Chill Drone', desc: 'Warm Harmonic Pulse', icon: '☕' },
  ];

  const handleTogglePlay = () => {
    if (isPlaying) {
      soundSynth.stop();
      setIsPlaying(false);
    } else {
      soundSynth.play(activePreset);
      setIsPlaying(true);
    }
  };

  const handleSelectPreset = (preset: AudioPreset) => {
    setActivePreset(preset);
    if (isPlaying) {
      soundSynth.play(preset);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundSynth.setVolume(newVol);
  };

  return (
    <Card glow="cyan" className="p-5 relative overflow-hidden">
      {/* Header section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
            <Icons.Headphones size={18} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Ambient Audio & Focus Beats</h3>
            <p className="text-[11px] text-slate-400">Audio synthesizer penunjang konsentrasi mendalam</p>
          </div>
        </div>

        {/* Live Audio Visualizer Bars */}
        <div className="flex items-end gap-1 h-5 px-2">
          {[40, 80, 60, 100, 70, 50].map((height, i) => (
            <span
              key={i}
              className={`w-1 rounded-full bg-cyan-400 transition-all duration-300 ${
                isPlaying ? 'animate-pulse' : 'opacity-30'
              }`}
              style={{
                height: isPlaying ? `${height}%` : '20%',
                animationDelay: `${i * 120}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Preset Selector Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {presets.map(p => {
          const isSelected = activePreset === p.id;

          return (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p.id)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-cyan-500/60 bg-cyan-500/15 text-white shadow-sm'
                  : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{p.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate text-white">{p.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{p.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Controls: Volume & Play/Stop */}
      <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 flex-1 max-w-[200px]">
          <span className="text-slate-400">
            {volume === 0 ? <Icons.VolumeX size={16} /> : <Icons.Volume2 size={16} />}
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={e => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] font-mono text-slate-400 w-8">
            {Math.round(volume * 100)}%
          </span>
        </div>

        <button
          onClick={handleTogglePlay}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isPlaying
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {isPlaying ? (
            <>
              <Icons.Pause size={14} color="#020617" />
              <span>Matikan Audio</span>
            </>
          ) : (
            <>
              <Icons.Play size={14} color="#FFFFFF" />
              <span>Putar Ambient</span>
            </>
          )}
        </button>
      </div>
    </Card>
  );
};
