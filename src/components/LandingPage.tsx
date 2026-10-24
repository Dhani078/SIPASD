'use client';

import { useState } from 'react';
import Icon from './Icon';
import Crest from './Crest';
import Badge from './Badge';
import Letter from './Letter';
import LandingStats from './LandingStats';
import LandingFeatures from './LandingFeatures';
import LandingVenues from './LandingVenues';
import LandingCta from './LandingCta';
import LandingFooter from './LandingFooter';
import { defaultSampleLetter } from '@/data/constants';
import type { LetterRecord } from '@/types';

interface Props {
  go: (page: string) => void;
  onTrack: (query: string) => void;
  onVenue: (venue: string) => void;
  setModal: (modal: string) => void;
  sampleLetter?: LetterRecord;
  totalSuratMasuk?: number;
  totalSuratKeluar?: number;
}

const QUICK_TAGS = ['0899', '1039', '3802', 'Dispora', 'Kejurprov', 'Sekda'];

export default function LandingPage({
  go,
  onTrack,
  onVenue,
  setModal,
  sampleLetter = defaultSampleLetter,
  totalSuratMasuk = 170,
  totalSuratKeluar = 241,
}: Props) {
  const [query, setQuery] = useState('');

  return (
    <div className="public min-h-[100dvh] flex flex-col justify-between">
      <header className="public-header sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="brand flex items-center gap-3">
          <Crest />
          <div>
            <b className="text-slate-900 font-extrabold text-xs tracking-tight block">PEMERINTAH PROVINSI KALIMANTAN SELATAN</b>
            <small className="text-emerald-800 font-semibold text-[11px] block">Dinas Kepemudaan dan Olahraga - SIPASD</small>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
          <a href="#beranda" className="hover:text-emerald-800 transition-colors">Beranda</a>
          <a href="#statistik" className="hover:text-emerald-800 transition-colors">Statistik</a>
          <a href="#fitur" className="hover:text-emerald-800 transition-colors">Keunggulan</a>
          <a href="#venue" className="hover:text-emerald-800 transition-colors">Venue Olahraga</a>
          <button type="button" onClick={() => setModal('classification')} className="hover:text-emerald-800 transition-colors cursor-pointer">Klasifikasi</button>
          <button type="button" onClick={() => setModal('sop')} className="hover:text-emerald-800 transition-colors cursor-pointer">Standar SOP</button>
        </nav>
        <button
          type="button"
          className="btn primary bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          onClick={() => go('login')}
        >
          <Icon name="shield" size={15} />
          <span>Masuk Sistem</span>
          <Icon name="arrow" size={12} />
        </button>
      </header>

      <main className="landing-main max-w-7xl mx-auto px-5 sm:px-10 flex-1 w-full" id="beranda">
        <section className="hero py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7">
            <div className="official-pill inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3.5 py-1.5 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>TRANSFORMASI DIGITAL KEARSIPAN SPBE - TA 2026</span>
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
              Sistem Pengelolaan
              <br />
              Arsip Surat &amp;
              <br />
              <span className="text-emerald-800 italic">Disposisi Terpadu.</span>
            </h1>

            <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
              Repositori digital resmi Sekretariat Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan. Memproses 411 naskah fisik pindaian dengan akses temu-kembali cepat via peramban HP dan PC.
            </p>

            <form
              className="tracking mt-6 max-w-xl"
              onSubmit={(event) => {
                event.preventDefault();
                onTrack(query);
              }}
            >
              <label htmlFor="archive-tracker" className="block text-xs font-bold text-slate-800 mb-2">
                Lacak Status Naskah &amp; Disposisi Publik
              </label>
              <div className="search flex items-center bg-white border border-slate-300 rounded-lg p-1 shadow-xs focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                <span className="pl-2.5 text-slate-400">
                  <Icon name="search" size={16} />
                </span>
                <input
                  id="archive-tracker"
                  placeholder="Masukkan nomor agenda / instansi / perihal..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-2 outline-none text-slate-800 placeholder:text-slate-400"
                />
                <button className="btn primary bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs px-4 py-2 rounded-md flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer" type="submit">
                  <span>Lacak</span>
                  <Icon name="arrow" size={12} />
                </button>
              </div>
            </form>

            <div className="flex items-center gap-1.5 mt-3 flex-wrap text-[11px] text-slate-500 max-w-xl">
              <span className="text-slate-400">Contoh pencarian:</span>
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="px-2.5 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 text-slate-700 rounded text-[11px] font-mono border border-slate-200 transition-colors cursor-pointer"
                  onClick={() => {
                    setQuery(tag);
                    onTrack(tag);
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="mt-5 text-[11px] text-slate-500 flex items-center gap-2 border-t border-slate-200/60 pt-3">
              <span className="text-emerald-700"><Icon name="shield" size={14} /></span>
              <span>Tersinkronisasi Real-Time • Enkripsi TLS 1.3 • Kepatuhan Tata Kelola SPBE</span>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="hero-document relative max-w-sm w-full transform hover:rotate-0 transition-transform duration-300">
              <div className="doc-floating absolute -top-3 -left-3 bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-2 z-10 text-slate-800">
                <Badge type="Kilat" />
                <span>Disposisi Terverifikasi</span>
                <span className="text-emerald-600"><Icon name="check" size={14} /></span>
              </div>
              <div className="shadow-2xl rounded-xl overflow-hidden border border-slate-200/80 bg-white">
                <Letter letter={sampleLetter} />
              </div>
              <div className="verified mt-3 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <span className="text-emerald-700"><Icon name="shield" size={14} /></span>
                <span>Arsip resmi terlindungi • Pelayanan akuntabel</span>
              </div>
            </div>
          </div>
        </section>

        <LandingStats totalSuratMasuk={totalSuratMasuk} totalSuratKeluar={totalSuratKeluar} />

        <div id="fitur">
          <LandingFeatures />
        </div>

        <LandingVenues onVenue={onVenue} />

        <LandingCta onLogin={() => go('login')} onExplore={() => setModal('sop')} />
      </main>

      <LandingFooter onOpenModal={setModal} onLogin={() => go('login')} />
    </div>
  );
}
