'use client';

import { useState } from 'react';
import Modal from './Modal';
import Letter from './Letter';
import Icon from './Icon';
import { divisions } from '@/data/constants';
import type { LetterRecord } from '@/types';

const INSTRUCTION_OPTIONS = [
  'Tindak Lanjuti',
  'Hadiri / Wakili',
  'Pelajari',
  'Koordinasikan',
  'Arsipkan',
];

export default function PrintDisposisiModal({
  letter,
  onClose,
}: {
  letter: LetterRecord;
  onClose: () => void;
}) {
  const [paper, setPaper] = useState('A4');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    official: letter.disposition?.official || 'Pebriadin Hapiz, AP, M.Si',
    division: letter.disposition?.division || divisions[0],
    instructions: letter.disposition?.instructions || [],
    notes: letter.disposition?.notes || '',
  });

  const toggleInstruction = (item: string) => {
    setEditData((prev) => ({
      ...prev,
      instructions: prev.instructions.includes(item)
        ? prev.instructions.filter((i) => i !== item)
        : [...prev.instructions, item],
    }));
  };

  const workingLetter: LetterRecord = {
    ...letter,
    disposition: editMode
      ? {
          date: letter.disposition?.date || letter.date,
          official: editData.official,
          division: editData.division,
          instructions: editData.instructions,
          notes: editData.notes,
        }
      : letter.disposition
      ? letter.disposition
      : {
          date: letter.date,
          official: editData.official,
          division: editData.division,
          instructions: editData.instructions,
          notes: editData.notes,
        },
  };

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
        <button
          type="button"
          className="text-btn"
          onClick={() => setEditMode((v) => !v)}
        >
          {editMode ? 'Selesai Edit' : 'Edit Disposisi'}
        </button>
      </div>

      {editMode && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded mb-3 space-y-3">
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Pejabat Pendisposisi</span>
            <input
              type="text"
              className="w-full mt-1 px-2 py-1 text-sm border border-slate-300 rounded"
              value={editData.official}
              onChange={(e) => setEditData({ ...editData, official: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Diteruskan Kepada Bidang</span>
            <select
              className="w-full mt-1 px-2 py-1 text-sm border border-slate-300 rounded"
              value={editData.division}
              onChange={(e) => setEditData({ ...editData, division: e.target.value })}
            >
              {divisions.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-2">Instruksi Kedinasan</span>
            <div className="flex flex-wrap gap-2">
              {INSTRUCTION_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleInstruction(item)}
                  className={`px-3 py-1.5 rounded text-xs border transition-colors ${
                    editData.instructions.includes(item)
                      ? 'bg-emerald-900 text-white border-emerald-900'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  {editData.instructions.includes(item) ? '[X] ' : '[ ] '}
                  {item}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Catatan Tertulis Pimpinan</span>
            <textarea
              className="w-full mt-1 px-2 py-1 text-sm border border-slate-300 rounded"
              rows={3}
              value={editData.notes}
              onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
              placeholder="Contoh: Segera koordinasi dengan Bidang Sarana untuk ketersediaan venue..."
            />
          </label>
        </div>
      )}

      <Letter letter={workingLetter} disposition />
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
