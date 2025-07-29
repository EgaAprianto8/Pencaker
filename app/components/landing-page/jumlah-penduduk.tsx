// app/components/JumlahPenduduk.tsx

'use client';

import React from 'react';
import { Users, LayoutDashboard, TrendingUp, Landmark, CheckCircle } from 'lucide-react'; // Menambah ikon untuk poin-poin

interface PopulationData {
    Kegiatan_Utama: string;
    Total_2021: number;
    Total_2022: number;
    Total_2023: number;
    Total_2024: number;
}

const data: PopulationData[] = [
    { "Kegiatan_Utama": "Angkatan kerja", "Total_2021": 342585, "Total_2022": 347063, "Total_2023": 369778, "Total_2024": 395357 },
    { "Kegiatan_Utama": "Bekerja", "Total_2021": 316349, "Total_2022": 324099, "Total_2023": 345544, "Total_2024": 369713 },
    { "Kegiatan_Utama": "Pengangguran terbuka", "Total_2021": 26236, "Total_2022": 22964, "Total_2023": 24234, "Total_2024": 25644 },
    { "Kegiatan_Utama": "Bukan angkatan kerja", "Total_2021": 178418, "Total_2022": 178909, "Total_2023": 195315, "Total_2024": 178295 },
    { "Kegiatan_Utama": "Sekolah", "Total_2021": 37185, "Total_2022": 48289, "Total_2023": 52601, "Total_2024": 51728 },
    { "Kegiatan_Utama": "Mengurus rumah tangga", "Total_2021": 100217, "Total_2022": 112954, "Total_2023": 119313, "Total_2024": 108140 },
    { "Kegiatan_Utama": "Lainnya", "Total_2021": 41016, "Total_2022": 17666, "Total_2023": 23401, "Total_2024": 18427 },
    { "Kegiatan_Utama": "Jumlah", "Total_2021": 521003, "Total_2022": 525972, "Total_2023": 565093, "Total_2024": 573652 },
];

const JumlahPenduduk: React.FC = () => {
    const sortedData = [...data].sort((a, b) => {
        if (a.Kegiatan_Utama === "Jumlah") return 1;
        if (b.Kegiatan_Utama === "Jumlah") return -1;
        return 0;
    });

    return (
        <section className="relative py-20 px-4 bg-gradient-to-br from-purple-50 to-indigo-100 overflow-hidden">
            {/* Colorful div patterns - ukuran dan opacity disesuaikan */}
            <div className="absolute top-1/4 left-[10%] w-48 h-48 bg-blue-300 opacity-25 rounded-full mix-blend-multiply filter blur-xl animate-blob -z-10 animation-delay-500"></div>
            <div className="absolute bottom-[10%] right-[5%] w-64 h-64 bg-green-300 opacity-25 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2500 -z-10"></div>
            <div className="absolute top-[5%] right-[20%] w-56 h-56 bg-red-300 opacity-25 rounded-full mix-blend-multiply filter blur-xl animate-blob -z-10"></div>

            <div className="relative flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto gap-16 z-10">
                {/* Table Section */}
                <div className="w-full lg:w-3/5 p-6 bg-white rounded-3xl shadow-2xl border border-gray-100 transform hover:scale-[1.01] transition-transform duration-300 ease-in-out">
                    <h4 className="text-3xl font-extrabold text-gray-800 mb-8 text-center lg:text-left flex items-center justify-center lg:justify-start">
                        <Users className="mr-4 text-indigo-700" size={40} /> {/* Ukuran ikon diperbesar */}
                        Statistik Demografi Ketenagakerjaan Kota Tasikmalaya
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-indigo-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-indigo-800 uppercase tracking-wider">
                                        Kegiatan Utama
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center text-sm font-bold text-indigo-800 uppercase tracking-wider">
                                        2021
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center text-sm font-bold text-indigo-800 uppercase tracking-wider">
                                        2022
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center text-sm font-bold text-indigo-800 uppercase tracking-wider">
                                        2023
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center text-sm font-bold text-indigo-800 uppercase tracking-wider">
                                        2024
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedData.map((row, index) => (
                                    <tr
                                        key={index}
                                        className={
                                            row.Kegiatan_Utama === "Jumlah" ||
                                            row.Kegiatan_Utama === "Bukan angkatan kerja" ||
                                            row.Kegiatan_Utama === "Angkatan kerja" // Tambahkan kondisi ini
                                                ? "bg-indigo-100 font-bold text-indigo-900"
                                                : "hover:bg-gray-50 transition-colors duration-200"
                                        }
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">
                                            {row.Kegiatan_Utama}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-base text-center text-gray-800">
                                            {row.Total_2021.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-base text-center text-gray-800">
                                            {row.Total_2022.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-base text-center text-gray-800">
                                            {row.Total_2023.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-base text-center text-gray-800">
                                            {row.Total_2024.toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Text Explanation Section - dibuat poin-poin dengan ikon */}
                <div className="w-full lg:w-2/5 p-4 text-center lg:text-left">
                    <h3 className="text-5xl font-extrabold text-gray-900 mb-8 leading-tight">
                        Wawasan Ketenagakerjaan Kota Tasikmalaya
                    </h3>
                    <ul className="space-y-4 text-gray-700 text-lg">
                        <li className="flex items-start lg:items-center">
                            <TrendingUp className="mr-3 mt-1 lg:mt-0 text-blue-600 flex-shrink-0" size={28} />
                            <span>
                                Tren Angkatan Kerja: Memantau jumlah dan perubahan populasi usia kerja aktif yang terlibat atau mencari pekerjaan.
                            </span>
                        </li>
                        <li className="flex items-start lg:items-center">
                            <CheckCircle className="mr-3 mt-1 lg:mt-0 text-green-600 flex-shrink-0" size={28} />
                            <span>
                                Status Pekerjaan: Melihat distribusi penduduk yang sudah bekerja dan yang sedang mencari pekerjaan.
                            </span>
                        </li>
                        <li className="flex items-start lg:items-center">
                            <LayoutDashboard className="mr-3 mt-1 lg:mt-0 text-purple-600 flex-shrink-0" size={28} />
                            <span>
                                Dinamika Penduduk: Memahami komposisi demografi berdasarkan kegiatan utama seperti sekolah, mengurus rumah tangga, atau lainnya.
                            </span>
                        </li>
                        <li className="flex items-start lg:items-center">
                            <Landmark className="mr-3 mt-1 lg:mt-0 text-orange-600 flex-shrink-0" size={28} />
                            <span>
                                Dasar Perencanaan: Data ini krusial untuk kebijakan ketenagakerjaan dan pengembangan ekonomi daerah.
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default JumlahPenduduk;