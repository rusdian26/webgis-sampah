import React from 'react';
import { Link } from 'react-router-dom';

const Tentang = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 p-10 bg-white rounded-3xl shadow-xl border border-green-50 max-w-lg w-full">
        <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Tentang Kami</h1>
        <p className="text-gray-600 leading-relaxed text-justify">
          EcoWaste hadir sebagai solusi inovatif dalam mewujudkan lingkungan kota yang bersih dan sehat. Kami mengintegrasikan teknologi WebGIS untuk mempermudah partisipasi warga dalam pelaporan dan pengelolaan sampah sehari-hari. Dengan sistem yang transparan dan terukur, kami berharap dapat membangun kesadaran kolektif untuk menjaga kelestarian bumi mulai dari lingkungan terkecil.
        </p>
        <div className="pt-4">
          <Link to="/" className="inline-block px-8 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Tentang;
