import { NextResponse } from 'next/server';
import { getRealLetters } from '@/lib/letters';
import { insertNewLetter, deleteLetter } from '@/lib/letter-mutations';
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
    if (!session) {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Sesi tidak ditemukan.' }, { status: 401 });
    }
    const body = await request.json();
    if (!body.number || !body.origin || !body.subject) {
      return NextResponse.json({ success: false, message: 'Nomor surat, instansi, dan perihal wajib diisi.' }, { status: 400 });
    }
    const sanitize = (s: string) => String(s).replace(/[<>]/g, '').trim().slice(0, 500);
    body.number = sanitize(body.number);
    body.origin = sanitize(body.origin);
    body.subject = sanitize(body.subject);
    const agendaNumber = await insertNewLetter(body, session.id);
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

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Sesi tidak ditemukan.' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const direction = (searchParams.get('direction') as 'in' | 'out') || 'in';

    if (!id) {
      return NextResponse.json({ success: false, message: 'Parameter id wajib diisi' }, { status: 400 });
    }

    const success = await deleteLetter(id, direction);
    if (!success) {
      return NextResponse.json({ success: false, message: 'Arsip tidak ditemukan di database' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Arsip berhasil dihapus dari TiDB' });
  } catch (error: any) {
    console.error('API Letters DELETE error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghapus arsip' },
      { status: 500 }
    );
  }
}
