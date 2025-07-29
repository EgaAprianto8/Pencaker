/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FiSearch, FiChevronLeft, FiChevronRight, FiUser, FiBriefcase, FiMapPin, FiCalendar, FiAward, FiTag, FiRotateCcw, FiChevronsRight, FiTrendingUp, FiTarget, FiDollarSign, FiZap, FiEye, FiBarChart2, FiSliders } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList, PieChart, Pie } from 'recharts';
import { Lightbulb, Users, CalendarDays } from 'lucide-react';
import { Label } from "@/components/ui/label";

// Import useSearchParams
import { useSearchParams } from 'next/navigation';

import { sektorJabatanMap, sektorOptions } from './sektor-jabatan-map';
import HistoricalJobDemandChart from './historical-wage-trend-chart';
import RecommendationPanel from './recommendation/recommendation-panel';
import JobSeekerTable from './jobseektertable';

// Definitions (pastikan ini tetap di MainFeature atau dipindahkan ke file terpisah dan diimpor)
interface SektorJabatanMapItem {
    sektor: string;
    jabatan: string[];
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

const parseSalary = (gaji: string): number => {
    if (!gaji || typeof gaji !== 'string') return 0;
    const cleaned = gaji.replace(/rp|\.| /gi, '').split('-')[0];
    return parseInt(cleaned, 10) || 0;
};

type ProcessedJobData = {
    jabatan: string;
    peminat: number;
};

interface InsightResult {
    highestDemandJob: ProcessedJobData;
    lowestDemandJob: ProcessedJobData;
    lowDemandHighWageJob: {
        jabatan: string;
        peminat: number;
        wageCategories: string;
    } | null;
    highWageJobTrend: string | null;
}

const CHART_COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c', '#83a6ed', '#8dd1e1',
    '#ffbb28', '#ff8042', '#0088fe', '#00c49f', '#008080', '#800080', '#FF00FF',
    '#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00',
    '#cab2d6', '#6a3d9a', '#ffff99', '#b15928', '#c0c0c0', '#808080', '#00FFFF', '#FFFF00',
    '#FF4500', '#DA70D6', '#20B2AA', '#7B68EE', '#BDB76B', '#FFD700', '#ADFF2F', '#F08080'
];

// Custom colors for the stacked bar chart
const STACKED_BAR_COLORS = ['#4A90E2', '#FFC107']; // Biru untuk Pendidikan Pengguna, Kuning untuk Lulusan Lain

// ===================================================================================
// KOMPONEN VISUALISASI JABATAN
// ===================================================================================

type JobVisualizationProps = {
    mainData: DataItem[];
    selectedSector: string;
    selectedPendidikan: string;
    selectedGaji: string;
    gajiOptions: string[];
    allJabatanOptions: string[];
    allPendidikanOptions: string[];
    showOtherEduComparison: boolean;
    setShowOtherEduComparison: React.Dispatch<React.SetStateAction<boolean>>;
    insight: InsightResult | null;
    totalPeminatSektor: number;
    totalPeminatSektorForOtherEdu: number;
    totalPeminatSektorByWage: number;
    percentageByWage: number;
    totalPeminatSektorByWageForOtherEdu: number;
    percentageByWageForOtherEdu: number;
    averageAgeData: { average: number; count: number };
    averageAgeDataForOtherEdu: { average: number };
    genderData: { name: string; value: number; percentage: number }[];
    jobDemandData: ProcessedJobData[];
    jobWageDemandData: { name: string; [key: string]: string | number }[];
};

