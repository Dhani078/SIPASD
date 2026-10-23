'use client';

import { useState } from 'react';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import SipasdMainView from './SipasdMainView';
import AppModals from './AppModals';
import { emptyFilters } from './ArchiveWorkspace';
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [printLetter, setPrintLetter] = useState<LetterRecord | null>(null);
  const [modal, setModal] = useState('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [pagination, setPagination] = useState(1);

  const tell = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const { deleteTarget, setDeleteTarget, batchTargets, setBatchTargets, deleting, handleSave, confirmDelete, confirmBatchDelete } =
    useLetterActions(setLetters, tell);

  const go = (next: string) => {
    setSelected(null);
    setSelectedIds([]);
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

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleToggleAll = () => {
    const visibleIds = visible.map((l) => l.id);
    const allChecked = visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allChecked ? selectedIds.filter((id) => !visibleIds.includes(id)) : [...new Set([...selectedIds, ...visibleIds])]);
  };

  const handleBatchDelete = () => {
    const targets = letters.filter((l) => selectedIds.includes(l.id));
    setBatchTargets(targets);
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
          onNavigate={go}
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
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleAll={handleToggleAll}
          onBatchDelete={handleBatchDelete}
          setPrintLetter={setPrintLetter}
          onDelete={setDeleteTarget}
          setModal={setModal}
          pagination={pagination}
          setPagination={setPagination}
          go={go}
          archive={archive}
        />
      </div>

      <AppModals
        modal={modal}
        selected={selected}
        printLetter={printLetter}
        deleteTarget={deleteTarget}
        batchTargets={batchTargets}
        deleting={deleting}
        page={page}
        toast={toast}
        setModal={setModal}
        setSelected={setSelected}
        setPrintLetter={setPrintLetter}
        setDeleteTarget={setDeleteTarget}
        setBatchTargets={setBatchTargets}
        setSelectedIds={setSelectedIds}
        onSaveLetter={onSaveLetter}
        confirmDelete={confirmDelete}
        confirmBatchDelete={confirmBatchDelete}
      />
    </div>
  );
}
