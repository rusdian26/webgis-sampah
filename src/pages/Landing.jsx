import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 selection:bg-green-200">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-500">
                EcoWaste
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center flex-1 justify-center">
              <a href="#home" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Home</a>
              <Link to="/tentang" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Tentang</Link>
              <a href="#layanan" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Layanan</a>
              <Link to="/statistik" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Statistik</Link>
              <Link to="/kontak" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Kontak</Link>
            </div>

            <div className="hidden md:flex items-center">
              <Link to="/login" className="px-6 py-2.5 rounded-full bg-green-500 hover:bg-green-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 whitespace-nowrap">
                Masuk / Daftar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-b from-green-100/60 to-transparent blur-3xl"></div>
          <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-blue-50/50 to-green-50/50 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100 text-green-600 text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Platform Smart Waste Management
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900">
                Wujudkan <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-400">Clean City</span> <br/>
                Mulai dari Rumah Anda.
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                Kelola sampah dengan lebih cerdas. Laporkan, jadwalkan penjemputan, dan pantau status sampah Anda secara real-time. Bersama kita wujudkan lingkungan yang lebih hijau dan bersih.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login" className="px-8 py-4 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold text-lg text-center shadow-lg shadow-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  Mulai Sekarang
                </Link>
                <a href="#layanan" className="px-8 py-4 rounded-full bg-white border-2 border-gray-100 hover:border-green-100 hover:bg-green-50 text-gray-700 font-semibold text-lg text-center shadow-sm transition-all duration-300">
                  Pelajari Fitur
                </a>
              </div>
            </div>

            {/* Illustration Area */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-green-100 to-blue-50 rounded-3xl transform rotate-3 scale-105 -z-10 transition-transform duration-500 hover:rotate-6"></div>
              <div className="bg-white/60 backdrop-blur-sm border border-white p-4 sm:p-6 rounded-3xl shadow-2xl relative">
                 {/* Decorative elements */}
                 <div className="absolute -top-6 -left-6 w-24 h-24 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                 <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                 
                 <div className="relative z-10 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    <img src="/images/hero.png" alt="Smart Waste Management Illustration" className="w-full h-auto rounded-xl" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fitur Unggulan Section */}
      <section id="layanan" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-green-500 tracking-wider uppercase mb-2">Layanan Kami</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Fitur Pengelolaan Sampah Cerdas</h3>
            <p className="text-gray-600">Sistem terintegrasi yang memudahkan proses dari pelaporan hingga pengangkutan sampah secara transparan dan efisien.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/70 backdrop-blur-lg border border-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-green-500">
                <svg className="w-7 h-7 text-green-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Pelaporan Sampah</h4>
              <p className="text-gray-600">Warga dapat melaporkan titik tumpukan sampah yang belum diangkut dengan mudah melalui platform.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/70 backdrop-blur-lg border border-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-blue-500">
                <svg className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Penjemputan Rutin</h4>
              <p className="text-gray-600">Jadwal penjemputan terorganisir, memastikan lingkungan Anda tetap bersih secara berkala.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/70 backdrop-blur-lg border border-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-yellow-500">
                <svg className="w-7 h-7 text-yellow-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Tracking Courier</h4>
              <p className="text-gray-600">Pantau lokasi truk pengangkut sampah secara real-time di peta interaktif.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/70 backdrop-blur-lg border border-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-purple-500">
                <svg className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Poin Daur Ulang</h4>
              <p className="text-gray-600">Dapatkan poin reward untuk setiap kontribusi pemilahan sampah yang dapat didaur ulang.</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white/70 backdrop-blur-lg border border-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group lg:col-span-2">
              <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-teal-500">
                <svg className="w-7 h-7 text-teal-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Monitoring Data Komprehensif</h4>
              <p className="text-gray-600">Dashboard analitik untuk admin melihat statistik timbulan sampah, efisiensi rute pengangkutan, dan tingkat partisipasi warga secara visual.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-xl text-gray-900">EcoWaste</span>
          </div>
          <p className="text-gray-500 mb-6">Platform Digital WebGIS Pengelolaan Sampah untuk Kota Cerdas dan Lingkungan Hijau.</p>
          <div className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} EcoWaste by Praktikum SIG. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
