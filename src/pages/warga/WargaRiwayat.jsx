import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

const WargaRiwayat = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRequests();

      const channel = supabase
        .channel('public:sampah:warga_riwayat')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sampah', filter: `user_id=eq.${user.id}` }, () => {
          fetchRequests();
        })
        .subscribe();

      return () => supabase.removeChannel(channel);
    }
  }, [user]);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('sampah')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setRequests(data);
    }
    setLoading(false);
  };

  const handlePembayaran = async (id) => {
    setActionLoading(true);
    const { error } = await supabase.from('sampah').update({ status_pembayaran: 'Proses Bayar' }).eq('id', id);
    setActionLoading(false);
    
    if (!error) {
      Swal.fire({
        icon: 'info',
        title: 'Pembayaran Diproses',
        text: 'Menunggu verifikasi dari Admin.',
        timer: 2000,
        showConfirmButton: false
      });
      fetchRequests();
    } else {
      Swal.fire({ icon: 'error', title: 'Gagal', text: error.message });
    }
  };

  if (loading) return <div className="text-gray-500">Memuat riwayat...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Riwayat Keseluruhan</h2>
        <p className="text-gray-600">Daftar semua permintaan pengangkutan dan status pembayaran tagihan Anda.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-gray-700 border-b-2 border-gray-200 text-sm">
                <th className="p-4 font-semibold rounded-tl-lg">Tanggal</th>
                <th className="p-4 font-semibold">Jenis & Berat</th>
                <th className="p-4 font-semibold">Status Pengangkutan</th>
                <th className="p-4 font-semibold">Tagihan & Pembayaran</th>
                <th className="p-4 font-semibold rounded-tr-lg">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {requests.map((req) => (
                <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="p-4 text-gray-600 font-medium">{new Date(req.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{req.jenis_sampah}</div>
                    <div className="text-gray-500">{req.berat} Kg</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${req.status_pengangkutan === 'Selesai' ? 'bg-green-100 text-green-700' : req.status_pengangkutan === 'Diproses' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {req.status_pengangkutan}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-700 text-base">Rp {req.nominal?.toLocaleString('id-ID') || 0}</div>
                    <span className={`px-2 py-1 inline-block mt-1.5 rounded text-xs font-bold ${req.status_pembayaran === 'Lunas' ? 'bg-green-100 text-green-700' : req.status_pembayaran === 'Proses Bayar' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                      {req.status_pembayaran === 'Proses Bayar' ? 'Menunggu Verifikasi' : req.status_pembayaran}
                    </span>
                  </td>
                  <td className="p-4">
                    {req.status_pembayaran === 'Belum' && req.status_pengangkutan === 'Selesai' ? (
                      <button 
                        onClick={() => handlePembayaran(req.id)}
                        disabled={actionLoading}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition font-bold shadow-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        Bayar Sekarang
                      </button>
                    ) : (
                      <span className="text-gray-400 italic font-medium">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 bg-gray-50 italic">
                    Belum ada riwayat transaksi.
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

export default WargaRiwayat;
