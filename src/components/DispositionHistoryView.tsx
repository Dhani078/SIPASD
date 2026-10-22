'use client';

import { useState } from 'react';
import Icon from './Icon';
import Badge from './Badge';
import { formatDate } from '@/lib/format';
import type { LetterRecord } from '@/types';

interface Props {
  letters: LetterRecord[];
  onSelect: (letter: LetterRecord) => void;
  onExport: () => void;
}

type StatusFilter = 'ALL' | 'BELUM_DIPROSES' | 'PROSES' | 'SELESAI';

export default function DispositionHistoryView({ letters, onSelect, onExport }: Props) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const suratMasuk = letters.filter((l) => l.direction === 'in' && l.disposition);

  const filtered = suratMasuk.filter((l) => {
    if (statusFilter !== 'ALL' && l.disposition?.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        l.id.toLowerCase().includes(q) ||
        l.subject.toLowerCase().includes(q) ||
        l.origin.toLowerCase().includes(q) ||
        l.disposition?.official?.toLowerCase().includes(q) ||
        l.disposition?.division?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const statusCounts = {
    ALL: suratMasuk.length,
    BELUM_DIPROSES: suratMasuk.filter((l) => l.disposition?.status === 'BELUM_DIPROSES').length,
    PROSES: suratMasuk.filter((l) => l.disposition?.status === 'PROSES').length,
    SELESAI: suratMasuk.filter((l) => l.disposition?.status === 'SELESAI').length,
  };

  const getStatusBadge = (status?: string) => {
    if (status === 'BELUM_DIPROSES') return <Badge type="Penting" />;
    if (status === 'PROSES') return <Badge type="Kilat" />;
    if (status === 'SELESAI') return <Badge type="Biasa" />;
    return <Badge type="Biasa" />;
  };

  const getStatusLabel = (status?: string) => {
    if (status === 'BELUM_DIPROSES') return 'Belum Diproses';
    if (status === 'PROSES') return 'Sedang Proses';
    if (status === 'SELESAI') return 'Selesai';
    return 'Selesai';
  };

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Riwayat Disposisi Fisik</h2>
          <p>Catatan lembar disposisi kertas & status tindak lanjut bidang dinas</p>
        </div>
        <button className="btn outline" onClick={onExport}>
          <Icon name="download" />
          Ekspor Excel
        </button>
      </div>

      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded mb-4">
        <div className="flex items-start gap-3">
          <Icon name="shield" size={20} />
          <div className="text-sm text-slate-700">
            <b className="block mb-1">Fungsi Riwayat Disposisi</b>
            <p>
              Riwayat Disposisi mencatat lembar disposisi kertas fisik yang distaples di surat masuk. 
              Setiap entri merekam: pejabat pendisposisi, tanggal, bidang tujuan, instruksi, catatan tertulis, 
              dan status penyelesaian (Belum Diproses, Sedang Proses, Selesai).
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="field flex-1">
          <Icon name="search" />
          <input
            placeholder="Cari nomor agenda, perihal, instansi, pejabat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'BELUM_DIPROSES', 'PROSES', 'SELESAI'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded text-xs border transition-colors ${
                statusFilter === status
                  ? 'bg-emerald-900 text-white border-emerald-900'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              {status === 'ALL' ? 'Semua' : getStatusLabel(status)} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          {statusFilter === 'ALL'
            ? 'Belum ada surat masuk dengan disposisi terdaftar.'
            : `Tidak ada disposisi dengan status "${getStatusLabel(statusFilter)}".`}
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>NO. AGENDA</th>
                <th>ASAL INSTANSI & PERIHAL</th>
                <th>PEJABAT PENDISPOSISI</th>
                <th>KEPADA BIDANG</th>
                <th>INSTRUKSI</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((letter) => (
                <tr key={letter.id}>
                  <td>
                    <b className="mono agenda">{letter.id}/SM/2026</b>
                    <p className="text-xs text-slate-500 mt-1">
                      {letter.disposition?.date && formatDate(letter.disposition.date)}
                    </p>
                  </td>
                  <td>
                    <b>{letter.origin}</b>
                    <p>{letter.subject}</p>
                  </td>
                  <td>
                    <span className="text-sm">{letter.disposition?.official || '-'}</span>
                  </td>
                  <td>
                    <span className="text-sm font-semibold text-emerald-900">
                      {letter.disposition?.division || '-'}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-600">
                      {letter.disposition?.instructions?.join(', ') || '-'}
                    </span>
                  </td>
                  <td>{getStatusBadge(letter.disposition?.status)}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="table-action-btn action-view"
                        onClick={() => onSelect(letter)}
                      >
                        <Icon name="eye" size={14} />
                        <span>Detail</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
