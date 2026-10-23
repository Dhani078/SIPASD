'use client';

import Icon from './Icon';
import type { DemoUser } from '@/types';

interface Props {
  user: DemoUser;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export default function ProfileView({ user, onNavigate, onLogout }: Props) {
  return (
    <section className="panel space-y-6">
      <div className="panel-heading">
        <div>
          <h2>Kartu Profil & Identitas Pengguna</h2>
          <p>Informasi aparatur dan hak akses sistem kearsipan SIPASD Dispora Kalsel</p>
        </div>
        <div className="flex gap-2">
          <button className="btn outline text-xs" onClick={() => onNavigate('dashboard')}>
            <Icon name="arrow" size={12} />
            Kembali ke Beranda
          </button>
          <button
            className="btn outline text-xs text-red-600 border-red-200 hover:bg-red-50"
            onClick={onLogout || (() => onNavigate('login'))}
          >
            <Icon name="logout" size={12} />
            Keluar Sesi
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-900 to-teal-800 text-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-white text-emerald-900 font-extrabold text-2xl flex items-center justify-center shadow-md border-4 border-emerald-200/40 flex-shrink-0">
            {user.initials}
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl font-bold text-white">{user.name}</h3>
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-700/80 text-emerald-100 rounded-full border border-emerald-500/40">
                {user.label}
              </span>
            </div>
            <p className="text-emerald-100 text-sm mt-1">{user.role}</p>
            <p className="text-emerald-200 text-xs mt-0.5">{user.unitKerja || 'Sekretariat Dinas Kepemudaan dan Olahraga'}</p>
            <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-emerald-700/60 text-xs text-emerald-100">
              <div>
                <span className="text-emerald-300">NIP / ID:</span>{' '}
                <span className="font-mono font-bold text-white">{user.nip || '-'}</span>
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
        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3 text-emerald-950 font-semibold text-sm">
            <Icon name="shield" size={16} />
            <span>Hak Akses & Otoritas Sistem</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Pencarian dan penelusuran dokumen arsip dinas</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Pratinjau berkas pindaian PDF (Signed Cloudinary Stream)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Pencatatan riwayat disposisi fisik pimpinan</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Ekspor Buku Agenda dan Buku Ekspedisi format Excel</span>
            </li>
          </ul>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3 text-emerald-950 font-semibold text-sm">
            <Icon name="check" size={16} />
            <span>Status Keamanan & Sesi</span>
          </div>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Basis Data:</span>
              <span className="font-semibold text-emerald-800">TiDB Cloud Serverless (SSL Strict)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Penyimpanan Digital:</span>
              <span className="font-semibold text-slate-700">Cloudinary CDN + Google Drive 5 TB</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Tipe Token:</span>
              <span className="font-mono text-slate-700">JWT HttpOnly (8 Jam)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Audit Trail:</span>
              <span className="font-semibold text-emerald-700">Terekam aktif di tabel audit_logs</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}