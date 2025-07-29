// app/not-found.tsx
import Link from 'next/link'; // Import Link jika Anda ingin menambahkan tautan kembali ke beranda

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>404 - Halaman Tidak Ditemukan</h1>
      <p>Maaf, halaman yang Anda cari tidak ada.</p>
      <Link href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
        Kembali ke Beranda
      </Link>
    </div>
  );
}