import { PDFDocument, PageSizes } from 'pdf-lib';

export type ScannerFilterMode = 'magic' | 'bw' | 'original';

export interface PageScanConfig {
  id: string;
  file: File;
  filterMode: ScannerFilterMode;
  rotation: 0 | 90 | 180 | 270;
  cropTop: number;
  cropBottom: number;
  cropLeft: number;
  cropRight: number;
  brightness: number;
  contrast: number;
}

export function createDefaultPageConfig(file: File, id?: string): PageScanConfig {
  return {
    id: id || `${file.name}-${Math.random().toString(36).slice(2, 7)}`,
    file,
    filterMode: 'magic',
    rotation: 0,
    cropTop: 0,
    cropBottom: 0,
    cropLeft: 0,
    cropRight: 0,
    brightness: 15,
    contrast: 10,
  };
}

export function applyDocumentFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mode: ScannerFilterMode,
  brightness = 0,
  contrast = 0
) {
  if (mode === 'original' && brightness === 0 && contrast === 0) return;

  const imgData = ctx.getImageData(0, 0, width, height);
  const d = imgData.data;

  const bp = Math.max(10, 40 - brightness);
  const wp = Math.min(245, 185 - brightness);
  const scale = 255 / Math.max(1, wp - bp);
  const cFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2];

    if (mode === 'magic') {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const sat = Math.max(r, g, b) - Math.min(r, g, b);

      if (sat > 28 && lum < 220) {
        const boost = 1.15;
        r = Math.min(255, r * boost);
        g = Math.min(255, g * boost);
        b = Math.min(255, b * boost);
      } else {
        const newLum = Math.min(255, Math.max(0, (lum - bp) * scale));
        const factor = lum > 0 ? newLum / lum : 1;
        r = Math.min(255, Math.max(0, r * factor));
        g = Math.min(255, Math.max(0, g * factor));
        b = Math.min(255, Math.max(0, b * factor));
      }
    } else if (mode === 'bw') {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const v = lum > 140 - brightness ? 255 : 0;
      r = g = b = v;
    }

    if (contrast !== 0) {
      r = Math.min(255, Math.max(0, cFactor * (r - 128) + 128));
      g = Math.min(255, Math.max(0, cFactor * (g - 128) + 128));
      b = Math.min(255, Math.max(0, cFactor * (b - 128) + 128));
    }

    d[i] = r;
    d[i + 1] = g;
    d[i + 2] = b;
  }

  ctx.putImageData(imgData, 0, 0);
}

export function renderImageToCanvas(
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
  config: Omit<PageScanConfig, 'id' | 'file'>
) {
  const naturalW = img.naturalWidth;
  const naturalH = img.naturalHeight;

  const cutX = Math.round((config.cropLeft / 100) * naturalW);
  const cutY = Math.round((config.cropTop / 100) * naturalH);
  const cutW = Math.max(10, naturalW - cutX - Math.round((config.cropRight / 100) * naturalW));
  const cutH = Math.max(10, naturalH - cutY - Math.round((config.cropBottom / 100) * naturalH));

  const isRotated = config.rotation === 90 || config.rotation === 270;
  const targetW = isRotated ? cutH : cutW;
  const targetH = isRotated ? cutW : cutH;

  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((config.rotation * Math.PI) / 180);
  ctx.drawImage(img, cutX, cutY, cutW, cutH, -cutW / 2, -cutH / 2, cutW, cutH);
  ctx.restore();

  applyDocumentFilter(ctx, targetW, targetH, config.filterMode, config.brightness, config.contrast);
}

export async function canvasesToA4Pdf(canvases: HTMLCanvasElement[], baseName: string): Promise<File> {
  const pdfDoc = await PDFDocument.create();

  for (const canvas of canvases) {
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Gagal render canvas.'))), 'image/jpeg', 0.88);
    });
    const jpgBytes = await blob.arrayBuffer();
    const cleanArr = new Uint8Array(jpgBytes);
    const embedded = await pdfDoc.embedJpg(cleanArr);

    const isLandscape = canvas.width > canvas.height;
    const pageSize: [number, number] = isLandscape
      ? [PageSizes.A4[1], PageSizes.A4[0]]
      : [PageSizes.A4[0], PageSizes.A4[1]];

    const margin = 16;
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
  const finalName = `${baseName.replace(/\.[^/.]+$/, '')}.pdf`;
  const pdfBlob = new Blob([new Uint8Array(pdfBytes).buffer as ArrayBuffer], { type: 'application/pdf' });
  return new File([pdfBlob], finalName, { type: 'application/pdf', lastModified: Date.now() });
}

export async function canvasToA4Pdf(canvas: HTMLCanvasElement, baseName: string): Promise<File> {
  return canvasesToA4Pdf([canvas], baseName);
}
