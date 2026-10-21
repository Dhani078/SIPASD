'use client';

import { useState } from 'react';
import Icon from './Icon';
import type { LetterRecord } from '@/types';

interface Props {
  letter: LetterRecord;
  onClose: () => void;
  onPrint: () => void;
}

export default function PdfPreviewPanel({ letter, onClose, onPrint }: Props) {
  const [zoom, setZoom] = useState(1);
  const pdfUrl = letter.fileUrl || '/placeholder-surat.pdf';
  const driveUrl = letter.driveUrl || 'https://drive.google.com';

  return (
    <aside
      className="inline-preview"
      aria-label={`Pratinjau PDF surat ${letter.id}`}
    >
      <div className="preview-toolbar">
        <strong className="mono">{letter.id}.pdf</strong>
        <div className="flex items-center gap-2">
          <button
            className="icon-btn"
            aria-label="Tutup pratinjau"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>
      </div>
      <div className="document-tools">
        <button
          aria-label="Perkecil tampilan"
          disabled={zoom <= 0.7}
          onClick={() => setZoom((z) => Math.max(0.7, +(z - 0.1).toFixed(1)))}
        >
          -
        </button>
        <span className="mono">{Math.round(zoom * 100)}%</span>
        <button
          aria-label="Perbesar tampilan"
          disabled={zoom >= 1.5}
          onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(1)))}
        >
          +
        </button>
        <button
          className="btn outline"
          title="Buka dokumen di tab baru"
          onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
        >
          <Icon name="eye" size={14} /> Buka Tab
        </button>
        <button
          className="btn outline"
          title="Unduh dokumen PDF"
          onClick={() => {
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.download = `${letter.id}.pdf`;
            a.target = '_blank';
            a.click();
          }}
        >
          <Icon name="download" size={14} /> Unduh
        </button>
        <button className="btn primary" onClick={onPrint}>
          <Icon name="print" size={14} /> Disposisi
        </button>
      </div>

      <div className="preview-canvas-wrap" style={{ flex: 1, minHeight: '400px' }}>
        {letter.fileUrl ? (
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            title={`Dokumen PDF ${letter.id}`}
            className="w-full h-full border-0 rounded bg-white shadow-inner"
            style={{ minHeight: '520px', width: '100%', transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          />
        ) : (
          <div className="empty p-8 text-center text-slate-500">
            <Icon name="file" size={32} />
            <p className="mt-2 font-medium">Dokumen fisik sedang dalam antrean sinkronisasi Cloudinary.</p>
            <p className="text-xs text-slate-400 mt-1">Nomor Surat: {letter.number}</p>
          </div>
        )}
      </div>

      <div className="preview-foot">
        <span className="tag green">Cloudinary CDN Aktif</span>
        <a
          href={driveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="drive-link"
          title="Buka cadangan di Google Drive dinas"
        >
          <Icon name="shield" size={12} /> Buka Cadangan Google Drive
        </a>
      </div>
    </aside>
  );
}
