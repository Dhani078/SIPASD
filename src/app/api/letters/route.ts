import { NextResponse } from 'next/server';
import { getRealLetters } from '@/lib/letters';
import { insertNewLetter, deleteLetter, deleteLettersBatch, updateLetter } from '@/lib/letter-mutations';
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
    const idsParam = searchParams.get('ids');
    let ids: string[] = [];
    let direction = (searchParams.get('direction') as 'in' | 'out') || 'in';

    if (request.headers.get('content-type')?.includes('application/json')) {
      const body = await request.json().catch(() => ({}));
      if (Array.isArray(body.ids)) ids = body.ids;
      if (body.id) ids.push(body.id);
      if (body.direction) direction = body.direction;
    }

    if (!ids.length) {
      if (idsParam) ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
      else if (id) ids = [id];
    }

    if (!ids.length) {
      return NextResponse.json({ success: false, message: 'Parameter id atau ids wajib diisi' }, { status: 400 });
    }

    const count = await deleteLettersBatch(ids, direction);
    if (!count) {
      return NextResponse.json({ success: false, message: 'Arsip tidak ditemukan di database' }, { status: 404 });
    }

    return NextResponse.json({ success: true, count, message: `${count} arsip berhasil dihapus dari TiDB` });
  } catch (error: any) {
    console.error('API Letters DELETE error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghapus arsip' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Sesi tidak ditemukan.' }, { status: 401 });
    }
    const body = await request.json();
    const { id, direction, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID atau nomor agenda arsip wajib diisi.' }, { status: 400 });
    }
    const sanitize = (s: any) => typeof s === 'string' ? s.replace(/[<>]/g, '').trim().slice(0, 500) : s;
    if (updates.number) updates.number = sanitize(updates.number);
    if (updates.origin) updates.origin = sanitize(updates.origin);
    if (updates.subject) updates.subject = sanitize(updates.subject);

    const ok = await updateLetter(id, updates, direction || 'in');
    if (!ok) {
      return NextResponse.json({ success: false, message: 'Arsip tidak ditemukan untuk diperbarui' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Arsip berhasil diperbarui di TiDB Cloud' });
  } catch (error: any) {
    console.error('API Letters PUT error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memperbarui arsip' },
      { status: 500 }
    );
  }
}
