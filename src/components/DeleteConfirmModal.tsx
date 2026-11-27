'use client';

import { useId, useState } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import type { LetterRecord } from '@/types';

interface Props {
  letter: LetterRecord;
  batch?: LetterRecord[];
  deleting: boolean;
  onBackup?: () => void;
  onClose: () => void;
  onConfirm: (trashDrive?: boolean) => Promise<void> | void;
}

export default function DeleteConfirmModal({
  letter,
  batch,
  deleting,
  onBackup,
  onClose,
  onConfirm,
}: Props) {
  const [trashDrive, setTrashDrive] = useState(true);
  const cbId = useId();
  const isBatch = batch && batch.length > 1;
  const count = batch?.length || 1;

  return (
    <Modal title="Konfirmasi Penghapusan Arsip" onClose={onClose} className="max-w-lg">
      <div className="p-5 space-y-4 text-xs text-slate-700">
        <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 flex items-start gap-3.5">
          <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl shrink-0">
            <Icon name="trash" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-rose-950 text-sm">
              {isBatch ? `Hapus ${count} Berkas Arsip Terpilih?` : `Hapus Arsip Agenda #${letter.id}?`}
            </h3>
            {isBatch ? (
              <p className="text-xs text-rose-800 mt-1">
                {count} berkas naskah akan dihapus secara permanen dari basis data kearsipan TiDB Cloud.
              </p>
            ) : (
              <p className="text-xs text-rose-900 mt-1 font-medium">
                Nomor Surat: <span className="font-mono font-bold">{letter.number}</span> &bull; {letter.origin}
              </p>
            )}
            <p className="text-[11px] text-rose-700 mt-2 font-medium">
              ⚠️ Peringatan: Tindakan ini permanen. Seluruh data registrasi dan riwayat disposisi akan dimusnahkan.
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
          <input
            id={cbId}
            type="checkbox"
            checked={trashDrive}
            onChange={(e) => setTrashDrive(e.target.checked)}
            className="mt-0.5 rounded text-emerald-600 cursor-pointer focus:ring-emerald-500"
          />
          <label htmlFor={cbId} className="flex-1 cursor-pointer">
            <b className="font-semibold text-slate-900 block">
              Pindahkan file fisik PDF ke Kotak Sampah Google Drive
            </b>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              File digital di cloud tidak langsung dimusnahkan, melainkan dipindahkan ke folder Trash dan dapat dipulihkan dalam 30 hari.
            </span>
          </label>
        </div>
        {isBatch && onBackup && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2 text-xs">
            <span className="text-amber-900 font-medium">Disarankan ekspor cadangan sebelum menghapus massal.</span>
            <button type="button" onClick={onBackup} className="px-2.5 py-1 rounded bg-white border border-amber-300 text-amber-900 font-semibold hover:bg-amber-100 shrink-0 inline-flex items-center gap-1 cursor-pointer">
              <Icon name="download" size={12} /> Unduh Excel
            </button>
          </div>
        )}
      </div>

      <div className="modal-actions">
        <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <Icon name="shield" size={13} className="text-rose-600" /> Otorisasi Administrator SPBE
        </span>
        <button type="button" className="btn outline" onClick={onClose} disabled={deleting}>
          Batal
        </button>
        <button
          type="button"
          className="btn primary bg-rose-600 hover:bg-rose-700 border-rose-600 text-white font-semibold flex items-center gap-1.5 shadow-sm"
          onClick={() => onConfirm(trashDrive)}
          disabled={deleting}
        >
          {deleting ? (
            <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Icon name="trash" size={14} />
          )}
          <span>{deleting ? 'Menghapus...' : isBatch ? `Ya, Hapus ${count} Arsip` : 'Ya, Hapus Arsip'}</span>
        </button>
      </div>
    </Modal>
  );
}
