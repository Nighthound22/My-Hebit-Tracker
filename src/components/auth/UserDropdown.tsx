// ==============================================================================
// Komponen Profil Pengguna & Dropdown Sesi Akun Google
// ==============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Icons } from '../ui/Icons';
import { notificationService } from '../../lib/notificationService';

interface UserDropdownProps {
  onOpenLoginModal: () => void;
  onOpenSettings: () => void;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  onOpenLoginModal,
  onOpenSettings,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={onOpenLoginModal}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
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
        <span>Masuk Google</span>
      </button>
    );
  }

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer"
      >
        <img
          src={user.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
          alt={user.name}
          className="w-8 h-8 rounded-lg object-cover border border-violet-500/40 shrink-0"
        />
        <div className="text-left hidden sm:block pr-1">
          <p className="text-xs font-bold text-white leading-none truncate max-w-[120px]">{user.name}</p>
          <span className="text-[10px] text-emerald-400 font-medium">Google Verified</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#111425] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in duration-150">
          <div className="p-3 border-b border-white/[0.06] mb-1">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                notificationService.testAlarm();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <Icons.Clock size={15} color="#06B6D4" />
              <span>Tes Bunyi Alarm Notifikasi</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <Icons.Settings size={15} color="#A78BFA" />
              <span>Pengaturan Akun & Cloud</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <Icons.Trash size={15} color="#F87171" />
              <span>Keluar (Sign Out)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
