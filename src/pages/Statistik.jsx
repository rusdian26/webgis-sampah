import React from 'react';
import { Link } from 'react-router-dom';

const Statistik = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 p-10 bg-white rounded-3xl shadow-xl border border-green-50 max-w-lg w-full">
        <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Statistik</h1>
        <p className="text-gray-600 leading-relaxed text-justify">
          Keberhasilan pengelolaan sampah dapat dilihat dari data yang terus kami kumpulkan dan analisis setiap hari. Melalui kolaborasi aktif antara warga dan petugas pengangkutan, ribuan titik tumpukan sampah berhasil dikelola dengan rute yang lebih efisien dan terorganisir. Kami menyajikan transparansi data ini sebagai bentuk komitmen nyata menuju target zero waste.
        </p>
        <div className="pt-4">
          <Link to="/" className="inline-block px-8 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Statistik;
