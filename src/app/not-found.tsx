import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="notfound-page">
      <div>
        <h1>404</h1>
        <p>Halaman yang Anda cari tidak ditemukan dalam sistem arsip.</p>
        <Link href="/" className="btn primary">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
