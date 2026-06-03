import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const TransporterStatus = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('public:sampah:transporter_status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sampah' }, () => {
        fetchData();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchData = async () => {
    const { data: res } = await supabase
      .from('sampah')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (res) setData(res);
    setLoading(false);
  };

  const filteredData = data.filter(item => {
    if (filter !== 'all' && item.status_pengangkutan !== filter) return false;
    return true;
  });

  if (loading) return <div className="text-gray-500 font-medium">Memuat riwayat status...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Riwayat & Status Pengangkutan</h2>
          <p className="text-slate-500 text-sm">Log aktivitas dan rekaman perjalanan logistik Anda.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-xl">
          {['all', 'Menunggu', 'Diproses', 'Selesai'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${filter === status ? 'bg-white shadow-sm text-green-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {status === 'all' ? 'Semua' : status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-100 text-sm">
                <th className="p-4 pl-6 font-semibold">Tgl Masuk</th>
                <th className="p-4 font-semibold">Data Warga</th>
                <th className="p-4 font-semibold">Informasi Sampah</th>
                <th className="p-4 pr-6 font-semibold">Timeline Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredData.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 text-slate-500 font-medium">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{item.nama_warga}</div>
                    <div className="text-xs text-blue-600 font-medium mb-1">{item.no_hp}</div>
                    <div className="text-xs text-slate-500 truncate max-w-[200px]" title={item.alamat}>{item.alamat}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-700">{item.jenis_sampah}</div>
                    <div className="text-sm text-slate-500">{item.berat} Kg</div>
                  </td>
                  <td className="p-4 pr-6">
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${item.status_pengangkutan !== 'Menunggu' ? 'bg-red-500 text-white shadow-sm' : 'bg-red-50 text-red-500 border border-red-100'}`}>1</div>
                      <div className={`w-8 h-1 rounded-full ${item.status_pengangkutan === 'Diproses' || item.status_pengangkutan === 'Selesai' ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${item.status_pengangkutan === 'Diproses' || item.status_pengangkutan === 'Selesai' ? 'bg-blue-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>2</div>
                      <div className={`w-8 h-1 rounded-full ${item.status_pengangkutan === 'Selesai' ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${item.status_pengangkutan === 'Selesai' ? 'bg-green-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>3</div>
                    </div>
                    <div className="mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Status Saat Ini: <span className={`ml-1 ${item.status_pengangkutan === 'Selesai' ? 'text-green-600' : item.status_pengangkutan === 'Diproses' ? 'text-blue-600' : 'text-red-600'}`}>{item.status_pengangkutan}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-16 text-center text-slate-500 bg-slate-50/50">
                    <div className="text-5xl mb-4 opacity-50">🕒</div>
                    <div className="font-medium text-lg">Tidak ada riwayat pengangkutan.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransporterStatus;
