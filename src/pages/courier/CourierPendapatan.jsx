import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const CourierPendapatan = ({ user }) => {
  const [pendapatan, setPendapatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPendapatan, setTotalPendapatan] = useState(0);

  useEffect(() => {
    if (user) {
      fetchPendapatan();
    }
  }, [user]);

  const fetchPendapatan = async () => {
    const { data, error } = await supabase
      .from('pendapatan_courier')
      .select('*, pengangkutan(sampah(nama_warga, jenis_sampah))')
      .eq('courier_id', user.id)
      .order('tanggal_masuk', { ascending: false });

    if (!error && data) {
      setPendapatan(data);
      const total = data.reduce((sum, item) => sum + (item.nominal || 0), 0);
      setTotalPendapatan(total);
    }
    setLoading(false);
  };

  if (loading) return <div className="text-gray-500 font-medium p-8">Memuat data pendapatan...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Pendapatan Courier</h2>
          <p className="text-slate-500 text-sm">Lihat rincian transaksi keuangan dari hasil pengangkutan sampah.</p>
        </div>
        <div className="bg-green-50 border border-green-100 px-6 py-4 rounded-xl text-right">
          <div className="text-sm text-green-600 font-semibold mb-1">Total Pendapatan</div>
          <div className="text-2xl font-bold text-green-700">Rp {totalPendapatan.toLocaleString('id-ID')}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-100 text-sm">
                <th className="p-4 pl-6 font-semibold">Tanggal</th>
                <th className="p-4 font-semibold">Tugas (Warga - Sampah)</th>
                <th className="p-4 font-semibold">Status Pencairan</th>
                <th className="p-4 pr-6 font-semibold text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {pendapatan.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 text-slate-500 font-medium">
                    {new Date(item.tanggal_masuk).toLocaleDateString('id-ID')}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{item.pengangkutan?.sampah?.nama_warga || 'N/A'}</div>
                    <div className="text-slate-500">{item.pengangkutan?.sampah?.jenis_sampah || 'N/A'}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${item.status_pencairan === 'Dicairkan' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'}`}>
                      {item.status_pencairan}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right font-bold text-slate-700">
                    Rp {item.nominal?.toLocaleString('id-ID') || 0}
                  </td>
                </tr>
              ))}
              {pendapatan.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-slate-500 bg-slate-50/50">
                    <div className="text-4xl mb-4 opacity-50">💸</div>
                    <div className="font-medium text-lg">Belum ada catatan pendapatan.</div>
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

export default CourierPendapatan;
