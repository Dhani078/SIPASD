import { PDFDocument, PageSizes } from 'pdf-lib';

const IMG_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.bmp'];

export function isImageFile(fileOrName: File | string): boolean {
  const name = typeof fileOrName === 'string' ? fileOrName : fileOrName.name;
  const lower = name.toLowerCase();
  const extMatch = IMG_EXTENSIONS.some((ext) => lower.endsWith(ext));
  if (typeof fileOrName === 'object' && fileOrName.type) {
    return extMatch || fileOrName.type.startsWith('image/');
  }
  return extMatch;
}

async function renderImageToJpgBlob(file: File): Promise<{ blob: Blob; isLandscape: boolean }> {
  const maxDim = 1800;
  let w = 0, h = 0;
  let source: CanvasImageSource;
  let closeBitmap: (() => void) | undefined;

  if (typeof createImageBitmap !== 'undefined') {
    const bitmap = await createImageBitmap(file);
    w = bitmap.width;
    h = bitmap.height;
    source = bitmap;
    closeBitmap = () => bitmap.close();
  } else {
    const dataUrl = await new Promise<string>((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const el = new Image();
      el.onload = () => res(el);
      el.onerror = rej;
      el.src = dataUrl;
    });
    w = img.naturalWidth;
    h = img.naturalHeight;
    source = img;
  }

  const isLandscape = w > h;
  if (w > maxDim || h > maxDim) {
    const ratio = Math.min(maxDim / w, maxDim / h);
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    if (closeBitmap) closeBitmap();
    throw new Error('Gagal kanvas.');
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(source, 0, 0, w, h);
  if (closeBitmap) closeBitmap();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Gagal render konversi.'))), 'image/jpeg', 0.85);
  });

  return { blob, isLandscape };
}

export async function convertImageToPdf(file: File): Promise<File> {
  if (file.name.toLowerCase().endsWith('.pdf')) return file;
  const { blob, isLandscape } = await renderImageToJpgBlob(file);
  const jpgBytes = await blob.arrayBuffer();

  const pdfDoc = await PDFDocument.create();
  const cleanArr = new Uint8Array(jpgBytes);
  const embedded = await pdfDoc.embedJpg(cleanArr);
  const pageSize: [number, number] = isLandscape ? [PageSizes.A4[1], PageSizes.A4[0]] : [PageSizes.A4[0], PageSizes.A4[1]];

  const margin = 20;
  const maxW = pageSize[0] - margin * 2;
  const maxH = pageSize[1] - margin * 2;
  const scaled = embedded.scaleToFit(maxW, maxH);

  const page = pdfDoc.addPage(pageSize);
  page.drawImage(embedded, {
    x: (pageSize[0] - scaled.width) / 2,
    y: (pageSize[1] - scaled.height) / 2,
    width: scaled.width,
    height: scaled.height,
  });

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const finalName = `${baseName || 'scan_lampiran'}.pdf`;
  const pdfBlob = new Blob([new Uint8Array(pdfBytes).buffer as ArrayBuffer], { type: 'application/pdf' });
  return new File([pdfBlob], finalName, { type: 'application/pdf', lastModified: Date.now() });
}

export async function convertImagesToPdf(files: File[], outputName = 'scan_naskah.pdf'): Promise<File> {
  if (files.length === 1) return convertImageToPdf(files[0]);
  const pdfDoc = await PDFDocument.create();
  const margin = 20;

  for (const f of files) {
    if (f.name.toLowerCase().endsWith('.pdf')) continue;
    const { blob, isLandscape } = await renderImageToJpgBlob(f);
    const jpgBytes = await blob.arrayBuffer();
    const cleanArr = new Uint8Array(jpgBytes);
    const embedded = await pdfDoc.embedJpg(cleanArr);

    const pageSize: [number, number] = isLandscape ? [PageSizes.A4[1], PageSizes.A4[0]] : [PageSizes.A4[0], PageSizes.A4[1]];
    const maxW = pageSize[0] - margin * 2;
    const maxH = pageSize[1] - margin * 2;
    const scaled = embedded.scaleToFit(maxW, maxH);

    const page = pdfDoc.addPage(pageSize);
    page.drawImage(embedded, {
      x: (pageSize[0] - scaled.width) / 2,
      y: (pageSize[1] - scaled.height) / 2,
      width: scaled.width,
      height: scaled.height,
    });
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const pdfBlob = new Blob([new Uint8Array(pdfBytes).buffer as ArrayBuffer], { type: 'application/pdf' });
  return new File([pdfBlob], outputName, { type: 'application/pdf', lastModified: Date.now() });
}

export async function convertImageBufferToPdf(buffer: Buffer, originalName: string): Promise<{ buffer: Buffer; fileName: string }> {
  const pdfDoc = await PDFDocument.create();
  const cleanArr = new Uint8Array(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
  const isPng = buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  const isJpg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (!isPng && !isJpg) {
    throw new Error('Berkas gambar non-JPG/PNG (seperti WebP) harus dipindai melalui antarmuka web agar terkonversi ke PDF.');
  }
  const embedded = isPng ? await pdfDoc.embedPng(cleanArr) : await pdfDoc.embedJpg(cleanArr);

  const isLandscape = embedded.width > embedded.height;
  const pageSize: [number, number] = isLandscape ? [PageSizes.A4[1], PageSizes.A4[0]] : [PageSizes.A4[0], PageSizes.A4[1]];
  const margin = 20;
  const maxW = pageSize[0] - margin * 2;
  const maxH = pageSize[1] - margin * 2;
  const scaled = embedded.scaleToFit(maxW, maxH);

  const page = pdfDoc.addPage(pageSize);
  page.drawImage(embedded, {
    x: (pageSize[0] - scaled.width) / 2,
    y: (pageSize[1] - scaled.height) / 2,
    width: scaled.width,
    height: scaled.height,
  });

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  return {
    buffer: Buffer.from(pdfBytes),
    fileName: `${baseName || 'scan_lampiran'}.pdf`,
  };
}
