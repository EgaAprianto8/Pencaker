'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { BookOpen, UserMinus, Lightbulb } from 'lucide-react'; // Import icons tambahan

const data = [
  { "Uraian": "SD ke Bawah", "Laki-laki": 30.34, "Perempuan": 19.31, "Total": 26.76 },
  { "Uraian": "SMP", "Laki-laki": 8.47, "Perempuan": 11.77, "Total": 9.54 },
  { "Uraian": "SMA Umum", "Laki-laki": 21.07, "Perempuan": 26.03, "Total": 22.68 },
  { "Uraian": "SMK Kejuruan", "Laki-laki": 31.41, "Perempuan": 35.38, "Total": 32.70 },
  { "Uraian": "DI/II/III/Universitas", "Laki-laki": 8.72, "Perempuan": 7.50, "Total": 8.32 },
  { "Uraian": "Jumlah", "Laki-laki": 100.0, "Perempuan": 100.0, "Total": 100.0 }
];

const COLORS = ['#6366F1', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'];

const PersentasePengangguranChart: React.FC = () => {
  const chartData = data
    .filter(item => item.Uraian !== "Jumlah")
    .map(item => ({
      name: item.Uraian,
      value: item.Total,
    }));

  return (
    <section className="relative py-16 px-4 bg-[#f6f6ff] overflow-hidden">
      {/* Colorful div patterns */}
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-300 opacity-20 rounded-full mix-blend-multiply filter blur-xl animate-blob -z-10 animation-delay-1000"></div>
      <div className="absolute top-0 right-1/4 w-36 h-36 bg-yellow-300 opacity-20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-3000 -z-10"></div>
      <div className="absolute top-1/2 right-0 w-32 h-32 bg-blue-300 opacity-20 rounded-full mix-blend-multiply filter blur-xl animate-blob -z-10"></div>

      <div className="relative flex flex-col lg:flex-row items-center justify-center max-w-6xl mx-auto gap-12 z-10">
        {/* Chart Section - dipindahkan ke bagian atas secara visual */}
        <div className="w-full lg:w-3/5 h-[500px] p-2 flex items-center justify-center order-first lg:order-last z-0"> {/* Tambahkan order-first / order-last */}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={160}
              innerRadius={80}
              fill="#8884d8"
              dataKey="value"
              labelLine={true}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
            >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value.toFixed(2)}%`}
                wrapperStyle={{ borderRadius: '8px', boxShadow: '0 6px 16px rgba(0,0,0,0.15)' }}
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', border: 'none', borderRadius: '8px', padding: '12px' }}
                labelStyle={{ fontWeight: 'bold', color: '#333', marginBottom: '5px', fontSize: '16px' }}
                itemStyle={{ color: '#555', fontSize: '14px' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '25px', fontSize: '15px' }}
                iconType="circle"
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Text Explanation Section - dibuat poin-poin dengan ikon */}
        <div className="w-full lg:w-2/5 p-4 text-center lg:text-left">
          <h3 className="text-4xl font-extrabold text-gray-800 mb-6 flex items-center lg:justify-start justify-center">
           Tingkat Pendidikan Pengangguran
          </h3>
          <ul className="space-y-4 text-gray-700 text-lg">
            <li className="flex items-start lg:items-center">
              <BookOpen className="mr-3 mt-1 lg:mt-0 text-blue-600 flex-shrink-0" size={28} />
              <span>
                Visualisasi ini menampilkan distribusi persentase pengangguran di Kota Tasikmalaya berdasarkan tingkat pendidikan.
              </span>
            </li>
            <li className="flex items-start lg:items-center">
              <UserMinus className="mr-3 mt-1 lg:mt-0 text-red-600 flex-shrink-0" size={28} />
              <span>
                Setiap segmen pada pie chart merepresentasikan kontribusi total dari setiap jenjang pendidikan terhadap keseluruhan angka pengangguran.
              </span>
            </li>
            <li className="flex items-start lg:items-center">
              <Lightbulb className="mr-3 mt-1 lg:mt-0 text-yellow-600 flex-shrink-0" size={28} />
              <span>
                Membantu Anda untuk mengidentifikasi dengan cepat tingkat pendidikan mana yang memiliki persentase pengangguran tertinggi.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default PersentasePengangguranChart;