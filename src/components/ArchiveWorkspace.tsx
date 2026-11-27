'use client';

import ArchiveTable from './ArchiveTable';
import YearFilterControl from './YearFilterControl';
import Icon from './Icon';
import { classifications, venues, divisions, monthsList } from '@/data/constants';
import { letterKey } from '@/lib/format';
import type { LetterRecord, ArchiveFilters } from '@/types';

export const emptyFilters: ArchiveFilters = {
  query: '',
  urgency: '',
  classification: '',
  venue: '',
  division: '',
  year: '',
  month: '',
};

interface Props {
  letters: LetterRecord[];
  isSuratMasuk?: boolean;
  filters: ArchiveFilters;
  onFilters: (filters: ArchiveFilters) => void;
  selected: LetterRecord | null;
  onSelect: (letter: LetterRecord) => void;
  onSelectDisp?: (letter: LetterRecord) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  onBatchDelete: () => void;
  onPrint: (letter: LetterRecord) => void;
  onEdit?: (letter: LetterRecord) => void;
  onDelete?: (letter: LetterRecord) => void;
  onNew: () => void;
  onExport: () => void;
  page: number;
  onPage: (page: number) => void;
}

export default function ArchiveWorkspace({
  letters,
  isSuratMasuk = true,
  filters,
  onFilters,
  selected,
  onSelect,
  onSelectDisp,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  onBatchDelete,
  onPrint,
  onEdit,
  onDelete,
  onNew: _onNew,
  onExport,
  page,
  onPage,
}: Props) {
  function update(key: keyof ArchiveFilters, value: string) {
    onFilters({ ...filters, [key]: value });
  }

  return (
    <section className="panel archive-panel">
      <div className="archive-toolbar">
        <div className="field">
          <Icon name="search" />
          <input
            aria-label="Cari arsip"
            placeholder="Cari nomor, instansi, atau perihal..."
            value={filters.query}
            onChange={(e) => update('query', e.target.value)}
          />
        </div>
        <select
          aria-label="Filter sifat surat"
          value={filters.urgency}
          onChange={(e) => update('urgency', e.target.value)}
        >
          <option value="">Semua sifat</option>
          <option>Kilat</option>
          <option>Segera</option>
          <option>Penting</option>
          <option>Biasa</option>
          <option value="Urgent">Kilat & Segera</option>
        </select>
        <select
          aria-label="Filter klasifikasi"
          value={filters.classification}
          onChange={(e) => update('classification', e.target.value)}
        >
          <option value="">Semua kode</option>
          {classifications.map(([code, label]) => (
            <option value={code} key={code}>
              {code} - {label}
            </option>
          ))}
        </select>
        <button className="btn outline" onClick={onExport}>
          <Icon name="download" size={16} />
          Ekspor Excel
        </button>
        {selectedIds.length > 0 && (
          <button className="btn danger" onClick={onBatchDelete}>
            <Icon name="trash" size={16} />
            Hapus {selectedIds.length} Terpilih
          </button>
        )}
      </div>
      <div className="archive-filter-row">
        <YearFilterControl value={filters.year} onChange={(y) => update('year', y)} />
        <select
          aria-label="Filter bulan naskah"
          value={filters.month || ''}
          onChange={(e) => update('month', e.target.value)}
        >
          <option value="">Semua Bulan</option>
          {monthsList.map(([code, label]) => (
            <option value={code} key={code}>
              Bulan {label}
            </option>
          ))}
        </select>
        {isSuratMasuk && (
          <select
            aria-label="Filter sarana lokasi"
            value={filters.venue}
            onChange={(e) => update('venue', e.target.value)}
          >
            <option value="">Semua Sarana / Lokasi</option>
            {venues.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        )}
        <select
          aria-label="Filter bidang"
          value={filters.division}
          onChange={(e) => update('division', e.target.value)}
        >
          <option value="">Semua bidang</option>
          {divisions.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <span>{letters.length} arsip cocok</span>
        {Object.values(filters).some(Boolean) && (
          <button type="button" className="btn outline py-1 px-2.5 text-[11px] text-rose-700 border-rose-200 hover:bg-rose-50" onClick={() => onFilters(emptyFilters)}>
            <Icon name="close" size={12} /> Reset Semua Filter
          </button>
        )}
      </div>

      {Object.values(filters).some(Boolean) && (
        <div className="px-4 py-2 bg-emerald-50/70 border-b border-emerald-200/70 flex items-center gap-1.5 flex-wrap text-[11px]">
          <span className="font-semibold text-emerald-900 mr-1">Filter Aktif:</span>
          {(['query', 'urgency', 'classification', 'venue', 'division', 'year', 'month'] as (keyof ArchiveFilters)[]).map((k) =>
            filters[k] ? (
              <button key={k} type="button" onClick={() => update(k, '')} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-emerald-300 text-emerald-900 font-medium hover:bg-rose-50 hover:border-rose-300">
                <span>{k === 'query' ? `Cari: ${filters[k]}` : k === 'division' ? `Bidang: ${filters[k]}` : k === 'venue' ? `Venue: ${filters[k]}` : k === 'classification' ? `Kode: ${filters[k]}` : String(filters[k])}</span>
                <Icon name="close" size={11} />
              </button>
            ) : null
          )}
        </div>
      )}

      <div className="table-pane">
        <ArchiveTable
          letters={letters}
          selectedId={selected ? letterKey(selected) : undefined}
          selectedIds={selectedIds}
          onSelect={onSelect}
          onSelectDisp={onSelectDisp}
          onToggleSelect={onToggleSelect}
          onToggleAll={onToggleAll}
          onPrint={onPrint}
          onEdit={onEdit}
          onDelete={onDelete}
          page={page}
          onPage={onPage}
        />
      </div>
    </section>
  );
}
