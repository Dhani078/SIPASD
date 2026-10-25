export interface CompressProgress {
  step: 'reading' | 'rendering' | 'saving' | 'done';
  currentPage?: number;
  totalPages?: number;
  originalSize: number;
  compressedSize?: number;
  message: string;
}

const THRESHOLD_BYTES = 4 * 1024 * 1024; // 4 MB
const MAX_ALLOWED_BYTES = 20 * 1024 * 1024; // 20 MB

export async function compressPdfIfNeeded(
  file: File,
  onProgress?: (progress: CompressProgress) => void
): Promise<File> {
  if (file.size <= THRESHOLD_BYTES) {
    return file;
  }

  if (file.size > MAX_ALLOWED_BYTES) {
    throw new Error('Ukuran berkas melebihi batas maksimal 20 MB.');
  }

  if (typeof window === 'undefined') {
    return file;
  }

  try {
    onProgress?.({
      step: 'reading',
      originalSize: file.size,
      message: `Mempersiapkan kompresi naskah (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`,
    });

    const [pdfLib, pdfjsLib] = await Promise.all([
      import('pdf-lib'),
      import('pdfjs-dist'),
    ]);

    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });

    const srcDoc = await loadingTask.promise;
    const totalPages = srcDoc.numPages;
    const outDoc = await pdfLib.PDFDocument.create();

    for (let i = 1; i <= totalPages; i++) {
      onProgress?.({
        step: 'rendering',
        currentPage: i,
        totalPages,
        originalSize: file.size,
        message: `Mengompresi halaman ${i} dari ${totalPages}...`,
      });

      const page = await srcDoc.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext('2d');

      if (!ctx) continue;

      await page.render({
        canvas,
        canvasContext: ctx,
        viewport,
      }).promise;

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.75);
      });

      if (!blob) continue;

      const jpgBytes = await blob.arrayBuffer();
      const embeddedImg = await outDoc.embedJpg(jpgBytes);
      const baseViewport = page.getViewport({ scale: 1.0 });

      const outPage = outDoc.addPage([baseViewport.width, baseViewport.height]);
      outPage.drawImage(embeddedImg, {
        x: 0,
        y: 0,
        width: baseViewport.width,
        height: baseViewport.height,
      });
    }

    onProgress?.({
      step: 'saving',
      originalSize: file.size,
      message: 'Menyusun berkas PDF akhir beresolusi optimal...',
    });

    const compressedBytes = await outDoc.save({ useObjectStreams: true });
    const blob = new Blob([new Uint8Array(compressedBytes).buffer as ArrayBuffer], { type: 'application/pdf' });
    const compressedFile = new File([blob], file.name, {
      type: 'application/pdf',
      lastModified: Date.now(),
    });

    onProgress?.({
      step: 'done',
      originalSize: file.size,
      compressedSize: compressedFile.size,
      message: `Kompresi selesai: ${(compressedFile.size / 1024).toFixed(0)} KB.`,
    });

    return compressedFile.size < file.size ? compressedFile : file;
  } catch (err: unknown) {
    console.warn('Kompresi PDF browser dialihkan ke berkas asli:', err);
    return file;
  }
}
