import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { toLocalDateString } from '@/lib/format';
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
  const todayDate = toLocalDateString(new Date());

  try {
    switch (type) {
      case '1': {
        const { rows, summary } = await getReportMasuk(startDate, endDate);
        return NextResponse.json({ success: true, data: rows, summary });
      }
      case '2': {
        const { rows, summary } = await getReportKeluar(startDate, endDate);
        return NextResponse.json({ success: true, data: rows, summary });
      }
      case '3': {
        const rows = await getReportDisposisi(startDate, endDate);
        return NextResponse.json({ success: true, data: rows });
      }
      case '4': {
        const rows = await getReportKepatuhan(todayDate, status, startDate, endDate);
        return NextResponse.json({ success: true, data: rows });
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
