// components/HeroSection.tsx
'use client'; // Direktif ini tetap diperlukan karena ada animasi yang berjalan di sisi klien

import Image from 'next/image';

const HeroSection = () => {
  return (
    // Menggunakan gradien sebagai latar belakang utama
    <section className="relative w-full h-[60vh] lg:h-[70vh] bg-gradient-to-br from-[#0145a1] to-[#003377] overflow-hidden">
      {/* Pola latar belakang animasi (blob-like shapes) */}
      {/* Ini memberikan sentuhan modern dan dinamis pada background */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-300 opacity-15 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-500 -z-10"></div>
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-indigo-300 opacity-15 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 -z-10"></div>
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-cyan-300 opacity-15 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 -z-10"></div>
      <div className="absolute bottom-0 left-1/2 w-56 h-56 bg-purple-300 opacity-15 rounded-full mix-blend-multiply filter blur-3xl animate-blob -z-10"></div>

      {/* Konten Utama (Teks dan Gambar) - ditempatkan di atas pola latar belakang */}
      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center lg:items-stretch">
        {/* Konten Teks - di kiri pada layar besar, di atas pada mobile */}
        <div className="flex flex-col items-center justify-center text-center px-4 py-8 lg:py-0
                        lg:w-1/2 lg:items-start lg:pl-20 lg:text-left">
          {/* Judul yang direvisi dengan efek fade-in */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4 sm:mb-6 animate-fade-in-up">
            Temukan Jalan Karier Terbaik Anda:
            <span className="block text-indigo-200 mt-2">Dengan Analisis Pasar Kerja Tasikmalaya</span>
          </h1>
          {/* Tombol dengan gaya yang lebih menarik dan efek hover */}
          <button className="px-8 py-3 bg-[#07377f] text-white font-semibold text-xl sm:text-2xl rounded-lg shadow-xl hover:bg-[#19212e] transition duration-300 transform hover:scale-105 animate-fade-in-up animation-delay-300">
            Lihat Analisis Pasar Kerja
          </button>
        </div>

        {/* Konten Gambar - di kanan pada layar besar, di bawah pada mobile */}
        <div className="relative w-full h-full lg:w-1/2 flex items-center justify-center lg:justify-end">
          <div className="relative w-full h-full max-w-[500px] max-h-[500px] lg:max-w-none lg:max-h-none lg:w-full lg:h-full">
            <Image
              src="/image/hero-section.png"
              alt="Temukan Pekerjaan Impianmu"
              fill // Menggunakan properti 'fill'
              className="object-contain object-right lg:scale-110 lg:translate-x-10" // Menggunakan kelas Tailwind untuk object-fit dan object-position
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
