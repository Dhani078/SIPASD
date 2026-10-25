import NewLetterModal from './NewLetterModal';
import PrintDisposisiModal from './PrintDisposisiModal';
import DocumentPreview from './DocumentPreview';
import DeleteConfirmModal from './DeleteConfirmModal';
import EditLetterModal from './EditLetterModal';
import HelpModal from './HelpModal';
import type { LetterRecord } from '@/types';

interface Props {
  modal: string;
  selected: LetterRecord | null;
  printLetter: LetterRecord | null;
  editTarget: LetterRecord | null;
  deleteTarget: LetterRecord | null;
  batchTargets: LetterRecord[];
  deleting: boolean;
  page: string;
  toast: { msg: string; ok: boolean } | null;
  setModal: (m: string) => void;
  setSelected: (l: LetterRecord | null) => void;
  setPrintLetter: (l: LetterRecord | null) => void;
  setEditTarget: (l: LetterRecord | null) => void;
  setDeleteTarget: (l: LetterRecord | null) => void;
  setBatchTargets: (b: LetterRecord[]) => void;
  setSelectedIds: (ids: string[]) => void;
  onSaveLetter: (record: Omit<LetterRecord, 'id'>, file?: File) => Promise<void>;
  onUpdateLetter: (id: string, updates: Partial<LetterRecord>, file?: File) => Promise<void>;
  confirmDelete: () => Promise<void>;
  confirmBatchDelete: () => Promise<void>;
}

export default function AppModals({
  modal,
  selected,
  printLetter,
  editTarget,
  deleteTarget,
  batchTargets,
  deleting,
  page,
  toast,
  setModal,
  setSelected,
  setPrintLetter,
  setEditTarget,
  setDeleteTarget,
  setBatchTargets,
  setSelectedIds,
  onSaveLetter,
  onUpdateLetter,
  confirmDelete,
  confirmBatchDelete,
}: Props) {
  return (
    <>
      {selected && (
        <DocumentPreview
          letter={selected}
          onClose={() => setSelected(null)}
          onPrint={() => { const item = selected; setSelected(null); setPrintLetter(item); }}
          onEdit={() => { const item = selected; setSelected(null); setEditTarget(item); }}
          onDelete={() => { const item = selected; setSelected(null); setDeleteTarget(item); }}
        />
      )}
      {editTarget && (
        <EditLetterModal
          letter={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={onUpdateLetter}
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
      {batchTargets.length > 0 && (
        <DeleteConfirmModal
          letter={batchTargets[0]}
          batch={batchTargets}
          deleting={deleting}
          onClose={() => { setBatchTargets([]); setSelectedIds([]); }}
          onConfirm={async () => {
            await confirmBatchDelete();
            setSelectedIds([]);
          }}
        />
      )}
      {['classification', 'sop'].includes(modal) && (
        <HelpModal kind={modal} onClose={() => setModal('')} />
      )}
      {toast && (
        <output className="toast">
          <span className={`toast-icon ${toast.ok ? 'success' : 'error'}`}>{toast.ok ? '✓' : '!'}</span>
          {toast.msg}
        </output>
      )}
    </>
  );
}
