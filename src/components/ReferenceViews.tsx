'use client';

import ArchiveTable from './ArchiveTable';
import Icon from './Icon';
import Badge from './Badge';
import Modal from './Modal';
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
}: Props) {
  if (page === 'classification')
    return (
      <section className="panel">
        <div className="panel-heading">
          <h2>Master Klasifikasi Arsip Dispora</h2>
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

  if (page === 'users' || page === 'profile')
    return (
      <section className="panel">
        <div className="panel-heading">
          <h2>{page === 'profile' ? 'Profil Pengguna' : 'Manajemen Akun Terdaftar'}</h2>
          <Badge type="Biasa" />
        </div>
        <div className="records">
          {(page === 'profile' ? [user] : demoUsers).map((account) => (
            <div className="account-row" key={account.username}>
              <div className="top-avatar">{account.initials}</div>
              <div>
                <b>{account.name}</b>
                <p>{account.role}</p>
                <p className="mono">{account.username}</p>
              </div>
              <span className="badge biasa">Aktif - TiDB</span>
            </div>
          ))}
        </div>
      </section>
    );

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          <p>
            {page === 'audit'
              ? 'Jejak audit keamanan aktivitas kearsipan di TiDB Cloud'
              : 'Rekapitulasi arsip dinas'}
          </p>
        </div>
        <button className="btn outline" onClick={onExport}>
          <Icon name="download" />
          Ekspor Excel
        </button>
      </div>
      {page === 'audit' ? (
        <div className="records">
          {[
            `Sesi terotentikasi aktif - ${user.name}`,
            'Indeks pindaian PDF tersinkronisasi Cloudinary',
            'Riwayat disposisi tercatat di tabel TiDB',
          ].map((text) => (
            <div className="audit-row" key={text}>
              <Icon name="shield" />
              <b>{text}</b>
              <span className="badge biasa">TiDB Log</span>
            </div>
          ))}
        </div>
      ) : (
        <ArchiveTable letters={letters} onSelect={onSelect} onPrint={onPrint} />
      )}
    </section>
  );
}

export function HelpModal({
  kind,
  onClose,
}: {
  kind: string;
  onClose: () => void;
}) {
  return (
    <Modal
      title={
        kind === 'classification'
          ? 'Kode Klasifikasi Arsip'
          : 'Panduan SOP Persuratan Dispora'
      }
      onClose={onClose}
    >
      {kind === 'classification' ? (
        <div className="records">
          {classifications.map(([code, label]) => (
            <div className="audit-row" key={code}>
              <Icon name="file" />
              <b>
                {code} - {label}
              </b>
            </div>
          ))}
        </div>
      ) : (
        <div className="sop-content">
          {[
            [
              '01',
              'Penerimaan & Pemeriksaan',
              'Petugas TU memeriksa kelengkapan, nomor, tanggal, dan asal surat.',
            ],
            [
              '02',
              'Digitalisasi & Pengindeksan',
              'Pindai dokumen dan isi metadata sesuai kode klasifikasi arsip.',
            ],
            [
              '03',
              'Disposisi Pimpinan',
              'Kepala Dinas memberikan instruksi dan menentukan bidang tujuan.',
            ],
            [
              '04',
              'Tindak Lanjut & Pengarsipan',
              'Bidang tujuan menindaklanjuti surat dan menyimpan bukti penyelesaian.',
            ],
          ].map(([number, title, text]) => (
            <div key={number}>
              <span>{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
          <button className="btn primary" onClick={onClose}>
            Saya Memahami Alur Persuratan
            <Icon name="check" />
          </button>
        </div>
      )}
    </Modal>
  );
}
