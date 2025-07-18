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
            
        </Card>

        {/* Menambahkan Komponen Dashboard Prediksi di Bawah Tabel Data */}
        <PredictionDashboard />
      </div>
    </main>
  );
}
