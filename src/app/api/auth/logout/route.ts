import { NextResponse } from 'next/server';
import { clearSessionCookie, getSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (session) {
      const clientIp = getClientIp(request);
      const userAgent = request.headers.get('user-agent') || 'Unknown';
      await logAudit('LOGOUT', 'users', session.id, session.id, clientIp, userAgent);
    }
  } catch (err) {
    console.error('Logout audit error:', err);
  }
  await clearSessionCookie();
  return NextResponse.json({ success: true, message: 'Logout berhasil' });
}

export const GET = POST;
