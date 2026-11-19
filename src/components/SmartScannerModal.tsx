'use client';

import { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import ScannerPageNav from './ScannerPageNav';
import ScannerToolbar from './ScannerToolbar';
import ScannerPageCard from './ScannerPageCard';
import {
  type PageScanConfig,
  createDefaultPageConfig,
  canvasesToA4Pdf,
} from '@/lib/document-filter';

interface Props {
  files?: File[];
  file?: File;
  onApply: (processedPdf: File, pageCount: number) => void;
  onClose: () => void;
}

export default function SmartScannerModal({ files, file, onApply, onClose }: Props) {
  const initialFiles = files && files.length > 0 ? files : file ? [file] : [];
  const [pages, setPages] = useState<PageScanConfig[]>(() =>
    initialFiles.map((f) => createDefaultPageConfig(f))
  );
  const [pageIndex, setPageIndex] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [images, setImages] = useState<{ [id: string]: HTMLImageElement }>({});

  const canvasMapRef = useRef<{ [index: number]: HTMLCanvasElement | null }>({});

  const currentPage = pages[pageIndex] || pages[0];

  useEffect(() => {
    pages.forEach((p) => {
      if (images[p.id]) return;
      const img = new Image();
      const url = URL.createObjectURL(p.file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        setImages((prev) => ({ ...prev, [p.id]: img }));
      };
      img.src = url;
    });
  }, [pages, images]);

  const updateCurrent = (patch: Partial<PageScanConfig>) => {
    setPages((prev) => prev.map((p, idx) => (idx === pageIndex ? { ...p, ...patch } : p)));
  };

  const handleRotatePage = (index: number) => {
    setPages((prev) =>
      prev.map((p, idx) =>
        idx === index
          ? { ...p, rotation: ((p.rotation + 90) % 360) as 0 | 90 | 180 | 270 }
          : p
      )
    );
  };

  const handleApplyAll = () => {
    if (!currentPage) return;
    const { filterMode, brightness, contrast, cropTop, cropBottom, cropLeft, cropRight, rotation } = currentPage;
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        filterMode,
        brightness,
        contrast,
        cropTop,
        cropBottom,
        cropLeft,
        cropRight,
        rotation,
      }))
    );
  };

  const handleAddFiles = (newFiles: File[]) => {
    const newConfigs = newFiles.map((f) => createDefaultPageConfig(f));
    setPages((prev) => [...prev, ...newConfigs]);
    setPageIndex(pages.length);
  };

  const handleRemovePage = (indexToRemove: number) => {
    if (pages.length <= 1) return;
    setPages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setPageIndex((prev) => Math.max(0, Math.min(prev, pages.length - 2)));
  };

  const registerCanvas = (index: number, el: HTMLCanvasElement | null) => {
    canvasMapRef.current[index] = el;
  };

  const handleApply = async () => {
    if (pages.length === 0) return;
    setProcessing(true);
    try {
      const canvases: HTMLCanvasElement[] = [];
      for (let i = 0; i < pages.length; i++) {
        const c = canvasMapRef.current[i];
        if (c) canvases.push(c);
      }
      const pdf = await canvasesToA4Pdf(canvases, pages[0].file.name);
      onApply(pdf, pages.length);
    } catch (e) {
      console.error('Gagal membuat PDF:', e);
    } finally {
      setProcessing(false);
    }
  };

  if (!currentPage) return null;

  return (
    <Modal
      title="Smart Document Scanner (Pindai Bersih A4)"
      onClose={onClose}
      className="scanner-modal-popup"
    >
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
        <div className="flex-shrink-0 p-2.5 space-y-1.5 bg-white border-b border-slate-200">
          <ScannerPageNav
            currentIndex={pageIndex}
            total={pages.length}
            onSelect={setPageIndex}
            onAddFiles={handleAddFiles}
            onRemove={handleRemovePage}
            onApplyAll={handleApplyAll}
          />
          <ScannerToolbar page={currentPage} onUpdate={updateCurrent} />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 bg-slate-950">
          {pages.map((p, idx) => (
            <ScannerPageCard
              key={p.id}
              page={p}
              index={idx}
              total={pages.length}
              isActive={idx === pageIndex}
              image={images[p.id] || null}
              onSelect={setPageIndex}
              onRotate={handleRotatePage}
              onRemove={handleRemovePage}
              registerCanvas={registerCanvas}
            />
          ))}
        </div>

        <div className="flex-shrink-0 p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
            <span className="text-emerald-700">
              <Icon name="file" size={13} />
            </span>
            <span>
              {pages.length > 1
                ? `${pages.length} halaman foto otomatis digabung menjadi 1 dokumen PDF A4 resmi.`
                : '1 halaman foto otomatis dipindai bersih menjadi dokumen dinas PDF A4 resmi.'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn outline text-xs py-1.5 px-3 cursor-pointer"
              onClick={onClose}
              disabled={processing}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn primary text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              onClick={handleApply}
              disabled={processing}
            >
              {processing
                ? 'Memproses PDF...'
                : pages.length > 1
                ? `✓ Terapkan Hasil Scan (${pages.length} Halaman PDF A4)`
                : '✓ Terapkan Hasil Scan (PDF A4)'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
