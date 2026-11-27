'use client';

import { useId, useState, useEffect } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import NewLetterDisposisiFields from './NewLetterDisposisiFields';
import LetterFileUpload from './LetterFileUpload';
import UploadProgressBar from './UploadProgressBar';
import { classifications, venues, divisions } from '@/data/constants';
import { classifyText, type ClassificationResult } from '@/lib/classifier';
import { getWorkdayIndex, format5Digit, calculateNextWorkdayAgenda } from '@/lib/workday-slot';
import { todayWitaString } from '@/lib/format';
import type { UploadProgress } from '@/hooks/useLetterActions';
import type { Direction, LetterRecord, Urgency, DemoUser } from '@/types';

interface Props {
  direction: Direction;
  onClose: () => void;
  onSave: (letter: Omit<LetterRecord, 'id'>, file?: File, dispFile?: File, onProgress?: (p: UploadProgress) => void) => Promise<void> | void;
  letters?: LetterRecord[];
  user?: DemoUser;
}

export default function NewLetterModal({ direction, onClose, onSave, letters, user }: Props) {
  const isMagangMasuk = user?.username === 'magang_masuk' || user?.label === 'Magang Surat Masuk';
  const isMagangKeluar = user?.username === 'magang_keluar' || user?.label === 'Magang Surat Keluar';
  const initialKind: Direction = isMagangKeluar ? 'out' : isMagangMasuk ? 'in' : direction;
  const [kind, setKind] = useState<Direction>(initialKind);
  const [file, setFile] = useState<File>(), [dispFile, setDispFile] = useState<File | null>(null);
  const [error, setError] = useState(''), [saving, setSaving] = useState(false);
  const [uploadProg, setUploadProg] = useState<UploadProgress | null>(null);
  const [posisiSurat, setPosisiSurat] = useState('Diterima Persuratan');
  const [aiRec, setAiRec] = useState<ClassificationResult | null>(null), [classCode, setClassCode] = useState('005');
  const [classList, setClassList] = useState<Array<[string, string]>>(() => classifications.map(([c, n]) => [c, n]));
  const [today] = useState(() => todayWitaString());
  const [pickedDate, setPickedDate] = useState(() => todayWitaString());
  const [numMode, setNumMode] = useState<'auto' | 'manual'>('auto'), [manualNum, setManualNum] = useState('');
  const uid = useId();

  useEffect(() => {
    fetch('/api/classification').then((r) => r.json()).then((res) => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setClassList(res.data.map((r: { kode: string; nama_klasifikasi: string }) => [String(r.kode), String(r.nama_klasifikasi)]));
      }
    }).catch(() => {});
  }, []);

  const [pY, pM, pD] = pickedDate.split('-').map(Number);
  const safeYear = !isNaN(pY) && pY >= 2000 && pY <= 2200 ? pY : 2026;
  const wDay = getWorkdayIndex(safeYear, pM || 1, pD || 1), sStart = (wDay - 1) * 50 + 1, sEnd = wDay * 50;
  const existingAgendas = (letters || []).filter((l) => l.direction === kind).map((l) => `${l.id}/${kind.toUpperCase()}/DISPORA/${l.date?.slice(0, 4) || safeYear}`);
  const currentSlot = calculateNextWorkdayAgenda(pickedDate, kind, existingAgendas).agendaNumber.split('/')[0];
  const autoNum = `${classCode}/${currentSlot}/DISPORA/${safeYear}`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
        date: val('date') || today, direction: kind, classification: classCode, venue: val('venue') || '-',
        division: (kind === 'out' ? val('division') : val('disposisi_division')) || 'Sekretariat',
        type: (val('urgency') || 'Biasa') as Urgency,
        disposition: {
          official: val('official') || 'Pebriadin Hapiz, AP, M.Si', date: val('received') || today,
          division: val('disposisi_division') || 'Sekretariat', instructions: [posisiSurat],
          notes: val('notes') || '', status: dStatus,
        },
      }, file, dispFile || undefined, setUploadProg);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan arsip.');
    } finally {
      setSaving(false);
      setUploadProg(null);
    }
  }

  return (
    <Modal title="Indeks Berkas Baru" onClose={onClose} className="max-w-2xl">
      <form className="flex flex-col flex-1 min-h-0 overflow-hidden" onSubmit={handleSubmit}>
        <div className="p-5 space-y-3.5 max-h-[72vh] overflow-y-auto text-xs text-slate-700 pb-6">
          {error && <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2"><Icon name="close" size={14} /><span>{error}</span></div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor={`${uid}-kind`} className="block text-[11px] font-semibold text-slate-700 mb-1">Jenis Arsip</label>
              <select id={`${uid}-kind`} name="direction" value={kind} disabled={isMagangMasuk || isMagangKeluar} onChange={(e) => setKind(e.target.value as Direction)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-emerald-600 outline-none">
                {!isMagangKeluar && <option value="in">Surat Masuk</option>}
                {!isMagangMasuk && <option value="out">Surat Keluar</option>}
              </select>
            </div>
            <div>
              <label htmlFor={`${uid}-urg`} className="block text-[11px] font-semibold text-slate-700 mb-1">Sifat Surat</label>
              <select id={`${uid}-urg`} name="urgency" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-emerald-600 outline-none"><option>Biasa</option><option>Penting</option><option>Segera</option><option>Kilat</option></select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              {numMode === 'auto' ? (
                <>
                  <label htmlFor={`${uid}-num`} className="block text-[11px] font-semibold text-slate-700 mb-1">Nomor Surat</label>
                  <select id={`${uid}-num`} name="number" value={autoNum} onChange={(e) => { if (e.target.value === '__manual__') { setNumMode('manual'); setManualNum(autoNum); } }} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-xs cursor-pointer focus:border-emerald-600 outline-none">
                    <option value={autoNum}>{autoNum} (Otomatis)</option><option value="__manual__">Ketik Nomor Manual...</option>
                  </select>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor={`${uid}-num`} className="block text-[11px] font-semibold text-slate-700">Nomor Surat</label>
                    <button type="button" onClick={() => setNumMode('auto')} className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold underline">Otomatis</button>
                  </div>
                  <input id={`${uid}-num`} name="number" required autoFocus value={manualNum} onChange={(e) => setManualNum(e.target.value)} placeholder="Ketik nomor surat manual..." className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-xs focus:border-emerald-600 outline-none" />
                </>
              )}
            </div>
            <div>
              <label htmlFor={`${uid}-orig`} className="block text-[11px] font-semibold text-slate-700 mb-1">{kind === 'in' ? 'Asal Instansi / Pengirim' : 'Tujuan Instansi'}</label>
              <input id={`${uid}-orig`} name="origin" required placeholder="Nama instansi kedinasan" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-emerald-600 outline-none" />
            </div>
          </div>

          <div>
            <label htmlFor={`${uid}-subj`} className="block text-[11px] font-semibold text-slate-700 mb-1">Perihal Naskah</label>
            <input id={`${uid}-subj`} name="subject" required placeholder="Ringkasan perihal naskah..." onChange={(e) => setAiRec(e.target.value.trim().length >= 4 ? classifyText(e.target.value) : null)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-emerald-600 outline-none" />
          </div>

          {aiRec && (
            <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between text-xs">
              <span><b className="text-emerald-900">Rekomendasi AI:</b> {aiRec.code} ({aiRec.name}) - {aiRec.confidence}% cocok</span>
              <button type="button" className="btn primary py-1 px-2.5 text-xs" onClick={() => setClassCode(aiRec.code)}>Terapkan</button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor={`${uid}-date`} className="block text-[11px] font-semibold text-slate-700 mb-1">Tanggal Surat</label>
              <input id={`${uid}-date`} name="date" type="date" defaultValue={today} required className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-emerald-600 outline-none" />
            </div>
            <div>
              <label htmlFor={`${uid}-rec`} className="block text-[11px] font-semibold text-slate-700 mb-1">{kind === 'in' ? 'Tanggal Diterima' : 'Tanggal Diterbitkan'}</label>
              <input id={`${uid}-rec`} name="received" type="date" value={pickedDate} onChange={(e) => setPickedDate(e.target.value)} required className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-emerald-600 outline-none" />
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 px-3 py-1.5 rounded-lg flex items-center justify-between text-[11px]">
            <span><b>Hari Kerja ke-{wDay}:</b> Slot Agenda {format5Digit(sStart)} s.d. {format5Digit(sEnd)}</span>
            <span className="font-mono font-bold text-emerald-800">5 Digit (Blok 50)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor={`${uid}-cls`} className="block text-[11px] font-semibold text-slate-700 mb-1">Klasifikasi Arsip</label>
              <select id={`${uid}-cls`} name="classification" value={classCode} onChange={(e) => setClassCode(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-emerald-600 outline-none">
                {classList.map(([code, label]) => (<option value={code} key={code}>{code} - {label}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor={`${uid}-ven`} className="block text-[11px] font-semibold text-slate-700 mb-1">Venue Olahraga</label>
              <select id={`${uid}-ven`} name="venue" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-emerald-600 outline-none"><option value="-">- Tidak Terkait Venue -</option>{venues.map((v) => <option key={v}>{v}</option>)}</select>
            </div>
          </div>

          {kind === 'out' && (
            <div>
              <label htmlFor={`${uid}-div`} className="block text-[11px] font-semibold text-slate-700 mb-1">Bidang Pemrakarsa / Pengusul</label>
              <select id={`${uid}-div`} name="division" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-emerald-600 outline-none">{divisions.map((d) => <option key={d} value={d}>{d}</option>)}</select>
            </div>
          )}

          <LetterFileUpload file={file} onFileChange={setFile} />

          {kind === 'in' && (
            <NewLetterDisposisiFields posisiSurat={posisiSurat} onPosisiSuratChange={setPosisiSurat} disposisiFile={dispFile} onDisposisiFileChange={setDispFile} />
          )}
          {uploadProg && <UploadProgressBar progress={uploadProg} />}
        </div>

        <div className="modal-actions">
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Icon name="shield" size={13} className="text-emerald-700" /> Standar SPBE Dispora Kalsel
          </span>
          <button type="button" className="btn outline" onClick={onClose} disabled={saving}>Batal</button>
          <button type="submit" className="btn primary flex items-center gap-1.5 shadow-sm" disabled={saving}>
            {saving ? <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Icon name="check" size={14} />}
            <span>{saving ? 'Menyimpan...' : 'Simpan Indeks Arsip'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
