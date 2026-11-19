import { NextResponse } from 'next/server';
import { getAllClassifications, insertClassification } from '@/lib/classification';
import { getSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { getClientIp } from '@/lib/rate-limit';

export async function GET() {
  try {
    const list = await getAllClassifications();
    return NextResponse.json({ success: true, data: list });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Gagal memuat klasifikasi' },
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

    const u = session.username.toLowerCase();
    const n = session.namaLengkap.toLowerCase();
    const isAllowed =
      u === 'developer' ||
      u === 'pengarsip' ||
      u === 'rana' ||
      u === 'admin' ||
      n.includes('rana') ||
      session.role === 'SUPER_ADMIN';

    if (!isAllowed) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Hanya Developer dan akun Rana yang berwenang menambah klasifikasi.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const kode = String(body.kode || '').trim().replace(/[<>]/g, '');
    const nama = String(body.nama_klasifikasi || body.title || '').trim().replace(/[<>]/g, '');
    const uraian = String(body.uraian || body.desc || '').trim().replace(/[<>]/g, '');
    const retAktif = Number(body.retensi_aktif_tahun) || 2;
    const retInaktif = Number(body.retensi_inaktif_tahun) || 5;

    if (!kode || !nama) {
      return NextResponse.json({ success: false, message: 'Kode dan nama klasifikasi wajib diisi.' }, { status: 400 });
    }

    const created = await insertClassification({
      kode,
      nama_klasifikasi: nama,
      uraian: uraian || `${nama} lingkungan Dispora Prov. Kalsel`,
      retensi_aktif_tahun: retAktif,
      retensi_inaktif_tahun: retInaktif,
    });

    const ip = getClientIp(request);
    const agent = request.headers.get('user-agent') || 'Unknown';
    await logAudit('TAMBAH_KLASIFIKASI', 'klasifikasi_arsip', kode, session.id, ip, agent);

    return NextResponse.json({
      success: true,
      message: `Kode klasifikasi ${kode} berhasil ditambahkan ke TiDB Cloud.`,
      data: created,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menambahkan kode klasifikasi.';
    const isConflict = msg.includes('sudah terdaftar');
    return NextResponse.json({ success: false, message: msg }, { status: isConflict ? 409 : 500 });
  }
}
