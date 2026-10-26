import { NextResponse } from 'next/server';
import { classifyText } from '@/lib/classifier';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ success: false, message: 'Teks perihal surat wajib diisi.' }, { status: 400 });
    }
    if (text.length > 5000) {
      return NextResponse.json({ success: false, message: 'Panjang teks melebihi batas 5.000 karakter.' }, { status: 400 });
    }

    const result = classifyText(text);
    return NextResponse.json({
      success: true,
      suggestion: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memproses klasifikasi.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
