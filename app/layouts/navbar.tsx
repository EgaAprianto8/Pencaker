'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  /* helper scroll ke #tentang-kami (bisa dipakai di mana saja) */
  const scrollToAbout = () => {
    setIsOpen(false);
    // beri waktu drawer hilang dulu
    setTimeout(() => {
      const el = document.getElementById('tentang-kami');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // jika elemen belum ada (mis. di halaman lain) → ke /#tentang-kami
        window.location.href = '/#tentang-kami';
      }
    }, 80);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Bokeh Background Layer - lebih pekat */}
      <div
        className="fixed top-0 left-0 w-full h-20 -z-10"
        style={{
          background:
            'radial-gradient(circle at 15% 0%, rgba(0, 100, 180, 0.6) 0%, transparent 60%),' +
            'radial-gradient(circle at 85% 30%, rgba(0, 80, 160, 0.7) 0%, transparent 60%),' +
            'radial-gradient(circle at 50% 100%, rgba(0, 120, 200, 0.5) 0%, transparent 60%)',
          filter: 'blur(50px)',
        }}
      />

      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-sky-700/50"
        style={{
          backgroundColor: 'rgba(1, 64, 148, 0.85)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="container mx-auto flex justify-between items-center h-full px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/image/Logo.png"
              alt="TasikKerja Logo"
              width={36}
              height={36}
              className="rounded-full"
            />
            <span className="text-white font-bold text-xl tracking-tight">
              TasikKerja
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-1">
            {/* Beranda */}
            <Link href="/" className="text-white/90 font-medium px-4 py-2 rounded-md transition-all duration-300 hover:text-white hover:bg-sky-700/50">
              Beranda
            </Link>

            {/* Analisis Pasar Kerja */}
            <Link href="/analisis-pasar-kerja" className="text-white/90 font-medium px-4 py-2 rounded-md transition-all duration-300 hover:text-white hover:bg-sky-700/50">
              Analisis Pasar Kerja
            </Link>

            {/* Tentang Kami (scroll/hash) */}
            <button
              onClick={scrollToAbout}
              className="text-white/90 font-medium px-4 py-2 rounded-md transition-all duration-300 hover:text-white hover:bg-sky-700/50"
            >
              Tentang Kami
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white/90 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isOpen && (
          <div className="md:hidden absolute top-20 inset-x-0">
            <div className="bg-sky-800/95 border-t border-sky-700/50 flex flex-col space-y-1 px-4 pb-4 pt-2">
              <Link href="/" onClick={() => setIsOpen(false)} className="text-white/90 font-medium px-3 py-2 rounded-md transition-colors hover:bg-sky-700/50 hover:text-white">
                Beranda
              </Link>
              <Link href="/analisis-pasar-kerja" onClick={() => setIsOpen(false)} className="text-white/90 font-medium px-3 py-2 rounded-md transition-colors hover:bg-sky-700/50 hover:text-white">
                Analisis Pasar Kerja
              </Link>
              <button
                onClick={scrollToAbout}
                className="text-left text-white/90 font-medium px-3 py-2 rounded-md transition-colors hover:bg-sky-700/50 hover:text-white"
              >
                Tentang Kami
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer agar konten tidak tertutup navbar fixed */}
      <div className="h-20" />
    </>
  );
};

export default Navbar;