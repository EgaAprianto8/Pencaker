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

import { sektorJabatanMap, sektorOptions } from './sektor-jabatan-map';
import HistoricalJobDemandChart from './historical-wage-trend-chart';
import { format, parseISO } from 'date-fns';

// Memastikan interface SektorJabatanMapItem memiliki properti 'jabatan' sebagai array string
interface SektorJabatanMapItem {
    sektor: string;
    jabatan: string[];
}

// Menambahkan validasi type pada DataItem jika diperlukan, tapi ini sudah cukup baik
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

// ===================================================================================
// KOMPONEN VISUALISASI JABATAN (JobVisualization - sebagai bagian dari MainFeature.tsx)
// ===================================================================================

type JobVisualizationProps = {
    mainData: DataItem[];
    selectedSector: string;
    selectedPendidikan: string;
    selectedGaji: string;
    gajiOptions: string[];
    allJabatanOptions: string[];
    allPendidikanOptions: string[]; 
};

const JobVisualization = ({ mainData, selectedSector, selectedPendidikan, selectedGaji, gajiOptions, allJabatanOptions, allPendidikanOptions }: JobVisualizationProps) => {
    // Filter data dasar untuk pendidikan yang dipilih
    const baseFilteredData = useMemo(() => {
        return mainData.filter(item => {
            const jabatan = cleanData(item.JABATAN_DIINGINKAN_Normalized);
            const pendidikanItem = cleanData(item.PENDIDIKAN);
            
            // Perbaikan utama: Pastikan selectedSectorItem tidak undefined sebelum mengakses .jabatan
            const selectedSectorItem = sektorJabatanMap.find(s => s.sektor === selectedSector);
            let jabatansInSector: string[] = [];

            if (selectedSectorItem) {
                jabatansInSector = selectedSectorItem.jabatan;
            }

            // Memperbaiki logika filter: jika selectedSector tidak kosong, maka jabatan harus ada di sektor tersebut.
            // Jika selectedSector kosong, filter ini dilewati.
            if (selectedSector && !jabatansInSector.includes(jabatan.toLowerCase())) {
                return false;
            }
            if (selectedPendidikan !== 'all' && pendidikanItem !== selectedPendidikan) {
                return false;
            }

            return true;
        });
    }, [mainData, selectedSector, selectedPendidikan]);

    // Data permintaan pekerjaan untuk pendidikan yang dipilih
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

    const totalPeminatSektor = useMemo(() => baseFilteredData.length, [baseFilteredData]);
    const totalPeminatSektorByWage = useMemo(() => {
        if (selectedGaji === 'all') return baseFilteredData.length;
        return baseFilteredData.filter(item => cleanData(item.UPAH_DIINGINKAN) === selectedGaji).length;
    }, [baseFilteredData, selectedGaji]);
    const percentageByWage = useMemo(() => {
        if (totalPeminatSektor === 0) return 0;
        return (totalPeminatSektorByWage / totalPeminatSektor) * 100;
    }, [totalPeminatSektorByWage, totalPeminatSektor]);
    const averageAgeData = useMemo(() => {
        const filteredForAge = baseFilteredData.filter(item => {
            const upahDiinginkanItem = cleanData(item.UPAH_DIINGINKAN);
            return (selectedGaji === 'all' || upahDiinginkanItem === selectedGaji) && cleanData(item.UMUR_SAAT_DAFTAR) !== '';
        });
        const ages = filteredForAge.map(item => parseInt(cleanData(item.UMUR_SAAT_DAFTAR), 10)).filter(age => !isNaN(age));
        const totalAge = ages.reduce((sum, age) => sum + age, 0);
        return { average: ages.length > 0 ? Math.round(totalAge / ages.length) : 0, count: ages.length };
    }, [baseFilteredData, selectedGaji]);

    const genderData = useMemo(() => {
        const filteredForGender = baseFilteredData.filter(item => {
            const upahDiinginkanItem = cleanData(item.UPAH_DIINGINKAN);
            return (selectedGaji === 'all' || upahDiinginkanItem === selectedGaji) && (cleanData(item.JENIS_KELAMIN) === 'l' || cleanData(item.JENIS_KELAMIN) === 'p');
        });
        const maleCount = filteredForGender.filter(item => cleanData(item.JENIS_KELAMIN) === 'l').length;
        const femaleCount = filteredForGender.filter(item => cleanData(item.JENIS_KELAMIN) === 'p').length;
        const totalGenderCount = maleCount + femaleCount;
        return [
            { name: 'Laki-laki', value: maleCount, percentage: totalGenderCount > 0 ? (maleCount / totalGenderCount) * 100 : 0 },
            { name: 'Perempuan', value: femaleCount, percentage: totalGenderCount > 0 ? (femaleCount / totalGenderCount) * 100 : 0 },
        ];
    }, [baseFilteredData, selectedGaji]);
    const PIE_COLORS = ['#0088FE', '#FF8042'];

    const jobWageDemandData = useMemo(() => {
        const aggregated: { [job: string]: { [wage: string]: number } } = {};
        const uniqueJobs: Set<string> = new Set();
        baseFilteredData.forEach(item => {
            const job = cleanData(item.JABATAN_DIINGINKAN_Normalized);
            const wage = cleanData(item.UPAH_DIINGINKAN);
            if (!job || job.toLowerCase() === 'lain-lain' || !wage) return;
            uniqueJobs.add(job);
            if (!aggregated[job]) {
                aggregated[job] = {};
            }
            aggregated[job][wage] = (aggregated[job][wage] || 0) + 1;
        });
        const sortedUniqueJobs = Array.from(uniqueJobs).sort((a,b) => {
            const totalA = gajiOptions.reduce((sum, wageCat) => sum + (aggregated[a]?.[wageCat] || 0), 0);
            const totalB = gajiOptions.reduce((sum, wageCat) => sum + (aggregated[b]?.[wageCat] || 0), 0);
            return totalB - totalA;
        });
        return sortedUniqueJobs.map(job => {
            const dataPoint: { name: string; [key: string]: string | number } = { name: capitalizeWords(job) };
            gajiOptions.forEach(wageCategory => {
                dataPoint[wageCategory] = aggregated[job]?.[wageCategory] || 0;
            });
            return dataPoint;
        });
    }, [baseFilteredData, gajiOptions]);

    const hasNonZeroDataForGroupedChart = useMemo(() => {
        if (jobWageDemandData.length === 0) return false;
        return jobWageDemandData.some(jobData =>
            gajiOptions.some(wageCategory => (jobData[wageCategory] && (jobData[wageCategory] as number) > 0))
        );
    }, [jobWageDemandData, gajiOptions]);

    // === START NEW CALCULATIONS FOR "OTHER EDUCATION" ===
    const baseFilteredDataForOtherEdu = useMemo(() => {
        if (selectedPendidikan === 'all' || !selectedPendidikan) return [];
        return mainData.filter(item => {
            const jabatan = cleanData(item.JABATAN_DIINGINKAN_Normalized);
            const pendidikanItem = cleanData(item.PENDIDIKAN);
            const selectedSectorItem = sektorJabatanMap.find(s => s.sektor === selectedSector);
            
            let jabatansInSector: string[] = [];
            if (selectedSectorItem) {
                jabatansInSector = selectedSectorItem.jabatan;
            }

            if (selectedSector && !jabatansInSector.includes(jabatan.toLowerCase())) return false;
            if (pendidikanItem === selectedPendidikan) return false; 
            if (!allPendidikanOptions.includes(pendidikanItem)) return false; 

            return true;
        });
    }, [mainData, selectedSector, selectedPendidikan, allPendidikanOptions]);

    const totalPeminatSektorForOtherEdu = useMemo(() => baseFilteredDataForOtherEdu.length, [baseFilteredDataForOtherEdu]);
    const totalPeminatSektorByWageForOtherEdu = useMemo(() => {
        if (selectedGaji === 'all') return baseFilteredDataForOtherEdu.length;
        return baseFilteredDataForOtherEdu.filter(item => cleanData(item.UPAH_DIINGINKAN) === selectedGaji).length;
    }, [baseFilteredDataForOtherEdu, selectedGaji]);
    const percentageByWageForOtherEdu = useMemo(() => {
        if (totalPeminatSektorForOtherEdu === 0) return 0;
        return (totalPeminatSektorByWageForOtherEdu / totalPeminatSektorForOtherEdu) * 100;
    }, [totalPeminatSektorByWageForOtherEdu, totalPeminatSektorForOtherEdu]);
    const averageAgeDataForOtherEdu = useMemo(() => {
        const filteredForAge = baseFilteredDataForOtherEdu.filter(item => {
            const upahDiinginkanItem = cleanData(item.UPAH_DIINGINKAN);
            return (selectedGaji === 'all' || upahDiinginkanItem === selectedGaji) && cleanData(item.UMUR_SAAT_DAFTAR) !== '';
        });
        const ages = filteredForAge.map(item => parseInt(cleanData(item.UMUR_SAAT_DAFTAR), 10)).filter(age => !isNaN(age));
        const totalAge = ages.reduce((sum, age) => sum + age, 0);
        return { average: ages.length > 0 ? Math.round(totalAge / ages.length) : 0, count: ages.length };
    }, [baseFilteredDataForOtherEdu, selectedGaji]);
    // === END NEW CALCULATIONS FOR "OTHER EDUCATION" ===

    const getJobTrend = (jobName: string, dataItems: DataItem[], periodMonths: number = 3): string => {
        const jobSpecificMonthlyDemand = new Map<string, number>();
        dataItems.forEach(item => {
            const job = cleanData(item.JABATAN_DIINGINKAN_Normalized).toLowerCase();
            const tanggalDaftarStr = cleanData(item.TANGGAL_DAFTAR);
            if (job === jobName.toLowerCase() && tanggalDaftarStr) {
                const date = parseISO(tanggalDaftarStr);
                const monthKey = format(date, 'yyyy-MM');
                jobSpecificMonthlyDemand.set(monthKey, (jobSpecificMonthlyDemand.get(monthKey) || 0) + 1);
            }
        });
        if (jobSpecificMonthlyDemand.size === 0) return 'tidak ada data tren';
        const sortedMonthKeys = Array.from(jobSpecificMonthlyDemand.keys()).sort();
        const latestMonthKey = sortedMonthKeys[sortedMonthKeys.length - 1];
        const latestMonthDate = parseISO(latestMonthKey + '-01');
        let recentSum = 0;
        let previousSum = 0;
        for (let i = 0; i < periodMonths * 2; i++) {
            const targetMonthDate = new Date(latestMonthDate.getFullYear(), latestMonthDate.getMonth() - i, 1);
            const monthKey = format(targetMonthDate, 'yyyy-MM');
            const demand = jobSpecificMonthlyDemand.get(monthKey) || 0;
            if (i < periodMonths) {
                recentSum += demand;
            } else {
                previousSum += demand;
            }
        }
        if (recentSum > previousSum && previousSum > 0) return 'meningkat';
        else if (recentSum < previousSum && recentSum > 0) return 'menurun';
        else if (recentSum === 0 && previousSum === 0) return 'tidak ada data tren';
        else if (recentSum > 0 && previousSum === 0) return 'muncul (tren naik)';
        else return 'stabil';
    };

    const MIN_PEMINAT_FOR_HIGH_WAGE_INSIGHT = 5;

    const insight = useMemo<InsightResult | null>(() => {
        if (jobDemandData.length < 2) return null;
        
        const highestDemandJob = jobDemandData[0];
        const lowestDemandJob = [...jobDemandData].sort((a, b) => a.peminat - b.peminat)[0];
        
        let lowDemandHighWageJob: { jabatan: string; peminat: number; wageCategories: string; } | null = null;
        let highWageJobTrend: string | null = null;

        if (jobWageDemandData.length > 0 && gajiOptions.length > 0) {
            const sortedGajiOptions = [...gajiOptions].sort((a:string, b:string) => parseSalary(b) - parseSalary(a));
            const numberOfHighWageCategories = Math.min(2, sortedGajiOptions.length);
            const highWageCategories = sortedGajiOptions.slice(0, numberOfHighWageCategories);

            if (highWageCategories.length > 0) {
                let minPeminatForHighWage = Infinity;
                let bestJobForHighWage: { jabatan: string; peminat: number; wageCategories: string; } | null = null;
                
                jobWageDemandData.forEach(jobDataPoint => {
                    let totalPeminatHighWage = 0;
                    highWageCategories.forEach(wageCat => {
                        totalPeminatHighWage += (jobDataPoint[wageCat] as number) || 0;
                    });
                    
                    if (totalPeminatHighWage >= MIN_PEMINAT_FOR_HIGH_WAGE_INSIGHT && totalPeminatHighWage < minPeminatForHighWage) {
                        minPeminatForHighWage = totalPeminatHighWage;
                        bestJobForHighWage = {
                            jabatan: jobDataPoint.name,
                            peminat: totalPeminatHighWage,
                            wageCategories: highWageCategories.join(', ')
                        };
                    }
                });
                lowDemandHighWageJob = bestJobForHighWage;
                if (lowDemandHighWageJob) {
                    highWageJobTrend = getJobTrend(lowDemandHighWageJob.jabatan, baseFilteredData, 3);
                }
            }
        }
        
        // Memastikan highestDemandJob dan lowestDemandJob ada sebelum mengembalikan
        if (!highestDemandJob || !lowestDemandJob) return null;

        return { highestDemandJob, lowestDemandJob, lowDemandHighWageJob, highWageJobTrend };
    }, [jobDemandData, jobWageDemandData, gajiOptions, baseFilteredData]); 

    const MIN_WIDTH_PER_JOB_GROUP = 150;
    const chartDynamicWidth = jobWageDemandData.length * MIN_WIDTH_PER_JOB_GROUP;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Lightbulb className="mr-2 h-6 w-6 text-yellow-500" />
                Insight & Rekomendasi
                </h3>
                {insight ? (
                <div className="w-full space-y-6 flex-grow">
                    <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-lg border border-blue-300 transform transition-transform duration-300 hover:scale-105 cursor-pointer">
                    <div className="flex items-center justify-center mb-3">
                        <div className="p-2 bg-blue-500 rounded-full">
                        <FiTrendingUp className="h-7 w-7 text-white" />
                        </div>
                        <p className="font-bold text-blue-800 ml-3 text-lg">Peminat Terbanyak</p>
                    </div>
                    <p className="text-xl font-semibold text-blue-900 mb-1">Posisi:</p>
                    <p className="text-blue-900 text-3xl md:text-4xl font-extrabold leading-tight mb-2">
                        "{insight?.highestDemandJob?.jabatan || ''}"
                    </p>
                    <p className="text-lg text-blue-800">
                        dengan <span className="font-extrabold text-2xl">{insight?.highestDemandJob?.peminat.toLocaleString('id-ID') || 0}</span> peminat
                    </p>
                    </div>
    
                    <div className="p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl shadow-lg border border-yellow-300 transform transition-transform duration-300 hover:scale-105 cursor-pointer">
                    <div className="flex items-center justify-center mb-3">
                        <div className="p-2 bg-yellow-500 rounded-full">
                        <FiTarget className="h-7 w-7 text-white" />
                        </div>
                        <p className="font-bold text-yellow-800 ml-3 text-lg">Peluang Tersembunyi</p>
                    </div>
                    <p className="text-xl font-semibold text-yellow-900 mb-1">Pertimbangkan:</p>
                    <p className="text-yellow-900 text-3xl md:text-4xl font-extrabold leading-tight mb-2">
                        "{insight?.lowestDemandJob?.jabatan || ''}"
                    </p>
                    <p className="text-lg text-yellow-800">
                        dengan hanya <span className="font-extrabold text-2xl">{insight?.lowestDemandJob?.peminat.toLocaleString('id-ID') || 0}</span> peminat
                    </p>
                    </div>
    
                    {insight?.lowDemandHighWageJob && (
                    <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-lg border border-green-300 transform transition-transform duration-300 hover:scale-105 cursor-pointer">
                        <div className="flex items-center justify-center mb-3">
                        <div className="p-2 bg-green-500 rounded-full">
                            <FiDollarSign className="h-7 w-7 text-white" />
                        </div>
                        <p className="font-bold text-green-800 ml-3 text-lg">Peluang Gaji Tinggi</p>
                        </div>
                        <p className="text-xl font-semibold text-green-900 mb-1">Jabatan:</p>
                        <p className="text-green-900 text-3xl md:text-4xl font-extrabold leading-tight mb-2">
                        "{insight?.lowDemandHighWageJob?.jabatan}"
                        </p>
                        <p className="text-lg text-green-800">
                        dengan <span className="font-extrabold text-2xl">{insight?.lowDemandHighWageJob?.peminat.toLocaleString('id-ID')}</span> peminat di kategori gaji tinggi ({insight?.lowDemandHighWageJob?.wageCategories}).
                        </p>
                        {insight?.highWageJobTrend && (
                        <p className="mt-2 text-base font-bold text-green-800">
                            Tren terbaru: <span className={insight?.highWageJobTrend === 'meningkat' ? 'text-green-900' : insight?.highWageJobTrend === 'menurun' ? 'text-red-700' : 'text-green-700'}>{insight?.highWageJobTrend}</span>
                        </p>
                        )}
                    </div>
                    )}
                </div>
                ) : (
                <p className="text-gray-500 flex-grow p-4">Data tidak cukup untuk menghasilkan insight. Silakan sesuaikan filter Anda.</p>
                )}
            </div>

                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg shadow-sm text-center">
                        <h2 className="text-xl font-semibold">
                            Analisis Peminat di Sektor <span className="text-blue-700">"{selectedSector}"</span>
                            {selectedPendidikan && selectedPendidikan !== 'all' && <> Lulusan <span className="text-blue-700">"{selectedPendidikan}"</span></>}
                            {selectedPendidikan === 'all' && <span className="text-blue-700"> (Semua Pendidikan)</span>}
                            {selectedGaji !== 'all' && <> dengan Upah <span className="text-blue-700">"{selectedGaji}"</span></>}
                            {selectedGaji === 'all' && <span className="text-blue-700"> (Semua Rentang Gaji)</span>}
                        </h2>
                    </div>

                    {/* Grid untuk Kartu Angka */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Removed flex-grow to avoid uneven stretching */}
                        {/* Kartu 1: Total Peminat Sektor */}
                        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-2 rounded-lg shadow-xl flex flex-col justify-evenly items-center text-center transform hover:scale-105 transition-transform duration-300 min-h-[180px]"> 
                            <Users className="h-8 w-8 opacity-80" />
                            <p className="font-bold text-base mt-1 leading-tight">Total Peminat Sektor</p>
                            
                            <div className="w-full">
                                <div className="text-sm opacity-90 mb-1 font-bold">Lulusan Anda ({selectedPendidikan === 'all' ? 'Semua' : selectedPendidikan})</div>
                                <p className="text-3xl font-bold">{totalPeminatSektor.toLocaleString('id-ID')}</p>
                            </div>

                            {/* Separator */}
                            {(selectedPendidikan !== 'all' && selectedPendidikan !== '' && (totalPeminatSektorForOtherEdu > 0 || totalPeminatSektor > 0)) && (
                                <hr className="w-1/2 border-t border-blue-400 my-2" />
                            )}

                            {/* Data untuk Pendidikan Lain */}
                            {(selectedPendidikan !== 'all' && selectedPendidikan !== '') ? (
                                totalPeminatSektorForOtherEdu > 0 ? (
                                    <div className="w-full">
                                        <div className="text-sm opacity-90 mb-1 font-bold">Lulusan Lain</div>
                                        <p className="text-3xl font-bold">{totalPeminatSektorForOtherEdu.toLocaleString('id-ID')}</p>
                                    </div>
                                ) : (
                                    <p className="text-xs opacity-70 mt-2">Lulusan lain: Tidak ada data.</p>
                                )
                            ) : (
                                <p className="text-xs opacity-70 mt-2">Pilih lulusan spesifik untuk perbandingan.</p>
                            )}
                        </div>

                        {/* Kartu 2: Peminat dengan Upah */}
                        <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-2 rounded-lg shadow-xl flex flex-col justify-evenly items-center text-center transform hover:scale-105 transition-transform duration-300 min-h-[180px]">
                            <FiDollarSign className="h-8 w-8 opacity-80" />
                            <p className="font-bold text-base mt-1 leading-tight">Peminat dengan Upah</p>

                            <div className="w-full">
                                <div className="text-sm opacity-90 mb-1 font-bold">Anda ({selectedGaji === 'all' ? 'Semua' : selectedGaji})</div>
                                <p className="text-3xl font-bold">
                                    {totalPeminatSektorByWage.toLocaleString('id-ID')}
                                    {totalPeminatSektor > 0 && totalPeminatSektorByWage > 0 && (
                                        <span className="block text-xl font-semibold opacity-90">({percentageByWage.toFixed(1)}%)</span>
                                    )}
                                </p>
                            </div>

                            {/* Separator */}
                            {(selectedPendidikan !== 'all' && selectedPendidikan !== '' && (totalPeminatSektorByWageForOtherEdu > 0 || totalPeminatSektorByWage > 0)) && (
                                <hr className="w-1/2 border-t border-purple-400 my-2" />
                            )}
                            
                            {/* Data untuk Pendidikan Lain */}
                            {(selectedPendidikan !== 'all' && selectedPendidikan !== '') ? (
                                totalPeminatSektorByWageForOtherEdu > 0 ? (
                                    <div className="w-full">
                                        <div className="text-sm opacity-90 mb-1 font-bold">Lulusan Lain</div>
                                        <p className="text-3xl font-bold">
                                            {totalPeminatSektorByWageForOtherEdu.toLocaleString('id-ID')}
                                            {totalPeminatSektorForOtherEdu > 0 && totalPeminatSektorByWageForOtherEdu > 0 && (
                                                <span className="block text-xl font-semibold opacity-90">({percentageByWageForOtherEdu.toFixed(1)}%)</span>
                                            )}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-xs opacity-70 mt-2">Lulusan lain: Tidak ada data.</p>
                                )
                            ) : (
                                <p className="text-xs opacity-70 mt-2">Pilih lulusan spesifik untuk perbandingan.</p>
                            )}
                        </div>

                        {/* Kartu 3: Rata-rata Umur Peminat */}
                        <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-2 rounded-lg shadow-xl flex flex-col justify-evenly items-center text-center transform hover:scale-105 transition-transform duration-300 min-h-[180px]">
                            <CalendarDays className="h-8 w-8 mb-1 opacity-80" />
                            <p className="font-bold text-base mt-1 leading-tight">Rata-rata Umur Peminat</p>

                            <div className="w-full">
                                <div className="text-sm opacity-90 mb-1 font-bold">Lulusan Anda ({selectedPendidikan === 'all' ? 'Semua' : selectedPendidikan})</div>
                                <p className="text-3xl font-bold">{averageAgeData.average} Thn</p>
                            </div>

                            {/* Separator */}
                            {(selectedPendidikan !== 'all' && selectedPendidikan !== '' && (averageAgeDataForOtherEdu.average > 0 || averageAgeData.average > 0)) && (
                                <hr className="w-1/2 border-t border-green-400 my-2" />
                            )}

                            {/* Data untuk Pendidikan Lain */}
                            {(selectedPendidikan !== 'all' && selectedPendidikan !== '') ? (
                                averageAgeDataForOtherEdu.average > 0 ? (
                                    <div className="w-full">
                                        <div className="text-sm opacity-90 mb-1 font-bold">Lulusan Lain</div>
                                        <p className="text-3xl font-bold">{averageAgeDataForOtherEdu.average} Thn</p>
                                    </div>
                                ) : (
                                    <p className="text-xs opacity-70 mt-2">Lulusan lain: Tidak ada data.</p>
                                )
                            ) : (
                                <p className="text-xs opacity-70 mt-2">Pilih lulusan spesifik untuk perbandingan.</p>
                            )}
                        </div>
                    </div>

                    {/* NEW: Satu container grid untuk chart Pie dan Bar, dan chart Grouped Bar */}
                    {/* Ini akan memastikan bahwa semua chart di kolom kanan memiliki lebar yang konsisten */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Perbandingan Peminat Laki-laki vs. Perempuan */}
                        <div className="bg-white p-6 rounded-lg shadow-lg md:col-span-1">
                            <h4 className="font-semibold text-center mb-2">Perbandingan Peminat Laki-laki vs. Perempuan</h4>
                            {genderData[0].value > 0 || genderData[1].value > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={genderData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                                        >
                                            {genderData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number, name?: string) => [`${value.toLocaleString('id-ID')} Peminat`, name || '']} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-gray-500">
                                    Tidak ada data gender peminat yang tersedia untuk filter yang dipilih.
                                </div>
                            )}
                        </div>

                        {/* Jabatan Berdasarkan Peminat (Bar Chart dengan Angka) */}
                        <div className="bg-white p-6 rounded-lg shadow-lg md:col-span-2">
                            <h4 className="font-semibold text-center mb-2">Jabatan Berdasarkan Peminat (Menurun)</h4>
                            {jobDemandData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={jobDemandData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="jabatan" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={80} />
                                        <YAxis />
                                        <Tooltip formatter={(value: number) => [value.toLocaleString('id-ID'), 'Peminat']} />
                                        <Legend />
                                        <Bar dataKey="peminat" fill="#82ca9d">
                                            <LabelList dataKey="peminat" position="top" formatter={(value: number) => value.toLocaleString('id-ID')} />
                                            {jobDemandData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-gray-500">
                                    Tidak ada data peminat yang tersedia untuk filter yang dipilih.
                                </div>
                            )}
                        </div>

                        {/* Peminat Gaji Berdasarkan Jabatan (Grouped Bar Chart) - dipindahkan ke dalam grid yang sama */}
                        <div className="bg-white p-6 rounded-lg shadow-lg md:col-span-3"> {/* Ini akan membuatnya span seluruh 3 kolom */}
                            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Peminat Gaji Berdasarkan Jabatan</h3>
                            {jobWageDemandData.length > 0 && hasNonZeroDataForGroupedChart ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <ResponsiveContainer width={chartDynamicWidth} minWidth="100%" height={400}>
                                        <BarChart data={jobWageDemandData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barCategoryGap="10%">
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" height={100} />
                                            <YAxis label={{ value: 'Jumlah Peminat', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip formatter={(value: number, name?: string) => [`${value.toLocaleString('id-ID')} Peminat`, name || '']} />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                            {gajiOptions.map((wageCategory, index) => (
                                                <Bar
                                                    key={wageCategory}
                                                    dataKey={wageCategory}
                                                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                                                    name={wageCategory}
                                                />
                                            ))}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-gray-500">
                                    Tidak ada data gaji yang tersedia untuk jabatan-jabatan di sektor ini dengan nilai peminat yang valid.
                                </div>
                            )}
                        </div>
                    </div> {/* End of new grid container */}
                </div>
            </div>
            {/* ... bagian lain dari MainFeature tetap sama ... */}
        </div>
    );
};


// ===================================================================================
// KOMPONEN UTAMA MainFeature
// ===================================================================================
const MainFeature = () => {
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

    const [allPendidikanOptions, setAllPendidikanOptions] = useState<string[]>([]); 
    const [gajiOptions, setGajiOptions] = useState<string[]>([]);
    const [allRawJabatanOptions, setAllRawJabatanOptions] = useState<string[]>([]);

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
                setGajiOptions(uniqueGaji.sort((a:any, b:any) => parseSalary(a) - parseSalary(b)) as string[]);

                const uniqueJabatan = [...new Set(validData.map((item: DataItem) => cleanData(item.JABATAN_DIINGINKAN_Normalized)).filter(Boolean))];
                setAllRawJabatanOptions(uniqueJabatan.filter(j => j !== '[]').sort() as string[]);

            } catch (error) {
                console.error("Gagal memuat data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredPendidikanOptions = useMemo(() => {
        if (!selectedSector) {
            return allPendidikanOptions;
        }

        const filteredDataBySector = data.filter(item => {
            const jabatan = cleanData(item.JABATAN_DIINGINKAN_Normalized);
            const pendidikanItem = cleanData(item.PENDIDIKAN);
            
            // Perbaikan di sini juga untuk selectedSectorItem
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
            
            // Perbaikan di sini juga untuk selectedSectorItem
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
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
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
        } else if (step < 3) {
            setStep(prev => prev + 1);
        }
    };

    const handleResetSearch = () => {
        setStep(0);
        setSelectedSector('');
        setSelectedPendidikan('');
        setSelectedGaji('');
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
                        <Select onValueChange={(value: string) => { setSelectedSector(value); setSelectedPendidikan(''); setSelectedGaji(''); }} value={selectedSector}>
                            <SelectTrigger><SelectValue placeholder="Pilih sektor..." /></SelectTrigger>
                            <SelectContent>{sektorOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h3 className="font-semibold mb-2">Langkah 2: Lulusan Terakhir</h3>
                        <Select onValueChange={(value: string) => { setSelectedPendidikan(value); setSelectedGaji(''); }} value={selectedPendidikan}>
                            <SelectTrigger><SelectValue placeholder="Pilih pendidikan..." /></SelectTrigger>
                            <SelectContent>
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
                        <Select onValueChange={(value: string) => setSelectedGaji(value)} value={selectedGaji}>
                            <SelectTrigger><SelectValue placeholder="Pilih rentang gaji..." /></SelectTrigger>
                            <SelectContent>
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


    if (isLoading) {
        return <div className="text-center p-8">Memuat data...</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Data Pencari Kerja</h1>
            <p className="text-gray-600 mb-6">Gunakan kotak di bawah untuk pencarian cepat atau gunakan pencarian terpandu.</p>

            <div className="flex items-center mb-6">
                <div className="relative w-full max-w-lg">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input type="text" placeholder="Cari berdasarkan jurusan, jabatan, keterampilan, dll..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
            </div>

            <div className="rounded-lg border shadow-sm overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px] font-semibold">No.</TableHead>
                            <TableHead className="font-semibold"><FiUser className="mr-2 inline-block" />Profil</TableHead>
                            <TableHead className="font-semibold"><FiBriefcase className="mr-2 inline-block" />Pendidikan</TableHead>
                            <TableHead className="font-semibold"><FiAward className="mr-2 inline-block" />Keterampilan</TableHead>
                            <TableHead className="font-semibold"><FiTag className="mr-2 inline-block" />Jabatan & Upah</TableHead>
                            <TableHead className="font-semibold"><FiMapPin className="mr-2 inline-block" />Lokasi</TableHead>
                            <TableHead className="font-semibold"><FiCalendar className="mr-2 inline-block" />Tanggal Penting</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item, index) => (
                                <TableRow key={item.original_index} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">{indexOfFirstItem + index + 1}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cleanData(item.JENIS_KELAMIN) === 'l' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                                                {cleanData(item.JENIS_KELAMIN) === 'l' ? 'Laki-laki' : 'Perempuan'}
                                            </span>
                                            <div>
                                                <div className="font-medium text-gray-800">{cleanData(item.UMUR_SAAT_DAFTAR)} tahun</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-gray-800 capitalize">{cleanData(item.JURUSAN) || '-'}</div>
                                        <div className="text-sm text-gray-500 uppercase">{cleanData(item.PENDIDIKAN)} ({cleanData(item.TAHUN_LULUS)})</div>
                                    </TableCell>
                                    <TableCell className="capitalize">{cleanData(item.Keterampilan) || '-'}</TableCell>
                                    <TableCell>
                                        <div className="font-medium text-gray-800 capitalize">{cleanData(item.JABATAN_DIINGINKAN_Normalized)}</div>
                                        <div className="text-sm text-gray-500">{cleanData(item.UPAH_DIINGINKAN)}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-gray-800 capitalize">{cleanData(item.WILAYAH_DIINGINKAN_DETAIL)}</div>
                                        <div className="text-sm text-gray-500 capitalize">{cleanData(item.KECAMATAN)}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-gray-500">Daftar: {cleanData(item.TANGGAL_DAFTAR)}</div>
                                        <div className="text-sm text-gray-500">Lahir: {cleanData(item.TGL_LAHIR)}</div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    Tidak ada data yang cocok.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-4 py-4">
                <span className="text-sm text-gray-600">Halaman {currentPage} dari {totalPages}</span>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}><FiChevronLeft className="mr-2 h-4 w-4" /> Sebelumnya</Button>
                    <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>Berikutnya <FiChevronRight className="ml-2 h-4 w-4" /></Button>
                </div>
            </div>

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
                                    <Select onValueChange={(value: string) => { setSelectedSector(value); setSelectedPendidikan('all'); setSelectedGaji('all'); }} value={selectedSector}>
                                        <SelectTrigger id="sektor-filter" className="w-full text-left">
                                            <SelectValue placeholder="Pilih sektor..." />
                                        </SelectTrigger>
                                        <SelectContent>{sektorOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col">
                                    <Label htmlFor="pendidikan-filter" className="font-semibold mb-1 text-gray-700 text-sm">Lulusan Terakhir</Label>
                                    <Select onValueChange={(value: string) => { setSelectedPendidikan(value); setSelectedGaji('all'); }} value={selectedPendidikan}>
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
                                    <Select onValueChange={(value: string) => setSelectedGaji(value)} value={selectedGaji}>
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

                        <JobVisualization
                            mainData={data}
                            selectedSector={selectedSector}
                            selectedPendidikan={selectedPendidikan}
                            selectedGaji={selectedGaji}
                            gajiOptions={gajiOptions}
                            allJabatanOptions={allRawJabatanOptions}
                            allPendidikanOptions={allPendidikanOptions} 
                        />

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