// pages/main-feature/index.tsx (atau lokasi file Page Anda)
"use client"; // Tambahkan ini jika belum ada di file Page ini

import React, { Suspense } from 'react'; // Impor Suspense dari React
import MainFeature from '../components/main-feature-page/Main-Feature';
import IntroductionSection from '../components/main-feature-page/introduction-section';


const Page = () => {
  return (
    <>
      <IntroductionSection/>
      {/* Bungkus MainFeature dengan Suspense */}
      <Suspense fallback={<div>Memuat data analisis...</div>}>
        <MainFeature/>
      </Suspense>
    </>
  );
}

export default Page;