'use client';

import Modal from './Modal';
import Icon from './Icon';
import { classifications } from '@/data/constants';

interface Props {
  kind: string;
  onClose: () => void;
}

export default function HelpModal({ kind, onClose }: Props) {
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
