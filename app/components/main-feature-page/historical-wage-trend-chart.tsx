/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format, parseISO } from 'date-fns';
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

const cleanData = (value: any): string => {
  if (typeof value !== 'string') return '';
  return value.replace(/\[\'|\'\]/g, '').trim();
};

const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

const addMonths = (date: Date, n: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + n, 1);

const colors = [
  '#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c', '#83a6ed', '#8dd1e1',
  '#ffbb28', '#ff8042', '#0088fe', '#00c49f', '#008080', '#800080', '#FF00FF',
  '#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00',
  '#cab2d6', '#6a3d9a', '#ffff99', '#b15928', '#c0c0c0', '#808080', '#00FFFF', '#FFFF00',
  '#FF4500', '#DA70D6', '#20B2AA', '#7B68EE', '#BDB76B', '#FFD700', '#ADFF2F', '#F08080'
];

const CustomXAxisTick = ({ x, y, payload }: any) => {
  const value = payload.value;
  const [monthAbbr, yearAbbr] = value.split(' ');
  const fullYear = `20${yearAbbr}`;
  const isYearStart = monthAbbr === 'Jan';
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill="#666" fontSize={9}>
        {monthAbbr}
      </text>
      {isYearStart && (
        <text x={0} y={0} dy={30} textAnchor="middle" fill="#333" fontSize={12} fontWeight="bold">
          {fullYear}
        </text>
      )}
    </g>
  );
};

const HistoricalJobDemandChart: React.FC<HistoricalJobDemandChartProps> = ({
  mainData,
  allJabatanOptions,
  selectedSector,
  chartTitle,
  startDateProp,
  endDateProp,
  selectedGajiFilter,
}) => {
  const [selectedJabatan, setSelectedJabatan] = useState<string[]>([]);

  const { aggregatedTrendData, jobPopularityMap } = useMemo(() => {
    const monthlyDataMap = new Map<string, Map<string, number>>();
    const tempJobPopularityMap = new Map<string, number>();

    const startDate = parseISO(startDateProp || '2022-01-01');
    const endDate = parseISO(endDateProp || '2025-06-30');

    mainData.forEach(item => {
      const tanggal = cleanData(item.TANGGAL_DAFTAR);
      const jabatan = cleanData(item.JABATAN_DIINGINKAN_Normalized);
      const upah = cleanData(item.UPAH_DIINGINKAN);

      const sectorJobs = sektorJabatanMap.find(s => s.sektor === selectedSector)?.jabatan || [];
      if (!tanggal || !jabatan || !sectorJobs.includes(jabatan.toLowerCase())) return;

      const date = parseISO(tanggal);
      if (date < startDate || date > endDate) return;
      if (selectedGajiFilter && selectedGajiFilter !== 'all' && upah !== selectedGajiFilter) return;

      const monthKey = format(date, 'yyyy-MM');
      if (!monthlyDataMap.has(monthKey)) monthlyDataMap.set(monthKey, new Map());
      const m = monthlyDataMap.get(monthKey)!;
      m.set(jabatan, (m.get(jabatan) || 0) + 1);
      tempJobPopularityMap.set(jabatan, (tempJobPopularityMap.get(jabatan) || 0) + 1);
    });

    const allMonths: string[] = [];
    let cursor = startDate;
    while (cursor <= endDate) {
      allMonths.push(format(cursor, 'yyyy-MM'));
      cursor = addMonths(cursor, 1);
    }
    for (let i = 1; i <= 12; i++) {
      allMonths.push(format(addMonths(endDate, i), 'yyyy-MM'));
    }

    const historicalPoints: any[] = [];
    allMonths.slice(0, allMonths.length - 12).forEach(monthKey => {
      const point: any = { name: format(parseISO(monthKey + '-01'), 'MMM yy') };
      const m = monthlyDataMap.get(monthKey);
      tempJobPopularityMap.forEach((_, jab) => {
        point[capitalizeWords(jab)] = m?.get(jab) ?? null;
      });
      historicalPoints.push(point);
    });

    const forecastPoints: any[] = [];
    tempJobPopularityMap.forEach((_, rawJab) => {
      const jab = capitalizeWords(rawJab);
      const x: number[] = [];
      const y: number[] = [];

      historicalPoints.forEach((p, idx) => {
        const val = p[jab];
        if (typeof val === 'number') {
          x.push(idx);
          y.push(val);
        }
      });

      if (x.length < 2) return;

      const regression = new SimpleLinearRegression(x, y);
      const lastIndex = historicalPoints.length - 1;

      for (let k = 1; k <= 12; k++) {
        const pred = regression.predict(lastIndex + k);
        const monthKey = allMonths[lastIndex + k];
        const name = format(parseISO(monthKey + '-01'), 'MMM yy');
        let point = forecastPoints[k - 1];
        if (!point) {
          point = { name };
          forecastPoints[k - 1] = point;
        }
        point[jab] = Math.max(0, Math.round(pred));
      }
    });

    const merged = [...historicalPoints, ...forecastPoints];
    return { aggregatedTrendData: merged, jobPopularityMap: tempJobPopularityMap };
  }, [mainData, selectedSector, startDateProp, endDateProp, selectedGajiFilter]);

  const sortedAllJabatanOptions = useMemo(() => {
    const active = Array.from(jobPopularityMap.keys());
    return [...allJabatanOptions]
      .filter(j => active.includes(j))
      .sort((a, b) => (jobPopularityMap.get(b) || 0) - (jobPopularityMap.get(a) || 0));
  }, [allJabatanOptions, jobPopularityMap]);

  useEffect(() => {
    setSelectedJabatan(sortedAllJabatanOptions.slice(0, 3));
  }, [sortedAllJabatanOptions]);

  const handleCheckboxChange = (jabatan: string, checked: boolean) => {
    if (checked) {
      setSelectedJabatan(prev => [...prev, jabatan]);
    } else {
      setSelectedJabatan(prev => prev.filter(j => j !== jabatan));
    }
  };

  const formatPeminat = (value: any) =>
    typeof value === 'number' && !isNaN(value) ? value.toLocaleString('id-ID') : '0';

  if (!selectedSector) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg text-center text-gray-600">
        Silakan pilih Sektor Pekerjaan terlebih dahulu di atas untuk melihat tren peminat jabatan.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        {chartTitle || `Tren Peminat Jabatan di Sektor "${selectedSector}"`}
      </h3>

      <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6 max-h-64 overflow-y-auto pr-4 border-b pb-4">
        <p className="font-semibold text-gray-700 w-full">
          Pilih Jabatan (dalam sektor "{selectedSector}"):
        </p>
        {sortedAllJabatanOptions.length > 0 ? (
          sortedAllJabatanOptions.map(jabatan => {
            const colorIndex = allJabatanOptions.indexOf(jabatan);
            const color = colors[colorIndex % colors.length];
            return (
              <div key={jabatan} className="flex items-center space-x-2">
                <Checkbox
                  id={`checkbox-${jabatan}`}
                  checked={selectedJabatan.includes(jabatan)}
                  onCheckedChange={checked => handleCheckboxChange(jabatan, Boolean(checked))}
                />
                <Label
                  htmlFor={`checkbox-${jabatan}`}
                  className="flex items-center text-sm font-medium capitalize"
                >
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: color }}
                  />
                  {capitalizeWords(jabatan)}
                </Label>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-sm">
            Tidak ada jabatan yang relevan atau data tren tersedia untuk sektor dan filter yang dipilih.
          </p>
        )}
      </div>

      {aggregatedTrendData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={aggregatedTrendData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={CustomXAxisTick}
              interval="preserveStartEnd"
              height={60}
            />
            <YAxis
              tickFormatter={formatPeminat}
              label={{ value: 'Jumlah Peminat', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value, name) => [`${formatPeminat(value)} Peminat`, name]}
              labelFormatter={label => `Periode: ${label}`}
            />
            {selectedJabatan.map(jabatan => {
              const colorIndex = allJabatanOptions.indexOf(jabatan);
              const color = colors[colorIndex % colors.length];
              const dataKey = capitalizeWords(jabatan);
              return (
                <Line
                  key={jabatan}
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2}
                  strokeDasharray={
                    (dataKey.includes('26') ||
                      (dataKey.includes('25') && ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].some(m => dataKey.includes(m))))
                      ? '5 5'
                      : undefined
                  }
                  dot={false}
                  activeDot={{ r: 6 }}
                  name={capitalizeWords(jabatan)}
                  connectNulls
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          Tidak ada data tren peminat yang tersedia untuk sektor dan jabatan yang dipilih. Coba sesuaikan filter Anda.
        </div>
      )}
    </div>
  );
};

export default HistoricalJobDemandChart;