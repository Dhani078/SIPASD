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
      className={`rounded-xl p-3 transition-all text-xs cursor-pointer ${
        isActive
          ? 'bg-slate-900 border-2 border-emerald-500 shadow-2xl ring-4 ring-emerald-500/20'
          : 'bg-slate-950/70 border border-slate-800/80 opacity-80 hover:opacity-100 hover:border-slate-700'
      }`}
      onClick={() => onSelect(index)}
    >
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800 text-slate-200">
        <div className="flex items-center gap-2 font-bold">
          <Icon name="file" size={13} />
          <span>Lembar {index + 1}</span>
          {isActive ? (
            <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold shadow-2xs">
              Aktif Diedit
            </span>
          ) : (
            <span className="text-slate-400 text-[10px] font-normal">(Klik untuk edit)</span>
          )}
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center gap-1 border border-slate-700 cursor-pointer"
            onClick={() => onRotate(index)}
            title="Putar halaman ini 90°"
          >
            <span className="text-xs leading-none">⟳</span>
            <span>Putar</span>
          </button>

          {total > 1 && (
            <button
              type="button"
              className="p-1 rounded text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 cursor-pointer transition-colors"
              onClick={() => onRemove(index)}
              title="Hapus lembar foto ini"
            >
              <Icon name="trash" size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center p-2 min-h-[220px] max-h-[460px] overflow-hidden">
        {!image && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Memproses pratinjau lembar kertas...</span>
          </div>
        )}
        <canvas
          ref={(el) => {
            canvasRef.current = el;
            registerCanvas(index, el);
          }}
          className={`max-h-[440px] max-w-full object-contain bg-white rounded shadow-2xl border border-slate-700/60 transition-transform duration-200 ${
            !image ? 'hidden' : 'block'
          }`}
        />
      </div>
    </div>
  );
}
