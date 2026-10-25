import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { queryOne } from '@/lib/db';
import { setSessionCookie } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { checkRateLimit, recordFailedAttempt, resetRateLimit, getClientIp } from '@/lib/rate-limit';
import type { UserRole } from '@/types';

interface UserAuthRow {
  id: string;
  nip: string;
  nama_lengkap: string;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
  jabatan: string;
  unit_kerja: string;
  is_active: number | boolean;
}

const DUMMY_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

async function verifyPassword(pwd: string, isQuick: boolean, user: UserAuthRow | null): Promise<boolean> {
  if (isQuick) return Boolean(user?.is_active);
  const targetHash = user?.password_hash || DUMMY_HASH;
  return bcrypt.compare(pwd, targetHash);
}

async function recordFailure(ip: string, username: string, user: UserAuthRow | null, agent: string) {
  recordFailedAttempt(`ip:${ip}`);
  const userFail = recordFailedAttempt(`user:${username.toLowerCase()}`);
  await logAudit('LOGIN_FAILED', 'users', user?.id || null, null, ip, agent, {
    username,
    attempt: userFail.count,
  });
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    const ipLimit = checkRateLimit(`ip:${clientIp}`, 15, 15 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak percobaan masuk dari IP ini. Coba lagi dalam ${Math.ceil(ipLimit.resetSeconds / 60)} menit.`,
        },
        { status: 429, headers: { 'Retry-After': String(ipLimit.resetSeconds) } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawUsername = String(body.username || '').trim().slice(0, 64);
    const rawPassword = String(body.password || '').slice(0, 128);
    const isQuick = Boolean(body.isQuickLogin && process.env.ALLOW_DEMO_LOGIN === 'true');

    if (!rawUsername) {
      return NextResponse.json({ success: false, message: 'Username wajib diisi' }, { status: 400 });
    }

    const userLimit = checkRateLimit(`user:${rawUsername.toLowerCase()}`, 5, 15 * 60 * 1000);
    if (!userLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Akun ini terkunci sementara karena terlalu banyak percobaan masuk gagal. Coba lagi dalam ${Math.ceil(userLimit.resetSeconds / 60)} menit.`,
        },
        { status: 429, headers: { 'Retry-After': String(userLimit.resetSeconds) } }
      );
    }

    if (!isQuick && !rawPassword) {
      return NextResponse.json({ success: false, message: 'Password wajib diisi' }, { status: 400 });
    }

    const user = await queryOne<UserAuthRow>(
      'SELECT id, nip, nama_lengkap, username, email, password_hash, role, jabatan, unit_kerja, is_active FROM users WHERE username = ?',
      [rawUsername]
    );

    const isMatch = await verifyPassword(rawPassword, isQuick, user);

    if (!user || !user.is_active || !isMatch) {
      await recordFailure(clientIp, rawUsername, user, userAgent);
      return NextResponse.json(
        { success: false, message: 'Kredensial tidak valid atau akun tidak aktif' },
        { status: 401 }
      );
    }

    resetRateLimit(`ip:${clientIp}`);
    resetRateLimit(`user:${rawUsername.toLowerCase()}`);

    const sessionData = {
      id: user.id,
      nip: user.nip,
      namaLengkap: user.nama_lengkap,
      username: user.username,
      email: user.email,
      role: user.role,
      jabatan: user.jabatan,
      unitKerja: user.unit_kerja,
    };

    await setSessionCookie(sessionData);
    await logAudit('LOGIN_SUCCESS', 'users', user.id, user.id, clientIp, userAgent);

    return NextResponse.json({ success: true, message: 'Login berhasil', user: sessionData });
  } catch (error: unknown) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan sistem internal' }, { status: 500 });
  }
}
