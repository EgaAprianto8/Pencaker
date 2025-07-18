// File: app/page.jsx

// Import modul yang diperlukan dari Node.js untuk membaca file
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx'; // Library untuk membaca file Excel

// Import komponen UI dari shadcn
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Fungsi untuk membaca data mentah dari file Excel
async function getData(): Promise<(string | number)[][]> {
  // Pastikan path ini benar sesuai struktur proyek Anda
  const filePath = path.join(process.cwd(), 'app', 'dataset', 'DataSetArray.xlsx');
  try {
    const fileBuffer = fs.readFileSync(filePath);
    // Menggunakan 'Sheet 1' sebagai nama sheet default
    const sheet = XLSX.read(fileBuffer, { type: 'buffer' }).Sheets['Sheet 1'];
    if (!sheet) {
        console.error("Error: Sheet 'Sheet 1' tidak ditemukan di dalam file Excel.");
        return [];
    }
    return XLSX.utils.sheet_to_json(sheet, { header: 1 });
  } catch (error) {
    console.error(`Gagal membaca file di path: ${filePath}`, error);
    return [];
  }
}

// Parser untuk mengurai satu baris data yang sudah direkonstruksi
const parseRow = (rowString: string): string[] => {
    if (!rowString || typeof rowString !== 'string') {
        return [];
    }

    // 1. Ambil nomor indeks di awal string
    const indexMatch = rowString.match(/^(\d+)/);
    const index = indexMatch ? indexMatch[1] : '';

    // 2. Temukan semua konten di dalam kurung siku [...]
    const itemMatches = rowString.matchAll(/\[(.*?)\]/g);
    const rowData: string[] = [];

    // 3. Loop setiap item, bersihkan dari kutip, dan tambahkan ke array
    for (const itemMatch of itemMatches) {
        let content = itemMatch[1]; // Ambil konten di dalam kurung, misal: "'l'"
        // Hapus tanda kutip tunggal atau ganda di awal dan akhir
        if ((content.startsWith("'") && content.endsWith("'")) || (content.startsWith('"') && content.endsWith('"'))) {
            content = content.substring(1, content.length - 1);
        }
        rowData.push(content);
    }
    
    // 4. Gabungkan kembali dengan nomor indeks di depan jika ada
    return index ? [index, ...rowData] : rowData;
};


// Ini adalah Server Component, yang akan berjalan di server
export default async function HomePage() {
  const rawData = await getData();

  // Definisikan header tabel secara manual
  const headers = [
    'No', 'Tgl Lahir', 'Gender', 'Tgl Daftar', 'Kecamatan',
    'Pendidikan', 'Jurusan', 'Thn Lulus', 'Keterampilan',
    'Upah', 'Jabatan', 'Wilayah',
    'Wilayah Detail', 'Umur', 'Jabatan Norm',
    'Wilayah Norm', 'Keterampilan Cleaned'
  ];

  let rows: string[][] = [];

  // --- LOGIKA UTAMA YANG DIPERBARUI TOTAL ---
  // Cek jika ada data mentah (lebih dari 1 baris, karena baris pertama adalah header)
  if (rawData && rawData.length > 1) {
      // Ambil semua baris kecuali header dari file Excel
      const dataRows = rawData.slice(1);
      
      // Loop melalui setiap baris data mentah dari Excel
      rows = dataRows.map(rawRow => {
          // GABUNGKAN SEMUA KOLOM dari baris Excel menjadi satu string
          // untuk merekonstruksi data yang mungkin terpisah.
          const reconstructedString = rawRow.join('');
          
          // Parse string yang sudah digabung untuk mendapatkan kolom-kolom yang bersih
          return parseRow(reconstructedString);
      }).filter(row => row.length > 1); // Hanya simpan baris yang berhasil di-parse
  }

  const top5Rows = rows.slice(0, 5);

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-12 lg:p-24 bg-gray-50">
      <div className="w-full max-w-7xl">
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl">Dashboard Prediksi</CardTitle>
                <CardDescription>
                    Menampilkan <strong>5 data teratas</strong> dari file <strong>/app/dataset/DataSetArray.xlsx</strong>.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {top5Rows.length > 0 ? (
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
                                {top5Rows.map((row, rowIndex) => (
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
                        <p className="text-red-500 font-semibold">Gagal memuat data atau data kosong.</p>
                        <p className="text-gray-600 mt-2">Format data di file Excel mungkin tidak dapat diurai. Pastikan file ada di <code className="bg-gray-200 p-1 rounded">app/dataset/DataSetArray.xlsx</code>.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
