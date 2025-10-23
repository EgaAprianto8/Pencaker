'use client';

import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList,
  LineChart, Line, ComposedChart, Area, ReferenceLine
} from 'recharts';
import { Users, TrendingUp } from 'lucide-react';

/* ================== DATA & TIPE ================== */
type Year = 2021 | 2022 | 2023 | 2024;

interface Row {
  Kegiatan_Utama: string;
  Total_2021: number;
  Total_2022: number;
  Total_2023: number;
  Total_2024: number;
}

const DATA: Row[] = [
  { Kegiatan_Utama: 'Angkatan kerja',       Total_2021: 342585, Total_2022: 347063, Total_2023: 369778, Total_2024: 395357 },
  { Kegiatan_Utama: 'Bekerja',               Total_2021: 316349, Total_2022: 324099, Total_2023: 345544, Total_2024: 369713 },
  { Kegiatan_Utama: 'Pengangguran terbuka',  Total_2021: 26236,  Total_2022: 22964,  Total_2023: 24234,  Total_2024: 25644  },
  { Kegiatan_Utama: 'Bukan angkatan kerja',  Total_2021: 178418, Total_2022: 178909, Total_2023: 195315, Total_2024: 178295 },
  { Kegiatan_Utama: 'Sekolah',               Total_2021: 37185,  Total_2022: 48289,  Total_2023: 52601,  Total_2024: 51728  },
  { Kegiatan_Utama: 'Mengurus rumah tangga', Total_2021: 100217, Total_2022: 112954, Total_2023: 119313, Total_2024: 108140 },
  { Kegiatan_Utama: 'Lainnya',               Total_2021: 41016,  Total_2022: 17666,  Total_2023: 23401,  Total_2024: 18427  },
  { Kegiatan_Utama: 'Jumlah',                Total_2021: 521003, Total_2022: 525972, Total_2023: 565093, Total_2024: 573652 },
];

const YEARS: Year[] = [2021, 2022, 2023, 2024];

const COLORS = {
  y2021: '#6366F1', // indigo
  y2022: '#22C55E', // emerald
  y2023: '#F59E0B', // amber
  y2024: '#EF4444', // red
};

const fID = (n: number) => n.toLocaleString('id-ID');

// Helper aman-jenis untuk ambil nilai per tahun tanpa `any`
function getValue(row: Row, year: Year): number {
  switch (year) {
    case 2021: return row.Total_2021;
    case 2022: return row.Total_2022;
    case 2023: return row.Total_2023;
    case 2024: return row.Total_2024;
  }
}

