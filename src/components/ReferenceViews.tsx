'use client';

import ArchiveTable from './ArchiveTable';
import DistributionView from './DistributionView';
import DispositionHistoryView from './DispositionHistoryView';
import AgendaRegisterView from './AgendaRegisterView';
import ReportsManagementView from './ReportsManagementView';
import ClassificationView from './ClassificationView';
import UsersManagementView from './UsersManagementView';
import AuditTrailView from './AuditTrailView';
import ProfileView from './ProfileView';
import Icon from './Icon';
import type { LetterRecord, DemoUser } from '@/types';

interface Props {
  page: string;
  title: string;
  letters: LetterRecord[];
  user: DemoUser;
  onSelect: (letter: LetterRecord) => void;
  onClassify: (code: string) => void;
  onExport: () => void;
  onPrint: (letter: LetterRecord) => void;
  onEdit?: (letter: LetterRecord) => void;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function ReferenceViews({
  page,
  title,
  letters,
  user,
  onSelect,
  onClassify,
  onExport,
  onPrint,
  onEdit,
  onNavigate = () => {},
  onLogout,
}: Props) {
  const isAdmin = user.label === 'Super Admin' || user.label === 'Developer' || user.username === 'admin' || user.username === 'developer';

  if (page === 'classification')
    return <ClassificationView letters={letters} onClassify={onClassify} />;

  if (page === 'profile') {
    return <ProfileView user={user} onNavigate={onNavigate} onLogout={onLogout} />;
  }

  if (page === 'users' || page === 'audit') {
    if (!isAdmin) {
      return (
        <section className="panel p-8 text-center my-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
            <Icon name="shield" size={24} />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">Akses Terbatas: Khusus Administrator IT &amp; Developer</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto mb-4">
            Menu {page === 'users' ? 'Manajemen Pengguna' : 'Audit Trail Keamanan'} hanya dapat diakses oleh Administrator IT atau Pengembang Sistem resmi.
          </p>
          <button type="button" className="btn primary" onClick={() => onNavigate('dashboard')}>
            Kembali ke Beranda
          </button>
        </section>
      );
    }

    if (page === 'users') {
      return <UsersManagementView currentUser={user} onNavigate={onNavigate} />;
    }

    return <AuditTrailView currentUser={user} />;
  }

  if (page === 'distribution')
    return <DistributionView letters={letters} onExport={onExport} />;

  if (page === 'history')
    return <DispositionHistoryView letters={letters} onSelect={onSelect} onEdit={onEdit} onExport={onExport} />;

  if (page === 'reports')
    return <ReportsManagementView currentUser={user} />;

  if (page === 'agenda')
    return <AgendaRegisterView letters={letters} onSelect={onSelect} onPrint={onPrint} onExport={onExport} />;

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          <p>Rekapitulasi arsip kedinasan Dispora Kalsel</p>
        </div>
        <button className="btn outline" onClick={onExport}>
          <Icon name="download" /> Ekspor Excel
        </button>
      </div>
      <ArchiveTable letters={letters} onSelect={onSelect} onPrint={onPrint} />
    </section>
  );
}
