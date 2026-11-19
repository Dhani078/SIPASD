'use client';

import { useEffect, useState } from 'react';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import SipasdMainView from './SipasdMainView';
import AppModals from './AppModals';
import HelpModal from './HelpModal';
import { emptyFilters } from './ArchiveWorkspace';
import { useLetterActions } from '@/hooks/useLetterActions';
import { groups } from '@/data/navigation';
import { demoUsers } from '@/data/users';
import { filterLetters } from '@/lib/format';
import { exportExcel } from '@/lib/exportExcel';
import type { LetterRecord, DemoUser, ArchiveFilters } from '@/types';

interface Props {
  initialLetters: LetterRecord[];
  initialUser?: DemoUser | null;
  initialPage?: string;
  isAuthenticated?: boolean;
}

const URL_MAP: Record<string, string> = {
  dashboard: '/dashboard',
  in: '/arsip-masuk',
  out: '/arsip-keluar',
  reports: '/laporan',
  landing: '/',
  login: '/login',
};

export default function SipasdApp({
  initialLetters,
  initialUser = null,
  initialPage = 'dashboard',
  isAuthenticated = false,
}: Props) {
  const curUser = initialUser || demoUsers[0];
  const safeInit = curUser.username === 'magang_keluar' && initialPage === 'in' ? 'out' : curUser.username === 'magang_masuk' && initialPage === 'out' ? 'in' : initialPage;
  const [page, setPage] = useState(safeInit);
  const [letters, setLetters] = useState<LetterRecord[]>(initialLetters);
  const [user, setUser] = useState<DemoUser>(curUser);
  const [auth, setAuth] = useState(isAuthenticated || Boolean(initialUser));
  const [drawer, setDrawer] = useState(false);
  const [filters, setFilters] = useState<ArchiveFilters>(emptyFilters);
  const [selected, setSelected] = useState<LetterRecord | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<'letter' | 'disp'>('letter');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [printLetter, setPrintLetter] = useState<LetterRecord | null>(null);
  const [modal, setModal] = useState('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [pagination, setPagination] = useState(1);
  const tell = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 4000); };

  const {
    deleteTarget, setDeleteTarget, batchTargets, setBatchTargets,
    deleting, handleSave, confirmDelete, confirmBatchDelete,
    editTarget, setEditTarget, handleUpdate,
  } = useLetterActions(setLetters, tell);

  const go = (next: string) => {
    let target = !auth && next !== 'landing' && next !== 'login' ? 'login' : next;
    if (user.username === 'magang_masuk' && (target === 'out' || target === 'distribution')) {
      target = 'in';
      tell('Akses dibatasi: Akun Magang Surat Masuk hanya berhak mengelola Surat Masuk.', false);
    } else if (user.username === 'magang_keluar' && (target === 'in' || target === 'history')) {
      target = 'out';
      tell('Akses dibatasi: Akun Magang Surat Keluar hanya berhak mengelola Surat Keluar.', false);
    }
    setSelected(null); setSelectedDoc('letter'); setSelectedIds([]); setFilters(emptyFilters); setPagination(1); setDrawer(false); setPage(target);
    if (typeof window !== 'undefined') {
      const dest = URL_MAP[target] || `/dashboard?view=${target}`;
      if (window.location.pathname + window.location.search !== dest) window.history.pushState({ page: target }, '', dest);
    }
  };

  useEffect(() => {
    const handlePop = () => {
      const path = window.location.pathname;
      const v = new URLSearchParams(window.location.search).get('view');
      let t = v || (path.includes('arsip-masuk') ? 'in' : path.includes('arsip-keluar') ? 'out' : path.includes('laporan') ? 'reports' : path.includes('dashboard') ? 'dashboard' : path.includes('login') ? 'login' : 'landing');
      if (!auth && t !== 'landing' && t !== 'login') t = 'login';
      if (user.username === 'magang_masuk' && (t === 'out' || t === 'distribution')) t = 'in';
      if (user.username === 'magang_keluar' && (t === 'in' || t === 'history')) t = 'out';
      setPage(t);
    };
    handlePop();
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [auth, user]);

  const archive = (next: string, values: Partial<ArchiveFilters> = {}) => {
    go(next);
    setFilters({ ...emptyFilters, ...values });
  };

  const title = page === 'dashboard' ? 'Beranda Eksekutif' : groups.flatMap((g) => g.items).find((i) => i[2] === page)?.[0] ?? 'Profil Pengguna';
  const visible = filterLetters(letters, page, filters);
  const inCount = letters.filter((l) => l.direction === 'in').length;
  const outCount = letters.filter((l) => l.direction === 'out').length;

  const onSaveLetter = async (record: Omit<LetterRecord, 'id'>, file?: File, dispFile?: File) => {
    const saved = await handleSave(record, file, dispFile);
    setModal('');
    archive(saved.direction);
  };

  const handleToggleSelect = (id: string) => setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const handleToggleAll = () => {
    const visibleIds = visible.map((l) => l.id);
    const allChecked = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allChecked ? selectedIds.filter((id) => !visibleIds.includes(id)) : [...new Set([...selectedIds, ...visibleIds])]);
  };

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch { /* ignore network error */ }
    setAuth(false);
    if (typeof window !== 'undefined') window.location.href = '/';
  };

  if (page === 'landing') {
    return (
      <>
        <LandingPage
          go={go}
          onTrack={(q) => (auth ? archive('in', { query: q }) : go('login'))}
          onVenue={(v) => (auth ? archive(letters.some((l) => l.venue === v && l.direction === 'in') ? 'in' : 'out', { venue: v }) : go('login'))}
          setModal={setModal} sampleLetter={letters.find((l) => l.direction === 'in') || letters[0]}
          totalSuratMasuk={inCount} totalSuratKeluar={outCount}
        />
        {modal && <HelpModal kind={modal} onClose={() => setModal('')} />}
      </>
    );
  }

  if (page === 'login') {
    return (
      <LoginPage
        onBack={() => go('landing')}
        onLoginSuccess={(acc) => {
          setUser(acc);
          setAuth(true);
          go('dashboard');
          tell(`Selamat datang, ${acc.name}. Sesi aktif di TiDB.`);
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      {drawer && (
        <button type="button" aria-label="Tutup navigasi drawer" className="drawer-overlay" onClick={() => setDrawer(false)} />
      )}
      <Sidebar drawer={drawer} page={page} go={go} user={user} counts={{ in: inCount, out: outCount }} onLogout={handleLogout} />
      <div className="workspace">
        <TopNavbar
          title={title} user={user} letters={letters} onSelect={setSelected}
          onSearch={(q) => archive('in', { query: q })} onMenu={() => setDrawer((v) => !v)}
          onExport={() => void exportExcel(visible)} onNavigate={go} onLogout={handleLogout}
        />
        <SipasdMainView
          page={page} title={title} user={user} letters={letters} visible={visible}
          filters={filters} setFilters={setFilters} selected={selected}
          setSelected={(l) => { setSelected(l); setSelectedDoc('letter'); }}
          onSelectDisp={(l) => { setSelected(l); setSelectedDoc('disp'); }}
          selectedIds={selectedIds} onToggleSelect={handleToggleSelect} onToggleAll={handleToggleAll}
          onBatchDelete={() => setBatchTargets(letters.filter((l) => selectedIds.includes(l.id)))}
          setPrintLetter={setPrintLetter} onEdit={setEditTarget} onDelete={setDeleteTarget}
          setModal={setModal} pagination={pagination} setPagination={setPagination}
          go={go} archive={archive} onLogout={handleLogout}
        />
      </div>

      <AppModals
        modal={modal} selected={selected} selectedDoc={selectedDoc} printLetter={printLetter} editTarget={editTarget}
        deleteTarget={deleteTarget} batchTargets={batchTargets} deleting={deleting} page={page}
        toast={toast} setModal={setModal} setSelected={setSelected} setPrintLetter={setPrintLetter}
        setEditTarget={setEditTarget} setDeleteTarget={setDeleteTarget} setBatchTargets={setBatchTargets}
        setSelectedIds={setSelectedIds} onSaveLetter={onSaveLetter} onUpdateLetter={handleUpdate}
        confirmDelete={confirmDelete} confirmBatchDelete={confirmBatchDelete} letters={letters}
        user={user}
      />
    </div>
  );
}
