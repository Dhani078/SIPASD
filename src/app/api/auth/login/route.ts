import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { queryOne } from '@/lib/db';
import { setSessionCookie } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Username dan password wajib diisi' }, { status: 400 });
    }

    const user = await queryOne(
      'SELECT id, nip, nama_lengkap, username, email, password_hash, role, jabatan, unit_kerja, is_active FROM users WHERE username = ?',
      [username]
    );

    if (!user || !user.is_active) {
      return NextResponse.json({ success: false, message: 'Kredensial tidak valid atau akun dinonaktifkan' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Password salah' }, { status: 401 });
    }

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
    await logAudit('LOGIN', 'users', user.id, user.id);

    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: sessionData,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan sistem internal' }, { status: 500 });
  }
}
