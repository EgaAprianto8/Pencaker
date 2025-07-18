/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FiSearch, FiChevronLeft, FiChevronRight, FiUser, FiBriefcase, FiMapPin, FiCalendar, FiAward, FiTag, FiRotateCcw, FiChevronsRight } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Lightbulb } from 'lucide-react';

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

// ===================================================================================
// PEMETAAN SEKTOR DAN JABATAN
// ===================================================================================
const sektorJabatanMap = [
    { sektor: "Manajerial", jabatan: ["manajer"] },
    { sektor: "Profesional, Ilmiah, & Teknis", jabatan: ["tenaga profesional", "teknisi dan asisten profesional", "aktivitas profesional, ilmiah, dan teknis"] },
    { sektor: "Administrasi & Tata Usaha", jabatan: ["tenaga tata usaha"] },
    { sektor: "Jasa & Penjualan", jabatan: ["tenaga usaha jasa dan tenaga penjualan", "perdagangan besar dan eceran, reparasi, dan perawatan mobil dan sepeda motor."] },
    { sektor: "Pertanian, Kehutanan, & Perikanan", jabatan: ["pekerja terampil pertanian, kehutanan, dan perikanan", "pertanian tanaman padi dan palawijaya", "hortikultura", "perkebunan", "perikanan", "peternakan", "kehutanan dan pertanian lainnya"] },
    { sektor: "Industri & Konstruksi", jabatan: ["pekerja pengolahan, kerajinan, dan yang berhubungan dengan itu", "operator dan perakitan mesin", "industri pengolahan", "konstruksi"] },
    { sektor: "Pekerja Kasar & Umum", jabatan: ["pekerja kasar"] },
    { sektor: "Layanan Publik & Sosial", jabatan: ["administrasi pemerintahan, pertahanan, dan jaminan sosial wajib", "pendidikan", "aktivitas kesehatan manusia dan aktivitas sosial", "kesenian, hiburan dan rekreasi", "aktivitas jasa lainnya", "tentara nasional indonesia (tni) dan kepolisian negara republik indonesia (polri)"] },
    { sektor: "Akomodasi & Transportasi", jabatan: ["pengangkutan dan pergudangan", "penyediaan akomodasi dan penyediaan makan minum"] },
    { sektor: "Utilitas & Lingkungan", jabatan: ["pengadaan listrik, gas, uap/air panas, dan udara dingin", "pengelolaan air, pengelolaan air limbah, pengelolaan dan daur ulang sampah, aktivitas remediasi"] },
    { sektor: "Lainnya", jabatan: ["informasi dan komunikasi", "aktivitas keuangan dan asuransi", "real estate", "aktivitas penyewaan dan sewa guna tanpa hak opsi, ketenagakerjaan, agen perjalanan, dan penunjang usaha lainnya", "aktivitas rumah tangga sebagai pemberi kerja", "aktivitas badan internasional dan badan ekstra internasional lainnya", "lain-lain"] }
];

const sektorOptions = sektorJabatanMap.map(item => item.sektor);


