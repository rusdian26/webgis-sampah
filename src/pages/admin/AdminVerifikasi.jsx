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
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-yellow-500">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifikasi Pembayaran</h2>
        <p className="text-gray-600">Verifikasi tagihan warga yang telah melakukan "Proses Bayar".</p>
      </div>

      {/* Antrean Menunggu Verifikasi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-yellow-50/50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span className="text-yellow-500">⏳</span> 
            Antrean Menunggu Verifikasi
          </h3>
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-1 rounded-full font-bold">{antreanVerifikasi.length} Antrean</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold">Data Warga</th>
                <th className="p-4 font-semibold">Tgl Selesai Angkut</th>
                <th className="p-4 font-semibold">Nominal Tagihan</th>
                <th className="p-4 font-semibold text-right">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody>
              {antreanVerifikasi.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-yellow-50/30 transition">
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{item.nama_warga}</div>
                    <div className="text-xs text-gray-500">{item.jenis_sampah} ({item.berat} Kg)</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="p-4">
                    <div className="font-bold text-blue-700 text-lg">Rp {item.nominal?.toLocaleString('id-ID')}</div>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => verifikasiPembayaran(item.id, 'Lunas')}
                      disabled={actionLoading}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition font-bold shadow-sm flex items-center gap-2"
                    >
                      ✅ Terima (Lunas)
                    </button>
                    <button 
                      onClick={() => verifikasiPembayaran(item.id, 'Belum')}
                      disabled={actionLoading}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm transition font-bold shadow-sm flex items-center gap-2"
                    >
                      ❌ Tolak
                    </button>
                  </td>
                </tr>
              ))}
              {antreanVerifikasi.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-500">
                    <div className="text-4xl mb-3">🎉</div>
                    <div className="font-medium text-lg">Hore! Tidak ada antrean pembayaran.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Riwayat Pembayaran Lainnya */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden opacity-70 hover:opacity-100 transition">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-700">Riwayat Status Pembayaran Lainnya</h3>
        </div>
        
        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-200 bg-white sticky top-0">
                <th className="p-4 font-semibold">Warga</th>
                <th className="p-4 font-semibold">Status Angkut</th>
                <th className="p-4 font-semibold">Status Tagihan</th>
                <th className="p-4 font-semibold">Nominal</th>
              </tr>
            </thead>
            <tbody>
              {riwayatPembayaran.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="p-4 font-medium text-gray-700">{item.nama_warga}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.status_pengangkutan === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {item.status_pengangkutan}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 inline-block rounded text-xs font-bold ${item.status_pembayaran === 'Lunas' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.status_pembayaran}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">Rp {item.nominal?.toLocaleString('id-ID') || 0}</td>
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
