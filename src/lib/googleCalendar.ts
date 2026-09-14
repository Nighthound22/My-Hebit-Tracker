// ==============================================================================
// Layanan Integrasi Google Calendar API v3
// Menarik agenda harian Google Calendar dan mengonversinya ke TimeBlock
// ==============================================================================

import { TimeBlock, GoogleCalendarEvent } from '../types';
import { googleAuthService } from './auth';

export class GoogleCalendarService {
  public static async fetchTodayEvents(): Promise<TimeBlock[]> {
    const token = googleAuthService.getAccessToken();
    if (!token) {
      throw new Error('Anda belum login dengan akun Google atau sesi telah berakhir. Silakan login ulang.');
    }

    const now = new Date();
    // Rentang hari ini dari jam 00:00:00 sampai 23:59:59
    const timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
    const timeMax = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
      timeMin
    )}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;

    let res: Response;
    try {
      res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
    } catch {
      throw new Error('Koneksi internet terputus saat menghubungi server Google Calendar.');
    }

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const apiMsg: string = errJson?.error?.message || res.statusText;

      // Jika Google Calendar API belum diaktifkan di Google Cloud Project pengguna
      if (
        res.status === 403 &&
        (apiMsg.includes('has not been used') || apiMsg.includes('disabled') || apiMsg.includes('API'))
      ) {
        throw new Error(
          'Google Calendar API belum diaktifkan di Google Cloud Console antum. Buka tautan berikut untuk mengaktifkannya (sekali klik): https://console.cloud.google.com/apis/library/calendar-json.googleapis.com'
        );
      }

      if (res.status === 401) {
        throw new Error('Izin Google Calendar kadaluarsa atau belum dicentang saat login. Silakan keluar dan login ulang.');
      }

      if (res.status === 403) {
        throw new Error(`Akses Google Calendar dibatasi (403): ${apiMsg}. Pastikan izin Google Calendar sudah dicentang saat login.`);
      }

      throw new Error(`Gagal mengambil data kalender: ${apiMsg}`);
    }

    const data = await res.json();
    const items: GoogleCalendarEvent[] = data.items || [];

    const formatHHMM = (d: Date) => {
      const h = d.getHours().toString().padStart(2, '0');
      const m = d.getMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    };

    // Dukung agenda dengan jam spesifik (dateTime) maupun seharian penuh (date)
    const timeBlocks: TimeBlock[] = items
      .filter(item => (item.start?.dateTime && item.end?.dateTime) || item.start?.date)
      .map(item => {
        let startTime = '08:00';
        let endTime = '17:00';

        if (item.start?.dateTime && item.end?.dateTime) {
          const startDate = new Date(item.start.dateTime);
          const endDate = new Date(item.end.dateTime);
          startTime = formatHHMM(startDate);
          endTime = formatHHMM(endDate);
        }

        return {
          id: `gcal-${item.id}`,
          title: item.summary || 'Agenda Google Calendar',
          start_time: startTime,
          end_time: endTime,
          category: 'Kerja',
          isGoogleEvent: true,
          sourceLink: item.htmlLink,
          notes: item.description || 'Disinkronkan otomatis dari Google Calendar',
        };
      });

    return timeBlocks;
  }
}
