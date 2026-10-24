'use client';

interface Props {
  totalSuratMasuk: number;
  totalSuratKeluar: number;
}

export default function LandingStats({ totalSuratMasuk, totalSuratKeluar }: Props) {
  const stats = [
    {
      value: String(totalSuratMasuk),
      label: 'Surat Masuk Terindeks',
      sub: 'Tahun Anggaran 2026',
    },
    {
      value: String(totalSuratKeluar),
      label: 'Surat Keluar Terverifikasi',
      sub: 'Terdokumentasi Lengkap',
    },
    {
      value: '11',
      label: 'Venue Olahraga Banua',
      sub: 'Aset Daerah Terkelola',
    },
    {
      value: '< 2 Detik',
      label: 'Kecepatan Temu-Kembali',
      sub: 'Pencarian Indeks Cepat',
    },
  ];

  return (
    <section id="statistik" className="public-stats shadow-sm border border-slate-200/80 rounded-xl bg-white">
      {stats.map((item, idx) => (
        <div key={item.label} className={`p-5 text-center flex flex-col items-center justify-center ${idx < 3 ? 'border-r border-slate-100' : ''}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <strong className="text-3xl sm:text-4xl text-emerald-950 font-extrabold tracking-tight">
              {item.value}
            </strong>
          </div>
          <span className="text-xs font-semibold text-slate-800 block">
            {item.label}
          </span>
          <small className="text-[11px] font-medium text-emerald-700 block mt-0.5">
            {item.sub}
          </small>
        </div>
      ))}
    </section>
  );
}
