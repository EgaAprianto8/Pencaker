'use client'

import React, { useEffect } from 'react';
import Image from 'next/image';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiBriefcase, FiBarChart2, FiUsers, FiInfo } from 'react-icons/fi';

const IntroductionSection: React.FC = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  useEffect(() => {
    if (inView) controls.start('visible');
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
      transition: { duration: 0.6, type: 'spring', damping: 10, stiffness: 80 },
    },
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Lapisan background (gambar + gradien) */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/image/building.jpg"
          alt="Building"
          fill
          priority
          quality={90}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0145a1]/50 to-[#003377]/50" />
      </div>

      {/* Konten tetap di depan */}
      <motion.div
        ref={ref}
        className="relative z-0 text-white py-8 px-4 sm:px-6 lg:px-8 shadow-xl mb-8"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Decorative blurs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-64 h-64 bg-white/5 rounded-full -top-16 -left-16 blur-2xl" />
          <div className="absolute w-96 h-96 bg-white/5 rounded-full -bottom-32 -right-32 blur-2xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
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
            {[FiBriefcase, FiBarChart2, FiUsers].map((Icon, i) => (
              <motion.div
                key={i}
                className="bg-white p-6 rounded-lg shadow-xl"
                variants={itemVariants}
              >
                <Icon className="h-10 w-10 text-blue-700 mx-auto mb-3" />
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  {['Data Komprehensif', 'Visualisasi Interaktif', 'Insight Strategis'][i]}
                </h3>
                <p className="text-sm text-gray-600">
                  {[
                    'Jelajahi profil lengkap pencari kerja, mulai dari latar belakang pendidikan hingga keterampilan dan preferensi upah.',
                    'Sajikan data kompleks menjadi grafik yang mudah dipahami, bantu Anda melihat tren dan pola dengan cepat.',
                    'Dapatkan rekomendasi berharga untuk keputusan terkait rekrutmen atau pengembangan karir berdasarkan data riil.',
                  ][i]}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={itemVariants} className="mt-10">
            <p className="text-lg opacity-90">
              Ayo, mari kita mulai <span className="font-semibold">menjelajahi data</span> bersama!
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default IntroductionSection;