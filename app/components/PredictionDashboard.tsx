// File: app/components/PredictionDashboard.tsx
// GANTI SELURUH ISI FILE INI

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

// --- DATA DUMMY SEDERHANA UNTUK MEMASTIKAN GRAFIK TAMPIL ---
const chartData = [
  { month: "Januari", peminat: 186 },
  { month: "Februari", peminat: 305 },
  { month: "Maret", peminat: 237 },
  { month: "April", peminat: 273 },
  { month: "Mei", peminat: 209 },
  { month: "Juni", peminat: 214 },
];

// Konfigurasi dasar untuk styling grafik, mengikuti pola dokumentasi
const chartConfig = {
  peminat: {
    label: "Peminat",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function PredictionDashboard() {
  return (
    <Card className="w-full mt-8">
      <CardHeader>
        <CardTitle className="text-2xl">Dashboard Prediksi</CardTitle>
        <CardDescription>
          Visualisasi Tren Peminat Jabatan (Contoh Dasar)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="peminat"
              type="monotone"
              // --- PERBAIKAN UTAMA DI SINI ---
              // Menerapkan warna menggunakan format CSS variable yang benar
              stroke="var(--color-peminat)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-peminat)",
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
