'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Briefcase } from 'lucide-react';

const raw = [
  { Kecamatan: "Kota Tasikmalaya", Pencari_Kerja_2021: 4796, Pencari_Kerja_2022: 4652, Pencari_Kerja_2023: 3186, Pencari_Kerja_2024: 2619, Penempatan_2021: 1197, Penempatan_2022: 1250, Penempatan_2023: 1694, Penempatan_2024: 1067 }
];

const chartData = ['2021', '2022', '2023', '2024'].map(y => ({
  name: y,
  Pencari_Kerja: raw[0][`Pencari_Kerja_${y}` as keyof typeof raw[0]],
  Penempatan: raw[0][`Penempatan_${y}` as keyof typeof raw[0]],
}));

const PencakerPenempatanChart: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const fontSize = isMobile ? 12 : 14;
  const barSize = isMobile ? 24 : 30;

  return (
    <section className="relative py-12 sm:py-16 md:py-20 px-4 overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="absolute top-[15%] left-[5%] w-32 h-32 sm:w-40 sm:h-40 bg-teal-300 opacity-25 rounded-full mix-blend-multiply filter blur-xl animate-blob -z-10"></div>
      <div className="absolute bottom-[20%] right-[10%] w-40 h-40 sm:w-56 sm:h-56 bg-lime-300 opacity-25 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000 -z-10"></div>
      <div className="absolute top-[50%] left-[2%] w-36 h-36 sm:w-48 sm:h-48 bg-orange-300 opacity-25 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000 -z-10"></div>

      <div className="relative flex flex-col-reverse lg:flex-row items-center justify-center max-w-7xl mx-auto gap-8 md:gap-12 lg:gap-16 z-10">
        {/* Chart */}
        <div className="w-full lg:w-3/5 h-80 sm:h-[450px] md:h-[500px] p-2 sm:p-4 bg-white rounded-2xl sm:rounded-3xl shadow-md border border-gray-100 transform hover:scale-[1.01] transition-transform duration-300 ease-in-out">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
              <XAxis dataKey="name" stroke="#555" fontSize={fontSize} fontWeight="bold" />
              <YAxis stroke="#555" fontSize={fontSize} fontWeight="bold" />
              <Tooltip
                wrapperStyle={{ borderRadius: '8px', boxShadow: '0 6px 16px rgba(0,0,0,0.15)' }}
                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.98)', border: 'none', borderRadius: '8px', padding: '12px' }}
                labelStyle={{ fontWeight: 'bold', color: '#333' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} iconType="circle" />
              <Bar dataKey="Pencari_Kerja" fill="#0EA5E9" barSize={barSize} radius={[4, 4, 0, 0]}>
                <LabelList dataKey="Pencari_Kerja" position="top" fontSize={fontSize - 2} />
              </Bar>
              <Bar dataKey="Penempatan" fill="#22C55E" barSize={barSize} radius={[4, 4, 0, 0]}>
                <LabelList dataKey="Penempatan" position="top" fontSize={fontSize - 2} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Narrative */}
        <div className="w-full lg:w-2/5 p-4 text-center lg:text-left">
          <div className="flex flex-col items-center lg:items-start mb-6">
            <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-green-100 to-teal-200 shadow-lg mb-4">
              <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
            </div>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 leading-tight">
              Dinamika Pasar Tenaga Kerja Tasikmalaya
            </h3>
          </div>
          <p className="text-gray-700 text-base sm:text-lg text-justify leading-relaxed mb-4">
            Jumlah pencari kerja terus menurun: dari <strong>4.796 orang (2021)</strong> menjadi <strong>2.619 orang (2024)</strong>. Namun, penempatan kerja tidak konsisten—hanya sebagian pelamar yang berhasil ditempatkan, bahkan saat jumlah pelamar menurun.
          </p>
          <p className="text-gray-700 text-base sm:text-lg text-justify leading-relaxed">
            Ini mengindikasikan adanya kesenjangan antara <strong>penawaran dan permintaan tenaga kerja</strong>. Dengan memahami tren ini, pemangku kepentingan dapat menentukan waktu atau strategi terbaik untuk meningkatkan peluang kerja di Kota Tasikmalaya.
          </p>
          <p className='text-sm mt-2'>
            Sumber: Dinas Ketenagakerjaan Kota Tasikmalaya
          </p>
        </div>
      </div>
    </section>
  );
};

export default PencakerPenempatanChart;