/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// PERUBAHAN: Menambahkan impor ikon baru dari react-icons/fi
import { FiSearch, FiChevronLeft, FiChevronRight, FiUser, FiBriefcase, FiMapPin, FiCalendar, FiAward, FiTag, FiRotateCcw, FiChevronsRight, FiTrendingUp, FiTarget, FiDollarSign, FiZap, FiEye, FiBarChart2 } from 'react-icons/fi'; // Menambahkan beberapa ikon alternatif untuk pilihan
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList, PieChart, Pie } from 'recharts';
import { Lightbulb, Users, CalendarDays } from 'lucide-react'; // DollarSign dihapus karena sudah ada di react-icons/fi

import { sektorJabatanMap, sektorOptions } from './sektor-jabatan-map';
import HistoricalJobDemandChart from './historical-wage-trend-chart';
import { format, parseISO } from 'date-fns';

// Tipe Data Utama
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

// Fungsi Helper
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

// Tipe data untuk JobVisualization
type ProcessedJobData = {
    jabatan: string;
    peminat: number;
};

// Array warna untuk chart
const CHART_COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c', '#83a6ed', '#8dd1e1',
    '#ffbb28', '#ff8042', '#0088fe', '#00c49f', '#008080', '#800080', '#FF00FF',
    '#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00',
    '#cab2d6', '#6a3d9a', '#ffff99', '#b15928', '#c0c0c0', '#808080', '#00FFFF', '#FFFF00',
    '#FF4500', '#DA70D6', '#20B2AA', '#7B68EE', '#BDB76B', '#FFD700', '#ADFF2F', '#F08080'
];

