import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SIPASD — Sistem Informasi Pengelolaan Arsip Surat Dispora',
  description: 'Repositori E-Arsip Digital Terindeks Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
