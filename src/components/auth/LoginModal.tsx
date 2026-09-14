// ==============================================================================
// Modal Login Google OAuth 2.0 (Resmi Google Identity Services)
// Menangani Validasi Google OAuth Client ID & Panduan Setup Tanpa Error 401
// ==============================================================================

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';
import { useAuth } from '../../hooks/useAuth';
import { googleAuthService } from '../../lib/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, isLoading, error } = useAuth();
  const [clientIdInput, setClientIdInput] = useState(googleAuthService.getClientId());
  const [showForm, setShowForm] = useState(!googleAuthService.hasValidClientId());
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [clientSaveMsg, setClientSaveMsg] = useState(false);

  const isValidId = googleAuthService.hasValidClientId();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      onClose();
    } catch {
      // Error is caught and shown by hook
    }
  };

  const handleSaveAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientIdInput.trim() || !clientIdInput.includes('.apps.googleusercontent.com')) {
      alert('Format Client ID tidak valid. Harus berakhiran .apps.googleusercontent.com');
      return;
    }

    googleAuthService.setClientId(clientIdInput.trim());
    setClientSaveMsg(true);
    setShowForm(false);

    // Langsung jalankan login setelah menyimpan
    try {
      await loginWithGoogle();
      onClose();
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Masuk dengan Akun Google"
      subtitle="Buka akses sinkronisasi Google Calendar dan amankan data Anda"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-950/20 border border-violet-500/20">
            <span className="p-2 rounded-lg bg-violet-500/20 text-violet-400 shrink-0">
              <Icons.Calendar size={18} />
            </span>
            <div>
              <p className="text-xs font-bold text-white">Google Calendar</p>
              <p className="text-[11px] text-slate-400">Jadwal harian otomatis sinkron ke lini waktu.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
            <span className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
              <Icons.ShieldAlert size={18} />
            </span>
            <div>
              <p className="text-xs font-bold text-white">Data Terisolasi</p>
              <p className="text-[11px] text-slate-400">Akun Gmail memiliki ruang data pribadi aman.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
            <Icons.AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Jika Client ID sudah valid dan form sedang tidak dibuka */}
        {isValidId && !showForm ? (
          <div className="space-y-3">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Official Google G Logo SVG */}
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
              <span>{isLoading ? 'Menghubungkan ke Google...' : 'Lanjutkan dengan Google'}</span>
            </button>

            <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-medium">✓ Client ID Aktif</span>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="text-violet-400 hover:text-violet-300 underline cursor-pointer"
              >
                Ubah Google Client ID
              </button>
            </div>
          </div>
        ) : (
          /* Step-by-Step Google Cloud OAuth Client ID Setup Guide */
          <div className="p-4 rounded-2xl bg-[#0F1322] border border-violet-500/30 space-y-3.5">
            <div className="flex items-start gap-2.5">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <Icons.AlertTriangle size={16} />
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">Konfigurasi Google OAuth Client ID</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Agar Google mengizinkan hosting Vercel antum mengakses akun Gmail & Kalender secara resmi tanpa{' '}
                  <span className="text-red-400 font-semibold font-mono">Error 401 (invalid_client)</span>, antum perlu membuat Client ID gratis di Google Cloud Console (hanya 2 menit):
                </p>
              </div>
            </div>

            {/* Quick 3 Steps */}
            <div className="space-y-2 p-3 rounded-xl bg-black/40 border border-white/[0.06] text-[11px] text-slate-300">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-violet-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  Buka{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline font-semibold"
                  >
                    Google Cloud Console Credentials ↗
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-violet-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  Klik <span className="text-white font-semibold">+ CREATE CREDENTIALS</span> &gt;{' '}
                  <span className="text-white font-semibold">OAuth client ID</span> &gt; Tipe:{' '}
                  <span className="text-amber-300 font-semibold">Web application</span>.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-violet-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  Di bagian <span className="text-white font-semibold">Authorized JavaScript origins</span>, masukkan URL Vercel antum:
                  <div className="mt-1 flex items-center gap-2">
                    <code className="px-2 py-1 rounded bg-slate-900 border border-white/10 text-cyan-300 font-mono text-[10px]">
                      https://my-hebit-tracker.vercel.app
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyOrigin}
                      className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      {copiedUrl ? '✓ Disalin!' : 'Salin URL'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSaveAndLogin} className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Tempel Google OAuth Client ID Di Sini
              </label>
              <input
                type="text"
                value={clientIdInput}
                onChange={e => setClientIdInput(e.target.value)}
                placeholder="123456789-abc.apps.googleusercontent.com"
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                required
              />

              <div className="flex items-center justify-between pt-1">
                {clientSaveMsg && (
                  <span className="text-[10px] text-emerald-400 font-medium">✓ Client ID tersimpan!</span>
                )}
                {isValidId && (
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                  >
                    Batal
                  </button>
                )}
                <Button type="submit" variant="aura" size="sm" disabled={isLoading}>
                  {isLoading ? 'Menghubungkan...' : 'Simpan & Masuk Akun Google'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Modal>
  );
};
