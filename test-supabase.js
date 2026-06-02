import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bpyffskygaocktcakbyk.supabase.co/rest/v1/";
const supabaseKey = "sb_publishable_wQ_wjosTiJTdp7M_3u0Z3Q_SvRAgA8j";

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from("profiles").select("*").limit(1);
  if (error) {
    console.error("Error connecting:", error);
  } else {
    console.log("Connected successfully! Data:", data);
  }
}

test();
