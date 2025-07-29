// app/components/TasikDataIntro.tsx

'use client';

import React from 'react';
import { MapPin, BarChart, Lightbulb, Users } from 'lucide-react';

const TasikDataIntro: React.FC = () => {
    return (
        <section className="relative py-24 px-4 bg-gradient-to-r from-teal-50 to-blue-100 overflow-hidden">
            {/* Background decorative elements for visual appeal */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-purple-200 opacity-30 rounded-full mix-blend-multiply filter blur-3xl animate-blob -z-10"></div>
            <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-pink-200 opacity-30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 -z-10"></div>
            <div className="absolute top-1/2 left-[10%] w-48 h-48 bg-yellow-200 opacity-30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 -z-10"></div>

            <div className="relative max-w-7xl mx-auto text-center z-10">
                <h2 className="text-6xl font-extrabold text-gray-900 mb-8 leading-tight animate-fade-in-up">
                    <span className="block text-indigo-700">Mengenal Lebih Dekat</span>
                    <span className="block mt-2">Dinamika Ketenagakerjaan Kota Tasikmalaya</span>
                </h2>
                <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-300">
                    Selamat datang di TasikKerja, platform inovatif yang dirancang untuk memberikan wawasan mendalam tentang pasar kerja di Kota Tasikmalaya. Kami hadir untuk membantu Anda melihat peluang, memahami persaingan, dan membuat keputusan karier yang lebih cerdas.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col items-center animate-fade-in-up animation-delay-500">
                        <MapPin className="text-blue-600 mb-4" size={48} strokeWidth={1.5} />
                        <h4 className="text-2xl font-bold text-gray-800 mb-2">Fokus Lokal</h4>
                        <p className="text-gray-600 text-center">Data spesifik Kota Tasikmalaya untuk analisis yang relevan.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col items-center animate-fade-in-up animation-delay-700">
                        <BarChart className="text-green-600 mb-4" size={48} strokeWidth={1.5} />
                        <h4 className="text-2xl font-bold text-gray-800 mb-2">Visualisasi Interaktif</h4>
                        <p className="text-gray-600 text-center">Sajikan informasi kompleks dalam grafik yang mudah dipahami.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col items-center animate-fade-in-up animation-delay-900">
                        <Lightbulb className="text-orange-600 mb-4" size={48} strokeWidth={1.5} />
                        <h4 className="text-2xl font-bold text-gray-800 mb-2">Wawasan Mendalam</h4>
                        <p className="text-gray-600 text-center">Dapatkan insight tentang tren, persaingan, dan gaji di berbagai sektor.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col items-center animate-fade-in-up animation-delay-1100">
                        <Users className="text-purple-600 mb-4" size={48} strokeWidth={1.5} />
                        <h4 className="text-2xl font-bold text-gray-800 mb-2">Untuk Pencaker & Perusahaan</h4>
                        <p className="text-gray-600 text-center">Bermanfaat bagi pencari kerja maupun pihak yang ingin rekrutmen.</p>
                    </div>
                </div>

                <p className="text-lg text-gray-600 max-w-4xl mx-auto animate-fade-in-up animation-delay-1300">
                    Melalui data statistik demografi ketenagakerjaan, dinamika pencari dan penempatan kerja, serta distribusi pengangguran berdasarkan tingkat pendidikan di Kota Tasikmalaya, Anda akan mendapatkan gambaran komprehensif. Mari jelajahi data-data ini untuk memahami kondisi pasar kerja di Kota Tasikmalaya!
                </p>
            </div>

            {/* Tailwind CSS for custom animations (add to your global CSS or styles file) */}
            <style jsx global>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }
                .animation-delay-300 { animation-delay: 0.3s; }
                .animation-delay-500 { animation-delay: 0.5s; }
                .animation-delay-700 { animation-delay: 0.7s; }
                .animation-delay-900 { animation-delay: 0.9s; }
                .animation-delay-1100 { animation-delay: 1.1s; }
                .animation-delay-1300 { animation-delay: 1.3s; }

                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-1000 { animation-delay: 1s; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-3000 { animation-delay: 3s; }
                .animation-delay-4000 { animation-delay: 4s; }
                .animation-delay-500 { animation-delay: 0.5s; } /* Reused for elements with slight delay */
            `}</style>
        </section>
    );
};

export default TasikDataIntro;