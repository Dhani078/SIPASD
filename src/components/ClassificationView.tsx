'use client';

import { useState, useMemo } from 'react';
import Icon from './Icon';
import type { LetterRecord } from '@/types';

interface Props {
  letters: LetterRecord[];
  onClassify: (code: string) => void;
}

interface CodeItem {
  code: string;
  title: string;
  desc: string;
  scope: string;
}

const MASTER_CODES: CodeItem[] = [
  {
    code: '005',
    title: 'Undangan Kedinasan',
    desc: 'Surat undangan rapat dinas, sosialisasi program kerja, seminar teknis, dan audiensi pimpinan.',
    scope: 'Rapat koordinasi internal/eksternal, apel kedinasan, pelantikan, dan forum konsultasi publik.',
  },
  {
    code: '045',
    title: 'Kearsipan & Dokumentasi',
    desc: 'Surat pengelolaan dokumen arsip inaktif, penyerahan berkas, peminjaman fisik, dan retensi kearsipan.',
    scope: 'Pemberkasan naskah dinas, audit sistem kearsipan internal, dan tata kelola lembar disposisi.',
  },
  {
    code: '426',
    title: 'Keolahragaan & Venue',
    desc: 'Surat pembinaan prestasi atlet daerah, kompetisi olahraga, hibah induk cabor, dan pengelolaan venue.',
    scope: 'Pemberian rekomendasi kejuaraan, pemakaian gedung/lapangan olahraga, dan sarana prasarana.',
  },
  {
    code: '427',
    title: 'Kepemudaan & Organisasi',
    desc: 'Surat kegiatan jambore pemuda, seleksi pertukaran pemuda daerah, paskibraka, dan wirausaha muda.',
    scope: 'Fasilitasi OKP, kemitraan kepemudaan, pembinaan karakter generasi muda, dan kewirausahaan.',
  },
  {
    code: '800',
    title: 'Kepegawaian & Aparatur',
    desc: 'Surat tugas dinas (SPT), mutasi pegawai, penilaian kinerja ASN, magang/PKL siswa/mahasiswa, dan diklat.',
    scope: 'Disiplin pegawai, cuti tahunan, penerimaan peserta PKL, dan kenaikan pangkat aparatur.',
  },
  {
    code: '900',
    title: 'Keuangan & Aset Daerah',
    desc: 'Surat pengantar SPJ belanja, permohonan pencairan anggaran APBD, retribusi daerah, dan aset BMD.',
    scope: 'Penatausahaan kas daerah, verifikasi berkas pertanggungjawaban, dan inventarisasi aset dinas.',
  },
];

export default function ClassificationView({ letters, onClassify }: Props) {
  const [query, setQuery] = useState('');

  const codeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of MASTER_CODES) {
      counts[item.code] = letters.filter(
        (l) => l.number?.startsWith(item.code) || l.number?.includes(`/${item.code}/`) || l.subject.toLowerCase().includes(item.title.toLowerCase())
      ).length;
    }
    return counts;
  }, [letters]);

  const filtered = useMemo(() => {
    if (!query) return MASTER_CODES;
    const q = query.toLowerCase();
    return MASTER_CODES.filter(
      (c) => c.code.includes(q) || c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <section className="space-y-4">
      <div className="panel">
        <div className="panel-heading flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2>Master Klasifikasi Arsip Dispora</h2>
              <span className="small-count">{MASTER_CODES.length} Kode Baku</span>
            </div>
            <p>Berdasarkan Permendagri No. 83 Tahun 2022 &amp; Tata Naskah Dinas Pemprov Kalimantan Selatan</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
            <Icon name="shield" size={13} />
            Standar SPBE Kalsel
          </span>
        </div>

        <div className="p-3 bg-slate-50 border-b border-slate-200">
          <div className="field max-w-md">
            <Icon name="search" />
            <input
              placeholder="Cari kode (005, 426, 900) atau nama klasifikasi..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-xs"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 text-xs">
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="records">
          {filtered.map((item) => (
            <button
              key={item.code}
              onClick={() => onClassify(item.code)}
              className="w-full text-left hover:bg-emerald-50/40 transition-colors p-3.5 border-b border-slate-100 flex items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <span className="code-icon mono bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1.5 rounded text-sm shrink-0">
                  {item.code}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <b className="text-slate-900 text-sm font-semibold">{item.title}</b>
                    {codeCounts[item.code] > 0 && (
                      <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                        {codeCounts[item.code]} arsip terkait
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-1">{item.desc}</p>
                  <p className="text-[11px] text-slate-500 italic">Ruang lingkup: {item.scope}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium shrink-0">
                <span>Telusuri</span>
                <Icon name="chevron" size={13} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="panel p-4 bg-gradient-to-r from-slate-50 to-emerald-50/30 border border-slate-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
            <Icon name="shield" size={16} />
          </div>
          <div className="space-y-1 text-xs">
            <b className="text-slate-900 font-semibold text-sm">Pedoman Format Penomoran Naskah Dinas</b>
            <p className="text-slate-600 leading-relaxed">
              Format baku penomoran surat keluar Dispora Kalsel: <code>[Kode Klasifikasi] / [Nomor Agenda] / Dispora / [Tahun]</code>.
              Contoh untuk urusan keolahragaan: <code>426 / 8756 / Dispora / 2026</code>. Seluruh naskah terhubung otomatis dengan pengindeksan digital TiDB Cloud dan arsip fisik.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
