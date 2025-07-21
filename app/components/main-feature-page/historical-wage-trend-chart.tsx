// components/ui/historical-wage-trend-chart.tsx
// (Direkomendasikan ganti nama menjadi historical-job-demand-chart.tsx)
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format, parseISO } from 'date-fns';

import { sektorJabatanMap } from './sektor-jabatan-map';


// Tipe Data Utama (sama seperti DataItem di MainFeature.tsx)
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
    UPAH_DIINGINKAN: string; // Akan digunakan untuk filter
    JABATAN_DIINGINKAN: string;
    WILAYAH_DIINGINKAN: string;
    WILAYAH_DIINGINKAN_DETAIL: string;
    UMUR_SAAT_DAFTAR: string;
    JABATAN_DIINGINKAN_Normalized: string;
    wilayah_diinginkan_detail_normalized: string;
    keterampilan_cleaned: string;
};

// Fungsi helper untuk membersihkan data (sama seperti di MainFeature.tsx)
const cleanData = (value: any): string => {
    if (typeof value !== 'string') return '';
    return value.replace(/\[\'|\'\]/g, '').trim();
};

const capitalizeWords = (str: string): string => {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c', '#83a6ed', '#8dd1e1',
    '#ffbb28', '#ff8042', '#0088fe', '#00c49f', '#008080', '#800080', '#FF00FF',
    '#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00',
    '#cab2d6', '#6a3d9a', '#ffff99', '#b15928', '#c0c0c0', '#808080', '#00FFFF', '#FFFF00',
    '#FF4500', '#DA70D6', '#20B2AA', '#7B68EE', '#BDB76B', '#FFD700', '#ADFF2F', '#F08080'
];

// PERUBAHAN DI SINI: Komponen kustom untuk tick sumbu X
const CustomXAxisTick = ({ x, y, payload }: any) => {
    const value = payload.value; // Contoh: "Jan 22"
    const [monthAbbr, yearAbbr] = value.split(' ');
    const fullYear = `20${yearAbbr}`; // Asumsi tahun 20xx

    // Tentukan apakah ini Januari (awal tahun)
    const isYearStart = monthAbbr === 'Jan';

    return (
        <g transform={`translate(${x},${y})`}>
            {/* Label Bulan (selalu ada, lebih kecil) */}
            <text x={0} y={0} dy={16} textAnchor="middle" fill="#666" fontSize={9}>
                {monthAbbr}
            </text>
            {/* Label Tahun (hanya untuk Januari, lebih besar) */}
            {isYearStart && ( // <-- KONDISI DIUBAH DARI `(isYearStart || isMidYear)` MENJADI HANYA `isYearStart`
                <text x={0} y={0} dy={30} textAnchor="middle" fill="#333" fontSize={12} fontWeight="bold">
                    {fullYear}
                </text>
            )}
        </g>
    );
};
// AKHIR PERUBAHAN


const HistoricalJobDemandChart: React.FC<HistoricalJobDemandChartProps> = ({ mainData, allJabatanOptions, selectedSector, chartTitle, startDateProp, endDateProp, selectedGajiFilter }) => {
    const [selectedJabatan, setSelectedJabatan] = useState<string[]>([]);

    // Agregasi data dan perhitungan popularitas
    const { aggregatedTrendData, jobPopularityMap } = useMemo(() => {
        const monthlyDataMap = new Map<string, Map<string, number>>();
        const tempJobPopularityMap = new Map<string, number>();

        const startDate = parseISO(startDateProp || '2022-01-01');
        const endDate = parseISO(endDateProp || '2025-06-30');

        mainData.forEach(item => {
            const tanggalDaftarStr = cleanData(item.TANGGAL_DAFTAR);
            const jabatanNormalizedStr = cleanData(item.JABATAN_DIINGINKAN_Normalized);
            const upahDiinginkanItem = cleanData(item.UPAH_DIINGINKAN);

            const relevantJabatansForSector = sektorJabatanMap.find(s => s.sektor === selectedSector)?.jabatan || [];

            // Filter utama: sektor, jabatan valid, dan rentang tanggal
            if (!tanggalDaftarStr || jabatanNormalizedStr === '' || jabatanNormalizedStr === '[]' ||
                !relevantJabatansForSector.includes(jabatanNormalizedStr.toLowerCase())) {
                return;
            }
            const date = parseISO(tanggalDaftarStr);
            if (date < startDate || date > endDate) return;

            // Filter tambahan berdasarkan selectedGajiFilter
            if (selectedGajiFilter && selectedGajiFilter !== 'all' && upahDiinginkanItem !== selectedGajiFilter) {
                return;
            }

            const monthKey = format(date, 'yyyy-MM');

            if (!monthlyDataMap.has(monthKey)) {
                monthlyDataMap.set(monthKey, new Map<string, number>());
            }
            const monthlyPeminatMap = monthlyDataMap.get(monthKey)!;

            monthlyPeminatMap.set(jabatanNormalizedStr, (monthlyPeminatMap.get(jabatanNormalizedStr) || 0) + 1);
            
            tempJobPopularityMap.set(jabatanNormalizedStr, (tempJobPopularityMap.get(jabatanNormalizedStr) || 0) + 1);
        });

        const allMonths: string[] = [];
        let currentDate = startDate;
        while (currentDate <= endDate) {
            allMonths.push(format(currentDate, 'yyyy-MM'));
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        }

        const result: { [key: string]: string | number | null }[] = [];
        allMonths.forEach(monthKey => {
            const dataPoint: { [key: string]: string | number | null } = {
                name: format(parseISO(monthKey + '-01'), 'MMM yy')
            };
            const monthlyPeminatMap = monthlyDataMap.get(monthKey);

            Array.from(tempJobPopularityMap.keys()).forEach(jabatan => {
                const formattedJabatan = capitalizeWords(jabatan);
                if (monthlyPeminatMap && monthlyPeminatMap.has(jabatan)) {
                    dataPoint[formattedJabatan] = monthlyPeminatMap.get(jabatan)!;
                } else {
                    dataPoint[formattedJabatan] = null;
                }
            });
            result.push(dataPoint);
        });

        return { aggregatedTrendData: result, jobPopularityMap: tempJobPopularityMap };
    }, [mainData, selectedSector, startDateProp, endDateProp, selectedGajiFilter]);

    // Filter allJabatanOptions untuk hanya menyertakan jabatan yang memiliki data (ada di jobPopularityMap)
    const sortedAllJabatanOptions = useMemo(() => {
        const activeJobsInCurrentFilter = Array.from(jobPopularityMap.keys()); // Jabatan yang memiliki data peminat untuk filter saat ini

        return [...allJabatanOptions] // allJabatanOptions dari MainFeature (sudah difilter per sektor)
               .filter(jabatan => activeJobsInCurrentFilter.includes(jabatan)) // HANYA sertakan jabatan yang ada datanya
               .sort((a, b) => {
                   const popA = jobPopularityMap.get(a) || 0;
                   const popB = jobPopularityMap.get(b) || 0;
                   return popB - popA; // Urutkan berdasarkan popularitas (terbanyak ke terkecil)
               });
    }, [allJabatanOptions, jobPopularityMap]);


    // Inisialisasi selectedJabatan dengan top 3 jabatan terpopuler (yang sudah difilter)
    useEffect(() => {
        if (sortedAllJabatanOptions.length > 0) {
            setSelectedJabatan(sortedAllJabatanOptions.slice(0, 3));
        } else {
            setSelectedJabatan([]);
        }
    }, [sortedAllJabatanOptions]);

    const handleCheckboxChange = (jabatan: string, checked: boolean) => {
        if (checked) {
            setSelectedJabatan(prev => [...prev, jabatan]);
        } else {
            setSelectedJabatan(prev => prev.filter(j => j !== jabatan));
        }
    };

    const formatPeminat = (value: number | string | undefined): string => {
        if (typeof value !== 'number' || isNaN(value)) return '0';
        return value.toLocaleString('id-ID');
    };

    // xAxisTickFormatter dihilangkan karena diganti dengan komponen CustomXAxisTick
    // const xAxisTickFormatter = (value: string) => {
    //     const monthAbbr = value.substring(0, 3);
    //     if (['Jan', 'Jun', 'Jul', 'Des'].includes(monthAbbr)) {
    //         return value;
    //     }
    //     return '';
    // };

    // Tampilkan pesan jika belum ada sektor yang dipilih
    if (!selectedSector) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-lg text-center text-gray-600">
                Silakan pilih Sektor Pekerjaan terlebih dahulu di atas untuk melihat tren peminat jabatan.
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{chartTitle || `Tren Peminat Jabatan di Sektor "${selectedSector}"`}</h3>

            <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6 max-h-64 overflow-y-auto pr-4 border-b pb-4">
                <p className="font-semibold text-gray-700 w-full">Pilih Jabatan (dalam sektor "{selectedSector}"):</p>
                {sortedAllJabatanOptions.length > 0 ? (
                        sortedAllJabatanOptions.map((jabatan) => { // 'index' tidak lagi diperlukan untuk warna
                            // Gunakan allJabatanOptions.indexOf untuk konsistensi warna
                            const consistentColorIndex = allJabatanOptions.indexOf(jabatan);
                            const color = colors[consistentColorIndex % colors.length];
                            return (
                                <div key={jabatan} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`checkbox-jabatan-${jabatan}`}
                                        checked={selectedJabatan.includes(jabatan)}
                                        onCheckedChange={(checked) => handleCheckboxChange(jabatan, Boolean(checked))}
                                    />
                                    <Label htmlFor={`checkbox-jabatan-${jabatan}`} className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize">
                                        <span style={{ backgroundColor: color }} className="w-3 h-3 rounded-full mr-2 inline-block"></span>
                                        {capitalizeWords(jabatan)}
                                    </Label>
                                </div>
                            );
                        })
                ) : (
                    <p className="text-gray-500 text-sm">Tidak ada jabatan yang relevan atau data tren tersedia untuk sektor dan filter yang dipilih.</p>
                )}
            </div>

            {aggregatedTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={aggregatedTrendData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        {/* Gunakan komponen CustomXAxisTick */}
                        <XAxis
                            dataKey="name"
                            tick={CustomXAxisTick} // Menggunakan komponen kustom
                            interval="preserveStartEnd"
                            height={60} // Menyesuaikan tinggi sumbu X untuk dua baris teks
                        />
                        <YAxis tickFormatter={(value) => formatPeminat(value as number)} label={{ value: 'Jumlah Peminat', angle: -90, position: 'insideLeft' }} />
                        <Tooltip
                            formatter={(value, name) => [`${formatPeminat(value as number)} Peminat`, name]}
                            labelFormatter={(label) => `Periode: ${label}`}
                        />
                        {selectedJabatan.map((jabatan) => {
                            // Gunakan allJabatanOptions.indexOf untuk konsistensi warna
                            const consistentColorIndex = allJabatanOptions.indexOf(jabatan);
                            const color = colors[consistentColorIndex % colors.length];
                            const dataKey = capitalizeWords(jabatan);

                            return (
                                <Line
                                    key={jabatan}
                                    type="monotone"
                                    dataKey={dataKey}
                                    stroke={color}
                                    activeDot={{ r: 8 }}
                                    name={capitalizeWords(jabatan)}
                                    connectNulls={true}
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