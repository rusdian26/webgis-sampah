import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bpyffskygaocktcakbyk.supabase.co/rest/v1/";
const supabaseKey = "sb_publishable_wQ_wjosTiJTdp7M_3u0Z3Q_SvRAgA8j";

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const users = [
    { email: "admin@test.com", password: "password123", nama: "Admin Test", role: "admin" },
    { email: "transporter@test.com", password: "password123", nama: "Transporter Test", role: "transporter" }
  ];

  for (const u of users) {
    const { data, error } = await supabase.auth.signUp({
      email: u.email,
      password: u.password,
    });
    
    if (error) {
      console.log("Error signing up", u.email, error.message);
      continue;
    }
    
    if (data?.user) {
      const { error: pError } = await supabase.from("profiles").insert([{ id: data.user.id, nama: u.nama, role: u.role }]);
      if (pError) console.log("Error profiles", u.email, pError.message);
      else console.log("Success seeded", u.email);
    }
  }
}

seed();
