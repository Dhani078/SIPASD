'use client';

import { useId, useState } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import type { LetterRecord, Urgency } from '@/types';

type DispStatus = 'BELUM_DIPROSES' | 'PROSES' | 'SELESAI';

interface Props {
  letter: LetterRecord;
  onClose: () => void;
  onSave: (id: string, updates: Partial<LetterRecord>, file?: File) => Promise<void>;
}

export default function EditLetterModal({ letter, onClose, onSave }: Props) {
  const [number, setNumber] = useState(letter.number);
  const [origin, setOrigin] = useState(letter.origin);
  const [subject, setSubject] = useState(letter.subject);
  const [date, setDate] = useState(letter.date);
  const [type, setType] = useState<Urgency>(letter.type);
  const [official, setOfficial] = useState(letter.disposition?.official || '');
  const [dispStatus, setDispStatus] = useState<DispStatus>(letter.disposition?.status || 'PROSES');
  const [notes, setNotes] = useState(letter.disposition?.notes || '');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const uid = useId();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!number.trim() || !origin.trim() || !subject.trim()) {
      setErr('Nomor surat, instansi, dan perihal wajib diisi.');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      const updates: Partial<LetterRecord> = {
        number: number.trim(),
        origin: origin.trim(),
        subject: subject.trim(),
        date,
        type,
      };
      if (letter?.direction === 'in') {
        updates.disposition = {
          official: official.trim() || '-',
          date: letter.disposition?.date || date,
          division: letter.division || 'Sekretariat',
          instructions: letter.disposition?.instructions || ['Tindak Lanjuti'],
          notes: notes.trim(),
          status: dispStatus,
        };
      }
      await onSave(letter.id, updates, file || undefined);
      onClose();
    } catch (e: any) {
      setErr(e.message || 'Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Edit Arsip Agenda ${letter.id}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs text-slate-700 max-h-[80vh] overflow-y-auto">
        {err && <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs">{err}</div>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${uid}-agenda`} className="block font-semibold mb-1 text-slate-600">Nomor Agenda</label>
            <input id={`${uid}-agenda`} type="text" value={letter.id} disabled className="w-full bg-slate-100 border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs text-slate-500 cursor-not-allowed" />
          </div>
          <div>
            <label htmlFor={`${uid}-date`} className="block font-semibold mb-1 text-slate-600">Tanggal Naskah</label>
            <input id={`${uid}-date`} type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs" />
          </div>
        </div>
        <div>
          <label htmlFor={`${uid}-num`} className="block font-semibold mb-1 text-slate-600">Nomor Surat Dinas</label>
          <input id={`${uid}-num`} type="text" value={number} onChange={(e) => setNumber(e.target.value)} required className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs" />
        </div>
        <div>
          <label htmlFor={`${uid}-orig`} className="block font-semibold mb-1 text-slate-600">{letter.direction === 'in' ? 'Asal Instansi / Pengirim' : 'Tujuan Instansi'}</label>
          <input id={`${uid}-orig`} type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} required className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs" />
        </div>
        <div>
          <label htmlFor={`${uid}-subj`} className="block font-semibold mb-1 text-slate-600">Perihal Surat</label>
          <textarea id={`${uid}-subj`} rows={2} value={subject} onChange={(e) => setSubject(e.target.value)} required className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${uid}-urg`} className="block font-semibold mb-1 text-slate-600">Sifat Naskah</label>
            <select id={`${uid}-urg`} value={type} onChange={(e) => setType(e.target.value as Urgency)} className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs">
              <option value="Biasa">Biasa</option>
              <option value="Penting">Penting</option>
              <option value="Segera">Segera</option>
              <option value="Kilat">Kilat</option>
            </select>
          </div>
          <div>
            <label htmlFor={`${uid}-file`} className="block font-semibold mb-1 text-slate-600">Ganti PDF (Opsional)</label>
            <input id={`${uid}-file`} type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-xs" />
          </div>
        </div>

        {letter.direction === 'in' && (
          <div className="border-t border-slate-200 pt-3 space-y-2.5 bg-slate-50/70 p-3 rounded">
            <b className="block text-emerald-950 text-xs">Kelola Disposisi Kedinasan</b>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor={`${uid}-off`} className="block text-[11px] font-medium text-slate-600 mb-0.5">Pejabat Pendisposisi</label>
                <input id={`${uid}-off`} type="text" value={official} onChange={(e) => setOfficial(e.target.value)} placeholder="Cth: Kepala Dinas" className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs" />
              </div>
              <div>
                <label htmlFor={`${uid}-status`} className="block text-[11px] font-medium text-slate-600 mb-0.5">Status Disposisi</label>
                <select id={`${uid}-status`} value={dispStatus} onChange={(e) => setDispStatus(e.target.value as DispStatus)} className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs">
                  <option value="BELUM_DIPROSES">Belum Diproses</option>
                  <option value="PROSES">Sedang Proses</option>
                  <option value="SELESAI">Selesai</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor={`${uid}-notes`} className="block text-[11px] font-medium text-slate-600 mb-0.5">Catatan Instruksi</label>
              <input id={`${uid}-notes`} type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan arahan pimpinan..." className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs" />
            </div>
          </div>
        )}

        <div className="modal-actions pt-2 flex justify-end gap-2">
          <button type="button" className="btn outline text-xs" onClick={onClose} disabled={saving}>
            Batal
          </button>
          <button type="submit" className="btn primary text-xs flex items-center gap-1.5" disabled={saving}>
            <Icon name="check" size={14} />
            <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
