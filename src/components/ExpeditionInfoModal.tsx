'use client';

import Modal from './Modal';
import Icon from './Icon';

interface Props {
  tercatat: number;
  total: number;
  onClose: () => void;
}

export default function ExpeditionInfoModal({ tercatat, total, onClose }: Props) {
  return (
    <Modal title="Fungsi Buku Ekspedisi Surat Keluar" onClose={onClose}>
      <div className="p-4 space-y-3 text-slate-700">
        <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-lg">
          <Icon name="shield" size={22} />
          <div className="text-xs text-slate-700 leading-relaxed">
            <b className="block text-blue-950 text-sm mb-1">Pencatatan Distribusi Fisik Surat Keluar</b>
            <p>
              Buku Ekspedisi mencatat tanda terima distribusi fisik surat keluar oleh kurir dinas.
              Setiap entri merekam tanggal kirim, kurir pengirim, penerima beserta nomor telepon, dan catatan serah terima.
            </p>
            <p className="mt-2 font-semibold text-blue-900 bg-blue-100/70 inline-block px-2 py-0.5 rounded">
              Sudah tercatat: {tercatat} dari {total} surat keluar.
            </p>
          </div>
        </div>
        <div className="text-xs space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
          <p>• <b>Kurir Pengirim:</b> Petugas atau kurir internal Dispora yang mengantar naskah dinas.</p>
          <p>• <b>Nama Penerima:</b> Pejabat atau staf di instansi tujuan yang menandatangani serah terima.</p>
          <p>• <b>Akuntabilitas:</b> Bukti autentik naskah dinas keluar telah terdistribusi ke penerima resmi.</p>
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