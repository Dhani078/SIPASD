'use client';

import { useId, useState } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import type { LetterRecord } from '@/types';

interface Props {
  letter: LetterRecord;
  batch?: LetterRecord[];
  deleting: boolean;
  onClose: () => void;
  onConfirm: (trashDrive?: boolean) => Promise<void> | void;
}

export default function DeleteConfirmModal({
  letter,
  batch,
  deleting,
  onClose,
  onConfirm,
}: Props) {
  const [trashDrive, setTrashDrive] = useState(true);
  const cbId = useId();
  const isBatch = batch && batch.length > 1;
  const count = batch?.length || 1;
  return (
    <Modal title="Konfirmasi Penghapusan Arsip" onClose={onClose}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 text-red-700 rounded-full flex-shrink-0">
            <Icon name="trash" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {isBatch ? `Hapus ${count} Arsip Terpilih?` : `Hapus Arsip No. Agenda ${letter.id}?`}
            </h3>
            {isBatch ? (
              <p className="text-xs text-slate-600 mt-1">
                {count} arsip akan dihapus secara permanen dari TiDB Cloud.
              </p>
            ) : (
              <p className="text-xs text-slate-600 mt-1">
                Nomor Surat: <b>{letter.number}</b> &bull; Instansi: {letter.origin}
              </p>
            )}
            <p className="text-xs text-red-600 mt-2 font-medium bg-red-50 p-2 border border-red-200 rounded">
              Perhatian: Tindakan ini permanen. Data arsip dan riwayat disposisi akan dihapus dari TiDB Cloud Serverless.
            </p>
          </div>
        </div>

        <div className="mt-3.5 p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 flex items-start gap-2.5">
          <input
            id={cbId}
            type="checkbox"
            checked={trashDrive}
            onChange={(e) => setTrashDrive(e.target.checked)}
            className="mt-0.5 rounded text-emerald-600 cursor-pointer"
          />
          <label htmlFor={cbId} className="flex-1 cursor-pointer">
            <b className="font-semibold text-slate-900 block">
              Pindahkan file PDF ke Kotak Sampah (Trash) Google Drive
            </b>
            <span className="text-[11px] text-slate-500 block mt-0.5 font-normal">
              File fisik tidak langsung dimusnahkan, melainkan masuk ke folder Sampah Drive dan dapat dipulihkan dalam 30 hari.
            </span>
          </label>
        </div>

        <div className="modal-actions mt-4 flex justify-end gap-2">
          <button type="button" className="btn outline" onClick={onClose} disabled={deleting}>
            Batal
          </button>
          <button
            type="button"
            className="btn primary bg-red-600 hover:bg-red-700 border-red-600 text-white"
            onClick={() => onConfirm(trashDrive)}
            disabled={deleting}
          >
            {deleting ? 'Menghapus...' : isBatch ? `Ya, Hapus ${count} Arsip` : 'Ya, Hapus Arsip'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
