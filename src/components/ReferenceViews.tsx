'use client';

import ArchiveTable from './ArchiveTable';
import DistributionView from './DistributionView';
import DispositionHistoryView from './DispositionHistoryView';
import ProfileView from './ProfileView';
import Icon from './Icon';
import { classifications } from '@/data/constants';
import { demoUsers } from '@/data/users';
import type { LetterRecord, DemoUser } from '@/types';

interface Props {
  page: string;
  title: string;
  letters: LetterRecord[];
  user: DemoUser;
  onSelect: (letter: LetterRecord) => void;
  onClassify: (code: string) => void;
  onExport: () => void;
  onPrint: (letter: LetterRecord) => void;
  onEdit?: (letter: LetterRecord) => void;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function ReferenceViews({
  page,
  title,
  letters,
  user,
  onSelect,
  onClassify,
  onExport,
  onPrint,
  onEdit,
  onNavigate = () => {},
  onLogout,
}: Props) {
  const isAdmin = user.label === 'Super Admin' || user.label === 'Developer' || user.username === 'admin' || user.username === 'developer';

  if (page === 'classification')
    return (
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Master Klasifikasi Arsip Dispora</h2>
            <p>Standar kode klasifikasi persuratan dinas Pemprov Kalimantan Selatan</p>
          </div>
        </div>
        <div className="records">
          {classifications.map(([code, label]) => (
            <button key={code} onClick={() => onClassify(code)}>
              <span className="code-icon mono">{code}</span>
              <div>
                <b>{label}</b>
                <p>Telusuri arsip kedinasan dengan kode {code}</p>
              </div>
              <Icon name="chevron" />
            </button>
          ))}
        </div>
      </section>
    );

  if (page === 'profile') {
    return <ProfileView user={user} onNavigate={onNavigate} onLogout={onLogout} />;
  }

  if (page === 'users' || page === 'audit') {
    if (!isAdmin) {
      return (
        <section className="panel p-8 text-center my-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
            <Icon name="shield" size={24} />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">Akses Terbatas: Khusus Administrator IT &amp; Developer</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto mb-4">
            Menu {page === 'users' ? 'Manajemen Pengguna' : 'Audit Trail Keamanan'} hanya dapat diakses oleh Administrator IT atau Pengembang Sistem resmi.
          </p>
          <button type="button" className="btn primary" onClick={() => onNavigate('dashboard')}>
            Kembali ke Beranda
          </button>
        </section>
      );
    }

    if (page === 'users') {
      return (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Manajemen Akun Terdaftar</h2>
              <p>Daftar aparatur berwenang dan tingkat otorisasi akses kearsipan dinas</p>
            </div>
            <span className="small-count">{demoUsers.length} Akun</span>
          </div>
          <div className="records">
            {demoUsers.map((account) => (
              <div className="account-row" key={account.username}>
                <div className="top-avatar">{account.initials}</div>
                <div>
                  <b>{account.name}</b>
                  <p>{account.role} &bull; <span className="font-medium text-slate-500">{account.unitKerja}</span></p>
                  <p className="mono">@{account.username}</p>
                </div>
                <span className={`badge ${account.label === 'Developer' ? 'kilat' : account.label === 'Super Admin' ? 'penting' : 'biasa'}`}>
                  {account.label}
                </span>
              </div>
            ))}
          </div>
        </section>
      );
    }

    return (
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Audit Trail &amp; Keamanan Sesi</h2>
            <p>Jejak audit keamanan aktivitas kearsipan dinas terotentikasi</p>
          </div>
          <button className="btn outline" onClick={onExport}>
            <Icon name="download" /> Ekspor Log
          </button>
        </div>
        <div className="records">
          {[
            `Sesi terotentikasi aktif - ${user.name} (${user.label})`,
            'Indeks pindaian naskah fisik tersinkronisasi aman',
            'Riwayat disposisi fisik tercatat resmi dalam audit trail',
            'Enkripsi TLS 1.3 dan perlindungan otentikasi sesi aktif',
          ].map((text) => (
            <div className="audit-row" key={text}>
              <Icon name="shield" />
              <b>{text}</b>
              <span className="badge biasa">Log Kedinasan</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (page === 'distribution')
    return <DistributionView letters={letters} onExport={onExport} />;

  if (page === 'history')
    return <DispositionHistoryView letters={letters} onSelect={onSelect} onEdit={onEdit} onExport={onExport} />;

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          <p>Rekapitulasi arsip kedinasan Dispora Kalsel</p>
        </div>
        <button className="btn outline" onClick={onExport}>
          <Icon name="download" /> Ekspor Excel
        </button>
      </div>
      <ArchiveTable letters={letters} onSelect={onSelect} onPrint={onPrint} />
    </section>
  );
}
