'use client';

import { useCallback, useEffect, useState } from 'react';
import Icon from './Icon';
import ExpeditionFormModal from './ExpeditionFormModal';
import { formatDate } from '@/lib/format';
import type { LetterRecord } from '@/types';

interface ExpeditionRecord {
  id: string;
  surat_keluar_id: string;
  tanggal_kirim: string;
  kurir_pengirim: string;
  penerima_nama: string;
  penerima_telepon: string | null;
  catatan_ekspedisi: string | null;
}

interface Props {
  letters: LetterRecord[];
  onExport: () => void;
}

export default function DistributionView({ letters, onExport }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<LetterRecord | null>(null);
  const [records, setRecords] = useState<Record<string, ExpeditionRecord>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const suratKeluar = letters.filter((l) => l.direction === 'out');
  const tercatat = Object.keys(records).length;

  const loadRecords = useCallback(async () => {
    try {
      const res = await fetch('/api/expedition');
      const data = await res.json();
      if (!data.success) return;
      const map: Record<string, ExpeditionRecord> = {};
      for (const r of data.records as ExpeditionRecord[]) map[r.surat_keluar_id] = r;
      setRecords(map);
    } catch {
      /* tabel tetap tampil tanpa catatan bila permintaan gagal */
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

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
          <button className="btn primary" onClick={() => { setSelectedLetter(null); setNotice(null); setShowForm(true); }}>
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
              Setiap entri merekam tanggal kirim, kurir pengirim, penerima beserta telepon, dan catatan serah terima.
              Sudah tercatat: <b>{tercatat}</b> dari {suratKeluar.length} surat keluar.
            </p>
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-2 mb-3 rounded text-sm border bg-emerald-50 border-emerald-200 text-emerald-900">{notice}</div>
      )}

      {suratKeluar.length === 0 ? (
        <div className="empty">
          Belum ada surat keluar terdaftar. Buat surat keluar terlebih dahulu di menu Arsip Surat Keluar.
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Daftar distribusi ekspedisi surat keluar</caption>
            <thead>
              <tr>
                <th scope="col">NO. AGENDA</th>
                <th scope="col">TUJUAN INSTANSI & PERIHAL</th>
                <th scope="col">TANGGAL</th>
                <th scope="col">KURIR</th>
                <th scope="col">PENERIMA</th>
                <th scope="col" style={{ textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {suratKeluar.map((letter) => {
                const rec = letter.rawId ? records[letter.rawId] : undefined;
                return (
                  <tr key={letter.id}>
                    <td><b className="mono agenda">{letter.id}/SK/2026</b></td>
                    <td>
                      <b>{letter.origin}</b>
                      <p>{letter.subject}</p>
                    </td>
                    <td className="mono date-cell">{formatDate(letter.date)}</td>
                    <td>
                      {rec ? (
                        <span className="text-sm">
                          {rec.kurir_pengirim}
                          <br />
                          <span className="text-xs text-slate-500">{formatDate(rec.tanggal_kirim)}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">Belum dicatat</span>
                      )}
                    </td>
                    <td>
                      {rec ? (
                        <span className="text-sm">
                          {rec.penerima_nama}
                          {rec.penerima_telepon ? ` (${rec.penerima_telepon})` : ''}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">-</span>
                      )}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="table-action-btn action-view"
                          onClick={() => { setSelectedLetter(letter); setNotice(null); setShowForm(true); }}
                        >
                          <Icon name="plus" size={14} />
                          <span>{rec ? 'Ubah Catatan' : 'Catat Distribusi'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ExpeditionFormModal
          letter={selectedLetter}
          initial={selectedLetter?.rawId ? records[selectedLetter.rawId] : undefined}
          onClose={() => { setShowForm(false); setSelectedLetter(null); }}
          onSaved={async () => {
            await loadRecords();
            setNotice('Catatan distribusi berhasil disimpan ke TiDB.');
          }}
        />
      )}
    </section>
  );
}