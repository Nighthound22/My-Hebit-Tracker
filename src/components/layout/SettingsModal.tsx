// ==============================================================================
// Modal Pengaturan (Supabase Sync & Profil Pengguna)
// ==============================================================================

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';
import { UserProfile } from '../../types';
import { supabaseService, SupabaseConfig } from '../../lib/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onResetAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onResetAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'supabase' | 'profile'>('supabase');
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => supabaseService.loadConfig());
  const [fullName, setFullName] = useState(profile.full_name);
  const [waterTarget, setWaterTarget] = useState(profile.daily_water_target);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    supabaseService.saveConfig(supabaseConfig);
    setSaveMessage('Koneksi Supabase berhasil disimpan!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      full_name: fullName.trim() || profile.full_name,
      daily_water_target: Number(waterTarget) || 8,
    });
    setSaveMessage('Profil berhasil diperbarui!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset seluruh data ke simulasi awal?')) {
      onResetAllData();
      onClose();
    }
  };

  const status = supabaseService.getStatusText();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan Aplikasi & Sinkronisasi"
      subtitle="Konfigurasi database cloud Supabase, profil pengguna, dan data lokal"
      maxWidth="lg"
    >
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] mb-5 pb-2">
        <button
          onClick={() => setActiveTab('supabase')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'supabase'
              ? 'bg-violet-600/30 text-white border border-violet-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Supabase Cloud Sync
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-violet-600/30 text-white border border-violet-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Profil & Target Air
        </button>
      </div>

      {saveMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Icons.CheckCircle2 size={16} />
          <span>{saveMessage}</span>
        </div>
      )}

      {activeTab === 'supabase' ? (
        <form onSubmit={handleSaveSupabase} className="space-y-4">
          {/* Status Badge */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/[0.06] flex items-start gap-3">
            <div
              className={`p-2 rounded-lg mt-0.5 ${
                status.status === 'cloud'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-cyan-500/20 text-cyan-400'
              }`}
            >
              <Icons.Cloud size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{status.text}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{status.details}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Supabase Project URL
            </label>
            <input
              type="url"
              value={supabaseConfig.url}
              onChange={e => setSupabaseConfig({ ...supabaseConfig, url: e.target.value })}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Supabase Anon Key (Public Key)
            </label>
            <input
              type="password"
              value={supabaseConfig.anonKey}
              onChange={e => setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value })}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enableSync"
              checked={supabaseConfig.isEnabled}
              onChange={e => setSupabaseConfig({ ...supabaseConfig, isEnabled: e.target.checked })}
              className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
            />
            <label htmlFor="enableSync" className="text-xs text-slate-300 cursor-pointer font-medium">
              Aktifkan sinkronisasi cloud real-time ke Supabase
            </label>
          </div>

          <div className="p-3 bg-violet-950/20 border border-violet-500/20 rounded-xl text-[11px] text-slate-300">
            💡 Skema SQL database Supabase sudah tersedia di berkas{' '}
            <code className="text-cyan-400 font-mono">supabase/schema.sql</code>. Anda dapat menyalinnya
            langsung ke Supabase SQL Editor.
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-red-400 hover:text-red-300 underline font-medium cursor-pointer"
            >
              Reset Semua Data Demo
            </button>
            <Button type="submit" variant="aura" size="sm">
              Simpan Konfigurasi
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Nama Lengkap Pengguna
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Target Air Minum Harian (Gelas)
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={waterTarget}
              onChange={e => setWaterTarget(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500 font-mono"
              required
            />
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-white/[0.08]">
            <Button type="submit" variant="aura" size="sm">
              Perbarui Profil
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
