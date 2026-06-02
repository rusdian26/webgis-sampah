import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const TransporterDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('public:sampah:transporter_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sampah' }, () => {
        fetchData();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchData = async () => {
    const { data: res } = await supabase.from('sampah').select('*');
    if (res) setData(res);
    setLoading(false);
  };

  const totalMenunggu = data.filter(d => d.status_pengangkutan === 'Menunggu').length;
  const totalDiproses = data.filter(d => d.status_pengangkutan === 'Diproses').length;
  const totalSelesai = data.filter(d => d.status_pengangkutan === 'Selesai').length;
  const totalBerat = data.reduce((acc, curr) => acc + (curr.berat || 0), 0);

  if (loading) return <div className="text-gray-500 font-medium">Memuat statistik operasional...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Ringkasan Operasional Logistik</h2>
        <p className="text-gray-600">Pantau beban kerja dan target pengangkutan Anda hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 border-l-4 border-l-red-500">
          <div className="p-4 bg-red-50 text-red-500 rounded-full">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-500 mb-1">Request Baru Masuk</div>
            <div className="text-3xl font-bold text-gray-800">{totalMenunggu}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="p-4 bg-blue-50 text-blue-500 rounded-full">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-500 mb-1">Sedang Dijemput</div>
            <div className="text-3xl font-bold text-gray-800">{totalDiproses}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 border-l-4 border-l-green-500">
          <div className="p-4 bg-green-50 text-green-500 rounded-full">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-500 mb-1">Pengangkutan Selesai</div>
            <div className="text-3xl font-bold text-gray-800">{totalSelesai}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 border-l-4 border-l-orange-500">
          <div className="p-4 bg-orange-50 text-orange-500 rounded-full">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-500 mb-1">Total Berat Diangkut</div>
            <div className="text-3xl font-bold text-gray-800">{totalBerat.toFixed(1)} <span className="text-base font-normal">Kg</span></div>
          </div>
        </div>
      </div>
      
      <div className="bg-orange-50 p-6 rounded-xl border border-orange-200 text-orange-800">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">⚠️ Instruksi Operasional</h3>
        <ul className="list-disc list-inside space-y-1 text-sm font-medium">
          <li>Segera cek menu <strong>Daftar Pengangkutan</strong> apabila ada indikator Request Baru.</li>
          <li>Ubah status menjadi "Diproses" saat Anda mulai menuju ke lokasi warga.</li>
          <li>Gunakan fitur "Buka Navigasi" pada peta untuk diarahkan oleh Google Maps secara presisi.</li>
          <li>Ubah status menjadi "Selesai" setelah sampah terangkut ke dalam bak truk.</li>
        </ul>
      </div>
    </div>
  );
};

export default TransporterDashboard;
