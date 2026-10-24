'use client';

import Icon from './Icon';
import { venues } from '@/data/constants';

interface Props {
  onVenue: (venue: string) => void;
}

export default function LandingVenues({ onVenue }: Props) {
  return (
    <section id="venue" className="public-venues my-10 py-6 border-t border-slate-200/80">
      <div className="max-w-2xl mb-6">
        <span className="text-[11px] font-bold tracking-widest text-emerald-800 uppercase bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          Aset Olahraga Banua
        </span>
        <h2 className="text-2xl font-bold text-slate-900 mt-3 tracking-tight">
          11 venue olahraga. Satu sistem pengelolaan.
        </h2>
        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
          Mendukung administrasi permohonan peminjaman dan pemeliharaan fasilitas sarana olahraga resmi di bawah naungan Dispora Provinsi Kalimantan Selatan.
        </p>
      </div>

      <div className="venue-chips flex flex-wrap gap-2.5">
        {venues.map((v) => (
          <button
            type="button"
            className="hover:border-emerald-500 hover:text-emerald-900 hover:bg-emerald-50/50 hover:shadow-xs transition-all duration-150 flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 cursor-pointer"
            onClick={() => onVenue(v)}
            key={v}
            title={`Lihat arsip terkait ${v}`}
          >
            <span className="text-emerald-700">
              <Icon name="pin" size={14} />
            </span>
            <span>{v}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
