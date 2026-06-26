import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
  const [data, setData] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    fetchCouriers();

    const channel = supabase
      .channel('public:sampah:admin_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sampah' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: 'role=eq.courier' }, () => {
        fetchCouriers();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchData = async () => {
    const { data: res } = await supabase.from('sampah').select('*');
    if (res) setData(res);
    setLoading(false);
  };

  const fetchCouriers = async () => {
    const { data: res } = await supabase.from('users').select('*').eq('role', 'courier');
    if (res) setCouriers(res);
  };

  const hapusCourier = async (userId) => {
    const confirm = await Swal.fire({
      title: 'Hapus Courier?',
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
        Swal.fire('Terhapus!', 'Akun courier berhasil dihapus.', 'success');
        fetchCouriers();
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
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Dashboard Overview</h2>
          <p className="text-slate-500 text-sm">Ringkasan aktivitas seluruh sistem pengelolaan sampah.</p>
        </div>
        <div className="hidden sm:block">
           <div className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-semibold flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             Live Data Active
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-2xl"></div>
          <div className="flex justify-between items-start ml-2">
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Total Request</div>
              <div className="text-3xl font-bold text-slate-800">{totalRequest}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500 rounded-l-2xl"></div>
          <div className="flex justify-between items-start ml-2">
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Total Berat Sampah</div>
              <div className="text-3xl font-bold text-slate-800">{totalBerat.toFixed(1)} <span className="text-base font-normal text-slate-500">Kg</span></div>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-500 rounded-l-2xl"></div>
          <div className="flex justify-between items-start ml-2">
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Pembayaran Lunas</div>
              <div className="text-3xl font-bold text-slate-800">{totalLunas}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 rounded-l-2xl"></div>
          <div className="flex justify-between items-start ml-2">
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Pengangkutan Selesai</div>
              <div className="text-3xl font-bold text-slate-800">{totalSelesai}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold text-slate-800">Manajemen Akun Courier</h3>
          <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-full font-bold border border-blue-100">{couriers.length} Aktif</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {couriers.map(t => (
            <div key={t.id} className="p-6 border border-slate-100 rounded-2xl hover:shadow-lg transition-all duration-300 bg-white flex flex-col justify-between group">
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                  </div>
                  <span className="bg-green-50 text-green-600 text-xs font-semibold px-2 py-1 rounded-lg">Verified</span>
                </div>
                <div className="font-bold text-slate-800 text-lg truncate mb-1">{t.nama}</div>
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {t.email}
                </div>
              </div>
              <button 
                onClick={() => hapusCourier(t.id)} 
                className="w-full py-2.5 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 font-semibold rounded-xl text-sm transition-colors border border-slate-200 hover:border-red-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Cabut Akses
              </button>
            </div>
          ))}
          
          {couriers.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              <p>Tidak ada akun Courier. Tambahkan melalui menu Register.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
