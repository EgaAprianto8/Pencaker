'use client';

import React from 'react';
import { Users, TrendingUp } from 'lucide-react';

interface PopulationData {
  Kegiatan_Utama: string;
  Total_2021: number;
  Total_2022: number;
  Total_2023: number;
  Total_2024: number;
}

const data: PopulationData[] = [
  { Kegiatan_Utama: "Angkatan kerja", Total_2021: 342585, Total_2022: 347063, Total_2023: 369778, Total_2024: 395357 },
  { Kegiatan_Utama: "Bekerja", Total_2021: 316349, Total_2022: 324099, Total_2023: 345544, Total_2024: 369713 },
  { Kegiatan_Utama: "Pengangguran terbuka", Total_2021: 26236, Total_2022: 22964, Total_2023: 24234, Total_2024: 25644 },
  { Kegiatan_Utama: "Bukan angkatan kerja", Total_2021: 178418, Total_2022: 178909, Total_2023: 195315, Total_2024: 178295 },
  { Kegiatan_Utama: "Sekolah", Total_2021: 37185, Total_2022: 48289, Total_2023: 52601, Total_2024: 51728 },
  { Kegiatan_Utama: "Mengurus rumah tangga", Total_2021: 100217, Total_2022: 112954, Total_2023: 119313, Total_2024: 108140 },
  { Kegiatan_Utama: "Lainnya", Total_2021: 41016, Total_2022: 17666, Total_2023: 23401, Total_2024: 18427 },
  { Kegiatan_Utama: "Jumlah", Total_2021: 521003, Total_2022: 525972, Total_2023: 565093, Total_2024: 573652 },
];

const JumlahPenduduk: React.FC = () => {
  const sortedData = [...data].sort((a, b) => {
    if (a.Kegiatan_Utama === "Jumlah") return 1;
    if (b.Kegiatan_Utama === "Jumlah") return -1;
    return 0;
  });

  return (
    <section className="relative py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-br from-purple-50 to-indigo-100 overflow-hidden">
      <div className="absolute top-1/4 left-[5%] w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-blue-300 opacity-25 rounded-full mix-blend-multiply filter blur-xl animate-blob -z-10"></div>
      <div className="absolute bottom-[10%] right-[5%] w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-green-300 opacity-25 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2500 -z-10"></div>
      <div className="absolute top-[5%] right-[10%] w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 bg-red-300 opacity-25 rounded-full mix-blend-multiply filter blur-xl animate-blob -z-10"></div>

      <div className="relative flex flex-col-reverse lg:flex-row items-center justify-center max-w-7xl mx-auto gap-8 md:gap-12 lg:gap-16 z-10">
        {/* Table Section */}
        <div className="w-full lg:w-3/5 p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 transform hover:scale-[1.01] transition-transform duration-300 ease-in-out">
          <h4 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 mb-6 text-center lg:text-left flex items-center justify-center lg:justify-start">
            <Users className="mr-3 text-indigo-700" size={32} />
            Statistik Demografi Ketenagakerjaan Kota Tasikmalaya
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-[600px] md:min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-bold text-indigo-800 uppercase tracking-wider">Kegiatan Utama</th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 text-center text-xs sm:text-sm font-bold text-indigo-800 uppercase tracking-wider">2021</th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 text-center text-xs sm:text-sm font-bold text-indigo-800 uppercase tracking-wider">2022</th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 text-center text-xs sm:text-sm font-bold text-indigo-800 uppercase tracking-wider">2023</th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 text-center text-xs sm:text-sm font-bold text-indigo-800 uppercase tracking-wider">2024</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.map((row, index) => (
                  <tr key={index} className={["Angkatan kerja", "Jumlah", "Bukan angkatan kerja"].includes(row.Kegiatan_Utama) ? "bg-indigo-100 font-semibold text-indigo-900" : "hover:bg-gray-50 transition-colors duration-200"}>
                    <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm md:text-base font-medium text-gray-900">{row.Kegiatan_Utama}</td>
                    <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-center text-xs sm:text-sm md:text-base text-gray-800">{row.Total_2021.toLocaleString('id-ID')}</td>
                    <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-center text-xs sm:text-sm md:text-base text-gray-800">{row.Total_2022.toLocaleString('id-ID')}</td>
                    <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-center text-xs sm:text-sm md:text-base text-gray-800">{row.Total_2023.toLocaleString('id-ID')}</td>
                    <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-center text-xs sm:text-sm md:text-base text-gray-800">{row.Total_2024.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='mt-2 text-sm'>
          Sumber: Badan Pusat Statistik, Survei Angkatan Kerja Nasional (Sakernas) Agustus
          </div>
        </div>

        {/* Narrative Section */}
        <div className="w-full lg:w-2/5 p-4 text-center lg:text-left lg:order-1 order-1">
          <div className="flex flex-col items-center lg:items-start mb-6">
            <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-200 shadow-lg mb-4">
              <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
            </div>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 leading-tight">
              Tren Demografi Ketenagakerjaan
            </h3>
          </div>
          <p className="text-gray-700 text-base sm:text-lg text-justify leading-relaxed mb-4">
            Angkatan kerja di Kota Tasikmalaya terus tumbuh, dari <strong>±342 ribu (2021)</strong> menjadi <strong>±395 ribu (2024)</strong>. Jumlah yang bekerja ikut meningkat, sementara tingkat pengangguran terbuka berfluktuasi setiap tahunnya.
          </p>
          <p className="text-gray-700 text-base sm:text-lg text-justify leading-relaxed">
            Kelompok <strong>bukan angkatan kerja</strong>—pelajar, pengurus rumah tangga, lainnya—masih menjadi bagian besar dari populasi usia kerja. Data ini menjadi dasar penting untuk memahami dinamika pasar kerja dan merancang kebijakan ketenagakerjaan yang lebih tepat sasaran.
          </p>
        </div>
        
      </div>
    </section>
  );
};

export default JumlahPenduduk;