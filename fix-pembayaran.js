import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bpyffskygaocktcakbyk.supabase.co";
const supabaseKey = "sb_publishable_wQ_wjosTiJTdp7M_3u0Z3Q_SvRAgA8j";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPembayaran() {
  const { data: sData } = await supabase.from('sampah').select('*').in('status_pembayaran', ['Lunas', 'Proses Bayar']);
  
  for (const s of sData) {
    const { data: pData } = await supabase.from('pembayaran').select('*').eq('sampah_id', s.id).single();
    if (!pData) {
      await supabase.from('pembayaran').insert({
        sampah_id: s.id,
        user_id: s.user_id,
        nominal: s.nominal || 0,
        metode_pembayaran: 'Sistem Lama (Auto)',
        status: s.status_pembayaran === 'Proses Bayar' ? 'Pending' : 'Berhasil',
        tanggal_bayar: s.created_at // fallback ke created_at
      });
      console.log(`Fixed pembayaran for sampah ${s.id}`);
    }
  }
  console.log("Pembayaran fix complete.");
}
fixPembayaran();
