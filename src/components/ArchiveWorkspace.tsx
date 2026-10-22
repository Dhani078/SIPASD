'use client';

import ArchiveTable from './ArchiveTable';
import Icon from './Icon';
import { classifications, venues, divisions } from '@/data/constants';
import type { LetterRecord, ArchiveFilters } from '@/types';

export const emptyFilters: ArchiveFilters = {
  query: '',
  urgency: '',
  classification: '',
  venue: '',
  division: '',
  year: '',
};

interface Props {
  letters: LetterRecord[];
  filters: ArchiveFilters;
  onFilters: (filters: ArchiveFilters) => void;
  selected: LetterRecord | null;
  onSelect: (letter: LetterRecord | null) => void;
  onPrint: (letter: LetterRecord) => void;
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
  onPrint,
  onDelete,
  onNew,
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
        <button className="btn primary" onClick={onNew}>
          <Icon name="plus" size={16} />
          Indeks Berkas Baru
        </button>
        <button className="btn outline" onClick={onExport}>
          <Icon name="download" size={16} />
          Ekspor Excel
        </button>
      </div>
      <div className="archive-filter-row">
        <select
          aria-label="Filter tahun anggaran"
          value={filters.year || ''}
          onChange={(e) => update('year', e.target.value)}
        >
          <option value="">Semua tahun</option>
          <option value="2026">TA 2026</option>
          <option value="2025">TA 2025</option>
          <option value="2024">TA 2024</option>
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
          onSelect={onSelect}
          onPrint={onPrint}
          onDelete={onDelete}
          page={page}
          onPage={onPage}
        />
      </div>
    </section>
  );
}
