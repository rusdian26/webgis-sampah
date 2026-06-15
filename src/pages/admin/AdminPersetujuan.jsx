import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

const AdminPersetujuan = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel('public:users:admin_persetujuan')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchUsers = async () => {
    const { data: res, error } = await supabase
      .from('users')
      .select('*');
      
    if (error) {
      console.error("Error fetching users:", error.message);
    }
    
    if (res) {
      // Sort manually just in case
      const sorted = res.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setUsers(sorted);
    }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    setActionLoading(true);
    const { error } = await supabase
      .from('users')
      .update({ status_akun: status })
      .eq('id', id);
      
    setActionLoading(false);
    
    if (error) {
      Swal.fire('Error', error.message, 'error');
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: `Status akun diperbarui menjadi ${status}.`,
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const antreanPersetujuan = users.filter(u => u.status_akun === 'Pending' && u.role !== 'admin');
  const riwayatPersetujuan = users.filter(u => (u.status_akun === 'Aktif' || u.status_akun === 'Ditolak') && u.role !== 'admin');

  if (loading) return <div className="text-gray-500 font-medium">Memuat data pendaftar...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-blue-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Persetujuan Akun</h2>
          <p className="text-slate-500 text-sm">Verifikasi pendaftaran pengguna baru (Warga & Transporter).</p>
        </div>
      </div>

      {/* Antrean Menunggu Persetujuan */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-blue-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <span className="text-blue-500 text-xl">⏳</span> 
            Menunggu Persetujuan
          </h3>
          <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1.5 rounded-lg font-bold">{antreanPersetujuan.length} Antrean</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-700 text-sm border-b border-slate-100">
                <th className="p-4 pl-6 font-semibold">Nama Pendaftar</th>
                <th className="p-4 font-semibold">Role Diajukan</th>
                <th className="p-4 font-semibold">Tgl Daftar</th>
                <th className="p-4 pr-6 font-semibold text-right">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody>
              {antreanPersetujuan.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="font-bold text-slate-800">{item.nama}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${item.role === 'transporter' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                      {item.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600 font-medium">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="p-4 pr-6 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => updateStatus(item.id, 'Aktif')}
                      disabled={actionLoading}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm transition-colors font-bold shadow-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Setujui
                    </button>
                    <button 
                      onClick={() => updateStatus(item.id, 'Ditolak')}
                      disabled={actionLoading}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2.5 rounded-xl text-sm transition-colors font-bold shadow-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> Tolak
                    </button>
                  </td>
                </tr>
              ))}
              {antreanPersetujuan.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-16 text-center text-slate-500">
                    <div className="text-5xl mb-4 opacity-50">✨</div>
                    <div className="font-medium text-lg">Tidak ada pendaftar baru.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Riwayat Persetujuan */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-700">Riwayat Persetujuan Akun</h3>
        </div>
        
        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100 bg-white sticky top-0">
                <th className="p-4 pl-6 font-semibold">Nama</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Status Akun</th>
              </tr>
            </thead>
            <tbody>
              {riwayatPersetujuan.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="p-4 pl-6 font-medium text-slate-700">{item.nama}</td>
                  <td className="p-4">
                    <span className="text-xs uppercase font-bold text-slate-500">{item.role}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 inline-block rounded-md text-[10px] font-bold uppercase tracking-wider ${item.status_akun === 'Aktif' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                      {item.status_akun}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPersetujuan;