// ===================================================================================
// KOMPONEN VISUALISASI JABATAN (JobVisualization)
// ===================================================================================
const JobVisualization = ({ mainData, selectedSector, selectedPendidikan, selectedGaji, gajiOptions, allJabatanOptions }: { mainData: DataItem[], selectedSector: string, selectedPendidikan: string, selectedGaji: string, gajiOptions: string[], allJabatanOptions: string[] }) => {
    const [selectedGajiFilter, setSelectedGajiFilter] = useState(selectedGaji === '' ? 'all' : selectedGaji);

    useEffect(() => {
        setSelectedGajiFilter(selectedGaji === '' ? 'all' : selectedGaji);
    }, [selectedGaji]);

    const baseFilteredData = useMemo(() => {
        return mainData.filter(item => {
            const jabatan = cleanData(item.JABATAN_DIINGINKAN_Normalized);
            const pendidikanItem = cleanData(item.PENDIDIKAN);
            const selectedSectorItem = sektorJabatanMap.find(s => s.sektor === selectedSector);
            const jabatansInSector = selectedSectorItem?.jabatan || [];

            if (selectedSector && !jabatansInSector.includes(jabatan.toLowerCase())) return false;
            if (selectedPendidikan && pendidikanItem !== selectedPendidikan) return false;

            return true;
        });
    }, [mainData, selectedSector, selectedPendidikan]);

    const jobDemandData = useMemo(() => {
        const jobCounts = new Map<string, number>();

        const filteredByGajiAndBase = baseFilteredData.filter(item => {
            const upahDiinginkanItem = cleanData(item.UPAH_DIINGINKAN);
            return selectedGajiFilter === 'all' || upahDiinginkanItem === selectedGajiFilter;
        });

        filteredByGajiAndBase.forEach(item => {
            const jabatan = cleanData(item.JABATAN_DIINGINKAN_Normalized);
            if (!jabatan || jabatan.toLowerCase() === 'lain-lain') return;
            jobCounts.set(jabatan, (jobCounts.get(jabatan) || 0) + 1);
        });

        const result: ProcessedJobData[] = Array.from(jobCounts.entries()).map(([jabatan, count]) => ({
            jabatan: capitalizeWords(jabatan),
            peminat: count,
        }));

        return result.sort((a, b) => b.peminat - a.peminat);
    }, [baseFilteredData, selectedGajiFilter]);

    const totalPeminatSektor = useMemo(() => {
        return baseFilteredData.length;
    }, [baseFilteredData]);

    const totalPeminatSektorByWage = useMemo(() => {
        if (selectedGajiFilter === 'all') {
            return baseFilteredData.length;
        }
        return baseFilteredData.filter(item => cleanData(item.UPAH_DIINGINKAN) === selectedGajiFilter).length;
    }, [baseFilteredData, selectedGajiFilter]);

    const percentageByWage = useMemo(() => {
        if (totalPeminatSektor === 0) return 0;
        return (totalPeminatSektorByWage / totalPeminatSektor) * 100;
    }, [totalPeminatSektorByWage, totalPeminatSektor]);

    const averageAgeData = useMemo(() => {
        const filteredForAge = baseFilteredData.filter(item => {
            const upahDiinginkanItem = cleanData(item.UPAH_DIINGINKAN);
            return (selectedGajiFilter === 'all' || upahDiinginkanItem === selectedGajiFilter) &&
                cleanData(item.UMUR_SAAT_DAFTAR) !== '';
        });

        const ages = filteredForAge.map(item => parseInt(cleanData(item.UMUR_SAAT_DAFTAR), 10)).filter(age => !isNaN(age));
        const totalAge = ages.reduce((sum, age) => sum + age, 0);
        const average = ages.length > 0 ? Math.round(totalAge / ages.length) : 0;

        return { average, count: ages.length };
    }, [baseFilteredData, selectedGajiFilter]);

    const genderData = useMemo(() => {
        const filteredForGender = baseFilteredData.filter(item => {
            const upahDiinginkanItem = cleanData(item.UPAH_DIINGINKAN);
            return (selectedGajiFilter === 'all' || upahDiinginkanItem === selectedGajiFilter) &&
                (cleanData(item.JENIS_KELAMIN) === 'l' || cleanData(item.JENIS_KELAMIN) === 'p');
        });

        const maleCount = filteredForGender.filter(item => cleanData(item.JENIS_KELAMIN) === 'l').length;
        const femaleCount = filteredForGender.filter(item => cleanData(item.JENIS_KELAMIN) === 'p').length;
        const totalGenderCount = maleCount + femaleCount;

        return [
            { name: 'Laki-laki', value: maleCount, percentage: totalGenderCount > 0 ? (maleCount / totalGenderCount) * 100 : 0 },
            { name: 'Perempuan', value: femaleCount, percentage: totalGenderCount > 0 ? (femaleCount / totalGenderCount) * 100 : 0 },
        ];
    }, [baseFilteredData, selectedGajiFilter]);

    const PIE_COLORS = ['#0088FE', '#FF8042'];

    // Agregasi data untuk Grouped Bar Chart (Peminat Gaji Berdasarkan Jabatan)
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


        const result = sortedUniqueJobs.map(job => {
            const dataPoint: { name: string; [key: string]: string | number } = {
                name: capitalizeWords(job)
            };
            gajiOptions.forEach(wageCategory => {
                dataPoint[wageCategory] = aggregated[job]?.[wageCategory] || 0;
            });
            return dataPoint;
        });

        // Debugging: Log data to console
        console.log("jobWageDemandData:", result);

        return result;
    }, [baseFilteredData, gajiOptions]);

    // Menentukan apakah ada data non-nol untuk dirender (untuk chart Grouped Bar)
    const hasNonZeroDataForGroupedChart = useMemo(() => {
        if (jobWageDemandData.length === 0) return false;
        return jobWageDemandData.some(jobData =>
            gajiOptions.some(wageCategory => (jobData[wageCategory] && (jobData[wageCategory] as number) > 0))
        );
    }, [jobWageDemandData, gajiOptions]);


    // Fungsi Helper untuk Mendapatkan Tren Jabatan
    const getJobTrend = (jobName: string, dataItems: DataItem[], periodMonths: number = 3): string => {
        const jobSpecificMonthlyDemand = new Map<string, number>();

        // Filter relevant items for this job and populate monthly demand
        dataItems.forEach(item => {
            const job = cleanData(item.JABATAN_DIINGINKAN_Normalized).toLowerCase();
            const tanggalDaftarStr = cleanData(item.TANGGAL_DAFTAR);
            if (job === jobName.toLowerCase() && tanggalDaftarStr) {
                const date = parseISO(tanggalDaftarStr);
                const monthKey = format(date, 'yyyy-MM');
                jobSpecificMonthlyDemand.set(monthKey, (jobSpecificMonthlyDemand.get(monthKey) || 0) + 1);
            }
        });

        if (jobSpecificMonthlyDemand.size === 0) {
            return 'tidak ada data tren';
        }

        // Dapatkan kunci bulan terbaru dari data yang dikumpulkan
        const sortedMonthKeys = Array.from(jobSpecificMonthlyDemand.keys()).sort();
        const latestMonthKey = sortedMonthKeys[sortedMonthKeys.length - 1];
        const latestMonthDate = parseISO(latestMonthKey + '-01'); // Konversi kembali ke objek Date

        let recentSum = 0;
        let previousSum = 0;

        // Iterasi mundur dari bulan terbaru untuk mendapatkan permintaan pada periode terbaru dan sebelumnya
        for (let i = 0; i < periodMonths * 2; i++) {
            const targetMonthDate = new Date(latestMonthDate.getFullYear(), latestMonthDate.getMonth() - i, 1);
            const monthKey = format(targetMonthDate, 'yyyy-MM');
            const demand = jobSpecificMonthlyDemand.get(monthKey) || 0;

            if (i < periodMonths) { // Periode terbaru (misal 3 bulan terakhir)
                recentSum += demand;
            } else { // Periode sebelumnya (misal 3 bulan sebelum itu)
                previousSum += demand;
            }
        }

        // Tentukan arah tren
        if (recentSum > previousSum && previousSum > 0) { // Meningkat jika ada peningkatan dan periode sebelumnya tidak nol
            return 'meningkat';
        } else if (recentSum < previousSum && recentSum > 0) { // Menurun jika ada penurunan dan periode terbaru tidak nol
            return 'menurun';
        } else if (recentSum === 0 && previousSum === 0) { // Tidak ada data di kedua periode
             return 'tidak ada data tren';
        }
        else if (recentSum > 0 && previousSum === 0) { // Muncul di periode terbaru dari nol
            return 'muncul (tren naik)';
        }
        else { // Kasus lainnya dianggap stabil (misal: tetap nol, atau perubahan sangat kecil)
            return 'stabil';
        }
    };

    // Mendefinisikan ambang batas minimum peminat untuk insight gaji tinggi
    const MIN_PEMINAT_FOR_HIGH_WAGE_INSIGHT = 5; // Ubah nilai ini sesuai kebutuhan

    const insight = useMemo(() => {
        if (jobDemandData.length < 2) return null;
        const highestDemandJob = jobDemandData[0];
        const lowestDemandJob = [...jobDemandData].sort((a, b) => a.peminat - b.peminat)[0];

        // Insight tambahan: Jabatan dengan gaji besar tapi peminatnya sedikit
        let lowDemandHighWageJob = null;
        let highWageJobTrend = null;

        if (jobWageDemandData.length > 0 && gajiOptions.length > 0) {
            // Urutkan gajiOptions dari yang terbesar ke terkecil
            const sortedGajiOptions = [...gajiOptions].sort((a:string, b:string) => parseSalary(b) - parseSalary(a));

            // Coba temukan kategori gaji "besar" (misal, 2 kategori teratas)
            const numberOfHighWageCategories = Math.min(2, sortedGajiOptions.length);
            const highWageCategories = sortedGajiOptions.slice(0, numberOfHighWageCategories);

            if (highWageCategories.length > 0) {
                let minPeminatForHighWage = Infinity;
                let bestJobForHighWage = null;

                jobWageDemandData.forEach(jobDataPoint => {
                    let totalPeminatHighWage = 0;
                    highWageCategories.forEach(wageCat => {
                        totalPeminatHighWage += (jobDataPoint[wageCat] as number) || 0;
                    });

                    // HANYA PERTIMBANGKAN JIKA MEMENUHI AMBANG BATAS MINIMUM PEMINAT
                    // DAN jumlah peminat kategori gaji tinggi lebih rendah dari minPeminatForHighWage yang ditemukan sejauh ini
                    if (totalPeminatHighWage >= MIN_PEMINAT_FOR_HIGH_WAGE_INSIGHT && totalPeminatHighWage < minPeminatForHighWage) {
                        minPeminatForHighWage = totalPeminatHighWage;
                        bestJobForHighWage = {
                            jabatan: jobDataPoint.name, // 'name' adalah nama jabatan yang sudah di-capitalize
                            peminat: totalPeminatHighWage,
                            wageCategories: highWageCategories.join(', ')
                        };
                    }
                });
                lowDemandHighWageJob = bestJobForHighWage;

                // Hitung tren untuk lowDemandHighWageJob yang ditemukan
                if (lowDemandHighWageJob) {
                    highWageJobTrend = getJobTrend(lowDemandHighWageJob.jabatan, baseFilteredData, 3);
                }
            }
        }

        return { highestDemandJob, lowestDemandJob, lowDemandHighWageJob, highWageJobTrend };
    }, [jobDemandData, jobWageDemandData, gajiOptions, baseFilteredData]);


    // Kalkulasi lebar chart dinamis untuk scrolling
    // Menargetkan lebar untuk sekitar 4 grup jabatan per tampilan, setiap grup sekitar 150px
    const MIN_WIDTH_PER_JOB_GROUP = 150;
    const chartDynamicWidth = jobWageDemandData.length * MIN_WIDTH_PER_JOB_GROUP;


    return (
        <div className="space-y-8">
            {/* Dropdown Filter Gaji */}
            <div className="flex justify-center mb-4">
                <Select onValueChange={setSelectedGajiFilter} value={selectedGajiFilter}>
                    <SelectTrigger className="w-[280px]"><SelectValue placeholder="Filter Rentang Gaji..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Rentang Gaji</SelectItem>
                        {gajiOptions
                            .filter(opt => mainData.some(item => cleanData(item.UPAH_DIINGINKAN) === opt))
                            .sort((a,b) => parseSalary(a) - parseSalary(b))
                            .map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Bagian Insight & Kartu Angka dan Chart Bawah */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                {/* Kolom Insight & Rekomendasi (KIRI) */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg flex flex-col">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <Lightbulb className="mr-2 h-6 w-6 text-yellow-500" />
                        Insight & Rekomendasi
                    </h3>
                    {insight ? (
                        <div className="w-full space-y-6 flex-grow">
                            {/* Insight Peminat Terbanyak */}
                            <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-lg border border-blue-300 transform transition-transform duration-300 hover:scale-105 cursor-pointer">
                                <div className="flex items-center justify-center mb-3">
                                    <div className="p-2 bg-blue-500 rounded-full">
                                        <FiTrendingUp className="h-7 w-7 text-white" />
                                    </div>
                                    <p className="font-bold text-blue-800 ml-3 text-lg">Peminat Terbanyak</p>
                                </div>
                                <p className="text-xl font-semibold text-blue-900 mb-1">Posisi:</p>
                                <p className="text-blue-900 text-3xl md:text-4xl font-extrabold leading-tight mb-2">"{insight.highestDemandJob.jabatan}"</p>
                                <p className="text-lg text-blue-800">dengan <span className="font-extrabold text-2xl">{insight.highestDemandJob.peminat.toLocaleString('id-ID')}</span> peminat</p>
                            </div>
                            {/* Insight Peluang Tersembunyi */}
                            <div className="p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl shadow-lg border border-yellow-300 transform transition-transform duration-300 hover:scale-105 cursor-pointer">
                                <div className="flex items-center justify-center mb-3">
                                    <div className="p-2 bg-yellow-500 rounded-full">
                                        <FiTarget className="h-7 w-7 text-white" />
                                    </div>
                                    <p className="font-bold text-yellow-800 ml-3 text-lg">Peluang Tersembunyi</p>
                                </div>
                                <p className="text-xl font-semibold text-yellow-900 mb-1">Pertimbangkan:</p>
                                <p className="text-yellow-900 text-3xl md:text-4xl font-extrabold leading-tight mb-2">"{insight.lowestDemandJob.jabatan}"</p>
                                <p className="text-lg text-yellow-800">dengan hanya <span className="font-extrabold text-2xl">{insight.lowestDemandJob.peminat.toLocaleString('id-ID')}</span> peminat</p>
                            </div>
                            {/* Insight Peluang Gaji Tinggi dengan Persaingan Rendah */}
                            {insight.lowDemandHighWageJob && (
                                <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-lg border border-green-300 transform transition-transform duration-300 hover:scale-105 cursor-pointer">
                                    <div className="flex items-center justify-center mb-3">
                                        <div className="p-2 bg-green-500 rounded-full">
                                            <FiDollarSign className="h-7 w-7 text-white" />
                                        </div>
                                        <p className="font-bold text-green-800 ml-3 text-lg">Peluang Gaji Tinggi</p>
                                    </div>
                                    <p className="text-xl font-semibold text-green-900 mb-1">Jabatan:</p>
                                    <p className="text-green-900 text-3xl md:text-4xl font-extrabold leading-tight mb-2">"{insight.lowDemandHighWageJob.jabatan}"</p>
                                    <p className="text-lg text-green-800">dengan <span className="font-extrabold text-2xl">{insight.lowDemandHighWageJob.peminat.toLocaleString('id-ID')}</span> peminat di kategori gaji tinggi ({insight.lowDemandHighWageJob.wageCategories}).</p>
                                    {insight.highWageJobTrend && insight.highWageJobTrend !== 'tidak ada data tren' && (
                                        <p className="mt-2 text-base font-bold text-green-800">
                                            Tren terbaru: <span className={insight.highWageJobTrend === 'meningkat' || insight.highWageJobTrend === 'muncul (tren naik)' ? 'text-green-900' : insight.highWageJobTrend === 'menurun' ? 'text-red-700' : 'text-green-700'}>
                                                {insight.highWageJobTrend}
                                            </span>.
                                        </p>
                                    )}
                                    {insight.highWageJobTrend === 'tidak ada data tren' && (
                                        <p className="mt-2 text-base font-italic text-gray-600"> (tren tidak tersedia)</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 flex-grow p-4">Data tidak cukup untuk menghasilkan insight. Silakan sesuaikan filter Anda.</p>
                    )}
                </div>

                {/* Kolom KANAN: Header kartu baru, Kartu Angka, dan Chart Bawah (Pie & Bar + Grouped Bar) */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {/* Header kartu baru */}
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg shadow-sm text-center">
                        <h2 className="text-xl font-semibold">
                            Analisis Peminat di Sektor <span className="text-blue-700">"{selectedSector}"</span>
                            {selectedPendidikan && <> Lulusan <span className="text-blue-700">"{selectedPendidikan}"</span></>}
                            {selectedGajiFilter !== 'all' && <> dengan Upah <span className="text-blue-700">"{selectedGajiFilter}"</span></>}
                        </h2>
                    </div>

                    {/* Grid untuk Kartu Angka dan Chart Pie/Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                        {/* Kartu 1: Total Peminat Sektor */}
                        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-lg shadow-xl flex flex-col items-center justify-center text-center transform hover:scale-105 transition-transform duration-300">
                            <Users className="h-12 w-12 mb-3 opacity-80" />
                            <p className="text-sm opacity-90 mb-1 leading-tight">
                                Total Peminat Sektor
                            </p>
                            <p className="text-4xl font-bold">{totalPeminatSektor.toLocaleString('id-ID')}</p>
                            <p className="text-sm opacity-80 mt-2">Jumlah keseluruhan pencari kerja berdasarkan profil yang diinput pengguna.</p>
                        </div>

                        {/* Kartu 2: Total Peminat Sektor Berdasarkan Upah */}
                        <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6 rounded-lg shadow-xl flex flex-col items-center justify-center text-center transform hover:scale-105 transition-transform duration-300">
                            <FiDollarSign className="h-12 w-12 mb-3 opacity-80" />
                            <p className="text-sm opacity-90 mb-1 leading-tight">
                                Peminat dengan Upah <span className="font-bold text-lg text-yellow-200">"{selectedGajiFilter === 'all' ? 'Semua Rentang' : selectedGajiFilter}"</span>
                            </p>
                            <p className="text-4xl font-bold">
                                {totalPeminatSektorByWage.toLocaleString('id-ID')}
                                {totalPeminatSektor > 0 && (
                                    <span className="block text-2xl font-semibold opacity-90 mt-1">
                                        ({percentageByWage.toFixed(1)}%)
                                    </span>
                                )}
                            </p>
                            <p className="text-sm opacity-80 mt-2">Jumlah pencari kerja dengan filter upah yang dipilih berdasarkan profil yang diinput pengguna.</p>
                        </div>

                        {/* NEW CARD: Rata-rata Umur Peminat */}
                        <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-lg shadow-xl flex flex-col items-center justify-center text-center transform hover:scale-105 transition-transform duration-300">
                            <CalendarDays className="h-12 w-12 mb-3 opacity-80" />
                            <p className="text-sm opacity-90 mb-1 leading-tight">
                                Rata-rata Umur Peminat
                            </p>
                            <p className="text-4xl font-bold">{averageAgeData.average} Tahun</p>
                            <p className="text-sm opacity-80 mt-2">Berdasarkan {averageAgeData.count} data peminat dengan profil yang diinput pengguna.</p>
                        </div>

                        {/* NEW CHART: Perbandingan Peminat Laki-laki vs. Perempuan (di bawah kartu biru) */}
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
                                        <Tooltip formatter={(value, name, props) => [`${value} Peminat`, name]} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-gray-500">
                                    Tidak ada data gender peminat yang tersedia untuk filter yang dipilih.
                                </div>
                            )}
                        </div>

                        {/* "Jabatan Berdasarkan Peminat" (Bar Chart dengan Angka) - di bawah kartu ungu & hijau */}
                        <div className="bg-white p-6 rounded-lg shadow-lg md:col-span-2">
                            <h4 className="font-semibold text-center mb-2">Jabatan Berdasarkan Peminat (Menurun)</h4>
                            {jobDemandData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={jobDemandData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="jabatan" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={80} />
                                        <YAxis />
                                        <Tooltip formatter={(value) => [value, 'Peminat']} />
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
                    </div>

                    {/* Grouped Bar Chart baru - dipindahkan ke dalam kolom kanan */}
                    <div className="bg-white p-6 rounded-lg shadow-lg mt-4"> {/* mt-4 untuk sedikit jarak dari chart di atasnya */}
                        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Peminat Gaji Berdasarkan Jabatan</h3>
                        {jobWageDemandData.length > 0 && hasNonZeroDataForGroupedChart ? (
                            // Wrapper div dengan overflow-x-auto untuk scrolling
                            <div style={{ overflowX: 'auto' }}>
                                {/* Tentukan lebar BarChart secara eksplisit di sini */}
                                <ResponsiveContainer width={chartDynamicWidth} minWidth="100%" height={400}>
                                    <BarChart data={jobWageDemandData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barCategoryGap="10%">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" height={100} />
                                        <YAxis label={{ value: 'Jumlah Peminat', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip formatter={(value, name) => [`${value} Peminat`, name]} />
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
                </div>
            </div>
        </div>
    );
};


// ===================================================================================
// KOMPONEN UTAMA (MainFeature.tsx)
// ===================================================================================
const MainFeature = () => {
    const [data, setData] = useState<DataItem[]>([]);
    const [filteredData, setFilteredData] = useState<DataItem[]>([]); // Untuk tabel pencarian cepat
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const itemsPerPage = 10;
    // REVERTED: step kembali ke alur linear
    const [step, setStep] = useState(0); // 0: Start, 1: Sektor, 2: Pendidikan, 3: Gaji, 4: Hasil
    const [selectedPendidikan, setSelectedPendidikan] = useState('');
    const [selectedSector, setSelectedSector] = useState('');
    const [selectedGaji, setSelectedGaji] = useState('');

    const [pendidikanOptions, setPendidikanOptions] = useState<string[]>([]);
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
                setPendidikanOptions(uniquePendidikan.sort() as string[]);

                const uniqueGaji = [...new Set(validData.map((item: DataItem) => cleanData(item.UPAH_DIINGINKAN)).filter(Boolean))];
                setGajiOptions(uniqueGaji.sort((a, b) => parseSalary(a) - parseSalary(b)) as string[]);

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

    // REVERTED: Filter opsi pendidikan kembali ke filtering berdasarkan sektor
    const filteredPendidikanOptions = useMemo(() => {
        if (!selectedSector) {
            // Jika sektor belum dipilih, tampilkan semua opsi pendidikan yang ada di data utama
            return [...new Set(data.map((item: DataItem) => cleanData(item.PENDIDIKAN)).filter(Boolean))].sort();
        }

        const filteredDataBySector = data.filter(item => {
            const jabatan = cleanData(item.JABATAN_DIINGINKAN_Normalized);
            const pendidikanItem = cleanData(item.PENDIDIKAN);
            const selectedSectorItem = sektorJabatanMap.find(s => s.sektor === selectedSector);
            const jabatansInSector = selectedSectorItem?.jabatan || [];
            return jabatan && jabatan !== '[]' && pendidikanItem && selectedSector && jabatansInSector.includes(jabatan.toLowerCase());
        });

        const uniquePendidikanForSector = [...new Set(filteredDataBySector.map(item => cleanData(item.PENDIDIKAN)).filter(Boolean))];
        return uniquePendidikanForSector.sort();
    }, [data, selectedSector]);

    // REVERTED: Filter opsi gaji kembali ke filtering berdasarkan sektor dan pendidikan
    const filteredGajiOptions = useMemo(() => {
        if (!selectedSector || !selectedPendidikan) {
            return []; // Jika sektor atau pendidikan belum dipilih, tidak ada opsi gaji
        }

        const filteredDataBySectorAndPendidikan = data.filter(item => {
            const jabatan = cleanData(item.JABATAN_DIINGINKAN_Normalized);
            const pendidikanItem = cleanData(item.PENDIDIKAN);
            const upahDiinginkanItem = cleanData(item.UPAH_DIINGINKAN);
            const selectedSectorItem = sektorJabatanMap.find(s => s.sektor === selectedSector);
            const jabatansInSector = selectedSectorItem?.jabatan || [];

            return jabatan && jabatan !== '[]' && pendidikanItem && upahDiinginkanItem &&
                   selectedSector && jabatansInSector.includes(jabatan.toLowerCase()) &&
                   selectedPendidikan && pendidikanItem === selectedPendidikan;
        });

        const uniqueGajiForSectorAndPendidikan = [...new Set(filteredDataBySectorAndPendidikan.map(item => cleanData(item.UPAH_DIINGINKAN)).filter(Boolean))];
        return uniqueGajiForSectorAndPendidikan.sort((a, b) => parseSalary(a) - parseSalary(b));
    }, [data, selectedSector, selectedPendidikan]);


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

    // REVERTED: handleNextStep kembali ke alur linear 3 langkah
    const handleNextStep = () => {
        if (step < 3) { // Hanya 3 langkah input (Sektor, Pendidikan, Gaji)
            setStep(prev => prev + 1);
        } else { // Setelah langkah 3 (Gaji), langsung ke tampilan hasil (step 4)
            setStep(4);
        }
    };

    // REVERTED: handleResetSearch kembali ke alur linear
    const handleResetSearch = () => {
        setStep(0);
        setSelectedSector('');
        setSelectedPendidikan('');
        setSelectedGaji('');
    };

    // REVERTED: renderStepContent kembali ke alur linear
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
                        <Select onValueChange={(value) => { setSelectedSector(value); setSelectedPendidikan(''); setSelectedGaji(''); }} value={selectedSector}>
                            <SelectTrigger><SelectValue placeholder="Pilih sektor..." /></SelectTrigger>
                            <SelectContent>{sektorOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h3 className="font-semibold mb-2">Langkah 2: Lulusan Terakhir</h3>
                        <Select onValueChange={(value) => { setSelectedPendidikan(value); setSelectedGaji(''); }} value={selectedPendidikan}>
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
                        <Select onValueChange={setSelectedGaji} value={selectedGaji}>
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

    // REVERTED: isNextButtonDisabled kembali ke alur linear
    const isNextButtonDisabled = useMemo(() => {
        if (step === 0) return false; // Tombol mulai selalu aktif
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

                {/* Render langkah-langkah pencarian terpandu */}
                {renderStepContent()}

                {/* Tombol Lanjutkan / Tampilkan Hasil, hanya tampil jika bukan step 0 atau 4 */}
                {step > 0 && step < 4 && (
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleNextStep} disabled={isNextButtonDisabled}>
                            {step === 3 ? 'Tampilkan Hasil & Insight' : 'Lanjutkan'} <FiChevronsRight className="ml-2" />
                        </Button>
                    </div>
                )}

                {/* Tampilkan visualisasi jika step = 4 */}
                {step === 4 && (
                    <div>
                        <JobVisualization
                            mainData={data}
                            selectedSector={selectedSector}
                            selectedPendidikan={selectedPendidikan}
                            selectedGaji={selectedGaji}
                            gajiOptions={gajiOptions}
                            allJabatanOptions={allRawJabatanOptions}
                        />

                        {/* LINE CHART UTAMA (Jan 2022 - Jun 2025) */}
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
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MainFeature;