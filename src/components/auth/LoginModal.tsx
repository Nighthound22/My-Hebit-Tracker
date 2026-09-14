// ==============================================================================
// Modal Login Google (Aura Cyber-Obsidian)
// Jalan Pintas 1-Klik Instan & Opsi Google Cloud OAuth
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
  const { loginWithGoogle, loginWithGmailFast, isLoading, error } = useAuth();
  const [activeTab, setActiveTab] = useState<'instant' | 'official'>('instant');
  const [emailInput, setEmailInput] = useState('achmadali220102@gmail.com');
  const [nameInput, setNameInput] = useState('Achmad Ali');
  const [clientIdInput, setClientIdInput] = useState(googleAuthService.getClientId());
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [clientSaveMsg, setClientSaveMsg] = useState(false);

  const isValidId = googleAuthService.hasValidClientId();

  const handleFastLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    loginWithGmailFast(emailInput.trim() || 'achmadali220102@gmail.com', nameInput.trim() || undefined);
    onClose();
  };

  const handleOfficialLogin = async () => {
    try {
      await loginWithGoogle();
      onClose();
    } catch {
      // Error handled by hook
    }
  };

  const handleSaveAndOfficialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientIdInput.trim() || !clientIdInput.includes('.apps.googleusercontent.com')) {
      alert('Format Client ID tidak valid. Harus berakhiran .apps.googleusercontent.com');
      return;
    }

    googleAuthService.setClientId(clientIdInput.trim());
    setClientSaveMsg(true);

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
      title="Masuk Akun Google (Gmail)"
      subtitle="Buka akses sinkronisasi kalender dan amankan data Anda"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-black/50 border border-white/[0.08] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('instant')}
            className={`py-2 px-3 rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'instant'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold shadow-lg shadow-violet-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⚡ Jalan Pintas Instan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('official')}
            className={`py-2 px-3 rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'official'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold shadow-lg shadow-violet-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🔑 Google Cloud</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
            <Icons.AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: JALAN PINTAS INSTAN */}
        {activeTab === 'instant' && (
          <form onSubmit={handleFastLogin} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Alamat Akun Gmail:
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="nama@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-500">Pilih Cepat:</span>
              <button
                type="button"
                onClick={() => setEmailInput('achmadali220102@gmail.com')}
                className="px-2 py-0.5 rounded-md bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 text-[10px] text-violet-300 font-mono transition-colors cursor-pointer"
              >
                achmadali220102@gmail.com
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-violet-600/30 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              <Icons.Sparkles size={16} />
              <span>Masuk Langsung Sekarang (1-Klik)</span>
            </button>

            <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] space-y-1 text-[11px] text-slate-400">
              <div className="flex items-center gap-2 text-emerald-400">
                <Icons.CheckCircle size={14} />
                <span>Tanpa ribet setup Google Cloud Console</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-400">
                <Icons.CheckCircle size={14} />
                <span>Sinkronisasi Google Calendar aktif</span>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: GOOGLE CLOUD OAUTH RESMI */}
        {activeTab === 'official' && (
          <div className="p-4 rounded-2xl bg-[#0F1322] border border-violet-500/30 space-y-3.5">
            <div className="text-xs text-slate-300 space-y-1.5">
              <p className="font-bold text-white">Panduan Google Cloud OAuth:</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
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
                  Origin:{' '}
                  <button
                    type="button"
                    onClick={handleCopyOrigin}
                    className="text-cyan-300 underline font-mono text-[10px] cursor-pointer"
                  >
                    {copiedUrl ? '✓ Disalin!' : 'https://my-hebit-tracker.vercel.app (Salin)'}
                  </button>
                </li>
              </ol>
            </div>

            {isValidId ? (
              <div className="space-y-2">
                <button
                  onClick={handleOfficialLogin}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Masuk dengan Google Popup</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveAndOfficialLogin} className="space-y-2">
                <input
                  type="text"
                  value={clientIdInput}
                  onChange={e => setClientIdInput(e.target.value)}
                  placeholder="123456789-abc.apps.googleusercontent.com"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                  required
                />
                <div className="flex items-center justify-between pt-1">
                  {clientSaveMsg && <span className="text-[10px] text-emerald-400">✓ Tersimpan!</span>}
                  <Button type="submit" variant="aura" size="sm" disabled={isLoading}>
                    {isLoading ? 'Menghubungkan...' : 'Simpan & Masuk'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
