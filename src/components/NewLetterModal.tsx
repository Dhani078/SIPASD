'use client';

import { useId, useRef, useState } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import NewLetterDisposisiFields from './NewLetterDisposisiFields';
import { classifications, venues } from '@/data/constants';
import { classifyText, type ClassificationResult } from '@/lib/classifier';
import type { Direction, LetterRecord, Urgency } from '@/types';

interface Props {
  direction: Direction;
  onClose: () => void;
  onSave: (letter: Omit<LetterRecord, 'id'>, file?: File) => Promise<void> | void;
}

export default function NewLetterModal({ direction, onClose, onSave }: Props) {
  const [kind, setKind] = useState<Direction>(direction);
  const [file, setFile] = useState<File>();
  const [isDrag, setIsDrag] = useState(false);
  const [error, setError] = useState('');
  const [checks, setChecks] = useState<string[]>(['Tindak Lanjuti']);
  const [saving, setSaving] = useState(false);
  const [aiRec, setAiRec] = useState<ClassificationResult | null>(null);
  const [classCode, setClassCode] = useState('005');
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const fileInput = useRef<HTMLInputElement>(null);
  const uid = useId();

  const toggleCheck = (item: string) => {
    setChecks((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  const handleSubject = (text: string) => {
    setAiRec(text.trim().length >= 4 ? classifyText(text) : null);
  };

  return (
    <Modal title="Indeks Berkas Baru" onClose={onClose}>
      <form
        className="new-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const val = (k: string) => String(f.get(k) ?? '').trim();
          if (!val('number') || !val('origin') || !val('subject')) {
            setError('Nomor surat, instansi, dan perihal tidak boleh kosong.');
            return;
          }
          setSaving(true);
          try {
            await onSave(
              {
                number: val('number'),
                origin: val('origin'),
                subject: val('subject'),
                date: val('date') || today,
                direction: kind,
                classification: classCode,
                venue: val('venue') || '-',
                division: val('division') || 'Sekretariat',
                type: (val('urgency') || 'Biasa') as Urgency,
                disposition: {
                  official: val('official') || 'Pebriadin Hapiz, AP, M.Si',
                  date: val('received') || today,
                  division: val('disposisi_division') || 'Sekretariat',
                  instructions: checks,
                  notes: val('notes') || '',
                },
              },
              file
            );
            onClose();
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Gagal menyimpan arsip.';
            setError(msg);
          } finally {
            setSaving(false);
          }
        }}
      >
        {error && <div className="p-2 mb-2 bg-red-100 text-red-700 rounded text-xs">{error}</div>}
        <div className="form-grid">
          <div>
            <label htmlFor={`${uid}-kind`} className="block text-[11px] font-semibold text-slate-700 mb-1">Jenis Arsip</label>
            <select id={`${uid}-kind`} name="direction" value={kind} onChange={(e) => setKind(e.target.value as Direction)} className="w-full">
              <option value="in">Surat Masuk</option>
              <option value="out">Surat Keluar</option>
            </select>
          </div>
          <div>
            <label htmlFor={`${uid}-urg`} className="block text-[11px] font-semibold text-slate-700 mb-1">Sifat Surat</label>
            <select id={`${uid}-urg`} name="urgency" className="w-full">
              <option>Biasa</option>
              <option>Penting</option>
              <option>Segera</option>
              <option>Kilat</option>
            </select>
          </div>
          <div>
            <label htmlFor={`${uid}-num`} className="block text-[11px] font-semibold text-slate-700 mb-1">Nomor Surat</label>
            <input id={`${uid}-num`} name="number" required placeholder="Contoh: 005/182/DISPORA/2026" className="w-full" />
          </div>
          <div>
            <label htmlFor={`${uid}-orig`} className="block text-[11px] font-semibold text-slate-700 mb-1">
              {kind === 'in' ? 'Asal Instansi / Pengirim' : 'Tujuan Instansi'}
            </label>
            <input id={`${uid}-orig`} name="origin" required placeholder="Nama instansi kedinasan" className="w-full" />
          </div>
          <div className="col-span-2">
            <label htmlFor={`${uid}-subj`} className="block text-[11px] font-semibold text-slate-700 mb-1">Perihal</label>
            <input id={`${uid}-subj`} name="subject" required placeholder="Ringkasan perihal..." onChange={(e) => handleSubject(e.target.value)} className="w-full" />
          </div>
          {aiRec && (
            <div className="col-span-2 p-2 bg-emerald-50 border border-emerald-300 rounded flex items-center justify-between text-xs">
              <span><b className="text-emerald-900">Rekomendasi AI:</b> {aiRec.code} ({aiRec.name}) - {aiRec.confidence}% cocok</span>
              <button type="button" className="btn primary py-1 px-2 text-xs" onClick={() => setClassCode(aiRec.code)}>Terapkan</button>
            </div>
          )}
          <div>
            <label htmlFor={`${uid}-date`} className="block text-[11px] font-semibold text-slate-700 mb-1">Tanggal Surat</label>
            <input id={`${uid}-date`} name="date" type="date" defaultValue={today} required className="w-full" />
          </div>
          <div>
            <label htmlFor={`${uid}-rec`} className="block text-[11px] font-semibold text-slate-700 mb-1">
              {kind === 'in' ? 'Tanggal Diterima' : 'Tanggal Diterbitkan'}
            </label>
            <input id={`${uid}-rec`} name="received" type="date" defaultValue={today} required className="w-full" />
          </div>
          <div>
            <label htmlFor={`${uid}-cls`} className="block text-[11px] font-semibold text-slate-700 mb-1">Klasifikasi Arsip</label>
            <select id={`${uid}-cls`} name="classification" value={classCode} onChange={(e) => setClassCode(e.target.value)} className="w-full">
              {classifications.map(([code, label]) => (
                <option value={code} key={code}>{code} - {label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${uid}-ven`} className="block text-[11px] font-semibold text-slate-700 mb-1">Venue Olahraga</label>
            <select id={`${uid}-ven`} name="venue" className="w-full">
              <option value="-">- Tidak Terkait Venue -</option>
              {venues.map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>

        <div
          className={`file-box mt-2 p-3 border-2 border-dashed rounded text-center transition-all ${
            isDrag ? 'border-emerald-600 bg-emerald-50/70' : 'border-slate-300 bg-slate-50/50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
          onDragLeave={() => setIsDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDrag(false);
            const dropped = e.dataTransfer.files?.[0];
            if (dropped && dropped.name.toLowerCase().endsWith('.pdf')) setFile(dropped);
          }}
        >
          <input type="file" ref={fileInput} accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0])} />
          {file ? (
            <div className="flex items-center justify-center gap-2 text-xs text-emerald-900 bg-emerald-100 py-1.5 px-3 rounded">
              <Icon name="file" size={14} />
              <span className="font-semibold truncate max-w-xs">{file.name}</span>
              <span className="text-emerald-700 text-[11px]">({(file.size / 1024).toFixed(0)} KB)</span>
              {file.size > 4 * 1024 * 1024 && <span className="bg-amber-200 text-amber-900 text-[10px] px-1 rounded font-medium">Auto-Kompres</span>}
              <button type="button" className="ml-1 text-red-600 hover:text-red-800" onClick={() => setFile(undefined)} title="Hapus berkas">✕</button>
            </div>
          ) : (
            <>
              <button type="button" className="btn outline" onClick={() => fileInput.current?.click()}>
                <Icon name="file" size={14} /> Pilih Lampiran PDF
              </button>
              <span className="block text-xs text-slate-500 mt-1">
                {isDrag ? 'Lepaskan berkas PDF di sini...' : 'Tarik & lepas PDF di sini atau klik pilih (maks 20 MB)'}
              </span>
            </>
          )}
        </div>

        {kind === 'in' && <NewLetterDisposisiFields checks={checks} onToggleCheck={toggleCheck} />}

        <div className="modal-actions mt-3 flex justify-end gap-2">
          <button type="button" className="btn outline" onClick={onClose} disabled={saving}>Batal</button>
          <button type="submit" className="btn primary flex items-center gap-1.5" disabled={saving}>
            <Icon name="check" size={15} /> <span>{saving ? 'Menyimpan...' : 'Simpan Indeks Arsip'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
