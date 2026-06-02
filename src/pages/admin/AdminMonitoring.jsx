import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Map from '../../components/Map';

const AdminMonitoring = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('public:sampah:admin_monitoring')
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

  const mapMarkers = data
    .filter(item => item.latitude && item.longitude)
    .map(item => {
      let color = '#ef4444'; // merah: menunggu
      let statusIcon = '🔴';
      
      if (item.status_pengangkutan === 'Diproses') {
        color = '#3b82f6'; // biru: diproses
        statusIcon = '🔵';
      } else if (item.status_pengangkutan === 'Selesai') {
        color = '#22c55e'; // hijau: selesai
        statusIcon = '🟢';
      }

      return {
        position: [item.latitude, item.longitude],
        color: color,
        popupContent: (
          <div className="text-sm font-sans min-w-[200px]">
            <div className="font-bold text-gray-800 text-base mb-1 border-b pb-1">{statusIcon} {item.nama_warga}</div>
            <div className="text-gray-600 mb-2">{item.alamat}</div>
            <div className="bg-gray-50 p-2 rounded border border-gray-100 mb-2 text-xs">
              <strong>Sampah:</strong> {item.jenis_sampah} ({item.berat} Kg)<br/>
              <strong>Kontak:</strong> {item.no_hp}
            </div>
            <div className="flex justify-between items-center text-xs">
              <span>Angkut: <strong style={{ color }} className="uppercase">{item.status_pengangkutan}</strong></span>
              <span>Bayar: <strong className={item.status_pembayaran === 'Lunas' ? 'text-green-600' : 'text-red-600'}>{item.status_pembayaran}</strong></span>
            </div>
          </div>
        )
      };
    });

  if (loading) return <div className="text-gray-500 font-medium">Memuat peta...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Live Monitoring Peta Wilayah</h2>
          <p className="text-gray-600 text-sm">Pantau sebaran titik penjemputan sampah warga secara real-time.</p>
        </div>
        
        <div className="flex gap-4 text-xs font-bold text-gray-600">
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 block"></span> Menunggu</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 block"></span> Diproses</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 block"></span> Selesai</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
        <Map markers={mapMarkers} height="calc(100vh - 180px)" />
        
        {/* Overlay Info Card inside Map */}
        <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 pointer-events-none w-48">
          <div className="font-bold text-gray-800 mb-2 border-b pb-1">Total Titik Map</div>
          <div className="text-3xl font-black text-blue-600">{mapMarkers.length}</div>
          <div className="text-xs text-gray-500 mt-1">Koordinat tersimpan</div>
        </div>
      </div>
    </div>
  );
};

export default AdminMonitoring;
