import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: 'none' | 'violet' | 'cyan' | 'emerald' | 'amber' | 'red';
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = 'none',
  bordered = true,
  style,
  ...props
}) => {
  const getGlowStyle = () => {
    switch (glow) {
      case 'violet':
        return 'hover:shadow-[0_0_30px_rgba(139,92,246,0.18)] hover:border-violet-500/35';
      case 'cyan':
        return 'hover:shadow-[0_0_30px_rgba(6,182,212,0.18)] hover:border-cyan-500/35';
      case 'emerald':
        return 'hover:shadow-[0_0_30px_rgba(16,185,129,0.18)] hover:border-emerald-500/35';
      case 'amber':
        return 'hover:shadow-[0_0_30px_rgba(245,158,11,0.18)] hover:border-amber-500/35';
      case 'red':
        return 'hover:shadow-[0_0_30px_rgba(239,68,68,0.18)] hover:border-red-500/35';
      default:
        return 'hover:border-white/20';
    }
  };

  return (
    <div
      className={`rounded-2xl bg-[#0E111D]/80 backdrop-blur-2xl transition-all duration-300 relative ${
        bordered ? 'border border-white/[0.08]' : ''
      } ${getGlowStyle()} ${className}`}
      style={{
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.03)',
        ...style,
      }}
      {...props}
    >
      {/* Subtle top border highlight shine */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none rounded-t-2xl" />
      {children}
    </div>
  );
};
