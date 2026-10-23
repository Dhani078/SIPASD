'use client';

import Modal from './Modal';
import Icon from './Icon';

interface Props {
  onClose: () => void;
}

export default function DispositionInfoModal({ onClose }: Props) {
  return (
    <Modal title="Fungsi Riwayat Disposisi Fisik" onClose={onClose}>
      <div className="p-4 space-y-3 text-slate-700">
        <div className="flex items-start gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg">
          <Icon name="shield" size={22} />
          <div className="text-xs text-slate-700 leading-relaxed">
            <b className="block text-emerald-950 text-sm mb-1">Pencatatan Lembar Disposisi Fisik</b>
            <p>
              Riwayat Disposisi mencatat lembar disposisi kertas fisik yang distaples di surat masuk.
              Setiap entri merekam: pejabat pendisposisi, tanggal, bidang tujuan, instruksi, catatan tertulis,
              dan status penyelesaian (Belum Diproses, Sedang Proses, Selesai).
            </p>
          </div>
        </div>
        <div className="text-xs space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
          <p>• <b>Pejabat Pendisposisi:</b> Pimpinan yang memberi arahan (Kepala Dinas, Sekretaris, atau Kabid).</p>
          <p>• <b>Kepada Bidang:</b> Unit kerja pelaksana instruksi tindak lanjut.</p>
          <p>• <b>Status Tindak Lanjut:</b> Monitoring progres pelaksanaan disposisi hingga tuntas.</p>
        </div>
        <div className="modal-actions pt-2 flex justify-end">
          <button
            type="button"
            className="btn primary px-4 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded transition-colors"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
}