import React from 'react';
import { supabase } from '../lib/supabase';

const Layout = ({ children, role }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Konfigurasi Tema berdasarkan Role
  let theme = {
    bg: 'bg-green-700',
    border: 'border-green-600',
    activeBg: 'bg-green-800',
    text: 'text-green-100',
    title: 'EcoWaste Warga',
    icon: '🏠'
  };

  let menus = [
    { name: 'Dashboard Warga', icon: '📊' },
    { name: 'Input Sampah', icon: '📝' },
    { name: 'Request Pengangkutan', icon: '🚚' },
    { name: 'Riwayat', icon: '🕒' }
  ];

  if (role === 'admin') {
    theme = { 
      bg: 'bg-slate-800', 
      border: 'border-slate-700', 
      activeBg: 'bg-slate-900', 
      text: 'text-slate-300', 
      title: 'Admin Panel',
      icon: '🛡️'
    };
    menus = [
      { name: 'Dashboard Overview', icon: '📈' },
      { name: 'Data Warga', icon: '👥' },
      { name: 'Data Pengangkutan', icon: '🚛' },
      { name: 'Verifikasi Pembayaran', icon: '💰' },
      { name: 'Monitoring Peta', icon: '🗺️' }
    ];
  } else if (role === 'transporter') {
    theme = { 
      bg: 'bg-orange-600', 
      border: 'border-orange-500', 
      activeBg: 'bg-orange-700', 
      text: 'text-orange-100', 
      title: 'Driver Transporter',
      icon: '🚚'
    };
    menus = [
      { name: 'Dashboard Transporter', icon: '📱' },
      { name: 'Daftar Pengangkutan', icon: '📋' },
      { name: 'Peta Lokasi Warga', icon: '📍' },
      { name: 'Status Pengangkutan', icon: '🔄' }
    ];
  } else {
    // Warga (Default) uses the initial theme defined above
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Berbeda per Role */}
      <div className={`w-64 flex flex-col shadow-xl z-10 transition-colors duration-300 ${theme.bg} text-white`}>
        <div className={`p-5 text-xl font-bold flex items-center gap-3 border-b ${theme.border}`}>
          <span className="text-2xl">{theme.icon}</span>
          {theme.title}
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menus.map((menu, index) => (
              <li 
                key={index}
                className={`font-medium p-3 rounded-lg flex items-center gap-3 cursor-pointer transition ${index === 0 ? theme.activeBg : `hover:${theme.activeBg} hover:bg-opacity-50`}`}
              >
                <span>{menu.icon}</span>
                {menu.name}
              </li>
            ))}
          </ul>
        </div>

        <div className={`p-5 border-t ${theme.border}`}>
          <div className={`mb-4 flex flex-col gap-1 text-sm ${theme.text}`}>
            <span>Login sebagai:</span>
            <span className="font-bold text-white text-base capitalize bg-black/20 px-3 py-2 rounded-md border border-white/10 flex items-center justify-between">
              {role}
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 shadow-md text-white py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition transform active:scale-95"
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
            <h1 className="text-xl font-bold text-gray-800">{theme.title}</h1>
            <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium border border-gray-200">Live Terhubung</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 font-medium">
              Sistem Terintegrasi WebGIS Supabase
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
