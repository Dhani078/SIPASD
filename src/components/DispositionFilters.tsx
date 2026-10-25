'use client';

import Icon from './Icon';
import YearFilterControl from './YearFilterControl';
import { divisions, monthsList } from '@/data/constants';

export type StatusFilter = 'ALL' | 'BELUM_DIPROSES' | 'PROSES' | 'SELESAI';

interface Props {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (s: StatusFilter) => void;
  statusCounts: Record<StatusFilter, number>;
  yearFilter: string;
  setYearFilter: (y: string) => void;
  monthFilter: string;
  setMonthFilter: (m: string) => void;
  divisionFilter: string;
  setDivisionFilter: (d: string) => void;
  urgencyFilter: string;
  setUrgencyFilter: (u: string) => void;
  getStatusLabel: (s?: string) => string;
}

export default function DispositionFilters({
  searchQuery, setSearchQuery, statusFilter, setStatusFilter, statusCounts,
  yearFilter, setYearFilter, monthFilter, setMonthFilter,
  divisionFilter, setDivisionFilter, urgencyFilter, setUrgencyFilter,
  getStatusLabel,
}: Props) {
  const hasActiveFilters = Boolean(
    searchQuery || statusFilter !== 'ALL' || yearFilter || monthFilter || divisionFilter || urgencyFilter
  );

  return (
    <div className="space-y-3 mb-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="field flex-1 min-w-[240px]">
          <Icon name="search" />
          <input
            placeholder="Cari nomor agenda, perihal, instansi, pejabat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 w-full sm:w-auto">
          {(['ALL', 'BELUM_DIPROSES', 'PROSES', 'SELESAI'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded text-xs border font-medium transition-colors cursor-pointer text-center justify-center ${
                statusFilter === status
                  ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {status === 'ALL' ? 'Semua' : getStatusLabel(status)} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      <div className="archive-filter-row flex flex-wrap gap-2 text-xs">
        <YearFilterControl value={yearFilter} onChange={setYearFilter} />
        <select
          aria-label="Filter bulan disposisi"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-700"
        >
          <option value="">Semua Bulan</option>
          {monthsList.map(([code, label]) => (
            <option value={code} key={code}>Bulan {label}</option>
          ))}
        </select>
        <select
          aria-label="Filter bidang tujuan"
          value={divisionFilter}
          onChange={(e) => setDivisionFilter(e.target.value)}
          className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-700"
        >
          <option value="">Semua Bidang Dinas</option>
          {divisions.map((d) => (
            <option value={d} key={d}>{d}</option>
          ))}
        </select>
        <select
          aria-label="Filter sifat surat"
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
          className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-700"
        >
          <option value="">Semua Sifat Surat</option>
          <option value="Biasa">Biasa</option>
          <option value="Segera">Segera</option>
          <option value="Kilat">Kilat</option>
        </select>
        {hasActiveFilters && (
          <button
            type="button"
            className="text-btn text-xs text-emerald-800 hover:text-emerald-900 font-medium ml-auto inline-flex items-center gap-1 cursor-pointer"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setYearFilter('');
              setMonthFilter('');
              setDivisionFilter('');
              setUrgencyFilter('');
            }}
          >
            <Icon name="close" size={13} />
            Hapus Filter
          </button>
        )}
      </div>
    </div>
  );
}
