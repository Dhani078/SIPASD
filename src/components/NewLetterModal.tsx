'use client';

import { useId, useRef, useState } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import NewLetterDisposisiFields from './NewLetterDisposisiFields';
import { classifications, venues, divisions } from '@/data/constants';
import { classifyText, type ClassificationResult } from '@/lib/classifier';
import { getWorkdayIndex, format5Digit, calculateNextWorkdayAgenda } from '@/lib/workday-slot';
import type { Direction, LetterRecord, Urgency } from '@/types';

interface Props {
  direction: Direction;
  onClose: () => void;
  onSave: (letter: Omit<LetterRecord, 'id'>, file?: File, dispFile?: File) => Promise<void> | void;
  letters?: LetterRecord[];
}

export default function NewLetterModal({ direction, onClose, onSave, letters }: Props) {
  const [kind, setKind] = useState<Direction>(direction);
  const [file, setFile] = useState<File>();
  const [dispFile, setDispFile] = useState<File | null>(null);
  const [isDrag, setIsDrag] = useState(false);
  const [error, setError] = useState('');
  const [posisiSurat, setPosisiSurat] = useState('Diterima Persuratan');
  const [saving, setSaving] = useState(false);
  const [aiRec, setAiRec] = useState<ClassificationResult | null>(null);
  const [classCode, setClassCode] = useState('005');
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const [pickedDate, setPickedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [numMode, setNumMode] = useState<'auto' | 'manual'>('auto');
  const [manualNum, setManualNum] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const uid = useId();

  const [pY, pM, pD] = pickedDate.split('-').map(Number);
  const safeYear = !isNaN(pY) && pY >= 2000 && pY <= 2200 ? pY : 2026;
  const wDay = getWorkdayIndex(safeYear, pM || 1, pD || 1);
  const sStart = (wDay - 1) * 50 + 1, sEnd = wDay * 50;
  const existingAgendas = (letters || []).filter((l) => l.direction === kind).map((l) => `${l.id}/${kind.toUpperCase()}/DISPORA/${l.date?.slice(0, 4) || safeYear}`);
  const nextSlotInfo = calculateNextWorkdayAgenda(pickedDate, kind, existingAgendas);
  const currentSlot = nextSlotInfo.agendaNumber.split('/')[0];
  const autoNum = `${classCode}/${currentSlot}/DISPORA/${safeYear}`;

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
            const dStatus = posisiSurat === 'Diterima Persuratan' ? 'BELUM_DIPROSES' : posisiSurat === 'Kepala Dinas' ? 'PROSES' : 'SELESAI';
            await onSave({
              number: val('number'), origin: val('origin'), subject: val('subject'),
              date: val('date') || today, direction: kind, classification: classCode,
              venue: val('venue') || '-', division: (kind === 'out' ? val('division') : val('disposisi_division')) || 'Sekretariat',
              type: (val('urgency') || 'Biasa') as Urgency,
              disposition: {
                official: val('official') || 'Pebriadin Hapiz, AP, M.Si', date: val('received') || today,
                division: val('disposisi_division') || 'Sekretariat', instructions: [posisiSurat],
                notes: val('notes') || '', status: dStatus,
              },
            }, file, dispFile || undefined);
            onClose();
          } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Gagal menyimpan arsip.');
          } finally {
            setSaving(false);
          }
        }}
      >
        {error && <div className="p-2 mb-2 bg-red-100 text-red-700 rounded text-xs">{error}</div>}
        <div className="form-grid">
          <div>
            <label htmlFor={`${uid}-kind`} className="block text-[11px] font-semibold text-slate-700 mb-1">Jenis Arsip</label>
            <select id={`${uid}-kind`} name="direction" value={kind} onChange={(e) => setKind(e.target.value as Direction)} className="w-full"><option value="in">Surat Masuk</option><option value="out">Surat Keluar</option></select>
          </div>
          <div>
            <label htmlFor={`${uid}-urg`} className="block text-[11px] font-semibold text-slate-700 mb-1">Sifat Surat</label>
            <select id={`${uid}-urg`} name="urgency" className="w-full"><option>Biasa</option><option>Penting</option><option>Segera</option><option>Kilat</option></select>
          </div>
          <div>
            {numMode === 'auto' ? (
              <>
                <label htmlFor={`${uid}-num`} className="block text-[11px] font-semibold text-slate-700 mb-1">Nomor Surat</label>
                <select id={`${uid}-num`} name="number" value={autoNum} onChange={(e) => { if (e.target.value === '__manual__') { setNumMode('manual'); setManualNum(autoNum); } }} className="w-full font-mono text-xs cursor-pointer">
                  <option value={autoNum}>{autoNum} (Otomatis)</option>
                  <option value="__manual__">✏️ Ketik Nomor Manual...</option>
                </select>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor={`${uid}-num`} className="block text-[11px] font-semibold text-slate-700">Nomor Surat</label>
                  <button type="button" onClick={() => setNumMode('auto')} className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold underline">↺ Otomatis</button>
                </div>
                <input id={`${uid}-num`} name="number" required autoFocus value={manualNum} onChange={(e) => setManualNum(e.target.value)} placeholder="Ketik nomor surat manual..." className="w-full font-mono text-xs" />
              </>
            )}
          </div>
          <div>
            <label htmlFor={`${uid}-orig`} className="block text-[11px] font-semibold text-slate-700 mb-1">{kind === 'in' ? 'Asal Instansi / Pengirim' : 'Tujuan Instansi'}</label>
            <input id={`${uid}-orig`} name="origin" required placeholder="Nama instansi kedinasan" className="w-full" />
          </div>
          <div className="col-span-2">
            <label htmlFor={`${uid}-subj`} className="block text-[11px] font-semibold text-slate-700 mb-1">Perihal</label>
            <input id={`${uid}-subj`} name="subject" required placeholder="Ringkasan perihal..." onChange={(e) => setAiRec(e.target.value.trim().length >= 4 ? classifyText(e.target.value) : null)} className="w-full" />
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
            <label htmlFor={`${uid}-rec`} className="block text-[11px] font-semibold text-slate-700 mb-1">{kind === 'in' ? 'Tanggal Diterima' : 'Tanggal Diterbitkan'}</label>
            <input id={`${uid}-rec`} name="received" type="date" value={pickedDate} onChange={(e) => setPickedDate(e.target.value)} required className="w-full" />
          </div>
          <div className="col-span-2 bg-emerald-50 border border-emerald-200 text-emerald-950 px-2.5 py-1 rounded flex items-center justify-between text-[11px]">
            <span><b>Hari Kerja ke-{wDay}:</b> Slot Agenda {format5Digit(sStart)} s.d. {format5Digit(sEnd)}</span>
            <span className="font-mono font-bold text-emerald-800">5 Digit (Blok 50)</span>
          </div>
          <div>
            <label htmlFor={`${uid}-cls`} className="block text-[11px] font-semibold text-slate-700 mb-1">Klasifikasi Arsip</label>
            <select id={`${uid}-cls`} name="classification" value={classCode} onChange={(e) => setClassCode(e.target.value)} className="w-full">
              {classifications.map(([code, label]) => (<option value={code} key={code}>{code} - {label}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor={`${uid}-ven`} className="block text-[11px] font-semibold text-slate-700 mb-1">Venue Olahraga</label>
            <select id={`${uid}-ven`} name="venue" className="w-full"><option value="-">- Tidak Terkait Venue -</option>{venues.map((v) => <option key={v}>{v}</option>)}</select>
          </div>
          {kind === 'out' && (
            <div className="col-span-2">
              <label htmlFor={`${uid}-div`} className="block text-[11px] font-semibold text-slate-700 mb-1">Bidang Pemrakarsa / Pengusul</label>
              <select id={`${uid}-div`} name="division" className="w-full">{divisions.map((d) => <option key={d} value={d}>{d}</option>)}</select>
            </div>
          )}
        </div>

        <div
          className={`file-box mt-2 p-3 border-2 border-dashed rounded text-center transition-all ${isDrag ? 'border-emerald-600 bg-emerald-50/70' : 'border-slate-300 bg-slate-50/50'}`}
          onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
          onDragLeave={() => setIsDrag(false)}
          onDrop={(e) => { e.preventDefault(); setIsDrag(false); const f = e.dataTransfer.files?.[0]; if (f?.name.toLowerCase().endsWith('.pdf')) setFile(f); }}
        >
          <input type="file" ref={fileInput} accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0])} />
          {file ? (
            <div className="flex items-center justify-center gap-2 text-xs text-emerald-900 bg-emerald-100 py-1.5 px-3 rounded">
              <Icon name="file" size={14} /><span className="font-semibold truncate max-w-xs">{file.name}</span>
              <span className="text-emerald-700 text-[11px]">({(file.size / 1024).toFixed(0)} KB)</span>
              {file.size > 4 * 1024 * 1024 && <span className="bg-amber-200 text-amber-900 text-[10px] px-1 rounded font-medium">Auto-Kompres</span>}
              <button type="button" className="ml-1 text-red-600 hover:text-red-800" onClick={() => setFile(undefined)} title="Hapus berkas">✕</button>
            </div>
          ) : (
            <>
              <button type="button" className="btn outline" onClick={() => fileInput.current?.click()}><Icon name="file" size={14} /> Pilih Lampiran PDF</button>
              <span className="block text-xs text-slate-500 mt-1">{isDrag ? 'Lepaskan berkas PDF di sini...' : 'Tarik & lepas PDF di sini atau klik pilih (maks 20 MB)'}</span>
            </>
          )}
        </div>

        {kind === 'in' && (
          <NewLetterDisposisiFields
            posisiSurat={posisiSurat}
            onPosisiSuratChange={setPosisiSurat}
            disposisiFile={dispFile}
            onDisposisiFileChange={setDispFile}
          />
        )}

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
