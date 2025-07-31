/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FiSearch, FiChevronLeft, FiChevronRight, FiUser, FiBriefcase, FiMapPin, FiCalendar, FiAward, FiTag, FiRotateCcw, FiChevronsRight, FiTrendingUp, FiTarget, FiDollarSign, FiZap, FiEye, FiBarChart2, FiSliders } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList, PieChart, Pie } from 'recharts';
import { Lightbulb, Users, CalendarDays, DollarSign, TrendingUp, Zap, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { Label } from "@/components/ui/label";

// Import useSearchParams
import { useSearchParams } from 'next/navigation';

import { sektorJabatanMap, sektorOptions } from './sektor-jabatan-map';
import HistoricalJobDemandChart from './historical-wage-trend-chart';
import RecommendationPanel from './recommendation/recommendation-panel';
import JobSeekerTable from './jobseektertable';
import StepWizardForm from './stepwizardform';
import { InsightCard } from './main-feature-components/insight-card';

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
const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.1 } },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
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
        <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ staggerChildren: 0.15 }}
        >
        <motion.div
        className="bg-gradient-to-r from-blue-50 via-white to-blue-50 border border-blue-200 rounded-2xl p-5 text-center shadow-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        >
        <div className="inline-flex items-center space-x-3">
            <motion.div
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
            >
            <FiBarChart2 className="w-6 h-6 text-blue-600" />
            </motion.div>

            <h2 className="text-lg md:text-xl font-semibold text-blue-900">
            Analisis Peminat di Sektor
            <span className="text-gray-800 font-bold"> {selectedSector}</span>
            {selectedPendidikan && selectedPendidikan !== 'all' && (
                <>
                {' '}
                <span className="text-gray-500">•</span>{' '}
                <span className="text-blue-700 font-medium">Lulusan {selectedPendidikan}</span>
                </>
            )}
            {selectedGaji !== 'all' && (
                <>
                {' '}
                <span className="text-gray-500">•</span>{' '}
                <span className="text-blue-700 font-medium">Upah {selectedGaji}</span>
                </>
            )}
            </h2>
        </div>
        </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Total Peminat Sektor */}
                <motion.div
                    className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden"
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4">
                    <div className="flex items-center space-x-3">
                        <Users className="w-6 h-6 text-white/90" />
                        <span className="text-white font-semibold text-sm">Total Peminat Sektor</span>
                    </div>
                    </div>
                    <div className="p-4 space-y-1">
                    <p className="text-3xl font-bold text-gray-800">
                        {totalPeminatSektor.toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-gray-800">Lulusan {selectedPendidikan === 'all' ? 'Semua' : selectedPendidikan}</p>
                    {selectedPendidikan !== 'all' && (
                        <div className="pt-2 border-t border-gray-100">
                        <p className="text-xl font-semibold text-gray-800">
                            {totalPeminatSektorForOtherEdu.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-800">Lulusan Lain </p>
                        </div>
                    )}
                    </div>
                </motion.div>

                {/* Peminat dengan Upah */}
                <motion.div
                    className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden"
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4">
                    <div className="flex items-center space-x-3">
                        <FiDollarSign className="w-6 h-6 text-white/90" />
                        <span className="text-white font-semibold text-sm">Peminat dengan Upah</span>
                    </div>
                    </div>
                    <div className="p-4 space-y-1">
                    <p className="text-3xl font-bold text-gray-800">
                        {totalPeminatSektorByWage.toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-gray-800">{selectedGaji === 'all' ? 'Semua Rentang' : selectedGaji}</p>
                    {totalPeminatSektor > 0 && (
                        <p className="text-xs text-gray-800">{percentageByWage.toFixed(1)}% dari total lulusan</p>
                    )}
                    {selectedPendidikan !== 'all' && (
                        <div className="pt-2 border-t border-gray-100">
                        <p className="text-xl font-semibold text-gray-800">
                            {totalPeminatSektorByWageForOtherEdu.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-800">Lulusan Lain • {percentageByWageForOtherEdu.toFixed(1)}%</p>
                        </div>
                    )}
                    </div>
                </motion.div>

                {/* Rata-rata Umur */}
                <motion.div
                    className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden"
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="bg-gradient-to-r from-green-600 to-green-800 p-4">
                    <div className="flex items-center space-x-3">
                        <CalendarDays className="w-6 h-6 text-white/90" />
                        <span className="text-white font-semibold text-sm">Rata-rata Umur</span>
                    </div>
                    </div>
                    <div className="p-4 space-y-1">
                    <p className="text-3xl font-bold text-gray-800">{averageAgeData.average} <span className="text-lg">Thn</span></p>
                    <p className="text-sm text-gray-800">Lulusan {selectedPendidikan === 'all' ? 'Semua' : selectedPendidikan}</p>
                    {selectedPendidikan !== 'all' && (
                        <div className="pt-2 border-t border-gray-100">
                        <p className="text-xl font-semibold text-gray-800">{averageAgeDataForOtherEdu.average} <span className="text-sm">Thn</span></p>
                        <p className="text-xs text-gray-800">Lulusan Lain</p>
                        </div>
                    )}
                    </div>
                </motion.div>
                </div>

            <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            >
            <motion.div
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-white px-5 py-3 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                <h4 className="text-base text-center font-semibold text-gray-800">
                    Peminat Sektor Berdasarkan Jenis Kelamin
                </h4>
                </div>
            </div>

            {/* Chart */}
            <div className="p-4">
                <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                    <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}  // Donut effect
                    outerRadius={85}
                    paddingAngle={2}
                    >
                    {genderData.map((entry, index) => (
                        <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        className="focus:outline-none hover:opacity-80 transition-opacity"
                        />
                    ))}
                    <LabelList
                        dataKey="percentage"
                        position="inside"
                        formatter={(val: number) => `${val.toFixed(0)}%`}
                        fill="#fff"
                        fontSize={13}
                        fontWeight={600}
                        className="pointer-events-none"
                    />
                    </Pie>

                    <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '0.75rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                    formatter={(value, name) => [`${value} orang`, name]}
                    />

                    <Legend
                    verticalAlign="bottom"
                    height={40}
                    iconType="circle"
                    iconSize={10}
                    wrapperStyle={{ fontSize: 13, color: '#4b5563' }}
                    formatter={(value) => <span className="text-gray-700">{value}</span>}
                    />
                </PieChart>
                </ResponsiveContainer>
            </div>
            </motion.div>

                {/* MODIFIKASI CHART "Jabatan Berdasarkan Peminat" MENJADI STACKED BAR */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden md:col-span-2">
                {/* Header: Judul + Button */}
                <div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-blue-50 to-white">
                    <h4 className="text-base font-semibold text-gray-800 truncate pr-2">
                    Jabatan Berdasarkan Peminat
                    </h4>

                    {selectedPendidikan && selectedPendidikan !== 'all' && (
                    <Button
                        onClick={() => setShowOtherEduComparison(prev => !prev)}
                        variant="outline"
                        size="sm"
                        className="shrink-0 text-xs"
                    >
                        {showOtherEduComparison ? 'Sembunyikan' : 'Bandingkan'}
                        <FiEye className="ml-1 w-3 h-3" />
                    </Button>
                    )}
                </div>

                {/* Legend sticky */}
                {(selectedPendidikan !== 'all') && (
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-2">
                    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs">
                        {chartKeys.map((key, idx) => (
                        <div key={key} className="flex items-center">
                            <span
                            className="w-2.5 h-2.5 rounded-full mr-1.5"
                            style={{
                                backgroundColor:
                                EDUCATION_COLORS[key] || STACKED_BAR_COLORS[idx % STACKED_BAR_COLORS.length],
                            }}
                            />
                            <span className="text-gray-700">
                            {key === selectedPendidikan ? selectedPendidikan : 'Lulusan Lain'}
                            </span>
                        </div>
                        ))}
                    </div>
                    </div>
                )}

                {/* Chart container */}
                <div className="overflow-x-auto pb-4">
                    <ResponsiveContainer
                    width={Math.max(combinedJobDemandData.length * 70, 400)}
                    height={300}
                    >
                    <BarChart
                        data={combinedJobDemandData}
                        margin={{ top: 15, right: 20, left: 0, bottom: 50 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis
                        dataKey="jabatan"
                        tick={{ fontSize: 11 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: 'none',
                            borderRadius: '0.75rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            fontSize: 12,
                        }}
                        formatter={(v: number, name) => [`${v.toLocaleString('id-ID')} peminat`, name]}
                        />

                        {chartKeys.map((key, idx) => (
                        <Bar
                            key={key}
                            dataKey={key}
                            stackId={selectedPendidikan !== 'all' ? 'a' : undefined}
                            fill={EDUCATION_COLORS[key] || CHART_COLORS[idx]}
                            radius={selectedPendidikan !== 'all' ? 0 : [4, 4, 0, 0]}
                        >
                            {!showOtherEduComparison && selectedPendidikan === 'all' && (
                            <LabelList
                                dataKey="peminat"
                                position="top"
                                formatter={(v: number) => v.toLocaleString('id-ID')}
                                fontSize={10}
                            />
                            )}
                        </Bar>
                        ))}

                        {combinedJobDemandData.length === 0 && (
                        <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#9ca3af"
                            fontSize={13}
                        >
                            Tidak ada data
                        </text>
                        )}
                    </BarChart>
                    </ResponsiveContainer>
                </div>
                </div>

                <motion.div
  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden md:col-span-3"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Header */}
  <div className="bg-gradient-to-r from-blue-50 to-white px-5 py-3 border-b border-gray-100">
    <h3 className="text-lg md:text-xl font-semibold text-gray-800 text-center">
      Peminat Gaji Berdasarkan Jabatan
    </h3>
  </div>

  {jobWageDemandData.length > 0 && hasNonZeroDataForGroupedChart ? (
    <div className="w-full">
      {/* Legend sticky */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-2">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
          {sortedGajiOptions.map((cat, idx) => (
            <div key={cat} className="flex items-center">
              <span
                className="w-2.5 h-2.5 rounded-full mr-1.5"
                style={{
                  backgroundColor:
                    WAGE_CATEGORY_COLORS[cat] || CHART_COLORS[idx % CHART_COLORS.length],
                }}
              />
              <span className="text-gray-700">{cat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto pb-4">
        <ResponsiveContainer
          width={chartDynamicWidth}
          minWidth="100%"
          height={400}
        >
          <BarChart
            data={jobWageDemandData}
            margin={{ top: 40, right: 20, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="name"
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              label={{
                value: 'Jumlah Peminat',
                angle: -90,
                position: 'insideLeft',
                fontSize: 12,
              }}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              contentStyle={{
                backgroundColor: '#fff',
                border: 'none',
                borderRadius: '0.75rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                fontSize: 12,
              }}
              formatter={(v: number, name) => [`${v.toLocaleString('id-ID')} peminat`, name]}
            />

            {sortedGajiOptions.map((cat, idx) => (
              <Bar
                key={cat}
                dataKey={cat}
                fill={WAGE_CATEGORY_COLORS[cat] || CHART_COLORS[idx % CHART_COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  ) : (
    <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
      Tidak ada data gaji yang tersedia.
    </div>
  )}
</motion.div>
            </motion.div>
        </motion.div>
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
    const [step, setStep] = useState(1);
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

    const stepWizardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hash = window.location.hash;
            if (hash === '#step-wizard') {
                // Force reset ke step 1 agar StepWizardForm tampil
                setStep(1);
                setSelectedSector('');
                setSelectedPendidikan('');
                setSelectedGaji('');
    
                // Scroll setelah DOM siap
                setTimeout(() => {
                    const target = document.getElementById('step-wizard');
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                        });
                    }
                }, 300); // Tambahan delay untuk memastikan render selesai
            }
        }
    }, []); // Jalankan sekali saat mount

    useEffect(() => {
        if (step < 4 && typeof window !== 'undefined') {
            const hash = window.location.hash;
            if (hash === '#step-wizard') {
                setTimeout(() => {
                    const target = document.getElementById('step-wizard');
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                        });
                    }
                }, 100);
            }
        }
    }, [step]);

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
        setStep(1);
        setSelectedSector('');
        setSelectedPendidikan('');
        setSelectedGaji('');
        setShowOtherEduComparison(false);
        setHistoricalChartData([]);
        setSelectedJabatanForTrend([]);
        setSelectedJabatanAI('all'); // Reset AI job selection
    };

    const renderStepContent = () => {
        return (
          <StepWizardForm
            step={step}
            selectedSector={selectedSector}
            selectedPendidikan={selectedPendidikan}
            selectedGaji={selectedGaji}
            filteredPendidikanOptions={filteredPendidikanOptions}
            filteredGajiOptions={filteredGajiOptions}
            onSectorChange={(value) => {
              setSelectedSector(value);
              setSelectedPendidikan('');
              setSelectedGaji('');
              setShowOtherEduComparison(false);
            }}
            onPendidikanChange={(value) => {
              setSelectedPendidikan(value);
              setSelectedGaji('');
              setShowOtherEduComparison(false);
            }}
            onGajiChange={(value) => {
              setSelectedGaji(value);
              setShowOtherEduComparison(false);
            }}
            onNextStep={() => {
              if (step === 3) {
                setStep(4);
              } else {
                setStep(prev => prev + 1);
              }
            }}
            onReset={handleResetSearch}
            sektorOptions={sektorOptions}
          />
        );
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



            <hr id="step-wizard" className="my-12" />

            <div className="p-6">

                {step < 4 && (
                <div ref={stepWizardRef}>
                    {renderStepContent()}
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
                                <motion.div // Ini adalah konten yang akan menjadi sticky
                                     className=""
                                     initial={{ opacity: 0 }}
                                     animate={{ opacity: 1 }}
                                     transition={{ duration: 0.5 }}
                                >
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <motion.div
                                        initial={{ rotate: -15 }}
                                        animate={{ rotate: 0 }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                    >
                                        <Lightbulb className="w-5 h-5 mr-2 text-blue-600" />
                                    </motion.div>
                                    Insight Pasar
                                    </h3>

                                    {insight ? (
                                    <div className="space-y-3">
                                        <InsightCard
                                        icon={<TrendingUp className="w-4 h-4" />}
                                        label="Paling Diminati"
                                        value={`"${insight.highestDemandJob?.jabatan}"`}
                                        subtext={`${insight.highestDemandJob?.peminat.toLocaleString('id-ID')} peminat`}
                                        colorClass="from-blue-600 to-blue-800"
                                        />
                                        <InsightCard
                                        icon={<Zap className="w-4 h-4" />}
                                        label="Peluang Tersembunyi"
                                        value={`"${insight.lowestDemandJob?.jabatan}"`}
                                        subtext={`${insight.lowestDemandJob?.peminat.toLocaleString('id-ID')} peminat`}
                                        colorClass="from-slate-500 to-slate-700"
                                        />
                                        {insight.lowDemandHighWageJob && (
                                        <InsightCard
                                            icon={<DollarSign className="w-4 h-4" />}
                                            label="Potensi Gaji Tinggi"
                                            value={`"${insight.lowDemandHighWageJob.jabatan}"`}
                                            subtext={`${insight.lowDemandHighWageJob.wageCategories} • ${insight.lowDemandHighWageJob.peminat.toLocaleString('id-ID')} peminat`}
                                            colorClass="from-emerald-500 to-emerald-700"
                                        />
                                        )}
                                    </div>
                                    ) : (
                                    <p className="text-sm text-gray-500 text-center py-6">Data tidak cukup untuk menghasilkan insight.</p>
                                    )}
                                </motion.div>
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