import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./lib/supabase";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDataWarga from "./pages/admin/AdminDataWarga";
import AdminDataPengangkutan from "./pages/admin/AdminDataPengangkutan";
import AdminVerifikasi from "./pages/admin/AdminVerifikasi";
import AdminMonitoring from "./pages/admin/AdminMonitoring";
import TransporterLayout from "./pages/transporter/TransporterLayout";
import TransporterDashboard from "./pages/transporter/TransporterDashboard";
import TransporterPengangkutan from "./pages/transporter/TransporterPengangkutan";
import TransporterPeta from "./pages/transporter/TransporterPeta";
import TransporterStatus from "./pages/transporter/TransporterStatus";
import WargaLayout from "./pages/warga/WargaLayout";
import WargaDashboard from "./pages/warga/WargaDashboard";
import WargaInput from "./pages/warga/WargaInput";
import WargaRequest from "./pages/warga/WargaRequest";
import WargaRiwayat from "./pages/warga/WargaRiwayat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";

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
      const { data } = await supabase.from("users").select("role").eq("id", user.id).single();
      const userRole = data?.role || "warga"; // fallback
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
      <Route path="/login" element={!session ? <Login /> : <Navigate to={`/${role}`} replace />} />
      <Route path="/register" element={!session ? <Register /> : <Navigate to={`/${role}`} replace />} />
      
      {/* Nested Routes Admin */}
      <Route path="/admin" element={session && role === 'admin' ? <AdminLayout user={session?.user} /> : <Navigate to="/" replace />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard user={session?.user} />} />
        <Route path="data-warga" element={<AdminDataWarga user={session?.user} />} />
        <Route path="data-pengangkutan" element={<AdminDataPengangkutan user={session?.user} />} />
        <Route path="verifikasi" element={<AdminVerifikasi user={session?.user} />} />
        <Route path="monitoring-peta" element={<AdminMonitoring user={session?.user} />} />
      </Route>
      {/* Nested Routes Transporter */}
      <Route path="/transporter" element={session && role === 'transporter' ? <TransporterLayout user={session?.user} /> : <Navigate to="/" replace />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TransporterDashboard user={session?.user} />} />
        <Route path="pengangkutan" element={<TransporterPengangkutan user={session?.user} />} />
        <Route path="peta" element={<TransporterPeta user={session?.user} />} />
        <Route path="status" element={<TransporterStatus user={session?.user} />} />
      </Route>
      <Route path="/warga" element={session && role === 'warga' ? <WargaLayout user={session?.user} /> : <Navigate to="/" replace />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<WargaDashboard user={session?.user} />} />
        <Route path="input-sampah" element={<WargaInput user={session?.user} />} />
        <Route path="request" element={<WargaRequest user={session?.user} />} />
        <Route path="riwayat" element={<WargaRiwayat user={session?.user} />} />
      </Route>
    </Routes>
  );
}

export default App;