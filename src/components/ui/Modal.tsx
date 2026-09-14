import React, { useEffect } from 'react';
import { Icons } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Kunci scroll halaman utama saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm':
        return 'max-w-sm';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      default:
        return 'max-w-md';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal Dialog Box */}
      <div
        className={`relative w-full ${getMaxWidthClass()} rounded-2xl bg-[#131627] border border-white/10 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto overflow-hidden z-10`}
        style={{
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(139, 92, 246, 0.15)',
        }}
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 z-20" />

        {/* Fixed Header (Selalu terlihat di atas) */}
        <div className="flex items-start justify-between p-4 sm:p-5 pb-3 border-b border-white/[0.08] shrink-0 bg-[#131627]/95 backdrop-blur-sm z-10">
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2"
            title="Tutup (Esc)"
          >
            <Icons.X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body (Bisa di-scroll bebas hingga ke tombol paling bawah) */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 overscroll-contain space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
