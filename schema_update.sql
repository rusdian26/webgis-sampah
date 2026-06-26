-- 1. Create pembayaran table for Warga transactions
CREATE TABLE IF NOT EXISTS pembayaran (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sampah_id UUID REFERENCES sampah(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nominal FLOAT DEFAULT 0,
  metode_pembayaran TEXT,
  status TEXT DEFAULT 'Pending', -- Pending, Berhasil, Lunas
  tanggal_bayar TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create pengangkutan table for Courier transactions/tasks
CREATE TABLE IF NOT EXISTS pengangkutan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sampah_id UUID REFERENCES sampah(id) ON DELETE CASCADE,
  courier_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Diproses', -- Diproses, Selesai
  waktu_jemput TIMESTAMP WITH TIME ZONE,
  waktu_selesai TIMESTAMP WITH TIME ZONE
);

-- 3. Create pendapatan_courier table for Courier financial earnings
CREATE TABLE IF NOT EXISTS pendapatan_courier (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pengangkutan_id UUID REFERENCES pengangkutan(id) ON DELETE CASCADE,
  courier_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nominal FLOAT DEFAULT 0,
  status_pencairan TEXT DEFAULT 'Belum', -- Belum, Dicairkan
  tanggal_masuk TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Update existing transporters to couriers in users table
UPDATE users SET role = 'courier' WHERE role = 'transporter';

-- 5. Disable RLS for the new tables so that CRUD works properly
ALTER TABLE pembayaran DISABLE ROW LEVEL SECURITY;
ALTER TABLE pengangkutan DISABLE ROW LEVEL SECURITY;
ALTER TABLE pendapatan_courier DISABLE ROW LEVEL SECURITY;
