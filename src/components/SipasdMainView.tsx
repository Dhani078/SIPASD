'use client';

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
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  onBatchDelete: () => void;
  setPrintLetter: (l: LetterRecord | null) => void;
  onEdit?: (l: LetterRecord) => void;
  onDelete?: (l: LetterRecord) => void;
  setModal: (m: string) => void;
  pagination: number;
  setPagination: (p: number) => void;
  go: (next: string) => void;
  archive: (next: string, values?: Partial<ArchiveFilters>) => void;
  onLogout?: () => void;
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
  selectedIds,
  onToggleSelect,
  onToggleAll,
  onBatchDelete,
  setPrintLetter,
  onEdit,
  onDelete,
  setModal,
  pagination,
  setPagination,
  go,
  archive,
  onLogout: _onLogout,
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
              : page === 'profile'
                ? 'Informasi identitas aparatur, rincian kewenangan akses, dan riwayat sesi kedinasan.'
                : page === 'history'
                  ? 'Pencatatan lembar disposisi kertas Kepala Dinas & status tindak lanjut bidang.'
                  : page === 'agenda' || page === 'excel'
                    ? 'Ekspor dan pelaporan register buku agenda surat resmi dalam format Microsoft Excel.'
                    : page === 'expedition'
                      ? 'Pencatatan buku ekspedisi dan tanda terima distribusi surat keluar kedinasan.'
                      : page === 'master'
                        ? 'Master kode klasifikasi persuratan dinas berdasar Permendagri & Perda Kalsel.'
                        : 'Kelola, telusuri, dan tindak lanjuti arsip kedinasan secara terpusat.'}
          </p>
        </div>
        <div className="heading-actions">
          <div className="today">
            <Icon name="shield" size={15} />
            <span>{user.role}</span>
            <small>TERVERIFIKASI</small>
          </div>
          {['dashboard', 'in', 'out'].includes(page) && (
            <button className="btn primary" onClick={() => setModal('new')}>
              <Icon name="plus" size={17} /> Indeks Surat Baru
            </button>
          )}
        </div>
      </div>

      <div className="system-banner">
        <div>
          <Icon name="shield" size={16} />
          <b>Arsip tertib, tata kelola akuntabel.</b>
          <span>411 naskah dinas fisik terindeks resmi &amp; tersinkronisasi terpusat.</span>
        </div>
        <span className="system-status">
          <span className="live-dot" /> Sistem Aktif
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
          isSuratMasuk={page === 'in'}
          filters={filters}
          onFilters={(f) => {
            setFilters(f);
            setPagination(1);
          }}
          selected={selected}
          onSelect={setSelected}
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
          onToggleAll={onToggleAll}
          onBatchDelete={onBatchDelete}
          onPrint={setPrintLetter}
          onEdit={onEdit}
          onDelete={onDelete}
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
          onEdit={onEdit}
          onNavigate={go}
          onLogout={_onLogout}
        />
      )}
    </main>
  );
}
