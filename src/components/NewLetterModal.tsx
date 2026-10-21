'use client';

import { useRef, useState } from 'react';
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
  const [error, setError] = useState('');
  const [checks, setChecks] = useState<string[]>(['Tindak Lanjuti']);
  const [saving, setSaving] = useState(false);
  const [aiRec, setAiRec] = useState<ClassificationResult | null>(null);
  const [classCode, setClassCode] = useState('005');
  const fileInput = useRef<HTMLInputElement>(null);

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
          const form = e.currentTarget;
          const f = new FormData(form);
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
                date: val('date') || new Date().toISOString().slice(0, 10),
                direction: kind,
                classification: classCode,
                venue: val('venue') || '-',
                division: val('division') || 'Sekretariat',
                type: (val('urgency') || 'Biasa') as Urgency,
                disposition: {
                  official: val('official') || 'Pebriadin Hapiz, AP, M.Si',
                  date: val('received') || new Date().toISOString().slice(0, 10),
                  division: val('disposisi_division') || 'Sekretariat',
                  instructions: checks,
                  notes: val('notes') || '',
                },
              },
              file
            );
            onClose();
          } catch (err: any) {
            setError(err.message || 'Gagal menyimpan arsip.');
          } finally {
            setSaving(false);
          }
        }}
      >
        {error && <div className="p-2 mb-3 bg-red-100 text-red-700 rounded text-xs">{error}</div>}
        <div className="form-grid">
          <label>
            Jenis Arsip
            <select name="direction" value={kind} onChange={(e) => setKind(e.target.value as Direction)}>
              <option value="in">Surat Masuk</option>
              <option value="out">Surat Keluar</option>
            </select>
          </label>
          <label>
            Sifat Surat
            <select name="urgency">
              <option>Biasa</option>
              <option>Penting</option>
              <option>Segera</option>
              <option>Kilat</option>
            </select>
          </label>
          <label>
            Nomor Surat
            <input name="number" required placeholder="Contoh: 005/182/DISPORA/2026" />
          </label>
          <label>
            {kind === 'in' ? 'Asal Instansi / Pengirim' : 'Tujuan Instansi'}
            <input name="origin" required placeholder="Nama instansi kedinasan" />
          </label>
          <label className="col-span-2">
            Perihal
            <input name="subject" required placeholder="Ringkasan perihal..." onChange={(e) => handleSubject(e.target.value)} />
          </label>
          {aiRec && (
            <div className="col-span-2 p-2 bg-emerald-50 border border-emerald-300 rounded flex items-center justify-between text-xs">
              <span><b className="text-emerald-900">Rekomendasi AI:</b> {aiRec.code} ({aiRec.name}) - {aiRec.confidence}% cocok</span>
              <button type="button" className="btn primary py-1 px-2 text-xs" onClick={() => setClassCode(aiRec.code)}>Terapkan</button>
            </div>
          )}
          <label>Tanggal Surat <input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label>
          <label>Tanggal Diterima <input name="received" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label>
          <label>
            Klasifikasi Arsip
            <select name="classification" value={classCode} onChange={(e) => setClassCode(e.target.value)}>
              {classifications.map(([code, label]) => (
                <option value={code} key={code}>{code} - {label}</option>
              ))}
            </select>
          </label>
          <label>
            Venue Olahraga (Bila Ada)
            <select name="venue">
              <option value="-">- Tidak Terkait Venue -</option>
              {venues.map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>
        </div>

        <div className="file-box mt-3 p-3 border-2 border-dashed rounded text-center">
          <input type="file" ref={fileInput} accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0])} />
          <button type="button" className="btn outline" onClick={() => fileInput.current?.click()}>
            <Icon name="file" size={14} /> Pilih Lampiran PDF
          </button>
          <span className="block text-xs text-slate-500 mt-1">{file ? `Terpilih: ${file.name}` : 'Format PDF maks 20 MB'}</span>
        </div>

        {kind === 'in' && <NewLetterDisposisiFields checks={checks} onToggleCheck={toggleCheck} />}

        <div className="modal-actions mt-4 flex justify-end gap-2">
          <button type="button" className="btn outline" onClick={onClose} disabled={saving}>Batal</button>
          <button type="submit" className="btn primary" disabled={saving}>
            <Icon name="check" /> {saving ? 'Menyimpan...' : 'Simpan Indeks Arsip'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
