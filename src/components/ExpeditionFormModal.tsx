'use client';

import { useState } from 'react';
import Icon from './Icon';
import Modal from './Modal';
import type { LetterRecord } from '@/types';

interface Props {
  letter: LetterRecord | null;
  initial?: {
    tanggal_kirim: string;
    kurir_pengirim: string;
    penerima_nama: string | null;
    penerima_telepon: string | null;
    catatan_ekspedisi: string | null;
  };
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

export default function ExpeditionFormModal({ letter, initial, onClose, onSaved }: Props) {
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!letter?.rawId) {
      setNotice({ ok: false, text: 'Surat keluar ini tidak punya id database, catatan tidak bisa disimpan.' });
      return;
    }
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const res = await fetch('/api/expedition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surat_keluar_id: letter.rawId,
          tanggal_kirim: form.get('tanggal_kirim'),
          kurir_pengirim: form.get('kurir_pengirim'),
          penerima_nama: form.get('penerima_nama'),
          penerima_telepon: form.get('penerima_telepon'),
          catatan_ekspedisi: form.get('catatan_ekspedisi'),
        }),
      });
      const data = await res.json();
      setNotice({ ok: !!data.success, text: data.message || 'Gagal menyimpan catatan' });
      if (data.success) {
        await onSaved();
        onClose();
      }
    } catch {
      setNotice({ ok: false, text: 'Koneksi ke server gagal, catatan belum tersimpan.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Catat Distribusi Ekspedisi" onClose={onClose}>
      <form className="p-4 space-y-3" onSubmit={submit}>
        {notice && !notice.ok && (
          <div className="p-2 rounded text-sm border bg-red-50 border-red-200 text-red-800">{notice.text}</div>
        )}
        {letter && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <p className="text-xs text-slate-600 mb-1">Surat Keluar</p>
            <b className="text-sm">{letter.id}/SK/2026</b>
            <p className="text-xs text-slate-700 mt-1">{letter.subject}</p>
          </div>
        )}
        <label>
          <span className="text-xs font-semibold text-slate-700">Tanggal Kirim</span>
          <input type="date" name="tanggal_kirim" defaultValue={initial?.tanggal_kirim || ''} required className="w-full mt-1 px-2 py-1.5 text-sm border border-slate-300 rounded" />
        </label>
        <label>
          <span className="text-xs font-semibold text-slate-700">Kurir Pengirim</span>
          <input type="text" name="kurir_pengirim" defaultValue={initial?.kurir_pengirim || ''} placeholder="Contoh: Bapak Ahmad (Staf TU)" required className="w-full mt-1 px-2 py-1.5 text-sm border border-slate-300 rounded" />
        </label>
        <label>
          <span className="text-xs font-semibold text-slate-700">Nama Penerima</span>
          <input type="text" name="penerima_nama" defaultValue={initial?.penerima_nama || ''} placeholder="Nama penerima surat di instansi tujuan" required className="w-full mt-1 px-2 py-1.5 text-sm border border-slate-300 rounded" />
        </label>
        <label>
          <span className="text-xs font-semibold text-slate-700">Telepon Penerima (Opsional)</span>
          <input type="tel" name="penerima_telepon" defaultValue={initial?.penerima_telepon || ''} placeholder="Contoh: 0812-3456-7890" className="w-full mt-1 px-2 py-1.5 text-sm border border-slate-300 rounded" />
        </label>
        <label>
          <span className="text-xs font-semibold text-slate-700">Catatan Ekspedisi (Opsional)</span>
          <textarea
            name="catatan_ekspedisi"
            rows={2}
            defaultValue={initial?.catatan_ekspedisi || ''}
            placeholder="Contoh: Diterima langsung oleh Kepala Bagian TU, ditandatangani pukul 10:30 WITA"
            className="w-full mt-1 px-2 py-1.5 text-sm border border-slate-300 rounded"
          />
        </label>
        <div className="modal-actions">
          <button type="button" className="btn outline" onClick={onClose}>Batal</button>
          <button type="submit" className="btn primary" disabled={saving}>
            <Icon name="check" />
            {saving ? 'Menyimpan...' : 'Simpan Catatan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}