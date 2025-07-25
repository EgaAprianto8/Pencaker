/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceArea
} from 'recharts';
import { Checkbox } from "@/components/ui/checkbox";
import { Label }    from "@/components/ui/label";
import { format, parseISO } from 'date-fns';
import { SimpleLinearRegression } from 'ml-regression';
import { sektorJabatanMap } from './sektor-jabatan-map';
import { Button } from '@/components/ui/button'; // Import Button component

interface HistoricalJobDemandChartProps {
  mainData: DataItem[];
  allJabatanOptions: string[];
  selectedSector: string | null;
  chartTitle?: string;
  startDateProp?: string;
  endDateProp?: string;
  selectedGajiFilter: string | null;
  selectedPendidikanFilter?: string;
}

type DataItem = {
  original_index: string;
  TGL_LAHIR: string;
  JENIS_KELAMIN: string;
  TANGGAL_DAFTAR: string;
  KECAMATAN: string;
  PENDIDIKAN: string;
  JURUSAN: string;
  TAHUN_LULUS: string;
  Keterampilan: string;
  UPAH_DIINGINKAN: string;
  JABATAN_DIINGINKAN: string;
  WILAYAH_DIINGINKAN: string;
  WILAYAH_DIINGINKAN_DETAIL: string;
  UMUR_SAAT_DAFTAR: string;
  JABATAN_DIINGINKAN_Normalized: string;
  wilayah_diinginkan_detail_normalized: string;
  keterampilan_cleaned: string;
};  

// Utility
const cleanData = (v:any) =>
  typeof v==='string' ? v.replace(/\[\'|\'\]/g,'').trim() : '';
const capitalizeWords = (s:string) =>
  s ? s.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()) : '';
const addMonths = (d:Date,n:number)=>
  new Date(d.getFullYear(),d.getMonth()+n,1);

const colors = [
  '#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c', '#83a6ed', '#8dd1e1',
  '#ffbb28', '#ff8042', '#0088fe', '#00c49f', '#008080', '#800080', '#FF00FF',
  '#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00',
  '#cab2d6', '#6a3d9a', '#ffff99', '#b15928', '#c0c0c0', '#808080', '#00FFFF', '#FFFF00',
  '#FF4500', '#DA70D6', '#20B2AA', '#7B68EE', '#BDB76B', '#FFD700', '#ADFF2F', '#F08080'
];  

const CustomXAxisTick = ({ x,y,payload }:any) => {
  const [m,y2] = payload.value.split(' ');
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fontSize={9} fill="#666">{m}</text>
      {m==='Jan' && (
        <text x={0} y={0} dy={30} textAnchor="middle"
          fontSize={12} fontWeight="bold" fill="#333">
          {`20${y2}`}
        </text>
      )}
    </g>
  );
};

