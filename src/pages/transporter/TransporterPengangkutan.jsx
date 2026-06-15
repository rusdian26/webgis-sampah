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
    
    if (!error) {
      // --- LOGIKA RELASI BARU: Sinkronisasi ke tabel pengangkutan ---
      if (status === 'Diproses') {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('pengangkutan').insert({
          sampah_id: id,
          transporter_id: user?.id,
          status: 'Diproses',
          waktu_jemput: new Date().toISOString()
        });
      } else if (status === 'Selesai') {
        await supabase.from('pengangkutan').update({
          status: 'Selesai',
          waktu_selesai: new Date().toISOString()
        }).eq('sampah_id', id);
      }
    }

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
    // --- LOGIKA ALGORITMA BARU ---
    // Transporter hanya boleh menerima/melihat request jika status pembayaran sudah "Lunas" (diverifikasi Admin)
    if (item.status_pengangkutan === 'Menunggu' && item.status_pembayaran !== 'Lunas') return false;
    
    if (filter !== 'all' && item.status_pengangkutan !== filter) return false;
    if (search && !item.nama_warga?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="text-gray-500 font-medium">Memuat daftar tugas...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Daftar Pengangkutan</h2>
          <p className="text-slate-500 text-sm">Ambil request dari warga dan perbarui status operasional Anda.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Cari warga..." 
            className="w-full sm:w-64 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm text-sm outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select 
            className="w-full sm:w-48 py-2.5 px-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm text-sm bg-white outline-none"
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
          <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col relative group">
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${req.status_pengangkutan === 'Selesai' ? 'bg-green-500' : req.status_pengangkutan === 'Diproses' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
            <div className="p-6 ml-2 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${req.status_pengangkutan === 'Selesai' ? 'bg-green-50 text-green-700 border-green-100' : req.status_pengangkutan === 'Diproses' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                  {req.status_pengangkutan}
                </span>
                <span className="text-xs text-slate-400 font-medium">{new Date(req.created_at).toLocaleDateString('id-ID')}</span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-1 truncate">{req.nama_warga}</h3>
              <p className="text-slate-500 text-sm mb-5">Sampah: <strong className="text-slate-700">{req.jenis_sampah} ({req.berat} Kg)</strong></p>
              
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 border border-slate-100 mb-5 flex-1">
                <div className="flex gap-3 mb-3">
                  <span className="text-slate-400 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </span>
                  <span className="leading-relaxed line-clamp-3">{req.alamat}</span>
                </div>
                <div className="flex gap-3 pt-3 border-t border-slate-200/60">
                  <span className="text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </span>
                  <span className="font-semibold text-blue-600">{req.no_hp}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-auto pt-4 border-t border-slate-100">
                {req.status_pengangkutan === 'Menunggu' && (
                  <button 
                    disabled={actionLoading}
                    onClick={() => updateStatus(req.id, 'Diproses')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    🚛 Ambil Request
                  </button>
                )}
                
                {req.status_pengangkutan === 'Diproses' && (
                  <button 
                    disabled={actionLoading}
                    onClick={() => updateStatus(req.id, 'Selesai')}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Selesaikan
                  </button>
                )}

                {req.status_pengangkutan === 'Selesai' && (
                  <div className="flex-1 bg-slate-50 border border-slate-100 text-slate-500 py-3 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> Tugas Selesai
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="col-span-full py-16 text-center bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed">
            <div className="text-5xl mb-4 opacity-50">📋</div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Tugas Kosong</h3>
            <p className="text-slate-500 text-sm">Tidak ada request warga yang cocok dengan pencarian atau status ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransporterPengangkutan;
