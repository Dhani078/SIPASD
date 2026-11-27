'use client';

import { useState } from 'react';
import Modal from './Modal';
import Letter from './Letter';
import Icon from './Icon';
import { divisions } from '@/data/constants';
import type { Disposition, LetterRecord } from '@/types';

const POSISI_SURAT_OPTIONS = ['Diterima Persuratan', 'Kepala Dinas', 'Selesai'];

interface Props {
  letter: LetterRecord;
  onClose: () => void;
  onSaveDisposition?: (disposition: Disposition) => Promise<void>;
}

export default function PrintDisposisiModal({ letter, onClose, onSaveDisposition }: Props) {
  const [paper, setPaper] = useState('A4');
  const [editMode, setEditMode] = useState(false);
  const [savingDisp, setSavingDisp] = useState(false);
  const [editData, setEditData] = useState({
    official: letter.disposition?.official || 'Pebriadin Hapiz, AP, M.Si',
    division: letter.disposition?.division || divisions[0],
    instructions: letter.disposition?.instructions || ['Tindak Lanjuti'],
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
      : letter.disposition || {
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
      className={`print-modal max-w-4xl paper-${paper.toLowerCase()}`}
      overlayClassName="print-overlay"
    >
      <style>{`@media print { @page { size: ${paper === 'A4' ? '210mm 297mm' : '210mm 330mm'}; margin: 10mm; } }`}</style>

      <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs print:hidden">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Ukuran Kertas:</span>
          <select value={paper} onChange={(e) => setPaper(e.target.value)} className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-semibold focus:border-emerald-600 outline-none">
            <option>A4</option><option>F4</option>
          </select>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-xs font-semibold text-slate-700 transition"
            onClick={() => setEditMode((v) => !v)}
          >
            {editMode ? '✓ Tutup Editor' : '✏️ Koreksi Disposisi'}
          </button>
          {editMode && onSaveDisposition && (
            <button
              type="button"
              disabled={savingDisp}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold transition"
              onClick={async () => {
                setSavingDisp(true);
                try {
                  await onSaveDisposition({
                    ...(letter.disposition || { date: letter.date }),
                    official: editData.official,
                    division: editData.division,
                    instructions: editData.instructions,
                    notes: editData.notes,
                  });
                  setEditMode(false);
                } finally {
                  setSavingDisp(false);
                }
              }}
            >
              {savingDisp ? 'Menyimpan...' : 'Simpan ke TiDB'}
            </button>
          )}
          {letter.dispositionFileUrl && (
            <button
              type="button"
              className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded text-xs font-semibold transition"
              onClick={() => window.open(`/api/pdf?url=${encodeURIComponent(letter.dispositionFileUrl!)}&name=${encodeURIComponent(letter.dispositionFileName || 'disposisi.pdf')}`, '_blank')}
            >
              📄 Buka Scan Asli
            </button>
          )}
        </div>
      </div>

      {editMode && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg my-2 space-y-3 text-xs print:hidden">
          <label className="block">
            <span className="font-semibold text-slate-700">Pejabat Pendisposisi</span>
            <input
              type="text"
              className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-emerald-600"
              value={editData.official}
              onChange={(e) => setEditData({ ...editData, official: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="font-semibold text-slate-700">Diteruskan Kepada Bidang</span>
            <select
              className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-emerald-600"
              value={editData.division}
              onChange={(e) => setEditData({ ...editData, division: e.target.value })}
            >
              {divisions.map((d) => (<option key={d}>{d}</option>))}
            </select>
          </label>
          <div>
            <span className="block font-semibold text-slate-700 mb-1.5">Posisi Surat</span>
            <div className="flex flex-wrap gap-2">
              {POSISI_SURAT_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleInstruction(item)}
                  className={`px-3 py-1 rounded text-xs border transition ${
                    editData.instructions.includes(item)
                      ? 'bg-emerald-900 text-white border-emerald-900 font-semibold'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  {editData.instructions.includes(item) ? '✓ ' : '+ '} {item}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="font-semibold text-slate-700">Catatan Tertulis Pimpinan</span>
            <textarea
              className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-emerald-600 resize-none"
              rows={2}
              value={editData.notes}
              onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
              placeholder="Catatan arahan pimpinan..."
            />
          </label>
        </div>
      )}

      <div className="max-h-[70vh] overflow-auto p-2 sm:p-4 bg-slate-100/70 rounded-xl my-2 flex justify-start sm:justify-center print:max-h-none print:overflow-visible print:p-0 print:m-0 print:bg-transparent">
        <div className="w-full min-w-[300px] max-w-[210mm] shadow-md bg-white print:shadow-none">
          <Letter letter={workingLetter} disposition />
        </div>
      </div>

      <div className="modal-actions">
        <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <Icon name="shield" size={13} className="text-emerald-700" /> Lembar Disposisi Resmi Kadispora Kalsel
        </span>
        <button type="button" className="btn outline" onClick={onClose}>Tutup</button>
        <button
          type="button"
          className="btn primary bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5 shadow-sm"
          onClick={() => window.print()}
        >
          <Icon name="print" size={15} /> <span>Cetak Disposisi</span>
        </button>
      </div>
    </Modal>
  );
}
