'use client';

import ArchiveTable from './ArchiveTable';
import YearFilterControl from './YearFilterControl';
import Icon from './Icon';
import { classifications, venues, divisions, monthsList } from '@/data/constants';
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
  filters: ArchiveFilters;
  onFilters: (filters: ArchiveFilters) => void;
  selected: LetterRecord | null;
  onSelect: (letter: LetterRecord | null) => void;
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
  filters,
  onFilters,
  selected,
  onSelect,
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
            <Icon name="close" size={16} />
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
        <select
          aria-label="Filter venue"
          value={filters.venue}
          onChange={(e) => update('venue', e.target.value)}
        >
          <option value="">Semua venue</option>
          {venues.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
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
          <button className="text-btn" onClick={() => onFilters(emptyFilters)}>
            Hapus filter
          </button>
        )}
      </div>

      <div className="table-pane">
        <ArchiveTable
          letters={letters}
          selectedId={selected?.id}
          selectedIds={selectedIds}
          onSelect={onSelect}
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
