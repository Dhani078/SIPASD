'use client';

import { useState } from 'react';
import Modal from './Modal';
import Letter from './Letter';
import Icon from './Icon';
import type { LetterRecord } from '@/types';

export default function PrintDisposisiModal({
  letter,
  onClose,
}: {
  letter: LetterRecord;
  onClose: () => void;
}) {
  const [paper, setPaper] = useState('A4');

  return (
    <Modal
      title="Pratinjau Lembar Disposisi"
      onClose={onClose}
      className={`print-modal paper-${paper.toLowerCase()}`}
      overlayClassName="print-overlay"
    >
      <style>{`@media print { @page { size: ${
        paper === 'A4' ? '210mm 297mm' : '210mm 330mm'
      }; margin: 10mm; } }`}</style>
      <div className="print-settings">
        <label>
          Ukuran kertas{' '}
          <select value={paper} onChange={(e) => setPaper(e.target.value)}>
            <option>A4</option>
            <option>F4</option>
          </select>
        </label>
        <span>Margin 1 cm - Dokumen Resmi Pemprov Kalsel</span>
      </div>
      <Letter letter={letter} disposition />
      <div className="modal-actions">
        <button className="btn outline" onClick={onClose}>
          Tutup
        </button>
        <button className="btn primary" onClick={() => window.print()}>
          <Icon name="print" />
          Cetak Disposisi
        </button>
      </div>
    </Modal>
  );
}
