'use client';

import { useState } from 'react';
import Icon from './Icon';
import Modal from './Modal';
import { formatDate } from '@/lib/format';
import type { LetterRecord } from '@/types';

interface ExpeditionRecord {
  id: string;
  surat_keluar_id: string;
  tanggal_kirim: string;
  kurir_pengirim: string;
  penerima_nama: string;
  penerima_telepon: string | null;
  bukti_terima_url: string | null;
  catatan_ekspedisi: string | null;
  letter?: LetterRecord;
}

interface Props {
  letters: LetterRecord[];
  onExport: () => void;
}

export default function DistributionView({ letters, onExport }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<LetterRecord | null>(null);

  const suratKeluar = letters.filter((l) => l.direction === 'out');

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Buku Ekspedisi Surat Keluar</h2>
          <p>Catatan distribusi fisik & tanda terima penerima surat kedinasan</p>
        </div>
        <div className="flex gap-2">
          <button className="btn outline" onClick={onExport}>
            <Icon name="download" />
            Ekspor Excel
          </button>
          <button className="btn primary" onClick={() => setShowForm(true)}>
            <Icon name="plus" />
            Catat Distribusi
          </button>
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-4">
        <div className="flex items-start gap-3">
          <Icon name="shield" size={20} />
          <div className="text-sm text-slate-700">
            <b className="block mb-1">Fungsi Buku Ekspedisi</b>
            <p>
              Buku Ekspedisi mencatat tanda terima distribusi fisik surat keluar oleh kurir dinas. 
              Setiap entri merekam: tanggal kirim, kurir pengirim, penerima & telepon, serta bukti tanda tangan (opsional).
            </p>
          </div>
        </div>
      </div>

      {suratKeluar.length === 0 ? (
        <div className="empty">
          Belum ada surat keluar terdaftar. Buat surat keluar terlebih dahulu di menu Arsip Surat Keluar.
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>NO. AGENDA</th>
                <th>TUJUAN INSTANSI & PERIHAL</th>
                <th>TANGGAL</th>
                <th>KURIR</th>
                <th>PENERIMA</th>
                <th style={{ textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {suratKeluar.map((letter) => (
                <tr key={letter.id}>
                  <td>
                    <b className="mono agenda">{letter.id}/SK/2026</b>
                  </td>
                  <td>
                    <b>{letter.origin}</b>
                    <p>{letter.subject}</p>
                  </td>
                  <td className="mono date-cell">{formatDate(letter.date)}</td>
                  <td>
                    <span className="text-slate-500 text-xs">Belum dicatat</span>
                  </td>
                  <td>
                    <span className="text-slate-500 text-xs">-</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="table-action-btn action-view"
                        onClick={() => { setSelectedLetter(letter); setShowForm(true); }}
                      >
                        <Icon name="plus" size={14} />
                        <span>Catat Distribusi</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal
          title="Catat Distribusi Ekspedisi"
          onClose={() => { setShowForm(false); setSelectedLetter(null); }}
        >
          <form className="p-4 space-y-3">
            {selectedLetter && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <p className="text-xs text-slate-600 mb-1">Surat Keluar</p>
                <b className="text-sm">{selectedLetter.id}/SK/2026</b>
                <p className="text-xs text-slate-700 mt-1">{selectedLetter.subject}</p>
              </div>
            )}
            <label>
              <span className="text-xs font-semibold text-slate-700">Tanggal Kirim</span>
              <input type="date" name="tanggal_kirim" required className="w-full mt-1 px-2 py-1.5 text-sm border border-slate-300 rounded" />
            </label>
            <label>
              <span className="text-xs font-semibold text-slate-700">Kurir Pengirim</span>
              <input
                type="text"
                name="kurir_pengirim"
                placeholder="Contoh: Bapak Ahmad (Staf TU)"
                required
                className="w-full mt-1 px-2 py-1.5 text-sm border border-slate-300 rounded"
              />
            </label>
            <label>
              <span className="text-xs font-semibold text-slate-700">Nama Penerima</span>
              <input
                type="text"
                name="penerima_nama"
                placeholder="Nama penerima surat di instansi tujuan"
                required
                className="w-full mt-1 px-2 py-1.5 text-sm border border-slate-300 rounded"
              />
            </label>
            <label>
              <span className="text-xs font-semibold text-slate-700">Telepon Penerima (Opsional)</span>
              <input
                type="tel"
                name="penerima_telepon"
                placeholder="Contoh: 0812-3456-7890"
                className="w-full mt-1 px-2 py-1.5 text-sm border border-slate-300 rounded"
              />
            </label>
            <label>
              <span className="text-xs font-semibold text-slate-700">Catatan Ekspedisi (Opsional)</span>
              <textarea
                name="catatan_ekspedisi"
                rows={2}
                placeholder="Contoh: Diterima langsung oleh Kepala Bagian TU, ditandatangani pukul 10:30 WIB"
                className="w-full mt-1 px-2 py-1.5 text-sm border border-slate-300 rounded"
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn outline" onClick={() => { setShowForm(false); setSelectedLetter(null); }}>
                Batal
              </button>
              <button type="submit" className="btn primary">
                <Icon name="check" />
                Simpan Catatan
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
