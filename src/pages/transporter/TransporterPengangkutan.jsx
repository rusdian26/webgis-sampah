import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

const TransporterPengangkutan = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('public:sampah:transporter_pengangkutan')
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

  const updateStatus = async (id, status) => {
    setActionLoading(true);
    const { error } = await supabase.from('sampah').update({ status_pengangkutan: status }).eq('id', id);
    setActionLoading(false);
    
    if (error) {
      Swal.fire('Gagal', error.message, 'error');
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Status Diperbarui',
        text: `Status berhasil diubah menjadi ${status}`,
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const filteredData = data.filter(item => {
    if (filter !== 'all' && item.status_pengangkutan !== filter) return false;
    if (search && !item.nama_warga?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="text-gray-500 font-medium">Memuat daftar tugas...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Daftar Pengangkutan</h2>
          <p className="text-gray-600 text-sm">Ambil request dari warga dan perbarui status operasional Anda.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Cari warga..." 
            className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition shadow-sm text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select 
            className="w-full sm:w-48 py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition shadow-sm text-sm bg-white"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map(req => (
          <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col">
            <div className={`h-1.5 w-full ${req.status_pengangkutan === 'Selesai' ? 'bg-green-500' : req.status_pengangkutan === 'Diproses' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${req.status_pengangkutan === 'Selesai' ? 'bg-green-50 text-green-700 border-green-200' : req.status_pengangkutan === 'Diproses' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {req.status_pengangkutan}
                </span>
                <span className="text-xs text-gray-400 font-medium">{new Date(req.created_at).toLocaleDateString('id-ID')}</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-1">{req.nama_warga}</h3>
              <p className="text-gray-500 text-sm mb-4">Sampah: <strong className="text-gray-700">{req.jenis_sampah} ({req.berat} Kg)</strong></p>
              
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 border border-gray-100 mb-4 flex-1">
                <div className="flex gap-2 mb-2">
                  <span className="text-gray-400">📍</span>
                  <span className="line-clamp-3">{req.alamat}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-400">📞</span>
                  <span className="font-semibold text-blue-600">{req.no_hp}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                {req.status_pengangkutan === 'Menunggu' && (
                  <button 
                    disabled={actionLoading}
                    onClick={() => updateStatus(req.id, 'Diproses')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold text-sm shadow-sm transition flex items-center justify-center gap-2"
                  >
                    🚛 Ambil Request
                  </button>
                )}
                
                {req.status_pengangkutan === 'Diproses' && (
                  <button 
                    disabled={actionLoading}
                    onClick={() => updateStatus(req.id, 'Selesai')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-bold text-sm shadow-sm transition flex items-center justify-center gap-2"
                  >
                    ✅ Selesaikan
                  </button>
                )}

                {req.status_pengangkutan === 'Selesai' && (
                  <div className="flex-1 bg-gray-100 text-gray-500 py-2.5 rounded-lg font-bold text-sm text-center flex items-center justify-center gap-2">
                    🔒 Tugas Selesai
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-gray-200 border-dashed">
            <div className="text-5xl mb-4 opacity-50">📋</div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">Tugas Kosong</h3>
            <p className="text-gray-500">Tidak ada request warga yang cocok dengan pencarian atau status ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransporterPengangkutan;
