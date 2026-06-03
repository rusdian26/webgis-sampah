import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const WargaDashboard = ({ user }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();

      const channel = supabase
        .channel('public:sampah:dashboard_warga')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sampah', filter: `user_id=eq.${user.id}` }, () => {
          fetchData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchData = async () => {
    const { data: res, error } = await supabase
      .from('sampah')
      .select('*')
      .eq('user_id', user.id);
      
    if (!error && res) {
      setData(res);
    }
    setLoading(false);
  };

  const totalSampah = data.reduce((acc, curr) => acc + (curr.berat || 0), 0);
  const totalAktif = data.filter(d => d.status_pengangkutan !== 'Selesai').length;
  const totalLunas = data.filter(d => d.status_pembayaran === 'Lunas').length;

  if (loading) return <div className="text-gray-500">Memuat Dashboard...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Selamat Datang, Warga!</h2>
          <p className="text-slate-500 text-sm">Pantau aktivitas pengangkutan dan status pembayaran sampah Anda.</p>
        </div>
        <div className="hidden sm:block">
           <div className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-semibold flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             Terhubung ke Sistem
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500 rounded-l-2xl"></div>
          <div className="flex justify-between items-start ml-2">
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Total Sampah Terangkut</div>
              <div className="text-3xl font-bold text-slate-800">{totalSampah.toFixed(1)} <span className="text-base font-normal text-slate-500">Kg</span></div>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-500 rounded-l-2xl"></div>
          <div className="flex justify-between items-start ml-2">
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Pengangkutan Aktif</div>
              <div className="text-3xl font-bold text-slate-800">{totalAktif} <span className="text-base font-normal text-slate-500">Request</span></div>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-2xl"></div>
          <div className="flex justify-between items-start ml-2">
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Pembayaran Lunas</div>
              <div className="text-3xl font-bold text-slate-800">{totalLunas} <span className="text-base font-normal text-slate-500">Transaksi</span></div>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WargaDashboard;
