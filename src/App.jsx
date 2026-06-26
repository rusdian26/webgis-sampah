import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./lib/supabase";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDataWarga from "./pages/admin/AdminDataWarga";
import AdminDataPengangkutan from "./pages/admin/AdminDataPengangkutan";
import AdminVerifikasi from "./pages/admin/AdminVerifikasi";
import AdminPersetujuan from "./pages/admin/AdminPersetujuan";
import AdminMonitoring from "./pages/admin/AdminMonitoring";
import AdminLaporanKeuangan from "./pages/admin/AdminLaporanKeuangan";
import CourierLayout from "./pages/courier/CourierLayout";
import CourierDashboard from "./pages/courier/CourierDashboard";
import CourierPengangkutan from "./pages/courier/CourierPengangkutan";
import CourierPeta from "./pages/courier/CourierPeta";
import CourierStatus from "./pages/courier/CourierStatus";
import CourierPendapatan from "./pages/courier/CourierPendapatan";
import WargaLayout from "./pages/warga/WargaLayout";
import WargaDashboard from "./pages/warga/WargaDashboard";
import WargaInput from "./pages/warga/WargaInput";
import WargaRequest from "./pages/warga/WargaRequest";
import WargaRiwayat from "./pages/warga/WargaRiwayat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import Tentang from "./pages/Tentang";
import Statistik from "./pages/Statistik";
import Kontak from "./pages/Kontak";

function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchRole(session.user);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchRole(session.user);
      } else {
        setRole(null);
        setLoading(false);
        if (location.pathname !== '/' && location.pathname !== '/register' && location.pathname !== '/login') {
          navigate('/login');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (user) => {
    try {
      const { data, error } = await supabase.from("users").select("role").eq("id", user.id).single();
      let userRole = "warga"; // default fallback
      
      // Jika terjadi error (seperti tabel di-reset) atau data tidak ada, buat ulang data profilnya
      if (error || !data) {
        const name = user.user_metadata?.nama || user.email?.split('@')[0] || 'Warga';
        // Menyisipkan ulang user ke public.users
        await supabase.from("users").insert([
          { id: user.id, email: user.email, nama: name, role: 'warga' }
        ]);
      } else {
        userRole = data.role;
      }
      
      setRole(userRole);
      setLoading(false);

      // Redirect otomatis
      if (location.pathname === '/login') {
        navigate(`/${userRole}`);
      }
    } catch (e) {
      setRole("warga");
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-xl font-semibold text-gray-700 flex items-center gap-2">
        <svg className="animate-spin h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Menyiapkan Dashboard...
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/tentang" element={<Tentang />} />
      <Route path="/statistik" element={<Statistik />} />
      <Route path="/kontak" element={<Kontak />} />
      <Route path="/login" element={!session ? <Login /> : <Navigate to={`/${role || 'warga'}`} replace />} />
      <Route path="/register" element={!session ? <Register /> : <Navigate to={`/${role || 'warga'}`} replace />} />
      
      {/* Nested Routes Admin */}
      <Route path="/admin" element={session && role === 'admin' ? <AdminLayout user={session?.user} /> : <Navigate to="/" replace />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard user={session?.user} />} />
        <Route path="data-warga" element={<AdminDataWarga user={session?.user} />} />
        <Route path="data-pengangkutan" element={<AdminDataPengangkutan user={session?.user} />} />
        <Route path="persetujuan" element={<AdminPersetujuan user={session?.user} />} />
        <Route path="verifikasi" element={<AdminVerifikasi user={session?.user} />} />
        <Route path="monitoring-peta" element={<AdminMonitoring user={session?.user} />} />
        <Route path="laporan-keuangan" element={<AdminLaporanKeuangan />} />
      </Route>
      {/* Nested Routes Courier */}
      <Route path="/courier" element={session && role === 'courier' ? <CourierLayout user={session?.user} /> : <Navigate to="/" replace />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CourierDashboard user={session?.user} />} />
        <Route path="pengangkutan" element={<CourierPengangkutan user={session?.user} />} />
        <Route path="peta" element={<CourierPeta user={session?.user} />} />
        <Route path="status" element={<CourierStatus user={session?.user} />} />
        <Route path="pendapatan" element={<CourierPendapatan user={session?.user} />} />
      </Route>
      <Route path="/warga" element={session && role === 'warga' ? <WargaLayout user={session?.user} /> : <Navigate to="/" replace />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<WargaDashboard user={session?.user} />} />
        <Route path="input-sampah" element={<WargaInput user={session?.user} />} />
        <Route path="request" element={<WargaRequest user={session?.user} />} />
        <Route path="riwayat" element={<WargaRiwayat user={session?.user} />} />
      </Route>
      
      {/* Fallback route untuk URL yang tidak valid */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;