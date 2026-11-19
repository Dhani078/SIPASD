'use client';

import { useState } from 'react';
import type { PageScanConfig, ScannerFilterMode } from '@/lib/document-filter';

interface Props {
  page: PageScanConfig;
  onUpdate: (patch: Partial<PageScanConfig>) => void;
}

export default function ScannerToolbar({ page, onUpdate }: Props) {
  const [showCrop, setShowCrop] = useState(false);
  const hasCrop = page.cropTop > 0 || page.cropBottom > 0 || page.cropLeft > 0 || page.cropRight > 0;

  const filterBtnClass = (mode: ScannerFilterMode) =>
    `px-2.5 py-1 rounded text-xs transition-all font-medium cursor-pointer ${
      page.filterMode === mode
        ? 'bg-emerald-600 text-white font-bold shadow-xs'
        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
    }`;

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-600 text-xs mr-0.5">Filter:</span>
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

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
              showCrop || hasCrop
                ? 'bg-emerald-100 border border-emerald-400 text-emerald-950 shadow-2xs'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
            onClick={() => setShowCrop((v) => !v)}
            title="Tampilkan / sembunyikan pengatur pangkas tepi"
          >
            <span>✂ Pangkas Tepi</span>
            {hasCrop && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
          </button>

          <button
            type="button"
            className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:bg-slate-100 flex items-center gap-1 font-semibold text-slate-700 cursor-pointer text-xs"
            onClick={() => onUpdate({ rotation: ((page.rotation + 90) % 360) as 0 | 90 | 180 | 270 })}
            title="Putar halaman 90 derajat searah jarum jam"
          >
            <span className="text-sm leading-none">⟳</span>
            <span>Putar 90°</span>
          </button>
        </div>
      </div>

      {(showCrop || hasCrop) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200 text-[11px] animate-fadeIn">
          <label className="flex flex-col">
            <div className="flex justify-between text-slate-700 font-medium">
              <span>Atas</span>
              <span>{page.cropTop}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={page.cropTop}
              className="accent-emerald-600 cursor-pointer"
              onChange={(e) => onUpdate({ cropTop: Number(e.target.value) })}
            />
          </label>
          <label className="flex flex-col">
            <div className="flex justify-between text-slate-700 font-medium">
              <span>Bawah</span>
              <span>{page.cropBottom}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={page.cropBottom}
              className="accent-emerald-600 cursor-pointer"
              onChange={(e) => onUpdate({ cropBottom: Number(e.target.value) })}
            />
          </label>
          <label className="flex flex-col">
            <div className="flex justify-between text-slate-700 font-medium">
              <span>Kiri</span>
              <span>{page.cropLeft}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={page.cropLeft}
              className="accent-emerald-600 cursor-pointer"
              onChange={(e) => onUpdate({ cropLeft: Number(e.target.value) })}
            />
          </label>
          <label className="flex flex-col">
            <div className="flex justify-between text-slate-700 font-medium">
              <span>Kanan</span>
              <span>{page.cropRight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={page.cropRight}
              className="accent-emerald-600 cursor-pointer"
              onChange={(e) => onUpdate({ cropRight: Number(e.target.value) })}
            />
          </label>
        </div>
      )}
    </div>
  );
}
