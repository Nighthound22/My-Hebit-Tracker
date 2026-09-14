// ==============================================================================
// Cyber-Obsidian Error Boundary
// Mencegah blank screen jika terjadi runtime error dan menyediakan tombol recovery
// ==============================================================================

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Aura Tracker:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#07090E] text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full p-6 rounded-3xl bg-[#111425]/95 border border-red-500/30 shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto text-2xl">
              ⚠️
            </div>

            <h2 className="text-xl font-black text-white tracking-tight">
              Aplikasi Membutuhkan Penyegaran
            </h2>

            <p className="text-xs text-slate-400 leading-relaxed">
              Terjadi kendala saat memuat antarmuka. Silakan klik tombol di bawah untuk memuat ulang sistem:
            </p>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-red-300 text-[11px] font-mono text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                🔄 Muat Ulang Halaman
              </button>

              <button
                onClick={this.handleClearAndReload}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs border border-white/10 transition-all cursor-pointer"
              >
                🧹 Bersihkan Cache & Muat Ulang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
