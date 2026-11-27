import { NextResponse } from 'next/server';
import { getRealLetters } from '@/lib/letters';
import { insertNewLetter, deleteLettersBatch, updateLetter } from '@/lib/letter-mutations';
import { getSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { getClientIp } from '@/lib/rate-limit';

function canManageLetters(role?: string): boolean {
  return role === 'SUPER_ADMIN' || role === 'PETUGAS_ARSIP';
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Sesi tidak ditemukan.' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const dirFilter = searchParams.get('direction');
    let letters = await getRealLetters();
    if (session.username === 'magang_masuk') {
      letters = letters.filter((l) => l.direction === 'in');
    } else if (session.username === 'magang_keluar') {
      letters = letters.filter((l) => l.direction === 'out');
    } else if (dirFilter === 'in' || dirFilter === 'out') {
      letters = letters.filter((l) => l.direction === dirFilter);
    }
    return NextResponse.json({ success: true, letters });
  } catch (error: unknown) {
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
    if (!canManageLetters(session.role)) {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Peran tidak memiliki izin menambah arsip.' }, { status: 403 });
    }
    const body = await request.json();
    if (session.username === 'magang_masuk' && body.direction === 'out') {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Akun Magang Surat Masuk hanya berhak mencatat Surat Masuk.' }, { status: 403 });
    }
    if (session.username === 'magang_keluar' && body.direction === 'in') {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Akun Magang Surat Keluar hanya berhak mencatat Surat Keluar.' }, { status: 403 });
    }
    if (!body.number || !body.origin || !body.subject) {
      return NextResponse.json({ success: false, message: 'Nomor surat, instansi, dan perihal wajib diisi.' }, { status: 400 });
    }
    const sanitize = (s: unknown) => (typeof s === 'string' ? s.replace(/[<>]/g, '').trim().slice(0, 500) : '');
    body.number = sanitize(body.number);
    body.origin = sanitize(body.origin);
    body.subject = sanitize(body.subject);
    if (body.venue) body.venue = sanitize(body.venue);
    if (body.classification) body.classification = sanitize(body.classification);
    if (body.receivedDate) body.receivedDate = sanitize(body.receivedDate).slice(0, 10);
    const res = await insertNewLetter(body, session.id);
    const ip = getClientIp(request);
    const agent = request.headers.get('user-agent') || 'Unknown';
    await logAudit('BUAT_ARSIP', body.direction === 'out' ? 'arsip_surat_keluar' : 'arsip_surat_masuk', res.id, session.id, ip, agent);
    return NextResponse.json({
      success: true,
      message: 'Arsip berhasil disimpan',
      agendaNumber: res.agendaNumber,
      id: res.id,
    });
  } catch (error: unknown) {
    console.error('API Letters POST error:', error);
    const message = error instanceof Error ? error.message : 'Gagal menyimpan arsip';
    return NextResponse.json(
      { success: false, message },
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
    if (!canManageLetters(session.role)) {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Peran tidak memiliki izin menghapus arsip.' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const idsParam = searchParams.get('ids');
    let ids: string[] = [];
    let direction = (searchParams.get('direction') as 'in' | 'out') || 'in';
    let trashDrive = searchParams.get('trashDrive') === 'true';

    if (request.headers.get('content-type')?.includes('application/json')) {
      const body = await request.json().catch(() => ({}));
      if (Array.isArray(body.ids)) ids = body.ids;
      if (body.id) ids.push(body.id);
      if (body.direction) direction = body.direction;
      if (body.trashDrive !== undefined) trashDrive = Boolean(body.trashDrive);
    }

    if (session.username === 'magang_masuk' && direction === 'out') {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Akun Magang Surat Masuk tidak berhak menghapus Surat Keluar.' }, { status: 403 });
    }
    if (session.username === 'magang_keluar' && direction === 'in') {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Akun Magang Surat Keluar tidak berhak menghapus Surat Masuk.' }, { status: 403 });
    }

    if (!ids.length) {
      if (idsParam) ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
      else if (id) ids = [id];
    }

    if (!ids.length) {
      return NextResponse.json({ success: false, message: 'Parameter id atau ids wajib diisi' }, { status: 400 });
    }

    const count = await deleteLettersBatch(ids, direction, trashDrive);
    if (!count) {
      return NextResponse.json({ success: false, message: 'Arsip tidak ditemukan di database' }, { status: 404 });
    }

    const ip = getClientIp(request);
    const agent = request.headers.get('user-agent') || 'Unknown';
    await logAudit('HAPUS_ARSIP', direction === 'out' ? 'arsip_surat_keluar' : 'arsip_surat_masuk', ids.slice(0, 3).join(','), session.id, ip, agent);

    return NextResponse.json({ success: true, count, message: `${count} arsip berhasil dihapus dari TiDB` });
  } catch (error: unknown) {
    console.error('API Letters DELETE error:', error);
    const message = error instanceof Error ? error.message : 'Gagal menghapus arsip';
    return NextResponse.json(
      { success: false, message },
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
    if (!canManageLetters(session.role)) {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Peran tidak memiliki izin mengubah arsip.' }, { status: 403 });
    }
    const body = await request.json();
    const { id, direction, ...updates } = body;
    if (session.username === 'magang_masuk' && direction === 'out') {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Akun Magang Surat Masuk tidak berhak mengubah Surat Keluar.' }, { status: 403 });
    }
    if (session.username === 'magang_keluar' && direction === 'in') {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Akun Magang Surat Keluar tidak berhak mengubah Surat Masuk.' }, { status: 403 });
    }
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID atau nomor agenda arsip wajib diisi.' }, { status: 400 });
    }
    const sanitize = (s: unknown) => (typeof s === 'string' ? s.replace(/[<>]/g, '').trim().slice(0, 500) : s);
    if (updates.number) updates.number = sanitize(updates.number);
    if (updates.origin) updates.origin = sanitize(updates.origin);
    if (updates.subject) updates.subject = sanitize(updates.subject);
    if (updates.venue) updates.venue = sanitize(updates.venue);
    if (updates.classification) updates.classification = sanitize(updates.classification);
    if (updates.receivedDate) updates.receivedDate = String(sanitize(updates.receivedDate)).slice(0, 10);

    const ok = await updateLetter(id, updates, direction || 'in');
    if (!ok) {
      return NextResponse.json({ success: false, message: 'Arsip tidak ditemukan untuk diperbarui' }, { status: 404 });
    }

    const ip = getClientIp(request);
    const agent = request.headers.get('user-agent') || 'Unknown';
    await logAudit('EDIT_ARSIP', direction === 'out' ? 'arsip_surat_keluar' : 'arsip_surat_masuk', id, session.id, ip, agent);

    return NextResponse.json({ success: true, message: 'Arsip berhasil diperbarui di TiDB Cloud' });
  } catch (error: unknown) {
    console.error('API Letters PUT error:', error);
    const message = error instanceof Error ? error.message : 'Gagal memperbarui arsip';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
