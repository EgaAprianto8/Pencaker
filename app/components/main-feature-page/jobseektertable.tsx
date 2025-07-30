/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FiSearch, FiChevronLeft, FiChevronRight, FiUser, FiBriefcase, FiMapPin, FiCalendar, FiAward, FiTag } from 'react-icons/fi';

// Definitions (Pastikan ini sesuai dengan definisi di MainFeature)
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

// Helper functions (jika hanya digunakan di komponen ini, bisa dipindahkan ke sini)
const cleanData = (value: any): string => {
    if (typeof value !== 'string') return '';
    return value.replace(/\[\'|\'\]/g, '').trim();
};

interface JobSeekerTableProps {
    currentItems: DataItem[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    currentPage: number;
    totalPages: number;
    handlePreviousPage: () => void;
    handleNextPage: () => void;
}

const JobSeekerTable: React.FC<JobSeekerTableProps> = ({
    currentItems,
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    handlePreviousPage,
    handleNextPage,
}) => {
    const indexOfFirstItem = (currentPage - 1) * 10; // Asumsi itemsPerPage adalah 10

    return (
        <>
            {/* Bagian Judul dan Deskripsi Halaman */}
            <div className="text-center mb-8 pt-8">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-4 animate-fadeIn">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">Data Pencari Kerja</span>
                </h1>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto animate-slideUp">
                    Daftar lengkap data pencari kerja, dilengkapi dengan detail profil, pendidikan, keterampilan, dan preferensi.
                    Gunakan kolom pencarian di bawah untuk menemukan informasi spesifik dengan cepat.
                </p>
            </div>

            {/* Bagian Pencarian */}
            <div className="flex items-center justify-center mb-8">
                <div className="relative w-full max-w-xl">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                    <Input
                        type="text"
                        placeholder="Cari berdasarkan jurusan, jabatan, keterampilan, lokasi, atau upah diinginkan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-md transition-all duration-300 ease-in-out"
                    />
                </div>
            </div>

            {/* Bagian Tabel Data */}
            <div className="rounded-xl border border-gray-200 shadow-lg overflow-hidden mb-8 bg-white">
                {/* Perhatian di sini: Pastikan tidak ada spasi kosong atau baris baru antara tag <Table> dan tag anak langsungnya */}
                <Table className="min-w-full divide-y divide-gray-200">
                    <TableHeader className="bg-gray-100">
                        <TableRow>
                            <TableHead className="w-[80px] py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No.</TableHead>
                            <TableHead className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"><FiUser className="mr-2 inline-block text-blue-500" />Profil</TableHead>
                            <TableHead className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"><FiBriefcase className="mr-2 inline-block text-green-500" />Pendidikan</TableHead>
                            <TableHead className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"><FiAward className="mr-2 inline-block text-yellow-500" />Keterampilan</TableHead>
                            <TableHead className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"><FiTag className="mr-2 inline-block text-purple-500" />Jabatan & Upah</TableHead>
                            <TableHead className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"><FiMapPin className="mr-2 inline-block text-red-500" />Lokasi</TableHead>
                            <TableHead className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"><FiCalendar className="mr-2 inline-block text-teal-500" />Tanggal Penting</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100">
                        {currentItems.length > 0 ? (
                            currentItems.map((item, index) => (
                                <TableRow key={item.original_index} className="transition-all duration-200 ease-in-out hover:bg-blue-50">
                                    <TableCell className="font-medium py-3 px-4 text-gray-700">{indexOfFirstItem + index + 1}</TableCell>
                                    <TableCell className="py-3 px-4">
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cleanData(item.JENIS_KELAMIN) === 'l' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'} min-w-[70px] text-center`}>
                                                {cleanData(item.JENIS_KELAMIN) === 'l' ? 'Laki-laki' : 'Perempuan'}
                                            </span>
                                            <div>
                                                <div className="font-medium text-gray-800">{cleanData(item.UMUR_SAAT_DAFTAR)} tahun</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3 px-4">
                                        <div className="font-medium text-gray-800 capitalize">{cleanData(item.JURUSAN) || '-'}</div>
                                        <div className="text-sm text-gray-500 uppercase">{cleanData(item.PENDIDIKAN)} ({cleanData(item.TAHUN_LULUS)})</div>
                                    </TableCell>
                                    <TableCell className="py-3 px-4 capitalize text-gray-700">{cleanData(item.Keterampilan) || '-'}</TableCell>
                                    <TableCell className="py-3 px-4">
                                        <div className="font-medium text-gray-800 capitalize">{cleanData(item.JABATAN_DIINGINKAN_Normalized)}</div>
                                        <div className="text-sm text-gray-500">{cleanData(item.UPAH_DIINGINKAN)}</div>
                                    </TableCell>
                                    <TableCell className="py-3 px-4">
                                        <div className="font-medium text-gray-800 capitalize">{cleanData(item.WILAYAH_DIINGINKAN_DETAIL)}</div>
                                        <div className="text-sm text-gray-500 capitalize">{cleanData(item.KECAMATAN)}</div>
                                    </TableCell>
                                    <TableCell className="py-3 px-4">
                                        <div className="text-sm text-gray-500">Daftar: {cleanData(item.TANGGAL_DAFTAR)}</div>
                                        <div className="text-sm text-gray-500">Lahir: {cleanData(item.TGL_LAHIR)}</div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-40 text-center text-gray-500 text-lg">
                                    <div className="flex flex-col items-center justify-center">
                                        <FiSearch className="h-10 w-10 mb-3 text-gray-400" />
                                        Tidak ada data yang cocok dengan kriteria pencarian Anda.
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Bagian Paginasi */}
            <div className="flex items-center justify-between space-x-4 py-4 px-2">
                <span className="text-base text-gray-700">Halaman <span className="font-semibold">{currentPage}</span> dari <span className="font-semibold">{totalPages}</span></span>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="px-6 py-2 rounded-lg border border-blue-400 text-blue-600 hover:bg-blue-50 transition-colors duration-200 shadow-sm"
                    >
                        <FiChevronLeft className="mr-2 h-5 w-5" /> Sebelumnya
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="px-6 py-2 rounded-lg border border-blue-400 text-blue-600 hover:bg-blue-50 transition-colors duration-200 shadow-sm"
                    >
                        Berikutnya <FiChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>
        </>
    );
};

export default JobSeekerTable;