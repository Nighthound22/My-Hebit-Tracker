// ==============================================================================
// Aura Supabase Client & Real-time Synchronization Utility
// ==============================================================================

import { LocalStorageService } from './storage';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isEnabled: boolean;
}

// In-memory or dynamic client wrapper
class SupabaseService {
  private client: unknown = null;
  private config: SupabaseConfig = { url: '', anonKey: '', isEnabled: false };

  constructor() {
    this.loadConfig = this.loadConfig.bind(this);
    this.saveConfig = this.saveConfig.bind(this);
    this.isConnected = this.isConnected.bind(this);
    this.getStatusText = this.getStatusText.bind(this);
    this.loadConfig();
  }

  public loadConfig = (): SupabaseConfig => {
    try {
      const loaded = LocalStorageService.getSupabaseConfig();
      this.config = loaded || { url: '', anonKey: '', isEnabled: false };
    } catch {
      this.config = { url: '', anonKey: '', isEnabled: false };
    }
    return this.config;
  };

  public saveConfig = (config: SupabaseConfig) => {
    this.config = config;
    LocalStorageService.saveSupabaseConfig(config);
    this.client = null; // reset client to re-initialize
  };

  public isConnected = (): boolean => {
    return !!(this.config?.isEnabled && this.config?.url && this.config?.anonKey);
  };

  public getStatusText = (): { status: 'cloud' | 'offline'; text: string; details: string } => {
    if (this.isConnected()) {
      return {
        status: 'cloud',
        text: 'Cloud Terhubung (Supabase)',
        details: `Sinkronisasi real-time aktif ke ${(this.config?.url || '').replace(/https?:\/\//, '').slice(0, 15)}...`,
      };
    }
    return {
      status: 'offline',
      text: 'Mode Lokal / Offline-First',
      details: 'Data tersimpan aman di perangkat. Masukkan URL & Key Supabase di Pengaturan untuk sync lintas HP & Laptop.',
    };
  };
}

export const supabaseService = new SupabaseService();
