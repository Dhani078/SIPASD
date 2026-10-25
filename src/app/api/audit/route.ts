import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface AuditLogRow {
  id: string;
  action: string;
  resource: string;
  ip_address: string;
  user_agent: string;
  created_at: string | Date;
  username: string;
  nama_lengkap: string;
  role: string;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isPrivileged = session.role === 'SUPER_ADMIN' || session.username === 'developer' || session.username === 'admin';
  if (!isPrivileged) {
    return NextResponse.json({ error: 'Forbidden: Khusus Administrator IT & Developer' }, { status: 403 });
  }

  try {
    const logs = await query<AuditLogRow>(`
      SELECT a.id, a.action, a.resource, a.ip_address, a.user_agent, a.created_at,
             COALESCE(u.username, 'system') as username,
             COALESCE(u.nama_lengkap, 'Sistem Kearsipan') as nama_lengkap,
             COALESCE(u.role, 'SYSTEM') as role
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `);

    return NextResponse.json({ success: true, logs });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Gagal memuat jejak audit', details }, { status: 500 });
  }
}
