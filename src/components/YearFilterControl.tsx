'use client';

interface Props {
  value?: string;
  onChange: (year: string) => void;
}

export default function YearFilterControl({ value = '', onChange }: Props) {
  return (
    <select
      aria-label="Filter tahun anggaran"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-700 font-medium"
    >
      <option value="">Semua Tahun (TA)</option>
      <option value="2026">TA 2026 (Berjalan)</option>
      <option value="2025">TA 2025</option>
      <option value="2024">TA 2024</option>
      <option value="2027">TA 2027</option>
    </select>
  );
}
