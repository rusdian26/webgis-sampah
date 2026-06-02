import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
  const [data, setData] = useState([]);
  const [transporters, setTransporters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    fetchTransporters();

    const channel = supabase
      .channel('public:sampah:admin_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sampah' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: 'role=eq.transporter' }, () => {
        fetchTransporters();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchData = async () => {
    const { data: res } = await supabase.from('sampah').select('*');
    if (res) setData(res);
    setLoading(false);
  };

  const fetchTransporters = async () => {
    const { data: res } = await supabase.from('users').select('*').eq('role', 'transporter');
    if (res) setTransporters(res);
  };

  const hapusTransporter = async (userId) => {
    const confirm = await Swal.fire({
      title: 'Hapus Transporter?',
      text: "Data akun tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (confirm.isConfirmed) {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (!error) {
        Swal.fire('Terhapus!', 'Akun transporter berhasil dihapus.', 'success');
        fetchTransporters();
      } else {
        Swal.fire('Gagal!', error.message, 'error');
      }
    }
  };

  const totalRequest = data.length;
  const totalBerat = data.reduce((acc, curr) => acc + (curr.berat || 0), 0);
  const totalLunas = data.filter(d => d.status_pembayaran === 'Lunas').length;
  const totalSelesai = data.filter(d => d.status_pengangkutan === 'Selesai').length;

  if (loading) return <div className="text-gray-500 font-medium">Memuat statistik dashboard...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Ringkasan aktivitas seluruh sistem pengelolaan sampah.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center border-b-4 border-b-blue-500 relative overflow-hidden">
          <div className="text-sm font-semibold text-gray-500 mb-1 z-10">Total Request</div>
          <div className="text-3xl font-bold text-gray-800 z-10">{totalRequest}</div>
          <div className="absolute -right-4 -bottom-4 opacity-10 text-blue-500 text-8xl">📊</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center border-b-4 border-b-green-500 relative overflow-hidden">
          <div className="text-sm font-semibold text-gray-500 mb-1 z-10">Total Berat Sampah</div>
          <div className="text-3xl font-bold text-gray-800 z-10">{totalBerat.toFixed(1)} <span className="text-base font-normal">Kg</span></div>
          <div className="absolute -right-4 -bottom-4 opacity-10 text-green-500 text-8xl">⚖️</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center border-b-4 border-b-yellow-500 relative overflow-hidden">
          <div className="text-sm font-semibold text-gray-500 mb-1 z-10">Total Pembayaran Lunas</div>
          <div className="text-3xl font-bold text-gray-800 z-10">{totalLunas}</div>
          <div className="absolute -right-4 -bottom-4 opacity-10 text-yellow-500 text-8xl">💰</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center border-b-4 border-b-indigo-500 relative overflow-hidden">
          <div className="text-sm font-semibold text-gray-500 mb-1 z-10">Pengangkutan Selesai</div>
          <div className="text-3xl font-bold text-gray-800 z-10">{totalSelesai}</div>
          <div className="absolute -right-4 -bottom-4 opacity-10 text-indigo-500 text-8xl">✅</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-lg font-bold text-gray-800">Manajemen Akun Transporter</h3>
          <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-bold">{transporters.length} Aktif</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {transporters.map(t => (
            <div key={t.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition bg-gray-50 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-gray-800 text-lg truncate pr-2">{t.nama}</div>
                  <span className="text-green-500 text-xl">🚚</span>
                </div>
                <div className="text-sm text-gray-500 mb-4">{t.email}</div>
              </div>
              <button 
                onClick={() => hapusTransporter(t.id)} 
                className="w-full py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold rounded-lg text-sm transition"
              >
                Cabut Akses
              </button>
            </div>
          ))}
          
          {transporters.length === 0 && (
            <div className="col-span-full py-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              Tidak ada akun Transporter. Tambahkan melalui menu Register.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
