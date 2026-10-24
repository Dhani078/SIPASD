'use client';

import { useState, useMemo } from 'react';
import Icon from './Icon';
import Badge from './Badge';
import DispositionInfoModal from './DispositionInfoModal';
import DispositionFilters, { StatusFilter } from './DispositionFilters';
import DispositionPagination from './DispositionPagination';
import { formatDate } from '@/lib/format';
import type { LetterRecord } from '@/types';

interface Props {
  letters: LetterRecord[];
  onSelect: (letter: LetterRecord) => void;
  onEdit?: (letter: LetterRecord) => void;
  onExport: () => void;
}

export default function DispositionHistoryView({ letters, onSelect, onEdit, onExport }: Props) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [showInfo, setShowInfo] = useState(false);

  const suratMasuk = useMemo(() => letters.filter((l) => l.direction === 'in' && l.disposition), [letters]);

  const filtered = useMemo(() => {
    return suratMasuk.filter((l) => {
      if (statusFilter !== 'ALL' && l.disposition?.status !== statusFilter) return false;
      if (yearFilter && (l.date ? l.date.slice(0, 4) : '2026') !== yearFilter) return false;
      const refDate = l.disposition?.date || l.date;
      if (monthFilter && refDate && refDate.slice(5, 7) !== monthFilter) return false;
      if (divisionFilter && l.disposition?.division !== divisionFilter) return false;
      if (urgencyFilter && l.type !== urgencyFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const disp = l.disposition;
        return (
          l.id.toLowerCase().includes(q) || l.subject.toLowerCase().includes(q) ||
          l.origin.toLowerCase().includes(q) || disp?.official?.toLowerCase().includes(q) ||
          disp?.division?.toLowerCase().includes(q) || disp?.instructions?.some((ins) => ins.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [suratMasuk, statusFilter, yearFilter, monthFilter, divisionFilter, urgencyFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const statusCounts = useMemo(() => ({
    ALL: suratMasuk.length,
    BELUM_DIPROSES: suratMasuk.filter((l) => l.disposition?.status === 'BELUM_DIPROSES').length,
    PROSES: suratMasuk.filter((l) => l.disposition?.status === 'PROSES').length,
    SELESAI: suratMasuk.filter((l) => l.disposition?.status === 'SELESAI').length,
  }), [suratMasuk]);

  const getStatusBadge = (status?: string) =>
    status === 'BELUM_DIPROSES' ? <Badge type="penting" label="Belum Diproses" />
      : status === 'PROSES' ? <Badge type="kilat" label="Sedang Proses" />
        : <Badge type="biasa" label="Selesai" />;

  const getStatusLabel = (status?: string) =>
    status === 'BELUM_DIPROSES' ? 'Belum Diproses' : status === 'PROSES' ? 'Sedang Proses' : 'Selesai';

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <div className="flex items-center gap-2">
            <h2>Riwayat Disposisi Fisik</h2>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
              onClick={() => setShowInfo(true)}
              title="Klik untuk melihat penjelasan fungsi riwayat disposisi"
            >
              <Icon name="shield" size={12} />
              <span>Info Fungsi</span>
            </button>
          </div>
          <p>Pencatatan lembar disposisi kertas Kepala Dinas & status tindak lanjut bidang dinas</p>
        </div>
        <button className="btn outline" onClick={onExport} type="button">
          <Icon name="download" />
          Ekspor Excel
        </button>
      </div>

      <DispositionFilters
        searchQuery={searchQuery} setSearchQuery={(q) => { setSearchQuery(q); setPage(1); }}
        statusFilter={statusFilter} setStatusFilter={(s) => { setStatusFilter(s); setPage(1); }}
        statusCounts={statusCounts}
        yearFilter={yearFilter} setYearFilter={(y) => { setYearFilter(y); setPage(1); }}
        monthFilter={monthFilter} setMonthFilter={(m) => { setMonthFilter(m); setPage(1); }}
        divisionFilter={divisionFilter} setDivisionFilter={(d) => { setDivisionFilter(d); setPage(1); }}
        urgencyFilter={urgencyFilter} setUrgencyFilter={(u) => { setUrgencyFilter(u); setPage(1); }}
        getStatusLabel={getStatusLabel}
      />

      {filtered.length === 0 ? (
        <div className="empty">
          {statusFilter === 'ALL'
            ? 'Belum ada surat masuk dengan disposisi yang cocok dengan kriteria filter.'
            : `Tidak ada data disposisi dengan status "${getStatusLabel(statusFilter)}".`}
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>NO. AGENDA</th>
                  <th>ASAL INSTANSI & PERIHAL</th>
                  <th>PEJABAT PENDISPOSISI</th>
                  <th>KEPADA BIDANG</th>
                  <th>INSTRUKSI PIMPINAN</th>
                  <th>STATUS TINDAK LANJUT</th>
                  <th style={{ textAlign: 'right' }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((letter) => (
                  <tr key={letter.id}>
                    <td>
                      <b className="mono agenda">{letter.id}/SM/{letter.date ? letter.date.slice(0, 4) : '2026'}</b>
                      <p className="text-xs text-slate-500 mt-1">
                        {letter.disposition?.date ? formatDate(letter.disposition.date) : (letter.date && formatDate(letter.date))}
                      </p>
                    </td>
                    <td>
                      <b>{letter.origin}</b>
                      <p>{letter.subject}</p>
                    </td>
                    <td>
                      <span className="text-sm font-medium text-slate-800">
                        {letter.disposition?.official || 'Pebriadin Hapiz, AP, M.Si'}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm font-semibold text-emerald-900">
                        {letter.disposition?.division || '-'}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded inline-block">
                        {letter.disposition?.instructions?.join(', ') || 'Tindak lanjuti & Koordinasikan'}
                      </span>
                    </td>
                    <td>
                      {getStatusBadge(letter.disposition?.status)}
                      <span className="text-[11px] text-slate-500 block mt-0.5">Sifat: {letter.type}</span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button type="button" className="table-action-btn action-view" onClick={() => onSelect(letter)}>
                          <Icon name="eye" size={14} />
                          <span>Detail</span>
                        </button>
                        {onEdit && (
                          <button type="button" className="table-action-btn action-edit" onClick={() => onEdit(letter)} title={`Edit Disposisi ${letter.id}`}>
                            <Icon name="edit" size={13} />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DispositionPagination
            currentCount={paginated.length}
            totalFiltered={filtered.length}
            page={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          />
        </>
      )}
      {showInfo && <DispositionInfoModal onClose={() => setShowInfo(false)} />}
    </section>
  );
}
