// ==============================================================================
// Aura Neon Serverless PostgreSQL Client & Cloud Sync Engine
// Khusus untuk Neon Console (https://console.neon.tech - Project: proud-base-70292180)
// Mendukung query langsung lewat HTTP (@neondatabase/serverless) & Auto-Pairing HP
// ==============================================================================

import { neon } from '@neondatabase/serverless';
import { safeStorage } from './storage';
import { AppSyncData } from './supabaseSync';

export interface NeonConfig {
  connectionString: string;
  projectId: string;
  isEnabled: boolean;
}

const NEON_STORAGE_KEY = 'aura_neon_config_v1';
const DEFAULT_PROJECT_ID = 'proud-base-70292180';

// Default connection string dari env jika tersedia di Vercel
const DEFAULT_NEON_URL =
  (typeof import.meta !== 'undefined' &&
    (import.meta.env?.VITE_NEON_DATABASE_URL || import.meta.env?.VITE_DATABASE_URL)) ||
  '';

export class NeonSyncService {
  private config: NeonConfig;
  private isPushing = false;
  private isTableInitialized = false;

  constructor() {
    this.config = this.loadConfig();
    this.checkUrlForAutoPairing();
  }

  // Muat konfigurasi dari localStorage atau env
  public loadConfig(): NeonConfig {
    const raw = safeStorage.getItem(NEON_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return {
          connectionString: parsed.connectionString || DEFAULT_NEON_URL,
          projectId: parsed.projectId || DEFAULT_PROJECT_ID,
          isEnabled: parsed.isEnabled ?? true,
        };
      } catch {
        // Fallback
      }
    }

    return {
      connectionString: DEFAULT_NEON_URL,
      projectId: DEFAULT_PROJECT_ID,
      isEnabled: true,
    };
  }

  // Simpan konfigurasi
  public saveConfig(config: NeonConfig): void {
    this.config = {
      ...config,
      connectionString: config.connectionString.trim(),
      projectId: config.projectId.trim() || DEFAULT_PROJECT_ID,
    };
    safeStorage.setItem(NEON_STORAGE_KEY, JSON.stringify(this.config));
    this.isTableInitialized = false;
  }

  public getConfig(): NeonConfig {
    return { ...this.config };
  }

  public isConfigured(): boolean {
    return Boolean(this.config.isEnabled && this.config.connectionString);
  }

  // Deteksi auto-pairing dari tautan pintar (?neon_conn=...)
  private checkUrlForAutoPairing(): void {
    if (typeof window === 'undefined') return;

    try {
      const params = new URLSearchParams(window.location.search);
      const connParam = params.get('neon_conn');
      const projParam = params.get('neon_proj');

      if (connParam) {
        const decodedConn = decodeURIComponent(connParam);
        const newCfg: NeonConfig = {
          connectionString: decodedConn,
          projectId: projParam ? decodeURIComponent(projParam) : DEFAULT_PROJECT_ID,
          isEnabled: true,
        };
        this.saveConfig(newCfg);

        // Hapus query params dari address bar browser agar rapi
        params.delete('neon_conn');
        params.delete('neon_proj');
        const newSearch = params.toString();
        const newUrl =
          window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
      }
    } catch (err) {
      console.warn('Neon auto-pairing check failed:', err);
    }
  }

  // Buat tautan 1-klik untuk dikirim ke WhatsApp / dibuka di browser HP
  public getShareableSyncLink(customCfg?: NeonConfig): string {
    const active = customCfg || this.config;
    if (typeof window === 'undefined') return '';

    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    if (!active.connectionString) return baseUrl;

    const params = new URLSearchParams();
    params.set('neon_conn', encodeURIComponent(active.connectionString));
    if (active.projectId) {
      params.set('neon_proj', encodeURIComponent(active.projectId));
    }
    return `${baseUrl}?${params.toString()}`;
  }

  // Pastikan tabel user_sync_data sudah ada di database Neon
  public async ensureSyncTable(sqlClient: ReturnType<typeof neon>): Promise<void> {
    if (this.isTableInitialized) return;

    try {
      await sqlClient`
        CREATE TABLE IF NOT EXISTS public.user_sync_data (
          email TEXT PRIMARY KEY,
          data JSONB NOT NULL DEFAULT '{}'::jsonb,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      this.isTableInitialized = true;
    } catch (err) {
      console.warn('Auto-create sync table warning in Neon:', err);
    }
  }

  // Uji koneksi ke Neon Console
  public async testConnection(
    customConfig?: NeonConfig
  ): Promise<{ success: boolean; message: string }> {
    const cfg = customConfig || this.config;
    if (!cfg.connectionString) {
      return {
        success: false,
        message: 'Connection string Neon belum diisi. Salin dari dashboard console.neon.tech.',
      };
    }

    try {
      const sql = neon(cfg.connectionString);
      // Tes query SELECT 1
      const ping = await sql`SELECT 1 as connected;`;
      if (!ping || ping.length === 0) {
        return { success: false, message: 'Gagal menerima respon dari server Neon.' };
      }

      // Otomatis buat / cek tabel sinkronisasi
      await this.ensureSyncTable(sql);

      return {
        success: true,
        message: 'Koneksi ke Neon Console (proud-base-70292180) & Tabel Sync AKTIF!',
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungi server Neon.';
      return { success: false, message: `Koneksi gagal: ${msg}` };
    }
  }

  // Tarik data terbaru dari Neon Console berdasarkan email
  public async pullData(email: string): Promise<AppSyncData | null> {
    if (!this.isConfigured() || !email) return null;

    try {
      const sql = neon(this.config.connectionString);
      await this.ensureSyncTable(sql);

      const cleanEmail = email.trim().toLowerCase();
      const rows = await sql`
        SELECT data, updated_at 
        FROM public.user_sync_data 
        WHERE email = ${cleanEmail} 
        LIMIT 1;
      `;

      if (Array.isArray(rows) && rows.length > 0 && rows[0]?.data) {
        return rows[0].data as AppSyncData;
      }

      return null;
    } catch (err) {
      console.warn('Neon Cloud Sync pull warning:', err);
      return null;
    }
  }

  // Dorong / Simpan data terbaru ke Neon Console (Atomic Upsert)
  public async pushData(email: string, payload: AppSyncData): Promise<boolean> {
    if (!this.isConfigured() || !email) return false;
    if (this.isPushing) return false;

    this.isPushing = true;
    try {
      const sql = neon(this.config.connectionString);
      await this.ensureSyncTable(sql);

      const cleanEmail = email.trim().toLowerCase();
      const jsonPayload = JSON.stringify(payload);

      await sql`
        INSERT INTO public.user_sync_data (email, data, updated_at)
        VALUES (${cleanEmail}, ${jsonPayload}::jsonb, NOW())
        ON CONFLICT (email) 
        DO UPDATE SET 
          data = EXCLUDED.data,
          updated_at = NOW();
      `;

      return true;
    } catch (err) {
      console.warn('Neon Cloud Sync push warning:', err);
      return false;
    } finally {
      this.isPushing = false;
    }
  }
}

export const neonSyncService = new NeonSyncService();
