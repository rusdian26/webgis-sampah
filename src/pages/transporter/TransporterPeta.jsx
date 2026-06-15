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
    .filter(item => !(item.status_pengangkutan === 'Menunggu' && item.status_pembayaran !== 'Lunas'))
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
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Peta Lokasi Warga</h2>
          <p className="text-slate-500 text-sm">Cari dan navigasi rute ke lokasi titik jemput warga.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 block shadow-sm"></span> Menunggu</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 block shadow-sm"></span> Diproses</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <Map markers={mapMarkers} height="calc(100vh - 200px)" />
        
        {/* Overlay Info Card inside Map */}
        <div className="absolute top-6 right-6 z-[400] bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-slate-100/50 pointer-events-none w-56">
          <div className="font-bold text-slate-700 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Lokasi Aktif
          </div>
          <div className="text-4xl font-black text-green-600">{mapMarkers.length}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Titik penjemputan</div>
        </div>
      </div>
    </div>
  );
};

export default TransporterPeta;
