import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://bpyffskygaocktcakbyk.supabase.co', 'sb_publishable_wQ_wjosTiJTdp7M_3u0Z3Q_SvRAgA8j');

async function getSQL() {
  const res1 = await supabase.auth.signInWithPassword({ email: 'admin@ecowaste.com', password: 'password123' });
  const res2 = await supabase.auth.signInWithPassword({ email: 'courier@ecowaste.com', password: 'password123' });
  const res3 = await supabase.auth.signInWithPassword({ email: 'warga@ecowaste.com', password: 'password123' });
  
  const id1 = res1.data?.user?.id;
  const id2 = res2.data?.user?.id;
  const id3 = res3.data?.user?.id;

  const sql = `
-- 9. Tambahkan kolom status_akun jika belum ada
ALTER TABLE users ADD COLUMN IF NOT EXISTS status_akun TEXT DEFAULT 'Pending';

-- 10. Memasukkan Akun Dummy untuk Testing
INSERT INTO users (id, email, nama, role, status_akun) VALUES
('${id1}', 'admin@ecowaste.com', 'Admin Pusat', 'admin', 'Aktif'),
('${id2}', 'courier@ecowaste.com', 'Budi Courier', 'courier', 'Aktif'),
('${id3}', 'warga@ecowaste.com', 'Siti Warga', 'warga', 'Aktif')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, status_akun = EXCLUDED.status_akun;
`;
  console.log(sql);
}

getSQL();
