// components/Navbar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react'; // Pastikan lucide-react sudah terinstal

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#0145a1] p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/image/Logo.png" // Path logo yang telah Anda berikan
              alt="TasikKerja Logo"
              width={40} // Sesuaikan ukuran logo sesuai kebutuhan
              height={40} // Sesuaikan ukuran logo sesuai kebutuhan
              className="rounded-full" // Menambahkan rounded-full agar logo berbentuk lingkaran
            />
            <span className="text-white text-xl font-bold">TasikKerja</span>
          </Link>
        </div>

        {/* Navigasi Desktop - Beranda dan Fitur Utama: Analisis Pasar Kerja */}
        <div className="hidden md:flex space-x-2"> {/* Mengurangi space-x untuk jarak antar tombol yang lebih baik */}
          <Link href="/" className="text-white hover:bg-blue-600 px-4 py-2 rounded-md transition duration-300 text-lg font-medium"> {/* Gaya tombol yang ditingkatkan */}
            Beranda
          </Link>
          {/* Tombol untuk fitur utama yang merefleksikan "melihat persaingan/peluang" */}
          <Link href="/main-feature" className="text-white hover:bg-blue-600 px-4 py-2 rounded-md transition duration-300 text-lg font-medium"> {/* Gaya tombol yang ditingkatkan */}
            Analisis Pasar Kerja
          </Link>
          {/* Jika ada tombol ke-3 di masa depan, seperti "Prediksi Gaji" atau "Tentang Kami", bisa ditambahkan di sini */}
        </div>

        {/* Tombol Aksi / User Actions (Kosongkan sesuai permintaan awal) */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Area ini bisa diisi dengan tombol Masuk/Daftar atau tindakan lain nanti */}
        </div>

        {/* Tombol Hamburger (Mobile) */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Navigasi Mobile (Dropdown) - Beranda dan Fitur Utama: Analisis Pasar Kerja */}
      {isOpen && (
        <div className="md:hidden bg-[#0145a1] mt-4 pb-4">
          <div className="flex flex-col items-center space-y-2"> {/* Mengurangi space-y untuk jarak yang lebih baik */}
            <Link href="/" onClick={() => setIsOpen(false)} className="text-white hover:bg-blue-600 transition duration-300 text-lg font-medium w-full text-center py-2"> {/* Gaya tombol yang ditingkatkan */}
              Beranda
            </Link>
            {/* Tombol untuk fitur utama yang merefleksikan "melihat persaingan/peluang" */}
            <Link href="/main-feature" onClick={() => setIsOpen(false)} className="text-white hover:bg-blue-600 transition duration-300 text-lg font-medium w-full text-center py-2"> {/* Gaya tombol yang ditingkatkan */}
              Analisis Pasar Kerja
            </Link>
            {/* Jika ada tombol ke-3 di masa depan, bisa ditambahkan di sini */}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
