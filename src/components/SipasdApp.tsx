'use client';

import { useState } from 'react';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import SipasdMainView from './SipasdMainView';
import { emptyFilters } from './ArchiveWorkspace';
import NewLetterModal from './NewLetterModal';
import PrintDisposisiModal from './PrintDisposisiModal';
import DocumentPreview from './DocumentPreview';
import DeleteConfirmModal from './DeleteConfirmModal';
import { HelpModal } from './ReferenceViews';
import { useLetterActions } from '@/hooks/useLetterActions';
import { groups } from '@/data/navigation';
import { demoUsers } from '@/data/users';
import { matchesSearch } from '@/lib/format';
import { exportExcel } from '@/lib/exportExcel';
import type { LetterRecord, DemoUser, ArchiveFilters } from '@/types';

interface Props {
  initialLetters: LetterRecord[];
  initialUser?: DemoUser;
  initialPage?: string;
}

export default function SipasdApp({
  initialLetters,
  initialUser = demoUsers[1],
  initialPage = 'dashboard',
}: Props) {
  const [page, setPage] = useState(initialPage);
  const [letters, setLetters] = useState<LetterRecord[]>(initialLetters);
  const [user, setUser] = useState<DemoUser>(initialUser);
  const [drawer, setDrawer] = useState(false);
  const [filters, setFilters] = useState<ArchiveFilters>(emptyFilters);
  const [selected, setSelected] = useState<LetterRecord | null>(null);
  const [printLetter, setPrintLetter] = useState<LetterRecord | null>(null);
  const [modal, setModal] = useState('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [pagination, setPagination] = useState(1);

  const tell = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const { deleteTarget, setDeleteTarget, deleting, handleSave, confirmDelete } =
    useLetterActions(setLetters, tell);

  const go = (next: string) => {
    setSelected(null);
    setFilters(emptyFilters);
    setPagination(1);
    setDrawer(false);
    setPage(next);
  };

  const archive = (next: string, values: Partial<ArchiveFilters> = {}) => {
    go(next);
    setFilters({ ...emptyFilters, ...values });
  };

  const title =
    page === 'dashboard'
      ? 'Beranda Eksekutif'
      : groups.flatMap((g) => g.items).find((i) => i[2] === page)?.[0] ?? 'Profil Pengguna';

  const visible = letters.filter(
    (l) =>
      ((page !== 'in' && page !== 'out') || l.direction === page) &&
      matchesSearch(l, filters.query) &&
      (!filters.year || l.date.startsWith(filters.year)) &&
      (!filters.urgency || (filters.urgency === 'Urgent' ? ['Kilat', 'Segera'].includes(l.type) : l.type === filters.urgency)) &&
      (!filters.classification || l.classification === filters.classification) &&
      (!filters.venue || l.venue === filters.venue) &&
      (!filters.division || l.division === filters.division)
  );

  const onSaveLetter = async (record: Omit<LetterRecord, 'id'>, file?: File) => {
    const saved = await handleSave(record, file);
    setModal('');
    archive(saved.direction);
  };

  if (page === 'landing') {
    return (
      <LandingPage
        go={go}
        onTrack={(q) => archive('in', { query: q })}
        onVenue={(v) => archive(letters.some((l) => l.venue === v && l.direction === 'in') ? 'in' : 'out', { venue: v })}
        setModal={setModal}
        sampleLetter={letters[0]}
        totalSuratMasuk={letters.filter((l) => l.direction === 'in').length}
        totalSuratKeluar={letters.filter((l) => l.direction === 'out').length}
      />
    );
  }

  if (page === 'login') {
    return (
      <LoginPage
        onBack={() => go('landing')}
        onLoginSuccess={(acc) => {
          setUser(acc);
          go('dashboard');
          tell(`Selamat datang, ${acc.name}. Sesi aktif di TiDB.`);
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      {drawer && <div className="drawer-overlay" onClick={() => setDrawer(false)} />}
      <Sidebar
        drawer={drawer}
        page={page}
        go={go}
        user={user}
        counts={{
          in: letters.filter((l) => l.direction === 'in').length,
          out: letters.filter((l) => l.direction === 'out').length,
        }}
      />
      <div className="workspace">
        <TopNavbar
          title={title}
          user={user}
          letters={letters}
          onSelect={setSelected}
          onSearch={(q) => archive('in', { query: q })}
          onMenu={() => setDrawer((v) => !v)}
          onExport={() => void exportExcel(visible)}
        />
        <SipasdMainView
          page={page}
          title={title}
          user={user}
          letters={letters}
          visible={visible}
          filters={filters}
          setFilters={setFilters}
          selected={selected}
          setSelected={setSelected}
          setPrintLetter={setPrintLetter}
          onDelete={setDeleteTarget}
          setModal={setModal}
          pagination={pagination}
          setPagination={setPagination}
          go={go}
          archive={archive}
        />
      </div>

      {selected && (
        <DocumentPreview
          letter={selected}
          onClose={() => setSelected(null)}
          onPrint={() => { const item = selected; setSelected(null); setPrintLetter(item); }}
          onDelete={() => { const item = selected; setSelected(null); setDeleteTarget(item); }}
        />
      )}
      {modal === 'new' && (
        <NewLetterModal
          direction={page === 'out' ? 'out' : 'in'}
          onClose={() => setModal('')}
          onSave={onSaveLetter}
        />
      )}
      {printLetter && (
        <PrintDisposisiModal letter={printLetter} onClose={() => setPrintLetter(null)} />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          letter={deleteTarget}
          deleting={deleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
      {['classification', 'sop'].includes(modal) && (
        <HelpModal kind={modal} onClose={() => setModal('')} />
      )}
      {toast && (
        <div className="toast" role="status">
          <span className={`toast-icon ${toast.ok ? 'success' : 'error'}`}>{toast.ok ? '✓' : '!'}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
