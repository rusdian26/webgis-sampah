import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Map from '../components/Map';
import Layout from '../components/Layout';

export default function Admin() {
  const [data, setData] = useState([]);
  const [transporters, setTransporters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
    fetchTransporters();

    const channel = supabase
      .channel('public:sampah:admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sampah' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    const { data: res, error } = await supabase
      .from('sampah')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && res) {
      setData(res);
    }
  };

  const fetchTransporters = async () => {
    const { data, error } = await supabase.from('users').select('*').eq('role', 'transporter');
    if (data) setTransporters(data);
  };

  const verifikasiPembayaran = async (id) => {
    setLoading(true);
    const { error } = await supabase
      .from('sampah')
      .update({ status_pembayaran: 'Lunas' })
      .eq('id', id);
      
    if (error) alert("Gagal verifikasi pembayaran: " + error.message);
    setLoading(false);
  };

  const hapusData = async (id) => {
    if (!window.confirm('Yakin ingin menghapus seluruh data request ini?')) return;
    setLoading(true);
    const { error } = await supabase.from('sampah').delete().eq('id', id);
    if (error) alert("Gagal hapus data: " + error.message);
    setLoading(false);
  };

  const hapusTransporter = async (userId) => {
    if (!window.confirm('Yakin ingin menghapus akun transporter ini?')) return;
    setLoading(true);
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (!error) fetchTransporters();
    setLoading(false);
  };

  const filteredData = data.filter(item => {
    if (filter !== 'all' && item.status_pengangkutan?.toLowerCase() !== filter.toLowerCase()) return false;
    if (search && !item.nama_warga?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const mapMarkers = filteredData
    .filter(item => item.latitude && item.longitude)
    .map(item => {
      let color = '#ef4444'; // merah: menunggu
      if (item.status_pengangkutan === 'Diproses') color = '#eab308'; // kuning: diproses
      if (item.status_pengangkutan === 'Selesai') color = '#22c55e'; // hijau: selesai

      return {
        position: [item.latitude, item.longitude],
        color: color,
        popupContent: (
          <div className="text-sm">
            <strong className="text-gray-800">{item.nama_warga}</strong><br/>
            {item.alamat}<br/>
            <span className="text-xs text-gray-500">{item.jenis_sampah} ({item.berat} Kg)</span><br/>
            Status: <span className="font-semibold uppercase" style={{ color }}>{item.status_pengangkutan}</span><br/>
            Bayar: <span className={item.status_pembayaran === 'Lunas' ? 'text-green-600' : 'text-red-600'}>{item.status_pembayaran}</span>
          </div>
        )
      };
    });

  const totalSampah = data.length;
  const totalBerat = data.reduce((acc, curr) => acc + (curr.berat || 0), 0);
  const totalLunas = data.filter(d => d.status_pembayaran === 'Lunas').length;

  return (
    <Layout role="admin">
      <div className="space-y-6">
        
        {/* Card Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
            <div className="text-gray-500 text-sm mb-1 font-medium">Total Request</div>
            <div className="text-3xl font-bold text-gray-800">{totalSampah}</div>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-green-500">
            <div className="text-gray-500 text-sm mb-1 font-medium">Total Berat Sampah</div>
            <div className="text-3xl font-bold text-gray-800">{totalBerat.toFixed(2)} <span className="text-base font-normal text-gray-500">Kg</span></div>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-yellow-500">
            <div className="text-gray-500 text-sm mb-1 font-medium">Total Pembayaran Lunas</div>
            <div className="text-3xl font-bold text-gray-800">{totalLunas} <span className="text-base font-normal text-gray-500">Request</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Manajemen Transporter */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Data Transporter</h2>
            </div>
            <div className="space-y-3">
              {transporters.map(t => (
                <div key={t.id} className="p-3 border border-gray-100 rounded bg-gray-50 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-sm">{t.nama}</div>
                    <div className="text-xs text-gray-500">{t.email}</div>
                  </div>
                  <button onClick={() => hapusTransporter(t.id)} className="text-red-500 hover:bg-red-100 p-1.5 rounded text-xs transition">Hapus</button>
                </div>
              ))}
              {transporters.length === 0 && <p className="text-sm text-gray-500">Belum ada transporter.</p>}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
              *Tambahkan akun transporter baru melalui halaman Register dengan memilih Role "Transporter".
            </div>
          </div>

          {/* Map Leaflet */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2 flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Peta Monitoring Seluruh Wilayah</h2>
            <div className="flex-1 min-h-[300px] h-full">
              <Map markers={mapMarkers} />
            </div>
          </div>
        </div>

        {/* Tabel Data Lengkap */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Manajemen Data Request & Pembayaran</h2>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Cari warga..." 
                className="border border-gray-300 p-2 rounded focus:ring-green-500 focus:border-green-500 text-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select 
                className="border border-gray-300 p-2 rounded focus:ring-green-500 focus:border-green-500 text-sm"
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
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-100 text-gray-700 border-b-2 border-gray-200">
                  <th className="p-3 border-b">Tanggal</th>
                  <th className="p-3 border-b">Data Warga</th>
                  <th className="p-3 border-b">Detail Sampah</th>
                  <th className="p-3 border-b">Status Angkut</th>
                  <th className="p-3 border-b">Tagihan & Pembayaran</th>
                  <th className="p-3 border-b">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm text-gray-600">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="p-3">
                      <div className="font-semibold text-gray-800">{item.nama_warga}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">{item.alamat}</div>
                      <div className="text-xs text-blue-500">{item.no_hp}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-700">{item.jenis_sampah}</div>
                      <div className="text-sm font-bold">{item.berat} Kg</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${item.status_pengangkutan === 'Selesai' ? 'bg-green-100 text-green-800' : item.status_pengangkutan === 'Diproses' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {item.status_pengangkutan}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-gray-700">Rp {item.nominal?.toLocaleString('id-ID') || 0}</div>
                      <span className={`px-2 py-1 inline-block mt-1 rounded text-xs font-semibold ${item.status_pembayaran === 'Lunas' ? 'bg-green-100 text-green-800' : item.status_pembayaran === 'Proses Bayar' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                        {item.status_pembayaran}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      {item.status_pembayaran === 'Proses Bayar' && (
                        <button 
                          onClick={() => verifikasiPembayaran(item.id)}
                          disabled={loading}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm transition font-medium shadow-sm"
                        >
                          Verifikasi
                        </button>
                      )}
                      <button 
                        onClick={() => hapusData(item.id)}
                        disabled={loading}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm transition font-medium shadow-sm"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-gray-500 bg-gray-50">Tidak ada data ditemukan</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}