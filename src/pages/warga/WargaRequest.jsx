import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const WargaRequest = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRequests();

      const channel = supabase
        .channel('public:sampah:warga_request')
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
      .neq('status_pengangkutan', 'Selesai') // Hanya yang belum selesai
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setRequests(data);
    }
    setLoading(false);
  };

  if (loading) return <div className="text-gray-500">Memuat data request...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Pengangkutan Aktif</h2>
        <p className="text-gray-600">Pantau pergerakan Transporter untuk menjemput sampah Anda di sini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map(req => (
          <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
            <div className={`h-2 w-full ${req.status_pengangkutan === 'Diproses' ? 'bg-blue-500' : 'bg-yellow-400'}`}></div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${req.status_pengangkutan === 'Diproses' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {req.status_pengangkutan}
                </span>
                <span className="text-xs text-gray-400 font-medium">{new Date(req.created_at).toLocaleDateString('id-ID')}</span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-1">{req.jenis_sampah}</h3>
              <p className="text-gray-500 text-sm mb-4">Estimasi Berat: <strong className="text-gray-700">{req.berat} Kg</strong></p>
              
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 border border-gray-100 mb-4">
                <div className="flex gap-2 mb-1">
                  <span className="text-gray-400">📍</span>
                  <span className="line-clamp-2">{req.alamat}</span>
                </div>
                {req.catatan && (
                  <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200">
                    <span className="text-gray-400">📝</span>
                    <span className="italic line-clamp-2">"{req.catatan}"</span>
                  </div>
                )}
              </div>

              {req.status_pengangkutan === 'Menunggu' && (
                <div className="flex items-center gap-2 text-sm text-yellow-600 font-medium bg-yellow-50 p-2 rounded-lg justify-center border border-yellow-100">
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  Menunggu Transporter
                </div>
              )}
              {req.status_pengangkutan === 'Diproses' && (
                <div className="flex items-center gap-2 text-sm text-blue-600 font-medium bg-blue-50 p-2 rounded-lg justify-center border border-blue-100">
                  <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                  Sedang Dijemput!
                </div>
              )}
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-gray-200 border-dashed">
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">Tidak ada request aktif</h3>
            <p className="text-gray-500">Anda belum melakukan request pengangkutan atau semua request sudah selesai.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WargaRequest;
