import { compressPdfIfNeeded } from '@/lib/pdf-compress';
import { isImageFile, convertImageToPdf } from '@/lib/image-to-pdf';

export interface UploadProgress {
  pct: number;
  msg: string;
}

export async function uploadPdf(
  file: File,
  folder: 'surat_masuk' | 'surat_keluar' | 'disposisi',
  year: string,
  tell: (m: string) => void,
  onProgress?: (p: UploadProgress) => void
) {
  let readyFile = file;
  if (isImageFile(file)) {
    const msg = `Memindai foto ${file.name} menjadi dokumen PDF A4...`;
    tell(msg);
    onProgress?.({ pct: 20, msg });
    readyFile = await convertImageToPdf(file);
  }
  onProgress?.({ pct: 35, msg: `Memeriksa lampiran ${readyFile.name}...` });
  const ready = await compressPdfIfNeeded(readyFile, (p) => {
    const pct = p.totalPages && p.currentPage ? 35 + Math.round((p.currentPage / p.totalPages) * 35) : 55;
    onProgress?.({ pct, msg: p.message });
    tell(p.message);
  });
  onProgress?.({ pct: 78, msg: `Mengunggah ${ready.name} ke Cloudinary & Drive...` });
  const fd = new FormData();
  fd.append('file', ready);
  fd.append('folder', folder);
  fd.append('year', year);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Gagal mengunggah berkas PDF.');
  onProgress?.({ pct: 95, msg: 'Menyimpan metadata ke TiDB Cloud...' });
  return {
    url: data.url as string,
    publicId: (data.publicId as string) || undefined,
    driveUrl: (data.driveUrl as string) || undefined,
    fileName: ready.name,
  };
}
