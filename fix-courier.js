import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bpyffskygaocktcakbyk.supabase.co";
const supabaseKey = "sb_publishable_wQ_wjosTiJTdp7M_3u0Z3Q_SvRAgA8j";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCourier() {
  const targetCourierId = 'ed0febda-dda0-4091-8f94-f43141b2210b'; // The new active courier
  
  // Update pendapatan
  const { error: e1 } = await supabase.from('pendapatan_courier').update({ courier_id: targetCourierId }).not('courier_id', 'is', null);
  console.log("Update pendapatan:", e1);
  
  // Update pengangkutan
  const { error: e2 } = await supabase.from('pengangkutan').update({ transporter_id: targetCourierId }).not('transporter_id', 'is', null);
  console.log("Update pengangkutan:", e2);
}
fixCourier();
