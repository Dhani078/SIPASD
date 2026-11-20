'use client';

import { useId, useState } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { divisions } from '@/data/constants';
import type { LetterRecord, Urgency } from '@/types';

type DispStatus = 'BELUM_DIPROSES' | 'PROSES' | 'SELESAI';
interface Props {
  letter: LetterRecord;
  onClose: () => void;
  onSave: (id: string, updates: Partial<LetterRecord>, file?: File, dispFile?: File) => Promise<void>;
}

export default function EditLetterModal({ letter, onClose, onSave }: Props) {
  const [number, setNumber] = useState(letter.number), [origin, setOrigin] = useState(letter.origin);
  const [subject, setSubject] = useState(letter.subject), [date, setDate] = useState(letter.date);
  const [type, setType] = useState<Urgency>(letter.type), [division, setDivision] = useState(letter.division || 'Sekretariat');
  const [official, setOfficial] = useState(letter.disposition?.official || 'Pebriadin Hapiz, AP, M.Si');
  const [dispStatus, setDispStatus] = useState<DispStatus>(letter.disposition?.status || 'PROSES');
  const [notes, setNotes] = useState(letter.disposition?.notes || '');
  const [file, setFile] = useState<File | null>(null), [dispFile, setDispFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false), [err, setErr] = useState('');
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
      const updates: Partial<LetterRecord> = { number: number.trim(), origin: origin.trim(), subject: subject.trim(), date, type, division };
      if (letter.direction === 'in') {
        updates.disposition = {
          official: official.trim() || 'Pebriadin Hapiz, AP, M.Si', date: letter.disposition?.date || date, division,
          instructions: letter.disposition?.instructions || ['Tindak Lanjuti'], notes: notes.trim(), status: dispStatus,
        };
      }
      await onSave(letter.id, updates, file || undefined, dispFile || undefined);
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  }

  const fileLink = letter.fileUrl ? (letter.fileUrl.startsWith('http') ? `/api/pdf?url=${encodeURIComponent(letter.fileUrl)}` : letter.fileUrl) : null;
  const rawDisp = letter.dispositionFileUrl || letter.disposition?.fileUrl;
  const dispLink = rawDisp ? (String(rawDisp).startsWith('http') ? `/api/pdf?url=${encodeURIComponent(String(rawDisp))}` : String(rawDisp)) : null;

  return (
    <Modal title={`Ubah Arsip Agenda: ${letter.id}`} onClose={onClose} className="max-w-2xl">
      <form onSubmit={handleSubmit}>
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
          {err && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
              <Icon name="close" size={14} className="shrink-0 text-rose-500" /><span>{err}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor={`${uid}-agenda`} className="block font-semibold mb-1.5 text-slate-700">Nomor Agenda</label>
              <input id={`${uid}-agenda`} type="text" value={letter.id} disabled className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-xs text-slate-600 cursor-not-allowed" />
            </div>
            <div>
              <label htmlFor={`${uid}-date`} className="block font-semibold mb-1.5 text-slate-700">Tanggal Naskah <span className="text-red-500">*</span></label>
              <input id={`${uid}-date`} type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2">
              <label htmlFor={`${uid}-num`} className="block font-semibold mb-1.5 text-slate-700">Nomor Surat Dinas <span className="text-red-500">*</span></label>
              <input id={`${uid}-num`} type="text" value={number} onChange={(e) => setNumber(e.target.value)} required className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition" />
            </div>
            <div>
              <label htmlFor={`${uid}-urg`} className="block font-semibold mb-1.5 text-slate-700">Sifat Naskah</label>
              <select id={`${uid}-urg`} value={type} onChange={(e) => setType(e.target.value as Urgency)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition">
                <option value="Biasa">Biasa</option><option value="Penting">Penting</option><option value="Segera">Segera</option><option value="Kilat">Kilat</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor={`${uid}-orig`} className="block font-semibold mb-1.5 text-slate-700">{letter.direction === 'in' ? 'Asal Instansi / Pengirim' : 'Tujuan Instansi'} <span className="text-red-500">*</span></label>
              <input id={`${uid}-orig`} type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} required className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition" />
            </div>
            <div>
              <label htmlFor={`${uid}-div`} className="block font-semibold mb-1.5 text-slate-700">{letter.direction === 'in' ? 'Bidang Tujuan Disposisi' : 'Bidang Pemrakarsa'}</label>
              <select id={`${uid}-div`} value={division} onChange={(e) => setDivision(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition">
                {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor={`${uid}-subj`} className="block font-semibold mb-1.5 text-slate-700">Perihal Surat <span className="text-red-500">*</span></label>
            <textarea id={`${uid}-subj`} rows={2} value={subject} onChange={(e) => setSubject(e.target.value)} required className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition resize-none" />
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Icon name="file" size={13} className="text-emerald-700" /> Berkas Naskah Digital (PDF / Foto)
              </span>
              {fileLink ? (
                <a href={fileLink} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 transition">✓ Berkas Terlampir (Buka PDF)</a>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">Belum Ada Berkas</span>
              )}
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 inline-flex items-center gap-1.5 transition shadow-xs">
                <Icon name="download" size={13} className="text-emerald-700" />
                <span>{file ? 'Ganti File Pilihan' : (letter.fileUrl ? 'Ganti Berkas Naskah' : 'Pilih Berkas Lampiran')}</span>
                <input id={`${uid}-file`} type="file" accept=".pdf,image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
              <span className="text-xs text-slate-500 truncate max-w-xs">{file ? `${file.name} (${(file.size / 1024).toFixed(0)} KB)` : (letter.fileName || 'Tidak ada berkas baru dipilih')}</span>
            </div>
          </div>

          {letter.direction === 'in' && (
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Icon name="shield" size={13} className="text-emerald-700" /> Pengelolaan Disposisi Kedinasan
                </span>
                {dispLink && (
                  <a href={dispLink} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 transition">✓ Scan Disposisi Ada (Lihat)</a>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor={`${uid}-off`} className="block text-[11px] font-semibold text-slate-700 mb-1">Pejabat Pendisposisi</label>
                  <input id={`${uid}-off`} type="text" value={official} onChange={(e) => setOfficial(e.target.value)} placeholder="Cth: Pebriadin Hapiz, AP, M.Si" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                </div>
                <div>
                  <label htmlFor={`${uid}-status`} className="block text-[11px] font-semibold text-slate-700 mb-1">Posisi Surat / Status Disposisi</label>
                  <select id={`${uid}-status`} value={dispStatus} onChange={(e) => setDispStatus(e.target.value as DispStatus)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none">
                    <option value="BELUM_DIPROSES">Diterima Persuratan</option>
                    <option value="PROSES">Kepala Dinas</option>
                    <option value="SELESAI">Selesai</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor={`${uid}-notes`} className="block text-[11px] font-semibold text-slate-700 mb-1">Catatan Tertulis Pimpinan</label>
                <input id={`${uid}-notes`} type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan arahan pimpinan..." className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Scan Lembar Disposisi Fisik (PDF / Foto)</label>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-900 inline-flex items-center gap-1.5 transition shadow-xs">
                    <Icon name="file" size={13} className="text-emerald-700" />
                    <span>{dispFile ? 'Ganti File Pilihan' : (letter.dispositionFileUrl ? 'Ganti Scan Disposisi' : 'Pilih Scan Disposisi')}</span>
                    <input id={`${uid}-dispfile`} type="file" accept=".pdf,image/jpeg,image/png,image/webp" onChange={(e) => setDispFile(e.target.files?.[0] || null)} className="hidden" />
                  </label>
                  <span className="text-xs text-slate-500 truncate max-w-xs">{dispFile ? `${dispFile.name} (${(dispFile.size / 1024).toFixed(0)} KB)` : (letter.dispositionFileName || 'Tidak ada file baru')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Icon name="shield" size={13} className="text-emerald-700" /> Standar SPBE Pemprov Kalsel
          </span>
          <button type="button" className="btn outline" onClick={onClose} disabled={saving}>Batal</button>
          <button type="submit" className="btn primary flex items-center gap-1.5 shadow-sm" disabled={saving}>
            {saving ? <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Icon name="check" size={14} />}
            <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
