'use client';

import { useId } from 'react';
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
    <div className="disposition-fields border-t border-slate-200 pt-3 mt-1">
      <h3 className="font-semibold text-emerald-950 mb-2.5 text-xs flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
        Perekaman Lembar Disposisi Awal
      </h3>
      <div className="form-grid">
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
            className="w-full"
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
            className="w-full"
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
          <select id={`${uid}-div`} name="disposisi_division" className="w-full">
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
            className="w-full"
          />
        </div>
      </div>

      <div className="mt-2.5">
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
