# ⚡ Aura Habit & Productivity Tracker (Cyber-Obsidian Edition)

> **Ekosistem Produktivitas All-in-One Universal (Android, iOS, Web/Desktop)**
> Menggabungkan Pelacak Kebiasaan (*Habit Tracker*), Matriks Prioritas Tugas (*Eisenhower Matrix*), Penjadwalan Lini Waktu 24 Jam (*Time Blocking*), dan Pengukur Fokus (*Pomodoro Timer*) dengan Ambient Audio Synthesizer.

![Aura Productivity Banner](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80)

---

## ✨ Fitur Utama

- 🧭 **Command Palette Universal (`Ctrl+K` / `⌘K`)**:
  - Akses cepat keyboard ala Raycast & Linear untuk navigasi tab, input kebiasaan, buat tugas, setel timer, atau aktifkan audio ambient tanpa menyentuh mouse.
- 📊 **Daily Overview Bar & Metrik Bento**:
  - Ucapan salam dinamis (*Pagi/Siang/Sore/Malam*), tanggal Indonesia, dan jam digital real-time WIB.
  - 4 Kartu Bento: *Focus Score (1-10)*, *Tugas Selesai*, *Waktu Fokus*, dan *Produktivitas (%)* dengan kurva *sparkline* mikro SVG.
- 🎯 **Matriks Prioritas Eisenhower (4 Kuadran)**:
  - Kuadran 1: *Do First* (Urgent & Important)
  - Kuadran 2: *Schedule* (Not Urgent & Important)
  - Kuadran 3: *Delegate* (Urgent & Not Important)
  - Kuadran 4: *Eliminate* (Not Urgent & Not Important)
  - Pemindahan kuadran cepat via dropdown, checklist selesai, dan tag tingkat urgensi (*High, Medium, Low*).
- 📅 **Penjadwalan & Lini Waktu 24 Jam (Time Blocking)**:
  - 4 Kategori warna unik: **Kerja** (Biru), **Ibadah** (Hijau Zamrud), **Istirahat** (Kuning Amber), dan **Belajar** (Ungu).
  - *Smart Active Banner*: Deteksi otomatis aktivitas yang sedang berlangsung detik ini lengkap dengan sisa menit.
  - Penanda garis merah real-time dengan efek denyut radar (*radar pulse ping*).
- 🔁 **Pelacak Kebiasaan (Habit Tracker Matrix)**:
  - Matriks mingguan 7 hari (Senin s/d Minggu) dengan status dot/checkbox interaktif.
  - Penghitung *Streak* aktif beruntun (dengan lencana api emas 🔥).
  - Meteran kecepatan mingguan (*Weekly Velocity %*) dan filter pencarian kebiasaan.
- ⏱️ **Pengukur Fokus (Pomodoro) & Audio Synthesizer**:
  - *Cyber-HUD Dual-Ring Progress Gauge* dengan countdown 25m Focus, 5m Short Break, dan 15m Long Break.
  - **Ambient Sound Synthesizer** Web Audio API bawaan (tanpa perlu aset MP3 luar):
    - 🌧️ *Suara Hujan (Rain & Pink Noise)*
    - 🧠 *Binaural Beats 432Hz (Gelombang Alpha untuk fokus mendalam)*
    - 📻 *White Noise (Isolasi distraksi)*
    - ☕ *Lo-Fi Harmonic Chord Pulse*
- 💧 **Modul Pendukung (Auxiliary Widgets)**:
  - *Water Intake Tracker*: Target 8 gelas harian dengan tombol cepat `+1 Cup Minum Air`.
  - *Quick Notes / Inbox*: Scratchpad cepat untuk ide spontan.
  - *Upcoming Deadlines*: Prioritas tugas mendatang dengan hitung mundur waktu.
  - *Analisis & Tren Produktivitas*: Grafik tren skor harian dan diagram lingkaran (*donut chart*) alokasi waktu kegiatan.
- ☁️ **Supabase Database & Offline-First**:
  - Skema PostgreSQL lengkap siap pakai di `supabase/schema.sql` dengan Row Level Security (RLS).
  - Beroperasi penuh secara offline out-of-the-box, dengan modal pengaturan untuk menghubungkan URL & Anon Key Supabase.

---

## 🛠️ Tech Stack

- **Framework**: React 19, TypeScript, Vite
- **Mobile/Universal**: Expo (React Native / Android APK Ready)
- **Styling**: Tailwind CSS & Vanilla CSS (Cyber-Obsidian Theme, Glassmorphism 2.0)
- **Database & Auth**: Supabase (PostgreSQL with RLS)
- **Audio Engine**: Web Audio API Sound Synthesizer

---

## 🚀 Memulai Proyek (Getting Started)

### 1. Kloning Repositori
```bash
git clone https://github.com/Nighthound22/My-Hebit-Tracker.git
cd My-Hebit-Tracker
```

### 2. Instalasi Dependensi
```bash
npm install --legacy-peer-deps
```

### 3. Menjalankan Dev Server
```bash
npm run dev
```
Buka browser di **`http://localhost:5173/`**.

---

## 📱 Build File APK Android

Aplikasi telah dikonfigurasi dengan package name `com.aura.habittracker` di `app.json`.

### Kompilasi APK via EAS Build (Cloud):
```bash
# 1. Pasang EAS CLI
npm install -g eas-cli

# 2. Login akun Expo
eas login

# 3. Kompilasi APK standalone preview
eas build -p android --profile preview
```

---

## 📄 Skema Database Supabase

Salin seluruh isi file [`supabase/schema.sql`](./supabase/schema.sql) ke dalam **Supabase SQL Editor** untuk mengaktifkan tabel `profiles`, `habits`, `habit_logs`, `tasks`, `focus_sessions`, `time_blocks`, dan `quick_notes` lengkap dengan RLS Policies.

---

## 👤 Pengembang

Dibuat dengan dedikasi untuk produktivitas maksimal oleh **Brok Ahmad** & Google Antigravity.
Lisensi: MIT
