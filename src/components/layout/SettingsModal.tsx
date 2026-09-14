// ==============================================================================
// Modal Pengaturan (Supabase, Neon Serverless PostgreSQL, & Profil Pengguna)
// ==============================================================================

import React, { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';
import { UserProfile } from '../../types';
import { supabaseService, SupabaseConfig } from '../../lib/supabase';
import { supabaseSyncService } from '../../lib/supabaseSync';
import { safeStorage } from '../../lib/storage';
import { useAuth } from '../../hooks/useAuth';

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

const SYNC_SQL_SCHEMA = `-- Jalankan query ini di SQL Editor Supabase untuk sinkronisasi Laptop & HP
CREATE TABLE IF NOT EXISTS public.user_sync_data (
  email TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_sync_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Full Access" ON public.user_sync_data;
CREATE POLICY "Public Full Access" ON public.user_sync_data
  FOR ALL
  USING (true)
  WITH CHECK (true);`;

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onResetAllData,
}) => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'neon' | 'supabase' | 'profile'>('supabase');
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => supabaseService.loadConfig());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States untuk Test Koneksi & Pairing HP
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedPairingLink, setCopiedPairingLink] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  
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
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [waterTarget, setWaterTarget] = useState(profile.daily_water_target);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran gambar maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setAvatarUrl(base64);
        // Otomatis sinkronkan ke profil dan sesi auth agar langsung muncul di dashboard
        onUpdateProfile({
          ...profile,
          avatar_url: base64,
        });
        if (user) {
          updateUser({ picture: base64 });
        }
        setSaveMessage('✓ Foto berhasil diunggah dan disimpan!');
        setTimeout(() => setSaveMessage(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveNeon = (e: React.FormEvent) => {
    e.preventDefault();
    safeStorage.setItem('aura_neon_config_v1', JSON.stringify(neonConfig));
    setSaveMessage('Konfigurasi Neon PostgreSQL berhasil disimpan!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    supabaseService.saveConfig(supabaseConfig);
    setSaveMessage('✓ Konfigurasi Supabase berhasil disimpan!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    setSupabaseTestResult(null);
    try {
      const res = await supabaseSyncService.testConnection(supabaseConfig);
      setSupabaseTestResult(res);
    } catch {
      setSupabaseTestResult({ success: false, message: 'Gagal menghubungi server Supabase.' });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleCopyPairing = () => {
    const link = supabaseService.getShareableSyncLink(supabaseConfig);
    navigator.clipboard.writeText(link);
    setCopiedPairingLink(true);
    setTimeout(() => setCopiedPairingLink(false), 3000);
  };

  const handleCopySqlCode = () => {
    navigator.clipboard.writeText(SYNC_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedName = fullName.trim() || profile.full_name;
    const updatedAvatar = avatarUrl.trim() || profile.avatar_url;

    onUpdateProfile({
      ...profile,
      full_name: updatedName,
      avatar_url: updatedAvatar,
      daily_water_target: Number(waterTarget) || 8,
    });

    if (user) {
      updateUser({
        name: updatedName,
        picture: updatedAvatar,
      });
    }

    setSaveMessage('✓ Profil & Foto berhasil disimpan!');
    setTimeout(() => {
      setSaveMessage(null);
      onClose();
    }, 1200);
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
        <div className="space-y-4">
          <form onSubmit={handleSaveSupabase} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.06] flex items-start gap-3">
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
                Aktifkan sinkronisasi cloud real-time ke Supabase (Laptop & HP)
              </label>
            </div>

            {/* Test Connection Result Alert */}
            {supabaseTestResult && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  supabaseTestResult.success
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/15 border-red-500/30 text-red-300'
                }`}
              >
                {supabaseTestResult.success ? <Icons.CheckCircle2 size={16} /> : <Icons.ShieldAlert size={16} />}
                <span>{supabaseTestResult.message}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={isTestingSupabase}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-cyan-500/20 transition-all text-xs font-semibold cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                <Icons.RefreshCw size={14} className={isTestingSupabase ? 'animate-spin' : ''} />
                <span>{isTestingSupabase ? 'Memeriksa...' : '⚡ Uji Koneksi & Tabel'}</span>
              </button>
              <Button type="submit" variant="aura" size="sm">
                Simpan Konfigurasi
              </Button>
            </div>
          </form>

          {/* 1-Click Mobile Pairing Feature */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/40 via-slate-900/80 to-cyan-950/40 border border-violet-500/30 space-y-2.5">
            <div className="flex items-center gap-2 text-violet-300 font-bold text-xs">
              <span className="text-base">📱</span>
              <span>Hubungkan ke HP (1-Klik Tanpa Ketik Key)</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Tidak perlu repot mengetik Project URL dan Anon Key yang panjang di layar HP! Cukup salin tautan pintar ini lalu buka di browser smartphone (misal kirim ke pesan WhatsApp antum).
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={handleCopyPairing}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border shadow-lg ${
                  copiedPairingLink
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-violet-400/40 shadow-violet-600/30 active:scale-[0.98]'
                }`}
              >
                {copiedPairingLink ? (
                  <>
                    <Icons.Check size={16} />
                    <span>✓ Tautan Berhasil Disalin! Buka di HP Antum</span>
                  </>
                ) : (
                  <>
                    <span>📱</span>
                    <span>Salin Tautan Pairing ke HP</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SQL Schema Copy Box */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Icons.Database size={15} className="text-cyan-400" />
                <span>Skema SQL Sinkronisasi (`user_sync_data`)</span>
              </div>
              <button
                type="button"
                onClick={handleCopySqlCode}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedSql ? (
                  <>
                    <Icons.Check size={12} />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    <span>Salin SQL</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Jalankan perintah SQL ini di menu <strong>SQL Editor</strong> Supabase antum satu kali untuk mengaktifkan sinkronisasi otomatis Laptop & HP:
            </p>
            <pre className="p-3 rounded-xl bg-black/60 border border-white/5 text-[10px] font-mono text-cyan-300 overflow-x-auto select-all leading-normal">
              {SYNC_SQL_SCHEMA}
            </pre>
          </div>
        </div>
      )}

      {/* 3. Profil Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Avatar Change Section */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group">
              <img
                src={avatarUrl || profile.avatar_url || user?.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={fullName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-violet-500 shadow-xl shadow-violet-500/20"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-white transition-opacity cursor-pointer"
              >
                Ganti Foto
              </button>
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div>
                <h4 className="text-xs font-bold text-white">Foto Profil Akun</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Foto akan otomatis tersimpan ke profil database antum.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  icon={<Icons.Sparkles size={14} />}
                >
                  Pilih Foto dari Galeri
                </Button>

                {avatarUrl !== profile.avatar_url && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarUrl(profile.avatar_url || '');
                      onUpdateProfile({ ...profile, avatar_url: profile.avatar_url });
                      if (user) updateUser({ picture: profile.avatar_url });
                    }}
                    className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Reset Foto Awal
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* URL Kustom & Preset Cepat */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Atau Gunakan Tautan (URL) Foto
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={e => {
                const val = e.target.value;
                setAvatarUrl(val);
                if (val.startsWith('http')) {
                  onUpdateProfile({ ...profile, avatar_url: val });
                  if (user) updateUser({ picture: val });
                }
              }}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Preset Avatar Cepat */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-400">
              Pilihan Avatar Cepat:
            </label>
            <div className="flex items-center gap-2">
              {[
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
                'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAvatarUrl(preset);
                    onUpdateProfile({ ...profile, avatar_url: preset });
                    if (user) updateUser({ picture: preset });
                    setSaveMessage('✓ Avatar berhasil dipilih!');
                    setTimeout(() => setSaveMessage(null), 2000);
                  }}
                  className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-transform hover:scale-110 cursor-pointer ${
                    avatarUrl === preset ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-white/10'
                  }`}
                >
                  <img src={preset} alt="preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

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

          {/* Sesi Akun Google & Tombol Logout */}
          <div className="p-3.5 rounded-2xl bg-red-950/20 border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Akun Google Terhubung</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Aktif
                </span>
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {user?.email || 'achmadali220102@gmail.com'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Apakah antum yakin ingin keluar dari akun ini?')) {
                  onClose();
                  logout();
                }
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <Icons.LogOut size={15} />
              <span>Keluar (Logout)</span>
            </button>
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-white/[0.08]">
            <Button type="submit" variant="aura" size="sm">
              Simpan Profil & Foto
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
