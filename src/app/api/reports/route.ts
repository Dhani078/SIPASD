import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { todayWitaString } from '@/lib/format';
import { mapDivision } from '@/lib/letters';
import { getReportMasuk, getReportKeluar, getReportDisposisi } from '@/lib/reports-queries';
import { getReportKepatuhan, getReportKlasifikasi, getReportAudit } from '@/lib/reports-queries-secondary';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Restriksi Keras: Khusus Developer
  if (session.username !== 'developer') {
    return NextResponse.json({ error: 'Forbidden: Khusus Akun Developer' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || '1';
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const status = searchParams.get('status') || 'SEMUA';
  const action = searchParams.get('action') || 'SEMUA';
  const division = searchParams.get('division') || '';
  const todayDate = todayWitaString();

  const bid = (r: Record<string, unknown>) =>
    (r.bidang_pemrakarsa || r.bidang_tujuan || r.nama_bidang) as string | undefined;
  const byDivision = (rows: unknown): Record<string, unknown>[] => {
    const list = (Array.isArray(rows) ? rows : []) as Record<string, unknown>[];
    return division ? list.filter((r) => mapDivision(bid(r)) === division) : list;
  };

  try {
    switch (type) {
      case '1': {
        const { rows, summary } = await getReportMasuk(startDate, endDate);
        const filtered = byDivision(rows);
        const computedSummary = division
          ? {
              total: filtered.length,
              biasa: filtered.filter((r) => r.sifat_surat === 'BIASA').length,
              penting: filtered.filter((r) => r.sifat_surat === 'PENTING').length,
              segera: filtered.filter((r) => r.sifat_surat === 'SEGERA').length,
              kilat: filtered.filter((r) => r.sifat_surat === 'KILAT').length,
            }
          : summary;
        return NextResponse.json({ success: true, data: filtered, summary: computedSummary });
      }
      case '2': {
        const { rows, summary } = await getReportKeluar(startDate, endDate);
        const filtered = byDivision(rows);
        return NextResponse.json({ success: true, data: filtered, summary: division ? byDivision(summary) : summary });
      }
      case '3': {
        const rows = await getReportDisposisi(startDate, endDate);
        return NextResponse.json({ success: true, data: byDivision(rows) });
      }
      case '4': {
        const rows = await getReportKepatuhan(todayDate, status, startDate, endDate);
        return NextResponse.json({ success: true, data: byDivision(rows) });
      }
      case '5': {
        const rows = await getReportKlasifikasi(startDate, endDate);
        return NextResponse.json({ success: true, data: rows });
      }
      case '6': {
        const rows = await getReportAudit(action, startDate, endDate);
        return NextResponse.json({ success: true, data: rows });
      }
      default:
        return NextResponse.json({ error: 'Tipe laporan tidak valid' }, { status: 400 });
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
