import { query } from '../src/lib/db';

async function seed() {
  const sql = `
    INSERT INTO users (id, nip, nama_lengkap, username, email, password_hash, role, jabatan, unit_kerja, nomor_wa, is_active)
    VALUES 
    ('usr-magang-01', '202601MAGANG01', 'Anak Magang Surat Masuk', 'magang_masuk', 'magang.masuk@dispora.kalselprov.go.id', '$2a$10$MtjAgNgoZVUWlTFUPeFU0.BeY/mKBHQ3SggnrkqKZG48gWDJlUA/2', 'PETUGAS_ARSIP', 'Staff Magang Persuratan Masuk', 'Subbag Umum & Kepegawaian', '081200000001', 1),
    ('usr-magang-02', '202601MAGANG02', 'Anak Magang Surat Keluar', 'magang_keluar', 'magang.keluar@dispora.kalselprov.go.id', '$2a$10$MtjAgNgoZVUWlTFUPeFU0.BeY/mKBHQ3SggnrkqKZG48gWDJlUA/2', 'PETUGAS_ARSIP', 'Staff Magang Persuratan Keluar', 'Subbag Umum & Kepegawaian', '081200000002', 1)
    ON DUPLICATE KEY UPDATE nama_lengkap = VALUES(nama_lengkap), jabatan = VALUES(jabatan)
  `;
  await query(sql);
  const rows = await query('SELECT id, username, role, nama_lengkap, jabatan FROM users WHERE username LIKE "%magang%"');
  console.log('Seeded successfully:', rows);
}

seed().catch(console.error);
