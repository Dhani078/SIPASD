'use client';

import { useRef, useState } from 'react';
import Icon from './Icon';
import SmartScannerModal from './SmartScannerModal';
import { isImageFile } from '@/lib/image-to-pdf';

interface Props {
  file?: File;
  onFileChange: (file: File | undefined) => void;
  label?: string;
  hint?: string;
  accept?: string;
}

export default function LetterFileUpload({
  file,
  onFileChange,
  label = 'Pilih Lampiran PDF atau Foto Naskah (JPG/PNG)',
  hint = 'Tarik & lepas PDF/Foto di sini (JPG, PNG otomatis dipindai via Smart Scanner A4)',
  accept = 'application/pdf,image/jpeg,image/png,image/webp',
}: Props) {
  const [isDrag, setIsDrag] = useState(false);
  const [isPhotoScan, setIsPhotoScan] = useState(false);
  const [pendingScanFile, setPendingScanFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const processFiles = (fileList?: FileList | File[] | null) => {
    if (!fileList || fileList.length === 0) return;
    const arr = Array.from(fileList);
    const img = arr.find((f) => isImageFile(f));

    if (img) {
      setPendingScanFile(img);
    } else {
      const pdf = arr.find((f) => f.name.toLowerCase().endsWith('.pdf'));
      if (pdf) {
        setIsPhotoScan(false);
        onFileChange(pdf);
      }
    }
  };

  return (
    <>
      <div
        className={`file-box mt-2 p-3 border-2 border-dashed rounded text-center transition-all ${
          isDrag ? 'border-emerald-600 bg-emerald-50/70' : 'border-slate-300 bg-slate-50/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
        onDragLeave={() => setIsDrag(false)}
        onDrop={(e) => { e.preventDefault(); setIsDrag(false); processFiles(e.dataTransfer.files); }}
      >
        <input
          type="file"
          ref={fileInput}
          accept={accept}
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
        {file ? (
          <div className="flex items-center justify-center flex-wrap gap-2 text-xs text-emerald-900 bg-emerald-100 py-1.5 px-3 rounded">
            <Icon name="file" size={14} />
            <span className="font-semibold truncate max-w-xs">{file.name}</span>
            <span className="text-emerald-700 text-[11px]">({(file.size / 1024).toFixed(0)} KB)</span>
            {isPhotoScan && (
              <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold tracking-wide">
                Scan Genius Bersih
              </span>
            )}
            {file.size > 4 * 1024 * 1024 && (
              <span className="bg-amber-200 text-amber-900 text-[10px] px-1 rounded font-medium">Auto-Kompres</span>
            )}
            <button
              type="button"
              className="ml-1 text-red-600 hover:text-red-800 font-bold"
              onClick={() => { onFileChange(undefined); setIsPhotoScan(false); }}
              title="Hapus berkas"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="btn outline text-xs py-1.5 px-3 flex items-center justify-center gap-1.5 mx-auto"
              onClick={() => fileInput.current?.click()}
            >
              <Icon name="file" size={14} /> <span>{label}</span>
            </button>
            <span className="block text-xs text-slate-500 mt-1">
              {isDrag ? 'Lepaskan berkas di sini...' : hint}
            </span>
          </>
        )}
      </div>

      {pendingScanFile && (
        <SmartScannerModal
          file={pendingScanFile}
          onApply={(processedPdf) => {
            setPendingScanFile(null);
            setIsPhotoScan(true);
            onFileChange(processedPdf);
          }}
          onClose={() => setPendingScanFile(null)}
        />
      )}
    </>
  );
}
