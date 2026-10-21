import { NextResponse } from 'next/server';
import { uploadPdfBuffer } from '@/lib/cloudinary';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Sesi tidak ditemukan.' }, { status: 401 });
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

    // Validate PDF magic bytes %PDF-
    const magic = buffer.subarray(0, 5).toString('ascii');
    if (magic !== '%PDF-') {
      return NextResponse.json({ success: false, message: 'Isi berkas bukan dokumen PDF yang valid.' }, { status: 400 });
    }

    const result = await uploadPdfBuffer(buffer, folder, file.name);

    return NextResponse.json({
      success: true,
      message: 'Berkas PDF berhasil diunggah ke Cloudinary',
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Gagal mengunggah berkas' }, { status: 500 });
  }
}
