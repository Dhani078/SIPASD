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
import { HelpModal } from './ReferenceViews';
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
  const [toast, setToast] = useState('');
  const [pagination, setPagination] = useState(1);

  const tell = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

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
      (!filters.urgency ||
        (filters.urgency === 'Urgent'
          ? ['Kilat', 'Segera'].includes(l.type)
          : l.type === filters.urgency)) &&
      (!filters.classification || l.classification === filters.classification) &&
      (!filters.venue || l.venue === filters.venue) &&
      (!filters.division || l.division === filters.division)
  );

  const handleSave = async (record: Omit<LetterRecord, 'id'>, file?: File) => {
    let fileUrl = record.fileUrl;
    if (file) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', record.direction === 'in' ? 'surat_masuk' : 'surat_keluar');
      const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
      const upData = await upRes.json();
      if (upRes.ok && upData.success) {
        fileUrl = upData.url;
      }
    }
    const res = await fetch('/api/letters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...record, fileUrl }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal menyimpan arsip');
    const newRecord: LetterRecord = { ...record, fileUrl, id: data.agendaNumber || 'BARU' };
    setLetters((prev) => [newRecord, ...prev]);
    setModal('');
    archive(record.direction);
    tell(`Arsip ${newRecord.id} berhasil dicatat ke TiDB Cloud Serverless.`);
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
          setModal={setModal}
          pagination={pagination}
          setPagination={setPagination}
          go={go}
          archive={archive}
        />
      </div>

      {modal === 'new' && (
        <NewLetterModal
          direction={page === 'out' ? 'out' : 'in'}
          onClose={() => setModal('')}
          onSave={handleSave}
        />
      )}
      {printLetter && (
        <PrintDisposisiModal letter={printLetter} onClose={() => setPrintLetter(null)} />
      )}
      {['classification', 'sop'].includes(modal) && (
        <HelpModal kind={modal} onClose={() => setModal('')} />
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