// Fungsi Helper
const cleanData = (value: any): string => {
    if (typeof value !== 'string') return '';
    return value.replace(/\[\'|\'\]/g, '').trim();
};

const capitalizeWords = (str: string): string => {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

// ===================================================================================
// KOMPONEN VISUALISASI
// ===================================================================================
type ProcessedJobData = {
    jabatan: string;
    peminat: number;
    gajiNumerik: number;
};

const parseSalary = (gaji: string): number => {
    if (!gaji || typeof gaji !== 'string') return 0;
    const cleaned = gaji.replace(/rp|\.| /gi, '').split('-')[0];
    return parseInt(cleaned, 10) || 0;
};

const JobVisualization = ({ data }: { data: DataItem[] }) => {
    const processedData = useMemo(() => {
        const jobCounts = new Map<string, { count: number; totalGaji: number }>();
        
        data.forEach(item => {
            const jabatan = cleanData(item.JABATAN_DIINGINKAN_Normalized);
            if (!jabatan || jabatan.toLowerCase() === 'lain-lain') return;

            const gajiNumerik = parseSalary(cleanData(item.UPAH_DIINGINKAN));
            
            const existing = jobCounts.get(jabatan);
            if (existing) {
                jobCounts.set(jabatan, {
                    count: existing.count + 1,
                    totalGaji: existing.totalGaji + gajiNumerik,
                });
            } else {
                jobCounts.set(jabatan, { count: 1, totalGaji: gajiNumerik });
            }
        });

        const result: ProcessedJobData[] = [];
        jobCounts.forEach((value, key) => {
            result.push({
                // PERBAIKAN: Jabatan diubah menjadi huruf kapital di sini
                jabatan: capitalizeWords(key), 
                peminat: value.count,
                gajiNumerik: value.totalGaji / value.count,
            });
        });

        return result;
    }, [data]);

    const sortedBySalary = useMemo(() => [...processedData].sort((a, b) => a.gajiNumerik - b.gajiNumerik), [processedData]);
    const sortedByPopularity = useMemo(() => [...processedData].sort((a, b) => b.peminat - a.peminat), [processedData]);

    const insight = useMemo(() => {
        if (processedData.length < 2) return null;
        const highestSalaryJob = [...processedData].sort((a, b) => b.gajiNumerik - a.gajiNumerik)[0];
        const lowestDemandJob = [...processedData].sort((a, b) => a.peminat - b.peminat)[0];
        const highestDemandJob = sortedByPopularity[0];
        return { highestSalaryJob, lowestDemandJob, highestDemandJob };
    }, [processedData, sortedByPopularity]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Lightbulb className="mr-2 h-6 w-6 text-yellow-500" />
                    Insight & Rekomendasi
                </h3>
                {insight ? (
                    <div className="space-y-4 text-sm text-gray-600">
                        <div>
                            <p className="font-semibold text-gray-800">Gaji Tertinggi 📈</p>
                            <p>Jabatan <strong className="text-blue-600">{insight.highestSalaryJob.jabatan}</strong> menawarkan potensi gaji tertinggi di sektor ini.</p>
                        </div>
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
                    <p className="text-gray-500">Data tidak cukup untuk menghasilkan insight.</p>
                )}
            </div>

            <div className="lg:col-span-2 space-y-8">
                <div>
                    <h4 className="font-semibold text-center mb-2">Jabatan Berdasarkan Rata-Rata Gaji (Meningkat)</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={sortedBySalary} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" hide />
                            {/* PERBAIKAN: 'textTransform' dihapus */}
                            <YAxis type="category" dataKey="jabatan" width={120} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value) => [new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value as number), "Rata-rata Gaji"]} />
                            <Legend />
                            <Bar dataKey="gajiNumerik" name="Gaji (Rp)" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div>
                    <h4 className="font-semibold text-center mb-2">Jabatan Berdasarkan Peminat (Menurun)</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={sortedByPopularity} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            {/* PERBAIKAN: 'textTransform' dihapus */}
                            <XAxis dataKey="jabatan" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip formatter={(value) => [value, 'Peminat']} />
                            <Legend />
                            <Bar dataKey="peminat" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};


// ===================================================================================
// KOMPONEN UTAMA (MainFeature.tsx)
// ===================================================================================
const MainFeature = () => {
    // ... State declarations are unchanged
    const [data, setData] = useState<DataItem[]>([]);
    const [filteredData, setFilteredData] = useState<DataItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const itemsPerPage = 10;
    const [step, setStep] = useState(0);
    const [selectedSector, setSelectedSector] = useState('');
    const [selectedPendidikan, setSelectedPendidikan] = useState('');
    const [selectedGaji, setSelectedGaji] = useState('');
    const [pendidikanOptions, setPendidikanOptions] = useState<string[]>([]);
    const [gajiOptions, setGajiOptions] = useState<string[]>([]);
    const [guidedSearchResult, setGuidedSearchResult] = useState<DataItem[]>([]);

    // ... useEffect for fetching data is unchanged
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/main_data.json'); 
                const jsonData = await response.json();
                const validData = jsonData.filter((item: any) => item.original_index && item.original_index !== "");
                
                setData(validData);
                setFilteredData(validData);

                const uniquePendidikan = [...new Set(validData.map((item: DataItem) => cleanData(item.PENDIDIKAN)).filter(Boolean))];
                const uniqueGaji = [...new Set(validData.map((item: DataItem) => cleanData(item.UPAH_DIINGINKAN)).filter(Boolean))];
                
                setPendidikanOptions(uniquePendidikan as string[]);
                setGajiOptions(uniqueGaji as string[]);
                
            } catch (error) {
                console.error("Gagal memuat data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // ... useEffect for search term is unchanged
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

    // ... handleNextStep and other handlers are unchanged
    const handleNextStep = () => {
        if (step < 3) {
            setStep(prev => prev + 1);
        } else {
            let results = data;
            
            if (selectedSector) {
                const jabatansInSector = sektorJabatanMap.find(s => s.sektor === selectedSector)?.jabatan || [];
                results = results.filter(item => jabatansInSector.includes(cleanData(item.JABATAN_DIINGINKAN_Normalized).toLowerCase()));
            }
            if (selectedPendidikan) {
                results = results.filter(item => cleanData(item.PENDIDIKAN) === selectedPendidikan);
            }
            if (selectedGaji) {
                results = results.filter(item => cleanData(item.UPAH_DIINGINKAN) === selectedGaji);
            }
            
            setGuidedSearchResult(results);
            setStep(4);
        }
    };

    const handleResetSearch = () => {
        setStep(1);
        setSelectedSector('');
        setSelectedPendidikan('');
        setSelectedGaji('');
        setGuidedSearchResult([]);
    };
    
    // ... renderStepContent and the rest of the JSX are unchanged
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h3 className="font-semibold mb-2">Langkah 1: Sektor Pekerjaan</h3>
                        <Select onValueChange={setSelectedSector} value={selectedSector}>
                            <SelectTrigger><SelectValue placeholder="Pilih sektor..." /></SelectTrigger>
                            <SelectContent>{sektorOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                );
            case 2:
                 return (
                    <div>
                        <h3 className="font-semibold mb-2">Langkah 2: Lulusan Terakhir</h3>
                         <Select onValueChange={setSelectedPendidikan} value={selectedPendidikan}>
                             <SelectTrigger><SelectValue placeholder="Pilih pendidikan..." /></SelectTrigger>
                            <SelectContent>{pendidikanOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                );
            case 3:
                return (
                     <div>
                         <h3 className="font-semibold mb-2">Langkah 3: Rentang Gaji</h3>
                         <Select onValueChange={setSelectedGaji} value={selectedGaji}>
                             <SelectTrigger><SelectValue placeholder="Pilih rentang gaji..." /></SelectTrigger>
                             <SelectContent>{gajiOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
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
                        <div className='mb-4'>
                            <p className='text-gray-700 font-semibold'>Hasil dan insight untuk sektor: <span className="text-blue-600">{selectedSector}</span></p>
                        </div>
                        {guidedSearchResult.length > 0 ? (
                            <JobVisualization data={guidedSearchResult} />
                        ) : (
                            <div className="h-48 text-center flex items-center justify-center bg-white rounded-lg shadow-inner">
                                <p className="text-gray-500">Tidak ada data yang cocok untuk divisualisasikan.<br/>Coba ubah kriteria pencarian Anda.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MainFeature;