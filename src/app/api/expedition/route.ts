import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const rows = await query<any>(
      'SELECT e.id, e.surat_keluar_id, e.tanggal_kirim, e.kurir_pengirim, e.penerima_nama, ' +
      'e.penerima_telepon, e.catatan_ekspedisi, sk.nomor_agenda ' +
      'FROM buku_ekspedisi e LEFT JOIN arsip_surat_keluar sk ON sk.id = e.surat_keluar_id ' +
      'ORDER BY e.tanggal_kirim DESC'
    );
    return NextResponse.json({
      success: true,
      records: rows.map((r: any) => ({
        ...r,
        tanggal_kirim: r.tanggal_kirim ? new Date(r.tanggal_kirim).toISOString().slice(0, 10) : null,
      })),
    });
  } catch (error: any) {
    console.error('API Expedition GET error:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data buku ekspedisi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Sesi tidak ditemukan.' }, { status: 401 });
    }

    const body = await request.json();
    const suratId = String(body.surat_keluar_id || '').trim();
    const tanggalKirim = String(body.tanggal_kirim || '').trim();
    const kurir = String(body.kurir_pengirim || '').replace(/[<>]/g, '').trim().slice(0, 100);
    const penerima = String(body.penerima_nama || '').replace(/[<>]/g, '').trim().slice(0, 100);
    const telepon = String(body.penerima_telepon || '').replace(/[<>]/g, '').trim().slice(0, 20) || null;
    const catatan = String(body.catatan_ekspedisi || '').replace(/[<>]/g, '').trim().slice(0, 255) || null;

    if (!suratId || !tanggalKirim || !kurir || !penerima) {
      return NextResponse.json(
        { success: false, message: 'Surat keluar, tanggal kirim, kurir, dan nama penerima wajib diisi.' },
        { status: 400 }
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggalKirim)) {
      return NextResponse.json({ success: false, message: 'Format tanggal kirim tidak valid.' }, { status: 400 });
    }

    const surat = await query<any>('SELECT id, nomor_agenda FROM arsip_surat_keluar WHERE id = ?', [suratId]);
    if (!surat.length) {
      return NextResponse.json({ success: false, message: 'Surat keluar tidak ditemukan di database' }, { status: 404 });
    }

    await query(
      'INSERT INTO buku_ekspedisi (id, surat_keluar_id, tanggal_kirim, kurir_pengirim, penerima_nama, penerima_telepon, catatan_ekspedisi) ' +
      'VALUES (UUID(), ?, ?, ?, ?, ?, ?) ' +
      'ON DUPLICATE KEY UPDATE tanggal_kirim = VALUES(tanggal_kirim), kurir_pengirim = VALUES(kurir_pengirim), ' +
      'penerima_nama = VALUES(penerima_nama), penerima_telepon = VALUES(penerima_telepon), catatan_ekspedisi = VALUES(catatan_ekspedisi)',
      [suratId, tanggalKirim, kurir, penerima, telepon, catatan]
    );

    await logAudit('CATAT_EKSPEDISI', 'buku_ekspedisi', suratId, session.id);

    return NextResponse.json({
      success: true,
      message: `Distribusi surat ${surat[0].nomor_agenda} berhasil dicatat`,
      nomor_agenda: surat[0].nomor_agenda,
    });
  } catch (error: any) {
    console.error('API Expedition POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Gagal menyimpan catatan ekspedisi' }, { status: 500 });
  }
}