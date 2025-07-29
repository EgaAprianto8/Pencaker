// lib/major-sektors.ts
import { sektorJabatanMap } from '@/app/components/main-feature-page/sektor-jabatan-map';
import React from 'react';
import {
  Tractor,
  Bolt,
  HardHat,
  ShoppingCart,
  Briefcase,
  Users,
  LucideProps
} from 'lucide-react';

export type MajorSector = {
  id: string;
  name: string;
  icon: React.ComponentType<LucideProps>;
  subSectors: string[]; // Daftar nama sektor dari sektorJabatanMap
  color: string;
};

// Fungsi ini akan menghitung jumlah JABATAN (kategori lapangan usaha) di dalam subsektor
export const calculateTotalCategoriesInSubsectors = (subSectors: string[]): number => {
  let total = 0;
  subSectors.forEach(subSectorName => {
    const sector = sektorJabatanMap.find(s => s.sektor === subSectorName);
    if (sector) {
      total += sector.jabatan.length;
    }
  });
  return total;
};

// Fungsi BARU ini akan menghitung jumlah SUBSEKTOR di dalam parent kategori
export const calculateTotalSubSectors = (subSectors: string[]): number => {
  return subSectors.length;
};

export const majorSectors: MajorSector[] = [
  {
    id: "pertanian-kehutanan-perikanan-peternakan",
    name: "Sektor Pertanian, Kehutanan, Perikanan, dan Peternakan",
    icon: Tractor,
    subSectors: ["Pertanian, Kehutanan, & Perikanan"],
    color: "#6B46C1"
  },
  {
    id: "pertambangan-energi-utilitas",
    name: "Sektor Pertambangan, Energi, dan Utilitas",
    icon: Bolt,
    subSectors: ["Utilitas & Lingkungan"],
    color: "#D69E2E"
  },
  {
    id: "konstruksi-infrastruktur",
    name: "Sektor Konstruksi dan Infrastruktur",
    icon: HardHat,
    subSectors: ["Industri & Konstruksi"],
    color: "#38A169"
  },
  {
    id: "perdagangan-pariwisata-akomodasi",
    name: "Sektor Perdagangan, Pariwisata, dan Akomodasi",
    icon: ShoppingCart,
    subSectors: ["Jasa & Penjualan", "Akomodasi & Transportasi"],
    color: "#9F7AEA"
  },
  {
    id: "jasa-profesional-keuangan",
    name: "Sektor Jasa Profesional dan Keuangan",
    icon: Briefcase,
    subSectors: ["Profesional, Ilmiah, & Teknis", "Manajerial", "Administrasi & Tata Usaha", "Keuangan & Asuransi"],
    color: "#4299E1"
  },
  {
    id: "layanan-publik-sosial",
    name: "Sektor Layanan Publik dan Sosial",
    icon: Users,
    subSectors: ["Layanan Publik & Sosial", "Pekerja Kasar & Umum", "Lainnya"],
    color: "#ED8936"
  },
];