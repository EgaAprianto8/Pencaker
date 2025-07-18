/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // Komponen ini interaktif di sisi klien

import { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Definisikan header tabel secara manual
const headers = [
    'No', 'Tgl Lahir', 'Gender', 'Tgl Daftar', 'Kecamatan',
    'Pendidikan', 'Jurusan', 'Thn Lulus', 'Keterampilan',
    'Upah', 'Jabatan', 'Wilayah',
    'Wilayah Detail', 'Umur', 'Jabatan Norm',
    'Wilayah Norm', 'Keterampilan Cleaned'
];

// Indeks kolom untuk 'Kecamatan' berdasarkan array headers di atas
const KECAMATAN_COLUMN_INDEX = 4;

// Komponen ini menerima data yang sudah diproses dari server
export default function FilterableTable({ initialData }: { initialData: string[][] }) {
  // State untuk menyimpan data yang difilter, daftar kecamatan, dan filter aktif
  const [filteredData, setFilteredData] = useState<string[][]>([]);
  const [kecamatanList, setKecamatanList] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState('Semua');

  // useEffect untuk menginisialisasi state saat data dari server diterima
  useEffect(() => {
    // --- PERUBAHAN DI SINI --- Menampilkan 10 data pertama secara default
    setFilteredData(initialData.slice(0, 10));

    // Ekstrak daftar kecamatan yang unik dari data
    const uniqueKecamatan = [...new Set(initialData.map(row => row[KECAMATAN_COLUMN_INDEX]))];
    setKecamatanList(uniqueKecamatan.filter(Boolean).sort()); // Hapus nilai kosong dan urutkan
  }, [initialData]);

  // Fungsi untuk menangani klik tombol filter
  const handleFilterClick = (kecamatan: string) => {
    setActiveFilter(kecamatan);
    if (kecamatan === 'Semua') {
      // Jika 'Semua', tampilkan 10 data teratas dari semua data
      setFilteredData(initialData.slice(0, 10));
    } else {
      // Filter data berdasarkan kecamatan yang dipilih
      const dataByKecamatan = initialData.filter(row => row[KECAMATAN_COLUMN_INDEX] === kecamatan);
      // --- PERUBAHAN DI SINI --- Tampilkan 10 data teratas dari hasil filter
      setFilteredData(dataByKecamatan.slice(0, 10));
    }
  };

  return (
    <>
      <div className="mb-4">
        <p className="text-sm font-medium mb-2">Filter Berdasarkan Kecamatan:</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeFilter === 'Semua' ? 'default' : 'outline'}
            onClick={() => handleFilterClick('Semua')}
          >
            Semua
          </Button>
          {kecamatanList.map(kecamatan => (
            <Button
              key={kecamatan}
              variant={activeFilter === kecamatan ? 'default' : 'outline'}
              onClick={() => handleFilterClick(kecamatan)}
            >
              {kecamatan}
            </Button>
          ))}
        </div>
      </div>
      <Separator className="my-4" />
      
      {filteredData.length > 0 ? (
          <div className="relative w-full overflow-auto border rounded-lg">
              <Table>
                  <TableHeader className="bg-gray-100 dark:bg-gray-800">
                      <TableRow>
                          {headers.map((header, index) => (
                              <TableHead key={index} className="whitespace-nowrap px-4 py-3 font-semibold">
                                  {String(header)}
                              </TableHead>
                          ))}
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {filteredData.map((row, rowIndex) => (
                          <TableRow key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                              {row.map((cell, cellIndex) => (
                                  <TableCell key={cellIndex} className="whitespace-nowrap px-4 py-3">
                                      {cell}
                                  </TableCell>
                              ))}
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </div>
      ) : (
          <div className="text-center py-10">
              <p className="text-gray-500 font-semibold">Tidak ada data yang cocok untuk kecamatan "{activeFilter}".</p>
          </div>
      )}
    </>
  );
}