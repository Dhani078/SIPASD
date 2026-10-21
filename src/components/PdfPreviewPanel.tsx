'use client';

import Modal from './Modal';
import Icon from './Icon';
import type { LetterRecord } from '@/types';

interface Props {
  letter: LetterRecord;
  onClose: () => void;
  onPrint: () => void;
}

export default function PdfPreviewPanel({ letter, onClose, onPrint }: Props) {
  const pdfUrl = letter.fileUrl
    ? `/api/pdf?url=${encodeURIComponent(letter.fileUrl)}`
    : '/placeholder-surat.pdf';
  const driveUrl = letter.driveUrl || 'https://drive.google.com';

  return (
    <Modal
      title={`Pratinjau Berkas Fisik: No. Agenda ${letter.id}/${letter.direction === 'in' ? 'SM' : 'SK'}/2026`}
      onClose={onClose}
      className="pdf-modal-popup"
      overlayClassName="pdf-overlay-popup"
    >
      <div className="pdf-modal-meta">
        <span className="font-semibold text-emerald-950">{letter.origin}</span>
        <span className="text-slate-400 mx-1.5">|</span>
        <span className="text-slate-600">{letter.subject}</span>
      </div>

      <div className="document-tools my-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn outline py-1 px-3 text-xs"
            title="Buka dokumen PDF di tab peramban baru"
            onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
          >
            <Icon name="eye" size={14} /> Buka Tab Baru
          </button>
          <button
            type="button"
            className="btn outline py-1 px-3 text-xs"
            title="Unduh dokumen fisik asli"
            onClick={() => {
              const a = document.createElement('a');
              a.href = pdfUrl;
              a.download = `${letter.id}.pdf`;
              a.target = '_blank';
              a.click();
            }}
          >
            <Icon name="download" size={14} /> Unduh PDF
          </button>
        </div>
        <button type="button" className="btn primary py-1 px-3 text-xs" onClick={onPrint}>
          <Icon name="print" size={14} /> Cetak Disposisi
        </button>
      </div>

      <div className="pdf-frame-wrap" style={{ flex: 1, width: '100%', minHeight: '0', position: 'relative' }}>
        {letter.fileUrl ? (
          <iframe
            src={`${pdfUrl}#view=FitH&toolbar=1&navpanes=0`}
            title={`Dokumen PDF ${letter.id}`}
            className="w-full h-full border rounded bg-white shadow-inner"
            style={{ width: '100%', height: '100%', border: '1px solid #cbd5e1' }}
          />
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
          <Icon name="shield" size={12} /> Buka Cadangan Google Drive
        </a>
      </div>
    </Modal>
  );
}
