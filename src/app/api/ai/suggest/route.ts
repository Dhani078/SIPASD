import { NextResponse } from 'next/server';
import { classifyText } from '@/lib/classifier';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ success: false, message: 'Teks perihal surat wajib diisi.' }, { status: 400 });
    }

    const result = classifyText(text);
    return NextResponse.json({
      success: true,
      suggestion: result,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Gagal memproses klasifikasi.' }, { status: 500 });
  }
}
