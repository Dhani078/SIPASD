'use client';

import { useState } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { getGdriveFolderUrl } from '@/data/constants';
import type { LetterRecord } from '@/types';

interface Props {
  letter: LetterRecord;
  onClose: () => void;
  onPrint: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PdfPreviewPanel({ letter, onClose, onPrint, onEdit, onDelete }: Props) {
  const [pdfLoading, setPdfLoading] = useState(true);
  const [fitMode, setFitMode] = useState<'page' | 'width'>('page');
  const [maximized, setMaximized] = useState(false);

  const pdfUrl = letter.fileUrl
    ? `/api/pdf?url=${encodeURIComponent(letter.fileUrl)}`
    : '/placeholder-surat.pdf';

  const letterYear = letter.date ? letter.date.slice(0, 4) : '2026';
  const defaultFolderUrl = getGdriveFolderUrl(letter.direction === 'in' ? 'masuk' : 'keluar', letterYear);
  let driveUrl = (letter.driveUrl || '').trim();
  if (
    !driveUrl ||
    driveUrl === 'https://drive.google.com' ||
    driveUrl === 'https://drive.google.com/' ||
    driveUrl.endsWith('/home') ||
    driveUrl.includes('folders/1deTFD7oICTXkkMs5HzS') ||
    driveUrl.includes('folders/1rgWCFwULt8awBCVIuomy')
  ) {
    driveUrl = defaultFolderUrl;
  }

  const viewHash = fitMode === 'page' ? '#view=Fit&zoom=page-fit' : '#view=FitH';
  const cleanAgenda = letter.id.replace(/\/(SM|SK)\/.*$/i, '');

  return (
    <Modal
      title={`Pratinjau Berkas Fisik: No. Agenda ${cleanAgenda}/${letter.direction === 'in' ? 'SM' : 'SK'}/${letterYear}`}
      onClose={onClose}
      className={`pdf-modal-popup ${maximized ? 'pdf-modal-fullscreen' : ''}`}
      overlayClassName="pdf-overlay-popup"
    >
      <div className="pdf-modal-meta">
        <span className="font-semibold text-emerald-950">{letter.origin}</span>
        <span className="text-slate-400 mx-1.5">|</span>
        <span className="text-slate-600">{letter.subject}</span>
      </div>

      <div className="document-tools my-1.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            className="hover:border-emerald-500 hover:text-emerald-800 transition-colors"
            title="Ubah skala halaman utuh atau lebar penuh"
            onClick={() => setFitMode((m) => (m === 'page' ? 'width' : 'page'))}
          >
            <Icon name="eye" size={13} />
            <span>{fitMode === 'page' ? '1 Lembar Utuh' : 'Lebar Penuh'}</span>
          </button>

          <button
            type="button"
            className="hover:border-emerald-500 hover:text-emerald-800 transition-colors"
            title={maximized ? 'Kembalikan ukuran normal' : 'Perluas tampilan PDF layar penuh'}
            onClick={() => setMaximized((v) => !v)}
          >
            <Icon name={maximized ? 'minimize' : 'maximize'} size={13} />
            <span>{maximized ? 'Kecilkan' : 'Layar Penuh'}</span>
          </button>

          <button
            type="button"
            className="hover:border-emerald-500 hover:text-emerald-800 transition-colors"
            title="Buka dokumen di tab peramban baru"
            onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
          >
            <Icon name="eye" size={13} />
            <span>Tab Baru</span>
          </button>

          <button
            type="button"
            className="hover:border-emerald-500 hover:text-emerald-800 transition-colors"
            title="Unduh dokumen asli"
            onClick={() => {
              const a = document.createElement('a');
              a.href = pdfUrl;
              a.download = `${cleanAgenda}.pdf`;
              a.target = '_blank';
              a.click();
            }}
          >
            <Icon name="download" size={13} />
            <span>Unduh PDF</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              type="button"
              className="hover:border-amber-500 hover:text-amber-800 transition-colors"
              title="Edit metadata berkas arsip ini"
              onClick={onEdit}
            >
              <Icon name="edit" size={13} />
              <span>Edit Arsip</span>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              className="btn-danger-outline transition-colors"
              title="Hapus berkas arsip ini dari sistem"
              onClick={onDelete}
            >
              <Icon name="trash" size={13} />
              <span>Hapus</span>
            </button>
          )}

          <button
            type="button"
            className="btn-disposisi-primary transition-all active:scale-95"
            title="Buka lembar cetak disposisi pimpinan"
            onClick={onPrint}
          >
            <Icon name="print" size={14} />
            <span>Cetak Disposisi</span>
          </button>
        </div>
      </div>

      <div className="pdf-frame-wrap" style={{ flex: 1, width: '100%', minHeight: '0', position: 'relative' }}>
        {letter.fileUrl ? (
          <>
            {pdfLoading && (
              <div className="pdf-loading" style={{ position: 'absolute', inset: 0, zIndex: 2, background: '#fff' }}>
                <div className="pdf-spinner" />
                <span>Memuat dokumen PDF dari Cloudinary CDN...</span>
              </div>
            )}
            <iframe
              key={`${viewHash}-${maximized}`}
              src={`${pdfUrl}${viewHash}&toolbar=1&navpanes=0`}
              title={`Dokumen PDF ${cleanAgenda}`}
              className="w-full h-full border rounded bg-white shadow-inner"
              style={{ width: '100%', height: '100%', border: '1px solid #cbd5e1' }}
              onLoad={() => setPdfLoading(false)}
            />
          </>
        ) : (
          <div className="empty p-8 text-center text-slate-500">
            <Icon name="file" size={32} />
            <p className="mt-2 font-medium">Dokumen fisik sedang dalam antrean sinkronisasi Cloudinary.</p>
            <p className="text-xs text-slate-400 mt-1">Nomor Surat: {letter.number}</p>
          </div>
        )}
      </div>

      <div className="preview-foot mt-2 pt-2 border-t flex items-center justify-between text-xs">
        <span className="tag green">Cloudinary CDN Aktif (Signed Stream)</span>
        <a
          href={driveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="drive-link text-emerald-800 font-medium flex items-center gap-1"
          title="Buka cadangan di Google Drive dinas"
        >
          <Icon name="shield" size={12} />
          <span>Buka Cadangan Google Drive</span>
        </a>
      </div>
    </Modal>
  );
}