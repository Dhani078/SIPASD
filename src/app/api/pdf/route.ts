import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
    if (!/^sipasd\/(surat_masuk|surat_keluar|test)\/[a-zA-Z0-9_.-]+\.pdf$/.test(cleanPublicId) || cleanPublicId.includes('..')) {
      return NextResponse.json(
        { success: false, message: 'Format public_id tidak diizinkan.' },
        { status: 400 }
      );
    }
    const signedUrl = cloudinary.utils.private_download_url(cleanPublicId, 'pdf', {
      resource_type: 'raw',
      type: 'upload',
    });

    try {
      const pdfRes = await fetch(signedUrl);
      if (pdfRes.ok) {
        const buffer = await pdfRes.arrayBuffer();
        return new Response(buffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename="naskah-dinas.pdf"',
            'X-Frame-Options': 'SAMEORIGIN',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
          },
        });
      }
    } catch (streamError) {
      console.warn('PDF stream buffer fetch failed, fallback to 307 redirect:', streamError);
    }

    const response = NextResponse.redirect(signedUrl, 307);
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch (error: unknown) {
    console.error('API PDF Proxy error:', error);
    const message = error instanceof Error ? error.message : 'Gagal memuat dokumen PDF.';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
