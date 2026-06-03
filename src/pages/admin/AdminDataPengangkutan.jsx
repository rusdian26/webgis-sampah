import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const AdminDataPengangkutan = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('public:sampah:admin_pengangkutan')
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
    if (filterStatus !== 'all' && item.status_pengangkutan !== filterStatus) return false;
    return true;
  });

  if (loading) return <div className="text-gray-500 font-medium">Memuat data pengangkutan...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Status Pengangkutan</h2>
          <p className="text-slate-500 text-sm">Pantau pergerakan Transporter secara real-time.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-xl">
          {['all', 'Menunggu', 'Diproses', 'Selesai'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${filterStatus === status ? 'bg-white shadow-sm text-green-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {status === 'all' ? 'Semua' : status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map(req => (
          <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group relative">
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${req.status_pengangkutan === 'Selesai' ? 'bg-green-500' : req.status_pengangkutan === 'Diproses' ? 'bg-blue-500' : 'bg-yellow-400'}`}></div>
            <div className="p-6 ml-2">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${req.status_pengangkutan === 'Selesai' ? 'bg-green-50 text-green-700 border-green-100' : req.status_pengangkutan === 'Diproses' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                  {req.status_pengangkutan}
                </span>
                <span className="text-xs text-slate-400 font-medium">{new Date(req.created_at).toLocaleDateString('id-ID')}</span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-1 truncate">{req.nama_warga}</h3>
              <p className="text-slate-500 text-sm mb-5">Sampah: <strong className="text-slate-700">{req.jenis_sampah} ({req.berat} Kg)</strong></p>
              
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 border border-slate-100 mb-5 h-24 overflow-y-auto no-scrollbar">
                <div className="flex gap-3">
                  <span className="text-slate-400 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </span>
                  <span className="leading-relaxed">{req.alamat}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Transporter:</span>
                <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">{req.status_pengangkutan === 'Menunggu' ? 'Belum Diambil' : 'Sistem Auto'}</span>
              </div>
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="col-span-full py-16 text-center bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed">
            <div className="text-5xl mb-4 opacity-50">🚛</div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Tidak ada data</h3>
            <p className="text-slate-500 text-sm">Belum ada request pengangkutan untuk status ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDataPengangkutan;
