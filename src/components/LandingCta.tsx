'use client';

import Icon from './Icon';

interface Props {
  onLogin: () => void;
  onExplore: () => void;
}

export default function LandingCta({ onLogin, onExplore }: Props) {
  return (
    <section className="my-14 rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden border border-emerald-800/40">
      <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="relative z-10 max-w-2xl">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-600/40 text-emerald-200 text-[11px] font-semibold mb-4">
          <Icon name="shield" size={13} />
          <span>Sistem Pemerintahan Berbasis Elektronik (SPBE)</span>
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
          Mewujudkan Tata Kelola Kearsipan Modern, Cepat, dan Akuntabel.
        </h2>
        <p className="mt-3 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
          Akses portal operasional diperuntukkan bagi pejabat dan aparatur Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan untuk pemrosesan naskah dinas kedinasan.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn primary bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 text-xs shadow-md transition-all cursor-pointer"
            onClick={onLogin}
          >
            <Icon name="shield" size={16} />
            <span>Masuk Portal SIPASD</span>
            <Icon name="arrow" size={13} />
          </button>
          <button
            type="button"
            className="btn outline border-emerald-400/50 hover:bg-emerald-800/40 text-white font-medium px-4 py-2.5 rounded-lg text-xs transition-colors cursor-pointer"
            onClick={onExplore}
          >
            <span>Pelajari Alur Kerja</span>
          </button>
        </div>
      </div>
    </section>
  );
}
