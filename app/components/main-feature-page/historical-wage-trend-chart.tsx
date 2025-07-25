/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceArea
} from 'recharts';
import { Checkbox } from "@/components/ui/checkbox";
import { Label }    from "@/components/ui/label";
import { Button } from "@/components/ui/button"; // Import Button component
import { format, parseISO, getYear } from 'date-fns';
import { SimpleLinearRegression } from 'ml-regression';
import { sektorJabatanMap } from './sektor-jabatan-map';

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
  const [yearColors, setYearColors] = useState<Map<number, string>>(new Map());

  const generateYearColors = (startYear: number, endYear: number) => {
    const colorsMap = new Map<number, string>();
    const predefinedColors = [
      '#e0f2fe', '#ffe0b2', '#c8e6c9', '#ffccbc', '#d1c4e9', '#bbdefb', '#ffecb3', '#a7ffeb'
    ]; // Contoh warna yang lebih lembut
    let colorIndex = 0;
    for (let year = startYear; year <= endYear; year++) {
      colorsMap.set(year, predefinedColors[colorIndex % predefinedColors.length]);
      colorIndex++;
    }
    return colorsMap;
  };

  const { aggregatedTrendData, sortedAllJabatanOptions, historicalStartYear, historicalEndYear } = useMemo(() => {
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
    for(let i=1;i<=12;i++) allMonths.push(format(addMonths(end,i),'yyyy-MM'));

    // 3) Bentuk data historis
    const historical:any[] = [];
    allMonths.slice(0,allMonths.length-12).forEach(mk=>{
      const o:any = { name: format(parseISO(mk+'-01'),'MMM yy') };
      const mm = monthly.get(mk);
      popMap.forEach((_,jr)=>{
        o[capitalizeWords(jr)] = mm?.get(jr) ?? null;
      });
      historical.push(o);
    });

    // Tentukan tahun awal dan akhir data historis
    const histStartYear = historical.length > 0 ? getYear(parseISO(allMonths[0]+'-01')) : 0;
    const histEndYear = historical.length > 0 ? getYear(parseISO(allMonths[historical.length - 1]+'-01')) : 0;

    // 4) Forecast: **Dynamic Sliding‐Window Linear Regression**
    const forecast:any[] = [];
    popMap.forEach((_, jrRaw) => {
      const jab = capitalizeWords(jrRaw);
      // Kumpulkan titik
      const xs:number[] = [], ys:number[] = [];
      historical.forEach((pt,idx)=>{
        const v = pt[jab];
        if (typeof v==='number') { xs.push(idx); ys.push(v); }
      });
      if (xs.length<3) return;

      const lastIdx = xs.length - 1;
      // Untuk tiap bulan k, fitting ulang model di window yang berubah
      for(let k=1;k<=12;k++){
        // Tentukan window size (misal bertambah seiring k)
        const windowSize = 3 + k;           // dari 4 bulan ke 15 bulan
        const startW     = Math.max(0, xs.length - windowSize);
        const xWin       = xs.slice(startW);
        const yWin       = ys.slice(startW);

        // Fit regresi linier
        const reg = new SimpleLinearRegression(xWin, yWin);
        const idxPred = lastIdx + k;
        const pred    = reg.predict(idxPred);

        // Simpan ke forecast
        const mkPred = allMonths[historical.length + (k-1)];
        const label  = format(parseISO(mkPred+'-01'),'MMM yy');
        if (!forecast[k-1]) forecast[k-1] = { name: label };
        forecast[k-1][jab] = Math.max(0, Math.round(pred));
      }
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
      historicalStartYear: histStartYear,
      historicalEndYear: histEndYear
    };
  }, [mainData, selectedSector, startDateProp, endDateProp, selectedGajiFilter]);

  // Pilih 3 teratas
  useEffect(()=>{
    setSelectedJabatan(sortedAllJabatanOptions.slice(0,3));
    if (historicalStartYear && historicalEndYear) {
      setYearColors(generateYearColors(historicalStartYear, historicalEndYear));
    }
  },[sortedAllJabatanOptions, historicalStartYear, historicalEndYear]);

  const handleSelectAll = () => {
    setSelectedJabatan(sortedAllJabatanOptions);
  };

  const handleResetSelection = () => {
    setSelectedJabatan([]);
  };

  const formatP = (v:any) =>
    typeof v==='number'&&!isNaN(v) ? v.toLocaleString('id-ID') : '0';

  if (!selectedSector) {
    return <div className="bg-white p-6 rounded-lg shadow-lg text-center text-gray-600">
      Silakan pilih Sektor Pekerjaan terlebih dahulu.
    </div>;
  }

  // Mendapatkan rentang bulan untuk zona prediksi
  const predictionZoneStartMonth = aggregatedTrendData.length > 0 ? aggregatedTrendData[aggregatedTrendData.length - 12]?.name : '';
  const predictionZoneEndMonth = aggregatedTrendData.length > 0 ? aggregatedTrendData[aggregatedTrendData.length - 1]?.name : '';


  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        {chartTitle||`Tren Peminat Jabatan di Sektor \"${selectedSector}\"`}
      </h3>
      <div className="flex flex-wrap gap-x-6 gap-y-3 mb-4 max-h-48 overflow-y-auto pr-4 border-b pb-4">
        <p className="font-semibold w-full">Pilih Jabatan:</p>
        <div className="flex space-x-4 mb-2 w-full">
          <Button onClick={handleSelectAll} variant="outline" size="sm">Pilih Semua</Button>
          <Button onClick={handleResetSelection} variant="outline" size="sm">Reset</Button>
        </div>
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
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={aggregatedTrendData} margin={{top:10, right:30, left:20, bottom:5}}>
            {/* ReferenceArea untuk setiap tahun historis */}
            {[...Array(historicalEndYear - historicalStartYear + 1)].map((_, i) => {
              const year = historicalStartYear + i;
              const firstMonthOfYear = aggregatedTrendData.find(item => item.name.endsWith(`${year % 100}`));
              const lastMonthOfYear = aggregatedTrendData.slice().reverse().find(item => item.name.endsWith(`${year % 100}`));

              if (!firstMonthOfYear || !lastMonthOfYear) return null;

              // Pastikan rentang area tidak tumpang tindih dengan zona prediksi
              const x2Value = year === historicalEndYear ? format(parseISO(endDateProp || '2025-06-30'), 'MMM yy') : lastMonthOfYear.name;

              return (
                <ReferenceArea
                  key={`year-area-${year}`}
                  x1={firstMonthOfYear.name}
                  x2={x2Value}
                  y1={0}
                  fill={yearColors.get(year)}
                  fillOpacity={0.3}
                  label={{
                    value: `${year}`,
                    position: "insideTopLeft",
                    fill: "#333", // Warna teks lebih netral
                    fontSize: 12,
                    fontWeight: "bold"
                  }}
                />
              );
            })}

            {/* Zona Prediksi */}
            {predictionZoneStartMonth && predictionZoneEndMonth && (
              <ReferenceArea
                x1={predictionZoneStartMonth}
                x2={predictionZoneEndMonth}
                y1={0}
                fill="#fef3c7" // Tetap kuning untuk zona prediksi
                fillOpacity={0.4}
                label={{value:"Zona Prediksi",position:"insideTopLeft",
                  fill:"#f59e0b",fontSize:12,fontWeight:"bold"}}
              />
            )}

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
              // Hapus fungsi isPred karena tidak lagi diperlukan untuk strokeDasharray
              // const isPred = (name:string) => {
              //   const parts = name.split(' ');
              //   if (parts.length === 2) {
              //     const year = parseInt(parts[1], 10);
              //     const month = parts[0];
              //     if (year === 25 && (month === 'Jul' || month === 'Aug' || month === 'Sep' || month === 'Oct' || month === 'Nov' || month === 'Dec')) {
              //       return true;
              //     }
              //     if (year === 26) {
              //       return true;
              //     }
              //   }
              //   return false;
              // };

              return (
                <Line
                  key={jab}
                  type="monotone"
                  dataKey={jab}
                  stroke={clr}
                  strokeWidth={2}
                  // Hapus properti strokeDasharray
                  // strokeDasharray={
                  //   (aggregatedTrendData.some(dataPoint => isPred(dataPoint.name) && dataPoint[jab] !== null)) ? '5 5' : undefined
                  // }
                  dot={false}
                  activeDot={{r:6}}
                  connectNulls
                  name={jab}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          Tidak ada data tren untuk pilihan ini.
        </div>
      )}
    </div>
  );
};

export default HistoricalJobDemandChart;