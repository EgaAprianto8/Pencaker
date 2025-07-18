// ===================================================================================
// File: app/page.tsx
// TIDAK ADA PERUBAHAN DI FILE INI, HANYA DISERTAKAN UNTUK KELENGKAPAN
// ===================================================================================

import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FilterableTable from './components/FilterTable';
import PredictionDashboard from './components/PredictionDashboard';

// Fungsi untuk membaca dan mem-parsing data dari file Excel di server
async function getData(): Promise<string[][]> {
  const filePath = path.join(process.cwd(), 'app', 'dataset', 'DataSetArray.xlsx');
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const sheet = XLSX.read(fileBuffer, { type: 'buffer' }).Sheets['Sheet 1'];
    if (!sheet) return [];
    
    const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (!rawData || rawData.length <= 1) return [];

    const dataRows = rawData.slice(1);
    const rows = dataRows.map((rawRow: any[]) => {
        const reconstructedString = rawRow.join('');
        return parseRow(reconstructedString);
    }).filter(row => row.length > 1);

    return rows;
  } catch (error) {
    console.error("Gagal membaca atau mem-parsing file:", error);
    return [];
  }
}

// Parser untuk mengurai satu baris data
const parseRow = (rowString: string): string[] => {
    if (!rowString || typeof rowString !== 'string') return [];
    const indexMatch = rowString.match(/^(\d+)/);
    const index = indexMatch ? indexMatch[1] : '';
    const itemMatches = rowString.matchAll(/\[(.*?)\]/g);
    const rowData: string[] = [];
    for (const itemMatch of itemMatches) {
        let content = itemMatch[1];
        if ((content.startsWith("'") && content.endsWith("'")) || (content.startsWith('"') && content.endsWith('"'))) {
            content = content.substring(1, content.length - 1);
        }
        rowData.push(content);
    }
    return index ? [index, ...rowData] : rowData;
};

// Halaman utama (Server Component)
export default async function HomePage() {
  // Membaca dan mem-parsing data di server
  const processedData = await getData();

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-12 lg:p-24 bg-gray-50">
      <div className="w-full max-w-7xl">
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl">Dashboard Pencari Kerja</CardTitle>
                <CardDescription>
                    Dataset dari file <strong>/app/dataset/DataSetArray.xlsx</strong>.
                </CardDescription>
            </CardHeader> 
            <CardContent>
                {processedData.length > 0 ? (
                    // Me-render Client Component dan mengirimkan data sebagai prop
                    <FilterableTable initialData={processedData} />
                ) : (
                    <div className="text-center py-10">
                        <p className="text-red-500 font-semibold">Gagal memuat data atau data kosong.</p>
                        <p className="text-gray-600 mt-2">Pastikan file ada dan formatnya benar.</p>
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Menambahkan Komponen Dashboard Prediksi di Bawah Tabel Data */}
        <PredictionDashboard />
      </div>
    </main>
  );
}
