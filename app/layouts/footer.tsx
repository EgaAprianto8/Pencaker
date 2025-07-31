'use client'

// components/FooterWeb.tsx
import Image from 'next/image';
import Link from 'next/link';

const FooterWeb = () => {
  return (
    <footer className="bg-[#07377f] text-white py-16 px-4 md:px-8 lg:px-16 relative overflow-hidden">
      {/* Background decorative elements for visual appeal - Animasi Blob Tetap Ditinggalkan untuk Estetika */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-blue-400 opacity-10 rounded-full mix-blend-multiply filter blur-3xl animate-blob-slow -z-10"></div>
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-purple-400 opacity-10 rounded-full mix-blend-multiply filter blur-3xl animate-blob-slow animation-delay-2000 -z-10"></div>
      <div className="absolute top-1/2 left-[20%] w-56 h-56 bg-teal-400 opacity-10 rounded-full mix-blend-multiply filter blur-3xl animate-blob-slow animation-delay-4000 -z-10"></div>

      <div className="container mx-auto flex flex-col items-center justify-center text-center relative z-10">
        {/* Konten Utama: Logo, Judul, dan Deskripsi */}
        <div className="flex flex-col items-center space-y-6 mb-8"> {/* Jarak antar elemen */}
          <Link href="/" className="flex flex-col items-center space-y-4"> {/* Menggunakan flex-col untuk menumpuk logo dan nama */}
          <Image
            src="/image/Logo.png"
            alt="TasikKerja Logo"
            width={80}
            height={80}
            className="rounded-full shadow-2xl border-4 border-white transform hover:scale-105 transition-transform duration-300 ease-in-out"
            unoptimized={true} // Tambahkan ini sementara untuk debugging
          />
            <h2 className="text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-lg">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-teal-200">TasikKerja</span>
            </h2> {/* Judul utama lebih besar dan gradien */}
          </Link>
          <p className="text-gray-200 text-lg leading-relaxed max-w-xl"> {/* Deskripsi lebih terang dan lebar */}
            Platform terdepan untuk menemukan peluang karier terbaik dan memahami dinamika pasar kerja di Kota Tasikmalaya.
            Kami berdedikasi untuk menghubungkan talenta lokal dengan perusahaan yang tepat, mendukung pertumbuhan ekonomi daerah.
          </p>
        </div>

        {/* Bagian Copyright - Disatukan di bawah deskripsi */}
        <div className="mt-8 pt-6 border-t border-gray-600 w-full max-w-xl"> {/* Garis pembatas yang lebih rapi */}
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} TasikKerja. <em>All Rights Reserved.</em>
          </p>
        </div>
      </div>

      {/* Tailwind CSS for custom animations (add to your global CSS or styles file) */}
      <style jsx global>{`
        @keyframes blob-slow {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(40px, -60px) scale(1.2);
          }
          66% {
            transform: translate(-30px, 30px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob-slow {
          animation: blob-slow 10s infinite ease-in-out;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </footer>
  );
};

export default FooterWeb;