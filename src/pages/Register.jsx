import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";

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
      return alert("Password dan Konfirmasi Password tidak cocok!");
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setLoading(false);
      return alert(error.message);
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
          },
        ]);

      if (pError) {
        setLoading(false);
        return alert("Gagal simpan profil: " + pError.message);
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
          // Not blocking register if this fails, just logging
        }
      }

      setLoading(false);
      alert("Berhasil! Silakan login.");
      navigate("/login");
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-color)' }}>
      <div style={{ maxWidth: '800px', width: '100%', margin: 'auto', padding: '40px 20px', backgroundColor: 'var(--surface-color)', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>Daftar Akun</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Sudah punya akun? <Link to="/login" style={{ color: 'var(--success)', fontWeight: '600' }}>Login di sini</Link>
          </p>
        </div>

        <form onSubmit={handleRegister}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nama</label>
              <input
                className="input-field"
                placeholder="isi Nama"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="isi Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="isi Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Konfirmasi password</label>
              <input
                type="password"
                className="input-field"
                placeholder="isi Password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">No. HP Aktif</label>
              <div style={{ display: 'flex' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRight: 'none', borderRadius: 'var(--radius-md) 0 0 var(--radius-md)' }}>
                  🇮🇩 +62
                </div>
                <input
                  className="input-field"
                  style={{ borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}
                  value={form.noHp}
                  onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Role Pengguna</label>
              <select
                className="input-field"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="warga">Warga</option>
                <option value="transporter">Transporter</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <input type="checkbox" id="terms" required style={{ marginTop: '4px' }} />
            <label htmlFor="terms" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Dengan mendaftar Anda telah menyetujui <span style={{ color: 'var(--success)' }}>Syarat Ketentuan</span> & <span style={{ color: 'var(--success)' }}>Kebijakan Privasi</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
             {/* Mock Recaptcha */}
            <div style={{ border: '1px solid #d3d3d3', background: '#f9f9f9', padding: '12px 24px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
               <input type="checkbox" style={{ transform: 'scale(1.5)' }} />
               <span style={{ fontSize: '14px' }}>I'm not a robot</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '16px',
                background: 'var(--success)',
                color: '#fff',
                border: 'none',
                borderRadius: '50px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? "Mendaftar..." : "Daftar Sekarang"}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>Atau Daftar dengan</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px', margin: '0 auto' }}>
            <button className="btn btn-outline" style={{ borderRadius: '50px', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#4285F4', fontWeight: 'bold' }}>G</span> Lanjutkan dengan Google
            </button>
            <button className="btn btn-outline" style={{ borderRadius: '50px', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '18px' }}></span> Sign in with Apple
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}