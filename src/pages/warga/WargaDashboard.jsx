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
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Selamat Datang, Warga!</h2>
        <p className="text-gray-600">Ini adalah halaman ringkasan pengelolaan sampah Anda. Pantau aktivitas request pengangkutan dan status pembayaran Anda di sini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 border-l-4 border-l-green-500">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-500">Total Sampah Terangkut</div>
            <div className="text-2xl font-bold text-gray-800">{totalSampah.toFixed(1)} <span className="text-base font-normal">Kg</span></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 border-l-4 border-l-yellow-500">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-500">Pengangkutan Aktif</div>
            <div className="text-2xl font-bold text-gray-800">{totalAktif} <span className="text-base font-normal">Request</span></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-500">Pembayaran Lunas</div>
            <div className="text-2xl font-bold text-gray-800">{totalLunas} <span className="text-base font-normal">Transaksi</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WargaDashboard;
