'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { applyDocumentFilter, canvasToA4Pdf, type ScannerFilterMode } from '@/lib/document-filter';

interface Props {
  file: File;
  onApply: (processedPdf: File) => void;
  onClose: () => void;
}

export default function SmartScannerModal({ file, onApply, onClose }: Props) {
  const [filterMode, setFilterMode] = useState<ScannerFilterMode>('magic');
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [cropTop, setCropTop] = useState(0);
  const [cropBottom, setCropBottom] = useState(0);
  const [cropLeft, setCropLeft] = useState(0);
  const [cropRight, setCropRight] = useState(0);
  const [brightness, setBrightness] = useState(15);
  const [contrast, setContrast] = useState(10);
  const [processing, setProcessing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      imageRef.current = img;
      setImageLoaded(true);
    };
    img.src = url;
  }, [file]);

  const render = useCallback(() => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !imageLoaded) return;

    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;

    const cutX = Math.round((cropLeft / 100) * naturalW);
    const cutY = Math.round((cropTop / 100) * naturalH);
    const cutW = Math.max(10, naturalW - cutX - Math.round((cropRight / 100) * naturalW));
    const cutH = Math.max(10, naturalH - cutY - Math.round((cropBottom / 100) * naturalH));

    const isRotated = rotation === 90 || rotation === 270;
    const targetW = isRotated ? cutH : cutW;
    const targetH = isRotated ? cutW : cutH;

    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, cutX, cutY, cutW, cutH, -cutW / 2, -cutH / 2, cutW, cutH);
    ctx.restore();

    applyDocumentFilter(ctx, targetW, targetH, filterMode, brightness, contrast);
  }, [imageLoaded, filterMode, rotation, cropTop, cropBottom, cropLeft, cropRight, brightness, contrast]);

  useEffect(() => {
    if (imageLoaded) {
      render();
    }
  }, [imageLoaded, render]);

  const handleApply = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setProcessing(true);
    try {
      const pdf = await canvasToA4Pdf(canvas, file.name);
      onApply(pdf);
    } catch (e) {
      console.error('Gagal membuat PDF:', e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal title="Smart Document Scanner (Pindai Bersih A4)" onClose={onClose}>
      <div className="space-y-2.5 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2 rounded border border-slate-200">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-slate-700 mr-1">Filter:</span>
            <button
              type="button"
              className={`px-2 py-1 rounded text-xs transition-all ${filterMode === 'magic' ? 'bg-emerald-600 text-white font-bold' : 'bg-white text-slate-700 border'}`}
              onClick={() => setFilterMode('magic')}
            >
              ✨ Magic Color (Bersih)
            </button>
            <button
              type="button"
              className={`px-2 py-1 rounded text-xs transition-all ${filterMode === 'bw' ? 'bg-emerald-600 text-white font-bold' : 'bg-white text-slate-700 border'}`}
              onClick={() => setFilterMode('bw')}
            >
              📄 Hitam Putih
            </button>
            <button
              type="button"
              className={`px-2 py-1 rounded text-xs transition-all ${filterMode === 'original' ? 'bg-emerald-600 text-white font-bold' : 'bg-white text-slate-700 border'}`}
              onClick={() => setFilterMode('original')}
            >
              📷 Foto Asli
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn outline py-1 px-2 text-xs flex items-center gap-1"
              onClick={() => setRotation((r) => ((r + 90) % 360) as 0 | 90 | 180 | 270)}
            >
              <span>🔄 Putar 90°</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2 rounded border border-slate-200 text-[11px]">
          <div>
            <label className="block text-slate-600">Potong Atas ({cropTop}%)</label>
            <input type="range" min="0" max="30" value={cropTop} onChange={(e) => setCropTop(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-slate-600">Potong Bawah ({cropBottom}%)</label>
            <input type="range" min="0" max="30" value={cropBottom} onChange={(e) => setCropBottom(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-slate-600">Potong Kiri ({cropLeft}%)</label>
            <input type="range" min="0" max="30" value={cropLeft} onChange={(e) => setCropLeft(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-slate-600">Potong Kanan ({cropRight}%)</label>
            <input type="range" min="0" max="30" value={cropRight} onChange={(e) => setCropRight(Number(e.target.value))} className="w-full" />
          </div>
        </div>

        <div className="max-h-[50vh] overflow-auto border rounded bg-slate-200 flex items-center justify-center p-2">
          <canvas ref={canvasRef} className="max-w-full max-h-[46vh] object-contain shadow-lg bg-white" />
        </div>

        <div className="modal-actions pt-2 flex items-center justify-between border-t border-slate-200">
          <span className="text-[11px] text-emerald-800 font-medium">
            Otomatis menghilangkan bayangan & memutihkan latar kertas menjadi dokumen dinas resmi.
          </span>
          <div className="flex gap-2">
            <button type="button" className="btn outline text-xs" onClick={onClose} disabled={processing}>
              Batal
            </button>
            <button
              type="button"
              className="btn primary text-xs flex items-center gap-1.5"
              onClick={handleApply}
              disabled={processing}
            >
              <Icon name="check" size={14} />
              <span>{processing ? 'Memproses PDF...' : '✓ Terapkan Hasil Scan (PDF A4)'}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
