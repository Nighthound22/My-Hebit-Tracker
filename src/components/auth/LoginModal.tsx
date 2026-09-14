// ==============================================================================
// Modal Login Google OAuth 2.0 (Resmi Google Identity Services)
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(googleAuthService.getClientId());
  const [clientSaveMsg, setClientSaveMsg] = useState(false);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      onClose();
    } catch {
      // Error handled by hook
    }
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    googleAuthService.setClientId(clientIdInput);
    setClientSaveMsg(true);
    setTimeout(() => setClientSaveMsg(false), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Masuk dengan Akun Google"
      subtitle="Buka akses sinkronisasi Google Calendar dan amankan data Anda"
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 gap-2.5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-950/20 border border-violet-500/20">
            <span className="p-2 rounded-lg bg-violet-500/20 text-violet-400 shrink-0">
              <Icons.Calendar size={18} />
            </span>
            <div>
              <p className="text-xs font-bold text-white">Sinkronisasi Google Calendar</p>
              <p className="text-[11px] text-slate-400">Jadwal agenda harian otomatis tampil di Lini Waktu 24 jam.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
            <span className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
              <Icons.ShieldAlert size={18} />
            </span>
            <div>
              <p className="text-xs font-bold text-white">Ruang Data Pribadi Terisolasi</p>
              <p className="text-[11px] text-slate-400">Setiap akun Gmail memiliki ruang data terpisah dan aman.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
            <Icons.AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Official Google Login Button */}
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

        {/* Advanced Settings Toggle */}
        <div className="pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 mx-auto transition-colors cursor-pointer"
          >
            <span>{showAdvanced ? 'Tutup Pengaturan Client ID' : '⚙️ Gunakan Google Client ID Pribadi (Opsional)'}</span>
          </button>

          {showAdvanced && (
            <form onSubmit={handleSaveClientId} className="mt-3 space-y-2 p-3 rounded-xl bg-slate-900 border border-white/10">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Google OAuth Client ID
              </label>
              <input
                type="text"
                value={clientIdInput}
                onChange={e => setClientIdInput(e.target.value)}
                placeholder="xyz.apps.googleusercontent.com"
                className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-violet-500"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-emerald-400 font-medium">
                  {clientSaveMsg ? '✓ Client ID disimpan!' : ''}
                </span>
                <Button type="submit" variant="secondary" size="sm">
                  Simpan Client ID
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Modal>
  );
};
