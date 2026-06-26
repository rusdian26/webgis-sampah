import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const AdminLaporanKeuangan = () => {
  const [pembayaran, setPembayaran] = useState([]);
  const [pendapatanCourier, setPendapatanCourier] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch Warga payments (Pemasukan)
    const { data: dataPembayaran } = await supabase
      .from('pembayaran')
      .select('*, sampah(nama_warga, jenis_sampah)')
      .order('tanggal_bayar', { ascending: false });

    // Fetch Courier earnings (Pengeluaran)
    const { data: dataPendapatan } = await supabase
      .from('pendapatan_courier')
      .select('*, users!courier_id(nama), pengangkutan(sampah(jenis_sampah))')
      .order('tanggal_masuk', { ascending: false });

    if (dataPembayaran) setPembayaran(dataPembayaran);
    if (dataPendapatan) setPendapatanCourier(dataPendapatan);
    setLoading(false);
  };

  const totalPemasukan = pembayaran.reduce((sum, item) => item.status === 'Berhasil' || item.status === 'Lunas' ? sum + (item.nominal || 0) : sum, 0);
  const totalPengeluaran = pendapatanCourier.reduce((sum, item) => sum + (item.nominal || 0), 0);
  const saldoAkhir = totalPemasukan - totalPengeluaran;

  if (loading) return <div className="p-8 text-slate-500 font-medium">Memuat Laporan Keuangan...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Laporan Keuangan</h2>
          <p className="text-slate-500 text-sm">Monitoring pemasukan dari warga dan pengeluaran untuk courier.</p>
        </div>
        <button onClick={fetchData} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="text-green-100 text-sm font-semibold mb-2">Total Pemasukan (Warga)</div>
          <div className="text-3xl font-bold">Rp {totalPemasukan.toLocaleString('id-ID')}</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="text-red-100 text-sm font-semibold mb-2">Total Pengeluaran (Courier)</div>
          <div className="text-3xl font-bold">Rp {totalPengeluaran.toLocaleString('id-ID')}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="text-blue-100 text-sm font-semibold mb-2">Saldo Sistem</div>
          <div className="text-3xl font-bold">Rp {saldoAkhir.toLocaleString('id-ID')}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pemasukan Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Riwayat Pemasukan</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-sm">
                  <th className="p-4 font-semibold">Tanggal</th>
                  <th className="p-4 font-semibold">Warga</th>
                  <th className="p-4 font-semibold text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {pembayaran.slice(0, 10).map(item => (
                  <tr key={item.id} className="border-b border-slate-50">
                    <td className="p-4 text-slate-500">{new Date(item.tanggal_bayar).toLocaleDateString('id-ID')}</td>
                    <td className="p-4 font-medium text-slate-800">{item.sampah?.nama_warga || 'Unknown'}</td>
                    <td className="p-4 text-right font-bold text-green-600">+ Rp {item.nominal?.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
                {pembayaran.length === 0 && (
                  <tr><td colSpan="3" className="p-8 text-center text-slate-500">Belum ada data pemasukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pengeluaran Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Riwayat Pengeluaran</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-sm">
                  <th className="p-4 font-semibold">Tanggal</th>
                  <th className="p-4 font-semibold">Courier</th>
                  <th className="p-4 font-semibold text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {pendapatanCourier.slice(0, 10).map(item => (
                  <tr key={item.id} className="border-b border-slate-50">
                    <td className="p-4 text-slate-500">{new Date(item.tanggal_masuk).toLocaleDateString('id-ID')}</td>
                    <td className="p-4 font-medium text-slate-800">{item.users?.nama || 'Unknown'}</td>
                    <td className="p-4 text-right font-bold text-red-600">- Rp {item.nominal?.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
                {pendapatanCourier.length === 0 && (
                  <tr><td colSpan="3" className="p-8 text-center text-slate-500">Belum ada data pengeluaran.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLaporanKeuangan;
