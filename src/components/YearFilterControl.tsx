'use client';

import { useState } from 'react';

interface Props {
  value?: string;
  onChange: (year: string) => void;
}

export default function YearFilterControl({ value = '', onChange }: Props) {
  const [customYear, setCustomYear] = useState(false);
  const [customVal, setCustomVal] = useState('');

  if (customYear) {
    return (
      <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-1.5 py-0.5">
        <input
          type="text"
          placeholder="Cth: 2028 / 2000-2020 / 2027-2200"
          className="text-xs px-1.5 py-1 w-36 border border-slate-200 rounded"
          value={customVal}
          onChange={(e) => setCustomVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onChange(customVal.trim());
          }}
        />
        <button
          type="button"
          className="text-xs px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-medium"
          onClick={() => onChange(customVal.trim())}
        >
          Terapkan
        </button>
        <button
          type="button"
          className="text-xs text-slate-500 hover:text-slate-800 px-1"
          title="Kembali ke pilihan dropdown"
          onClick={() => {
            setCustomYear(false);
            setCustomVal('');
            onChange('');
          }}
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <select
      aria-label="Filter tahun anggaran"
      value={value}
      onChange={(e) => {
        if (e.target.value === 'custom') {
          setCustomYear(true);
        } else {
          onChange(e.target.value);
        }
      }}
    >
      <option value="">Semua Tahun Anggaran</option>
      <optgroup label="Tahun Anggaran Berjalan & Terdata">
        <option value="2026">TA 2026 (Aktif)</option>
        <option value="2025">TA 2025</option>
        <option value="2024">TA 2024</option>
      </optgroup>
      <optgroup label="Tahun Mendatang (Masa Depan)">
        <option value="2027">TA 2027</option>
        <option value="2028">TA 2028</option>
        <option value="2029">TA 2029</option>
        <option value="2030">TA 2030</option>
        <option value="2027-2200">TA 2027 - 2200 (Seterusnya)</option>
      </optgroup>
      <optgroup label="Rentang Periode Historis">
        <option value="2021-2025">Periode 2021 - 2025</option>
        <option value="2000-2020">Arsip 2000 - 2020</option>
        <option value="<2000">Arsip Sebelum 2000</option>
      </optgroup>
      <optgroup label="Pilihan Bebas">
        <option value="custom">Ketik Tahun Kustom...</option>
      </optgroup>
    </select>
  );
}