const JobVisualization = ({
    mainData, selectedSector, selectedPendidikan, selectedGaji, gajiOptions,
    allJabatanOptions, allPendidikanOptions, showOtherEduComparison, setShowOtherEduComparison,
    insight,
    totalPeminatSektor, totalPeminatSektorForOtherEdu,
    totalPeminatSektorByWage, percentageByWage,
    totalPeminatSektorByWageForOtherEdu, percentageByWageForOtherEdu,
    averageAgeData, averageAgeDataForOtherEdu,
    genderData, jobDemandData, jobWageDemandData
}: JobVisualizationProps) => {

    const MIN_WIDTH_PER_JOB_GROUP = 150;
    // Calculate dynamic width for 'Peminat Gaji Berdasarkan Jabatan' chart
    const chartDynamicWidth = Math.max(jobWageDemandData.length * MIN_WIDTH_PER_JOB_GROUP, 500);

    const PIE_COLORS = ['#0088FE', '#FF8042'];

    const hasNonZeroDataForGroupedChart = useMemo(() => {
        if (jobWageDemandData.length === 0) return false;
        return jobWageDemandData.some(jobData =>
            gajiOptions.some(wageCategory => (jobData[wageCategory] as number) > 0)
        );
    }, [jobWageDemandData, gajiOptions]);


    const chartKeys = useMemo(() => {
        const keys: string[] = [];
        if (selectedPendidikan && selectedPendidikan !== 'all') {
            keys.push(selectedPendidikan);
            if (showOtherEduComparison) {
                keys.push('Lulusan Lain');
            }
        } else {
            keys.push('peminat');
        }
        return keys;
    }, [selectedPendidikan, showOtherEduComparison]);

    const combinedJobDemandData = useMemo(() => {
        const jobDataMap = new Map<string, { [key: string]: number }>();

        const currentBaseFilteredData = mainData.filter(item => {
            const jabatan = cleanData(item.JABATAN_DIINGINKAN_Normalized);
            const pendidikanItem = cleanData(item.PENDIDIKAN);
            const selectedSectorItem = sektorJabatanMap.find(s => s.sektor === selectedSector);
            const jabatansInSector = selectedSectorItem?.jabatan || [];
            if (selectedSector && !jabatansInSector.includes(jabatan.toLowerCase())) return false;
            if (selectedPendidikan !== 'all' && pendidikanItem !== selectedPendidikan) return false;
            return true;
        });

        const currentOtherEducationData = (selectedPendidikan === 'all' || !selectedPendidikan) ? [] : mainData.filter(item => {
            const jabatan = cleanData(item.JABATAN_DIINGINKAN_Normalized);
            const pendidikanItem = cleanData(item.PENDIDIKAN);
            const selectedSectorItem = sektorJabatanMap.find(s => s.sektor === selectedSector);
            const jabatansInSector = selectedSectorItem?.jabatan || [];
            if (selectedSector && !jabatansInSector.includes(jabatan.toLowerCase())) return false;
            if (pendidikanItem === selectedPendidikan) return false;
            return true;
        });

        const currentJobDemandData = (() => {
            const jobCounts = new Map<string, number>();
            const filteredByGajiAndBase = currentBaseFilteredData.filter(item => {
                const upahDiinginkanItem = cleanData(item.UPAH_DIINGINKAN);
                return selectedGaji === 'all' || upahDiinginkanItem === selectedGaji;
            });
            filteredByGajiAndBase.forEach(item => {
                const jabatan = cleanData(item.JABATAN_DIINGINKAN_Normalized);
                if (!jabatan || jabatan.toLowerCase() === 'lain-lain') return;
                jobCounts.set(jabatan, (jobCounts.get(jabatan) || 0) + 1);
            });
            return Array.from(jobCounts.entries()).map(([jabatan, count]) => ({
                jabatan: capitalizeWords(jabatan),
                peminat: count,
            })).sort((a, b) => b.peminat - a.peminat);
        })();

        if (selectedPendidikan === 'all' || !selectedPendidikan) {
            const allFilteredInSector = mainData.filter(item => {
                const jabatan = cleanData(item.JABATAN_DIINGINKAN_Normalized);
                const selectedSectorItem = sektorJabatanMap.find(s => s.sektor === selectedSector);
                const jabatansInSector = selectedSectorItem?.jabatan || [];
                const upahDiinginkanItem = cleanData(item.UPAH_DIINGINKAN);

                return (
                    selectedSector && jabatansInSector.includes(jabatan.toLowerCase()) &&
                    (selectedGaji === 'all' || upahDiinginkanItem === selectedGaji) &&
                    jabatan && jabatan.toLowerCase() !== 'lain-lain'
                );
            });

            const totalJobCounts = new Map<string, number>();
            allFilteredInSector.forEach(item => {
                const jabatan = cleanData(item.JABATAN_DIINGINKAN_Normalized);
                totalJobCounts.set(jabatan, (totalJobCounts.get(jabatan) || 0) + 1);
            });

            return Array.from(totalJobCounts.entries()).map(([jabatan, count]) => ({
                jabatan: capitalizeWords(jabatan),
                peminat: count,
                total: count
            })).sort((a, b) => b.total - a.total);
        }

        currentJobDemandData.forEach(item => {
            const capitalizedJabatan = capitalizeWords(item.jabatan);
            jobDataMap.set(capitalizedJabatan, {
                [selectedPendidikan]: item.peminat,
            });
        });

        if (showOtherEduComparison) {
            const otherEduJobCounts = new Map<string, number>();
            const filteredByGajiAndOtherEdu = currentOtherEducationData.filter(item => {
                const upahDiinginkanItem = cleanData(item.UPAH_DIINGINKAN);
                return selectedGaji === 'all' || upahDiinginkanItem === selectedGaji;
            });

            filteredByGajiAndOtherEdu.forEach(item => {
                const jabatan = cleanData(item.JABATAN_DIINGINKAN_Normalized);
                if (!jabatan || jabatan.toLowerCase() === 'lain-lain') return;
                otherEduJobCounts.set(jabatan, (otherEduJobCounts.get(jabatan) || 0) + 1);
            });

            otherEduJobCounts.forEach((count, jabatanRaw) => {
                const capitalizedJabatan = capitalizeWords(jabatanRaw);
                const currentData = jobDataMap.get(capitalizedJabatan) || {};
                jobDataMap.set(capitalizedJabatan, {
                    ...currentData,
                    'Lulusan Lain': count,
                });
            });
        }

        const result = Array.from(jobDataMap.entries()).map(([jabatan, counts]) => ({
            jabatan: jabatan,
            ...counts,
            total: Object.values(counts).reduce((sum: number, val: any) => sum + (val || 0), 0)
        }));

        return result.sort((a, b) => b.total - a.total);
    }, [mainData, selectedSector, selectedPendidikan, selectedGaji, showOtherEduComparison]);

    // Urutkan gajiOptions sekali saja di awal untuk digunakan di Legend dan Bar
    const sortedGajiOptions = useMemo(() => {
        return [...gajiOptions].sort((a, b) => {
            const parseA = parseSalary(a.split('-')[0].trim());
            const parseB = parseSalary(b.split('-')[0].trim());

            // Handle "> rp 10.000.000" case
            if (a.includes('> rp') && b.includes('> rp')) {
                const numA = parseFloat(a.replace('> rp', '').replace(/\./g, '').trim());
                const numB = parseFloat(b.replace('> rp', '').replace(/\./g, '').trim());
                return numA - numB;
            }
            if (a.includes('> rp')) return 1; // "> rp 10.000.000" should be last
            if (b.includes('> rp')) return -1; // "> rp 10.000.000" should be last

            return parseA - parseB;
        });
    }, [gajiOptions]);

    // Definisikan warna untuk setiap kategori gaji
    const WAGE_CATEGORY_COLORS: { [key: string]: string } = {
        "0 - rp 1.000.000": "#c0c0c0", // Abu-abu terang
        "rp 1.000.001 - rp 2.500.000": "#ffc658", // Kuning terang
        "rp 2.500.001 - rp 5.000.000": "#8884d8", // Ungu
        "rp 5.000.001 - rp 10.000.000": "#82ca9d", // Hijau muda
        "> rp 10.000.000": "#e31a1c", // Merah
    };

    // Definisikan warna untuk legenda pendidikan (SMK dan Lulusan Lain)
    const EDUCATION_COLORS: { [key: string]: string } = {
        [selectedPendidikan]: STACKED_BAR_COLORS[0], // Warna untuk pendidikan yang dipilih user
        'Lulusan Lain': STACKED_BAR_COLORS[1], // Warna untuk lulusan lain
        'peminat': CHART_COLORS[0] // Warna default jika 'all' pendidikan
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg text-center">
                <h2 className="text-xl font-semibold">
                    Analisis Peminat di Sektor <span className="text-blue-700">{selectedSector}</span>
                    {selectedPendidikan && selectedPendidikan !== 'all' && <> Lulusan <span className="text-blue-700">{selectedPendidikan}</span></>}
                    {selectedGaji !== 'all' && <> dengan Upah <span className="text-blue-700">{selectedGaji}</span></>}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Peminat Sektor */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-4 rounded-lg shadow-xl text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-80" />
                    <p className="font-bold">Total Peminat Sektor</p>
                    <div className="mt-1">
                        <p className="text-sm opacity-90">Lulusan {selectedPendidikan === 'all' ? 'Semua' : selectedPendidikan}</p>
                        <p className="text-3xl font-bold">{totalPeminatSektor.toLocaleString('id-ID')}</p>
                        {selectedPendidikan !== 'all' && (
                            <>
                                <hr className="my-1 border-blue-300" />
                                <p className="text-sm opacity-90">Lulusan Lain</p>
                                <p className="text-3xl font-bold">{totalPeminatSektorForOtherEdu.toLocaleString('id-ID')}</p>
                                {totalPeminatSektorForOtherEdu > 0 && (
                                    <p className="text-sm opacity-90">({percentageByWageForOtherEdu.toFixed(1)}%)</p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Peminat dengan Upah */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-4 rounded-lg shadow-xl text-center">
                    <FiDollarSign className="h-8 w-8 mx-auto mb-2 opacity-80" />
                    <p className="font-bold">Peminat dengan Upah</p>
                    <div className="mt-1">
                        <p className="text-sm opacity-90">{selectedGaji === 'all' ? 'Semua Rentang' : selectedGaji}</p>
                        <p className="text-3xl font-bold">{totalPeminatSektorByWage.toLocaleString('id-ID')}</p>
                        {totalPeminatSektor > 0 && (
                            <p className="text-sm opacity-90">({percentageByWage.toFixed(1)}%)</p>
                        )}
                        {selectedPendidikan !== 'all' && (
                            <>
                                <hr className="my-1 border-purple-300" />
                                <p className="text-sm opacity-90">Lulusan Lain</p>
                                <p className="text-3xl font-bold">{totalPeminatSektorByWageForOtherEdu.toLocaleString('id-ID')}</p>
                                {totalPeminatSektorForOtherEdu > 0 && (
                                    <p className="text-sm opacity-90">({percentageByWageForOtherEdu.toFixed(1)}%)</p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Rata-rata Umur */}
                <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-4 rounded-lg shadow-xl text-center">
                    <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-80" />
                    <p className="font-bold">Rata-rata Umur Peminat</p>
                    <div className="mt-1">
                        <p className="text-sm opacity-90">Lulusan {selectedPendidikan === 'all' ? 'Semua' : selectedPendidikan}</p>
                        <p className="text-3xl font-bold">{averageAgeData.average} Thn</p>
                        {selectedPendidikan !== 'all' && (
                            <>
                                <hr className="my-1 border-green-300" />
                                <p className="text-sm opacity-90">Lulusan Lain</p>
                                <p className="text-3xl font-bold">{averageAgeDataForOtherEdu.average} Thn</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h4 className="font-semibold text-center mb-2">
                        Peminat Sektor Berdasarkan Jenis Kelamin
                    </h4>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={genderData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80} // Disesuaikan agar label tidak terlalu dekat dengan tepi
                                labelLine={false} // Tidak menampilkan garis dari label ke irisan
                            >
                                {genderData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                                <LabelList
                                    dataKey="percentage" // Menggunakan dataKey 'percentage'
                                    position="inside" // Menempatkan label di dalam irisan
                                    formatter={(value: number) => `${value.toFixed(1)}%`} // Format sebagai persentase
                                    fill="#fff" // Warna teks label putih untuk kontras
                                    fontSize={12} // Ukuran font
                                    // Offset untuk mencegah teks terlalu dekat ke tengah
                                    dy={0}
                                    className="pointer-events-none" // Mencegah interaksi mouse dengan label
                                />
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value} orang`, name]} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value, entry) => (
                                    <span style={{ color: '#333' }}>{value}</span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* MODIFIKASI CHART "Jabatan Berdasarkan Peminat" MENJADI STACKED BAR */}
                <div className="bg-white p-6 rounded-lg shadow-lg md:col-span-2 relative">
                    <h4 className="font-semibold text-left mb-2">Jabatan Berdasarkan Peminat</h4>
                    {selectedPendidikan && selectedPendidikan !== 'all' && (
                        <div className="absolute top-4 right-4 z-10">
                            <Button onClick={() => setShowOtherEduComparison(prev => !prev)} variant="outline" size="sm">
                                {showOtherEduComparison ? 'Sembunyikan' : 'Bandingkan Lulusan Lain'}
                                <FiEye className="ml-1" />
                            </Button>
                        </div>
                    )}
                    {/* Tambahkan div dengan overflowX: 'auto' untuk scroll */}
                    <div style={{ position: 'relative', overflowX: 'auto', paddingBottom: '20px' }}>
                        {/* Legenda Kustom dengan posisi sticky untuk Jabatan Berdasarkan Peminat */}
                        {(selectedPendidikan !== 'all') && ( // Hanya tampilkan jika pendidikan spesifik dipilih
                            <div
                                style={{
                                    position: 'sticky',
                                    left: 0,
                                    top: 0,
                                    zIndex: 10,
                                    backgroundColor: 'white',
                                    padding: '10px 0',
                                    width: '100%',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    justifyContent: 'center',
                                    gap: '15px',
                                    borderBottom: '1px solid #eee',
                                    marginBottom: '10px',
                                }}
                            >
                                {chartKeys.map((key, index) => (
                                    <div key={key} className="flex items-center">
                                        <span
                                            className="inline-block w-3 h-3 rounded-full mr-2"
                                            style={{ backgroundColor: EDUCATION_COLORS[key] || STACKED_BAR_COLORS[index % STACKED_BAR_COLORS.length] }}
                                        ></span>
                                        <span className="text-sm text-gray-700">
                                            {key === selectedPendidikan ? selectedPendidikan : 'Lulusan Lain'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <ResponsiveContainer width={Math.max(combinedJobDemandData.length * 70, 400)} height={300}>
                            <BarChart data={combinedJobDemandData} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="jabatan" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                <YAxis />
                                <Tooltip formatter={(value: number, name?: string) => [`${value.toLocaleString('id-ID')} Peminat`, name || '']} />
                                {/* Menghapus Legend bawaan Recharts di sini */}

                                {chartKeys.map((key, index) => (
                                    <Bar
                                        key={key}
                                        dataKey={key}
                                        stackId={selectedPendidikan !== 'all' ? "a" : undefined}
                                        fill={selectedPendidikan === 'all' ? CHART_COLORS[index % CHART_COLORS.length] : EDUCATION_COLORS[key]}
                                        name={selectedPendidikan === 'all' ? 'Total Peminat' : key}
                                    >
                                        {!showOtherEduComparison && selectedPendidikan === 'all' && (
                                            <LabelList dataKey="peminat" position="top" formatter={(value: number) => value.toLocaleString('id-ID')} />
                                        )}
                                    </Bar>
                                ))}
                                {combinedJobDemandData.length === 0 && (
                                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#666" fontSize="14">
                                        Tidak ada data yang tersedia untuk kombinasi filter ini.
                                    </text>
                                )}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg md:col-span-3">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Peminat Gaji Berdasarkan Jabatan</h3>
                    {jobWageDemandData.length > 0 && hasNonZeroDataForGroupedChart ? (
                        <div style={{ position: 'relative', overflowX: 'auto', paddingBottom: '20px' }}>
                            {/* Legenda Kustom dengan posisi sticky */}
                            <div
                                style={{
                                    position: 'sticky',
                                    left: 0,
                                    top: 0,
                                    zIndex: 10,
                                    backgroundColor: 'white',
                                    padding: '10px 0',
                                    width: '100%',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    justifyContent: 'center',
                                    gap: '15px',
                                    borderBottom: '1px solid #eee',
                                    marginBottom: '10px',
                                }}
                            >
                                {sortedGajiOptions.map((wageCategory, index) => (
                                    <div key={wageCategory} className="flex items-center">
                                        <span
                                            className="inline-block w-3 h-3 rounded-full mr-2"
                                            style={{ backgroundColor: WAGE_CATEGORY_COLORS[wageCategory] || CHART_COLORS[index % CHART_COLORS.length] }}
                                        ></span>
                                        <span className="text-sm text-gray-700">{wageCategory}</span>
                                    </div>
                                ))}
                            </div>

                            <ResponsiveContainer width={chartDynamicWidth} minWidth="100%" height={400}>
                                <BarChart data={jobWageDemandData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" height={100} />
                                    <YAxis label={{ value: 'Jumlah Peminat', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip formatter={(value: number, name?: string) => [`${value.toLocaleString('id-ID')} Peminat`, name || '']} />
                                    {/* Menghapus Legend bawaan Recharts */}
                                    {sortedGajiOptions.map((wageCategory, index) => (
                                        <Bar
                                            key={wageCategory}
                                            dataKey={wageCategory}
                                            fill={WAGE_CATEGORY_COLORS[wageCategory] || CHART_COLORS[index % CHART_COLORS.length]}
                                            name={wageCategory}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            Tidak ada data gaji yang tersedia.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// ===================================================================================
// KOMPONEN UTAMA MainFeature
// ===================================================================================
const MainFeature = () => {
    const searchParams = useSearchParams(); // Hook untuk membaca query params
    const [data, setData] = useState<DataItem[]>([]);
    const [filteredData, setFilteredData] = useState<DataItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const itemsPerPage = 10;
    const [step, setStep] = useState(0);
    const [selectedPendidikan, setSelectedPendidikan] = useState<string>('');
    const [selectedSector, setSelectedSector] = useState<string>('');
    const [selectedGaji, setSelectedGaji] = useState<string>('');
    const [showOtherEduComparison, setShowOtherEduComparison] = useState(false);

    const [allPendidikanOptions, setAllPendidikanOptions] = useState<string[]>([]);
    const [gajiOptions, setGajiOptions] = useState<string[]>([]);
    const [allRawJabatanOptions, setAllRawJabatanOptions] = useState<string[]>([]);

    const [historicalChartData, setHistoricalChartData] = useState<any[]>([]);
    const [selectedJabatanForTrend, setSelectedJabatanForTrend] = useState<string[]>([]);

    // State baru untuk dropdown jabatan di panel AI
    const [selectedJabatanAI, setSelectedJabatanAI] = useState<string>('all');


    useEffect(() => {
        const fetchData = async () => {
            try {
                const responseMain = await fetch('/main_data.json');
                const jsonDataMain = await responseMain.json();
                const validData = jsonDataMain.filter((item: any) => item.original_index && item.original_index !== "");

                setData(validData);
                setFilteredData(validData);

                const uniquePendidikan = [...new Set(validData.map((item: DataItem) => cleanData(item.PENDIDIKAN)).filter(Boolean))];
                setAllPendidikanOptions(uniquePendidikan.sort() as string[]);

                const uniqueGaji = [...new Set(validData.map((item: DataItem) => cleanData(item.UPAH_DIINGINKAN)).filter(Boolean))];
                setGajiOptions(uniqueGaji.sort((a: any, b: any) => parseSalary(a) - parseSalary(b)) as string[]);

                const uniqueJabatan = [...new Set(validData.map((item: DataItem) => cleanData(item.JABATAN_DIINGINKAN_Normalized)).filter(Boolean))];
                setAllRawJabatanOptions(uniqueJabatan.filter(j => j !== '[]').sort() as string[]);

                // Baca parameter dari URL setelah data dimuat
                const sektorUtamaParam = searchParams.get('sektorUtama');
                const sektorParam = searchParams.get('sektor');
                const pendidikanParam = searchParams.get('pendidikan');
                const gajiParam = searchParams.get('gaji');

                if (sektorUtamaParam && sektorParam && pendidikanParam && gajiParam) {
                    // Set state berdasarkan parameter URL
                    setSelectedSector(sektorParam);
                    setSelectedPendidikan(pendidikanParam);
                    setSelectedGaji(gajiParam);
                    setStep(4); // Langsung ke langkah analisis
                }

            } catch (error) {
                console.error("Gagal memuat data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [searchParams]); // Tambahkan searchParams sebagai dependency agar effect dijalankan ulang jika URL berubah

    const filteredPendidikanOptions = useMemo(() => {
        if (!selectedSector) {
            return allPendidikanOptions;
        }

        const filteredDataBySector = data.filter(item => {
            const jabatan = cleanData(item.JABATAN_DIINGINKAN_Normalized);
            const pendidikanItem = cleanData(item.PENDIDIKAN);

            const selectedSectorItem = sektorJabatanMap.find(s => s.sektor === selectedSector);
            let jabatansInSector: string[] = [];
            if (selectedSectorItem) {
                jabatansInSector = selectedSectorItem.jabatan;
            }

            return jabatan && jabatan !== '[]' && pendidikanItem && selectedSector && jabatansInSector.includes(jabatan.toLowerCase());
        });

        const uniquePendidikanForSector = [...new Set(filteredDataBySector.map(item => cleanData(item.PENDIDIKAN)).filter(Boolean))];
        return uniquePendidikanForSector.sort();
    }, [data, selectedSector, allPendidikanOptions]);

    const filteredGajiOptions = useMemo(() => {
        if (!selectedSector || (selectedPendidikan === '' || selectedPendidikan === 'all')) {
            return gajiOptions;
        }

        const filteredDataBySectorAndPendidikan = data.filter(item => {
            const jabatan = cleanData(item.JABATAN_DIINGINKAN_Normalized);
            const pendidikanItem = cleanData(item.PENDIDIKAN);
            const upahDiinginkanItem = cleanData(item.UPAH_DIINGINKAN);

            const selectedSectorItem = sektorJabatanMap.find(s => s.sektor === selectedSector);
            let jabatansInSector: string[] = [];
            if (selectedSectorItem) {
                jabatansInSector = selectedSectorItem.jabatan;
            }

            return jabatan && jabatan !== '[]' && pendidikanItem && upahDiinginkanItem &&
                selectedSector && jabatansInSector.includes(jabatan.toLowerCase()) &&
                (selectedPendidikan === 'all' || pendidikanItem === selectedPendidikan);
        });

        const uniqueGajiForSectorAndPendidikan = [...new Set(filteredDataBySectorAndPendidikan.map(item => cleanData(item.UPAH_DIINGINKAN)).filter(Boolean))];
        return uniqueGajiForSectorAndPendidikan.sort((a, b) => parseSalary(a) - parseSalary(b));
    }, [data, selectedSector, selectedPendidikan, gajiOptions]);


    useEffect(() => {
        const results = data.filter(item =>
            cleanData(item.JURUSAN).toLowerCase().includes(searchTerm.toLowerCase()) ||
            cleanData(item.PENDIDIKAN).toLowerCase().includes(searchTerm.toLowerCase()) ||
            cleanData(item.JABATAN_DIINGINKAN_Normalized).toLowerCase().includes(searchTerm.toLowerCase()) ||
            cleanData(item.KECAMATAN).toLowerCase().includes(searchTerm.toLowerCase()) ||
            cleanData(item.Keterampilan).toLowerCase().includes(searchTerm.toLowerCase()) ||
            cleanData(item.UPAH_DIINGINKAN).toLowerCase().includes(searchTerm.toLowerCase()) ||
            cleanData(item.WILAYAH_DIINGINKAN_DETAIL).toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredData(results);
        setCurrentPage(1);
    }, [searchTerm, data]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem); // Corrected here
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextStep = () => {
        if (step === 3) {
            setStep(4);
            if (!selectedPendidikan) setSelectedPendidikan('all');
            if (!selectedGaji) setSelectedGaji('all');
            setShowOtherEduComparison(false);
            setSelectedJabatanAI('all'); // Reset AI job selection when filters are applied
        } else if (step < 3) {
            setStep(prev => prev + 1);
        }
    };

    const handleResetSearch = () => {
        setStep(0);
        setSelectedSector('');
        setSelectedPendidikan('');
        setSelectedGaji('');
        setShowOtherEduComparison(false);
        setHistoricalChartData([]);
        setSelectedJabatanForTrend([]);
        setSelectedJabatanAI('all'); // Reset AI job selection
    };

    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <div className="text-center py-6">
                        <p className="text-gray-600 mb-4">Tidak menemukan yang Anda cari? Coba pencarian langkah-demi-langkah untuk melihat insight pasar kerja.</p>
                        <Button onClick={() => setStep(1)} size="lg">
                            <FiSearch className="mr-2" /> Mulai Pencarian Terpandu
                        </Button>
                    </div>
                );
            case 1:
                return (
                    <div>
                        <h3 className="font-semibold mb-2">Langkah 1: Sektor Pekerjaan</h3>
                        <Select onValueChange={(value: string) => { setSelectedSector(value); setSelectedPendidikan(''); setSelectedGaji(''); setShowOtherEduComparison(false); setSelectedJabatanAI('all'); }} value={selectedSector}>
                            <SelectTrigger><SelectValue placeholder="Pilih sektor..." /></SelectTrigger>
                            <SelectContent>{sektorOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h3 className="font-semibold mb-2">Langkah 2: Lulusan Terakhir</h3>
                        <Select onValueChange={(value: string) => { setSelectedPendidikan(value); setSelectedGaji(''); setShowOtherEduComparison(false); setSelectedJabatanAI('all'); }} value={selectedPendidikan}>
                            <SelectTrigger><SelectValue placeholder="Pilih pendidikan..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem
                                    value="all"
                                    className={selectedPendidikan === 'all' ? 'font-bold' : ''}
                                >
                                    Semua Tingkat Pendidikan
                                </SelectItem>
                                {filteredPendidikanOptions.length > 0 ? (
                                    filteredPendidikanOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)
                                ) : (
                                    <SelectItem value="" disabled>Pilih sektor terlebih dahulu</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                );
            case 3:
                return (
                    <div>
                        <h3 className="font-semibold mb-2">Langkah 3: Rentang Gaji</h3>
                        <Select onValueChange={(value: string) => { setSelectedGaji(value); setShowOtherEduComparison(false); setSelectedJabatanAI('all'); }} value={selectedGaji}>
                            <SelectTrigger><SelectValue placeholder="Pilih rentang gaji..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem
                                    value="all"
                                    className={selectedGaji === 'all' ? 'font-bold' : ''}
                                >
                                    Semua Rentang Gaji
                                </SelectItem>
                                {filteredGajiOptions.length > 0 ? (
                                    filteredGajiOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)
                                ) : (
                                    <SelectItem value="" disabled>Pilih sektor & pendidikan terlebih dahulu</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                );
            default: return null;
        }
    };

    const isNextButtonDisabled = useMemo(() => {
        if (step === 0) return false;
        if (step === 1 && !selectedSector) return true;
        if (step === 2 && !selectedPendidikan) return true;
        if (step === 3 && !selectedGaji) return true;
        return false;
    }, [step, selectedSector, selectedPendidikan, selectedGaji]);

    const baseFilteredData = useMemo(() => {
        return data.filter(item => {
            const jabatan = cleanData(item.JABATAN_DIINGINKAN_Normalized);
            const pendidikanItem = cleanData(item.PENDIDIKAN);
            const selectedSectorItem = sektorJabatanMap.find(s => s.sektor === selectedSector);
            const jabatansInSector = selectedSectorItem?.jabatan || [];
            if (selectedSector && !jabatansInSector.includes(jabatan.toLowerCase())) return false;
            if (selectedPendidikan !== 'all' && pendidikanItem !== selectedPendidikan) return false;
            return true;
        });
    }, [data, selectedSector, selectedPendidikan]);

    const otherEducationData = useMemo(() => {
        if (selectedPendidikan === 'all' || !selectedPendidikan) return [];
        return data.filter(item => {
            const jabatan = cleanData(item.JABATAN_DIINGINKAN_Normalized);
            const pendidikanItem = cleanData(item.PENDIDIKAN);
            const selectedSectorItem = sektorJabatanMap.find(s => s.sektor === selectedSector);
            const jabatansInSector = selectedSectorItem?.jabatan || [];
            if (selectedSector && !jabatansInSector.includes(jabatan.toLowerCase())) return false;
            if (pendidikanItem === selectedPendidikan) return false;
            return true;
        });
    }, [data, selectedSector, selectedPendidikan]);

    const totalPeminatSektor = useMemo(() => baseFilteredData.length, [baseFilteredData]);
    const totalPeminatSektorForOtherEdu = useMemo(() => otherEducationData.length, [otherEducationData]);

    const totalPeminatSektorByWage = useMemo(() => {
        return selectedGaji === 'all' ? baseFilteredData.length : baseFilteredData.filter(item => cleanData(item.UPAH_DIINGINKAN) === selectedGaji).length;
    }, [baseFilteredData, selectedGaji]);

    const percentageByWage = useMemo(() => {
        return totalPeminatSektor === 0 ? 0 : (totalPeminatSektorByWage / totalPeminatSektor) * 100;
    }, [totalPeminatSektorByWage, totalPeminatSektor]);

    const totalPeminatSektorByWageForOtherEdu = useMemo(() => {
        if (totalPeminatSektorForOtherEdu === 0) return 0;
        return selectedGaji === 'all' ? otherEducationData.length : otherEducationData.filter(item => cleanData(item.UPAH_DIINGINKAN) === selectedGaji).length;
    }, [otherEducationData, selectedGaji, totalPeminatSektorForOtherEdu]);

    const percentageByWageForOtherEdu = useMemo(() => {
        if (totalPeminatSektorForOtherEdu === 0) return 0;
        return (totalPeminatSektorByWageForOtherEdu / totalPeminatSektorForOtherEdu) * 100;
    }, [totalPeminatSektorByWageForOtherEdu, totalPeminatSektorForOtherEdu]);


    const averageAgeData = useMemo(() => {
        const filteredForAge = baseFilteredData.filter(item => {
            const upahDiinginkanItem = cleanData(item.UPAH_DIINGINKAN);
            return (selectedGaji === 'all' || upahDiinginkanItem === selectedGaji) && cleanData(item.UMUR_SAAT_DAFTAR) !== '';
        });
        const ages = filteredForAge.map(item => parseInt(cleanData(item.UMUR_SAAT_DAFTAR), 10)).filter(age => !isNaN(age));
        const totalAge = ages.reduce((sum, age) => sum + age, 0);
        return { average: ages.length > 0 ? Math.round(totalAge / ages.length) : 0, count: ages.length };
    }, [baseFilteredData, selectedGaji]);

    const averageAgeDataForOtherEdu = useMemo(() => {
        const filtered = otherEducationData.filter(item => {
            const upah = cleanData(item.UPAH_DIINGINKAN);
            return (selectedGaji === 'all' || upah === selectedGaji) && cleanData(item.UMUR_SAAT_DAFTAR) !== '';
        });
        const ages = filtered.map(item => parseInt(cleanData(item.UMUR_SAAT_DAFTAR), 10)).filter(a => !isNaN(a));
        const total = ages.reduce((s, a) => s + a, 0);
        return { average: ages.length > 0 ? Math.round(total / ages.length) : 0 };
    }, [otherEducationData, selectedGaji]);

    const genderData = useMemo(() => {
        const filteredForGender = baseFilteredData.filter(item => {
            const upahDiinginkanItem = cleanData(item.UPAH_DIINGINKAN);
            const gender = cleanData(item.JENIS_KELAMIN);
            return (selectedGaji === 'all' || upahDiinginkanItem === selectedGaji) && (gender === 'l' || gender === 'p');
        });
        const maleCount = filteredForGender.filter(item => cleanData(item.JENIS_KELAMIN) === 'l').length;
        const femaleCount = filteredForGender.filter(item => cleanData(item.JENIS_KELAMIN) === 'p').length;
        const total = maleCount + femaleCount;
        return [
            { name: 'Laki-laki', value: maleCount, percentage: total > 0 ? (maleCount / total) * 100 : 0 },
            { name: 'Perempuan', value: femaleCount, percentage: total > 0 ? (femaleCount / total) * 100 : 0 },
        ];
    }, [baseFilteredData, selectedGaji]);


    const jobDemandData = useMemo(() => {
        const jobCounts = new Map<string, number>();
        const filteredByGajiAndBase = baseFilteredData.filter(item => {
            const upahDiinginkanItem = cleanData(item.UPAH_DIINGINKAN);
            return selectedGaji === 'all' || upahDiinginkanItem === selectedGaji;
        });
        filteredByGajiAndBase.forEach(item => {
            const jabatan = cleanData(item.JABATAN_DIINGINKAN_Normalized);
            if (!jabatan || jabatan.toLowerCase() === 'lain-lain') return;
            jobCounts.set(jabatan, (jobCounts.get(jabatan) || 0) + 1);
        });
        return Array.from(jobCounts.entries()).map(([jabatan, count]) => ({
            jabatan: capitalizeWords(jabatan),
            peminat: count,
        })).sort((a, b) => b.peminat - a.peminat);
    }, [baseFilteredData, selectedGaji]);

    const jobWageDemandData = useMemo(() => {
        const aggregated: { [job: string]: { [wage: string]: number } } = {};
        const uniqueJobs = new Set<string>();
        baseFilteredData.forEach(item => {
            const job = cleanData(item.JABATAN_DIINGINKAN_Normalized);
            const wage = cleanData(item.UPAH_DIINGINKAN);
            if (!job || job.toLowerCase() === 'lain-lain' || !wage) return;
            uniqueJobs.add(job);
            if (!aggregated[job]) aggregated[job] = {};
            aggregated[job][wage] = (aggregated[job][wage] || 0) + 1;
        });

        // Urutkan jabatan berdasarkan total peminat untuk semua kategori gaji
        const sortedJobsByTotalPeminat = Array.from(uniqueJobs).sort((a, b) => {
            const totalPeminatA = gajiOptions.reduce((sum, wageCat) => sum + (aggregated[a]?.[wageCat] || 0), 0);
            const totalPeminatB = gajiOptions.reduce((sum, wageCat) => sum + (aggregated[b]?.[wageCat] || 0), 0);
            return totalPeminatB - totalPeminatA;
        });

        return sortedJobsByTotalPeminat.map(job => {
            const dataPoint: { name: string; [key: string]: string | number } = { name: capitalizeWords(job) };
            gajiOptions.forEach(wageCategory => {
                dataPoint[wageCategory] = aggregated[job]?.[wageCategory] || 0;
            });
            return dataPoint;
        });
    }, [baseFilteredData, gajiOptions]);

    const MIN_PEMINAT_FOR_HIGH_WAGE_INSIGHT = 5;

    const insight = useMemo<InsightResult | null>(() => {
        if (jobDemandData.length < 2) return null;

        const highestDemandJob = jobDemandData[0];
        const lowestDemandJob = [...jobDemandData].sort((a, b) => a.peminat - b.peminat)[0];
        let lowDemandHighWageJob: { jabatan: string; peminat: number; wageCategories: string } | null = null;
        let highWageJobTrend: string | null = null;

        if (jobWageDemandData.length > 0 && gajiOptions.length > 0) {
            const sortedGajiOptions = [...gajiOptions].sort((a, b) => parseSalary(b) - parseSalary(a));
            const highWageCategories = sortedGajiOptions.slice(0, Math.min(2, sortedGajiOptions.length)); // Top 2 highest wage categories

            if (highWageCategories.length > 0) {
                let minPeminatForHighWage = Infinity;
                let bestJobForHighWage: { jabatan: string; peminat: number; wageCategories: string } | null = null;

                jobWageDemandData.forEach(jobDataPoint => {
                    let totalPeminatHighWage = 0;
                    highWageCategories.forEach(wageCat => {
                        totalPeminatHighWage += (jobDataPoint[wageCat] as number) || 0;
                    });
                    // Consider jobs that have *some* demand in high wage categories
                    // and relatively low overall demand compared to highestDemandJob
                    if (totalPeminatHighWage >= MIN_PEMINAT_FOR_HIGH_WAGE_INSIGHT && totalPeminatHighWage < minPeminatForHighWage) {
                               // Also check if its overall demand is not the highest
                               const overallDemand = jobDemandData.find(j => j.jabatan === jobDataPoint.name)?.peminat || 0;
                               if (overallDemand > 0 && (highestDemandJob ? overallDemand < highestDemandJob.peminat * 0.75 : true)) { // Arbitrary threshold: less than 75% of highest demand
                                    minPeminatForHighWage = totalPeminatHighWage;
                                    bestJobForHighWage = {
                                        jabatan: jobDataPoint.name,
                                        peminat: totalPeminatHighWage,
                                        wageCategories: highWageCategories.join(', '),
                                    };
                               }
                    }
                });

                lowDemandHighWageJob = bestJobForHighWage;
                if (lowDemandHighWageJob) {
                    // This trend logic is simplified. For real application,
                    // you'd need actual trend analysis on historical data.
                    highWageJobTrend = 'Potensi kenaikan di masa depan';
                }
            }
        }

        return { highestDemandJob, lowestDemandJob, lowDemandHighWageJob, highWageJobTrend };
    }, [jobDemandData, jobWageDemandData, gajiOptions]);

    const availableJabatanForAI = useMemo(() => {
        // Return jobs that are currently present in jobDemandData based on current filters
        return jobDemandData.map(job => job.jabatan);
    }, [jobDemandData]);


    if (isLoading) {
        return <div className="text-center p-8">Memuat data...</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <JobSeekerTable
                currentItems={currentItems}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                currentPage={currentPage}
                totalPages={totalPages}
                handlePreviousPage={handlePreviousPage}
                handleNextPage={handleNextPage}
            />



            <hr className="my-12" />

            <div className="p-6 border rounded-lg shadow-md bg-gray-50">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Pencarian Terpandu & Visualisasi</h2>
                    {step > 0 && (
                        <Button onClick={handleResetSearch} variant="outline" size="sm">
                            <FiRotateCcw className="mr-2" /> Ulangi
                        </Button>
                    )}
                </div>

                {step < 4 && renderStepContent()}

                {step > 0 && step < 4 && (
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleNextStep} disabled={isNextButtonDisabled}>
                            {step === 3 ? 'Tampilkan Hasil & Insight' : 'Lanjutkan'} <FiChevronsRight className="ml-2" />
                        </Button>
                    </div>
                )}

                {step === 4 && (
                    <div>
                        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 mb-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <FiSliders className="mr-2 h-6 w-6 text-blue-500" />
                                <span>Sesuaikan Filter Analisis</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
                                <div className="flex flex-col">
                                    <Label htmlFor="sektor-filter" className="font-semibold mb-1 text-gray-700 text-sm">Sektor Pekerjaan</Label>
                                    <Select onValueChange={(value: string) => { setSelectedSector(value); setSelectedPendidikan('all'); setSelectedGaji('all'); setShowOtherEduComparison(false); setSelectedJabatanAI('all'); }} value={selectedSector}>
                                        <SelectTrigger id="sektor-filter" className="w-full text-left">
                                            <SelectValue placeholder="Pilih sektor..." />
                                        </SelectTrigger>
                                        <SelectContent>{sektorOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col">
                                    <Label htmlFor="pendidikan-filter" className="font-semibold mb-1 text-gray-700 text-sm">Lulusan Terakhir</Label>
                                    <Select onValueChange={(value: string) => { setSelectedPendidikan(value); setSelectedGaji('all'); setShowOtherEduComparison(false); setSelectedJabatanAI('all'); }} value={selectedPendidikan}>
                                        <SelectTrigger id="pendidikan-filter" className="w-full text-left">
                                            <SelectValue placeholder="Pilih pendidikan..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem
                                                value="all"
                                                className={selectedPendidikan === 'all' ? 'font-bold' : ''}
                                            >
                                                Semua Tingkat Pendidikan
                                            </SelectItem>
                                            {filteredPendidikanOptions.length > 0 ? (
                                                filteredPendidikanOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)
                                            ) : (
                                                <SelectItem value="" disabled>Pilih sektor terlebih dahulu</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col">
                                    <Label htmlFor="gaji-filter" className="font-semibold mb-1 text-gray-700 text-sm">Rentang Gaji</Label>
                                    <Select onValueChange={(value: string) => { setSelectedGaji(value); setShowOtherEduComparison(false); setSelectedJabatanAI('all'); }} value={selectedGaji}>
                                        <SelectTrigger id="gaji-filter" className="w-full text-left">
                                            <SelectValue placeholder="Pilih rentang gaji..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem
                                                value="all"
                                                className={selectedGaji === 'all' ? 'font-bold' : ''}
                                            >
                                                Semua Rentang Gaji
                                            </SelectItem>
                                            {filteredGajiOptions.length > 0 ? (
                                                filteredGajiOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)
                                            ) : (
                                                <SelectItem value="" disabled>Pilih sektor & pendidikan terlebih dahulu</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Modifikasi Grid untuk 3 Kolom dengan Lebar Berbeda */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                            {/* Panel Narasi Rekomendasi (Di atas pada mobile, Kolom Kanan pada laptop) */}
                            <div className="lg:col-span-3 order-first lg:order-last flex flex-col">
                                <RecommendationPanel
                                    insight={insight}
                                    selectedSector={selectedSector}
                                    selectedPendidikan={selectedPendidikan}
                                    selectedGaji={selectedGaji}
                                    jobDemandData={jobDemandData}
                                    jobWageDemandData={jobWageDemandData}
                                    historicalChartData={historicalChartData}
                                    selectedJabatanForTrend={selectedJabatanForTrend}
                                    selectedJabatanAI={selectedJabatanAI}
                                    onSelectJabatanAI={setSelectedJabatanAI}
                                    availableJabatanForAI={availableJabatanForAI}
                                />
                            </div>

                            {/* Panel Insight (Kolom Kiri - Lebih Kecil, order normal) */}
                            {/* MODIFIKASI DIMULAI DI SINI */}
                            <div
                                className="lg:col-span-3 flex flex-col bg-white p-6 rounded-lg shadow-lg" // Background dan padding di div luar
                            >
                                <div // Ini adalah konten yang akan menjadi sticky
                                    className="lg:sticky lg:top-5" // sticky hanya di lg: breakpoint, top 20px
                                    style={{
                                        // Hapus height: fit-content dan maxHeight di sini karena background sudah full
                                        // Juga hapus overflowY di sini, karena scrollbar akan dikendalikan oleh parent grid jika diperlukan
                                        alignSelf: 'flex-start', // Tetap pertahankan ini agar konten tidak meregang
                                        zIndex: 1 // Pastikan di atas konten yang di scroll jika ada
                                    }}
                                >
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                        <Lightbulb className="mr-2 h-6 w-6 text-yellow-500" />
                                        Insight Pasar
                                    </h3>
                                    {insight ? (
                                        <div className="w-full space-y-4 text-sm">
                                            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-md border border-blue-300">
                                                <p className="font-semibold text-blue-900 mb-0.5">Paling Diminati:</p>
                                                <p className="text-blue-900 text-2xl font-extrabold leading-tight">"{insight.highestDemandJob?.jabatan}"</p>
                                                <p className="text-blue-800">dengan <span className="font-bold">{insight.highestDemandJob?.peminat.toLocaleString('id-ID')}</span> peminat</p>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl shadow-md border border-yellow-300">
                                                <p className="font-semibold text-yellow-900 mb-0.5">Peluang Tersembunyi:</p>
                                                <p className="text-yellow-900 text-2xl font-extrabold leading-tight">"{insight.lowestDemandJob?.jabatan}"</p>
                                                <p className="text-yellow-800">dengan <span className="font-bold">{insight.lowestDemandJob?.peminat.toLocaleString('id-ID')}</span> peminat</p>
                                            </div>
                                            {insight.lowDemandHighWageJob && (
                                                <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-md border border-green-300">
                                                    <p className="font-semibold text-green-900 mb-0.5">Potensi Gaji Tinggi:</p>
                                                    <p className="text-green-900 text-2xl font-extrabold leading-tight">"{insight.lowDemandHighWageJob.jabatan}"</p>
                                                    <p className="text-green-800">di kategori <span className="font-bold">{insight.lowDemandHighWageJob.wageCategories}</span> ({insight.lowDemandHighWageJob.peminat.toLocaleString('id-ID')} peminat)</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 p-4 text-center">Data tidak cukup untuk menghasilkan insight.</p>
                                    )}
                                </div>
                            </div>
                            {/* MODIFIKASI BERAKHIR DI SINI */}

                            {/* Area Visualisasi Utama (Kolom Tengah - Lebih Lebar, order normal) */}
                            <div className="lg:col-span-6 flex flex-col gap-4">
                                <JobVisualization
                                    mainData={data}
                                    selectedSector={selectedSector}
                                    selectedPendidikan={selectedPendidikan}
                                    selectedGaji={selectedGaji}
                                    gajiOptions={gajiOptions}
                                    allJabatanOptions={allRawJabatanOptions}
                                    allPendidikanOptions={allPendidikanOptions}
                                    showOtherEduComparison={showOtherEduComparison}
                                    setShowOtherEduComparison={setShowOtherEduComparison}
                                    insight={insight}
                                    totalPeminatSektor={totalPeminatSektor}
                                    totalPeminatSektorForOtherEdu={totalPeminatSektorForOtherEdu}
                                    percentageByWage={percentageByWage}
                                    totalPeminatSektorByWage={totalPeminatSektorByWage}
                                    totalPeminatSektorByWageForOtherEdu={totalPeminatSektorByWageForOtherEdu}
                                    percentageByWageForOtherEdu={percentageByWageForOtherEdu}
                                    averageAgeData={averageAgeData}
                                    averageAgeDataForOtherEdu={averageAgeDataForOtherEdu}
                                    genderData={genderData}
                                    jobDemandData={jobDemandData}
                                    jobWageDemandData={jobWageDemandData}
                                />
                            </div>
                        </div>

                        <hr className="my-8" />
                        <div className="w-full">
                            <HistoricalJobDemandChart
                                mainData={data}
                                allJabatanOptions={allRawJabatanOptions}
                                selectedSector={selectedSector}
                                chartTitle={`Tren Peminat Jabatan di Sektor "${selectedSector}" (Jan 2022 - Jun 2025)`}
                                startDateProp="2022-01-01"
                                endDateProp="2025-06-30"
                                selectedGajiFilter={selectedGaji}
                                selectedPendidikanFilter={selectedPendidikan}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MainFeature;