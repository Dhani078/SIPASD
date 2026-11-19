'use client';

import Icon from './Icon';
import type { PageScanConfig, ScannerFilterMode } from '@/lib/document-filter';

interface Props {
  page: PageScanConfig;
  onUpdate: (patch: Partial<PageScanConfig>) => void;
}

export default function ScannerToolbar({ page, onUpdate }: Props) {
  const filterBtnClass = (mode: ScannerFilterMode) =>
    `px-2 py-1 rounded text-xs transition-all ${
      page.filterMode === mode
        ? 'bg-emerald-600 text-white font-bold'
        : 'bg-white text-slate-700 border hover:bg-slate-50'
    }`;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2 rounded border border-slate-200">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-slate-700 mr-1">Filter:</span>
          <button type="button" className={filterBtnClass('magic')} onClick={() => onUpdate({ filterMode: 'magic' })}>
            Magic Color (Bersih)
          </button>
          <button type="button" className={filterBtnClass('bw')} onClick={() => onUpdate({ filterMode: 'bw' })}>
            Hitam Putih
          </button>
          <button type="button" className={filterBtnClass('original')} onClick={() => onUpdate({ filterMode: 'original' })}>
            Foto Asli
          </button>
        </div>
        <button
          type="button"
          className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:bg-slate-100 flex items-center gap-1 font-semibold text-slate-700 cursor-pointer"
          onClick={() => onUpdate({ rotation: ((page.rotation + 90) % 360) as 0 | 90 | 180 | 270 })}
        >
          <span className="text-sm leading-none">⟳</span>
          <span>Putar 90°</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2 rounded border border-slate-200 text-[11px]">
        <label className="flex flex-col">
          <span className="text-slate-600">Potong Atas ({page.cropTop}%)</span>
          <input
            type="range"
            min="0"
            max="40"
            value={page.cropTop}
            onChange={(e) => onUpdate({ cropTop: Number(e.target.value) })}
          />
        </label>
        <label className="flex flex-col">
          <span className="text-slate-600">Potong Bawah ({page.cropBottom}%)</span>
          <input
            type="range"
            min="0"
            max="40"
            value={page.cropBottom}
            onChange={(e) => onUpdate({ cropBottom: Number(e.target.value) })}
          />
        </label>
        <label className="flex flex-col">
          <span className="text-slate-600">Potong Kiri ({page.cropLeft}%)</span>
          <input
            type="range"
            min="0"
            max="40"
            value={page.cropLeft}
            onChange={(e) => onUpdate({ cropLeft: Number(e.target.value) })}
          />
        </label>
        <label className="flex flex-col">
          <span className="text-slate-600">Potong Kanan ({page.cropRight}%)</span>
          <input
            type="range"
            min="0"
            max="40"
            value={page.cropRight}
            onChange={(e) => onUpdate({ cropRight: Number(e.target.value) })}
          />
        </label>
      </div>
    </>
  );
}
