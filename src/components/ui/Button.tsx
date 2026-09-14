import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'aura' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'aura':
        return 'bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] border border-white/20';
      case 'primary':
        return 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30 hover:scale-[1.02] active:scale-[0.98]';
      case 'secondary':
        return 'bg-[#1E2338] hover:bg-[#282F4B] text-slate-200 border border-white/10 hover:border-white/20 active:scale-[0.98]';
      case 'danger':
        return 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 active:scale-[0.98]';
      case 'success':
        return 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 active:scale-[0.98]';
      case 'ghost':
        return 'bg-transparent hover:bg-white/10 text-slate-300 hover:text-white active:scale-[0.98]';
      default:
        return 'bg-violet-600 text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-3 py-1.5 rounded-lg gap-1.5';
      case 'lg':
        return 'text-base px-6 py-3 rounded-xl gap-2.5 font-semibold';
      default:
        return 'text-sm px-4 py-2.5 rounded-xl gap-2 font-medium';
    }
  };

  return (
    <button
      className={`inline-flex items-center justify-center transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${getVariantClasses()} ${getSizeClasses()} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
