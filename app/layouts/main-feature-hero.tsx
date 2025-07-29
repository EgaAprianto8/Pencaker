// components/MainFeatureHero.tsx
'use client'; 

import Image from 'next/image';

const MainFeatureHero = () => {
  return (
    <section className="relative w-full h-[35vh] md:h-[45vh] overflow-hidden flex items-center justify-center">
      {/* Overlay gradien semi-transparan di atas gambar untuk kontras teks */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0145a1]/80 to-[#003377]/80 z-10"></div>

      {/* Gambar latar belakang yang lebih besar dan memenuhi area */}
      <Image
        src="/image/building.jpg"
        alt="Analisis Pasar Kerja"
        fill
        className="object-cover object-center transform scale-105 sm:scale-100 animate-fade-in -z-0" // Gambar lebih besar, scale-105 untuk efek visual
        priority // Untuk memuat gambar lebih cepat
      />

      {/* Konten Teks di tengah */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-2 animate-fade-in-up">
          Jelajahi Data Pasar Kerja
          <span className="block text-indigo-200 text-xl sm:text-2xl md:text-3xl mt-1 sm:mt-2 animate-fade-in-up animation-delay-300">
            Temukan Peluang Terbaik Anda
          </span>
        </h1>
      </div>
    </section>
  );
};

export default MainFeatureHero;