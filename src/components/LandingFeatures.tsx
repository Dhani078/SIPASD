'use client';

import Icon from './Icon';

const FEATURES = [
  {
    icon: 'search' as const,
    title: 'Pencarian Instan < 2 Detik',
    desc: 'Mesin pencari kata kunci multi-kolom untuk nomor agenda, asal/tujuan instansi, perihal, dan klasifikasi kode dinas.',
    tag: 'Efisiensi Temu-Kembali',
  },
  {
    icon: 'file' as const,
    title: 'Streaming PDF In-Browser',
    desc: 'Membaca langsung dokumen hasil scan resolusi tinggi via Cloudinary signed stream tanpa perlu mengunduh file fisik.',
    tag: 'Cloud CDN + Drive 5 TB',
  },
  {
    icon: 'shield' as const,
    title: 'Riwayat Disposisi & Ekspedisi',
    desc: 'Dokumentasi arahan pimpinan, bidang pelaksana, dan buku ekspedisi tanda terima kurir resmi berstandar kedinasan.',
    tag: 'Akuntabilitas SPBE',
  },
];

export default function LandingFeatures() {
  return (
    <section className="my-14 py-8 border-t border-b border-slate-200/80">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-[11px] font-bold tracking-widest text-emerald-800 uppercase bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          Keunggulan Repositori SIPASD
        </span>
        <h2 className="text-2xl font-bold text-slate-900 mt-3 tracking-tight">
          Dirancang untuk Ketertiban Arsip &amp; Kecepatan Pelayanan
        </h2>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          Mengintegrasikan 411+ dokumen fisik Dispora Kalsel menjadi pangkalan data digital terstruktur, terenkripsi, dan mudah diakses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-emerald-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4 border border-emerald-100 shadow-xs">
                <Icon name={f.icon} size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-emerald-800">{f.tag}</span>
              <span className="text-slate-400">✓ Standar Pemprov</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}