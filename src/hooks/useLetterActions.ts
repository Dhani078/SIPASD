import { useState } from 'react';
import type { LetterRecord } from '@/types';

export function useLetterActions(
  setLetters: React.Dispatch<React.SetStateAction<LetterRecord[]>>,
  tell: (msg: string, ok?: boolean) => void
) {
  const [deleteTarget, setDeleteTarget] = useState<LetterRecord | null>(null);
  const [batchTargets, setBatchTargets] = useState<LetterRecord[]>([]);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async (record: Omit<LetterRecord, 'id'>, file?: File) => {
    let fileUrl = record.fileUrl;
    let driveUrl = record.driveUrl;
    if (file) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', record.direction === 'in' ? 'surat_masuk' : 'surat_keluar');
      const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
      const upData = await upRes.json();
      if (upRes.ok && upData.success) {
        fileUrl = upData.url;
        if (upData.driveUrl) driveUrl = upData.driveUrl;
      }
    }
    const res = await fetch('/api/letters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...record, fileUrl, driveUrl }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal menyimpan arsip');
    const newRecord: LetterRecord = { ...record, fileUrl, id: data.agendaNumber || 'BARU' };
    setLetters((prev) => [newRecord, ...prev]);
    tell(`Arsip ${newRecord.id} berhasil dicatat ke TiDB Cloud Serverless.`);
    return newRecord;
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/letters?id=${encodeURIComponent(deleteTarget.id)}&direction=${deleteTarget.direction}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menghapus arsip');
      setLetters((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      const deletedId = deleteTarget.id;
      setDeleteTarget(null);
      tell(`Arsip No. Agenda ${deletedId} berhasil dihapus dari TiDB.`);
    } catch (err: any) {
      tell(err.message || 'Gagal menghapus arsip.', false);
    } finally {
      setDeleting(false);
    }
  };

  const confirmBatchDelete = async () => {
    if (!batchTargets.length) return;
    setDeleting(true);
    try {
      const ids = batchTargets.map((b) => b.id);
      const direction = batchTargets[0].direction;
      const res = await fetch('/api/letters', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, direction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menghapus arsip massal');
      const idSet = new Set(ids);
      setLetters((prev) => prev.filter((l) => !idSet.has(l.id)));
      const count = batchTargets.length;
      setBatchTargets([]);
      tell(`${count} arsip terpilih berhasil dihapus dari TiDB Cloud.`);
    } catch (err: any) {
      tell(err.message || 'Gagal menghapus arsip massal.', false);
    } finally {
      setDeleting(false);
    }
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
  };
}
