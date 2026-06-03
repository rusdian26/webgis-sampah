import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

const AdminVerifikasi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('public:sampah:admin_verifikasi')
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

  const verifikasiPembayaran = async (id, statusBaru) => {
    setActionLoading(true);
    const { error } = await supabase
      .from('sampah')
      .update({ status_pembayaran: statusBaru })
      .eq('id', id);
      
    setActionLoading(false);
    
    if (error) {
      Swal.fire('Error', error.message, 'error');
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: `Status pembayaran diperbarui menjadi ${statusBaru}.`,
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  // Only show requests that have completed transportation, because payment is after that
  // Or filter specifically to 'Proses Bayar' for the main queue
  const antreanVerifikasi = data.filter(d => d.status_pembayaran === 'Proses Bayar');
  const riwayatPembayaran = data.filter(d => d.status_pembayaran === 'Lunas' || d.status_pembayaran === 'Belum');

  if (loading) return <div className="text-gray-500 font-medium">Memuat data pembayaran...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-yellow-500">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Verifikasi Pembayaran</h2>
        <p className="text-slate-500 text-sm">Verifikasi tagihan warga yang telah melakukan "Proses Bayar".</p>
      </div>

      {/* Antrean Menunggu Verifikasi */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-yellow-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <span className="text-yellow-500 text-xl">⏳</span> 
            Antrean Menunggu Verifikasi
          </h3>
          <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1.5 rounded-lg font-bold">{antreanVerifikasi.length} Antrean</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-700 text-sm border-b border-slate-100">
                <th className="p-4 pl-6 font-semibold">Data Warga</th>
                <th className="p-4 font-semibold">Tgl Selesai Angkut</th>
                <th className="p-4 font-semibold">Nominal Tagihan</th>
                <th className="p-4 pr-6 font-semibold text-right">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody>
              {antreanVerifikasi.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-yellow-50/30 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="font-bold text-slate-800">{item.nama_warga}</div>
                    <div className="text-xs text-slate-500">{item.jenis_sampah} ({item.berat} Kg)</div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 font-medium">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="p-4">
                    <div className="font-bold text-blue-600 text-lg">Rp {item.nominal?.toLocaleString('id-ID')}</div>
                  </td>
                  <td className="p-4 pr-6 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => verifikasiPembayaran(item.id, 'Lunas')}
                      disabled={actionLoading}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm transition-colors font-bold shadow-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Terima
                    </button>
                    <button 
                      onClick={() => verifikasiPembayaran(item.id, 'Belum')}
                      disabled={actionLoading}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2.5 rounded-xl text-sm transition-colors font-bold shadow-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> Tolak
                    </button>
                  </td>
                </tr>
              ))}
              {antreanVerifikasi.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-16 text-center text-slate-500">
                    <div className="text-5xl mb-4 opacity-50">🎉</div>
                    <div className="font-medium text-lg">Hore! Tidak ada antrean pembayaran.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Riwayat Pembayaran Lainnya */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-700">Riwayat Status Pembayaran Lainnya</h3>
        </div>
        
        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100 bg-white sticky top-0">
                <th className="p-4 pl-6 font-semibold">Warga</th>
                <th className="p-4 font-semibold">Status Angkut</th>
                <th className="p-4 font-semibold">Status Tagihan</th>
                <th className="p-4 pr-6 font-semibold">Nominal</th>
              </tr>
            </thead>
            <tbody>
              {riwayatPembayaran.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="p-4 pl-6 font-medium text-slate-700">{item.nama_warga}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${item.status_pengangkutan === 'Selesai' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                      {item.status_pengangkutan}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 inline-block rounded-md text-[10px] font-bold uppercase tracking-wider ${item.status_pembayaran === 'Lunas' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                      {item.status_pembayaran}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-slate-600 font-medium">Rp {item.nominal?.toLocaleString('id-ID') || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminVerifikasi;
