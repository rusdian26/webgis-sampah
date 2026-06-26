import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bpyffskygaocktcakbyk.supabase.co";
const supabaseKey = "sb_publishable_wQ_wjosTiJTdp7M_3u0Z3Q_SvRAgA8j";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixBrokenData() {
  // Get all sampah that are Selesai
  const { data: sampahData } = await supabase.from('sampah').select('*').eq('status_pengangkutan', 'Selesai');
  
  for (const s of sampahData) {
    // Check if pengangkutan exists
    const { data: pData } = await supabase.from('pengangkutan').select('*').eq('sampah_id', s.id).single();
    
    let pengangkutanId;
    let courierId = '54906f87-ec07-48b8-a227-165a8c1b9cb2'; // Default courier for demo
    
    if (!pData) {
      // Insert pengangkutan
      const { data: newP } = await supabase.from('pengangkutan').insert({
        sampah_id: s.id,
        transporter_id: courierId,
        status: 'Selesai',
        waktu_jemput: s.created_at,
        waktu_selesai: new Date().toISOString()
      }).select().single();
      
      if (newP) pengangkutanId = newP.id;
    } else {
      pengangkutanId = pData.id;
      courierId = pData.transporter_id;
    }
    
    if (pengangkutanId) {
      // Check if pendapatan exists
      const { data: pcData } = await supabase.from('pendapatan_courier').select('*').eq('pengangkutan_id', pengangkutanId).single();
      if (!pcData) {
        const upah = s.nominal ? s.nominal * 0.8 : 10000;
        await supabase.from('pendapatan_courier').insert({
          pengangkutan_id: pengangkutanId,
          courier_id: courierId,
          nominal: upah,
          status_pencairan: 'Belum',
          tanggal_masuk: new Date().toISOString()
        });
        console.log(`Fixed pendapatan for sampah ${s.id}`);
      }
    }
  }
  console.log("Fix complete.");
}
fixBrokenData();