const HistoricalJobDemandChart: React.FC<HistoricalJobDemandChartProps> = ({
  mainData, allJabatanOptions, selectedSector,
  chartTitle, startDateProp, endDateProp, selectedGajiFilter,
}) => {
  const [selectedJabatan, setSelectedJabatan] = useState<string[]>([]);

  const { aggregatedTrendData, sortedAllJabatanOptions } = useMemo(() => {
    // 1) Agregasi historis
    const monthly = new Map<string,Map<string,number>>();
    const popMap  = new Map<string,number>();
    const start   = parseISO(startDateProp || '2022-01-01');
    const end     = parseISO(endDateProp   || '2025-06-30');

    mainData.forEach(item => {
      const t = cleanData(item.TANGGAL_DAFTAR);
      const j = cleanData(item.JABATAN_DIINGINKAN_Normalized);
      const u = cleanData(item.UPAH_DIINGINKAN);
      const jobs = sektorJabatanMap.find(s=>s.sektor===selectedSector)?.jabatan||[];

      if (!t||!j||!jobs.includes(j.toLowerCase())) return;
      const d = parseISO(t);
      if (d<start||d>end) return;
      if (selectedGajiFilter!=='all' && selectedGajiFilter && u!==selectedGajiFilter) return;

      const mk = format(d,'yyyy-MM');
      if (!monthly.has(mk)) monthly.set(mk,new Map());
      const m = monthly.get(mk)!;
      m.set(j,(m.get(j)||0)+1);
      popMap.set(j,(popMap.get(j)||0)+1);
    });

    // 2) Build list bulan (historis + 12 prediksi)
    const allMonths:string[] = [];
    let cur = start;
    while(cur<=end){
      allMonths.push(format(cur,'yyyy-MM'));
      cur = addMonths(cur,1);
    }
    // Tambahkan bulan prediksi hingga 12 bulan setelah endDateProp
    const lastHistoricalMonthDate = parseISO(format(end, 'yyyy-MM') + '-01');
    for (let i = 1; i <= 12; i++) {
        allMonths.push(format(addMonths(lastHistoricalMonthDate, i), 'yyyy-MM'));
    }

    // 3) Bentuk data historis
    const historical:any[] = [];
    // Batasi historical data hanya sampai bulan terakhir dari mainData yang relevan
    const relevantHistoricalMonths = allMonths.filter(mk => parseISO(mk + '-01') <= end);
    relevantHistoricalMonths.forEach(mk=>{
      const o:any = { name: format(parseISO(mk+'-01'),'MMM yy') };
      const mm = monthly.get(mk);
      popMap.forEach((_,jrRaw)=>{ // Iterasi melalui semua jabatan yang muncul
        const jr = jrRaw.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(); // sanitize for object keys
        // MODIFIKASI: Gunakan 0 jika tidak ada data untuk bulan tersebut
        o[capitalizeWords(jrRaw)] = mm?.get(jrRaw) ?? 0; // Mengubah null menjadi 0
      });
      historical.push(o);
    });

    // 4) Forecast: **Dynamic Sliding‐Window Linear Regression**
    const forecast:any[] = [];
    // Ambil bulan-bulan yang hanya untuk prediksi (setelah endDateProp)
    const forecastMonths = allMonths.filter(mk => parseISO(mk + '-01') > end);
    
    popMap.forEach((_, jrRaw) => {
        const jabKey = capitalizeWords(jrRaw); // Use capitalized name for dataKey in chart
        const xs: number[] = [];
        const ys: number[] = [];

        historical.forEach((pt, idx) => {
            const v = pt[jabKey];
            // MODIFIKASI: Pastikan hanya nilai angka yang dimasukkan ke regresi.
            // Jika kita sudah memastikan 0, ini tidak terlalu krusial tapi baik untuk konsistensi.
            if (typeof v === 'number' && !isNaN(v)) { 
                xs.push(idx);
                ys.push(v);
            }
        });

        // Hanya lakukan forecast jika ada cukup data historis (misal minimal 3 titik)
        if (xs.length < 3) return;

        const lastHistoricalIndex = historical.length -1; // Indeks terakhir dari data historis

        forecastMonths.forEach((mkPred, kIdx) => { // kIdx = 0, 1, 2... for the 1st, 2nd, 3rd forecast month
            const monthLabel = format(parseISO(mkPred + '-01'), 'MMM yy');
            
            // Indeks untuk prediksi: dimulai dari 1 setelah lastHistoricalIndex
            const indexForPrediction = lastHistoricalIndex + 1 + kIdx;

            // Tentukan window size untuk regresi. Bisa progresif atau tetap.
            // Contoh: window size dari 3 bulan hingga 15 bulan terakhir yang valid
            const windowSize = Math.min(xs.length, 3 + kIdx); // Pastikan window tidak lebih besar dari data yang ada
            const startW = Math.max(0, xs.length - windowSize);
            const xWin = xs.slice(startW);
            const yWin = ys.slice(startW);

            // Jika window tidak memiliki cukup data, jangan melakukan prediksi
            if (xWin.length < 2) return; // Minimal 2 titik untuk regresi linear

            try {
                const reg = new SimpleLinearRegression(xWin, yWin);
                const pred = reg.predict(indexForPrediction);
                
                if (!forecast[kIdx]) forecast[kIdx] = { name: monthLabel };
                forecast[kIdx][jabKey] = Math.max(0, Math.round(pred)); // Pastikan nilai tidak negatif
            } catch (e) {
                console.warn(`Could not compute regression for ${jabKey} at ${monthLabel}:`, e);
                if (!forecast[kIdx]) forecast[kIdx] = { name: monthLabel };
                forecast[kIdx][jabKey] = null; // Set to null if prediction fails, agar tidak mengganggu garis jika ada error
            }
        });
    });

    // 5) Urutkan opsi jabatan
    const sorted = Array.from(popMap.keys())
      .map(jr=>capitalizeWords(jr))
      .sort((a,b)=>{
        const pa = popMap.get(a.toLowerCase())||0;
        const pb = popMap.get(b.toLowerCase())||0;
        return pb-pa;
      });

    return {
      aggregatedTrendData: [...historical, ...forecast],
      sortedAllJabatanOptions: sorted,
    };
  }, [mainData, selectedSector, startDateProp, endDateProp, selectedGajiFilter]);

  // Pilih 3 teratas
  useEffect(()=>{
    setSelectedJabatan(sortedAllJabatanOptions.slice(0,3));
  },[sortedAllJabatanOptions]);

  const formatP = (v:any) =>
    typeof v==='number'&&!isNaN(v) ? v.toLocaleString('id-ID') : '0';

  if (!selectedSector) {
    return <div className="bg-white p-6 rounded-lg shadow-lg text-center text-gray-600">
      Silakan pilih Sektor Pekerjaan terlebih dahulu.
    </div>;
  }

  // MODIFIKASI: Handler untuk tombol Pilih Semua
  const handleSelectAll = () => {
    setSelectedJabatan(sortedAllJabatanOptions);
  };

  // MODIFIKASI: Handler untuk tombol Reset
  const handleResetSelection = () => {
    setSelectedJabatan([]);
  };

  // Tentukan lebar minimum chart untuk memungkinkan scroll pada layar kecil
  // Anda bisa menyesuaikan nilai ini (misalnya 800 atau 1000) tergantung seberapa panjang data X-axis Anda
  const minChartWidth = 800; 

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        {chartTitle||`Tren Peminat Jabatan di Sektor \"${selectedSector}\"`}
      </h3>
      {/* MODIFIKASI: Tambahkan div untuk tombol Pilih Semua dan Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-3 mb-4">
        <p className="font-semibold">Pilih Jabatan:</p>
        <div className="flex gap-2">
            <Button onClick={handleSelectAll} variant="outline" size="sm">Pilih Semua</Button>
            <Button onClick={handleResetSelection} variant="outline" size="sm">Reset</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6 max-h-48 overflow-y-auto pr-4 border-b pb-4">
        {sortedAllJabatanOptions.map(jab=> {
          const idx = allJabatanOptions.indexOf(jab.toLowerCase());
          const clr = colors[idx%colors.length];
          return (
            <div key={jab} className="flex items-center space-x-2">
              <Checkbox
                id={`cb-${jab}`}
                checked={selectedJabatan.includes(jab)}
                onCheckedChange={c=>setSelectedJabatan(prev=>
                  c?[...prev,jab]:prev.filter(x=>x!==jab)
                )}
              />
              <Label htmlFor={`cb-${jab}`} className="flex items-center capitalize text-sm">
                <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor:clr}}/>
                {jab}
              </Label>
            </div>
          );
        })}
      </div>
      {aggregatedTrendData.length>0 ? (
        // Wrapper div for horizontal scroll on small screens
        <div className="overflow-x-auto lg:overflow-x-visible">
            <ResponsiveContainer 
                width="100%" // Akan mengambil 100% dari parent div (overflow-x-auto)
                minWidth={minChartWidth} // Ini yang memaksa lebar minimum agar bisa di-scroll
                height={400}
            >
              <LineChart data={aggregatedTrendData} margin={{top:10, right:30, left:20, bottom:5}}>
                {/* MODIFIKASI: ReferenceArea untuk setiap tahun historis */}
                <ReferenceArea 
                  x1="Jan 22" x2="Dec 22" y1={0} 
                  fill="#E0F7FA" fillOpacity={0.3} // Light Cyan
                  label={{value:"2022",position:"insideTopLeft", fill:"#00BCD4",fontSize:12,fontWeight:"bold"}}
                />
                <ReferenceArea 
                  x1="Jan 23" x2="Dec 23" y1={0} 
                  fill="#FFF3E0" fillOpacity={0.3} // Light Orange
                  label={{value:"2023",position:"insideTopLeft", fill:"#FF9800",fontSize:12,fontWeight:"bold"}}
                />
                <ReferenceArea 
                  x1="Jan 24" x2="Dec 24" y1={0} 
                  fill="#E8F5E9" fillOpacity={0.3} // Light Green
                  label={{value:"2024",position:"insideTopLeft", fill:"#4CAF50",fontSize:12,fontWeight:"bold"}}
                />
                <ReferenceArea 
                  x1="Jan 25" x2="Jun 25" y1={0} // Historis 2025 hanya sampai Juni
                  fill="#F3E5F5" fillOpacity={0.3} // Light Purple
                  label={{value:"2025",position:"insideTopLeft", fill:"#9C27B0",fontSize:12,fontWeight:"bold"}}
                />
                
                {/* Zona Prediksi tetap tidak berubah */}
                <ReferenceArea
                  x1="Jul 25" x2="Jun 26" y1={0}
                  fill="#fef3c7" fillOpacity={0.4}
                  label={{value:"Zona Prediksi",position:"insideTopLeft",
                          fill:"#f59e0b",fontSize:12,fontWeight:"bold"}}
                />
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="name" tick={CustomXAxisTick} interval="preserveStartEnd" height={60}/>
                <YAxis tickFormatter={formatP} label={{value:'Jumlah Peminat',angle:-90,position:'insideLeft'}}/>
                <Tooltip
                  formatter={(v,k)=>[`${formatP(v)} Peminat`,k]}
                  labelFormatter={l=>`Periode: ${l}`}
                />
                {selectedJabatan.map(jab=>{
                  const idx = allJabatanOptions.indexOf(jab.toLowerCase());
                  const clr = colors[idx%colors.length];
                  // Asumsi: data `name` di `aggregatedTrendData` berbentuk "MMM yy".
                  // "Jul 25" adalah batas awal prediksi
                  const isPred = (nm:string) => {
                    const [monthStr, yearStr] = nm.split(' ');
                    const monthIndex = new Date(Date.parse(`${monthStr} 1, 2000`)).getMonth();
                    const yearFull = parseInt(`20${yearStr}`, 10);
                    // Hitung tanggal 1 Juli 2025
                    const July2025 = new Date(2025, 6, 1); // Month is 0-indexed
                    const currentPointDate = new Date(yearFull, monthIndex, 1);
                    return currentPointDate >= July2025;
                  };

                  return (
                    <Line
                      key={jab}
                      type="monotone"
                      dataKey={jab}
                      stroke={clr}
                      strokeWidth={2}
                      // strokeDasharray akan aktif jika titik data berada di zona prediksi
                      // Catatan: Ini akan membuat seluruh garis putus-putus jika ada satu saja titik prediksi
                      // Untuk perilaku garis putus-putus hanya di zona prediksi, diperlukan data dan/atau komponen Line terpisah.
                      strokeDasharray={aggregatedTrendData.some(d => d.name === format(parseISO(startDateProp || '2022-01-01'), 'MMM yy') && isPred(d.name)) ? '5 5' : undefined}
                      dot={false}
                      activeDot={{r:6}}
                      connectNulls // Tetap menggunakan connectNulls karena sekarang 0 akan eksplisit
                      name={jab}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          Tidak ada data tren untuk pilihan ini.
        </div>
      )}
    </div>
  );
};

export default HistoricalJobDemandChart;