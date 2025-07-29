// components/landing-page/sector-categori-section.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { majorSectors, calculateTotalSubSectors, MajorSector } from '@/lib/major-sektors';
// Path ini TIDAK akan saya ganti, sesuai permintaan Anda.
import { sektorJabatanMap } from '../main-feature-page/sektor-jabatan-map'; 

// Import untuk navigasi Next.js
import { useRouter } from 'next/navigation';
 
import { // Mengabaikan warning unused-vars untuk grup import ini
  Tractor,
  Bolt,
  HardHat,
  ShoppingCart,
  Briefcase,
  Users,
  LucideProps,
  ArrowLeft,
  GraduationCap, // Ikon baru untuk pendidikan
  Wallet, // Ikon baru untuk gaji
  LayoutList, // Ikon baru untuk kategori umum
  Zap, // Ikon baru untuk tombol mulai
  Lightbulb, // Ikon lain yang bisa dipakai untuk tombol mulai
  LineChart, // Ikon untuk analisis
  Target,
  Rocket,
  TrendingUp,
  Handshake,
  DollarSign
} from 'lucide-react';

// ==============================================================================
// Defenisi & Fungsi Pembantu (ambil dari MainFeature)
// ==============================================================================
interface SektorJabatanMapItem {
  sektor: string;
  jabatan: string[];
}

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

const cleanData = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.replace(/\[\'|\'\]/g, '').trim();
  }
  return '';
};

const parseSalary = (gaji: string): number => {
  if (!gaji || typeof gaji !== 'string') return 0;
  const cleaned = gaji.replace(/rp|\.| /gi, '').split('-')[0];
  return parseInt(cleaned, 10) || 0;
};

// Fungsi untuk mendapatkan komponen ikon berdasarkan nama string
const getIconComponent = (iconName: string): React.ComponentType<LucideProps> | null => {
  switch (iconName) {
    case "Tractor": return Tractor;
    case "Bolt": return Bolt;
    case "HardHat": return HardHat;
    case "ShoppingCart": return ShoppingCart;
    case "Briefcase": return Briefcase;
    case "Users": return Users;
    default: return null;
  }
};

// ==============================================================================
// KOMPONEN CARD (untuk Kategori, Subsektor, Pendidikan, Gaji) - DIKEMBALIKAN KE DESAIN SEBELUMNYA
// ==============================================================================

interface CommonCardProps {
  label: string;
  description?: string;
  icon?: React.ComponentType<LucideProps> | null;
  isSelected?: boolean;
  onClick: () => void;
  iconSizePx: number;
  iconMarginRightPx: number;
}

const CommonCard: React.FC<CommonCardProps> = ({
  label, description, icon: IconComponent, isSelected = false, onClick, iconSizePx, iconMarginRightPx
}) => {
  const categoryLeftMargin = `${iconSizePx + iconMarginRightPx}px`;

  return (
    <div
      onClick={onClick}
      className={`
        relative group p-6 border-2 rounded-xl // Mengembalikan rounded-xl
        ${isSelected 
          ? 'bg-gradient-to-br from-[#6366F1] to-[#A5B4FC] border-[#6366F1] shadow-[0_0_25px_rgba(99,102,241,0.8)]' // Mengembalikan warna selected lama
          : 'bg-white border-gray-200 shadow-md'} // Mengembalikan warna default lama
        hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] 
        hover:bg-gradient-to-br hover:from-[#6366F1] hover:to-[#A5B4FC] // Mengembalikan gradien hover lama
        transition-all duration-300 ease-in-out
        flex flex-col justify-between items-start h-40 w-full 
        cursor-pointer
      `}
      // Menghapus inline style boxShadow dan borderRadius
    >
      {/* Grup Atas: Ikon dan Judul/Label */}
      <div className="flex items-start">
        {IconComponent ? (
          <IconComponent
            size={iconSizePx}
            className={`
              mr-3 transition-colors duration-300 flex-shrink-0 
              ${isSelected ? 'text-white' : 'text-[#6366F1]'} 
              // Menghapus group-hover:text-white dan group-hover:animate-bounce
            `} 
          />
        ) : (
          <div className={`
            w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 
            ${isSelected ? 'text-white' : 'text-gray-500'} 
            group-hover:animate-pulse // Hanya animasi pulse yang tersisa (dari kode awal)
            // Menghapus group-hover:text-white
          `}>?</div> 
        )}

        <h3 className={`
          text-xl md:text-2xl font-semibold leading-tight transition-colors duration-300 
          ${isSelected ? 'text-white' : 'text-gray-800'} 
          // Menghapus group-hover:text-white
        `}> 
          {label}
        </h3>
      </div>
      
      {/* Elemen Bawah: Deskripsi */}
      {description && (
        <p
          className={`
            text-sm md:text-base transition-colors duration-300 
            ${isSelected ? 'text-gray-100' : 'text-gray-600'} // Mengembalikan warna deskripsi lama
            // Menghapus group-hover:text-gray-300
          `} 
          style={{ marginLeft: categoryLeftMargin }}
        >
          {description}
        </p>
      )}
      {/* Ikon Chevron di kanan untuk indikasi interaktif (opsional) */}
       {/* Tidak dimodifikasi karena ini bukan fokus utama */}
       {/* (Anda bisa menambahkan ChevronRight di sini jika ingin ada di setiap CommonCard) */}
    </div>
  );
};


