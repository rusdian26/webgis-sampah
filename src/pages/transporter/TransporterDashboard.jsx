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

  const totalMenunggu = data.filter(d => d.status_pengangkutan === 'Menunggu' && d.status_pembayaran === 'Lunas').length;
  const totalDiproses = data.filter(d => d.status_pengangkutan === 'Diproses').length;
  const totalSelesai = data.filter(d => d.status_pengangkutan === 'Selesai').length;
  const totalBerat = data.reduce((acc, curr) => acc + (curr.berat || 0), 0);

  if (loading) return <div className="text-gray-500 font-medium">Memuat statistik operasional...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Ringkasan Operasional Logistik</h2>
          <p className="text-slate-500 text-sm">Pantau beban kerja dan target pengangkutan Anda hari ini.</p>
        </div>
        <div className="hidden sm:block">
           <div className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-semibold flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             Terhubung ke Sistem
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500 rounded-l-2xl"></div>
          <div className="flex justify-between items-start ml-2">
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Request Baru Masuk</div>
              <div className="text-3xl font-bold text-slate-800">{totalMenunggu}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-2xl"></div>
          <div className="flex justify-between items-start ml-2">
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Sedang Dijemput</div>
              <div className="text-3xl font-bold text-slate-800">{totalDiproses}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500 rounded-l-2xl"></div>
          <div className="flex justify-between items-start ml-2">
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Pengangkutan Selesai</div>
              <div className="text-3xl font-bold text-slate-800">{totalSelesai}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500 rounded-l-2xl"></div>
          <div className="flex justify-between items-start ml-2">
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Total Berat Diangkut</div>
              <div className="text-3xl font-bold text-slate-800">{totalBerat.toFixed(1)} <span className="text-base font-normal text-slate-500">Kg</span></div>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-900 shadow-sm flex gap-4 items-start">
        <div className="bg-blue-100 text-blue-600 p-2 rounded-xl mt-1">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">Instruksi Operasional</h3>
          <ul className="list-disc list-inside space-y-1.5 text-sm font-medium opacity-90">
            <li>Segera cek menu <strong className="text-blue-800">Daftar Pengangkutan</strong> apabila ada indikator Request Baru.</li>
            <li>Ubah status menjadi <strong className="text-blue-800">"Diproses"</strong> saat Anda mulai menuju ke lokasi warga.</li>
            <li>Gunakan fitur "Buka Navigasi" pada peta untuk diarahkan oleh Google Maps secara presisi.</li>
            <li>Ubah status menjadi <strong className="text-blue-800">"Selesai"</strong> setelah sampah terangkut ke dalam bak truk.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TransporterDashboard;
