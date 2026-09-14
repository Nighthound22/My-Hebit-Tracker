-- ==============================================================================
-- Aura Habit Tracker: Skema Sinkronisasi Cloud Multi-Device (Laptop & HP)
-- Jalankan file ini di Supabase SQL Editor (hanya 1 kali klik Run)
-- ==============================================================================

-- 1. Buat Tabel Penyimpanan Sinkronisasi Akun Cloud
CREATE TABLE IF NOT EXISTS public.user_sync_data (
  email TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Aktifkan Row Level Security (RLS) dengan Izin Akses Akun
ALTER TABLE public.user_sync_data ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan Akses: Izinkan Perangkat Pengguna Membaca & Menyimpan Data Akun
DROP POLICY IF EXISTS "Allow multi device sync" ON public.user_sync_data;
CREATE POLICY "Allow multi device sync"
  ON public.user_sync_data
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Indeks Performa untuk Pencarian Kilat berdasarkan Email
CREATE INDEX IF NOT EXISTS idx_user_sync_email ON public.user_sync_data(email);
