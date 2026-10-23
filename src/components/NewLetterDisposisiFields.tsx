'use client';

import { useId } from 'react';
import { divisions } from '@/data/constants';

interface Props {
  checks: string[];
  onToggleCheck: (item: string) => void;
  defaultOfficial?: string;
}

const INSTRUCTION_OPTIONS = [
  'Tindak Lanjuti',
  'Hadiri / Wakili',
  'Pelajari',
  'Koordinasikan',
  'Arsipkan',
];

export default function NewLetterDisposisiFields({
  checks,
  onToggleCheck,
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
          Instruksi Kedinasan:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {INSTRUCTION_OPTIONS.map((item) => {
            const isChecked = checks.includes(item);
            return (
              <label
                key={item}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer border transition-all ${
                  isChecked
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-600'
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isChecked}
                  onChange={() => onToggleCheck(item)}
                />
                <span
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    isChecked ? 'bg-white text-emerald-900' : 'border border-slate-300'
                  }`}
                >
                  {isChecked ? '✓' : ''}
                </span>
                <span>{item}</span>
              </label>
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
    </div>
  );
}
