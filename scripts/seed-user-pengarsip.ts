import { query } from '../src/lib/db';
import bcrypt from 'bcryptjs';

const rows = [
  {
    id: 'e4f2a8c0-9017-4f5d-b8e3-7d6c5a9f1234',
    nip: '199701012025212001',
    nama_lengkap: 'Rana Nur Syifa',
    username: 'pengarsip',
    email: 'rana@dispora.kalselprov.go.id',
    password: 'dispora2026',
    role: 'SUPER_ADMIN',
    jabatan: 'Analis Anggaran - Ahli Pertama',
    unit_kerja: 'Subbag Keuangan',
  },
  {
    id: 'd7c9b5e2-8f14-4a3c-9e76-2d5f8a1c4567',
    nip: '2310010406',
    nama_lengkap: 'Muhammad Rizki Ramadhani',
    username: 'developer',
    email: 'dhanisepeda@gmail.com',
    password: 'dev2026',
    role: 'SUPER_ADMIN',
    jabatan: 'Mahasiswa Magang TI UNISKA',
    unit_kerja: 'Sekretariat Dispora',
  },
];

async function main() {
for (const r of rows) {
  const hash = bcrypt.hashSync(r.password, 10);
  await query(
    `INSERT INTO users (id, nip, nama_lengkap, username, email, password_hash, role, jabatan, unit_kerja, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE
       nama_lengkap = VALUES(nama_lengkap),
       password_hash = VALUES(password_hash),
       role = VALUES(role),
       jabatan = VALUES(jabatan),
       unit_kerja = VALUES(unit_kerja),
       is_active = 1`,
    [r.id, r.nip, r.nama_lengkap, r.username, r.email, hash, r.role, r.jabatan, r.unit_kerja]
  );
  console.log(`OK: ${r.username} -> ${r.nama_lengkap} (${r.password})`);
}

const check = await query<any>(
  "SELECT username, nama_lengkap, role, is_active FROM users WHERE username IN ('pengarsip','developer')"
);
console.log('VERIFY:', JSON.stringify(check));
}

main().then(() => process.exit(0)).catch((e) => { console.error('FAIL:', e.message); process.exit(1); });