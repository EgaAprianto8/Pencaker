/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FiSearch, FiChevronLeft, FiChevronRight, FiUser, FiBriefcase, FiMapPin, FiCalendar, FiAward, FiTag, FiRotateCcw, FiChevronsRight } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList, PieChart, Pie } from 'recharts';
import { Lightbulb, Users, DollarSign, CalendarDays } from 'lucide-react';

import { sektorJabatanMap, sektorOptions } from './sektor-jabatan-map';
import HistoricalJobDemandChart from './historical-wage-trend-chart';

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

    const insight = useMemo(() => {
        if (jobDemandData.length < 2) return null;
        const highestDemandJob = jobDemandData[0];
        const lowestDemandJob = [...jobDemandData].sort((a, b) => a.peminat - b.peminat)[0];

        return { highestDemandJob, lowestDemandJob };
    }, [jobDemandData]);

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

    const COLORS = ['#0088FE', '#FF8042'];

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
                        <div className="space-y-4 text-sm text-gray-600 flex-grow">
                            <div>
                                <p className="font-semibold text-gray-800">Peminat Terbanyak 🔥</p>
                                <p>Posisi <strong className="text-blue-600">{insight.highestDemandJob.jabatan}</strong> adalah yang paling populer dengan <strong className="text-blue-600">{insight.highestDemandJob.peminat}</strong> peminat.</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Peluang Tersembunyi 💎</p>
                                <p>Pertimbangkan <strong className="text-blue-600">{insight.lowestDemandJob.jabatan}</strong>, yang memiliki tingkat persaingan paling rendah dengan hanya <strong className="text-blue-600">{insight.lowestDemandJob.peminat}</strong> peminat.</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 flex-grow">Data tidak cukup untuk menghasilkan insight.</p>
                    )}
                </div>

                {/* Kolom KANAN: Header kartu baru, Kartu Angka, dan Chart Bawah (Pie & Bar) */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {/* Header kartu baru */}
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg shadow-sm text-center">
                        <h2 className="text-xl font-semibold">
                            Analisis Peminat di Sektor <span className="text-blue-700">"{selectedSector}"</span>
                            {selectedPendidikan && <> Lulusan <span className="text-blue-700">"{selectedPendidikan}"</span></>}
                            {selectedGajiFilter !== 'all' && <> dengan Upah <span className="text-blue-700">"{selectedGajiFilter}"</span></>}
                        </h2>
                    </div>

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
                            <DollarSign className="h-12 w-12 mb-3 opacity-80" />
                            <p className="text-sm opacity-90 mb-1 leading-tight">
                                Peminat dengan Upah <span className="font-bold text-lg text-yellow-200">"{selectedGajiFilter === 'all' ? 'Semua Rentang' : selectedGajiFilter}"</span>
                            </p>
                            <p className="text-4xl font-bold">{totalPeminatSektorByWage.toLocaleString('id-ID')}</p>
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
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                                                <Cell key={`cell-${index}`} fill={['#82ca9d', '#ffc658', '#8884d8', '#a4de6c', '#d0ed57'][index % 5]} />
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
                </div>
            </div>

            {/* LINE CHART BARU (JAN 2025 - JUN 2025) - TETAP DI DALAM JobVisualization */}
            <div className="w-full">
                <HistoricalJobDemandChart
                    mainData={mainData}
                    allJabatanOptions={allJabatanOptions}
                    selectedSector={selectedSector}
                    selectedGajiFilter={selectedGajiFilter}
                    chartTitle={`Tren Peminat Jabatan di Sektor "${selectedSector}" (Jan 2025 - Jun 2025)`}
                    startDateProp="2025-01-01"
                    endDateProp="2025-06-30"
                />
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
    const [step, setStep] = useState(0); // 0: Start, 1: Sektor, 2: Pendidikan, 3: Gaji, 4: Hasil
    const [selectedSector, setSelectedSector] = useState('');
    const [selectedPendidikan, setSelectedPendidikan] = useState('');
    const [selectedGaji, setSelectedGaji] = useState(''); // Gaji dari guided search
    const [pendidikanOptions, setPendidikanOptions] = useState<string[]>([]); // Ini akan dihapus atau diabaikan
    const [gajiOptions, setGajiOptions] = useState<string[]>([]); // Ini akan tetap untuk JobVisualization
    const [allRawJabatanOptions, setAllRawJabatanOptions] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responseMain = await fetch('/main_data.json');
                const jsonDataMain = await responseMain.json();
                const validData = jsonDataMain.filter((item: any) => item.original_index && item.original_index !== "");

                setData(validData);
                setFilteredData(validData);

                // Tetap ambil semua opsi gaji untuk filter di dalam JobVisualization
                const uniqueGaji = [...new Set(validData.map((item: DataItem) => cleanData(item.UPAH_DIINGINKAN)).filter(Boolean))];
                setGajiOptions(uniqueGaji.sort(({a,b} : any) => parseSalary(a) - parseSalary(b)) as string[]);

                // Tetap ambil semua opsi jabatan mentah untuk HistoricalJobDemandChart
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

    // NEW: Filter opsi pendidikan berdasarkan sektor yang dipilih
    const filteredPendidikanOptions = useMemo(() => {
        if (!selectedSector) {
            return []; // Jika sektor belum dipilih, tidak ada opsi pendidikan
        }

        const filteredDataBySector = data.filter(item => {
            const jabatan = cleanData(item.JABATAN_DIINGINKAN_Normalized);
            const selectedSectorItem = sektorJabatanMap.find(s => s.sektor === selectedSector);
            const jabatansInSector = selectedSectorItem?.jabatan || [];
            // Pastikan jabatan tidak kosong atau "[]"
            return jabatan && jabatan !== '[]' && selectedSector && jabatansInSector.includes(jabatan.toLowerCase());
        });

        const uniquePendidikanForSector = [...new Set(filteredDataBySector.map(item => cleanData(item.PENDIDIKAN)).filter(Boolean))];
        return uniquePendidikanForSector.sort();
    }, [data, selectedSector]);

    // NEW: Filter opsi gaji berdasarkan sektor dan pendidikan yang dipilih
    const filteredGajiOptions = useMemo(() => {
        if (!selectedSector || !selectedPendidikan) {
            return []; // Jika sektor atau pendidikan belum dipilih, tidak ada opsi gaji
        }

        const filteredDataBySectorAndPendidikan = data.filter(item => {
            const jabatan = cleanData(item.JABATAN_DIINGINKAN_Normalized);
            const pendidikanItem = cleanData(item.PENDIDIKAN);
            const selectedSectorItem = sektorJabatanMap.find(s => s.sektor === selectedSector);
            const jabatansInSector = selectedSectorItem?.jabatan || [];

            // Pastikan jabatan tidak kosong atau "[]"
            return jabatan && jabatan !== '[]' &&
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

    const handleNextStep = () => {
        if (step < 3) {
            setStep(prev => prev + 1);
        } else {
            setStep(4);
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
            case 1:
                return (
                    <div>
                        <h3 className="font-semibold mb-2">Langkah 1: Sektor Pekerjaan</h3>
                        {/* Reset pendidikan dan gaji saat sektor berubah */}
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
                        {/* Reset gaji saat pendidikan berubah */}
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

                {step === 0 && (
                    <div className="text-center py-6">
                        <p className="text-gray-600 mb-4">Tidak menemukan yang Anda cari? Coba pencarian langkah-demi-langkah untuk melihat insight pasar kerja.</p>
                        <Button onClick={() => setStep(1)} size="lg">
                            <FiSearch className="mr-2" /> Mulai Pencarian Terpandu
                        </Button>
                    </div>
                )}

                {step > 0 && step < 4 && (
                    <div className="space-y-6">
                        {renderStepContent()}
                        <div className="flex justify-end pt-4">
                            <Button onClick={handleNextStep} disabled={
                                (step === 1 && !selectedSector) ||
                                (step === 2 && !selectedPendidikan) ||
                                (step === 3 && !selectedGaji)
                            }>
                                {step === 3 ? 'Tampilkan Hasil & Insight' : 'Lanjutkan'} <FiChevronsRight className="ml-2" />
                            </Button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div>
                        <JobVisualization
                            mainData={data}
                            selectedSector={selectedSector}
                            selectedPendidikan={selectedPendidikan}
                            selectedGaji={selectedGaji}
                            gajiOptions={gajiOptions} // Opsi gaji lengkap untuk filter di dalam JobVisualization
                            allJabatanOptions={allRawJabatanOptions} // Opsi jabatan lengkap untuk HistoricalJobDemandChart
                        />

                        {/* LINE CHART UTAMA (JAN 2022 - JUN 2025) - POSISI SEBELUMNYA */}
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