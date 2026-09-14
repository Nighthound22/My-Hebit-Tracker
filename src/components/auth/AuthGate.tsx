// ==============================================================================
// Dashboard Login Wajib Akun Google (AuthGate Cyber-Obsidian)
// Gerbang Utama Masuk Aplikasi — Wajib Login Menggunakan Akun Gmail
// ==============================================================================

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { googleAuthService } from '../../lib/auth';
import { Icons } from '../ui/Icons';
import { Button } from '../ui/Button';

export const AuthGate: React.FC = () => {
  const { loginWithGoogle, isLoading, error } = useAuth();
  const [showConfig, setShowConfig] = useState(!googleAuthService.hasValidClientId());
  const [clientIdInput, setClientIdInput] = useState(googleAuthService.getClientId());
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isValidId = googleAuthService.hasValidClientId();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch {
      // Error is stored in hook state
    }
  };

  const handleSaveAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientIdInput.trim() || !clientIdInput.includes('.apps.googleusercontent.com')) {
      alert('Format Client ID harus valid dan berakhiran .apps.googleusercontent.com');
      return;
    }

    googleAuthService.setClientId(clientIdInput.trim());
    setSaveSuccess(true);
    setShowConfig(false);

    try {
      await loginWithGoogle();
    } catch {
      // Error handled by hook
    }
  };

  const handleCopyOrigin = () => {
    navigator.clipboard.writeText('https://my-hebit-tracker.vercel.app');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="min-h-screen w-full bg-[#07090E] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-violet-500/30">
      {/* Ambient Radial Lights & Grid */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md space-y-6 text-center">
        {/* Brand Header */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 mx-auto flex items-center justify-center shadow-2xl shadow-violet-600/40 text-white transform hover:scale-105 transition-transform">
            <Icons.Sparkles size={36} />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-bold tracking-wider uppercase">
            <span>Aura Tracker v1.1</span>
            <span className="w-1 h-1 rounded-full bg-violet-400" />
            <span className="text-cyan-300">Cyber-Obsidian</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Selamat Datang di{' '}
            <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              AURA
            </span>
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
            Sistem pelacak kebiasaan, jadwal 24 jam, dan produktivitas tingkat lanjut. Masuk dengan akun Gmail Anda untuk melanjutkan.
          </p>
        </div>

        {/* Feature Teasers */}
        <div className="grid grid-cols-2 gap-2 text-left">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2 text-violet-400 font-bold text-xs mb-1">
              <Icons.Calendar size={15} />
              <span>Google Calendar</span>
            </div>
            <p className="text-[10px] text-slate-400">Sinkronisasi agenda harian otomatis ke lini waktu.</p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1">
              <Icons.Clock size={15} />
              <span>Alarm Real-Time</span>
            </div>
            <p className="text-[10px] text-slate-400">Notifikasi lonceng fokus tepat waktu di laptop & HP.</p>
          </div>
        </div>

        {/* Login Box */}
        <div className="p-6 rounded-3xl bg-[#111425]/90 border border-white/[0.09] shadow-2xl backdrop-blur-2xl space-y-4 text-left">
          <div className="border-b border-white/[0.06] pb-3 text-center">
            <h2 className="text-sm font-bold text-white">Login Akun Google (Gmail)</h2>
            <p className="text-xs text-slate-400 mt-0.5">Wajib menggunakan akun Gmail resmi</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
              <Icons.AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary Action Button */}
          {isValidId && !showConfig ? (
            <div className="space-y-3">
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-black text-sm flex items-center justify-center gap-3 shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Official Google Logo */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isLoading ? 'Menghubungkan ke Google...' : 'Masuk dengan Akun Google'}</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="text-emerald-400 font-medium">✓ Client ID Google Aktif</span>
                <button
                  type="button"
                  onClick={() => setShowConfig(true)}
                  className="text-violet-400 hover:text-violet-300 underline cursor-pointer"
                >
                  Ubah Client ID
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs text-slate-300 space-y-2">
                <p className="font-bold text-white text-xs">Konfigurasi Google Client ID:</p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                  <li>
                    Buka{' '}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 underline font-semibold"
                    >
                      Google Cloud Console ↗
                    </a>
                  </li>
                  <li>
                    Pastikan origin ini terdaftar:{' '}
                    <button
                      type="button"
                      onClick={handleCopyOrigin}
                      className="text-cyan-300 underline font-mono text-[10px] cursor-pointer"
                    >
                      {copiedUrl ? '✓ Disalin!' : 'https://my-hebit-tracker.vercel.app (Salin)'}
                    </button>
                  </li>
                  <li>Tempel Client ID di bawah:</li>
                </ol>
              </div>

              <form onSubmit={handleSaveAndLogin} className="space-y-2.5">
                <input
                  type="text"
                  value={clientIdInput}
                  onChange={e => setClientIdInput(e.target.value)}
                  placeholder="123456789-abc.apps.googleusercontent.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                  required
                />

                <div className="flex items-center justify-between pt-1">
                  {isValidId && (
                    <button
                      type="button"
                      onClick={() => setShowConfig(false)}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                  {saveSuccess && (
                    <span className="text-[10px] text-emerald-400">✓ Tersimpan!</span>
                  )}
                  <Button type="submit" variant="aura" size="sm" disabled={isLoading}>
                    {isLoading ? 'Menghubungkan...' : 'Simpan & Masuk Google'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-slate-500">
          Data Anda terenkripsi dan tersimpan aman di cloud. Didukung oleh Neon Serverless PostgreSQL.
        </p>
      </div>
    </div>
  );
};
