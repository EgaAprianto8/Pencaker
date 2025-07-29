// app/components/PencakerPenempatanChart.tsx

'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList
} from 'recharts';
import { Search, Briefcase, TrendingUp, UserCheck } from 'lucide-react'; // Menambah ikon untuk poin-poin

const data = [
    { "Kecamatan": "Kota Tasikmalaya", "Pencari_Kerja_2021": 4796, "Pencari_Kerja_2022": 4652, "Pencari_Kerja_2023": 3186, "Pencari_Kerja_2024": 2619, "Penempatan_2021": 1197, "Penempatan_2022": 1250, "Penempatan_2023": 1694, "Penempatan_2024": 1067 }
];

const processData = (rawData: typeof data) => {
    const years = ['2021', '2022', '2023', '2024'];
    const chartData = years.map(year => ({
        name: year,
        Pencari_Kerja: rawData[0][`Pencari_Kerja_${year}` as keyof typeof rawData[0]],
        Penempatan: rawData[0][`Penempatan_${year}` as keyof typeof rawData[0]],
    }));
    return chartData;
};

const PencakerPenempatanChart: React.FC = () => {
    const chartData = processData(data);

    return (
        <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-100">
            {/* Colorful div patterns - ukuran dan opacity disesuaikan */}
            <div className="absolute top-[15%] left-[5%] w-40 h-40 bg-teal-300 opacity-25 rounded-full mix-blend-multiply filter blur-xl animate-blob -z-10"></div>
            <div className="absolute bottom-[20%] right-[10%] w-56 h-56 bg-lime-300 opacity-25 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000 -z-10"></div>
            <div className="absolute top-[50%] left-[2%] w-48 h-48 bg-orange-300 opacity-25 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000 -z-10"></div>

            <div className="relative flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto gap-16 z-10">
                {/* Chart Section */}
                <div className="w-full lg:w-3/5 h-[500px] p-2 bg-white rounded-3xl shadow-md border border-gray-100 transform hover:scale-[1.01] transition-transform duration-300 ease-in-out">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 20,
                            }}
                            barCategoryGap="35%"
                            barGap={0}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                            <XAxis dataKey="name" stroke="#555" padding={{ left: 20, right: 20 }} fontSize={14} fontWeight="bold" />
                            <YAxis stroke="#555" fontSize={14} fontWeight="bold" />
                            <Tooltip
                                wrapperStyle={{ borderRadius: '8px', boxShadow: '0 6px 16px rgba(0,0,0,0.15)' }}
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', border: 'none', borderRadius: '8px', padding: '12px' }}
                                labelStyle={{ fontWeight: 'bold', color: '#333', marginBottom: '5px', fontSize: '16px' }}
                                itemStyle={{ color: '#555', fontSize: '14px' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '25px', fontSize: '15px' }} iconType="circle" />
                            <Bar
                                dataKey="Pencari_Kerja"
                                fill="#0EA5E9"
                                barSize={30}
                                radius={[5, 5, 0, 0]}
                            >
                                <LabelList dataKey="Pencari_Kerja" position="top" fill="#333" fontSize={12} />
                            </Bar>
                            <Bar
                                dataKey="Penempatan"
                                fill="#22C55E"
                                barSize={30}
                                radius={[5, 5, 0, 0]}
                            >
                                <LabelList dataKey="Penempatan" position="top" fill="#333" fontSize={12} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {/* Text Explanation Section - dibuat poin-poin dengan ikon */}
                <div className="w-full lg:w-2/5 p-4 text-center lg:text-left">
                    <h3 className="text-5xl font-extrabold text-gray-900 mb-8 leading-tight">
                        Dinamika Pasar Kerja Tasikmalaya
                    </h3>
                    <ul className="space-y-4 text-gray-700 text-lg">
                        <li className="flex items-start lg:items-center">
                            <Search className="mr-3 mt-1 lg:mt-0 text-blue-600 flex-shrink-0" size={28} />
                            <span>
                                Jumlah Pencari Kerja: Memantau tren pendaftaran pencari kerja dari tahun ke tahun.
                            </span>
                        </li>
                        <li className="flex items-start lg:items-center">
                            <Briefcase className="mr-3 mt-1 lg:mt-0 text-indigo-600 flex-shrink-0" size={28} />
                            <span>
                                Efektivitas Penempatan: Melihat seberapa banyak pencari kerja yang berhasil ditempatkan.
                            </span>
                        </li>
                        <li className="flex items-start lg:items-center">
                            <TrendingUp className="mr-3 mt-1 lg:mt-0 text-teal-600 flex-shrink-0" size={28} />
                            <span>
                                Analisis Tren: Memahami perbandingan antara suplai dan permintaan tenaga kerja di wilayah ini.
                            </span>
                        </li>
                        <li className="flex items-start lg:items-center">
                            <UserCheck className="mr-3 mt-1 lg:mt-0 text-lime-600 flex-shrink-0" size={28} />
                            <span>
                                Peluang Kerja: Mengidentifikasi periode dengan penempatan kerja yang lebih tinggi.
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default PencakerPenempatanChart;