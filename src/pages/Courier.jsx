import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Map from '../components/Map';
import Layout from '../components/Layout';

export default function Courier({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel('public:sampah:courier')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sampah' }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('sampah')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setRequests(data);
    }
  };

  const updateStatus = async (id, newStatus) => {
    setLoading(true);
    const { error } = await supabase
      .from('sampah')
      .update({ status_pengangkutan: newStatus })
      .eq('id', id);
      
    if (error) alert("Gagal update status: " + error.message);
    setLoading(false);
  };

  const filteredRequests = requests.filter(req => {
    if (filter !== 'all' && req.status_pengangkutan?.toLowerCase() !== filter.toLowerCase()) return false;
    if (search && !req.nama_warga?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const mapMarkers = filteredRequests
    .filter(req => req.latitude && req.longitude)
    .map(req => {
      let color = '#ef4444'; // merah: menunggu
      if (req.status_pengangkutan === 'Diproses') color = '#eab308'; // kuning: diproses
      if (req.status_pengangkutan === 'Selesai') color = '#22c55e'; // hijau: selesai
      
      return {
        position: [req.latitude, req.longitude],
        color: color,
        popupContent: (
          <div className="text-sm">
            <strong className="text-gray-800">{req.nama_warga}</strong><br/>
            {req.alamat}<br/>
            <a href={`tel:${req.no_hp}`} className="text-blue-500 underline">{req.no_hp}</a><br/><br/>
            {req.jenis_sampah} ({req.berat} Kg)<br/>
            Status: <span className="font-semibold uppercase" style={{ color }}>{req.status_pengangkutan}</span>
          </div>
        )
      };
    });

  return (
    <Layout role="courier">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Peta Lokasi Warga (Live)</h2>
          <div className="h-[400px]">
            <Map markers={mapMarkers} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Daftar Request Pengangkutan</h2>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Cari nama warga..." 
                className="border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select 
                className="border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 border-b-2 border-gray-200">
                  <th className="p-3 border-b">Data Warga</th>
                  <th className="p-3 border-b">Detail Sampah</th>
                  <th className="p-3 border-b">Status</th>
                  <th className="p-3 border-b">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-semibold text-gray-800">{req.nama_warga}</div>
                      <div className="text-xs text-gray-500 max-w-[200px] truncate">{req.alamat}</div>
                      <div className="text-xs text-blue-500">{req.no_hp}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-700">{req.jenis_sampah} <span className="font-bold">({req.berat} Kg)</span></div>
                      <div className="text-xs text-gray-500 italic">"{req.catatan || '-'}"</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${req.status_pengangkutan === 'Selesai' ? 'bg-green-100 text-green-800' : req.status_pengangkutan === 'Diproses' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {req.status_pengangkutan}
                      </span>
                    </td>
                    <td className="p-3">
                      {req.status_pengangkutan === 'Menunggu' && (
                        <button 
                          onClick={() => updateStatus(req.id, 'Diproses')}
                          disabled={loading}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm transition font-medium shadow-sm"
                        >
                          Ambil Sampah
                        </button>
                      )}
                      {req.status_pengangkutan === 'Diproses' && (
                        <button 
                          onClick={() => updateStatus(req.id, 'Selesai')}
                          disabled={loading}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm transition font-medium shadow-sm"
                        >
                          Selesaikan Pengangkutan
                        </button>
                      )}
                      {req.status_pengangkutan === 'Selesai' && (
                        <span className="text-gray-400 italic text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-gray-500 bg-gray-50">Tidak ada data ditemukan</td>
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