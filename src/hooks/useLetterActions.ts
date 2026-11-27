import { useState } from 'react';
import type { LetterRecord } from '@/types';
import { uploadPdf, type UploadProgress } from '@/lib/letter-upload';
import { letterKey } from '@/lib/format';

export type { UploadProgress };

const formatDeleteMsg = (subject: string, trash: boolean) =>
  trash ? `${subject} dihapus & berkas dipindahkan ke Trash Google Drive.` : `${subject} berhasil dihapus dari TiDB.`;

export function useLetterActions(
  setLetters: React.Dispatch<React.SetStateAction<LetterRecord[]>>,
  tell: (msg: string, ok?: boolean) => void
) {
  const [deleteTarget, setDeleteTarget] = useState<LetterRecord | null>(null);
  const [batchTargets, setBatchTargets] = useState<LetterRecord[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState<LetterRecord | null>(null);

  const handleSave = async (record: Omit<LetterRecord, 'id'>, file?: File, dispFile?: File, onProgress?: (p: UploadProgress) => void) => {
    let fileUrl = record.fileUrl, publicId = record.cloudinaryPublicId, driveUrl = record.driveUrl;
    let dispUrl = record.dispositionFileUrl, dispDrive = record.dispositionDriveUrl;
    let finalFileName = file?.name, finalDispName = dispFile?.name;
    const year = record.date ? record.date.slice(0, 4) : '2026';

    if (file) {
      const up = await uploadPdf(file, record.direction === 'in' ? 'surat_masuk' : 'surat_keluar', year, tell, onProgress);
      fileUrl = up.url; publicId = up.publicId;
      if (up.driveUrl) driveUrl = up.driveUrl;
      finalFileName = up.fileName;
    }
    if (dispFile) {
      const upD = await uploadPdf(dispFile, 'disposisi', year, tell, onProgress);
      dispUrl = upD.url;
      if (upD.driveUrl) dispDrive = upD.driveUrl;
      finalDispName = upD.fileName;
    }

    onProgress?.({ pct: 95, msg: 'Menyimpan indeks surat ke TiDB Cloud...' });
    const res = await fetch('/api/letters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...record, fileUrl, cloudinaryPublicId: publicId, driveUrl, fileName: finalFileName,
        dispositionFileUrl: dispUrl, dispositionDriveUrl: dispDrive, dispositionFileName: finalDispName,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal menyimpan arsip');
    const agendaNum = (data.agendaNumber || 'BARU').split('/')[0];
    const newRecord: LetterRecord = {
      ...record, fileUrl, cloudinaryPublicId: publicId, driveUrl, id: agendaNum, rawId: data.id,
      fileName: finalFileName || `${agendaNum}.pdf`,
      dispositionFileUrl: dispUrl, dispositionDriveUrl: dispDrive, dispositionFileName: finalDispName,
    };
    setLetters((prev) => [newRecord, ...prev]);
    tell(`Arsip ${newRecord.id} berhasil dicatat ke TiDB Cloud Serverless.`);
    return newRecord;
  };

  const confirmDelete = async (trashDrive = false) => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const targetId = deleteTarget.rawId || deleteTarget.id;
      const res = await fetch(
        `/api/letters?id=${encodeURIComponent(targetId)}&direction=${deleteTarget.direction}&trashDrive=${trashDrive}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menghapus arsip');
      const targetKey = letterKey(deleteTarget);
      setLetters((prev) => prev.filter((l) => letterKey(l) !== targetKey));
      const deletedId = deleteTarget.id;
      setDeleteTarget(null);
      tell(formatDeleteMsg(`Arsip No. Agenda ${deletedId}`, trashDrive));
    } catch (err: unknown) {
      tell(err instanceof Error ? err.message : 'Gagal menghapus arsip.', false);
    } finally {
      setDeleting(false);
    }
  };

  const confirmBatchDelete = async (trashDrive = false) => {
    if (!batchTargets.length) return;
    setDeleting(true);
    try {
      for (const dir of ['in', 'out'] as const) {
        const group = batchTargets.filter((b) => b.direction === dir);
        if (!group.length) continue;
        const res = await fetch('/api/letters', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: group.map((b) => b.rawId || b.id), direction: dir, trashDrive }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Gagal menghapus arsip massal');
      }
      const keySet = new Set(batchTargets.map((b) => letterKey(b)));
      setLetters((prev) => prev.filter((l) => !keySet.has(letterKey(l))));
      const count = batchTargets.length;
      setBatchTargets([]);
      tell(formatDeleteMsg(`${count} arsip terpilih`, trashDrive));
    } catch (err: unknown) {
      tell(err instanceof Error ? err.message : 'Gagal menghapus arsip massal.', false);
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdate = async (
    id: string,
    updates: Partial<LetterRecord>,
    file?: File,
    dispFile?: File,
    onProgress?: (p: UploadProgress) => void,
    explicitTarget?: LetterRecord
  ) => {
    const activeTarget = explicitTarget || editTarget;
    let fileUrl = updates.fileUrl, publicId = updates.cloudinaryPublicId, driveUrl = updates.driveUrl;
    let dispUrl = updates.dispositionFileUrl, dispDrive = updates.dispositionDriveUrl;
    let finalFileName = file?.name, finalDispName = dispFile?.name;
    const year = (updates.date || activeTarget?.date || '').slice(0, 4) || '2026';
    if (file) {
      const up = await uploadPdf(file, activeTarget?.direction === 'out' ? 'surat_keluar' : 'surat_masuk', year, tell, onProgress);
      fileUrl = up.url; publicId = up.publicId;
      if (up.driveUrl) driveUrl = up.driveUrl;
      finalFileName = up.fileName;
    }
    if (dispFile) {
      const upD = await uploadPdf(dispFile, 'disposisi', year, tell, onProgress);
      dispUrl = upD.url;
      if (upD.driveUrl) dispDrive = upD.driveUrl;
      finalDispName = upD.fileName;
    }
    const targetId = activeTarget?.rawId || id;
    const direction = activeTarget?.direction || 'in';
    const res = await fetch('/api/letters', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: targetId, direction, ...updates,
        ...(fileUrl ? { fileUrl } : {}), ...(publicId ? { cloudinaryPublicId: publicId } : {}),
        ...(driveUrl ? { driveUrl } : {}), ...(finalFileName ? { fileName: finalFileName } : {}),
        ...(dispUrl ? { dispositionFileUrl: dispUrl } : {}), ...(dispDrive ? { dispositionDriveUrl: dispDrive } : {}),
        ...(finalDispName ? { dispositionFileName: finalDispName } : {}),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal memperbarui arsip');

    const matchKey = activeTarget ? letterKey(activeTarget) : `${direction}:${id}`;
    setLetters((prev) =>
      prev.map((l) =>
        letterKey(l) === matchKey
          ? {
              ...l, ...updates,
              ...(fileUrl ? { fileUrl } : {}), ...(publicId ? { cloudinaryPublicId: publicId } : {}),
              ...(driveUrl ? { driveUrl } : {}), ...(finalFileName ? { fileName: finalFileName } : {}),
              ...(dispUrl ? { dispositionFileUrl: dispUrl } : {}), ...(dispDrive ? { dispositionDriveUrl: dispDrive } : {}),
              ...(finalDispName ? { dispositionFileName: finalDispName } : {}),
            }
          : l
      )
    );
    tell(`Arsip No. Agenda ${activeTarget?.id || id} berhasil diperbarui di TiDB Cloud.`);
    if (!explicitTarget) setEditTarget(null);
  };

  return {
    deleteTarget, setDeleteTarget, batchTargets, setBatchTargets,
    deleting, handleSave, confirmDelete, confirmBatchDelete,
    editTarget, setEditTarget, handleUpdate,
  };
}
