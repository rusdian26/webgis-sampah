import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

export default function Register() {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
    noHp: "",
    role: "warga",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return Swal.fire("Oops!", "Password dan Konfirmasi Password tidak cocok!", "error");
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setLoading(false);
      return Swal.fire("Gagal", error.message, "error");
    }

    if (data?.user) {
      // First insert into users
      const { error: pError } = await supabase
        .from("users")
        .insert([
          {
            id: data.user.id,
            nama: form.nama,
            email: form.email,
            role: form.role,
            status_akun: "Pending",
          },
        ]);

      if (pError) {
        setLoading(false);
        return Swal.fire("Gagal", "Gagal simpan profil: " + pError.message, "error");
      }

      // If role is warga, insert into warga table
      if (form.role === "warga") {
        const { error: wError } = await supabase
          .from("warga")
          .insert([
            {
              user_id: data.user.id,
              no_hp: form.noHp,
            }
          ]);
        if (wError) {
          console.error("Gagal simpan ke tabel warga:", wError.message);
        }
      }

      // Supabase otomatis meloginkan user setelah signUp, jadi kita harus sign out langsung
      await supabase.auth.signOut();

      setLoading(false);
      await Swal.fire({
        icon: 'success',
        title: 'Pendaftaran Berhasil!',
        text: 'Silakan tunggu persetujuan dari Admin. Anda baru bisa login setelah akun disetujui.',
        confirmButtonText: 'Kembali ke Login',
        confirmButtonColor: '#16a34a'
      });
      
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative font-sans">
      {/* Background Header */}
      <div className="absolute top-0 left-0 w-full h-[45vh] bg-gradient-to-br from-green-500 to-green-700">
        {/* Decorative elements */}
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-white/10 rounded-full mix-blend-overlay blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-64 h-64 bg-green-400/30 rounded-full mix-blend-overlay blur-2xl"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center pt-12 pb-12 px-4 sm:px-6 lg:px-8">
        
        {/* Header Text */}
        <div className="text-center mb-10 mt-4 sm:mt-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-90 transition-opacity">
             <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-sm border border-white/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
             </div>
             <span className="font-bold text-2xl text-white tracking-wide">EcoWaste</span>
          </Link>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight drop-shadow-sm">Pendaftaran Akun</h2>
          <p className="text-green-50 text-base sm:text-lg max-w-xl mx-auto drop-shadow-sm px-4">
            Bergabunglah bersama kami untuk mewujudkan lingkungan kota yang lebih bersih dan sehat.
          </p>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="p-8 sm:p-12">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-6 border-b border-slate-100 gap-4">
              <h3 className="text-xl font-bold text-slate-800">Formulir Registrasi</h3>
              <div className="text-sm text-slate-500 font-medium bg-slate-50 px-4 py-2.5 rounded-full border border-slate-100 flex items-center gap-2">
                <span>Sudah punya akun?</span>
                <Link to="/login" className="text-green-600 font-bold hover:text-green-700 hover:underline transition-all">Login di sini</Link>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Nama */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all placeholder-slate-400 text-slate-700 shadow-sm"
                    placeholder="Masukkan nama lengkap Anda"
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all placeholder-slate-400 text-slate-700 shadow-sm"
                    placeholder="contoh: nama@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all placeholder-slate-400 text-slate-700 shadow-sm"
                    placeholder="Minimal 6 karakter"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Konfirmasi Password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all placeholder-slate-400 text-slate-700 shadow-sm"
                    placeholder="Ulangi password di atas"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                {/* No HP */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor HP / WhatsApp Aktif <span className="text-red-500">*</span></label>
                  <div className="flex shadow-sm rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-green-500/50 focus-within:border-green-500 transition-all">
                    <span className="flex items-center justify-center bg-slate-100 text-slate-500 px-4 font-medium border-r border-slate-200">
                      +62
                    </span>
                    <input
                      type="tel"
                      className="w-full px-4 py-3.5 bg-slate-50 focus:bg-white outline-none text-slate-700 placeholder-slate-400"
                      placeholder="8123456789"
                      value={form.noHp}
                      onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Daftar Sebagai <span className="text-red-500">*</span></label>
                  <select
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all text-slate-700 appearance-none font-medium cursor-pointer shadow-sm"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="warga">Warga (Pengguna Layanan)</option>
                    <option value="transporter">Transporter (Pihak Pengangkut)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 pb-2">
                <div className="flex items-start gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      id="terms"
                      type="checkbox"
                      required
                      className="w-5 h-5 border border-slate-300 rounded bg-white checked:bg-green-500 checked:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-all cursor-pointer accent-green-500"
                    />
                  </div>
                  <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed cursor-pointer select-none">
                    Saya menyatakan bahwa data yang diisi adalah benar, dan saya menyetujui <a href="#" className="text-green-600 font-semibold hover:underline">Syarat & Ketentuan</a> serta <a href="#" className="text-green-600 font-semibold hover:underline">Kebijakan Privasi</a> yang berlaku di platform EcoWaste.
                  </label>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto min-w-[280px] bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-green-600/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-base"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memproses...
                    </span>
                  ) : "Kirim Form Pendaftaran"}
                </button>
              </div>

            </form>
          </div>
          
          <div className="bg-slate-50 p-6 sm:px-12 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <div className="font-medium">© 2024 EcoWaste. All rights reserved.</div>
            <div className="flex gap-6 font-medium">
              <a href="#" className="hover:text-green-600 transition-colors">Bantuan</a>
              <a href="#" className="hover:text-green-600 transition-colors">Panduan Registrasi</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}