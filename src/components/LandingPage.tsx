'use client';

import { useState } from 'react';
import Icon from './Icon';
import Crest from './Crest';
import Badge from './Badge';
import Letter from './Letter';
import LandingFeatures from './LandingFeatures';
import { venues, defaultSampleLetter } from '@/data/constants';
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
    <div className="public">
      <header className="public-header">
        <div className="brand">
          <Crest />
          <div>
            <b>PEMERINTAH PROVINSI KALIMANTAN SELATAN</b>
            <small>Dinas Kepemudaan dan Olahraga - SIPASD</small>
          </div>
        </div>
        <nav>
          <a href="#beranda">Beranda</a>
          <a href="#statistik">Statistik</a>
          <a href="#fitur">Keunggulan</a>
          <a href="#venue">Venue</a>
          <button type="button" onClick={() => setModal('classification')}>Klasifikasi</button>
          <button type="button" onClick={() => setModal('sop')}>SOP</button>
        </nav>
        <button type="button" className="btn primary flex items-center gap-1.5" onClick={() => go('login')}>
          <Icon name="shield" size={15} />
          <span>Masuk Sistem</span>
          <Icon name="arrow" size={13} />
        </button>
      </header>

      <main className="landing-main" id="beranda">
        <section className="hero">
          <div>
            <div className="official-pill inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>TRANSFORMASI SPBE KALSEL MAJU - TA 2026</span>
            </div>
            <h1 className="mt-4">
              Sistem Pengelolaan
              <br />
              Arsip Surat &amp;
              <br />
              <em>Disposisi Terpadu.</em>
            </h1>
            <p className="mt-3">
              Repositori digital resmi Sekretariat Dispora Kalsel. Temu-kembali 411+ berkas fisik pindaian dalam waktu &lt; 2 detik via peramban HP dan PC.
            </p>

            <form
              className="tracking mt-6"
              onSubmit={(event) => {
                event.preventDefault();
                onTrack(query);
              }}
            >
              <label htmlFor="archive-tracker" className="block text-xs font-semibold text-slate-800 mb-2">
                Lacak Cepat Status Disposisi &amp; Berkas
              </label>
              <div className="search flex items-center">
                <Icon name="search" size={16} />
                <input
                  id="archive-tracker"
                  placeholder="Masukkan nomor agenda / instansi / perihal..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 text-xs"
                />
                <button className="btn primary flex items-center gap-1 text-xs px-3.5 py-1.5" type="submit">
                  <span>Cari Arsip</span>
                  <Icon name="arrow" size={12} />
                </button>
              </div>
            </form>

            <div className="flex items-center gap-1.5 mt-3 flex-wrap text-[11px] text-slate-500">
              <span className="text-slate-400">Pencarian cepat:</span>
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 rounded text-[10px] font-mono border border-slate-200 transition-colors"
                  onClick={() => {
                    setQuery(tag);
                    onTrack(tag);
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>

            <small className="trust mt-4 text-xs text-slate-500 flex items-center gap-2">
              <Icon name="shield" size={15} />
              <span>{totalSuratMasuk} Surat Masuk • {totalSuratKeluar} Surat Keluar • TiDB Cloud Serverless SSL</span>
            </small>
          </div>

          <div className="hero-document">
            <div className="doc-floating">
              <Badge type="Kilat" /> Disposisi Terverifikasi <Icon name="check" size={14} />
            </div>
            <Letter letter={sampleLetter} />
            <div className="verified">
              <Icon name="shield" size={15} />
              <span>Arsip resmi terlindungi • Pelayanan akuntabel</span>
            </div>
          </div>
        </section>

        <section id="statistik" className="public-stats shadow-xs">
          {[
            [String(totalSuratMasuk), 'Surat Masuk Terindeks', 'TA 2026'],
            [String(totalSuratKeluar), 'Surat Keluar Terverifikasi', 'Terdokumentasi'],
            ['11', 'Venue Olahraga Banua', 'Aset Terkelola'],
            ['< 2s', 'Kecepatan Temu-Kembali', 'Indeks Real-Time'],
          ].map(([n, t, sub]) => (
            <div key={t} className="p-4 text-center">
              <strong className="text-3xl text-emerald-950 font-bold block">{n}</strong>
              <span className="text-xs font-semibold text-slate-800 mt-1 block">{t}</span>
              <small className="text-[10px] text-emerald-700 block mt-0.5">{sub}</small>
            </div>
          ))}
        </section>

        <div id="fitur">
          <LandingFeatures />
        </div>

        <section id="venue" className="public-venues">
          <div className="eyebrow text-xs font-bold text-emerald-800 tracking-wider">ASET OLAHRAGA BANUA</div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1 mb-4">11 venue olahraga. Satu sistem pengelolaan.</h2>
          <div className="venue-chips flex flex-wrap gap-2">
            {venues.map((v) => (
              <button
                type="button"
                className="hover:border-emerald-500 hover:text-emerald-800 transition-colors flex items-center gap-1.5 px-3 py-2 text-xs rounded border border-slate-200 bg-white"
                onClick={() => onVenue(v)}
                key={v}
              >
                <Icon name="pin" size={13} />
                <span>{v}</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full text-xs text-slate-500">
          <span>Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan • Jl. Pramuka No. 4 Banjarmasin 70249</span>
          <small className="text-[11px] text-slate-400">
            © 2026 SIPASD Dispora Kalsel • Mahasiswa Magang TI UNISKA Banjarmasin (Dhani078)
          </small>
        </div>
      </footer>
    </div>
  );
}