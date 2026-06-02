import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Map from '../../components/Map';

const TransporterPeta = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('public:sampah:transporter_peta')
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
      .neq('status_pengangkutan', 'Selesai') // Focus on active tasks
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
      }

      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;

      return {
        position: [item.latitude, item.longitude],
        color: color,
        popupContent: (
          <div className="text-sm font-sans min-w-[200px]">
            <div className="font-bold text-gray-800 text-base mb-1 border-b pb-1">{statusIcon} {item.nama_warga}</div>
            <div className="text-gray-600 mb-2">{item.alamat}</div>
            <div className="bg-gray-50 p-2 rounded border border-gray-100 mb-3 text-xs">
              <strong>Sampah:</strong> {item.jenis_sampah} ({item.berat} Kg)<br/>
              <strong>Kontak:</strong> {item.no_hp}
            </div>
            <a 
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold transition shadow-sm"
            >
              🗺️ Buka Navigasi
            </a>
          </div>
        )
      };
    });

  if (loading) return <div className="text-gray-500 font-medium">Memuat peta lokasi...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Peta Lokasi Warga</h2>
          <p className="text-gray-600 text-sm">Cari dan navigasi rute ke lokasi titik jemput warga.</p>
        </div>
        
        <div className="flex gap-4 text-xs font-bold text-gray-600">
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 block"></span> Menunggu</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 block"></span> Diproses</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
        <Map markers={mapMarkers} height="calc(100vh - 180px)" />
        
        {/* Overlay Info Card inside Map */}
        <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 pointer-events-none w-48">
          <div className="font-bold text-gray-800 mb-2 border-b pb-1">Lokasi Aktif</div>
          <div className="text-3xl font-black text-orange-600">{mapMarkers.length}</div>
          <div className="text-xs text-gray-500 mt-1">Titik penjemputan</div>
        </div>
      </div>
    </div>
  );
};

export default TransporterPeta;
