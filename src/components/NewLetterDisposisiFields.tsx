'use client';

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
  return (
    <div className="disposition-fields border-t border-slate-200 pt-4 mt-4">
      <h3 className="font-semibold text-emerald-950 mb-3 text-sm">
        Perekaman Lembar Disposisi Awal
      </h3>
      <div className="form-grid">
        <label>
          Pejabat Pendisposisi
          <input
            name="official"
            defaultValue={defaultOfficial}
            placeholder="Nama Pejabat"
            required
          />
        </label>
        <label>
          Diteruskan Kepada Bidang
          <select name="disposisi_division">
            {divisions.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3">
        <span className="block text-xs font-semibold text-slate-700 mb-2">
          Instruksi Kedinasan:
        </span>
        <div className="flex flex-wrap gap-2">
          {INSTRUCTION_OPTIONS.map((item) => (
            <label
              key={item}
              className={`px-3 py-1.5 rounded text-xs cursor-pointer border transition-colors ${
                checks.includes(item)
                  ? 'bg-emerald-900 text-white border-emerald-900'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checks.includes(item)}
                onChange={() => onToggleCheck(item)}
              />
              {checks.includes(item) ? '[X] ' : '[ ] '}
              {item}
            </label>
          ))}
        </div>
      </div>

      <label className="block mt-3">
        Catatan Tertulis Pimpinan
        <textarea
          name="notes"
          rows={2}
          placeholder="Tuliskan catatan disposisi khusus..."
          className="w-full mt-1 p-2 border rounded text-xs"
        />
      </label>
    </div>
  );
}
