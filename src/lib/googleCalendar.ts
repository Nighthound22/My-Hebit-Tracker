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
      throw new Error('Anda belum login dengan akun Google atau sesi telah berakhir.');
    }

    const now = new Date();
    const timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
    const timeMax = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
      timeMin
    )}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Izin akses Google Calendar kadaluarsa. Silakan login ulang.');
      }
      throw new Error(`Gagal mengambil data kalender: ${res.statusText}`);
    }

    const data = await res.json();
    const items: GoogleCalendarEvent[] = data.items || [];

    // Filter event yang memiliki start dan end dateTime
    const timeBlocks: TimeBlock[] = items
      .filter(item => item.start?.dateTime && item.end?.dateTime)
      .map(item => {
        const startDate = new Date(item.start.dateTime!);
        const endDate = new Date(item.end.dateTime!);

        const formatHHMM = (d: Date) => {
          const h = d.getHours().toString().padStart(2, '0');
          const m = d.getMinutes().toString().padStart(2, '0');
          return `${h}:${m}`;
        };

        return {
          id: `gcal-${item.id}`,
          title: item.summary || 'Agenda Google Calendar',
          start_time: formatHHMM(startDate),
          end_time: formatHHMM(endDate),
          category: 'Kerja',
          isGoogleEvent: true,
          sourceLink: item.htmlLink,
          notes: item.description || 'Disinkronkan otomatis dari Google Calendar',
        };
      });

    return timeBlocks;
  }
}
