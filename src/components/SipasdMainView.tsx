'use client';

import React from 'react';
import DashboardView from './DashboardView';
import ArchiveWorkspace from './ArchiveWorkspace';
import { ReferenceViews } from './ReferenceViews';
import Icon from './Icon';
import { exportExcel } from '@/lib/exportExcel';
import type { LetterRecord, DemoUser, ArchiveFilters } from '@/types';

interface Props {
  page: string;
  title: string;
  user: DemoUser;
  letters: LetterRecord[];
  visible: LetterRecord[];
  filters: ArchiveFilters;
  setFilters: (f: ArchiveFilters) => void;
  selected: LetterRecord | null;
  setSelected: (l: LetterRecord | null) => void;
  setPrintLetter: (l: LetterRecord | null) => void;
  setModal: (m: string) => void;
  pagination: number;
  setPagination: (p: number) => void;
  go: (next: string) => void;
  archive: (next: string, values?: Partial<ArchiveFilters>) => void;
}

export default function SipasdMainView({
  page,
  title,
  user,
  letters,
  visible,
  filters,
  setFilters,
  selected,
  setSelected,
  setPrintLetter,
  setModal,
  pagination,
  setPagination,
  go,
  archive,
}: Props) {
  return (
    <main className="main-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">SISTEM INFORMASI PENGELOLAAN ARSIP SURAT</div>
          <h1>{title}</h1>
          <p>
            {page === 'dashboard'
              ? `Selamat datang, ${user.name}. Berikut ringkasan persuratan Dispora hari ini.`
              : 'Kelola, telusuri, dan tindak lanjuti arsip kedinasan secara terpusat.'}
          </p>
        </div>
        <div className="heading-actions">
          <div className="today">
            <Icon name="shield" size={15} />
            <span>{user.role}</span>
            <small>TiDB LIVE</small>
          </div>
          <button className="btn primary" onClick={() => setModal('new')}>
            <Icon name="plus" size={17} /> Indeks Surat Baru
          </button>
        </div>
      </div>

      <div className="system-banner">
        <div>
          <Icon name="shield" size={16} />
          <b>Arsip tertib, tata kelola akuntabel.</b>
          <span>410+ berkas fisik terindeks real-time di TiDB Cloud Serverless &amp; Cloudinary CDN.</span>
        </div>
        <span className="system-status">
          <span className="live-dot" /> Database Aktif
        </span>
      </div>

      {page === 'dashboard' ? (
        <DashboardView
          letters={letters}
          go={go}
          setFilter={(urgency) => setFilters({ ...filters, urgency })}
          setModal={setModal}
          exportData={() => void exportExcel(letters)}
          onSelect={setSelected}
          onVenue={(v) =>
            archive(
              letters.some((l) => l.venue === v && l.direction === 'in') ? 'in' : 'out',
              { venue: v }
            )
          }
          onDivision={(d) => archive('in', { division: d })}
        />
      ) : page === 'in' || page === 'out' ? (
        <ArchiveWorkspace
          letters={visible}
          filters={filters}
          onFilters={(f) => {
            setFilters(f);
            setPagination(1);
          }}
          selected={selected}
          onSelect={setSelected}
          onPrint={setPrintLetter}
          onNew={() => setModal('new')}
          onExport={() => void exportExcel(visible)}
          page={pagination}
          onPage={setPagination}
        />
      ) : (
        <ReferenceViews
          page={page}
          title={title}
          letters={visible}
          user={user}
          onSelect={setSelected}
          onClassify={(c) => archive('in', { classification: c })}
          onExport={() => void exportExcel(visible)}
          onPrint={setPrintLetter}
        />
      )}
    </main>
  );
}
