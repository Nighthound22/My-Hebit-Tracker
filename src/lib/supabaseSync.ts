// ==============================================================================
// Mesin Sinkronisasi Cloud Dua Arah (Laptop & HP) via Supabase REST API
// Bekerja menggunakan fetch native tanpa dependensi eksternal yang berat
// ==============================================================================

import { supabaseService, SupabaseConfig } from './supabase';
import { Habit, TaskItem, TimeBlock, UserProfile, FocusSession, QuickNote } from '../types';

export interface AppSyncData {
  profile: UserProfile;
  habits: Habit[];
  tasks: TaskItem[];
  timeBlocks: TimeBlock[];
  focusSessions: FocusSession[];
  waterCups: number;
  notes: QuickNote[];
  updatedAt: string;
}

export class SupabaseSyncService {
  private isPushing = false;

  // Uji koneksi ke server Supabase & cek ketersediaan tabel user_sync_data
  public async testConnection(config?: SupabaseConfig): Promise<{ success: boolean; message: string }> {
    const activeCfg = config || supabaseService.loadConfig();
    if (!activeCfg.url || !activeCfg.anonKey) {
      return { success: false, message: 'URL atau Anon Key Supabase belum diisi.' };
    }

    try {
      const cleanUrl = activeCfg.url.replace(/\/+$/, '');
      const res = await fetch(`${cleanUrl}/rest/v1/user_sync_data?select=email&limit=1`, {
        headers: {
          apikey: activeCfg.anonKey,
          Authorization: `Bearer ${activeCfg.anonKey}`,
        },
      });

      if (res.ok) {
        return { success: true, message: 'Koneksi Supabase & Tabel user_sync_data siap dan aktif!' };
      } else if (res.status === 404 || res.status === 400 || res.status === 406) {
        const errJson = await res.json().catch(() => null);
        if (errJson?.message?.includes('user_sync_data') || errJson?.code === '42P01') {
          return {
            success: false,
            message: 'Tabel user_sync_data belum dibuat! Harap salin dan jalankan skema SQL di SQL Editor Supabase Anda.',
          };
        }
        return { success: false, message: `Supabase merespons: ${errJson?.message || res.statusText}` };
      } else if (res.status === 401 || res.status === 403) {
        return { success: false, message: 'Anon Key atau izin akses Supabase tidak valid.' };
      }
      return { success: false, message: `Server Supabase merespons status ${res.status}` };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungi server Supabase.';
      return { success: false, message: msg };
    }
  }

  // Tarik data terbaru dari Cloud Supabase berdasarkan email pengguna
  public async pullData(email: string): Promise<AppSyncData | null> {
    const config = supabaseService.loadConfig();
    if (!config.isEnabled || !config.url || !config.anonKey || !email) {
      return null;
    }

    try {
      const cleanUrl = config.url.replace(/\/+$/, '');
      const cleanEmail = email.trim().toLowerCase();
      const endpoint = `${cleanUrl}/rest/v1/user_sync_data?email=eq.${encodeURIComponent(cleanEmail)}&select=*`;

      const res = await fetch(endpoint, {
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        return null;
      }

      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0 && rows[0]?.data) {
        return rows[0].data as AppSyncData;
      }

      return null;
    } catch (err) {
      console.warn('Supabase Cloud Sync pull warning:', err);
      return null;
    }
  }

  // Simpan / Upsert data terbaru ke Cloud Supabase
  public async pushData(email: string, payload: AppSyncData): Promise<boolean> {
    const config = supabaseService.loadConfig();
    if (!config.isEnabled || !config.url || !config.anonKey || !email) {
      return false;
    }

    if (this.isPushing) return false;
    this.isPushing = true;

    try {
      const cleanUrl = config.url.replace(/\/+$/, '');
      const cleanEmail = email.trim().toLowerCase();
      const endpoint = `${cleanUrl}/rest/v1/user_sync_data?on_conflict=email`;

      const body = {
        email: cleanEmail,
        data: payload,
        updated_at: new Date().toISOString(),
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify(body),
      });

      return res.ok;
    } catch (err) {
      console.warn('Supabase Cloud Sync push warning:', err);
      return false;
    } finally {
      this.isPushing = false;
    }
  }
}

export const supabaseSyncService = new SupabaseSyncService();
