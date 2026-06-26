import React from 'react';
import { Link } from 'react-router-dom';

const Kontak = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 p-10 bg-white rounded-3xl shadow-xl border border-green-50 max-w-lg w-full">
        <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Kontak Kami</h1>
        <p className="text-gray-600 leading-relaxed text-justify">
          Kami percaya bahwa komunikasi yang baik adalah kunci dari pelayanan masyarakat yang optimal. Tim EcoWaste selalu siap mendengarkan saran, masukan, dan keluhan Anda terkait kebersihan lingkungan dan operasional pengangkutan. Jangan ragu untuk menghubungi kami; setiap suara Anda sangat berarti untuk membangun masa depan kota yang lebih hijau.
        </p>
        <div className="pt-4">
          <Link to="/" className="inline-block px-8 py-3 bg-purple-500 text-white rounded-full font-semibold hover:bg-purple-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Kontak;
