'use client';

import { useId, useRef, useState } from 'react';
import { divisions } from '@/data/constants';
import Icon from './Icon';

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
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDrag, setIsDrag] = useState(false);

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
          <label htmlFor={`${uid}-div`} className="block text-[11px] font-semibold text-slate-700 mb-1">
            Diteruskan Kepada Bidang
          </label>
          <select id={`${uid}-div`} name="disposisi_division" className="w-full">
            {divisions.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-2.5">
        <span className="block text-[11px] font-semibold text-slate-700 mb-1.5">
          Posisi Surat:
        </span>
        <input type="hidden" name="posisi_surat" value={posisiSurat} />
        <div className="flex flex-wrap gap-2">
          {POSISI_SURAT_OPTIONS.map((item) => {
            const isSelected = posisiSurat === item;
            return (
              <button
                type="button"
                key={item}
                onClick={() => onPosisiSuratChange(item)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-600 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                    isSelected ? 'bg-white text-emerald-900' : 'border border-slate-300'
                  }`}
                >
                  {isSelected ? '✓' : ''}
                </span>
                <span>{item}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-2.5">
        <label htmlFor={`${uid}-notes`} className="block text-[11px] font-semibold text-slate-700 mb-1">
          Catatan Tertulis Pimpinan
        </label>
        <textarea
          id={`${uid}-notes`}
          name="notes"
          rows={2}
          placeholder="Tuliskan catatan disposisi khusus..."
          className="w-full p-2 border rounded text-xs"
        />
      </div>

      <div className="mt-2.5">
        <span className="block text-[11px] font-semibold text-slate-700 mb-1">
          Upload Scan Lembar Disposisi (PDF / Opsional)
        </span>
        <div
          className={`p-2.5 border border-dashed rounded text-center transition-all ${
            isDrag ? 'border-emerald-600 bg-emerald-50/70' : 'border-slate-300 bg-slate-50/60'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
          onDragLeave={() => setIsDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDrag(false);
            const dropped = e.dataTransfer.files?.[0];
            if (dropped && dropped.name.toLowerCase().endsWith('.pdf')) onDisposisiFileChange(dropped);
          }}
        >
          <input
            type="file"
            ref={fileRef}
            accept="application/pdf"
            className="hidden"
            onChange={(e) => onDisposisiFileChange(e.target.files?.[0] || null)}
          />
          {disposisiFile ? (
            <div className="flex items-center justify-center gap-2 text-xs text-emerald-900 bg-emerald-100 py-1 px-2.5 rounded">
              <Icon name="file" size={13} />
              <span className="font-semibold truncate max-w-xs">{disposisiFile.name}</span>
              <span className="text-emerald-700 text-[10px]">({(disposisiFile.size / 1024).toFixed(0)} KB)</span>
              <button
                type="button"
                className="ml-1 text-red-600 hover:text-red-800 text-xs font-bold"
                onClick={() => onDisposisiFileChange(null)}
                title="Hapus berkas disposisi"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                className="btn outline text-xs py-1 px-2.5 flex items-center gap-1"
                onClick={() => fileRef.current?.click()}
              >
                <Icon name="file" size={13} /> Pilih PDF Disposisi
              </button>
              <span className="text-[11px] text-slate-500">
                {isDrag ? 'Lepaskan PDF di sini...' : 'Scan fisik disposisi (opsional, maks 20 MB)'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