// ==============================================================================
// KOMPONEN UTAMA SECTION KATEGORI SEKTOR
// ==============================================================================

const SectorCategorySection: React.FC = () => {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(-1); // Mulai dari step -1 (layar awal tombol)
  const [selectedMajorSector, setSelectedMajorSector] = useState<MajorSector | null>(null);
  const [selectedSubSector, setSelectedSubSector] = useState<string | null>(null);
  const [selectedEducation, setSelectedEducation] = useState<string | null>(null);

  const iconSizePx = 32;
  const iconMarginRightPx = 12;

  const [allData, setAllData] = useState<DataItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseMain = await fetch('/main_data.json');
        const jsonDataMain = await responseMain.json();
        const validData = jsonDataMain.filter((item: DataItem) => item.original_index && item.original_index !== "");
        setAllData(validData);
      } catch (error) {
        console.error("Gagal memuat data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const educationOptions = useMemo(() => {
    return [...new Set(allData.map(item => cleanData(item.PENDIDIKAN)).filter(Boolean))].sort();
  }, [allData]);

  const gajiOptions = useMemo(() => {
    const uniqueGaji = [...new Set(allData.map(item => cleanData(item.UPAH_DIINGINKAN)).filter(Boolean))];
    return uniqueGaji.sort((a, b) => parseSalary(a) - parseSalary(b));
  }, [allData]);


  const sectorCategoryButtons = useMemo(() => {
    return majorSectors.map(sector => ({
      ...sector,
      description: `${calculateTotalSubSectors(sector.subSectors)} Kategori Lapangan Usaha`
    }));
  }, []);

  const subSectorButtons = useMemo(() => {
    if (!selectedMajorSector) return [];
    
    return selectedMajorSector.subSectors.map(subSectorName => {
      return {
        label: subSectorName,
        icon: LayoutList // Menggunakan ikon default untuk subsektor
      };
    });
  }, [selectedMajorSector]);


  const educationButtonsForStep = useMemo(() => {
    if (!selectedSubSector) return [];

    const filteredDataBySubSector = allData.filter(item => {
      const jabatanNormalized = cleanData(item.JABATAN_DIINGINKAN_Normalized);
      const subSectorDetails = sektorJabatanMap.find(s => s.sektor === selectedSubSector);
      return subSectorDetails?.jabatan.includes(jabatanNormalized.toLowerCase());
    });
    
    const availableEducations = [...new Set(filteredDataBySubSector.map(item => cleanData(item.PENDIDIKAN)).filter(Boolean))];

    return educationOptions.filter(edu => availableEducations.includes(edu)).map(edu => ({
      label: edu,
      icon: GraduationCap // Ikon untuk pendidikan
    }));
  }, [selectedSubSector, allData, educationOptions]);


  const salaryButtonsForStep = useMemo(() => {
    if (!selectedSubSector || !selectedEducation) return [];

    const filteredDataBySubSectorAndEducation = allData.filter(item => {
      const jabatanNormalized = cleanData(item.JABATAN_DIINGINKAN_Normalized);
      const subSectorDetails = sektorJabatanMap.find(s => s.sektor === selectedSubSector);
      const isCorrectSubSector = subSectorDetails?.jabatan.includes(jabatanNormalized.toLowerCase());
      const isCorrectEducation = cleanData(item.PENDIDIKAN) === selectedEducation;
      
      return isCorrectSubSector && isCorrectEducation;
    });

    const availableSalaries = [...new Set(filteredDataBySubSectorAndEducation.map(item => cleanData(item.UPAH_DIINGINKAN)).filter(Boolean))];

    return gajiOptions.filter(gaji => availableSalaries.includes(gaji)).map(gaji => ({
      label: gaji,
      icon: Wallet // Ikon untuk gaji
    }));
  }, [selectedSubSector, selectedEducation, allData, gajiOptions]);


  const handleSelectMajorSector = (sector: MajorSector) => {
    setSelectedMajorSector(sector);
    setCurrentStep(1);
    setSelectedSubSector(null);
    setSelectedEducation(null);
  };

  const handleSelectSubSector = (subSectorName: string) => {
    setSelectedSubSector(subSectorName);
    setCurrentStep(2);
    setSelectedEducation(null);
  };

  const handleSelectEducation = (educationName: string) => {
    setSelectedEducation(educationName);
    setCurrentStep(3);
  };
  
  const handleSelectSalary = (wageRange: string) => {
    if (selectedMajorSector && selectedSubSector && selectedEducation) {
      const params = new URLSearchParams({
        sektorUtama: selectedMajorSector.name,
        sektor: selectedSubSector,
        pendidikan: selectedEducation,
        gaji: wageRange,
      }).toString();

      router.push(`/analisis-pasar-kerja?${params}`);
    } else {
      alert("Terjadi kesalahan, pilihan tidak lengkap. Mohon ulangi dari awal.");
      handleBack(); 
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      if (currentStep === 1) setSelectedMajorSector(null);
      if (currentStep === 2) setSelectedSubSector(null);
      if (currentStep === 3) setSelectedEducation(null);
    } else if (currentStep === 0) { // Kembali ke layar awal (tombol pemicu)
      setCurrentStep(-1);
      setSelectedMajorSector(null);
      setSelectedSubSector(null);
      setSelectedEducation(null);
    }
  };

  const getSectionTitle = () => {
    switch (currentStep) {
      case 0: return "Pilih Kategori Sektor";
      case 1: return `Pilih Subsektor di "${selectedMajorSector?.name || "Kategori Sektor"}"`;
      case 2: return `Pilih Tingkat Pendidikan untuk "${selectedSubSector || "Subsektor Ini"}"`;
      case 3: return `Pilih Rentang Upah Diharapkan untuk "${selectedEducation || "Pendidikan Ini"}"`;
      default: return "Pilih Kategori Sektor"; 
    }
  };

  if (isLoadingData) {
    return (
      <section className=" bg-gray-50 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-semibold text-gray-700">Memuat data kategori...</h2>
        </div>
      </section>
    );
  }

  return (
    <section className=" bg-gray-50">
      <div className="mx-auto">
        {/* Card Putih untuk Menyelimuti Seluruh Konten */}
        <div className={`
          p-6 shadow-md border border-gray-100 
          // Warna gradien yang lebih cerah dan menarik
          bg-gradient-to-br from-blue-50 to-purple-50 
          transition-all duration-500 ease-in-out
          // Rounded full hanya di step -1, sisanya rounded-xl
          ${currentStep === -1 ? 'rounded-[50px]' : 'rounded-xl'} 
          // Atur height minimal agar konsisten, terutama saat rounded-full
          min-h-[300px] flex flex-col justify-center 
        `}>{/* Mengembalikan rounded-lg dan styling shadow awal */}
        {currentStep === -1 ? ( // Tampilkan tombol pemicu jika currentStep adalah -1
            <div className="relative group flex flex-col items-center justify-center text-center w-full h-full">
              {/* Ikon-ikon dekoratif yang melayang, kini akan beranimasi saat group (card utama) di-hover */}
              {/* Posisi disesuaikan agar tidak terlalu dekat tepi jika card full rounded */}
              <Lightbulb size={48} className="absolute top-[15%] left-[10%] text-yellow-400 opacity-60 transition-transform duration-300 ease-in-out " style={{ animationDelay: '0.5s' }} />
              <Target size={40} className="absolute bottom-[15%] right-[10%] text-red-400 opacity-60 transition-transform duration-300 ease-in-out " style={{ animationDelay: '0.5s' }} />
              <Rocket size={56} className="absolute top-[25%] right-[20%] text-purple-400 opacity-60 transition-transform duration-300 ease-in-out " style={{ animationDelay: '0.5s' }} />
              <TrendingUp size={44} className="absolute bottom-[25%] left-[20%] text-green-400 opacity-60 transition-transform duration-300 ease-in-out " style={{ animationDelay: '0.5s' }} />
              <Handshake size={36} className="absolute top-[10%] right-[30%] text-blue-300 opacity-60 transition-transform duration-300 ease-in-out" style={{ animationDelay: '0.5s' }} />
              <DollarSign size={40} className="absolute bottom-[10%] left-[30%] text-yellow-300 opacity-60 transition-transform duration-300 ease-in-out" style={{ animationDelay: '0.5s' }} />

              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-6 z-10">
                Ingin tahu lebih dalam tentang <span className="text-blue-700">peluang karir</span> Anda?
              </h2>
              <p className="text-lg text-gray-700 mb-8 max-w-2xl z-10">
                Dapatkan <span className="text-purple-700 font-semibold">insight pasar kerja</span> terkini, analisis <span className="text-red-700 font-semibold">pesaing</span>, dan potensi <span className="text-green-700 font-semibold">gaji</span> yang relevan dengan kualifikasi Anda.
              </p>
              <button
                onClick={() => setCurrentStep(0)} // Mulai tahapan ke step 0
                className="
                  group relative 
                  bg-gradient-to-r from-[#6366F1] to-[#3F51B5] hover:from-[#3F51B5] hover:to-[#6366F1] // Gradien ungu/biru yang menarik
                  text-white font-bold py-3 px-8 rounded-full shadow-lg 
                  transition-all duration-300 flex items-center gap-2 
                  overflow-hidden transform hover:scale-105 z-10 // Efek scale pada hover
                "
              >
                Mulai Analisis Sekarang! 
                <span className="inline-flex items-center group-hover:translate-x-1 group-hover:scale-110 transition-transform duration-300 ease-in-out">
                  <LineChart size={20} className="ml-1" />
                </span>
                <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 animate-shine"></span>
              </button>
            </div>
          ) : (
            <> {/* Tampilkan konten langkah-langkah jika currentStep bukan -1 */}
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="text-blue-700 hover:text-blue-900 flex items-center mb-6 px-4 py-2 rounded-lg transition-colors duration-200"
                  style={{ width: 'fit-content' }} 
                >
                  <ArrowLeft size={20} className="mr-2" /> Kembali
                </button>
              )}
              <h2 className="text-lg text-blue-700 font-semibold text-center mb-2">
                {currentStep === 0 ? "Pilih Kategori Sektor" : "Lanjutkan Proses"}
              </h2>
              <h3 className="text-3xl md:text-4xl font-extrabold text-gray-800 text-center mb-12">
                {getSectionTitle()}
              </h3>

              {/* Grid untuk CommonCard pilihan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentStep === 0 && sectorCategoryButtons.map((sector) => (
                  <CommonCard
                    key={sector.id}
                    label={sector.name}
                    description={sector.description}
                    icon={sector.icon}
                    onClick={() => handleSelectMajorSector(sector)}
                    isSelected={selectedMajorSector?.id === sector.id}
                    iconSizePx={iconSizePx}
                    iconMarginRightPx={iconMarginRightPx}
                  />
                ))}

                {currentStep === 1 && subSectorButtons.map((item) => (
                  <CommonCard
                    key={item.label}
                    label={item.label}
                    icon={item.icon}
                    onClick={() => handleSelectSubSector(item.label)}
                    isSelected={selectedSubSector === item.label}
                    iconSizePx={iconSizePx}
                    iconMarginRightPx={iconMarginRightPx}
                  />
                ))}

                {currentStep === 2 && educationButtonsForStep.map((item) => (
                  <CommonCard
                    key={item.label}
                    label={item.label}
                    icon={item.icon}
                    onClick={() => handleSelectEducation(item.label)}
                    isSelected={selectedEducation === item.label}
                    iconSizePx={iconSizePx}
                    iconMarginRightPx={iconMarginRightPx}
                  />
                ))}

                {currentStep === 3 && salaryButtonsForStep.map((item) => (
                  <CommonCard
                    key={item.label}
                    label={item.label}
                    icon={item.icon}
                    onClick={() => handleSelectSalary(item.label)}
                    iconSizePx={iconSizePx}
                    iconMarginRightPx={iconMarginRightPx}
                  />
                ))}

                {/* Jika tidak ada button untuk tahap saat ini */}
                {(currentStep === 1 && subSectorButtons.length === 0) ||
                 (currentStep === 2 && educationButtonsForStep.length === 0) ||
                 (currentStep === 3 && salaryButtonsForStep.length === 0) ? (
                  <div className="col-span-full text-center text-gray-500 py-8">
                    Tidak ada pilihan tersedia untuk filter ini.
                    <button
                      onClick={handleBack}
                      className="text-blue-700 hover:text-blue-900 flex items-center justify-center mx-auto mt-4 px-4 py-2 rounded-lg transition-colors duration-200"
                      style={{ width: 'fit-content' }} 
                    >
                      <ArrowLeft size={20} className="mr-2" /> Kembali
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div> {/* Penutup card putih */}
      </div>
    </section>
  );
};

export default SectorCategorySection;