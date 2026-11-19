'use client';

import { useRef, useEffect } from 'react';
import Icon from './Icon';
import { type PageScanConfig, renderImageToCanvas } from '@/lib/document-filter';

interface Props {
  page: PageScanConfig;
  index: number;
  total: number;
  isActive: boolean;
  image: HTMLImageElement | null;
  onSelect: (index: number) => void;
  onRotate: (index: number) => void;
  onRemove: (index: number) => void;
  registerCanvas: (index: number, el: HTMLCanvasElement | null) => void;
}

export default function ScannerPageCard({
  page,
  index,
  total,
  isActive,
  image,
  onSelect,
  onRotate,
  onRemove,
  registerCanvas,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!image || !canvas) return;
    renderImageToCanvas(image, canvas, page);
  }, [image, page]);

  useEffect(() => {
    if (isActive && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isActive]);

  return (
    <div
      ref={containerRef}
      id={`scanner-page-${index}`}
      className={`rounded-lg p-2.5 transition-all text-xs cursor-pointer ${
        isActive
          ? 'bg-slate-800 border-2 border-emerald-500 shadow-xl ring-2 ring-emerald-500/30'
          : 'bg-slate-900/90 border border-slate-700/80 opacity-80 hover:opacity-100'
      }`}
      onClick={() => onSelect(index)}
    >
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-700/60 text-slate-200">
        <div className="flex items-center gap-1.5 font-bold">
          <Icon name="file" size={13} />
          <span>Halaman {index + 1} dari {total}</span>
          {isActive ? (
            <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold ml-1">
              Aktif Diedit
            </span>
          ) : (
            <span className="text-slate-400 text-[10px] ml-1 font-normal">(Klik untuk edit)</span>
          )}
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-100 text-[11px] flex items-center gap-1 border border-slate-600 cursor-pointer"
            onClick={() => onRotate(index)}
            title="Putar halaman ini 90°"
          >
            <span className="text-xs leading-none">⟳</span>
            <span>Putar</span>
          </button>

          {total > 1 && (
            <button
              type="button"
              className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 cursor-pointer"
              onClick={() => onRemove(index)}
              title="Hapus halaman ini"
            >
              <Icon name="trash" size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[160px] max-h-[320px] overflow-hidden">
        {!image && <span className="text-slate-400 text-xs">Memuat foto...</span>}
        <canvas
          ref={(el) => {
            canvasRef.current = el;
            registerCanvas(index, el);
          }}
          className={`max-h-[310px] max-w-full object-contain shadow-md rounded ${!image ? 'hidden' : 'block'}`}
        />
      </div>
    </div>
  );
}
