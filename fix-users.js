import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bpyffskygaocktcakbyk.supabase.co/rest/v1/";
const supabaseKey = "sb_publishable_wQ_wjosTiJTdp7M_3u0Z3Q_SvRAgA8j";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUsers() {
  const accounts = [
    { email: "admin@test.com", password: "password123", nama: "Admin WebGIS", role: "admin" },
    { email: "transporter@test.com", password: "password123", nama: "Driver Transporter", role: "transporter" }
  ];

  for (const acc of accounts) {
    let { data, error } = await supabase.auth.signInWithPassword({
      email: acc.email,
      password: acc.password,
    });
    
    if (error) {
      console.log("Error login as", acc.email, ":", error.message);
      // Maybe try to signup?
      const res = await supabase.auth.signUp({ email: acc.email, password: acc.password });
      data = res.data;
    }

    if (data?.user) {
      const { error: pError } = await supabase.from("users").upsert([
        { id: data.user.id, nama: acc.nama, email: acc.email, role: acc.role }
      ]);
      if (pError) console.log("Error inserting to users", acc.email, pError.message);
      else console.log("Success fixed user:", acc.email, "as", acc.role);
    }
  }
}

fixUsers();
