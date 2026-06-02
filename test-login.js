import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bpyffskygaocktcakbyk.supabase.co/rest/v1/";
const supabaseKey = "sb_publishable_wQ_wjosTiJTdp7M_3u0Z3Q_SvRAgA8j";

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'warga@test.com',
    password: 'password123'
  });
  console.log("Login result:", data, error);
}
test();
