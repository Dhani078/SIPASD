import { NextResponse } from 'next/server';
import { uploadPdfBuffer } from '@/lib/cloudinary';
import { uploadToGoogleDrive } from '@/lib/gdrive';
import { getSession } from '@/lib/auth';
import { getGdriveFolderUrl } from '@/data/constants';
import { logAudit } from '@/lib/audit';
import { getClientIp } from '@/lib/rate-limit';
import { isImageFile, convertImageBufferToPdf } from '@/lib/image-to-pdf';

function canUpload(role?: string): boolean {
  return role === 'SUPER_ADMIN' || role === 'PETUGAS_ARSIP';
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Sesi tidak ditemukan.' }, { status: 401 });
    }
    if (!canUpload(session.role)) {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Peran tidak memiliki izin mengunggah berkas.' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as 'surat_masuk' | 'surat_keluar' | 'disposisi') || 'surat_masuk';

    if (!file) {
      return NextResponse.json({ success: false, message: 'Berkas naskah atau foto wajib diunggah.' }, { status: 400 });
    }

    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    const isImg = isImageFile(file);
    if (!isPdf && !isImg) {
      return NextResponse.json({
        success: false,
        message: 'Hanya berkas berformat PDF atau gambar (JPG, PNG, WebP) yang diizinkan.',
      }, { status: 400 });
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'Ukuran berkas melebihi batas 20 MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(bytes);
    let finalFileName = file.name;

    if (isImg) {
      const conv = await convertImageBufferToPdf(buffer, file.name);
      buffer = conv.buffer;
      finalFileName = conv.fileName;
    } else {
      const magic = buffer.subarray(0, 5).toString('ascii');
      if (magic !== '%PDF-') {
        return NextResponse.json({ success: false, message: 'Isi berkas bukan dokumen PDF yang valid.' }, { status: 400 });
      }
    }

    const result = await uploadPdfBuffer(buffer, folder, finalFileName);
    const gdriveFolderType = folder === 'surat_masuk' ? 'masuk' : 'keluar';
    const yearStr = String(formData.get('year') || '2026').slice(0, 4);
    const driveUrl = await uploadToGoogleDrive(buffer, finalFileName, gdriveFolderType, yearStr);

    const ip = getClientIp(request);
    const agent = request.headers.get('user-agent') || 'Unknown';
    await logAudit('UNGGAH_BERKAS', folder, result.publicId, session.id, ip, agent, {
      fileName: finalFileName,
      size: buffer.length,
      originalType: isImg ? 'IMAGE_CONVERTED_TO_PDF' : 'PDF',
    });

    return NextResponse.json({
      success: true,
      message: isImg ? 'Foto berhasil dipindai menjadi dokumen PDF dan diunggah.' : 'Berkas PDF berhasil diunggah.',
      url: result.url,
      publicId: result.publicId,
      driveUrl: driveUrl || getGdriveFolderUrl(gdriveFolderType, yearStr),
    });
  } catch (error: unknown) {
    console.error('Upload API error:', error);
    const message = error instanceof Error ? error.message : 'Gagal mengunggah berkas';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
