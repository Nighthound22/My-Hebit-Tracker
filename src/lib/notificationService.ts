// ==============================================================================
// Aura Alarm & Notification Service (Web Audio Chime + System Notifications)
// Real-Time Schedule Alarms & Exact Timer Alerts
// ==============================================================================

import { soundSynth } from './audioSynth';
import { TimeBlock } from '../types';

class NotificationService {
  private hasRequested: boolean = false;
  private triggeredBlocks: Set<string> = new Set();

  // Minta izin notifikasi browser
  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.hasRequested = true;
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  // Kirim notifikasi sistem + bunyikan alarm
  public triggerAlarm(title: string, body: string) {
    // 1. Bunyikan nada audio chime
    soundSynth.playSessionEndChime();

    // 2. Munculkan notifikasi sistem browser
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/assets/icon.png',
          badge: '/assets/icon.png',
          tag: 'aura-schedule-alarm',
          silent: false,
        });
      } catch (e) {
        console.warn('Gagal memicu Notification API:', e);
      }
    }
  }

  // Monitor waktu real-time dan picu alarm jika ada jadwal yang cocok
  public checkScheduledAlarms(timeBlocks: TimeBlock[]) {
    const now = new Date();
    const currentHHMM = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    timeBlocks.forEach(block => {
      // Jika jam mulai sama dengan jam sekarang dan belum pernah dipicu hari ini
      const triggerKey = `${block.id}_${now.toDateString()}_${block.start_time}`;

      if (block.start_time === currentHHMM && !this.triggeredBlocks.has(triggerKey)) {
        this.triggeredBlocks.add(triggerKey);
        this.triggerAlarm(
          `⏰ Waktunya: ${block.title}!`,
          `Jadwal ${block.category} dimulai (${block.start_time} - ${block.end_time}). Waktunya bersiap dan fokus!`
        );
      }
    });
  }

  // Tombol tes alarm untuk pengguna
  public testAlarm() {
    this.triggerAlarm(
      '🔔 Tes Sistem Alarm Aura Tracker Berhasil!',
      'Suara audio chime dan notifikasi sistem bekerja optimal di perangkat antum.'
    );
  }
}

export const notificationService = new NotificationService();
