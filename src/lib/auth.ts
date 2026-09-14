// ==============================================================================
// Aura Google OAuth 2.0 Authentication Service (Google Identity Services GIS)
// Real Google Login with Multi-User Session & Calendar Permissions Scope
// ==============================================================================

import { AuthUser } from '../types';
import { safeStorage } from './storage';

const AUTH_STORAGE_KEY = 'aura_auth_user_v1';
const GOOGLE_CLIENT_ID_KEY = 'aura_google_client_id_v1';

// Default / fallback Google Client ID (dapat diubah di Settings atau .env)
const DEFAULT_CLIENT_ID =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) ||
  '942475454655-0g2i4t9l1r4a0g49e414c8p1k9a3p5.apps.googleusercontent.com';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string; expires_in?: number }) => void;
            error_callback?: (err: { message: string }) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

type AuthListener = (user: AuthUser | null) => void;

class GoogleAuthService {
  private user: AuthUser | null = null;
  private listeners: AuthListener[] = [];
  private tokenClient: unknown = null;

  constructor() {
    this.loadSession();
  }

  public getClientId(): string {
    return safeStorage.getItem(GOOGLE_CLIENT_ID_KEY) || DEFAULT_CLIENT_ID;
  }

  public setClientId(clientId: string): void {
    safeStorage.setItem(GOOGLE_CLIENT_ID_KEY, clientId.trim());
    this.tokenClient = null; // reset client
  }

  public getUser(): AuthUser | null {
    return this.user;
  }

  public isAuthenticated(): boolean {
    return !!this.user;
  }

  public getAccessToken(): string | null {
    if (!this.user || !this.user.accessToken) return null;
    if (this.user.expiresAt && Date.now() > this.user.expiresAt) {
      // Token expired
      return null;
    }
    return this.user.accessToken;
  }

  public subscribe(listener: AuthListener): () => void {
    this.listeners.push(listener);
    listener(this.user);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => l(this.user));
  }

  private loadSession(): void {
    const raw = safeStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.user = parsed;
      } catch {
        this.user = null;
      }
    }
  }

  private saveSession(user: AuthUser | null): void {
    this.user = user;
    if (user) {
      safeStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      safeStorage.removeItem(AUTH_STORAGE_KEY);
    }
    this.notify();
  }

  // Real Google OAuth 2.0 Popup Login
  public async loginWithGoogle(): Promise<AuthUser> {
    const clientId = this.getClientId();

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
        reject(
          new Error(
            'Google Identity SDK belum dimuat. Pastikan koneksi internet terhubung dan refresh halaman.'
          )
        );
        return;
      }

      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid https://www.googleapis.com/auth/calendar.events.readonly',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              reject(new Error(`Login Google dibatalkan: ${tokenResponse.error}`));
              return;
            }

            if (!tokenResponse.access_token) {
              reject(new Error('Access token tidak ditemukan dari Google.'));
              return;
            }

            try {
              // Ambil profil asli user dari Google UserInfo API
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`,
                },
              });

              if (!res.ok) {
                throw new Error('Gagal mengambil data profil dari akun Google.');
              }

              const info = await res.json();
              const expiresIn = tokenResponse.expires_in || 3600;

              const authUser: AuthUser = {
                id: info.sub,
                email: info.email,
                name: info.name,
                picture: info.picture,
                accessToken: tokenResponse.access_token,
                expiresAt: Date.now() + expiresIn * 1000,
              };

              this.saveSession(authUser);
              resolve(authUser);
            } catch (err: unknown) {
              reject(err instanceof Error ? err : new Error('Gagal memproses profil Google.'));
            }
          },
          error_callback: (err) => {
            reject(new Error(`Google OAuth error: ${err.message}`));
          },
        });

        // Luncurkan dialog resmi Google Login
        client.requestAccessToken({ prompt: 'select_account' });
      } catch (err: unknown) {
        reject(err instanceof Error ? err : new Error('Gagal inisialisasi Google Token Client.'));
      }
    });
  }

  public logout(): void {
    this.saveSession(null);
  }
}

export const googleAuthService = new GoogleAuthService();
