// File: app/components/PredictionDashboard.tsx

"use client";

import { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

// --- Tipe Data ---
type RawDataRow = {
  JABATAN_DIINGINKAN_Normalized: string;
  UPAH_DIINGINKAN: string;
  TANGGAL_DAFTAR: string;
};

type CleanDataRow = {
  jabatan: string;
  kategoriUpah: string;
  bulanDaftar: string; // Format 'YYYY-MM'
};

// --- Fungsi Helper ---
const extractValue = (rawValue: any): string => {
  const strValue = String(rawValue || "").trim();
  if (strValue.startsWith("['") && strValue.endsWith("']")) {
    return strValue.substring(2, strValue.length - 2);
  }
  return strValue;
};


// --- Komponen Utama ---
export default function PredictionDashboard() {
  const [allData, setAllData] = useState<CleanDataRow[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({});
  const [gajiCategories, setGajiCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State ini hanya untuk menyimpan pilihan EKSPLISIT dari pengguna
  const [selectedJabatan, setSelectedJabatan] = useState<string>("");

  // Efek ini HANYA untuk mengambil data dari file, satu kali saja.
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/dataset/DataSetArray.xlsx');
        if (!response.ok) {
          throw new Error(`Error ${response.status}: Gagal mengambil file dataset. Pastikan file ada di folder /public.`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawJsonData: RawDataRow[] = XLSX.utils.sheet_to_json(worksheet);

        const processedData = rawJsonData
          .map(row => {
            const cleanDateStr = extractValue(row.TANGGAL_DAFTAR);
            const jabatanNormalized = extractValue(row.JABATAN_DIINGINKAN_Normalized);
            const upah = extractValue(row.UPAH_DIINGINKAN);

            if (!cleanDateStr || !jabatanNormalized || !upah || !cleanDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              return null;
            }
            
            return {
              jabatan: jabatanNormalized,
              kategoriUpah: upah,
              bulanDaftar: cleanDateStr.substring(0, 7), 
            };
          })
          .filter((row): row is CleanDataRow => row !== null);

        if (processedData.length === 0) {
            throw new Error("Tidak ada data valid yang dapat diproses dari file Excel.");
        }
        
        setAllData(processedData);

        const uniqueGaji = Array.from(new Set(processedData.map(d => d.kategoriUpah))).sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, ''));
            const numB = parseInt(b.replace(/\D/g, ''));
            return numA - numB;
        });
        setGajiCategories(uniqueGaji);

        const newChartConfig: ChartConfig = {};
        uniqueGaji.forEach((category, index) => {
          newChartConfig[category] = {
            label: category,
            color: `hsl(var(--chart-${index + 1}))`,
          };
        });
        setChartConfig(newChartConfig);

      } catch (err: any) {
        setError(err.message);
        console.error("Error saat memuat data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []); // <-- Dependensi kosong, hanya berjalan sekali saat komponen dimuat.
  
  // Buat daftar jabatan unik dari data yang ada
  const jabatanList = useMemo(() => {
    return Array.from(new Set(allData.map(item => item.jabatan))).sort();
  }, [allData]);

  // *** PERUBAHAN UTAMA: Menurunkan state (Derived State) ***
  // Tentukan jabatan yang aktif untuk ditampilkan di chart.
  // Jika pengguna sudah memilih, gunakan pilihan tersebut.
  // Jika belum, dan daftar jabatan sudah ada, gunakan item pertama sebagai default.
  const activeJabatan = useMemo(() => {
      return selectedJabatan || (jabatanList.length > 0 ? jabatanList[0] : "");
  }, [selectedJabatan, jabatanList]);


  const chartData = useMemo(() => {
    // Gunakan `activeJabatan` yang sudah pasti punya nilai (jika data ada)
    if (!activeJabatan || allData.length === 0 || gajiCategories.length === 0) return [];
    
    const filteredDataByJob = allData.filter(item => item.jabatan === activeJabatan);
    
    if (filteredDataByJob.length === 0) return [];

    const dataByMonth = new Map<string, CleanDataRow[]>();
    filteredDataByJob.forEach(item => {
        const monthData = dataByMonth.get(item.bulanDaftar) || [];
        monthData.push(item);
        dataByMonth.set(item.bulanDaftar, monthData);
    });

    const allMonths = Array.from(dataByMonth.keys()).sort();
    if (allMonths.length === 0) return [];
    
    const startDate = new Date(allMonths[0] + '-01T00:00:00');
    const endDate = new Date(allMonths[allMonths.length - 1] + '-01T00:00:00');

    const fullPeriodRange: { key: string, label: string }[] = [];
    let currentDate = new Date(startDate);
    const locale = 'id-ID';

    while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        fullPeriodRange.push({
            key: `${year}-${String(month + 1).padStart(2, '0')}`,
            label: `${currentDate.toLocaleString(locale, { month: 'short' })} '${String(year).slice(2)}`
        });
        currentDate.setMonth(month + 1);
    }

    return fullPeriodRange.map(period => {
      const dataInPeriod = dataByMonth.get(period.key) || [];
      const periodSummary: { [key: string]: any } = {
        period: period.label,
        ...Object.fromEntries(gajiCategories.map(cat => [cat, 0]))
      };
      
      dataInPeriod.forEach(item => {
        if (periodSummary.hasOwnProperty(item.kategoriUpah)) {
          periodSummary[item.kategoriUpah]++;
        }
      });
      return periodSummary;
    });
    
  }, [activeJabatan, allData, gajiCategories]); // <-- Bergantung pada `activeJabatan`

  // --- Logika Render ---

  if (isLoading) {
    return (
        <Card className="w-full mt-8 shadow-lg">
            <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
            <CardContent><Skeleton className="h-[450px] w-full" /></CardContent>
        </Card>
    );
  }

  if (error) {
    return (
        <Card className="w-full mt-8 shadow-lg bg-destructive/10 border-destructive">
            <CardHeader><CardTitle className="text-destructive">Terjadi Kesalahan</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-destructive-foreground">{error}</p></CardContent>
        </Card>
    );
  }
  
  return (
    <Card className="w-full mt-8 shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Analisis Peminat Jabatan per Kategori Gaji</CardTitle>
            <CardDescription>Jumlah peminat untuk jabatan terpilih dari waktu ke waktu.</CardDescription>
          </div>
          <div className="w-full sm:w-auto">
            {/* Gunakan `activeJabatan` untuk nilai & `setSelectedJabatan` untuk mengubah */}
            <Select value={activeJabatan} onValueChange={setSelectedJabatan} disabled={jabatanList.length === 0}>
              <SelectTrigger className="w-full sm:w-[280px]"><SelectValue placeholder="Pilih Jabatan" /></SelectTrigger>
              <SelectContent>{jabatanList.map(jabatan => (<SelectItem key={jabatan} value={jabatan}>{jabatan}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[450px] w-full">
            <ResponsiveContainer>
                <ChartContainer config={chartConfig}>
                    <LineChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis 
                        dataKey="period" 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={8}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                        allowDecimals={false} 
                        tickLine={false} 
                        axisLine={false} 
                        width={30}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <ChartTooltip
                        cursor={true}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Legend verticalAlign="top" align="center" wrapperStyle={{paddingBottom: '20px'}} />
                    
                    {gajiCategories.map((category) => (
                        <Line
                        key={category}
                        dataKey={category}
                        type="monotone"
                        stroke={chartConfig[category]?.color || "#8884d8"}
                        strokeWidth={2}
                        // Menghapus 'dot={false}' memungkinkan garis muncul secara default
                        activeDot={{ r: 6 }} 
                        />
                    ))}
                    </LineChart>
                </ChartContainer>
            </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground">
          {activeJabatan ? `Menampilkan data peminat untuk ${activeJabatan}.` : "Pilih jabatan untuk melihat data."}
        </div>
      </CardFooter>
    </Card>
  );
}