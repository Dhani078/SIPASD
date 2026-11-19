'use client';

import { useRef } from 'react';
import Icon from './Icon';
import { isImageFile } from '@/lib/image-to-pdf';

interface Props {
  currentIndex: number;
  total: number;
  onSelect: (index: number) => void;
  onAddFiles: (newFiles: File[]) => void;
  onRemove: (index: number) => void;
  onApplyAll: () => void;
}

export default function ScannerPageNav({
  currentIndex,
  total,
  onSelect,
  onAddFiles,
  onRemove,
  onApplyAll,
}: Props) {
  const addInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const images = Array.from(e.target.files).filter((f) => isImageFile(f));
    if (images.length > 0) {
      onAddFiles(images);
    }
    e.target.value = '';
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-emerald-50/80 border border-emerald-200 rounded text-xs">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="font-bold text-emerald-950 flex items-center gap-1">
          <Icon name="file" size={13} />
          <span>Halaman {currentIndex + 1} dari {total}</span>
        </span>

        <div className="flex items-center gap-1 ml-1">
          <button
            type="button"
            className="p-1 px-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40"
            disabled={currentIndex === 0}
            onClick={() => onSelect(currentIndex - 1)}
            title="Halaman sebelumnya"
          >
            ◀
          </button>

          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`w-6 h-6 rounded text-center font-bold text-xs transition-all ${
                i === currentIndex
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
              onClick={() => onSelect(i)}
            >
              {i + 1}
            </button>
          ))}

          <button
            type="button"
            className="p-1 px-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40"
            disabled={currentIndex === total - 1}
            onClick={() => onSelect(currentIndex + 1)}
            title="Halaman selanjutnya"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <input
          type="file"
          ref={addInputRef}
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100 font-semibold cursor-pointer"
          onClick={() => addInputRef.current?.click()}
          title="Tambah foto halaman lain untuk digabung ke PDF ini"
        >
          <span>+ Tambah Foto</span>
        </button>

        {total > 1 && (
          <button
            type="button"
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white text-rose-700 border border-rose-300 hover:bg-rose-50 cursor-pointer"
            onClick={() => onRemove(currentIndex)}
            title="Hapus foto halaman ini"
          >
            <Icon name="trash" size={12} />
            <span>Hapus Hal</span>
          </button>
        )}

        {total > 1 && (
          <button
            type="button"
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-700 text-white hover:bg-emerald-800 font-medium cursor-pointer"
            onClick={onApplyAll}
            title="Samakan filter dan pencerah ke semua halaman"
          >
            <span>Terapkan ke Semua</span>
          </button>
        )}
      </div>
    </div>
  );
}
