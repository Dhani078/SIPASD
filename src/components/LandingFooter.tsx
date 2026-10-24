'use client';

import Crest from './Crest';
import Icon from './Icon';

interface Props {
  onOpenModal: (modal: string) => void;
  onLogin: () => void;
}

export default function LandingFooter({ onOpenModal, onLogin }: Props) {
  return (
    <footer className="public-footer-enterprise bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800 text-xs">
          {/* Kolom 1: Identitas Resmi */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-3">
              <Crest />
              <div>
                <b className="text-white text-xs block leading-tight font-bold">PEMERINTAH PROVINSI KALIMANTAN SELATAN</b>
                <span className="text-[11px] text-emerald-400 block mt-0.5 font-medium">Dinas Kepemudaan dan Olahraga</span>
              </div>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed mt-2">
              SIPASD adalah repositori dan sistem pengelolaan arsip dinas berbasis digital untuk percepatan tata kelola persuratan dinas dan akuntabilitas SPBE.
            </p>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Navigasi Utama</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#beranda" className="hover:text-emerald-400 transition-colors">Beranda Repositori</a></li>
              <li><a href="#statistik" className="hover:text-emerald-400 transition-colors">Statistik Kearsipan</a></li>
              <li><a href="#fitur" className="hover:text-emerald-400 transition-colors">Keunggulan Sistem</a></li>
              <li><a href="#venue" className="hover:text-emerald-400 transition-colors">Katalog 11 Venue</a></li>
              <li><button type="button" onClick={() => onOpenModal('classification')} className="hover:text-emerald-400 transition-colors text-left cursor-pointer">Kode Klasifikasi</button></li>
              <li><button type="button" onClick={() => onOpenModal('sop')} className="hover:text-emerald-400 transition-colors text-left cursor-pointer">Standar Operasional (SOP)</button></li>
            </ul>
          </div>

          {/* Kolom 3: Kontak Kedinasan */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Kontak Kedinasan</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5"><Icon name="building" size={13} /></span>
                <span>Jl. Pramuka No. 4, Pemurus Luar, Kec. Banjarmasin Timur, Kota Banjarmasin, Kalimantan Selatan 70249</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400"><Icon name="shield" size={13} /></span>
                <span>Telepon: (0511) 3264511 / Fax: (0511) 3264512</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400"><Icon name="file" size={13} /></span>
                <span>Surel: dispora@kalselprov.go.id</span>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Jam Pelayanan */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Pelayanan Tata Usaha</h4>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li className="flex justify-between py-1 border-b border-slate-800">
                <span>Senin - Kamis:</span>
                <span className="text-white font-medium">08.00 - 16.30 WITA</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-800">
                <span>Jumat:</span>
                <span className="text-white font-medium">08.00 - 11.30 WITA</span>
              </li>
              <li className="flex justify-between py-1">
                <span>Sabtu - Minggu:</span>
                <span className="text-slate-500">Libur Kedinasan</span>
              </li>
            </ul>
            <div className="pt-2">
              <button
                type="button"
                className="w-full py-2 bg-emerald-800/60 hover:bg-emerald-700 text-white rounded text-center font-medium transition-colors cursor-pointer text-[11px] border border-emerald-600/40"
                onClick={onLogin}
              >
                Masuk Portal Pegawai
              </button>
            </div>
          </div>
        </div>

        {/* Baris Bawah: Hak Cipta */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <span>&copy; 2026 Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan. Hak Cipta Dilindungi.</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Sistem Pemerintahan Berbasis Elektronik (SPBE)</span>
            <span>•</span>
            <span>Kearsipan Dinamis Terpadu</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
