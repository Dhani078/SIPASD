import { NextResponse } from 'next/server';
import { getRealLetters } from '@/lib/letters';
import { insertNewLetter } from '@/lib/letter-mutations';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const letters = await getRealLetters();
    return NextResponse.json({ success: true, letters });
  } catch (error: any) {
    console.error('API Letters GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data arsip dari TiDB' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const agendaNumber = await insertNewLetter(body, session?.id || 'usr-admin-01');
    return NextResponse.json({
      success: true,
      message: 'Arsip berhasil disimpan',
      agendaNumber,
    });
  } catch (error: any) {
    console.error('API Letters POST error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menyimpan arsip' },
      { status: 500 }
    );
  }
}
