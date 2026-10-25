'use client';

import Icon from './Icon';
import type { DemoUser } from '@/types';

interface Props {
  user: DemoUser;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

function formatNip(nip?: string) {
  if (!nip || nip === '-') return '-';
  const c = nip.replace(/\s+/g, '');
  return c.length === 18 ? `${c.slice(0, 8)} ${c.slice(8, 14)} ${c.slice(14, 15)} ${c.slice(15)}` : c;
}

export default function ProfileView({ user, onNavigate, onLogout }: Props) {
  return (
    <section className="panel space-y-6">
      <div className="panel-heading flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2>Kartu Profil &amp; Identitas Pengguna</h2>
          <p>Informasi aparatur dan hak akses sistem kearsipan SIPASD Dispora Kalsel</p>
        </div>
        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
          <button className="btn outline text-xs justify-center min-h-[42px] sm:min-h-0" onClick={() => onNavigate('dashboard')} type="button">
            <Icon name="arrow" size={13} />
            <span>Beranda</span>
          </button>
          <button
            className="btn outline text-xs text-red-600 border-red-200 hover:bg-red-50 justify-center min-h-[42px] sm:min-h-0"
            onClick={onLogout || (() => onNavigate('login'))}
            type="button"
          >
            <Icon name="logout" size={13} />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-900 to-teal-800 text-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-white text-emerald-900 font-extrabold text-2xl flex items-center justify-center shadow-md border-4 border-emerald-200/40 flex-shrink-0">
            {user.initials}
          </div>
          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl font-bold text-white">{user.name}</h3>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-700/80 text-emerald-100 rounded-full border border-emerald-500/40">
                Otoritas: {user.label}
              </span>
            </div>
            <p className="text-emerald-100 text-sm mt-1">Jabatan: <b className="text-white font-medium">{user.role}</b></p>
            <p className="text-emerald-200 text-xs mt-0.5">{user.unitKerja || 'Sekretariat Dinas Kepemudaan dan Olahraga'}</p>
            <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-emerald-700/60 text-xs text-emerald-100">
              <div>
                <span className="text-emerald-300">NIP BKN:</span>{' '}
                <span className="font-mono font-bold text-white tracking-wider">{formatNip(user.nip)}</span>
              </div>
              <div>
                <span className="text-emerald-300">Username:</span>{' '}
                <span className="font-mono text-white">@{user.username}</span>
              </div>
              <div>
                <span className="text-emerald-300">Email:</span>{' '}
                <span className="text-white">{user.email || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3 text-emerald-950 font-semibold text-sm">
              <Icon name="shield" size={16} />
              <span>Hak Akses &amp; Otoritas Sistem</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                <span>Pencarian dan penelusuran dokumen arsip kedinasan terpadu</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                <span>Pratinjau langsung berkas fisik asli beresolusi tinggi</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                <span>Pencatatan instruksi riwayat lembar disposisi fisik pimpinan</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                <span>Penerbitan Buku Agenda dan Buku Ekspedisi standar kearsipan</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Tingkat Akses RBAC:</span>
            <span className="font-semibold text-emerald-800">{user.label} Kedinasan</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3 text-emerald-950 font-semibold text-sm">
              <Icon name="check" size={16} />
              <span>Status Keamanan &amp; Sesi Kedinasan</span>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Pusat Data Kearsipan:</span>
                <span className="font-semibold text-emerald-800">Tersinkronisasi Real-Time (TLS 1.3)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Penyimpanan Digital:</span>
                <span className="font-semibold text-slate-700">Layanan Ganda (Akses Cepat &amp; Cadangan)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Otentikasi Sesi:</span>
                <span className="font-semibold text-slate-700">Aman Terenkripsi (Masa Berlaku 8 Jam)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Jejak Audit Aktivitas:</span>
                <span className="font-semibold text-emerald-700">Terekam Resmi (Audit Trail Forensik)</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Status Akun:</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Aktif Terverifikasi
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
