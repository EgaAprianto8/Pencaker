'use client';

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BookOpen } from 'lucide-react';

const raw = [
  { Uraian: "SD ke Bawah", Laki: 30.34, Perempuan: 19.31, Total: 26.76 },
  { Uraian: "SMP", Laki: 8.47, Perempuan: 11.77, Total: 9.54 },
  { Uraian: "SMA Umum", Laki: 21.07, Perempuan: 26.03, Total: 22.68 },
  { Uraian: "SMK Kejuruan", Laki: 31.41, Perempuan: 35.38, Total: 32.70 },
  { Uraian: "DI/II/III/Universitas", Laki: 8.72, Perempuan: 7.50, Total: 8.32 },
  { Uraian: "Jumlah", Laki: 100, Perempuan: 100, Total: 100 }
];

const COLORS = ['#6366F1', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'];
const chartData = raw.filter(i => i.Uraian !== "Jumlah").map(i => ({ name: i.Uraian, value: i.Total }));

const PersentasePengangguranChart: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const outerRadius = isMobile ? 110 : 160;
  const innerRadius = isMobile ? 50 : 80;

  return (
    <section className="relative py-12 sm:py-16 px-4 bg-[#f6f6ff] overflow-hidden">
      <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-40 sm:h-40 bg-pink-300 opacity-20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-1000 -z-10"></div>
      <div className="absolute top-0 right-1/4 w-28 h-28 sm:w-36 sm:h-36 bg-yellow-300 opacity-20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-3000 -z-10"></div>
      <div className="absolute top-1/2 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-blue-300 opacity-20 rounded-full mix-blend-multiply filter blur-xl animate-blob -z-10"></div>

      <div className="relative flex flex-col-reverse lg:flex-row items-center justify-center max-w-6xl mx-auto gap-8 md:gap-12 z-10">
        {/* Chart */}
        <div className="w-full lg:w-3/5 h-80 sm:h-[450px] md:h-[500px] p-2 sm:p-4 flex items-center justify-center order-first lg:order-last">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={outerRadius}
                innerRadius={innerRadius}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => `${v.toFixed(2)}%`}
                wrapperStyle={{ borderRadius: '8px', boxShadow: '0 6px 16px rgba(0,0,0,0.15)' }}
                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.98)', border: 'none', borderRadius: '8px', padding: '12px' }}
                labelStyle={{ fontWeight: 'bold', color: '#333' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }}
                iconType="circle"
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Narrative */}
        <div className="w-full lg:w-2/5 p-4 text-center lg:text-left">
          <div className="flex flex-col items-center lg:items-start mb-6">
            <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 shadow-lg mb-4">
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 leading-tight">
              Tingkat Pendidikan Pengangguran
            </h3>
          </div>
          <p className="text-gray-700 text-base sm:text-lg text-justify leading-relaxed mb-4">
            Mayoritas pengangguran di Kota Tasikmalaya berasal dari <strong>lulusan SMK Kejuruan (32,7%)</strong>, diikuti <strong>SD ke bawah (26,8%)</strong> dan <strong>SMA Umum (22,7%)</strong>. Ini menunjukkan bahwa jenjang pendidikan tertentu berkontribusi besar pada angka pengangguran.
          </p>
          <p className="text-gray-700 text-base sm:text-lg text-justify leading-relaxed">
            Visualisasi ini menjadi <strong>titik awal strategis</strong> untuk menyelaraskan <strong>kurikulum, pelatihan, dan kebijakan keterampilan</strong> dengan kebutuhan industri lokal, agar lulusan lebih mudah terserap pasar kerja.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PersentasePengangguranChart;