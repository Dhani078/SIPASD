'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Modal from './Modal';
import ScannerPageNav from './ScannerPageNav';
import ScannerToolbar from './ScannerToolbar';
import {
  type PageScanConfig,
  createDefaultPageConfig,
  renderImageToCanvas,
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
  const [imageLoaded, setImageLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageMapRef = useRef<Map<File, HTMLImageElement>>(new Map());
  const activeImageRef = useRef<HTMLImageElement | null>(null);

  const currentPage = pages[pageIndex] || pages[0];

  const updateCurrent = (patch: Partial<PageScanConfig>) => {
    setPages((prev) => prev.map((p, idx) => (idx === pageIndex ? { ...p, ...patch } : p)));
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
    setPages((prev) => {
      const updated = [...prev, ...newConfigs];
      setPageIndex(prev.length);
      return updated;
    });
  };

  const handleRemovePage = (indexToRemove: number) => {
    if (pages.length <= 1) return;
    setPages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setPageIndex((prev) => Math.max(0, Math.min(prev, pages.length - 2)));
  };

  useEffect(() => {
    if (!currentPage) return;
    setImageLoaded(false);
    const existing = imageMapRef.current.get(currentPage.file);
    if (existing) {
      activeImageRef.current = existing;
      setImageLoaded(true);
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(currentPage.file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      imageMapRef.current.set(currentPage.file, img);
      activeImageRef.current = img;
      setImageLoaded(true);
    };
    img.src = url;
  }, [currentPage]);

  const render = useCallback(() => {
    const img = activeImageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !imageLoaded || !currentPage) return;
    renderImageToCanvas(img, canvas, currentPage);
  }, [imageLoaded, currentPage]);

  useEffect(() => {
    if (imageLoaded) render();
  }, [imageLoaded, render]);

  const handleApply = async () => {
    if (pages.length === 0) return;
    setProcessing(true);
    try {
      const canvases: HTMLCanvasElement[] = [];
      for (const p of pages) {
        let img = imageMapRef.current.get(p.file);
        if (!img) {
          img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const i = new Image();
            const u = URL.createObjectURL(p.file);
            i.onload = () => { URL.revokeObjectURL(u); resolve(i); };
            i.onerror = reject;
            i.src = u;
          });
          imageMapRef.current.set(p.file, img);
        }
        const c = document.createElement('canvas');
        renderImageToCanvas(img, c, p);
        canvases.push(c);
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
    <Modal title="Smart Document Scanner (Pindai Bersih A4)" onClose={onClose}>
      <div className="space-y-2 text-xs">
        <ScannerPageNav
          currentIndex={pageIndex}
          total={pages.length}
          onSelect={setPageIndex}
          onAddFiles={handleAddFiles}
          onRemove={handleRemovePage}
          onApplyAll={handleApplyAll}
        />

        <ScannerToolbar page={currentPage} onUpdate={updateCurrent} />

        <div className="bg-slate-900 rounded p-2 flex items-center justify-center min-h-[220px] max-h-[360px] overflow-auto">
          {!imageLoaded && <span className="text-slate-400">Memuat foto halaman...</span>}
          <canvas ref={canvasRef} className={`max-h-[340px] max-w-full object-contain shadow-lg rounded ${!imageLoaded ? 'hidden' : 'block'}`} />
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200">
          <span className="text-[11px] text-slate-500">
            {pages.length > 1
              ? `Otomatis menggabungkan ${pages.length} foto menjadi 1 berkas PDF A4 resmi.`
              : 'Otomatis menghilangkan bayangan & memutihkan latar kertas menjadi dokumen dinas resmi.'}
          </span>
          <div className="flex items-center gap-2">
            <button type="button" className="btn outline text-xs py-1.5 px-3 cursor-pointer" onClick={onClose} disabled={processing}>
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
