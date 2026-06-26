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
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Request Pengangkutan Aktif</h2>
          <p className="text-slate-500 text-sm">Pantau pergerakan Courier untuk menjemput sampah Anda di sini.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map(req => (
          <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group relative">
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${req.status_pengangkutan === 'Diproses' ? 'bg-blue-500' : 'bg-yellow-400'}`}></div>
            <div className="p-6 ml-2">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${req.status_pengangkutan === 'Diproses' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'}`}>
                  {req.status_pengangkutan}
                </span>
                <span className="text-xs text-slate-400 font-medium">{new Date(req.created_at).toLocaleDateString('id-ID')}</span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-1">{req.jenis_sampah}</h3>
              <p className="text-slate-500 text-sm mb-5">Estimasi Berat: <strong className="text-slate-700">{req.berat} Kg</strong></p>
              
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 border border-slate-100 mb-5 min-h-[5rem]">
                <div className="flex gap-3 mb-2">
                  <span className="text-slate-400 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </span>
                  <span className="leading-relaxed line-clamp-2">{req.alamat}</span>
                </div>
                {req.catatan && (
                  <div className="flex gap-3 mt-3 pt-3 border-t border-slate-200/60">
                    <span className="text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </span>
                    <span className="italic line-clamp-2 text-slate-500">"{req.catatan}"</span>
                  </div>
                )}
              </div>

              {req.status_pengangkutan === 'Menunggu' && (
                <div className="flex items-center gap-2 text-sm text-yellow-600 font-bold bg-yellow-50 p-3 rounded-xl justify-center border border-yellow-100">
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  Menunggu Courier
                </div>
              )}
              {req.status_pengangkutan === 'Diproses' && (
                <div className="flex items-center gap-2 text-sm text-blue-600 font-bold bg-blue-50 p-3 rounded-xl justify-center border border-blue-100">
                  <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                  Sedang Dijemput!
                </div>
              )}
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="col-span-full py-16 text-center bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed">
            <div className="text-5xl mb-4 opacity-50">🌱</div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Tidak ada request aktif</h3>
            <p className="text-slate-500 text-sm">Anda belum melakukan request pengangkutan atau semua request sudah selesai.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WargaRequest;
