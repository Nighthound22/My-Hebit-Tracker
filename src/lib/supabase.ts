// ==============================================================================
// Aura Supabase Client & Real-time Synchronization Utility
// Mendukung Auto-Pairing HP via URL Parameter & Penyimpanan Aman
// ==============================================================================

import { LocalStorageService } from './storage';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isEnabled: boolean;
}

const ENV_SUPABASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
const ENV_SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

class SupabaseService {
  private config: SupabaseConfig = { url: '', anonKey: '', isEnabled: false };

  constructor() {
    this.checkUrlPairingParams();
    this.loadConfig();
  }

  // Cek apakah ada parameter pairing link dari HP/Laptop (?sb_url=...&sb_key=...)
  private checkUrlPairingParams(): void {
    if (typeof window !== 'undefined' && window.location.search) {
      try {
        const params = new URLSearchParams(window.location.search);
        const u = params.get('sb_url');
        const k = params.get('sb_key');
        if (u && k) {
          const pairedConfig: SupabaseConfig = {
            url: decodeURIComponent(u),
            anonKey: decodeURIComponent(k),
            isEnabled: true,
          };
          this.saveConfig(pairedConfig);
          // Bersihkan URL dari parameter agar bersih
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch {
        // ignore
      }
    }
  }

  public loadConfig = (): SupabaseConfig => {
    try {
      const loaded = LocalStorageService.getSupabaseConfig();
      if (loaded && loaded.url && loaded.anonKey) {
        this.config = loaded;
      } else if (ENV_SUPABASE_URL && ENV_SUPABASE_ANON_KEY) {
        this.config = {
          url: ENV_SUPABASE_URL,
          anonKey: ENV_SUPABASE_ANON_KEY,
          isEnabled: true,
        };
      } else {
        this.config = loaded || { url: '', anonKey: '', isEnabled: false };
      }
    } catch {
      this.config = { url: '', anonKey: '', isEnabled: false };
    }
    return this.config;
  };

  public saveConfig = (config: SupabaseConfig) => {
    this.config = config;
    LocalStorageService.saveSupabaseConfig(config);
  };

  public isConnected = (): boolean => {
    return !!(this.config?.isEnabled && this.config?.url && this.config?.anonKey);
  };

  public isConfigured = (): boolean => {
    return this.isConnected();
  };

  public getShareableSyncLink = (): string => {
    if (!this.config.url || !this.config.anonKey) return '';
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://my-hebit-tracker.vercel.app';
    return `${base}/?sb_url=${encodeURIComponent(this.config.url)}&sb_key=${encodeURIComponent(this.config.anonKey)}`;
  };

  public getStatusText = (): { status: 'cloud' | 'offline'; text: string; details: string } => {
    if (this.isConnected()) {
      return {
        status: 'cloud',
        text: 'Cloud Terhubung (Supabase)',
        details: `Sinkronisasi real-time aktif ke ${(this.config?.url || '').replace(/https?:\/\//, '').slice(0, 18)}...`,
      };
    }
    return {
      status: 'offline',
      text: 'Mode Lokal / Offline-First',
      details: 'Data tersimpan aman di perangkat. Hubungkan Supabase di Pengaturan untuk sync instan lintas HP & Laptop.',
    };
  };
}

export const supabaseService = new SupabaseService();
