import { NextResponse } from 'next/server';
import { uploadPdfBuffer } from '@/lib/cloudinary';
import { uploadToGoogleDrive } from '@/lib/gdrive';
import { getSession } from '@/lib/auth';
import { getGdriveFolderUrl } from '@/data/constants';

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
    const folder = (formData.get('folder') as 'surat_masuk' | 'surat_keluar') || 'surat_masuk';

    if (!file) {
      return NextResponse.json({ success: false, message: 'Berkas PDF wajib diunggah.' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ success: false, message: 'Hanya berkas berformat PDF yang diizinkan.' }, { status: 400 });
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'Ukuran berkas melebihi batas 20 MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const magic = buffer.subarray(0, 5).toString('ascii');
    if (magic !== '%PDF-') {
      return NextResponse.json({ success: false, message: 'Isi berkas bukan dokumen PDF yang valid.' }, { status: 400 });
    }

    const result = await uploadPdfBuffer(buffer, folder, file.name);

    const gdriveFolderType = folder === 'surat_masuk' ? 'masuk' : 'keluar';
    const yearStr = String(formData.get('year') || '2026').slice(0, 4);
    const driveUrl = await uploadToGoogleDrive(buffer, file.name, gdriveFolderType, yearStr);

    return NextResponse.json({
      success: true,
      message: 'Berkas PDF berhasil diunggah ke Cloudinary dan Google Drive',
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
