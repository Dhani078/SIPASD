'use client';

import { useState } from 'react';
import Icon from './Icon';
import Crest from './Crest';
import Badge from './Badge';
import Letter from './Letter';
import { venues } from '@/data/constants';
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

const defaultSample: LetterRecord = {
  id: '1099',
  number: 'NOMOR/1099/DISPORA/2026',
  origin: 'Instansi Pemerintah / Pengprov Cabang Olahraga Kalsel',
  subject: 'Surat Masuk Terkait Agenda Dispora Prov. Kalsel',
  date: '2026-09-08',
  type: 'Kilat',
  direction: 'in',
  classification: '005',
  venue: 'Lap. Tenis Dharma Praja',
  division: 'Peningkatan Prestasi',
  disposition: {
    official: 'Pebriadin Hapiz, AP, M.Si',
    date: '2026-09-08',
    division: 'Peningkatan Prestasi',
    instructions: ['Tindak Lanjuti', 'Koordinasikan'],
    notes: 'Segera koordinasikan dengan panitia daerah.',
  },
};

export default function LandingPage({
  go,
  onTrack,
  onVenue,
  setModal,
  sampleLetter = defaultSample,
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
          <a href="#statistik">Statistik Arsip</a>
          <button onClick={() => setModal('classification')}>
            Kode Klasifikasi
          </button>
          <button onClick={() => setModal('sop')}>Panduan SOP</button>
        </nav>
        <button className="btn primary" onClick={() => go('login')}>
          <Icon name="shield" />
          Masuk ke Sistem <Icon name="arrow" />
        </button>
      </header>

      <main className="landing-main" id="beranda">
        <section className="hero">
          <div>
            <div className="official-pill">
              TRANSFORMASI SPBE KALSEL MAJU - TA 2026
            </div>
            <h1>
              Sistem Pengelolaan
              <br />
              Arsip Surat &amp;<br />
              <em>Disposisi Terpadu.</em>
            </h1>
            <p>
              Repositori digital resmi Sekretariat Dispora Kalsel. Temu-kembali
              410+ dokumen fisik pindaian dalam waktu &lt; 2 detik.
            </p>
            <form
              className="tracking"
              onSubmit={(event) => {
                event.preventDefault();
                onTrack(query);
              }}
            >
              <label htmlFor="archive-tracker">
                Lacak Status Disposisi Berkas
              </label>
              <div className="search">
                <Icon name="search" />
                <input
                  id="archive-tracker"
                  placeholder="Masukkan nomor agenda / surat..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button className="btn primary" type="submit">
                  Cari Arsip <Icon name="arrow" />
                </button>
              </div>
            </form>
            <small className="trust">
              <Icon name="shield" size={16} /> {totalSuratMasuk} Surat Masuk -{' '}
              {totalSuratKeluar} Surat Keluar - 11 Venue Olahraga
            </small>
          </div>

          <div className="hero-document">
            <div className="doc-floating">
              <Badge type="Kilat" /> Disposisi terverifikasi{' '}
              <Icon name="check" />
            </div>
            <Letter letter={sampleLetter} />
            <div className="verified">
              <Icon name="shield" />
              Arsip aman. Pelayanan lebih cepat.
            </div>
          </div>
        </section>

        <section id="statistik" className="public-stats">
          {[
            [String(totalSuratMasuk), 'Surat Masuk Terindeks'],
            [String(totalSuratKeluar), 'Surat Keluar Terverifikasi'],
            ['11', 'Venue Olahraga Terkelola'],
            ['< 2s', 'Kecepatan Temu-Kembali'],
          ].map(([n, t]) => (
            <div key={t}>
              <strong>{n}</strong>
              <span>{t}</span>
            </div>
          ))}
        </section>

        <section className="public-venues">
          <div className="eyebrow">ASET OLAHRAGA BANUA</div>
          <h2>11 venue. Satu sistem pengelolaan.</h2>
          <div className="venue-chips">
            {venues.map((v) => (
              <button onClick={() => onVenue(v)} key={v}>
                <Icon name="pin" size={14} />
                {v}
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <span>Jalan Pramuka No. 4 Banjarmasin, Kalimantan Selatan 70249</span>
        <small>
          (c) 2026 Dispora Prov. Kalsel &amp; UNISKA Banjarmasin - Muhammad Rizki
          Ramadhani - 2310010406
        </small>
      </footer>
    </div>
  );
}
