import { useState } from 'react';
import type { LetterRecord } from '@/types';
import { compressPdfIfNeeded } from '@/lib/pdf-compress';
import { isImageFile, convertImageToPdf } from '@/lib/image-to-pdf';

const formatDeleteMsg = (subject: string, trash: boolean) =>
  trash ? `${subject} dihapus & berkas dipindahkan ke Trash Google Drive.` : `${subject} berhasil dihapus dari TiDB.`;

async function uploadPdf(file: File, folder: 'surat_masuk' | 'surat_keluar' | 'disposisi', year: string, tell: (m: string) => void) {
  let readyFile = file;
  if (isImageFile(file)) {
    tell(`Memindai foto ${file.name} menjadi dokumen PDF A4...`);
    readyFile = await convertImageToPdf(file);
  }
  tell(`Memeriksa lampiran ${readyFile.name}...`);
  const ready = await compressPdfIfNeeded(readyFile, (p) => tell(p.message));
  const fd = new FormData();
  fd.append('file', ready);
  fd.append('folder', folder);
  fd.append('year', year);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Gagal mengunggah berkas PDF.');
  return { url: data.url as string, driveUrl: (data.driveUrl as string) || undefined, fileName: ready.name };
}

export function useLetterActions(
  setLetters: React.Dispatch<React.SetStateAction<LetterRecord[]>>,
  tell: (msg: string, ok?: boolean) => void
) {
  const [deleteTarget, setDeleteTarget] = useState<LetterRecord | null>(null);
  const [batchTargets, setBatchTargets] = useState<LetterRecord[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState<LetterRecord | null>(null);

  const handleSave = async (record: Omit<LetterRecord, 'id'>, file?: File, dispFile?: File) => {
    let fileUrl = record.fileUrl, driveUrl = record.driveUrl;
    let dispUrl = record.dispositionFileUrl, dispDrive = record.dispositionDriveUrl;
    let finalFileName = file?.name, finalDispName = dispFile?.name;
    const year = record.date ? record.date.slice(0, 4) : '2026';

    if (file) {
      const up = await uploadPdf(file, record.direction === 'in' ? 'surat_masuk' : 'surat_keluar', year, tell);
      fileUrl = up.url;
      if (up.driveUrl) driveUrl = up.driveUrl;
      finalFileName = up.fileName;
    }
    if (dispFile) {
      const upD = await uploadPdf(dispFile, 'disposisi', year, tell);
      dispUrl = upD.url;
      if (upD.driveUrl) dispDrive = upD.driveUrl;
      finalDispName = upD.fileName;
    }

    const res = await fetch('/api/letters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...record, fileUrl, driveUrl, fileName: finalFileName,
        dispositionFileUrl: dispUrl, dispositionDriveUrl: dispDrive, dispositionFileName: finalDispName,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal menyimpan arsip');
    const agendaNum = (data.agendaNumber || 'BARU').split('/')[0];
    const newRecord: LetterRecord = {
      ...record, fileUrl, driveUrl, id: agendaNum, rawId: data.id,
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
      setLetters((prev) => prev.filter((l) => l.id !== deleteTarget.id && (!deleteTarget.rawId || l.rawId !== deleteTarget.rawId)));
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
      const ids = batchTargets.map((b) => b.rawId || b.id);
      const direction = batchTargets[0].direction;
      const res = await fetch('/api/letters', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, direction, trashDrive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menghapus arsip massal');
      const idSet = new Set(batchTargets.map((b) => b.id));
      const rawIdSet = new Set(batchTargets.map((b) => b.rawId).filter(Boolean));
      setLetters((prev) => prev.filter((l) => !idSet.has(l.id) && (!l.rawId || !rawIdSet.has(l.rawId))));
      const count = batchTargets.length;
      setBatchTargets([]);
      tell(formatDeleteMsg(`${count} arsip terpilih`, trashDrive));
    } catch (err: unknown) {
      tell(err instanceof Error ? err.message : 'Gagal menghapus arsip massal.', false);
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<LetterRecord>, file?: File, dispFile?: File) => {
    let fileUrl = updates.fileUrl, driveUrl = updates.driveUrl;
    let dispUrl = updates.dispositionFileUrl, dispDrive = updates.dispositionDriveUrl;
    let finalFileName = file?.name, finalDispName = dispFile?.name;
    const year = (updates.date || editTarget?.date || '').slice(0, 4) || '2026';
    if (file) {
      const up = await uploadPdf(file, editTarget?.direction === 'in' ? 'surat_masuk' : 'surat_keluar', year, tell);
      fileUrl = up.url;
      if (up.driveUrl) driveUrl = up.driveUrl;
      finalFileName = up.fileName;
    }
    if (dispFile) {
      const upD = await uploadPdf(dispFile, 'disposisi', year, tell);
      dispUrl = upD.url;
      if (upD.driveUrl) dispDrive = upD.driveUrl;
      finalDispName = upD.fileName;
    }
    const targetId = editTarget?.rawId || id;
    const res = await fetch('/api/letters', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: targetId, direction: editTarget?.direction || 'in', ...updates,
        ...(fileUrl ? { fileUrl } : {}), ...(driveUrl ? { driveUrl } : {}),
        ...(finalFileName ? { fileName: finalFileName } : {}),
        ...(dispUrl ? { dispositionFileUrl: dispUrl } : {}),
        ...(dispDrive ? { dispositionDriveUrl: dispDrive } : {}),
        ...(finalDispName ? { dispositionFileName: finalDispName } : {}),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal memperbarui arsip');

    setLetters((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l, ...updates,
              ...(fileUrl ? { fileUrl } : {}), ...(driveUrl ? { driveUrl } : {}),
              ...(finalFileName ? { fileName: finalFileName } : {}),
              ...(dispUrl ? { dispositionFileUrl: dispUrl } : {}),
              ...(dispDrive ? { dispositionDriveUrl: dispDrive } : {}),
              ...(finalDispName ? { dispositionFileName: finalDispName } : {}),
            }
          : l
      )
    );
    tell(`Arsip No. Agenda ${id} berhasil diperbarui di TiDB Cloud.`);
    setEditTarget(null);
  };

  return {
    deleteTarget, setDeleteTarget, batchTargets, setBatchTargets,
    deleting, handleSave, confirmDelete, confirmBatchDelete,
    editTarget, setEditTarget, handleUpdate,
  };
}
