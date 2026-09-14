// ==============================================================================
// Modal Pengaturan (Supabase, Neon Serverless PostgreSQL, & Profil Pengguna)
// ==============================================================================

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';
import { UserProfile } from '../../types';
import { supabaseService, SupabaseConfig } from '../../lib/supabase';
import { safeStorage } from '../../lib/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onResetAllData: () => void;
}

interface NeonConfig {
  connectionString: string;
  projectId: string;
  isEnabled: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onResetAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'neon' | 'supabase' | 'profile'>('neon');
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => supabaseService.loadConfig());
  
  // Neon Config
  const [neonConfig, setNeonConfig] = useState<NeonConfig>(() => {
    const raw = safeStorage.getItem('aura_neon_config_v1');
    if (!raw) {
      return {
        connectionString: '',
        projectId: 'proud-base-70292180',
        isEnabled: false,
      };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        connectionString: '',
        projectId: 'proud-base-70292180',
        isEnabled: false,
      };
    }
  });

  const [fullName, setFullName] = useState(profile.full_name);
  const [waterTarget, setWaterTarget] = useState(profile.daily_water_target);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSaveNeon = (e: React.FormEvent) => {
    e.preventDefault();
    safeStorage.setItem('aura_neon_config_v1', JSON.stringify(neonConfig));
    setSaveMessage('Konfigurasi Neon PostgreSQL berhasil disimpan!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

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
      title="Pengaturan Database & Sinkronisasi Cloud"
      subtitle="Koneksikan ke Neon Serverless PostgreSQL atau Supabase"
      maxWidth="lg"
    >
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] mb-5 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('neon')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'neon'
              ? 'bg-gradient-to-r from-emerald-600/30 to-cyan-500/20 text-white border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Neon.tech PostgreSQL ⚡
        </button>
        <button
          onClick={() => setActiveTab('supabase')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'supabase'
              ? 'bg-violet-600/30 text-white border border-violet-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Supabase Sync
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
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

      {/* 1. Neon Tech PostgreSQL Tab */}
      {activeTab === 'neon' && (
        <form onSubmit={handleSaveNeon} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
              <Icons.Sparkles size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Neon Serverless PostgreSQL Terhubung</p>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Project antum: <code className="text-emerald-400 font-mono font-bold">proud-base-70292180</code> di Neon Console.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Project ID Neon
            </label>
            <input
              type="text"
              value={neonConfig.projectId}
              onChange={e => setNeonConfig({ ...neonConfig, projectId: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              placeholder="proud-base-70292180"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Connection String PostgreSQL (dari Neon Dashboard)
            </label>
            <input
              type="password"
              value={neonConfig.connectionString}
              onChange={e => setNeonConfig({ ...neonConfig, connectionString: e.target.value })}
              placeholder="postgresql://neondb_owner:***@ep-proud-base-70292180.us-east-2.aws.neon.tech/neondb?sslmode=require"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Dapat disalin langsung dari halaman utama Neon Console (Connection Details).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enableNeon"
              checked={neonConfig.isEnabled}
              onChange={e => setNeonConfig({ ...neonConfig, isEnabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
            <label htmlFor="enableNeon" className="text-xs text-slate-300 cursor-pointer font-medium">
              Aktifkan sinkronisasi cloud ke Neon Serverless PostgreSQL
            </label>
          </div>

          <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-[11px] text-slate-300 space-y-2">
            <p className="font-semibold text-emerald-300">
              📌 Cara Eksekusi Tabel di Neon Console:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              <li>
                Buka link:{' '}
                <a
                  href="https://console.neon.tech/app/projects/proud-base-70292180/branches"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 underline font-mono"
                >
                  Neon Console (proud-base-70292180)
                </a>
              </li>
              <li>Pilih menu <strong>SQL Editor</strong> di sidebar Neon.</li>
              <li>
                Buka file <code className="text-emerald-400 font-mono">neon/schema.sql</code> di proyek ini, lalu salin dan tempel isinya ke SQL Editor Neon.
              </li>
              <li>Klik tombol <strong>Run</strong>. Semua tabel langsung terbuat seketika!</li>
            </ol>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-red-400 hover:text-red-300 underline font-medium cursor-pointer"
            >
              Reset Data Demo Lokal
            </button>
            <Button type="submit" variant="aura" size="sm">
              Simpan Konfigurasi Neon
            </Button>
          </div>
        </form>
      )}

      {/* 2. Supabase Tab */}
      {activeTab === 'supabase' && (
        <form onSubmit={handleSaveSupabase} className="space-y-4">
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
            <code className="text-cyan-400 font-mono">supabase/schema.sql</code>.
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-white/[0.08]">
            <Button type="submit" variant="aura" size="sm">
              Simpan Konfigurasi Supabase
            </Button>
          </div>
        </form>
      )}

      {/* 3. Profil Tab */}
      {activeTab === 'profile' && (
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
