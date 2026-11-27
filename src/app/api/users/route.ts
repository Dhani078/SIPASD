import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import type { DemoUser } from '@/types';

interface UserRow {
  nip: string;
  nama_lengkap: string;
  username: string;
  email: string;
  role: string;
  jabatan: string;
  unit_kerja: string;
}

const ROLE_LABELS: Record<string, string> = {
  developer: 'Developer',
  admin: 'Super Admin',
  pengarsip: 'Pengelola Arsip Digital',
  kadis: 'Kadispora',
  tu_umum: 'Petugas TU',
  subbag_keuangan: 'Kasubbag Keuangan',
  kabid_pora: 'Kabid Pora',
  magang_masuk: 'Magang Surat Masuk',
  magang_keluar: 'Magang Surat Keluar',
};

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  if (session.username !== 'admin' && session.username !== 'developer') {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }
  try {
    const rows = await query<UserRow>(
      'SELECT nip, nama_lengkap, username, email, role, jabatan, unit_kerja FROM users WHERE is_active = 1 ORDER BY created_at ASC'
    );
    const users: DemoUser[] = rows.map((u) => ({
      username: u.username,
      name: u.nama_lengkap,
      role: u.jabatan,
      label: ROLE_LABELS[u.username] || u.role,
      initials: u.nama_lengkap.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || u.username.slice(0, 2).toUpperCase(),
      nip: u.nip,
      email: u.email,
      unitKerja: u.unit_kerja,
    }));
    return NextResponse.json({ success: true, users });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memuat daftar pengguna';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
