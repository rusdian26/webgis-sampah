import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bpyffskygaocktcakbyk.supabase.co/rest/v1/";
const supabaseKey = "sb_publishable_wQ_wjosTiJTdp7M_3u0Z3Q_SvRAgA8j";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log("Mengecek tabel 'users'...");
  const { error: usersError } = await supabase.from("users").select("*").limit(1);
  if (usersError) {
    console.log("-> Tabel 'users' error/tidak ditemukan:", usersError.message);
  } else {
    console.log("-> Tabel 'users' BISA diakses!");
  }

  console.log("\nMengecek tabel 'sampah'...");
  const { error: sampahError } = await supabase.from("sampah").select("*").limit(1);
  if (sampahError) {
    console.log("-> Tabel 'sampah' error/tidak ditemukan:", sampahError.message);
  } else {
    console.log("-> Tabel 'sampah' BISA diakses!");
  }
  
  console.log("\nMengecek tabel 'profiles' (sebagai tambahan)...");
  const { error: profilesError } = await supabase.from("profiles").select("*").limit(1);
  if (profilesError) {
    console.log("-> Tabel 'profiles' error/tidak ditemukan:", profilesError.message);
  } else {
    console.log("-> Tabel 'profiles' BISA diakses!");
  }
}

checkTables();
