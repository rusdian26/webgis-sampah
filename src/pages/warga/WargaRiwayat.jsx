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

  const handlePembayaran = async (id, nominal) => {
    setActionLoading(true);
    const { error } = await supabase.from('sampah').update({ status_pembayaran: 'Proses Bayar' }).eq('id', id);
    
    if (!error) {
      // --- LOGIKA RELASI BARU: Insert data ke tabel pembayaran ---
      await supabase.from('pembayaran').insert({
        sampah_id: id,
        user_id: user.id,
        nominal: nominal || 0,
        metode_pembayaran: 'Transfer Bank / Online',
        status: 'Pending',
        tanggal_bayar: new Date().toISOString()
      });
      // -----------------------------------------------------------
    }
    
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
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Riwayat Keseluruhan</h2>
          <p className="text-slate-500 text-sm">Daftar semua permintaan pengangkutan dan status pembayaran tagihan Anda.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-100 text-sm">
                <th className="p-4 pl-6 font-semibold">Tanggal</th>
                <th className="p-4 font-semibold">Jenis & Berat</th>
                <th className="p-4 font-semibold">Status Pengangkutan</th>
                <th className="p-4 font-semibold">Tagihan & Pembayaran</th>
                <th className="p-4 pr-6 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {requests.map((req) => (
                <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 text-slate-500 font-medium">{new Date(req.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{req.jenis_sampah}</div>
                    <div className="text-slate-500">{req.berat} Kg</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${req.status_pengangkutan === 'Selesai' ? 'bg-green-50 text-green-700 border border-green-100' : req.status_pengangkutan === 'Diproses' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'}`}>
                      {req.status_pengangkutan}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-700 text-base">Rp {req.nominal?.toLocaleString('id-ID') || 0}</div>
                    <span className={`px-2.5 py-1 inline-block mt-2 rounded-md text-[10px] font-bold uppercase tracking-wider ${req.status_pembayaran === 'Lunas' ? 'bg-green-50 text-green-700 border border-green-100' : req.status_pembayaran === 'Proses Bayar' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                      {req.status_pembayaran === 'Proses Bayar' ? 'Menunggu Verifikasi' : req.status_pembayaran}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    {req.status_pembayaran === 'Belum' ? (
                      <button 
                        onClick={() => handlePembayaran(req.id, req.nominal)}
                        disabled={actionLoading}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm transition-colors font-bold shadow-sm inline-flex items-center gap-2 justify-center"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        Bayar Sekarang
                      </button>
                    ) : (
                      <span className="text-slate-400 italic font-medium">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-500 bg-slate-50/50">
                    <div className="text-4xl mb-4 opacity-50">📂</div>
                    <div className="font-medium text-lg">Belum ada riwayat transaksi.</div>
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
