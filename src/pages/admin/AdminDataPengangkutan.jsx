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
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-l-indigo-500">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Status Pengangkutan</h2>
          <p className="text-gray-600 text-sm">Pantau pergerakan Transporter secara real-time.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['all', 'Menunggu', 'Diproses', 'Selesai'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition ${filterStatus === status ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {status === 'all' ? 'Semua' : status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map(req => (
          <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
            <div className={`h-1.5 w-full ${req.status_pengangkutan === 'Selesai' ? 'bg-green-500' : req.status_pengangkutan === 'Diproses' ? 'bg-blue-500' : 'bg-yellow-400'}`}></div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${req.status_pengangkutan === 'Selesai' ? 'bg-green-50 text-green-700 border-green-200' : req.status_pengangkutan === 'Diproses' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                  {req.status_pengangkutan}
                </span>
                <span className="text-xs text-gray-400 font-medium">{new Date(req.created_at).toLocaleDateString('id-ID')}</span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-1">{req.nama_warga}</h3>
              <p className="text-gray-500 text-sm mb-4">Sampah: <strong className="text-gray-700">{req.jenis_sampah} ({req.berat} Kg)</strong></p>
              
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 border border-gray-100 mb-4 h-24 overflow-y-auto">
                <div className="flex gap-2">
                  <span className="text-gray-400">📍</span>
                  <span>{req.alamat}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">Transporter:</span>
                <span className="text-sm font-semibold text-gray-700">{req.status_pengangkutan === 'Menunggu' ? 'Belum Diambil' : 'Sistem Auto'}</span>
              </div>
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-gray-200 border-dashed">
            <div className="text-4xl mb-4">🚛</div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">Tidak ada data</h3>
            <p className="text-gray-500">Belum ada request pengangkutan untuk status ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDataPengangkutan;
