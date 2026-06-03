import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

const AdminDataWarga = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('public:sampah:admin_warga')
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

  const hapusData = async (id) => {
    const confirm = await Swal.fire({
      title: 'Hapus Data Warga?',
      text: "Seluruh riwayat pengangkutan dan pembayaran request ini akan terhapus!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (confirm.isConfirmed) {
      const { error } = await supabase.from('sampah').delete().eq('id', id);
      if (!error) {
        Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
      } else {
        Swal.fire('Gagal!', error.message, 'error');
      }
    }
  };

  const filteredData = data.filter(item => {
    if (filter !== 'all' && item.jenis_sampah !== filter) return false;
    if (search && !item.nama_warga?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="text-gray-500 font-medium">Memuat data...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Direktori Data Warga</h2>
          <p className="text-slate-500 text-sm">Kelola dan pantau seluruh data request sampah warga.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input 
              type="text" 
              placeholder="Cari nama warga..." 
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-sm text-sm outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="w-full sm:w-48 py-2.5 px-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-sm text-sm bg-white outline-none"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">Semua Jenis Sampah</option>
            <option value="Organik">Organik</option>
            <option value="Anorganik">Anorganik</option>
            <option value="B3">B3 (Berbahaya)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-100">
                <th className="p-4 pl-6 font-semibold text-sm">Tgl Input</th>
                <th className="p-4 font-semibold">Data Warga</th>
                <th className="p-4 font-semibold">Sampah & Berat</th>
                <th className="p-4 font-semibold">Status Sistem</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredData.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                  <td className="p-4 pl-6 text-slate-500 font-medium">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{item.nama_warga}</div>
                    <div className="text-xs text-green-600 font-medium mb-1">{item.no_hp}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[250px]" title={item.alamat}>{item.alamat}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-700">{item.jenis_sampah}</div>
                    <div className="text-sm text-gray-500">{item.berat} Kg</div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2 items-start">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${item.status_pengangkutan === 'Selesai' ? 'bg-green-100 text-green-700 border border-green-200' : item.status_pengangkutan === 'Diproses' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
                        🚛 {item.status_pengangkutan}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${item.status_pembayaran === 'Lunas' ? 'bg-green-100 text-green-700 border border-green-200' : item.status_pembayaran === 'Proses Bayar' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        💰 {item.status_pembayaran === 'Proses Bayar' ? 'VERIFIKASI' : item.status_pembayaran}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <button 
                      onClick={() => hapusData(item.id)}
                      className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-100 px-3 py-2 rounded-xl text-sm transition font-semibold shadow-sm"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-slate-500 bg-slate-50/50">
                    <div className="text-4xl mb-4 opacity-50">🔍</div>
                    <div className="font-medium">Tidak ada data warga ditemukan.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 text-center font-medium">
          Menampilkan {filteredData.length} data warga.
        </div>
      </div>
    </div>
  );
};

export default AdminDataWarga;
