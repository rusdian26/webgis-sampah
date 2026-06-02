import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AdminLayout = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menus = [
    { name: 'Dashboard Overview', path: '/admin/dashboard', icon: '📈' },
    { name: 'Data Warga', path: '/admin/data-warga', icon: '👥' },
    { name: 'Data Pengangkutan', path: '/admin/data-pengangkutan', icon: '🚛' },
    { name: 'Verifikasi Pembayaran', path: '/admin/verifikasi', icon: '💰' },
    { name: 'Monitoring Peta', path: '/admin/monitoring-peta', icon: '🗺️' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Admin */}
      <div className="w-64 flex flex-col shadow-xl z-10 transition-colors duration-300 bg-slate-800 text-white">
        <div className="p-5 text-xl font-bold flex items-center gap-3 border-b border-slate-700">
          <span className="text-2xl">🛡️</span>
          Admin Panel
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menus.map((menu, index) => (
              <li key={index}>
                <NavLink 
                  to={menu.path}
                  className={({ isActive }) => 
                    `font-medium p-3 rounded-lg flex items-center gap-3 cursor-pointer transition block ${isActive ? 'bg-slate-900 shadow-inner border-l-4 border-blue-500' : 'border-l-4 border-transparent hover:bg-slate-700 hover:border-slate-500'}`
                  }
                >
                  <span>{menu.icon}</span>
                  {menu.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 border-t border-slate-700">
          <div className="mb-4 flex flex-col gap-1 text-sm text-slate-300">
            <span>Login sebagai:</span>
            <span className="font-bold text-white text-base capitalize bg-black/30 px-3 py-2 rounded-md border border-white/10 flex items-center justify-between">
              Administrator
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 shadow-md text-white py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition transform active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Navbar */}
        <header className="bg-white shadow-sm h-16 flex items-center px-8 justify-between border-b border-gray-200 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">Sistem Pengelolaan Sampah</h1>
            <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-bold border border-blue-200">Admin Live</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 font-medium">
              Administrator Dashboard Center
            </div>
          </div>
        </header>

        {/* Page Content Rendered via Outlet */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
