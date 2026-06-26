-- ==========================================
-- SQL SCHEMA LENGKAP WEBGIS SAMPAH
-- (Dapat langsung di-copy paste ke SQL Editor Supabase)
-- ==========================================

-- 1. users (Profile data untuk nyimpan role)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'warga'
);

-- 2. sampah (Tabel Flat terintegrasi sesuai permintaan tugas)
CREATE TABLE IF NOT EXISTS sampah (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nama_warga TEXT NOT NULL,
  jenis_sampah TEXT NOT NULL,
  berat FLOAT NOT NULL,
  catatan TEXT,
  alamat TEXT,
  no_hp TEXT,
  latitude FLOAT,
  longitude FLOAT,
  status_pengangkutan TEXT DEFAULT 'Menunggu', -- Menunggu, Diproses, Selesai
  status_pembayaran TEXT DEFAULT 'Belum',      -- Belum, Proses Bayar, Lunas
  nominal FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. pembayaran (Tabel pembayaran transaksi dari Warga)
CREATE TABLE IF NOT EXISTS pembayaran (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sampah_id UUID REFERENCES sampah(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nominal FLOAT DEFAULT 0,
  metode_pembayaran TEXT,
  status TEXT DEFAULT 'Pending', 
  tanggal_bayar TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. pengangkutan (Tabel relasi log pengangkutan oleh courier)
CREATE TABLE IF NOT EXISTS pengangkutan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sampah_id UUID REFERENCES sampah(id) ON DELETE CASCADE,
  courier_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Diproses',
  waktu_jemput TIMESTAMP WITH TIME ZONE,
  waktu_selesai TIMESTAMP WITH TIME ZONE
);

-- 5. pendapatan_courier (Tabel pendapatan/upah untuk para Courier)
CREATE TABLE IF NOT EXISTS pendapatan_courier (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pengangkutan_id UUID REFERENCES pengangkutan(id) ON DELETE CASCADE,
  courier_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nominal FLOAT DEFAULT 0,
  status_pencairan TEXT DEFAULT 'Belum',
  tanggal_masuk TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Mengganti semua role Transporter yang lama menjadi Courier
UPDATE users SET role = 'courier' WHERE role = 'transporter';

-- 7. Mendaftarkan ke Realtime agar UI bisa merespons otomatis (Realtime Database)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE sampah;
ALTER PUBLICATION supabase_realtime ADD TABLE pembayaran;
ALTER PUBLICATION supabase_realtime ADD TABLE pengangkutan;
ALTER PUBLICATION supabase_realtime ADD TABLE pendapatan_courier;

-- 8. MATIKAN RLS (Row-Level Security) AGAR SELURUH CRUD APLIKASI BERJALAN LANCAR
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE sampah DISABLE ROW LEVEL SECURITY;
ALTER TABLE pembayaran DISABLE ROW LEVEL SECURITY;
ALTER TABLE pengangkutan DISABLE ROW LEVEL SECURITY;
ALTER TABLE pendapatan_courier DISABLE ROW LEVEL SECURITY;
