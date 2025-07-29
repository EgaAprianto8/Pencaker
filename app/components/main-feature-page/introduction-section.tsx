'use client'
// IntroductionSection.tsx
import React, { useEffect } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiBriefcase, FiBarChart2, FiUsers, FiInfo } from 'react-icons/fi';

const IntroductionSection: React.FC = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 100,
        when: 'beforeChildren',
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        type: 'spring',
        damping: 10,
        stiffness: 80,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-xl mb-8"
      variants={containerVariants}
      initial="hidden"
      animate={controls}
    >
      {/* Background shapes for visual interest */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-64 h-64 bg-white opacity-5 rounded-full -top-16 -left-16 blur-2xl"></div>
        <div className="absolute w-96 h-96 bg-white opacity-5 rounded-full -bottom-32 -right-32 blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div variants={itemVariants}>
          <FiInfo className="mx-auto h-16 w-16 text-white mb-4" />
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Selamat Datang di Portal Analisis Pencari Kerja!
          </h1>
        </motion.div>

        <motion.p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto" variants={itemVariants}>
          Temukan <span className="font-semibold">insight mendalam</span> tentang dinamika pasar kerja lokal.
          Aplikasi ini dirancang untuk membantu Anda memahami tren, preferensi, dan potensi
          para pencari kerja.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {/* PERBAIKAN KRUSIAL: MENGGUNAKAN WARNA TEKS GELAP DAN LATAR BELAKANG KARTU PUTIH OPAQUE */}
          {/* Ini akan membuat teks dan ikon sangat mudah dibaca */}
          <motion.div className="bg-white p-6 rounded-lg shadow-xl border border-blue-200" variants={itemVariants}>
            <FiBriefcase className="h-10 w-10 text-blue-700 mx-auto mb-3" /> {/* Ikon berwarna biru gelap */}
            <h3 className="text-xl font-bold mb-2 text-gray-800">Data Komprehensif</h3> {/* Judul teks abu-abu gelap */}
            <p className="text-sm text-gray-600"> {/* Teks deskripsi abu-abu sedang */}
              Jelajahi profil lengkap pencari kerja, mulai dari latar belakang pendidikan hingga keterampilan dan preferensi upah.
            </p>
          </motion.div>
          <motion.div className="bg-white p-6 rounded-lg shadow-xl border border-indigo-200" variants={itemVariants}>
            <FiBarChart2 className="h-10 w-10 text-indigo-700 mx-auto mb-3" /> {/* Ikon berwarna indigo gelap */}
            <h3 className="text-xl font-bold mb-2 text-gray-800">Visualisasi Interaktif</h3>
            <p className="text-sm text-gray-600">
              Sajikan data kompleks menjadi grafik yang mudah dipahami, bantu Anda melihat tren dan pola dengan cepat.
            </p>
          </motion.div>
          <motion.div className="bg-white p-6 rounded-lg shadow-xl border border-purple-200" variants={itemVariants}>
            <FiUsers className="h-10 w-10 text-purple-700 mx-auto mb-3" /> {/* Ikon berwarna ungu gelap */}
            <h3 className="text-xl font-bold mb-2 text-gray-800">Insight Strategis</h3>
            <p className="text-sm text-gray-600">
              Dapatkan rekomendasi berharga untuk keputusan terkait rekrutmen atau pengembangan karir berdasarkan data riil.
            </p>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="mt-10">
          <p className="text-lg opacity-90">
            Ayo, mari kita mulai <span className="font-semibold">menjelajahi data</span> bersama!
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default IntroductionSection;