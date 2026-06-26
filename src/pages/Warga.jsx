import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Map from '../components/Map';
import Layout from '../components/Layout';
import Swal from 'sweetalert2';

export default function Warga({ user }) {
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState({
    no_hp: '',
    alamat: '',
    jenis_sampah: 'Organik',
    berat: '',
    catatan: ''
  });
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchMyRequests();

      // Realtime subscription ke tabel sampah
      const channel = supabase
        .channel('public:sampah')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sampah' }, () => {
          fetchMyRequests();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      let { data: prof, error } = await supabase.from('users').select('*').eq('id', user.id).single();
      
      // Jika profile belum ada di public.users, buat baru
      if (!prof) {
        const { data: newProf, error: pError } = await supabase.from('users').upsert({
          id: user.id,
          nama: user.user_metadata?.nama || user.email?.split('@')[0] || 'Warga',
          email: user.email,
          role: 'warga'
        }).select().single();
        if (pError) throw pError;
        prof = newProf;
      }
      
      setUserProfile(prof);

      // Coba ambil data alamat, no_hp, dan lokasi terakhir dari request sebelumnya (opsional, agar tidak perlu ngetik ulang)
      const { data: lastReq } = await supabase
        .from('sampah')
        .select('alamat, no_hp, latitude, longitude')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastReq) {
        setFormData(prev => ({
          ...prev,
          no_hp: lastReq.no_hp || '',
          alamat: lastReq.alamat || ''
        }));
        if (lastReq.latitude && lastReq.longitude) {
          setPosition({ lat: lastReq.latitude, lng: lastReq.longitude });
        }
      } else {
        // Default lokasi Jakarta
        setPosition({ lat: -6.200000, lng: 106.816666 });
      }
    } catch (err) {
      setDbError("Database error: " + err.message + ". Pastikan Anda telah menjalankan schema.sql baru di Supabase.");
    }
  };

  const fetchMyRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('sampah')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setMyRequests(data);
      } else if (error) {
        setDbError("Gagal memuat riwayat: " + error.message);
      }
    } catch(err) {
      setDbError("Gagal memuat riwayat: " + err.message);
    }
  };

  const handlePositionSelect = (pos) => {
    setPosition(pos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) {
      return Swal.fire({
        icon: 'warning',
        title: 'Lokasi Belum Dipilih',
        text: 'Silakan klik area di peta terlebih dahulu untuk menentukan lokasi jemputan!',
      });
    }

    setLoading(true);
    
    // Kalkulasi tagihan (contoh: 5000 per kg)
    const nominalTagihan = parseFloat(formData.berat) * 5000;

    // Insert ke tabel sampah yang sudah di-flatten
    const { error } = await supabase.from('sampah').insert({
      user_id: user.id,
      nama_warga: userProfile?.nama || 'Warga',
      jenis_sampah: formData.jenis_sampah,
      berat: parseFloat(formData.berat),
      catatan: formData.catatan,
      alamat: formData.alamat,
      no_hp: formData.no_hp,
      latitude: position.lat,
      longitude: position.lng,
      status_pengangkutan: 'Menunggu',
      status_pembayaran: 'Belum',
      nominal: nominalTagihan
    });

    setLoading(false);

    if (error) {
      return Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan Request',
        text: error.message
      });
    }

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Request pengangkutan berhasil dikirim.',
      timer: 2000,
      showConfirmButton: false
    });
    
    // Reset form kecuali no_hp dan alamat
    setFormData(prev => ({ ...prev, jenis_sampah: 'Organik', berat: '', catatan: '' }));
    fetchMyRequests();
  };

  const handlePembayaran = async (id) => {
    setLoading(true);
    await supabase.from('sampah').update({ status_pembayaran: 'Proses Bayar' }).eq('id', id);
    setLoading(false);
    Swal.fire({
      icon: 'info',
      title: 'Pembayaran Diproses',
      text: 'Menunggu verifikasi dari Admin.',
      timer: 2000,
      showConfirmButton: false
    });
    fetchMyRequests();
  };

  return (
    <Layout role="warga">
      <div className="space-y-6">
        {dbError && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg font-semibold">
            {dbError}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Profil & Request Pengangkutan</h2>
            {userProfile ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Nama Warga</label>
                  <input 
                    type="text" 
                    readOnly 
                    className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                    value={userProfile.nama}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">No HP</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full border border-gray-300 p-2 rounded focus:ring-green-500 focus:border-green-500"
                    value={formData.no_hp}
                    onChange={e => setFormData({...formData, no_hp: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Alamat Rumah Lengkap</label>
                <textarea 
                  required 
                  rows="2"
                  className="w-full border border-gray-300 p-2 rounded focus:ring-green-500 focus:border-green-500"
                  value={formData.alamat}
                  onChange={e => setFormData({...formData, alamat: e.target.value})}
                />
              </div>
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-3">Data Sampah</h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Jenis Sampah</label>
                    <select 
                      className="w-full border border-gray-300 p-2 rounded focus:ring-green-500 focus:border-green-500"
                      value={formData.jenis_sampah}
                      onChange={e => setFormData({...formData, jenis_sampah: e.target.value})}
                    >
                      <option value="Organik">Organik</option>
                      <option value="Anorganik">Anorganik</option>
                      <option value="B3">B3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Berat (Kg)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      required 
                      className="w-full border border-gray-300 p-2 rounded focus:ring-green-500 focus:border-green-500"
                      value={formData.berat}
                      onChange={e => setFormData({...formData, berat: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Catatan Tambahan</label>
                  <textarea 
                    rows="2"
                    placeholder="Contoh: Sampah ditaruh depan pagar"
                    className="w-full border border-gray-300 p-2 rounded focus:ring-green-500 focus:border-green-500"
                    value={formData.catatan}
                    onChange={e => setFormData({...formData, catatan: e.target.value})}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded border border-gray-200">
                <p className="font-medium">Status Peta: {position ? <span className="text-green-600">Lokasi Terpilih</span> : <span className="text-red-500">Belum dipilih</span>}</p>
                <p className="text-xs mt-1 text-gray-400">Silakan klik area di peta sebelah kanan untuk menentukan koordinat jemputan.</p>
              </div>
              <button 
                type="submit" 
                disabled={loading || !position}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition"
              >
                {loading ? 'Mengirim...' : 'Request Pengangkutan'}
              </button>
            </form>
            ) : (
              <div className="py-10 text-center text-gray-500">Memuat formulir...</div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Pilih Lokasi Rumah (Klik Peta)</h2>
            <div className="flex-1 min-h-[400px]">
              <Map interactive={true} selectedPosition={position} onPositionSelect={handlePositionSelect} />
            </div>
          </div>

        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Riwayat Pengangkutan & Pembayaran</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 border-b-2 border-gray-200">
                  <th className="p-3 border-b">Tanggal</th>
                  <th className="p-3 border-b">Jenis & Berat</th>
                  <th className="p-3 border-b">Status Pengangkutan</th>
                  <th className="p-3 border-b">Tagihan & Pembayaran</th>
                  <th className="p-3 border-b">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {myRequests.map((req) => (
                  <tr key={req.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm text-gray-600">{new Date(req.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="p-3">
                      <div className="font-semibold">{req.jenis_sampah}</div>
                      <div className="text-sm text-gray-500">{req.berat} Kg</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${req.status_pengangkutan === 'Selesai' ? 'bg-green-100 text-green-800' : req.status_pengangkutan === 'Diproses' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {req.status_pengangkutan}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-gray-700">Rp {req.nominal?.toLocaleString('id-ID') || 0}</div>
                      <span className={`px-2 py-1 inline-block mt-1 rounded text-xs font-semibold ${req.status_pembayaran === 'Lunas' ? 'bg-green-100 text-green-800' : req.status_pembayaran === 'Proses Bayar' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                        {req.status_pembayaran}
                      </span>
                    </td>
                    <td className="p-3">
                      {req.status_pembayaran === 'Belum' && req.status_pengangkutan === 'Selesai' && (
                        <button 
                          onClick={() => handlePembayaran(req.id)}
                          disabled={loading}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition font-medium shadow-sm"
                        >
                          Bayar Sekarang
                        </button>
                      )}
                      {req.status_pengangkutan === 'Menunggu' && (
                        <span className="text-yellow-600 text-sm font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          Menunggu Courier
                        </span>
                      )}
                      {req.status_pengangkutan === 'Diproses' && (
                        <span className="text-blue-600 text-sm font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                          Sedang Dijemput
                        </span>
                      )}
                      {req.status_pengangkutan === 'Selesai' && req.status_pembayaran === 'Proses Bayar' && (
                        <span className="text-blue-600 text-sm font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          Menunggu Verifikasi
                        </span>
                      )}
                      {req.status_pengangkutan === 'Selesai' && req.status_pembayaran === 'Lunas' && (
                        <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          Selesai & Lunas
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {myRequests.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-500 bg-gray-50">Belum ada riwayat pengangkutan</td>
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