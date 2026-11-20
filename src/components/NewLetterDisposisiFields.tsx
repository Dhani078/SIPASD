'use client';

import { useId } from 'react';
import Icon from './Icon';
import { divisions } from '@/data/constants';
import LetterFileUpload from './LetterFileUpload';

interface Props {
  posisiSurat: string;
  onPosisiSuratChange: (item: string) => void;
  disposisiFile?: File | null;
  onDisposisiFileChange: (file: File | null) => void;
  defaultOfficial?: string;
}

export const POSISI_SURAT_OPTIONS = [
  'Diterima Persuratan',
  'Kepala Dinas',
  'Selesai',
] as const;

export default function NewLetterDisposisiFields({
  posisiSurat,
  onPosisiSuratChange,
  disposisiFile,
  onDisposisiFileChange,
  defaultOfficial = 'Pebriadin Hapiz, AP, M.Si',
}: Props) {
  const uid = useId();

  return (
    <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-3 mt-1">
      <div className="flex items-center justify-between">
        <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
          <Icon name="shield" size={13} className="text-emerald-700" /> Perekaman Lembar Disposisi Awal
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          SPBE Kalsel
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${uid}-off`} className="block text-[11px] font-semibold text-slate-700 mb-1">
            Pejabat Pendisposisi
          </label>
          <input
            id={`${uid}-off`}
            name="official"
            defaultValue={defaultOfficial}
            placeholder="Nama Pejabat"
            required
            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div>
          <label htmlFor={`${uid}-pos`} className="block text-[11px] font-semibold text-slate-700 mb-1">
            Posisi Surat Saat Ini
          </label>
          <select
            id={`${uid}-pos`}
            value={posisiSurat}
            onChange={(e) => onPosisiSuratChange(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
          >
            {POSISI_SURAT_OPTIONS.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${uid}-div`} className="block text-[11px] font-semibold text-slate-700 mb-1">
            Diteruskan Kepada (Bidang)
          </label>
          <select id={`${uid}-div`} name="disposisi_division" className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20">
            {divisions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${uid}-not`} className="block text-[11px] font-semibold text-slate-700 mb-1">
            Catatan / Instruksi Khusus
          </label>
          <input
            id={`${uid}-not`}
            name="notes"
            placeholder="Catatan pimpinan..."
            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      <div>
        <span className="block text-[11px] font-semibold text-slate-700 mb-1">
          Upload Scan Lembar Disposisi (PDF / Foto Opsional)
        </span>
        <LetterFileUpload
          file={disposisiFile || undefined}
          onFileChange={(f) => onDisposisiFileChange(f || null)}
          label="Pilih Scan PDF atau Foto Disposisi"
          hint="Tarik & lepas PDF/Foto disposisi (JPG/PNG otomatis jadi PDF A4)"
        />
      </div>
    </div>
  );
}
