'use client';

import Modal from './Modal';
import Icon from './Icon';
import type { LetterRecord } from '@/types';

interface Props {
  letter: LetterRecord;
  batch?: LetterRecord[];
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function DeleteConfirmModal({
  letter,
  batch,
  deleting,
  onClose,
  onConfirm,
}: Props) {
  const isBatch = batch && batch.length > 1;
  const count = batch?.length || 1;
  return (
    <Modal title="Konfirmasi Penghapusan Arsip" onClose={onClose}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 text-red-700 rounded-full flex-shrink-0">
            <Icon name="close" size={20} />
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

        <div className="modal-actions mt-4 flex justify-end gap-2">
          <button type="button" className="btn outline" onClick={onClose} disabled={deleting}>
            Batal
          </button>
          <button
            type="button"
            className="btn primary bg-red-600 hover:bg-red-700 border-red-600 text-white"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? 'Menghapus...' : isBatch ? `Ya, Hapus ${count} Arsip` : 'Ya, Hapus Arsip'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
