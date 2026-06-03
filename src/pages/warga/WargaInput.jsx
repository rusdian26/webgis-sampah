import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Map from '../../components/Map';
import Swal from 'sweetalert2';

const WargaInput = ({ user }) => {
  const navigate = useNavigate();
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

  useEffect(() => {
    if (user) fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    const { data: prof } = await supabase.from('users').select('*').eq('id', user.id).single();
    setUserProfile(prof);

    // Ambil data lokasi terakhir jika ada
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
      setPosition({ lat: -6.200000, lng: 106.816666 });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) {
      return Swal.fire({ icon: 'warning', title: 'Lokasi Belum Dipilih', text: 'Silakan klik area di peta terlebih dahulu!' });
    }

    setLoading(true);
    const nominalTagihan = parseFloat(formData.berat) * 5000;

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
      return Swal.fire({ icon: 'error', title: 'Gagal', text: error.message });
    }

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Request pengangkutan berhasil dikirim.',
      timer: 2000,
      showConfirmButton: false
    });
    
    // Redirect ke riwayat setelah sukses
    navigate('/warga/request');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative">
        <h2 className="text-xl font-bold mb-6 text-slate-800 border-b border-slate-100 pb-4">Formulir Input Sampah</h2>
        {userProfile ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Warga</label>
                <input type="text" readOnly className="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 text-slate-500 outline-none" value={userProfile.nama} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">No Handphone</label>
                <input type="text" required className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none shadow-sm" value={formData.no_hp} onChange={e => setFormData({...formData, no_hp: e.target.value})} placeholder="0812xxx" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Alamat Rumah Lengkap</label>
              <textarea required rows="2" className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 transition-all outline-none shadow-sm" value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} placeholder="Jl. Sudirman No..." />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider text-green-700">Detail Sampah</h3>
              <div className="grid grid-cols-2 gap-5 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jenis Sampah</label>
                  <select className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 transition-all outline-none shadow-sm bg-white" value={formData.jenis_sampah} onChange={e => setFormData({...formData, jenis_sampah: e.target.value})}>
                    <option value="Organik">Organik</option>
                    <option value="Anorganik">Anorganik</option>
                    <option value="B3">B3 (Berbahaya)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Perkiraan Berat (Kg)</label>
                  <input type="number" step="0.1" required className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 transition-all outline-none shadow-sm" value={formData.berat} onChange={e => setFormData({...formData, berat: e.target.value})} placeholder="Misal: 2.5" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Catatan Tambahan (Opsional)</label>
                <textarea rows="2" className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 transition-all outline-none shadow-sm" value={formData.catatan} onChange={e => setFormData({...formData, catatan: e.target.value})} placeholder="Contoh: Sampah saya taruh di depan pagar warna hitam." />
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50/80 rounded-xl border border-blue-100 flex items-start gap-3">
              <span className="text-blue-500 mt-0.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
              <p className="text-sm text-blue-800 font-medium">
                Pastikan Anda telah memilih titik lokasi rumah pada peta di sebelah kanan agar Transporter dapat menemukan Anda.
              </p>
            </div>

            <button type="submit" disabled={loading || !position} className="w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 disabled:from-slate-300 disabled:to-slate-400 disabled:text-slate-500 transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex justify-center items-center gap-2">
              {loading ? 'Menyimpan...' : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  Kirim Request Pengangkutan
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
             <div className="w-10 h-10 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mb-4"></div>
             <p className="font-medium">Memuat formulir...</p>
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[600px] lg:h-auto relative">
        <h2 className="text-xl font-bold mb-1 text-slate-800">Pilih Lokasi Rumah</h2>
        <p className="text-sm text-slate-500 mb-6 border-b border-slate-100 pb-4">Klik pada area peta untuk menandai titik jemput sampah secara akurat.</p>
        <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 shadow-inner relative">
          <Map interactive={true} selectedPosition={position} onPositionSelect={setPosition} />
        </div>
      </div>
    </div>
  );
};

export default WargaInput;
