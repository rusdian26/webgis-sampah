-- Reset table
DROP TABLE IF EXISTS pembayaran CASCADE;
DROP TABLE IF EXISTS pengangkutan CASCADE;
DROP TABLE IF EXISTS sampah CASCADE;
DROP TABLE IF EXISTS warga CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. users (Profile data untuk nyimpan role)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'warga'
);

-- 2. sampah (Tabel Flat terintegrasi sesuai permintaan tugas)
CREATE TABLE sampah (
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

-- Aktifkan Realtime
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table sampah;

-- MATIKAN RLS (Row-Level Security) AGAR CRUD BERJALAN NORMAL TANPA KENDALA
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE sampah DISABLE ROW LEVEL SECURITY;
