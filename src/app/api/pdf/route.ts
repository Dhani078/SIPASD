import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'vqfpoekg',
  api_key: process.env.CLOUDINARY_API_KEY || '966426338749991',
  api_secret: process.env.CLOUDINARY_API_SECRET || '[REDACTED_CLOUDINARY_SECRET]',
  secure: true,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUrl = searchParams.get('url') || '';
    const publicIdParam = searchParams.get('public_id') || '';

    let publicId = publicIdParam;
    if (!publicId && rawUrl) {
      const match = rawUrl.match(/sipasd\/(surat_masuk|surat_keluar|test)\/[^?#]+/);
      if (match) {
        publicId = match[0];
      }
    }

    if (!publicId) {
      return NextResponse.json(
        { success: false, message: 'Parameter public_id atau url tidak valid.' },
        { status: 400 }
      );
    }

    const cleanPublicId = publicId.replace(/\.pdf$/i, '') + '.pdf';
    const signedUrl = cloudinary.utils.private_download_url(cleanPublicId, 'pdf', {
      resource_type: 'raw',
      type: 'upload',
    });

    return NextResponse.redirect(signedUrl, 307);
  } catch (error: any) {
    console.error('API PDF Proxy error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memuat dokumen PDF.' },
      { status: 500 }
    );
  }
}