/* ================== UI KECIL ================== */
function Tabs({
  value, onChange, items,
}: { value: string; onChange: (v: string) => void; items: { key: string; label: string }[] }) {
  return (
    <div className="mb-4 flex gap-2 overflow-x-auto">
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onChange(it.key)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition
          ${value === it.key ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

function SmallCard({
  title, seq, accent,
}: {
  title: string;
  seq: { year: Year; value: number }[];
  accent: string;
}) {
  const start = seq[0].value;
  const end = seq[seq.length - 1].value;
  const delta = end - start;
  const pct = (delta / start) * 100;
  const up = delta >= 0;

  return (
    <div className="snap-start shrink-0 w-[90%] sm:w-auto rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className={`text-sm font-medium ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
          {up ? '+' : ''}{fID(delta)} ({up ? '+' : ''}{pct.toFixed(1)}%)
        </span>
      </div>
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={seq} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} width={40} axisLine={false} />
            <Tooltip formatter={(v: number) => fID(v)} labelFormatter={(l) => `Tahun ${l}`} />
            <Line type="monotone" dataKey="value" stroke={accent} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ================== KOMPONEN UTAMA ================== */
const KetenagakerjaanViz: React.FC = () => {
  const [tab, setTab] = useState<'overview' | 'kategori' | 'jumlah'>('overview');

  const mainData = useMemo(() => DATA.filter((r) => r.Kegiatan_Utama !== 'Jumlah'), []);
  const totalRow = useMemo(() => DATA.find((r) => r.Kegiatan_Utama === 'Jumlah')!, []);

  // Data "Jumlah" + YoY: tanpa any
  const totalSeriesEnhanced = YEARS.map((y, i) => {
    const nilai = getValue(totalRow, y);
    const prev = i > 0 ? getValue(totalRow, YEARS[i - 1]) : null;
    const yoy = prev !== null ? nilai - prev : null;
    const yoyPct = prev !== null ? (yoy! / prev) * 100 : null;
    return { tahun: y, nilai, yoy, yoyPct };
  });

  const yMin = Math.min(...totalSeriesEnhanced.map((d) => d.nilai));
  const yMax = Math.max(...totalSeriesEnhanced.map((d) => d.nilai));
  const tightDomain: [number, number] = [Math.floor(yMin * 0.96), Math.ceil(yMax * 1.02)];

  // Panels small-multiples: tanpa any
  const panels = useMemo(
    () =>
      mainData.map((r) => ({
        title: r.Kegiatan_Utama,
        seq: YEARS.map((y) => ({ year: y, value: getValue(r, y) })),
      })),
    [mainData]
  );

  return (
    <section className="relative py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-br from-purple-50 to-indigo-100 overflow-hidden">
      {/* dekorasi lembut */}
      <div className="absolute top-1/4 left-[5%] w-32 h-32 bg-blue-300 opacity-25 rounded-full mix-blend-multiply blur-xl -z-10"></div>
      <div className="absolute bottom-[10%] right-[5%] w-48 h-48 bg-green-300 opacity-25 rounded-full mix-blend-multiply blur-xl -z-10"></div>

      <div className="relative flex flex-col-reverse lg:flex-row items-start justify-center max-w-7xl mx-auto gap-8 md:gap-12">
        {/* ================== AREA GRAFIK ================== */}
        <div className="w-full lg:w-3/5 p-4 sm:p-6 bg-white rounded-2xl shadow-2xl border border-gray-100">
          <h4 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 mb-3 flex items-center">
            <Users className="mr-3 text-indigo-700" size={28} />
            Statistik Demografi Ketenagakerjaan Kota Tasikmalaya
          </h4>

          <Tabs
            value={tab}
            onChange={(v) => setTab(v as typeof tab)}
            items={[
              { key: 'overview', label: 'Ikhtisar' },
              { key: 'kategori', label: 'Per Kategori' },
              { key: 'jumlah', label: 'Jumlah' },
            ]}
          />

          {/* Tab: OVERVIEW (Grouped Bar) */}
          {tab === 'overview' && (
            <div className="w-full h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mainData} margin={{ top: 16, right: 24, left: 8, bottom: 72 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="Kegiatan_Utama"
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    height={80}
                    tick={{ fontSize: 12, fill: '#4b5563' }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#4b5563' }} />
                  <Tooltip formatter={(v: number) => fID(v)} labelFormatter={(l) => `Kategori: ${l}`} />
                  <Legend verticalAlign="top" iconType="circle" height={24} />
                  <Bar dataKey="Total_2021" name="2021" fill={COLORS.y2021} radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="Total_2021" position="top" formatter={(v: number) => fID(v)} className="text-[10px]" />
                  </Bar>
                  <Bar dataKey="Total_2022" name="2022" fill={COLORS.y2022} radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="Total_2022" position="top" formatter={(v: number) => fID(v)} className="text-[10px]" />
                  </Bar>
                  <Bar dataKey="Total_2023" name="2023" fill={COLORS.y2023} radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="Total_2023" position="top" formatter={(v: number) => fID(v)} className="text-[10px]" />
                  </Bar>
                  <Bar dataKey="Total_2024" name="2024" fill={COLORS.y2024} radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="Total_2024" position="top" formatter={(v: number) => fID(v)} className="text-[10px]" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Tab: PER KATEGORI (Small Multiples) */}
          {tab === 'kategori' && (
            <>
              {/* mobile: carousel-snap (hapus kelas 'block' agar tidak konflik dengan 'flex') */}
              <div className="lg:hidden -mx-2 px-2 snap-x snap-mandatory overflow-x-auto flex gap-4">
                {panels.map((p, i) => (
                  <SmallCard
                    key={p.title}
                    title={p.title}
                    seq={p.seq}
                    accent={['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#0EA5E9', '#8B5CF6', '#10B981', '#F97316'][i % 8]}
                  />
                ))}
              </div>
              <div className="hidden lg:grid grid-cols-3 gap-4">
                {panels.map((p, i) => (
                  <SmallCard
                    key={p.title}
                    title={p.title}
                    seq={p.seq}
                    accent={['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#0EA5E9', '#8B5CF6', '#10B981', '#F97316'][i % 8]}
                  />
                ))}
              </div>
            </>
          )}

          {/* Tab: JUMLAH (tight axis + YoY %) */}
          {tab === 'jumlah' && (
            <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white p-4">
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={totalSeriesEnhanced} margin={{ top: 12, right: 24, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                    <XAxis dataKey="tahun" tick={{ fontSize: 12 }} />
                    {/* Sumbu kiri: total (ketat) */}
                    <YAxis
                      yAxisId="left"
                      domain={tightDomain}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v: number) => v.toLocaleString('id-ID')}
                    />
                    {/* Sumbu kanan: YoY % */}
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                    />
                    <Tooltip
                      formatter={(v, name: string) =>
                        name.includes('%')
                          ? [`${Number(v).toFixed(2)}%`, 'Perubahan Per Tahun']
                          : [Number(v).toLocaleString('id-ID'), name]
                      }
                      labelFormatter={(l) => `Tahun ${l}`}
                    />
                    {/* Garis acuan baseline 2021 */}
                    <ReferenceLine yAxisId="left" y={totalSeriesEnhanced[0].nilai} stroke="#cbd5e1" strokeDasharray="4 4" />

                    {/* Batang YoY % (kanan) */}
                    <Bar yAxisId="right" dataKey="yoyPct" name="Perubahan Per Tahun (%)" fill="#a78bfa" radius={[6, 6, 0, 0]}>
                      <LabelList
                        dataKey="yoyPct"
                        position="top"
                        formatter={(v: number | null) => (v == null ? '' : `${v.toFixed(1)}%`)}
                        className="text-[11px]"
                      />
                    </Bar>

                    {/* Area + Line Total (kiri) */}
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="nilai"
                      name="Jumlah"
                      fill="#7dd3fc"
                      stroke="#0ea5e9"
                      strokeWidth={3}
                      fillOpacity={0.25}
                      dot={{ r: 4 }}
                    />

                    <Legend verticalAlign="top" iconType="circle" height={20} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Ringkasan angka */}
              <div className="mt-3 text-sm text-gray-700 flex flex-wrap gap-4 justify-center sm:justify-end">
                <span>2021: <strong>{totalSeriesEnhanced[0].nilai.toLocaleString('id-ID')}</strong></span>
                <span>2024: <strong>{totalSeriesEnhanced[totalSeriesEnhanced.length - 1].nilai.toLocaleString('id-ID')}</strong></span>
                <span className={`${(totalSeriesEnhanced[totalSeriesEnhanced.length - 1].nilai - totalSeriesEnhanced[0].nilai) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  Δ 2021→2024: <strong>
                    {(totalSeriesEnhanced[totalSeriesEnhanced.length - 1].nilai - totalSeriesEnhanced[0].nilai).toLocaleString('id-ID')}
                  </strong> (
                  <strong>
                    {(((totalSeriesEnhanced[totalSeriesEnhanced.length - 1].nilai - totalSeriesEnhanced[0].nilai) / totalSeriesEnhanced[0].nilai) * 100).toFixed(1)}%
                  </strong>)
                </span>
              </div>
            </div>
          )}

          <p className="mt-4 text-sm text-gray-600 text-center">
            Sumber: Badan Pusat Statistik, Survei Angkatan Kerja Nasional (Sakernas) Agustus
          </p>
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

export default KetenagakerjaanViz;
