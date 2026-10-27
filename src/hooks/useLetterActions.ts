import { useState } from 'react';
import type { LetterRecord } from '@/types';
import { compressPdfIfNeeded } from '@/lib/pdf-compress';

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

  const handleSave = async (record: Omit<LetterRecord, 'id'>, file?: File) => {
    let fileUrl = record.fileUrl;
    let driveUrl = record.driveUrl;
    if (file) {
      tell('Memeriksa dan menyiapkan lampiran naskah...');
      const readyFile = await compressPdfIfNeeded(file, (p) => tell(p.message));
      const fd = new FormData();
      fd.append('file', readyFile);
      fd.append('folder', record.direction === 'in' ? 'surat_masuk' : 'surat_keluar');
      fd.append('year', record.date ? record.date.slice(0, 4) : '2026');
      const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
      const upData = await upRes.json();
      if (!upRes.ok || !upData.success) {
        throw new Error(upData.message || 'Gagal mengunggah berkas PDF.');
      }
      fileUrl = upData.url;
      if (upData.driveUrl) driveUrl = upData.driveUrl;
    }
    const res = await fetch('/api/letters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...record, fileUrl, driveUrl }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal menyimpan arsip');
    const agendaNum = (data.agendaNumber || 'BARU').split('/')[0];
    const newRecord: LetterRecord = {
      ...record,
      fileUrl,
      driveUrl,
      id: agendaNum,
      rawId: data.id,
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
      const errMsg = err instanceof Error ? err.message : 'Gagal menghapus arsip.';
      tell(errMsg, false);
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
      const errMsg = err instanceof Error ? err.message : 'Gagal menghapus arsip massal.';
      tell(errMsg, false);
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<LetterRecord>, file?: File) => {
    let fileUrl = updates.fileUrl;
    let driveUrl = updates.driveUrl;
    if (file) {
      tell('Memeriksa dan menyiapkan lampiran naskah...');
      const readyFile = await compressPdfIfNeeded(file, (p) => tell(p.message));
      const fd = new FormData();
      fd.append('file', readyFile);
      fd.append('folder', editTarget?.direction === 'in' ? 'surat_masuk' : 'surat_keluar');
      const targetDate = updates.date || editTarget?.date || '';
      fd.append('year', targetDate ? targetDate.slice(0, 4) : '2026');
      const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
      const upData = await upRes.json();
      if (!upRes.ok || !upData.success) {
        throw new Error(upData.message || 'Gagal mengunggah berkas PDF pembaruan.');
      }
      fileUrl = upData.url;
      if (upData.driveUrl) driveUrl = upData.driveUrl;
    }
    const targetId = editTarget?.rawId || id;
    const res = await fetch('/api/letters', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: targetId,
        direction: editTarget?.direction || 'in',
        ...updates,
        ...(fileUrl ? { fileUrl } : {}),
        ...(driveUrl ? { driveUrl } : {}),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal memperbarui arsip');

    setLetters((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, ...updates, ...(fileUrl ? { fileUrl } : {}), ...(driveUrl ? { driveUrl } : {}) } : l
      )
    );
    tell(`Arsip No. Agenda ${id} berhasil diperbarui di TiDB Cloud.`);
    setEditTarget(null);
  };

  return {
    deleteTarget,
    setDeleteTarget,
    batchTargets,
    setBatchTargets,
    deleting,
    handleSave,
    confirmDelete,
    confirmBatchDelete,
    editTarget,
    setEditTarget,
    handleUpdate,
  };
}
